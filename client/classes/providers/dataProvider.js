var moment = require('moment');
import { isEmpty } from "lodash";
import axios from "axios";

class dataProvider {
    cache = {};
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
        if(isEmpty(this.cache)) return [];
        let result = [];
        for(let page in this.cache){
            result = result.concat(this.cache[page]);
        }
        return result;
    }

    getCachedItem(id){
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

    async getSingle(id){
        return new Promise(async (resolve, reject) => {
            axios.get(this.baseUri + id, await this.getSingleAxiosConfig())
            .then((response) => {
                resolve(new this.model(response.data));
            });
        }).catch((error) => {
            console.log(error);
        });
    }

    async getSingleAxiosConfig(){
        return {};
    }

    async pageExists(page){
        return !isEmpty(await this.getPage(page, false));
    }
}

export default dataProvider;
