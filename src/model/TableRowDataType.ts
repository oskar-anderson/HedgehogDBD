import DataType from "./DataTypes/DataType";
import { IDataType } from "./DataTypes/IDataType";
import TableRowDataTypeArguments from "./TableRowDataTypeArguments";

export default class TableRowDataType {
    dataTypeId: string;
    arguments: TableRowDataTypeArguments[];
    isNullable: boolean;

    constructor(
        name: IDataType,
        _arguments: TableRowDataTypeArguments[],
        nullable: boolean
    ) {
        this.dataTypeId = name.getId();
        this.arguments = _arguments;
        this.isNullable = nullable;
    }

    getDisplayableText() {
        const nullabilitySymbol = this.isNullable ? "?" : "";
        const selectListName = DataType.getTypeById(this.dataTypeId).getSelectListName();
        return `${selectListName}${nullabilitySymbol}`;
    }
}