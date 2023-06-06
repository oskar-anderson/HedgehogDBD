import { DataTypeBoolean, DataTypeDateTimeOffset, DataTypeFloat128, DataTypeFloat32, DataTypeFloat64, DataTypeGuid, DataTypeInt16, DataTypeInt32, DataTypeInt64, DataTypeString, IDataTypeArgument } from "./DataType";
import IDatabaseType from "./IDatabaseType";

export default class SqlServerDataTypes implements IDatabaseType {

    getBooleanText(args: { value: number, name: IDataTypeArgument }[]) {
        return `bit`
    }

    getDateTimeOffsetText(args: { value: number, name: IDataTypeArgument }[]) {
        return `datetimeoffset`
    }

    getFloat128Text(args: { value: number, name: IDataTypeArgument }[]) {
        return `decimal`
    }

    getFloat64Text(args: { value: number, name: IDataTypeArgument }[]) {
        return `float`
    }

    getFloat32Text(args: { value: number, name: IDataTypeArgument }[]) {
        return `real`
    }

    getGuidText(args: { value: number, name: IDataTypeArgument }[]) {
        return `uniqueidentifier`
    }

    getInt16Text(args: { value: number, name: IDataTypeArgument }[]) {
        return `smallint`
    }

    getInt32Text(args: { value: number, name: IDataTypeArgument }[]) {
        return `int`
    }

    getInt64Text(args: { value: number, name: IDataTypeArgument }[]) {
        return `bigint`
    }

    getStringText(args: { value: number, name: IDataTypeArgument }[]) {
        const varcharLenght = args.find(x => x.name.id === DataTypeString.varcharLenght.id);
        if (varcharLenght === undefined) return "varchar";
        return `varchar(${varcharLenght.value})`
    }    
}
