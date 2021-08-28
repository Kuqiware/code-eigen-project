import DataProvider from "./dataProvider";
import Message from "../data/message";

var moment = require('moment');


class MessageProvider extends DataProvider{
    baseUri = '/api/messages/';
    model = Message;
    pageSize = 10;
    olderThan;


    constructor(){
        super();
    }

    getMessageWithContent(id){
        console.log('getcontent');
        return new Promise(async (resolve, reject) => {
            let item = await this.getItem(id);
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
