import { TableRow } from "../TableRow";
import TableRowDataType from "../TableRowDataType";
import TableRowDataTypeDTO from "./TableRowDataTypeDTO";

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
        return new TableRowDTO(tableRow.name, TableRowDataTypeDTO.hydrate(tableRow.datatype), tableRow.attributes);
    }

    mapToTableRow() {
        const tableRowDataType = new TableRowDataType(this.datatype.name, [...this.datatype.arguments], this.datatype.isNullable);
        return new TableRow(this.name, tableRowDataType, [...this.attributes])
    }
}