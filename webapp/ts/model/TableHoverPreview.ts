import { Table } from "./Table";

export class TableHoverPreview {
    hoverTable: Table;
    hoverTableSource: Table | null = null;
    hoverTablePivotX: number;
    hoverTablePivotY: number;

    constructor(hoverDragTable: Table, hoverDragTableSource: Table | null, hoverTablePivotX: number, hoverTablePivotY: number) {
        this.hoverTable = hoverDragTable;
        this.hoverTableSource = hoverDragTableSource;
        this.hoverTablePivotX = hoverTablePivotX;
        this.hoverTablePivotY = hoverTablePivotY;
    }
}