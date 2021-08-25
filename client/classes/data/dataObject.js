var moment = require('moment');
import { assignWith, isUndefined, isEmpty } from "lodash";

class dataObject {
    assign(source){
        if(source === null || source === undefined) return this;
        if (typeof source !== 'object') return this;
        this.mapToSource(source);
        this.convertDates(source);

        assignWith(this, source, (objValue, srcValue, key) => {
            let value = isUndefined(srcValue) ? null : srcValue;
            return value;
        });
    }
    mapping(){
        return {};
    }
    dates() {
        return [];
    }
    convertDates(source){
        let dateMap = this.dates();
        if(isEmpty(dateMap)) return;
        for (const [key, value] of Object.entries(source)) {
            if(dateMap.includes(key)) source[key] = moment(value);
        }
    }
    mapToSource(source){
        let map = this.mapping();
        if(isEmpty(map)) return;
        for (const [key, value] of Object.entries(source)) {
            if(map[key]){
                source[map[key]] = value;
                delete source[key];
            }
        }
    }
}

export default dataObject;
