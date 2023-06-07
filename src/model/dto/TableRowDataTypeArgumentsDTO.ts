import { IDataTypeArgument } from "../DataTypes/DataType";
import TableRowDataTypeArguments from "../TableRowDataTypeArguments";

export default class TableRowDataTypeArgumentsDTO {
    value: number;
    argument: IDataTypeArgument;

    constructor(value: number, argument: IDataTypeArgument) {
        this.value = value;
        this.argument = argument;
    }

    mapToTableRow(): TableRowDataTypeArguments | null {
        return new TableRowDataTypeArguments(this.value, this.argument);
    }
}