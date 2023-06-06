import DataType from "../DataTypes/DataType"
import TableRowDataTypeArgumentsDTO from "./TableRowDataTypeArgumentsDTO";

export default class TableRowDataTypeDTO {

    name: DataType;
    arguments: TableRowDataTypeArgumentsDTO[];
    isNullable: boolean;

    constructor(
        name: DataType,
        _arguments: TableRowDataTypeArgumentsDTO[],
        nullable: boolean
    ) {
        this.name = name;
        this.arguments = _arguments;
        this.isNullable = nullable;
    }

    static hydrate(tableRowAttribute: TableRowDataTypeDTO): TableRowDataTypeDTO {
        return new TableRowDataTypeDTO(tableRowAttribute.name, tableRowAttribute.arguments, tableRowAttribute.isNullable);
    }
}