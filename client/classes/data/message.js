import dataObject from "./dataObject";
var moment = require('moment');

export default class Message extends dataObject{
    id;
    content;
    subject;
    receivedOn;
    read;
    types;
    sender;
    
    constructor(data){
        super();
        this.assign(data);
    }

    mapping(){
        return {
            'received_on': 'receivedOn'
        };
    }

    dates() {
        return ['receivedOn'];
    }
}
