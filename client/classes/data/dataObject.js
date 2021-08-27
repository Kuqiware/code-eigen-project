
import DataMapper from "./dataMapper";
import { assignWith, isUndefined } from "lodash";

class DataObject {

    /**
     * Assigns an object containing data to this.
     */
    assign(source){
        if(source === null || source === undefined) return this;
        if (typeof source !== 'object') return this;
        DataMapper.mapToSource(source, this.mapping());
        DataMapper.convertDates(source, this.dates());

        assignWith(this, source, (objValue, srcValue, key) => {
            return isUndefined(srcValue) ? null : srcValue;
        });
    }

    /**
     * Derived classes can implement this method to define how properties need to be mapped from a source object into itself.
     *
     * @return {Object} Object containing the mapping, where key is the source property name and where value is the desired property name.
     */
    mapping(){
        return {};
    }

    /**
     * Derived classes can implement this method to define which properties need to be converted into moment objects.
     *
     * @return {Array} Array containing names of date time properties.
     */
    dates() {
        return [];
    }
}

export default DataObject;
