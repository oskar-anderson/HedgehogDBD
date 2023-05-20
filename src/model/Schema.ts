import { Relation } from "./Relation";
import { Table } from "./Table";
import { DrawChar } from "./DrawChar";

export class Schema {

    // worldDrawArea: DrawChar[] = [];
    tables: Table[];
    constructor(tables: Table[]) {
        this.tables = tables;
    }
}