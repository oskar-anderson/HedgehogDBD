import Point from "../../Point";
import DomainDraw from "../../domain/DomainDraw";
import DomainTable from "../../domain/DomainTable";
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

    static initFromTable(table: DomainTable, domainDraw: DomainDraw) {
        return new ScriptingTable(
            table.id, 
            table.position, 
            table.head, 
            table.tableRows.map(x => ScriptingTableRow.initTableRow(x, domainDraw)))
    }
}