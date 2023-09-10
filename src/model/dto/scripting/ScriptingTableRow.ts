import DataType from "../../DataTypes/DataType";
import DomainTableRow from "../../domain/DomainTableRow";
import ScriptingTableRowDataType from "./ScriptingTableRowDataType";
import DomainDraw from "../../domain/DomainDraw";
import Databases from "../../DataTypes/Databases";
import DomainTableRowDataTypeArguments from "../../domain/DomainTableRowDataTypeArguments";

export class ScriptingTableRow {
    name: string;
    originalDatatype: {
        id: string;
        arguments: DomainTableRowDataTypeArguments[];
        isNullable: boolean;
    };
    targetDatatype: ScriptingTableRowDataType;
    attributes: string[]

    constructor(name: string, originalDatatype: {
        id: string;
        arguments: DomainTableRowDataTypeArguments[];
        isNullable: boolean;
    }, targetDatatype: ScriptingTableRowDataType, attributes: string[]) {
        this.name = name;
        this.originalDatatype = originalDatatype;
        this.targetDatatype = targetDatatype;
        this.attributes = attributes;
    }

    static initTableRow(tableRow: DomainTableRow, domainDraw: DomainDraw) {
        const activeDatabase = Databases.get(domainDraw.activeDatabaseId);
        const getComputedTypeName = DataType.getComputerMethod(activeDatabase.types, tableRow.datatypeId)
        const dataTypeComputedName = getComputedTypeName()
        const newDataType = { 
            name: dataTypeComputedName, 
            arguments: [...tableRow.datatypeArguments.map(x => x.value)], 
            isNullable: tableRow.datatypeIsNullable
        };
        return new ScriptingTableRow(tableRow.name, {
            id: tableRow.datatypeId,
            arguments: tableRow.datatypeArguments,
            isNullable: tableRow.datatypeIsNullable,
        }, newDataType, [...tableRow.attributes]);
    }
}