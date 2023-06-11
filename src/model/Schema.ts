import { Draw } from "./Draw";
import { TableDTO } from "./dto/TableDTO";
import { Table } from "./Table";

export class Schema {

    public tables: Table[];
    
    constructor(tables: Table[], schemaUpdateTables: (tables: TableDTO[]) => void) {
        this.tables = tables;
        this.tables.forEach(x => x.updateRelations(tables.filter(x => ! x.getIsHover())))
        schemaUpdateTables(Schema.mapTablesToDtoTables(this.tables));
    }

    getTables(): Table[] {
        return this.tables;
    }

    static mapTablesToDtoTables(tables: Table[]) {
        return tables.filter(x => ! x.getIsHover()).map(x => TableDTO.initFromTable(x))
    }
}