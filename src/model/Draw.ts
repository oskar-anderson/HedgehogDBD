import { useState } from "react"
import Database from "./DataTypes/Database";
import Databases from "./DataTypes/Databases";
import Table from "./Table";
import History from "../commands/History"

export default class Draw {
    history = new History();
    activeDatabase = Databases.Postgres.id;
    schemaTables: Table[] = [];

}