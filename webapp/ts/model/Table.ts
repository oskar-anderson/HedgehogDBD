import { Point } from "pixi.js";
import { MyRect } from "./MyRect";
import { CostGrid, CostGridTileTypes } from "./CostGrid";
import { TableRow } from "./TableRow";

export class Table {
    id: string = crypto.randomUUID();
    position: Point;
    head: string;
    tableRows: TableRow[];
    color: number = 0x008000;
    visible: boolean = true;
    
    /* 
    This constuctor exists for cloning, you probably want to use Table.init() 
    Treat as private constructor - this is public for JSON handling only
    */
    private constructor(table: { id: string, position: Point, head: string, tableRows: TableRow[], color: number, visible: boolean }) {
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
            color: 0x008000,
            visible: true
         });
    }

    static initClone(table: Table): Table {
        let copy = new Table(
            {
                id: table.id,
                position: new Point(table.position.x, table.position.y),
                head: table.head,
                tableRows: table.tableRows.map(x => TableRow.initClone(x)),
                color: table.color,
                visible: table.visible
            }
        );
        return copy;
    }

    initNewId() {
        this.id = crypto.randomUUID();
    }

    equals(other: Table) {
        return this.id === other.id;
    }


    getColumnWidths() {
        let datatypeRows = this.tableRows.map(x => x.datatype);
        let longestDatatypeLenght = datatypeRows.length !== 0 ? Math.max(...(datatypeRows.map(el => el.length))) : 0;

        let attributeRows = this.tableRows.map(x => x.attributes.join(", "));
        let longestAttributeLenght = attributeRows.length !== 0 ? Math.max(...(attributeRows.map(el => el.length))) : 0;

        let pad = 3;  // padding plus one non-writable wall
        return [
            this.getContainingRect().width - 1 - ((longestDatatypeLenght + pad) + (longestAttributeLenght + pad)), 
            longestDatatypeLenght + pad, 
            longestAttributeLenght + pad
        ];
    }

    getContainingRect() {
        let columnWidth = 2 + Math.max(...(this.tableRows.map(el => el.name.length))) + 3 
            + Math.max(...(this.tableRows.map(el => el.datatype.length))) + 3 + 
            Math.max(...(this.tableRows.map(el => el.attributes.join(", ").length))) + 2;
        let nameWidth = 2 + this.head.length + 2;
        return new MyRect(
            this.position.x, 
            this.position.y, 
            Math.max(columnWidth, nameWidth), 
            4 + this.tableRows.length
        );
    }

    getReferences(tables: Table[]) {
        let references = [];
        for (let tableRow of this.tableRows) {
            let matches = [...tableRow.attributes.join('').matchAll(/FK\("(\w+)"\)/g)];
            if (matches.length !== 1 || matches[0].length !== 2) {
                continue;
            }
            let fkTableName = matches[0][1];
            let targetTable = tables.find(table => table.head === fkTableName);
            if (! targetTable) { continue; }
            references.push(targetTable)
        }
        return references;
    }

    updateTableCost(costGrid: CostGrid, worldSize: MyRect) {
        let tableRect = this.getContainingRect();
        let tableRectPaddingInnerRect = new MyRect(tableRect.x - 1, tableRect.y - 1, tableRect.width + 2, tableRect.height + 2);
        let tableRectPaddingOuterRect = new MyRect(tableRect.x - 2, tableRect.y - 2, tableRect.width + 4, tableRect.height + 4);
        let tableRectPaddingInnerPoints = tableRectPaddingInnerRect.ToPoints()
            .filter((point) => 
                ! tableRect.contains(point.x, point.y) && 
                worldSize.contains(point.x, point.y)
            );
        let tableRectPaddingOuterPoints = tableRectPaddingOuterRect.ToPoints()
            .filter((point) => 
                ! tableRectPaddingInnerRect.contains(point.x, point.y) && 
                worldSize.contains(point.x, point.y)    
            );
        tableRect.ToPoints().forEach((point) => costGrid.value[point.y][point.x].push(CostGridTileTypes.WALL));
        tableRectPaddingInnerPoints.forEach((point) => costGrid.value[point.y][point.x].push(CostGridTileTypes.PADDINGINNER));
        tableRectPaddingOuterPoints.forEach((point) => costGrid.value[point.y][point.x].push(CostGridTileTypes.PADDINGOUTER));
    }
}