import DomainTable from "./DomainTable";
import VmDraw from "../viewModel/VmDraw"
import History from "../../commands/History";

export default class DomainDraw {

    tables: DomainTable[];

    constructor(tables: DomainTable[]) {
        this.tables = tables
    }

    static init(draw: VmDraw) {
        return new DomainDraw(
            draw.schemaTables.map(x => DomainTable.init(x)),
        );
    }

    getJson() {
        return JSON.stringify(this, null, 4);
    }

    static parse(content: string) {
        return DomainDraw.hydrate(JSON.parse(content) as DomainDraw);
    }

    static hydrate(jsonObject: DomainDraw) {
        return new DomainDraw(
            jsonObject.tables.map(x => DomainTable.hydrate(x))
        );
    }

    mapToVm(history: History, selectedDatabaseId: string) {
        const tables = this.tables.map(x => x.mapToVm());
        return new VmDraw(
            history,
            selectedDatabaseId,
            tables,
            tables.flatMap(x => x.getRelations(tables)),
            true
        );
    }
}