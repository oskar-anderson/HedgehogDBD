import { Relation } from "./Relation";
import { Table } from "./Table";

export class Schema {

    tables: Table[];
    relations: Relation[];
    constructor(tables: Table[], relations: Relation[]) {
        this.tables = tables;
        this.relations = relations;
    }
}