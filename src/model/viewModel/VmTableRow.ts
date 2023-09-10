import VmTableRowDataType from "./VmTableRowDataType";


export default interface VmTableRow {
    readonly name: string;
    readonly datatype: VmTableRowDataType;
    attributes: string[]
}