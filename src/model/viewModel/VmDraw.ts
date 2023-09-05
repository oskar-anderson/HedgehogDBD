import { useState } from "react"
import Database from "../DataTypes/Database";
import Databases from "../DataTypes/Databases";
import VmTable from "./VmTable";
import History from "../../commands/History"
import VmRelation from "./VmRelation";

export default class VmDraw {
    history = new History();
    activeDatabase = Databases.Postgres.id;
    schemaTables: VmTable[] = [];
    schemaRelations: VmRelation[] = [];
    isDirty: boolean = true;

    constructor(
        history: History,
        activeDatabase: string,
        tables: VmTable[],
        relations: VmRelation[],
        isDirty: boolean
        ) {
        this.history = history;
        this.activeDatabase = activeDatabase;
        this.schemaTables = tables;
        this.schemaRelations = relations;
        this.isDirty = isDirty;
    }
}