import Point from "./Point";
import Relation from "./Relation";
import TableRow from "./TableRow";

export default class Table {
    readonly id: string = crypto.randomUUID();
    isHover: boolean = false;
    private isDirty = true;
    relations: Relation[] = [];
    
    constructor(
        public position: Point, 
        public head: string,
        public tableRows: TableRow[], 
        {
            id = crypto.randomUUID(),
            isHover = false,
        } = {}
        ) {
        this.id = id;
        this.isHover = isHover;
    }


    updateRelations(tables: Table[]) {
        let references = [];
        let pkRow = this.tableRows.filter(row => row.attributes.includes("PK"))[0];
        if (! pkRow) { return; }
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
        this.relations = references.map(ref => {
            return new Relation(ref.targetTable, ref.targetTableRow, this, ref.sourceTableRow)
        });
    }
}