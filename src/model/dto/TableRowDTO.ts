import { TableRow } from "../TableRow";
import TableRowDataType from "../TableRowDataType";
import TableRowDataTypeDTO from "./TableRowDataTypeDTO";
import TableRowDataTypeArguments from "../TableRowDataTypeArguments";
import DataType from "../DataTypes/DataType";

export class TableRowDTO {
    name: string;
    datatype: TableRowDataTypeDTO;
    attributes: string[]

    constructor(name: string, datatype: TableRowDataTypeDTO, attributes: string[]) {
        this.name = name;
        this.datatype = datatype;
        this.attributes = attributes;
    }

    static hydrate(tableRow: TableRowDTO): TableRowDTO {
        return new TableRowDTO(
            tableRow.name,
            TableRowDataTypeDTO.hydrate(tableRow.datatype),
            tableRow.attributes
        );
    }

    mapToTableRow() {
        return new TableRow(this.name, this.datatype.mapToTableRowDatatype(), [...this.attributes])
    }
}