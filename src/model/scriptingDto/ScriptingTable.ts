import { Point } from "pixi.js";
import { TableDTO } from "../dto/TableDTO";
import { ScriptingTableRow } from "./ScriptingTableRow";

export class ScriptingTable {
    id: string;
    position: Point;
    head: string;
    tableRows: ScriptingTableRow[];

    constructor(id: string, position: Point, head: string, tableRows: ScriptingTableRow[]) {
        this.id = id;
        this.position = position;
        this.head = head;
        this.tableRows = tableRows;
    }

    static initFromTable(table: TableDTO) {
        return new ScriptingTable(table.id, table.position, table.head, table.tableRows.map(x => ScriptingTableRow.initTableRow(x)))
    }
}