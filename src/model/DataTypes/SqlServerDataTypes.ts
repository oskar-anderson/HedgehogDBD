import { DataTypeBoolean, DataTypeDateTimeOffset, DataTypeDecimal, DataTypeFloat, DataTypeDouble, DataTypeGuid, DataTypeInt16, DataTypeInt32, DataTypeInt64, DataTypeString, IDataTypeArgument } from "./DataType";
import IDatabaseType from "./IDatabaseType";

export default class SqlServerDataTypes implements IDatabaseType {

    getBooleanText() {
        return `bit`
    }

    getDateTimeOffsetText() {
        return `datetimeoffset`
    }

    getFloat128Text() {
        return `decimal`
    }

    getFloat64Text() {
        return `float`
    }

    getFloat32Text() {
        return `real`
    }

    getGuidText() {
        return `uniqueidentifier`
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
