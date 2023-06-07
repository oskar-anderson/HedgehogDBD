import Database from "./Database";
import Databases from "./Databases";
import { DataBaseSelector } from "./DataBaseSelector";

const BOOLEAN = "Boolean"
const BOOLEAN_ID =          "602200d9-2075-4824-b80c-6e739e503a70"
const DATE_TIME_OFFSET = "DateTimeOffset"
const DATE_TIME_OFFSET_ID = "1b294675-44fb-4dae-9481-abaecd97a836"
const FLOAT128 = "Float128"
const FLOAT128_ID =         "4bde4381-61f9-4877-9d14-084978b20b28"
const FLOAT64 = "Float64"
const FLOAT64_ID =          "30767a2a-9bb4-4d2b-8af2-8b0fc84b2fc9"
const FLOAT32 = "Float32"
const FLOAT32_ID =          "570f2fef-5b1e-4c5e-89fe-cbc385af3a6c"
const GUID = "Guid"
const GUID_ID =             "37cc5f13-d7f7-4fa4-808f-8fbf2c4f5d68"
const INT16 = "Int16"
const INT16_ID =            "71ccfd31-47c8-472c-bc80-4ca5df29e939"
const INT32 = "Int32"
const INT32_ID =            "d8b8dfce-adbf-4988-919e-63b475c187bc"
const INT64 = "Int64"
const INT64_ID =            "df3095f4-3407-44d6-b5ff-93e624b02b6c"
const STRING = "String"
const STRING_ID =           "5b333c43-06e5-4874-8348-c3ed3a7af2d3"

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

    static getTypeById(id: string) {
        const type = DataType.getTypes().find(x => x.getId() === id);
        if (type === undefined) throw new Error(`No datatype with id: ${id}`)
        return type;
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

    public static getArgumentById(id: string): IDataTypeArgument {
        const argument = DataType.getTypes()
            .map(x => x.getAllArguments())
            .flat()
            .find(x => x.id === id);
        if (argument === undefined) throw Error(`No argument with id ${id} exists.`)
        return argument;
    }


    public static getDatabaseArgumentsSorted(databaseName: DataBaseSelector): IDataTypeArgument[] {
        return DataType.getTypes()
            .map(x => x.getAllArguments())
            .flat()
            .filter(x => x.databases.some(x => x.select === databaseName))
            .sort((a, b) => a.position - b.position)
    }

    public static getArgumentsByDatabaseAndByType(databaseName: DataBaseSelector, typeId: string) {
        return DataType.getTypes()
            .map(x => x.getAllArguments())
            .flat()
            .filter(x => x.databases.some(x => x.select === databaseName))
            .filter(x => x.typeId === typeId)
            .sort((a, b) => a.position - b.position)
    }

    abstract getSelectListName(): string;
    abstract getId(): string;

    abstract getAllArguments(): IDataTypeArgument[];
}

export interface IDataTypeArgument {
    /** 
     * Unique identifier because for this argument, because displayName is not unique
    */ 
    id: string,
    /** 
     * Default value of the argument shown in the argument input.
     * It is not included as the result if user leaves isIncluded property false
    */ 
    defaultValue: number;

    /** 
     * Name of the argument shown in a next to the argument input
    */ 
    displayName: string;

    /** 
     * This field cannot be changed in the UI (input is disabled)
     * It is needed to convert Guid to char(36) in MySQL
    */ 
    isReadonly: boolean;

    /** 
     * Is this field included in the UI checkbox. 
     * If a table is saved without the table row argument being included it will not be added to the arguments list.
    */ 
    isIncluded: boolean;

    /**
     * TODO This could be useful to make sure that the previous arguement is provided when there are 2+ arguments
     */
    position: number;
    
    /** 
     * List of supported databases that have this property 
    */ 
    databases: Database[];

    /** 
     * Type of the argument, useful for filtering a list of arguments
    */ 
    typeId: string;
}


export class DataTypeBoolean extends DataType {
    getId(): string { return BOOLEAN_ID}
    getSelectListName(): string { return BOOLEAN }
    getAllArguments(): IDataTypeArgument[] {
        return [];
    }
}

export class DataTypeDateTimeOffset extends DataType {
    getId(): string { return DATE_TIME_OFFSET_ID}
    getSelectListName(): string { return DATE_TIME_OFFSET }
    getAllArguments(): IDataTypeArgument[] {
        return [];
    }
}

export class DataTypeFloat128 extends DataType {
    getId(): string { return FLOAT128_ID }
    getSelectListName(): string { return FLOAT128 }
    getAllArguments(): IDataTypeArgument[] {
        return [];
    }
}

export class DataTypeFloat64 extends DataType {
    getId(): string { return FLOAT64_ID}
    getSelectListName(): string { return FLOAT64 }
    getAllArguments(): IDataTypeArgument[] {
        return [];
    }
}

export class DataTypeFloat32 extends DataType {
    getId(): string { return FLOAT32_ID }
    getSelectListName(): string { return FLOAT32 }
    getAllArguments(): IDataTypeArgument[] {
        return [];
    }
}

export class DataTypeGuid extends DataType {
    getId(): string { return GUID_ID }
    getSelectListName(): string { return GUID }
    getAllArguments(): IDataTypeArgument[] {
        return [DataTypeGuid.charLenght];
    }

    static charLenght: IDataTypeArgument = {
        id: "aeaeb3b5-d32e-4ccb-b1a3-863c3b2e71a3",
        defaultValue: 36,
        displayName: "lenght",
        isReadonly: true,
        isIncluded: true,
        position: 0,
        databases: [Databases.MySql],
        typeId: GUID_ID
    }
}

export class DataTypeInt16 extends DataType {
    getId(): string { return INT16_ID }
    getSelectListName(): string { return INT16 }
    getAllArguments(): IDataTypeArgument[] {
        return [];
    }
}

export class DataTypeInt32 extends DataType {
    getId(): string { return INT32_ID }
    getSelectListName(): string { return INT32 }
    getAllArguments(): IDataTypeArgument[] {
        return [];
    }
}

export class DataTypeInt64 extends DataType {
    getId(): string { return INT64_ID }
    getSelectListName(): string { return INT64 }
    getAllArguments(): IDataTypeArgument[] {
        return [];
    }
}

export class DataTypeString extends DataType {
    getId(): string { return STRING_ID }
    getSelectListName(): string { return STRING }

    getAllArguments(): IDataTypeArgument[] {
        return [DataTypeString.varcharLenght];
    }

    static varcharLenght: IDataTypeArgument = { 
        id: "884701d9-79bf-41a8-a4d9-af8d6bd0c1ea",
        defaultValue: 255,
        displayName: "lenght",
        isReadonly: false,
        isIncluded: true,
        position: 0,
        databases: [Databases.MySql, Databases.Postgres, Databases.SqlServer],
        typeId: STRING_ID
    }
}