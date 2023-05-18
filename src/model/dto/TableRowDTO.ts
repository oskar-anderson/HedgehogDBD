import { TableRow } from "../TableRow";

export class TableRowDTO {
    name: string;
    datatype: string;
    attributes: string[]

    constructor(name: string, datatype: string, attributes: string[]) {
        this.name = name;
        this.datatype = datatype;
        this.attributes = attributes;
    }

    static hydrate(tableRow: TableRowDTO): TableRowDTO {
        return new TableRowDTO(tableRow.name, tableRow.datatype, tableRow.attributes);
    }

    mapToTableRow() {
        return new TableRow(this.name, this.datatype, [...this.attributes])
    }
}