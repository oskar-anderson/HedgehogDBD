import Database from "../DataTypes/Database";
import Databases from "../DataTypes/Databases";
import VmTable from "./VmTable";
import History from "../../commands/CommandHistory"
import VmRelation from "./VmRelation";

export default class VmDraw {
    history = new History();
    activeDatabaseId = Databases.Postgres.id;
    schemaTables: VmTable[] = [];
    schemaRelations: VmRelation[] = [];

    constructor(
        history: History,
        activeDatabaseId: string,
        tables: VmTable[],
        relations: VmRelation[],
        ) {
        this.history = history;
        this.activeDatabaseId = activeDatabaseId;
        this.schemaTables = tables;
        this.schemaRelations = relations;
    }
}