import VmTable from "./VmTable";
import VmTableRow from "./VmTableRow";


export default class VmRelation {

    constructor(
        public target: VmTable,
        public targetRow: VmTableRow,
        public source: VmTable,
        public sourceRow: VmTableRow
    ) {
         
    }
}