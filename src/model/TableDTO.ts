import { Point } from "pixi.js";
import { Table } from "./Table";
import { TableRow } from "./TableRow";


export class TableDTO {
    id: string;
    position: Point;
    head: string;
    tableRows: TableRow[];

    constructor(id: string, position: Point, head: string, tableRows: TableRow[]) {
        this.id = id;
        this.position = position;
        this.head = head;
        this.tableRows = tableRows;
    }

    static initFromTable(table: Table) {
        return new TableDTO(table.id, table.position.clone(), table.head, table.tableRows.map(x => new TableRow(x.name, x.datatype, [...x.attributes])))
    }
}