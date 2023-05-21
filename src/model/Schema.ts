import { Relation } from "./Relation";
import { Table } from "./Table";

export class Schema {

    // worldDrawArea: DrawChar[] = [];
    tables: Table[];
    constructor(tables: Table[]) {
        this.tables = tables;
        this.tables.forEach(x => x.updateRelations(tables.filter(x => ! x.getIsHover())))
    }
}