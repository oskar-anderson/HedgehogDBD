import { DataTypeBoolean, DataTypeDateTimeOffset, DataTypeDecimal, DataTypeFloat, DataTypeDouble, DataTypeGuid, DataTypeInt16, DataTypeInt32, DataTypeInt64, DataTypeString, IDataTypeArgument } from "./DataType"

export default interface IDatabaseType {
    getBooleanText(): string
    getDateTimeOffsetText(): string
    getFloat128Text(): string
    getFloat64Text(): string
    getFloat32Text(): string
    getGuidText(): string
    getInt16Text(): string
    getInt32Text(): string
    getInt64Text(): string
    getStringText(): string
}