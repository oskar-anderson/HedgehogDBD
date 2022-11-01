import { Rectangle } from "pixi.js";
import { TableRow } from "./TableRow";

export class Table {
    rect: Rectangle;
    head: string;
    tableRows: TableRow[];
    color: string = "";
    isHoverSource = false;
    isHoverTarget = false;
    
    constructor(table: { rect: Rectangle, head: string, tableRows: TableRow[] }) {
        this.rect = table.rect;
        this.head = table.head;
        this.tableRows = table.tableRows;
    }

    getColumnWidths() {
        let datatypeRows = this.tableRows.map(x => x.datatype);
        let longestDatatypeLenght = Math.max(...(datatypeRows.map(el => el.length)));

        let attributeRows = this.tableRows.map(x => x.attributes.join(", "));
        let longestAttributeLenght = Math.max(...(attributeRows.map(el => el.length)));

        let pad = 3;  // padding plus one non-writable wall
        return [
            this.getCornerRect().width - ((longestDatatypeLenght + pad) + (longestAttributeLenght + pad)), 
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

    getCornerRect() {
        return new Rectangle(this.rect.x, this.rect.y, this.rect.width - 1, this.rect.height - 1);
    }

    copy(): Table {
        let copy1 = new Table(structuredClone(this));
        let copy = new Table(
            {
                rect: new Rectangle(this.rect.x, this.rect.y, this.rect.width, this.rect.height),
                head: this.head,
                tableRows: this.tableRows
            }
        );
        console.log(copy1)
        console.log(copy)
        return copy;
    }

    moveRelative(x: number, y: number) {
        this.rect.x += x;
        this.rect.y += y;
    }
}