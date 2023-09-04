import Point from "../Point";
import VmRelation from "./VmRelation";
import VmTableRow from "./VmTableRow";

export default class VmTable {
    readonly id: string = crypto.randomUUID();
    isHover: boolean = false;
    isDirty = true;
    
    constructor(
        public position: Point, 
        public head: string,
        public tableRows: VmTableRow[], 
        {
            id = crypto.randomUUID(),
            isHover = false,
        } = {}
        ) {
        this.id = id;
        this.isHover = isHover;
    }


    getRelations(tables: VmTable[]): VmRelation[] {
        let references = [];
        let pkRow = this.tableRows.filter(row => row.attributes.includes("PK"))[0];
        if (! pkRow) { return []; }
        for (let tableRow of this.tableRows) {
            let matches = [...tableRow.attributes.join('').matchAll(/FK\("(\w+)"\)/g)];
            if (matches.length !== 1 || matches[0].length !== 2) {
                continue;
            }
            let fkTableName = matches[0][1];
            let targetTable = tables.find(table => table.head === fkTableName);
            if (! targetTable) { continue; }
            const targetTableRow =  targetTable.tableRows.filter(row => row.attributes.includes("PK"))[0];
            if (! targetTableRow) { continue; }
            references.push({ targetTable: targetTable, targetTableRow: targetTableRow, sourceTableRow: tableRow });
        }
        return references.map(ref => {
            return new VmRelation(ref.targetTable, ref.targetTableRow, this, ref.sourceTableRow)
        });
    }

    clone() {
        return new VmTable(
            { ...this.position },
            this.head,
            this.tableRows.map(row => row.clone()),
            {
                // @ts-ignore
                id: this.id,
                isHover: this.isHover,
            }
        );
    }

    setIsDirty(value: boolean) {
        this.isDirty = value;
        return this;
    }
}