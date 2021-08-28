var moment = require('moment');
import { isEmpty, intersection, map, chunk} from "lodash";

class DataStore {
    cache = [];

    constructor(config){
        this.key = config.key ? config.key : 'id';
    }

    /**
     * Deletes an item from te cache by key.
     *
     * @param {int} keyValue The key value of the item to be deleted.
     */
    deleteCachedItem(keyValue){
        this.cache = this.cache.filter(i => i[this.key] != keyValue);
    }

    /**
     * Returns an Array containing all cached items.
     *
     * @return {Array} Array containing items.
     */
    getAllCachedItems(){
        return this.cache;
    }

    /**
     * Get an item from the cache by key.
     *
     * @param {String|int} keyValue The key value of the requested item.
     *
     * @return {Object|null} Returns the cached item, or null if not found.
     */
    getCachedItem(keyValue){
        let result = this.cache.find(i => i[this.key] == keyValue);
        return result ? result : null;
    }

    /**
     * Clears the cache of all items.
     */
    async resetCache(){
        this.cache = [];
        await this.onResetCache();
    }

    /**
     * Hook for derived classes. Called after reseting the cache.
     *
     * @virtual
     */
    async onResetCache(){

    }

    /**
     * Caches a single page of items.
     * @param  {int} page The page number.
     * @param  {Array} items Array of items.
     *
     * @return {boolean} Returns True if caching was succesfull, false if not.
     */
    cachePage(items){
        if(isEmpty(items)) return false;
        this.deleteDuplicates(items);
        this.cache = this.cache.concat(items);
        return true;
    }

    /**
     * Remove duplicate entries from the cache, based on the items given as property.
     *
     * @param  {Array} items The array of items to compare the cache with.
     */
    deleteDuplicates(items){
        let alreadyCachedKeys = intersection(map(items, i => i[this.key]), map(this.cache, i => i[this.key]));
        this.cache = this.cache.filter(i => !alreadyCachedKeys.includes(i[this.key]));
    }

    /**
     * Retrieves a page of items from the cache
     *
     * @param  {int} page The page number.
     * @param  {int} pageSize The size of the page.
     *
     * @return {Array} Returns an array of items.
     */
    getCachedPage(page, pageSize){
        return chunk(this.cache, pageSize)[page];
    }

    /**
     * Caches a single item.
     *
     * @param {int} id ID of the object being cached.
     * @param {Object} object The object to be cached.
     *
     * @return {boolean} Returns True if caching was succesfull, false if not.
     */
    cacheItem(object){
        if(!object) return false;
        this.cache.push(object);
        return true;
    }
}

export default DataStore;
