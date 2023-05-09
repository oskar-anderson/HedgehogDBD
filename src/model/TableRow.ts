export class TableRow {
    name: string;
    datatype: string;
    attributes: string[]

    constructor(name: string, datatype: string, attributes: string[]) {
        this.name = name;
        this.datatype = datatype;
        this.attributes = attributes;
    }

    static initClone(tableRow: TableRow): TableRow {
        let copy = new TableRow(tableRow.name, tableRow.datatype, tableRow.attributes);
        return copy;
    }
}