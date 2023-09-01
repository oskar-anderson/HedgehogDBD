import Database from "../DataTypes/Database";
import DataType from "../DataTypes/DataType";
import TableRowDataTypeDTO from "../dto/TableRowDataTypeDTO";
import { TableRowDTO } from "../dto/TableRowDTO";
import TableRowDataType from "../TableRowDataType";
import { ScriptingTableRowDataType } from "./ScriptingTableRowDataType";

export class ScriptingTableRow {
    name: string;
    originalDatatype: TableRowDataTypeDTO;
    targetDatatype: ScriptingTableRowDataType;
    attributes: string[]

    constructor(name: string, originalDatatype: TableRowDataTypeDTO, targetDatatype: ScriptingTableRowDataType, attributes: string[]) {
        this.name = name;
        this.originalDatatype = originalDatatype;
        this.targetDatatype = targetDatatype;
        this.attributes = attributes;
    }

    static initTableRow(tableRow: TableRowDTO, database: Database) {
        const getComputedTypeName = DataType.getComputerMethod(database.types, tableRow.datatype.id)
        const dataTypeComputedName = getComputedTypeName()
        const newDataType = { name: dataTypeComputedName, arguments: [...tableRow.datatype.arguments.map(x => x.value)], isNullable: tableRow.datatype.isNullable};
        return new ScriptingTableRow(tableRow.name, tableRow.datatype, newDataType, [...tableRow.attributes]);
    }
}