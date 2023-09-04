import DataType from "../DataTypes/DataType";
import { IDataType } from "../DataTypes/IDataType";
import VmTableRowDataTypeArguments from "./VmTableRowDataTypeArguments";


export default class VmTableRowDataType {
    dataTypeId: string;
    arguments: VmTableRowDataTypeArguments[];
    isNullable: boolean;

    constructor(
        id: string,
        _arguments: VmTableRowDataTypeArguments[],
        nullable: boolean
    ) {
        this.dataTypeId = id;
        this.arguments = _arguments;
        this.isNullable = nullable;
    }

    getDisplayableText() {
        const nullabilitySymbol = this.isNullable ? "?" : "";
        const selectListName = DataType.getTypeById(this.dataTypeId).getSelectListName();
        return `${selectListName}${nullabilitySymbol}`;
    }

    clone() {
        return new VmTableRowDataType(
            this.dataTypeId,
            this.arguments.map(arg => arg.clone()),
            this.isNullable
        )
    }
}