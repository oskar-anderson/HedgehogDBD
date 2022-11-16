import { Rectangle } from "pixi.js";
import { TableRow } from "./TableRow";

export class Table {
    id: string = crypto.randomUUID();
    rect: Rectangle;
    head: string;
    tableRows: TableRow[];
    color: number = 0x008000;
    
    //* This constuctor exists for cloning, you probably want to use Table.init() */
    private constructor(table: { id: string, rect: Rectangle, head: string, tableRows: TableRow[], color: number }) {
        this.id = table.id;
        this.rect = table.rect;
        this.head = table.head;
        this.tableRows = table.tableRows;
        this.color = table.color;
    }
    
    static init(rect: Rectangle, head: string, tableRows: TableRow[]) {
        return new Table({
            id: crypto.randomUUID(),
            rect: rect,
            head: head,
            tableRows: tableRows,
            color: 0x008000
         });
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

    getHeadRect() {
        let rect = this.getContainingRect();
        return new Rectangle(rect.x, rect.y, rect.width, 2);
    }

    getBodyRect() {
        let rect = this.getContainingRect();
        return new Rectangle(rect.x, rect.y + 2, rect.width, rect.height - 2);
    }

    getContainingRect() {
        return this.rect;
    }

    copy(keepOriginalId: boolean): Table {
        let tableRows = [];
        for (const row of this.tableRows) {
            tableRows.push(row.clone())
        }
        let copy = new Table(
            {
                id: keepOriginalId ? this.id : crypto.randomUUID(),
                rect: new Rectangle(this.rect.x, this.rect.y, this.rect.width, this.rect.height),
                head: this.head,
                tableRows: tableRows,
                color: this.color
            }
        );
        return copy;
    }

}