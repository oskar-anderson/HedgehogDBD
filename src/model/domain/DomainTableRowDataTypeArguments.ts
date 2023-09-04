import DataType, { IDataTypeArgument } from "../DataTypes/DataType";
import VmTableRowDataTypeArguments from "../viewModel/VmTableRowDataTypeArguments";

export default class DomainTableRowDataTypeArguments {
    value: number;
    id: string;

    constructor(value: number, id: string) {
        this.value = value;
        this.id = id;
    }

    static hydrate(tableRowDataTypeArguments: DomainTableRowDataTypeArguments): DomainTableRowDataTypeArguments {
        return new DomainTableRowDataTypeArguments(
            tableRowDataTypeArguments.value,
            tableRowDataTypeArguments.id,
        );
    }

    mapToVm(): VmTableRowDataTypeArguments {
        return new VmTableRowDataTypeArguments(
            this.value, 
            DataType.getArgumentById(this.id)
        );
    }
}