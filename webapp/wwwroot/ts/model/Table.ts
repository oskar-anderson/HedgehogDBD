import { Rectangle } from "pixi.js";
import { TableRow } from "./TableRow";

export class Table {
    rect: Rectangle;
    head: string;
    tableRows: TableRow[];
    
    constructor(rect: Rectangle, head: string, tableRows: TableRow[]) {
        this.rect = rect;
        this.head = head;
        this.tableRows = tableRows;
    }

    getColumnWidths() {
        let datatypeRows = this.tableRows.map(x => x.datatype);
        let longestDatatypeLenght = Math.max(...(datatypeRows.map(el => el.length)));

        let attributeRows = this.tableRows.map(x => x.attributes.join(", "));
        let longestAttributeLenght = Math.max(...(attributeRows.map(el => el.length)));

        let pad = 3;  // padding plus one non-writable wall
        return [
            this.rect.width - ((longestDatatypeLenght + pad) + (longestAttributeLenght + pad)), 
            longestDatatypeLenght + pad, 
            longestAttributeLenght + pad
        ];
    }

    getHeadRect() {
        return new Rectangle(this.rect.x, this.rect.y, this.rect.width, 2);
    }

    getBodyRect() {
        return new Rectangle(this.rect.x, this.rect.y + 2, this.rect.width, this.rect.height - 2);
    }
}