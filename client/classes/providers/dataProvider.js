var moment = require('moment');
import { isEmpty, intersection, map} from "lodash";
import axios from "axios";

class dataProvider {
    cache = {};
    cacheSingles = {};

    /**
     * @deprecated Old client mock data function
     */
    findBy(property, value){
        let result = this.cache.find(el => el[property] == value);
        return result;
    }

    /**
     * @deprecated Old client mock data function
     */
    getList (){
        return this.cache;
    }

    /**
     * @deprecated Old client mock data function
     */
    delete(id){
        let index = this.cache.findIndex(obj => obj.id === id);
        this.cache.splice(index, 1);
    }

    /**
     * Gets the current date time in ISO format.
     *
     * @return {String} Date time string in ISO format.
     */
    getCurrentMomentISO(){
        return moment().toISOString(true);
    }

    /**
     * Deletes an item on the API, and in cache.
     *
     * @param {int} id The ID of the item being deleted.
     *
     * @return {Promise} Promise which resolves into a boolean. True if the item was deleted, False if the item was not found.
     */
    deleteItem(id){
        return new Promise((resolve, reject) => {
            axios.get(this.baseUri + id + '/delete')
            .then((response) => {
                this.deleteCachedItem(id);
                resolve(true);
            });
        }).catch((error) => {
            console.warn(error);
        });
    }

    /**
     * Deletes an item from te cache by ID.
     *
     * @param {int} id The ID of the item being deleted.
     *
     * @return {bool} True if an item was deleted, false if no item was found.
     */
    deleteCachedItem(id){
        let result = false;
        if(this.cacheSingles[id]){
            result = true;
            delete this.cacheSingles[id];
        }

        for(let page in this.cache){
            let result = this.cache[page].find(el => el.id === id);
            if(result){
                this.cache[page].splice(this.cache[page].indexOf(result), 1);
                result = true;
                break;
            }
        }
        return result;
    }

    /**
     * Returns an Array containing all cached items.
     *
     * @return {Array} Array containing items.
     */
    getAllCachedItems(){
        let result = [];
        for(let page in this.cache){
            result = result.concat(this.cache[page]);
        }
        return result;
    }

    /**
     * Get an item from the cache by ID.
     *
     * @param {int} id The ID of the requested item.
     *
     * @return {Object} Returns the cached item, or null if not found.
     */
    getCachedItem(id){
        if(this.cacheSingles[id]) return this.cacheSingles[id];
        for(let page in this.cache){
            let result = this.cache[page].find(el => el.id == id);
            if(result) return result;
        }
        return null;
    }

    /**
     * Clears the cache of all items.
     */
    async resetCache(){
        this.cache = {};
        this.cacheSingles = {};
        await this.onResetCache();
    }

    /**
     * Hook for derived classes. Called after reseting the cache.
     */
    async onResetCache(){

    }

    /**
     * Caches a single page of items.
     * @param  {int} page The page number.
     * @param  {Array} items Array of items.
     */
    cachePage(page, items){
        if(isEmpty(items)) return;
        items = this.preparePage(items);
        this.cache[page] = items;
        this.sortPageCache();
    }

    /**
     * Prepares an array of items to be cached as a page.
     *
     * If an item in items is already cached, the reference in the array of items needs to be set to the cached item.
     *
     * @param  {Array} items The array of items to be prepared for caching.
     *
     * @return {Array} Returns the array of items after preparing it for caching.
     */
    preparePage(items){
        let existingSingles = intersection(map(items, i => String(i.id)), Object.keys(this.cacheSingles));
        return map(items, i => existingSingles.includes(String(i.id)) ? this.cacheSingles[i.id] : i);
    }

    /**
     * Sorts all pages in the cache by page number
     */
    sortPageCache(){
        this.cache = Object.keys(this.cache).sort().reduce((r, k) => (r[k] = this.cache[k], r), {});
    }

    /**
     * Retrieves an already cached page.
     *
     * @param  {int} page The page number.
     *
     * @return {Array} Returns an array of items.
     */
    getCachedPage(page){
        if(isEmpty(this.cache)) return [];
        if(!this.cache[page]) return [];
        return this.cache[page];
    }

    /**
     * Retrieves a page from the API. If the page is already cached, this function will return the page from the cache.
     * By default, the retrieved page will be cached.
     *
     * @param  {int} page The page number.
     * @param  {boolean} [doCache=true] If the page should be cached or not.
     *
     * @return {Promise} Returns a Promise which resolves an array of items or null.
     */
    getPage(page, doCache = true){
        return new Promise(async (resolve, reject) => {
            let cachedPage = this.getCachedPage(page);
            if(!isEmpty(cachedPage)) return resolve(cachedPage);

            axios.get(this.baseUri +'page/' + page, await this.getPageAxiosConfig())
            .then((response) => {
                if(isEmpty(response.data)) return resolve(null);
                let objects = response.data.map(el => new this.model(el));
                if(!doCache) return resolve(objects);
                this.cachePage(page, objects);
                resolve(this.getCachedPage(page));
            });
        }).catch((error) => {
            console.warn(error);
        });
    }

    /**
     * Derived classes can implement this function to add additional axios parameters when retrieving a page from the API.
     *
     * @return {Object} Returns an object containing axios configuration.
     */
    async getPageAxiosConfig(){
        return {};
    }

    getAll(doCache = true){
        return new Promise(async (resolve, reject) => {
            let cachedPage = this.getCachedPage(0);
            if(!isEmpty(cachedPage)) return resolve(cachedPage);

            axios.get(this.baseUri +'all', await this.getAllAxiosConfig())
            .then((response) => {
                if(isEmpty(response.data)) return resolve(null);
                let objects = response.data.map(el => new this.model(el));
                if(!doCache) return resolve(objects);
                this.cachePage(0, objects);
                resolve(this.getCachedPage(0));
            });
        }).catch((error) => {
            console.warn(error);
        });
    }

    /**
     * Derived classes can implement this function to add additional axios parameters when retrieving all items from the API.
     *
     * @return {Object} Returns an object containing axios configuration.
     */
    async getAllAxiosConfig(){
        return {};
    }

    async getSingle(id, doCache = true){
        return new Promise(async (resolve, reject) => {
            let cachedItem = this.getCachedItem(id);
            if(cachedItem) return resolve(cachedItem);

            axios.get(this.baseUri + id, await this.getSingleAxiosConfig())
            .then((response) => {
                if(isEmpty(response.data)) return resolve(null);
                let object = new this.model(response.data);
                if(!doCache) return resolve(object);
                this.cacheSingle(id, object);
                resolve(this.getCachedItem(id));
            });
        }).catch((error) => {
            console.warn(error);
        });
    }

    /**
     * Derived classes can implement this function to add additional axios parameters when retrieving a single item from the API.
     *
     * @return {Object} Returns an object containing axios configuration.
     */
    async getSingleAxiosConfig(){
        return {};
    }

    /**
     * Caches a single item.
     *
     * @param {int} id ID of the object being cached.
     * @param {Object} object The object being cached.
     */
    cacheSingle(id, object){
        if(!object || !id) return;
        this.cacheSingles[id] = object;
    }

    /**
     * Checks if a page exists on the API.
     *
     * @param {int} page The number of the page.
     *
     * @return {boolean} True if page exists, false if it does not.
     */
    async pageExists(page){
        return !isEmpty(await this.getPage(page, false));
    }
}

export default dataProvider;
