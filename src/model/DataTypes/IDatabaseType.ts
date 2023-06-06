import { DataTypeBoolean, DataTypeDateTimeOffset, DataTypeFloat128, DataTypeFloat32, DataTypeFloat64, DataTypeGuid, DataTypeInt16, DataTypeInt32, DataTypeInt64, DataTypeString, IDataTypeArgument } from "./DataType"

export default interface IDatabaseType {
    getBooleanText(args: { value: number, name: IDataTypeArgument }[]): string

    getDateTimeOffsetText(args: { value: number, name: IDataTypeArgument }[]): string

    getFloat128Text(args: { value: number, name: IDataTypeArgument }[]): string

    getFloat64Text(args: { value: number, name: IDataTypeArgument }[]): string

    getFloat32Text(args: { value: number, name: IDataTypeArgument }[]): string

    getGuidText(args: { value: number, name: IDataTypeArgument }[]): string

    getInt16Text(args: { value: number, name: IDataTypeArgument }[]): string

    getInt32Text(args: { value: number, name: IDataTypeArgument }[]): string

    getInt64Text(args: { value: number, name: IDataTypeArgument }[]): string

    getStringText(args: { value: number, name: IDataTypeArgument }[]): string
}