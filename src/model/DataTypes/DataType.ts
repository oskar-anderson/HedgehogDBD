import Database from "./Database";
import Databases from "./Databases";
import { DataBaseSelector } from "./DataBaseSelector";
import IDatabaseType from "./IDatabaseType";
import { IDataType } from "./IDataType";

const BOOLEAN = "Boolean"
const BOOLEAN_ID =          "602200d9-2075-4824-b80c-6e739e503a70"
const DATE_TIME_OFFSET = "DateTimeOffset"
const DATE_TIME_OFFSET_ID = "1b294675-44fb-4dae-9481-abaecd97a836"
const DECIMAL = "Decimal"
const DECIMAL_ID =          "4bde4381-61f9-4877-9d14-084978b20b28"
const DOUBLE = "Double"
const DOUBLE_ID =           "30767a2a-9bb4-4d2b-8af2-8b0fc84b2fc9"
const FLOAT = "Float"
const FLOAT_ID =            "570f2fef-5b1e-4c5e-89fe-cbc385af3a6c"
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

    static getTypes(): IDataType[] {
        return [
            DataType.boolean(),
            DataType.dateTimeOffset(),
            DataType.decimal(),
            DataType.double(),
            DataType.float(),
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
    static decimal() { return new DataTypeDecimal() }
    static double() { return new DataTypeDouble() }
    static float() { return  new DataTypeFloat() }
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

    public static getArgumentsByDatabaseAndByType(databaseName: DataBaseSelector, typeId: string) {
        return DataType.getTypes()
            .map(x => x.getAllArguments())
            .flat()
            .filter(x => x.databases.some(x => x.select === databaseName))
            .filter(x => x.typeId === typeId)
            .sort((a, b) => a.position - b.position)
    }

    public static getComputerMethod(databaseType: IDatabaseType, dataTypeId: string) {
        switch (dataTypeId) {
            case BOOLEAN_ID: 
                return databaseType.getBooleanText;
            case DATE_TIME_OFFSET_ID:
                return databaseType.getDateTimeOffsetText;
            case DECIMAL_ID:
                return databaseType.getFloat128Text;
            case DOUBLE_ID:
                return databaseType.getFloat64Text;
            case FLOAT_ID:
                return databaseType.getFloat32Text;
            case GUID_ID:
                return databaseType.getGuidText;
            case INT16_ID:
                return databaseType.getInt16Text;
            case INT32_ID:
                return databaseType.getInt32Text;
            case INT64_ID:
                return databaseType.getInt64Text;
            case STRING_ID:
                return databaseType.getStringText;
        }
        throw new Error(`Unknown datatypeId: ${dataTypeId}`)
    }
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


export class DataTypeBoolean implements IDataType {
    getId(): string { return BOOLEAN_ID}
    getSelectListName(): string { return BOOLEAN }
    getAllArguments(): IDataTypeArgument[] {
        return [];
    }
}

export class DataTypeDateTimeOffset implements IDataType {
    getId(): string { return DATE_TIME_OFFSET_ID}
    getSelectListName(): string { return DATE_TIME_OFFSET }
    getAllArguments(): IDataTypeArgument[] {
        return [DataTypeDateTimeOffset.mySqlFractionalPrecisionSeconds];
    }


    /**
        This is here to reset MySql default precision of 0 back to SQL standard default precision of 6
        This could be used in Postgres in the future, but not in Sql Server as it has a 7 digit precision max
    */
    static mySqlFractionalPrecisionSeconds: IDataTypeArgument = {
        id: "7f690ebc-249f-44a9-8bcf-42f45261ff32",
        defaultValue: 6,
        displayName: "fsp",
        isReadonly: true,
        isIncluded: true,
        position: 0,
        databases: [Databases.MySql], // Sql Server might have to have a seperate fsp value as it goes up to 7 and also defaults to 7
        typeId: DATE_TIME_OFFSET_ID
    }
}

export class DataTypeDecimal implements IDataType {
    getId(): string { return DECIMAL_ID }
    getSelectListName(): string { return DECIMAL }
    getAllArguments(): IDataTypeArgument[] {
        return [DataTypeDecimal.precision, DataTypeDecimal.scale];
    }

    static precision: IDataTypeArgument = {
        id: "f44703fe-0e0e-451f-872c-1278cc77df3e",
        defaultValue: 10, // presonal preference - SQL Server uses 18
        displayName: "precision",
        isReadonly: false,
        isIncluded: true,
        position: 0,
        databases: [Databases.MySql, Databases.Postgres, Databases.SqlServer],
        typeId: DECIMAL_ID
    }
    
    static scale: IDataTypeArgument = {
        id: "278da857-3740-43bf-a8c5-894319355e5a",
        defaultValue: 2, // personal preference - SQL Server uses 0
        displayName: "scale",
        isReadonly: false,
        isIncluded: true,
        position: 1,
        databases: [Databases.MySql, Databases.Postgres, Databases.SqlServer],
        typeId: DECIMAL_ID
    }
}

export class DataTypeDouble implements IDataType {
    getId(): string { return DOUBLE_ID}
    getSelectListName(): string { return DOUBLE }
    getAllArguments(): IDataTypeArgument[] {
        return [];
    }


    /*
    // Float precision argument is ignored as using the default value is best practice
    // https://dev.mysql.com/doc/refman/8.0/en/floating-point-types.html

    static precision: IDataTypeArgument = {
        id: "aebb60dc-5a1b-4720-b9a3-f8055b086ea8",
        defaultValue: 53,
        displayName: "precision",
        isReadonly: false,
        isIncluded: false,
        position: 0,
        databases: [Databases.MySql, Databases.SqlServer],
        typeId: DOUBLE_ID
    }
    */

}

export class DataTypeFloat implements IDataType {
    getId(): string { return FLOAT_ID }
    getSelectListName(): string { return FLOAT }
    getAllArguments(): IDataTypeArgument[] {
        return [];
    }

    // Float precision argument is ignored as using the default value is best practice
    // https://dev.mysql.com/doc/refman/8.0/en/floating-point-types.html
}

export class DataTypeGuid implements IDataType {
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

export class DataTypeInt16 implements IDataType {
    getId(): string { return INT16_ID }
    getSelectListName(): string { return INT16 }
    getAllArguments(): IDataTypeArgument[] {
        return [];
    }

    /* 
    // this is an useless attribute
    static mySqlDisplaySize: IDataTypeArgument = { 
        id: "8347dc27-6373-413c-a103-6b079e41ff64",
        defaultValue: 255,
        displayName: "size",
        isReadonly: false,
        isIncluded: false,
        position: 0,
        databases: [Databases.MySql],
        typeId: INT16_ID
    }
    */
}

export class DataTypeInt32 implements IDataType {
    getId(): string { return INT32_ID }
    getSelectListName(): string { return INT32 }
    getAllArguments(): IDataTypeArgument[] {
        return [];
    }

    /* 
    // this is an useless attribute
    static mySqlDisplaySize: IDataTypeArgument = { 
        id: "de828d57-e130-4f11-af35-08040c6c46c6",
        defaultValue: 255,
        displayName: "size",
        isReadonly: false,
        isIncluded: false,
        position: 0,
        databases: [Databases.MySql],
        typeId: INT32_ID
    }
    */
}

export class DataTypeInt64 implements IDataType {
    getId(): string { return INT64_ID }
    getSelectListName(): string { return INT64 }
    getAllArguments(): IDataTypeArgument[] {
        return [];
    }

    /* 
    // this is an useless attribute
    static mySqlDisplaySize: IDataTypeArgument = { 
        id: "d01f6762-9778-476e-b4df-df30e1a905c5",
        defaultValue: 255,
        displayName: "size",
        isReadonly: false,
        isIncluded: false,
        position: 0,
        databases: [Databases.MySql],
        typeId: INT64_ID
    }
    */
}

export class DataTypeString implements IDataType {
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