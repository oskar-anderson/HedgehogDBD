import { Point, Rectangle } from "pixi.js";
import { TableRow } from "./TableRow";

export class Table {
    id: string = crypto.randomUUID();
    position: Point;
    head: string;
    tableRows: TableRow[];
    color: number = 0x008000;
    
    /* 
    This constuctor exists for cloning, you probably want to use Table.init() 
    Treat as private constructor - this is public for JSON handling only
    */
    private constructor(table: { id: string, position: Point, head: string, tableRows: TableRow[], color: number }) {
        this.id = table.id;
        this.position = table.position;
        this.head = table.head;
        this.tableRows = table.tableRows;
        this.color = table.color;
    }
    
    static init(position: Point, head: string, tableRows: TableRow[]) {
        return new Table({
            id: crypto.randomUUID(),
            position: position,
            head: head,
            tableRows: tableRows,
            color: 0x008000
         });
    }

    static initClone(table: Table): Table {
        let copy = new Table(
            {
                id: table.id,
                position: new Point(table.position.x, table.position.y),
                head: table.head,
                tableRows: table.tableRows.map(x => TableRow.initClone(x)),
                color: table.color
            }
        );
        return copy;
    }

    initNewId() {
        this.id = crypto.randomUUID();
    }


    getColumnWidths() {
        let datatypeRows = this.tableRows.map(x => x.datatype);
        let longestDatatypeLenght = Math.max(...(datatypeRows.map(el => el.length)));

        let attributeRows = this.tableRows.map(x => x.attributes.join(", "));
        let longestAttributeLenght = Math.max(...(attributeRows.map(el => el.length)));

        let pad = 3;  // padding plus one non-writable wall
        return [
            this.getContainingRect().width - 1 - ((longestDatatypeLenght + pad) + (longestAttributeLenght + pad)), 
            longestDatatypeLenght + pad, 
            longestAttributeLenght + pad
        ];
    }

    getContainingRect() {
        return new Rectangle(
            this.position.x, 
            this.position.y, 
                2 + Math.max(...(this.tableRows.map(el => el.name.length))) + 3 
                + Math.max(...(this.tableRows.map(el => el.datatype.length))) + 3 + 
                Math.max(...(this.tableRows.map(el => el.attributes.join(", ").length))) + 2, 
            4 + this.tableRows.length
        );
    }
}