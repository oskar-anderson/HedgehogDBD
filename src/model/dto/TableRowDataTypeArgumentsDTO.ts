import DataType, { IDataTypeArgument } from "../DataTypes/DataType";
import TableRowDataTypeArguments from "../TableRowDataTypeArguments";

export default class TableRowDataTypeArgumentsDTO {
    value: number;
    id: string;

    constructor(value: number, id: string) {
        this.value = value;
        this.id = id;
    }

    static hydrate(tableRowDataTypeArguments: TableRowDataTypeArgumentsDTO): TableRowDataTypeArgumentsDTO {
        return new TableRowDataTypeArgumentsDTO(
            tableRowDataTypeArguments.value,
            tableRowDataTypeArguments.id,
        );
    }

    mapToTableRow(): TableRowDataTypeArguments | null {
        return new TableRowDataTypeArguments(this.value, DataType.getArgumentById(this.id));
    }
}