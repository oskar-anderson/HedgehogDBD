import Database from "./Database"
import { DataBaseSelector } from "./DataBaseSelector"
import { IDataTypeArgument } from "./DataType"
import MySqlDataTypes from "./MySqlDataTypes"
import PostgresDataTypes from "./PostgresDataTypes"
import SqlServerDataTypes from "./SqlServerDataTypes"



export default class Databases {
    static MySql = { select: DataBaseSelector.MySql, types: new MySqlDataTypes() }
    static Postgres = { select: DataBaseSelector.Postgres, types: new PostgresDataTypes() }
    static SqlServer = { select: DataBaseSelector.SqlServer, types: new SqlServerDataTypes() }

    selectedDatabase = Databases.MySql;
    
    static getAll(): Database[] {
        return [Databases.MySql, Databases.Postgres, Databases.SqlServer];
    }

    getSelectedDatabaseArguments(arguements: IDataTypeArgument[]) {
        return arguements
            .filter(x => x.databases.find(y => y.select === this.selectedDatabase.select))
            .sort(x => x.position)
    }
}