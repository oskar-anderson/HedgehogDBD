import DataType from "../DataTypes/DataType";
import VmTableRowDataType from "../viewModel/VmTableRowDataType";
import DomainTableRowDataTypeArguments from "./DomainTableRowDataTypeArguments";

export default class DomainTableRowDataType {
    id: string;
    arguments: DomainTableRowDataTypeArguments[];
    isNullable: boolean;

    constructor(
        id: string,
        _arguments: DomainTableRowDataTypeArguments[],
        nullable: boolean
    ) {
        this.id = id;
        this.arguments = _arguments;
        this.isNullable = nullable;
    }

    static hydrate(tableRowAttribute: DomainTableRowDataType): DomainTableRowDataType {
        return new DomainTableRowDataType(
            tableRowAttribute.id,
            tableRowAttribute.arguments.map(x => DomainTableRowDataTypeArguments.hydrate(x)),
            tableRowAttribute.isNullable
        );
    }

    mapToVm(): VmTableRowDataType {
        return new VmTableRowDataType(
            DataType.getTypeById(this.id).getId(), 
            this.arguments.map(x => x.mapToVm()), 
            this.isNullable
        );
    }
}