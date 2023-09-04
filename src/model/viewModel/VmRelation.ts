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

    clone() {
        return new VmRelation(
            this.target.clone(),
            this.targetRow.clone(),
            this.source.clone(),
            this.sourceRow.clone()
        );
    }

    setIsDirty(value: boolean) {
        this.isDirty = value;
        return this;
    }
}