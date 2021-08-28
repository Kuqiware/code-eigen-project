var moment = require('moment');
import { isEmpty, intersection, map} from "lodash";
import axios from "axios";
import DataStore from "../stores/dataStore";

class DataProvider {
    dataStore;
    pageSize = 10;

    constructor(){
        this.dataStore = this.initDataStore();
    }

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
     * Derived classes can override this function to use a custom DataStore.
     *
     * @virtual
     * @return {DataStore} Returns an instance of a DataStore.
     */
    initDataStore(){
        return new DataStore({
            key: 'id'
        });
    }

    /**
     * Derived classes can implement this function to add additional axios parameters when retrieving a page from the API.
     *
     * @virtual
     * @return {Object} Returns an object containing axios configuration.
     */
    async getPageAxiosConfig(){
        return {};
    }

    /**
     * Derived classes can implement this function to add additional axios parameters when retrieving all items from the API.
     *
     * @virtual
     * @return {Object} Returns an object containing axios configuration.
     */
    async getAllAxiosConfig(){
        return {};
    }

    /**
     * Derived classes can implement this function to add additional axios parameters when retrieving a single item from the API.
     *
     * @virtual
     * @return {Object} Returns an object containing axios configuration.
     */
    async getSingleAxiosConfig(){
        return {};
    }

    /**
     * Deletes an item on the API, and in cache.
     *
     * @param {String|int} keyValue The key value of the item being deleted.
     *
     * @return {Promise} Promise which resolves into a boolean. True if the item was deleted, False if the item was not found.
     */
    deleteItem(keyValue){
        return new Promise((resolve, reject) => {
            axios.get(this.baseUri + keyValue + '/delete')
            .then((response) => {
                this.dataStore.deleteCachedItem(keyValue);
                resolve(true);
            })
            .catch((error) => {
                console.warn(error);
                resolve(false);
            });
        }).catch((error) => {
            console.warn(error);
        });
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
            let cachedPage = this.dataStore.getCachedPage(page, this.pageSize);
            if(!isEmpty(cachedPage)) return resolve(cachedPage);

            axios.get(this.baseUri +'page/' + page, await this.getPageAxiosConfig())
            .then((response) => {
                if(isEmpty(response.data)) return resolve(null);
                let objects = response.data.map(el => new this.model(el));
                if(!doCache) return resolve(objects);
                this.dataStore.cachePage(objects);
                resolve(this.dataStore.getCachedPage(page, this.pageSize));
            })
            .catch((error) => {
                console.warn(error);
                resolve(null);
            });
        }).catch((error) => {
            console.warn(error);
        });
    }

    /**
     * Retrieves all items from the API. If any items are cached, the cache will be returned.
     * By default, the retrieved items will be cached.
     *
     * @param {String|int} keyValue The key value of the item being deleted.
     * @param  {boolean} [doCache=true] If the items should be cached or not.
     *
     * @return {Promise} Promise which resolves an Array of items or null if none are found.
     */
    getAll(doCache = true){
        return new Promise(async (resolve, reject) => {
            let cache = this.dataStore.getAllCachedItems();
            if(!isEmpty(cache)) return resolve(cache);

            axios.get(this.baseUri +'all', await this.getAllAxiosConfig())
            .then((response) => {
                if(isEmpty(response.data)) return resolve(null);
                let objects = response.data.map(el => new this.model(el));
                if(!doCache) return resolve(objects);
                this.dataStore.cachePage(objects);
                resolve(this.dataStore.getAllCachedItems());
            });
        }).catch((error) => {
            console.warn(error);
        });
    }

    /**
     * Retrieves a single item from the API. If the item is already cached, this function will return the item from the cache.
     * By default, the retrieved item will be cached.
     *
     * @param {String|int} keyValue The key value of the item being deleted.
     * @param  {boolean} [doCache=true] If the item should be cached or not.
     *
     * @return {Promise} Promise which resolves a single item or null if not found.
     */
    getItem(keyValue, doCache = true){
        return new Promise(async (resolve, reject) => {
            let cachedItem = this.dataStore.getCachedItem(keyValue);
            if(cachedItem) return resolve(cachedItem);

            axios.get(this.baseUri + keyValue, await this.getSingleAxiosConfig())
            .then((response) => {
                if(isEmpty(response.data)) return resolve(null);
                let object = new this.model(response.data);
                if(!doCache) return resolve(object);
                this.dataStore.cacheItem(object);
                resolve(this.dataStore.getCachedItem(keyValue));
            })
            .catch((error) => {
                console.warn(error);
                resolve(null);
            });
        }).catch((error) => {
            console.warn(error);
        });
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

export default DataProvider;
