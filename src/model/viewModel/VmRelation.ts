import VmTable from "./VmTable";
import VmTableRow from "./VmTableRow";


export default class VmRelation {

    isDirty: boolean = true;

    constructor(
        public target: VmTable,
        public targetRow: VmTableRow,
        public source: VmTable,
        public sourceRow: VmTableRow
    ) {
         
    }

    setIsDirty(value: boolean) {
        this.isDirty = value;
        return this;
    }
}