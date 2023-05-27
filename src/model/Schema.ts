import { TableDTO } from "./dto/TableDTO";
import { Relation } from "./Relation";
import { Table } from "./Table";

export class Schema {

    // worldDrawArea: DrawChar[] = [];
    private tables: Table[];
    private onTablesChangeCallback: (tables: TableDTO[]) => void;
    constructor(tables: Table[], onTablesChangeCallback: (tables: TableDTO[]) => void) {
        this.tables = tables;
        this.tables.forEach(x => x.updateRelations(tables.filter(x => ! x.getIsHover())))
        this.onTablesChangeCallback = onTablesChangeCallback;
        this.onTablesChangeCallback(this.mapTablesToDtoTables());
    }

    getTables(): Table[] {
        return this.tables;
    }

    popAndUpdate() {
        let result = this.tables.pop();
        this.onTablesChangeCallback(this.mapTablesToDtoTables());
        this.getTables().forEach(x => x.updateRelations(this.getTables()));
        return result;
    }

    pushAndUpdate(table: Table) {
        this.tables.push(table);
        this.onTablesChangeCallback(this.mapTablesToDtoTables());
        this.getTables().forEach(x => x.updateRelations(this.getTables()));
    }

    removeAtAndUpdate(index: number) {
        let removedEl = this.tables.splice(index, 1);
        this.onTablesChangeCallback(this.mapTablesToDtoTables());
        this.getTables().forEach(x => x.updateRelations(this.getTables()));
        return removedEl;
    }

    insertAtAndUpdate(index: number, element: Table) {
        this.tables.splice(index, 0, element);
        this.onTablesChangeCallback(this.mapTablesToDtoTables());
        this.getTables().forEach(x => x.updateRelations(this.getTables()));
    }

    setAndUpdate(index: number, table: Table) {
        this.tables[index] = table;
        this.onTablesChangeCallback(this.mapTablesToDtoTables());
        this.getTables().forEach(x => x.updateRelations(this.getTables()));
    }

    setTablesAndUpdate(tables: Table[]) {
        this.tables = tables;
        this.onTablesChangeCallback(this.mapTablesToDtoTables());
    }

    private mapTablesToDtoTables() {
        return this.tables.filter(x => ! x.getIsHover()).map(x => TableDTO.initFromTable(x))
    }
}