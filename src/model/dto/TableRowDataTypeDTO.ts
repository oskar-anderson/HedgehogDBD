import DataType from "../DataTypes/DataType"
import { IDataType } from "../DataTypes/IDataType";
import TableRowDataType from "../TableRowDataType";
import TableRowDataTypeArguments from "../TableRowDataTypeArguments";
import TableRowDataTypeArgumentsDTO from "./TableRowDataTypeArgumentsDTO";

export default class TableRowDataTypeDTO {

    id: string;
    arguments: TableRowDataTypeArgumentsDTO[];
    isNullable: boolean;

    constructor(
        id: string,
        _arguments: TableRowDataTypeArgumentsDTO[],
        nullable: boolean
    ) {
        this.id = id;
        this.arguments = _arguments;
        this.isNullable = nullable;
    }

    static hydrate(tableRowAttribute: TableRowDataTypeDTO): TableRowDataTypeDTO {
        return new TableRowDataTypeDTO(
            tableRowAttribute.id,
            tableRowAttribute.arguments.map(x => TableRowDataTypeArgumentsDTO.hydrate(x)),
            tableRowAttribute.isNullable
        );
    }

    mapToTableRowDatatype() {
        const tableRowArguments = this.arguments
            .map(x => x.mapToTableRow())
            .filter(x => x !== null) as TableRowDataTypeArguments[]
        return new TableRowDataType(DataType.getTypeById(this.id), tableRowArguments, this.isNullable);
    }
}