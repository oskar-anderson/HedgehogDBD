import Database from "./Database";
import Databases from "./Databases";
import { DataBaseSelector } from "./DataBaseSelector";

const BOOLEAN = "Boolean"
const DATE_TIME_OFFSET = "DateTimeOffset"
const FLOAT128 = "Float128"
const FLOAT64 = "Float64"
const FLOAT32 = "Float32"
const GUID = "Guid"
const INT16 = "Int16"
const INT32 = "Int32"
const INT64 = "Int64"
const STRING = "String"

export default abstract class DataType {

    static getTypes(): DataType[] {
        return [
            DataType.boolean(),
            DataType.dateTimeOffset(),
            DataType.float128(),
            DataType.float64(),
            DataType.float32(),
            DataType.guid(),
            DataType.int64(),
            DataType.int32(),
            DataType.int16(),
            DataType.string(),
        ]
    }

    static getType(selectListName: string) {
        switch (selectListName) {
            case BOOLEAN:
                return DataType.boolean();
            case DATE_TIME_OFFSET:
                return DataType.dateTimeOffset();
            case FLOAT128:
                return DataType.float128();
            case FLOAT64:
                return DataType.float64();
            case FLOAT32:
                return DataType.float32();
            case GUID:
                return DataType.guid();
            case INT16:
                return DataType.int16();
            case INT32:
                return DataType.int32();
            case INT64:
                return DataType.int64();
            case STRING:
                return DataType.string();
            default:
                return DataType.string();
        }

    }

    static boolean() { return new DataTypeBoolean() }
    static dateTimeOffset() { return new DataTypeDateTimeOffset() }
    static float128() { return new DataTypeFloat128() }
    static float64() { return new DataTypeFloat64() }
    static float32() { return  new DataTypeFloat32() }
    static guid() { return new DataTypeGuid() }
    static int16() { return new DataTypeInt16() }
    static int32() { return new DataTypeInt32() }
    static int64() { return new DataTypeInt64() }
    static string() { return new DataTypeString() }

    public getArgumentById(id: string): IDataTypeArgument {
        const argument = this.getAllArguments().find(x => x.id === id);
        if (argument === undefined) throw Error(`No argument with name ${name} exists.`)
        return argument;
    }


    public base_getDatabaseArgumentsSorted(databaseName: DataBaseSelector): IDataTypeArgument[] {
        return this.getAllArguments()
            .filter(x => x.databases.filter(x => x.select === databaseName))
            .sort((a, b) => a.position - b.position)
    }

    abstract getSelectListName(): string;

    abstract getAllArguments(): IDataTypeArgument[];
}

export interface IDataTypeArgument {
    id: string,
    defaultValue: number;
    displayName: string;
    isRequired: boolean;
    position: number;
    databases: Database[];
    type: string;
}


export class DataTypeBoolean extends DataType {
    getSelectListName(): string { return BOOLEAN }
    getAllArguments(): IDataTypeArgument[] {
        return [];
    }
}

export class DataTypeDateTimeOffset extends DataType {
    getSelectListName(): string { return DATE_TIME_OFFSET }
    getAllArguments(): IDataTypeArgument[] {
        return [];
    }
}

export class DataTypeFloat128 extends DataType {
    getSelectListName(): string { return FLOAT128 }
    getAllArguments(): IDataTypeArgument[] {
        return [];
    }
}

export class DataTypeFloat64 extends DataType {
    getSelectListName(): string { return FLOAT64 }
    getAllArguments(): IDataTypeArgument[] {
        return [];
    }
}

export class DataTypeFloat32 extends DataType {
    getSelectListName(): string { return FLOAT32 }
    getAllArguments(): IDataTypeArgument[] {
        return [];
    }
}

export class DataTypeGuid extends DataType {
    getSelectListName(): string { return GUID }
    getAllArguments(): IDataTypeArgument[] {
        return [DataTypeGuid.charLenght];
    }

    static charLenght: IDataTypeArgument = {
        id: "aeaeb3b5-d32e-4ccb-b1a3-863c3b2e71a3",
        defaultValue: 36,
        displayName: "lenght",
        isRequired: false,
        position: 0,
        databases: [Databases.MySql],
        type: GUID
    }
}

export class DataTypeInt16 extends DataType {
    getSelectListName(): string { return INT16 }
    getAllArguments(): IDataTypeArgument[] {
        return [];
    }
}

export class DataTypeInt32 extends DataType {
    getSelectListName(): string { return INT32 }
    getAllArguments(): IDataTypeArgument[] {
        return [];
    }
}

export class DataTypeInt64 extends DataType {
    getSelectListName(): string { return INT64 }
    getAllArguments(): IDataTypeArgument[] {
        return [];
    }
}

export class DataTypeString extends DataType {
    getSelectListName(): string { return STRING }

    getAllArguments(): IDataTypeArgument[] {
        return [DataTypeString.varcharLenght];
    }

    getDatabaseArguments(databaseName: DataBaseSelector): IDataTypeArgument[] {
        return this.base_getDatabaseArgumentsSorted(databaseName)
            .filter(x => x.type === STRING);
    }

    static varcharLenght: IDataTypeArgument = { 
        id: "884701d9-79bf-41a8-a4d9-af8d6bd0c1ea",
        defaultValue: 255,
        displayName: "lenght",
        isRequired: true,
        position: 0,
        databases: [Databases.MySql, Databases.Postgres, Databases.SqlServer],
        type: STRING
    }
}