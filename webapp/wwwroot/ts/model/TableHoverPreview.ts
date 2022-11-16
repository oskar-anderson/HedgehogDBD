import { Table } from "./Table";

export class TableHoverPreview {
    hoverDragTable: Table;
    hoverDragTableSource: Table;
    hoverTablePivotX: number;
    hoverTablePivotY: number;

    constructor(hoverDragTable: Table, hoverDragTableSource: Table, hoverTablePivotX: number, hoverTablePivotY: number) {
        this.hoverDragTable = hoverDragTable;
        this.hoverDragTableSource = hoverDragTableSource;
        this.hoverTablePivotX = hoverTablePivotX;
        this.hoverTablePivotY = hoverTablePivotY;
    }
}