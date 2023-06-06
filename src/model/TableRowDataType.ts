import DataType from "./DataTypes/DataType";
import TableRowDataTypeArguments from "./TableRowDataTypeArguments";

export default class TableRowDataType {
    name: DataType;
    arguments: TableRowDataTypeArguments[];
    isNullable: boolean;

    constructor(
        name: DataType,
        _arguments: TableRowDataTypeArguments[],
        nullable: boolean
    ) {
        this.name = name;
        this.arguments = _arguments;
        this.isNullable = nullable;
    }

    getDisplayableText() {
        const nullabilitySymbol = this.isNullable ? "?" : "!";
        return `${this.name.getSelectListName()}${nullabilitySymbol}`;
    }
}