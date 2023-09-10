import VmTable from "./VmTable";
import VmTableRow from "./VmTableRow";


export default interface VmRelation {
    target: VmTable,
    targetRow: VmTableRow,
    source: VmTable,
    sourceRow: VmTableRow
}