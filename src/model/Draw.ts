import { useState } from "react"
import Database from "./DataTypes/Database";
import Databases from "./DataTypes/Databases";
import Table from "./Table";

export class Draw {
    history = new History();
    activeDatabase = Databases.Postgres.id;
    schemaTables: Table[] = [];



}