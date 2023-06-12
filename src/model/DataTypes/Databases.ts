import Database from "./Database"
import { DataBaseSelector } from "./DataBaseSelector"
import { IDataTypeArgument } from "./DataType"
import MySqlDataTypes from "./MySqlDataTypes"
import PostgresDataTypes from "./PostgresDataTypes"
import SqlServerDataTypes from "./SqlServerDataTypes"



export default class Databases {
    static MySql = { id: "baf28b40-75cc-42fa-b5fc-2ef4bb395c7f", select: DataBaseSelector.MySql, types: new MySqlDataTypes() }
    static Postgres = { id: "e4886f99-e1bf-4a9e-a2a0-672195b0c823", select: DataBaseSelector.Postgres, types: new PostgresDataTypes() }
    static SqlServer = { id: "715e4d78-6574-4ddd-b9ac-1bf09a7028a0", select: DataBaseSelector.SqlServer, types: new SqlServerDataTypes() }
    
    static getAll(): Database[] {
        return [Databases.MySql, Databases.Postgres, Databases.SqlServer];
    }
}