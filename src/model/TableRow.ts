import TableRowDataType from "./TableRowDataType";

export class TableRow {
    readonly name: string;
    readonly datatype: TableRowDataType;
    attributes: string[]

    constructor(name: string, datatype: TableRowDataType, attributes: string[]) {
        this.name = name;
        this.datatype = datatype;
        this.attributes = attributes;
    }
}