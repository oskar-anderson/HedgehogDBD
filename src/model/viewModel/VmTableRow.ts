import VmTableRowDataType from "./VmTableRowDataType";


export default class VmTableRow {
    readonly name: string;
    readonly datatype: VmTableRowDataType;
    attributes: string[]

    constructor(name: string, datatype: VmTableRowDataType, attributes: string[]) {
        this.name = name;
        this.datatype = datatype;
        this.attributes = attributes;
    }

    clone() {
        return new VmTableRow(
            this.name,
            this.datatype.clone(),
            [...this.attributes]
        );
    }
}