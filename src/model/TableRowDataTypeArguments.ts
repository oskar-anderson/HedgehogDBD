import { IDataTypeArgument } from "./DataTypes/DataType";


export default class TableRowDataTypeArguments {
    value: number;
    argument: IDataTypeArgument;

    constructor(value: number, argument: IDataTypeArgument) {
        this.value = value;
        this.argument = argument;
    }
}