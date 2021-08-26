var moment = require('moment');
import { isEmpty, intersection, map, forEach} from "lodash";
import axios from "axios";

class dataProvider {
    cache = {};
    cacheSingles = {};
    constructor(){

    }

    // Old client mock data functions
    findBy(property, value){
        let result = this.cache.find(el => el[property] == value);
        return result;
    }
    getList (){
        return this.cache;
    }
    delete(id){
        let index = this.cache.findIndex(obj => obj.id === id);
        this.cache.splice(index, 1);
    }

    // New functions which connect with the API
    // Todo: Error handling
    getCurrentMomentISO(){
        return moment().toISOString(true);
    }

    deleteItem(id){
        return new Promise((resolve, reject) => {
            axios.get(this.baseUri + id + '/delete')
            .then((response) => {
                resolve(this.deleteCachedItem(id));
            });
        }).catch((error) => {
            console.log(error);
        });
    }

    deleteCachedItem(id){
        delete this.cacheSingles[id];
        for(let page in this.cache){
            let result = this.cache[page].find(el => el.id === id);
            if(result){
                this.cache[page].splice(this.cache[page].indexOf(result), 1);
                return true;
            }
        }
        return false;
    }

    getAllCachedItems(){
        let result = [];
        for(let page in this.cache){
            result = result.concat(this.cache[page]);
        }
        return result;
    }

    getCachedItem(id){
        if(this.cacheSingles[id]) return this.cacheSingles[id];
        for(let page in this.cache){
            let result = this.cache[page].find(el => el.id == id);
            if(result) return result;
        }
        return null;
    }

    async resetCache(){
        this.cache = {};
        await this.onResetCache();
    }

    //hook for childs
    async onResetCache(){

    }

    cachePage(page, items){
        if(isEmpty(items)) return;
        //If a single item is cached, set the reference of the item in the page to the single item cache
        forEach(
            intersection(map(items, i => String(i.id)), Object.keys(this.cacheSingles)),
            id => items = map(items, i => i.id == id ? this.cacheSingles[id] : i)
        );
        this.cache[page] = items;
        this.cache = Object.keys(this.cache).sort().reduce((r, k) => (r[k] = this.cache[k], r), {});
    }

    getCachedPage(page){
        if(isEmpty(this.cache)) return [];
        if(!this.cache[page]) return [];
        return this.cache[page];
    }

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
            console.log(error);
        });
    }

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
            console.log(error);
        });
    }

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
            console.log(error);
        });
    }

    async getSingleAxiosConfig(){
        return {};
    }

    cacheSingle(id, object){
        if(!object || !id) return;
        this.cacheSingles[id] = object;
    }

    async pageExists(page){
        return !isEmpty(await this.getPage(page, false));
    }
}

export default dataProvider;
