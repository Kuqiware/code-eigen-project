var moment = require('moment');
import { isEmpty } from "lodash";

class DataMapper {

    /**
     * Converts properties of the source object into moment objects, if the property is defined in dateProperties.
     *
     * @param {Object} source Object which needs to be altered based on dataProperties.
     * @param {Array} dateProperties Array containing the names of properties which need to be converted into moment objects.
     */
    static convertDates(source, dateProperties){
        if(isEmpty(dateProperties)) return;
        for (const [key, value] of Object.entries(source)) {
            if(!value) continue;
            if(dateProperties.includes(key)) source[key] = moment(value);
        }
    }

    /**
     * Alters the source object, using a mapping to change property names into desired property names.
     *
     * @param {Object} source Object which needs to be altered based on mapping.
     * @param {Object} mapping Object containing the mapping, where key is the source property name and where value is the desired property name.
     */
    static mapToSource(source, mapping){
        if(isEmpty(mapping)) return;
        for (const [key, value] of Object.entries(source)) {
            if(mapping[key]){
                source[mapping[key]] = value;
                delete source[key];
            }
        }
    }
}

export default DataMapper;
