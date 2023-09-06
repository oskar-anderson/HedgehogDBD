import VmTableRow from "../viewModel/VmTableRow";
import DomainTableRowDataType from "./DomainTableRowDataType";


export default class DomainTableRow {
    readonly name: string;
    readonly datatype: DomainTableRowDataType;
    attributes: string[]

    constructor(name: string, datatype: DomainTableRowDataType, attributes: string[]) {
        this.name = name;
        this.datatype = datatype;
        this.attributes = attributes;
    }

    static hydrate(jsonObject: DomainTableRow): DomainTableRow {
        return new DomainTableRow(
            jsonObject.name,
            DomainTableRowDataType.hydrate(jsonObject.datatype),
            [...jsonObject.attributes]
        );
    }

    mapToVM() {
        return new VmTableRow(
            this.name, 
            this.datatype.mapToVm(), 
            [...this.attributes]
        );
    }
}