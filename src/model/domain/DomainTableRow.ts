import DataType from "../DataTypes/DataType";
import VmTableRow from "../viewModel/VmTableRow";
import DomainTableRowDataTypeArguments from "./DomainTableRowDataTypeArguments";


export default class DomainTableRow {
    readonly name: string;
    datatypeId: string;
    datatypeArguments: DomainTableRowDataTypeArguments[];
    datatypeIsNullable: boolean;
    attributes: string[]

    constructor(
        name: string, 
        datatypeId: string, 
        datatypeArguments: DomainTableRowDataTypeArguments[], 
        datatypeIsNullable: boolean,
        attributes: string[]) {
        this.name = name;
        this.datatypeId = datatypeId;
        this.datatypeArguments = datatypeArguments;
        this.datatypeIsNullable = datatypeIsNullable;
        this.attributes = attributes;
    }

    static hydrate(jsonObject: DomainTableRow): DomainTableRow {
        return new DomainTableRow(
            jsonObject.name,
            jsonObject.datatypeId,
            jsonObject.datatypeArguments.map(x => DomainTableRowDataTypeArguments.hydrate(x)),
            jsonObject.datatypeIsNullable,
            [...jsonObject.attributes]
        );
    }

    mapToVM(): VmTableRow {
        return {
            name: this.name, 
            datatype: {
                dataTypeId: this.datatypeId,
                arguments: this.datatypeArguments.map(x => x.mapToVm()),
                isNullable: this.datatypeIsNullable
            },
            attributes: [...this.attributes]
        }
    }
}