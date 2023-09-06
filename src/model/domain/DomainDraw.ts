import DomainTable from "./DomainTable";
import VmDraw from "../viewModel/VmDraw"
import History from "../../commands/History";
import Databases from "../DataTypes/Databases";

export default class DomainDraw {

    tables: DomainTable[];
    activeDatabaseId: string

    constructor(tables: DomainTable[], activeDatabaseId: string) {
        this.tables = tables;
        this.activeDatabaseId = activeDatabaseId
    }

    static init(draw: VmDraw) {
        return new DomainDraw(
            draw.schemaTables.map(x => DomainTable.init(x)),
            draw.activeDatabaseId
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
            jsonObject.tables.map(x => DomainTable.hydrate(x)),
            jsonObject.activeDatabaseId ?? Databases.Postgres.id
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