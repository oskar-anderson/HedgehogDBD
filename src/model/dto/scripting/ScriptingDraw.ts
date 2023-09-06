import DomainDraw from "../../domain/DomainDraw";
import { ScriptingTable } from "./ScriptingTable";

export default class ScriptingDraw {
    tables: ScriptingTable[];

    constructor(tables: ScriptingTable[]) {
        this.tables = tables;
    }

    static init(domainDraw: DomainDraw) {
        return new ScriptingDraw(
            domainDraw.tables.map(x => ScriptingTable.initFromTable(x, domainDraw)),
        );
    }

    static initJsonDisplayable(domainDraw: DomainDraw) {
        return new ScriptingDraw(
            domainDraw.tables.map(x => ScriptingTable.initFromTable(x, domainDraw)),
        );
    }
}