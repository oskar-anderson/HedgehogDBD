import VmTableRowDataTypeArguments from "./VmTableRowDataTypeArguments";


export default interface VmTableRowDataType {
    dataTypeId: string;
    arguments: VmTableRowDataTypeArguments[];
    isNullable: boolean;
}