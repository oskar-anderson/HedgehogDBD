import { DataTypeBoolean, DataTypeDateTimeOffset, DataTypeFloat128, DataTypeFloat32, DataTypeFloat64, DataTypeGuid, DataTypeInt16, DataTypeInt32, DataTypeInt64, DataTypeString, IDataTypeArgument } from "./DataType";
import IDatabaseType from "./IDatabaseType";

export default class MySqlDataTypes implements IDatabaseType {

    getBooleanText() {
        return `boolean`
    }

    getDateTimeOffsetText() {
        return `datetime`
    }

    getFloat128Text() {
        return `decimal`
    }

    getFloat64Text() {
        return `double`
    }

    getFloat32Text() {
        return `float`
    }

    getGuidText() {
        return `char`
    }

    getInt16Text() {
        return `smallint`
    }

    getInt32Text() {
        return `int`
    }

    getInt64Text() {
        return `bigint`
    }

    getStringText() {
        return `varchar`
    }    
}
