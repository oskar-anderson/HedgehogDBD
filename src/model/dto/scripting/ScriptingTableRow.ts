import DataType from "../../DataTypes/DataType";
import DomainTableRowDataType from "../../domain/DomainTableRowDataType";
import DomainTableRow from "../../domain/DomainTableRow";
import ScriptingTableRowDataType from "./ScriptingTableRowDataType";
import DomainDraw from "../../domain/DomainDraw";
import Databases from "../../DataTypes/Databases";

export class ScriptingTableRow {
    name: string;
    originalDatatype: DomainTableRowDataType;
    targetDatatype: ScriptingTableRowDataType;
    attributes: string[]

    constructor(name: string, originalDatatype: DomainTableRowDataType, targetDatatype: ScriptingTableRowDataType, attributes: string[]) {
        this.name = name;
        this.originalDatatype = originalDatatype;
        this.targetDatatype = targetDatatype;
        this.attributes = attributes;
    }

    static initTableRow(tableRow: DomainTableRow, domainDraw: DomainDraw) {
        const activeDatabase = Databases.get(domainDraw.activeDatabaseId);
        const getComputedTypeName = DataType.getComputerMethod(activeDatabase.types, tableRow.datatype.id)
        const dataTypeComputedName = getComputedTypeName()
        const newDataType = { 
            name: dataTypeComputedName, 
            arguments: [...tableRow.datatype.arguments.map(x => x.value)], 
            isNullable: tableRow.datatype.isNullable
        };
        return new ScriptingTableRow(tableRow.name, tableRow.datatype, newDataType, [...tableRow.attributes]);
    }
}