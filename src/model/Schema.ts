import { Relation } from "./Relation";
import { Table } from "./Table";
import { DrawChar } from "./DrawChar";

export class Schema {

    worldDrawArea: DrawChar[] = [];
    tables: Table[];
    relations: Relation[];
    constructor(tables: Table[], relations: Relation[]) {
        this.tables = tables;
        this.relations = relations;
    }
}