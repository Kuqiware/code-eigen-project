import dataProvider from "./dataProvider";
import Message from "../data/message";

var moment = require('moment');


class MessageProvider extends dataProvider{
    baseUri = '/api/messages/';
    olderThan;
    model = Message;

    constructor(){
        super();
    }

    getMessageWithContent(id){
        return new Promise(async (resolve, reject) => {
            let item = this.getCachedItem(id);
            if(!item) return resolve(await this.getSingle(id));
            if(item && item.content) return resolve(item);

            axios.get(this.baseUri + id + '/content')
            .then((response) => {
                item.content = response.data;
                resolve(item);
            });
        }).catch((error) => {
            console.log(error);
        });
    }

    getPageAxiosConfig(){
        this.olderThan ??= this.getCurrentMomentISO();
        return {
            params:{
                olderThan: this.olderThan
            }
        };
    }
}

export default new MessageProvider();
