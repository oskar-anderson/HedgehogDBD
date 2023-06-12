import { SchemaDTO } from "../dto/SchemaDTO";
import { ScriptingTable } from "./ScriptingTable";

export class ScriptingSchema {
    tables: ScriptingTable[];

    constructor(tables: ScriptingTable[]) {
        this.tables = tables;
    }

    static init(schema: SchemaDTO) {
        return new ScriptingSchema(
            schema.tables.map(x => ScriptingTable.initFromTable(x)),
        );
    }

    static initJsonDisplayable(schema: SchemaDTO) {
        return new ScriptingSchema(
            schema.tables.map(x => ScriptingTable.initFromTable(x)),
        );
    }
}