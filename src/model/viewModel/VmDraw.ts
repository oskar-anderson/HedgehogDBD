import Database from "../DataTypes/Database";
import Databases from "../DataTypes/Databases";
import VmTable from "./VmTable";
import History from "../../commands/History"
import VmRelation from "./VmRelation";

export default class VmDraw {
    history = new History();
    activeDatabaseId = Databases.Postgres.id;
    schemaTables: VmTable[] = [];
    schemaRelations: VmRelation[] = [];
    areTablesDirty: boolean = true;

    constructor(
        history: History,
        activeDatabaseId: string,
        tables: VmTable[],
        relations: VmRelation[],
        areTablesDirty: boolean
        ) {
        this.history = history;
        this.activeDatabaseId = activeDatabaseId;
        this.schemaTables = tables;
        this.schemaRelations = relations;
        this.areTablesDirty = areTablesDirty;
    }
}