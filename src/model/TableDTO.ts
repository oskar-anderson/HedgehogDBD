import { TableRow } from "./TableRow";


export class TableDTO {
    head: string;
    tableRows: TableRow[];

    constructor(table: { head: string, tableRows: TableRow[] }) {
        this.head = table.head;
        this.tableRows = table.tableRows;
    }
}