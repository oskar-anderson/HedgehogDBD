import { TableRow } from "../TableRow";
import TableRowDataType from "../TableRowDataType";
import TableRowDataTypeDTO from "./TableRowDataTypeDTO";
import TableRowDataTypeArguments from "../TableRowDataTypeArguments";

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
        const tableRowArguments = this.datatype.arguments
            .map(x => x.mapToTableRow())
            .filter(x => x !== null) as TableRowDataTypeArguments[]
        const tableRowDataType = new TableRowDataType(this.datatype.name, tableRowArguments, this.datatype.isNullable);
        return new TableRow(this.name, tableRowDataType, [...this.attributes])
    }
}