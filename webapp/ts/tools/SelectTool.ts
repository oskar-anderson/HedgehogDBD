import { Draw } from "../model/Draw";
import { InteractionEvent, interactiveTarget } from "pixi.js";
import { CommandMoveTableRelative } from "../commands/appCommands/CommandMoveTableRelative";
import { Table } from "../model/Table";
import { TableHoverPreview } from "../model/TableHoverPreview";
import { ITool, IToolNames } from "./ITool";
import { MyRect } from "../MyRect";

export class SelectTool implements ITool {

    isDirty = false;
    draw: Draw;
    hover: TableHoverPreview | null = null;
    status: string = "mouseDown"
    constructor(draw: Draw) {
        this.draw = draw;
    }

    getName(): IToolNames {
        return IToolNames.select;
    }

    init() {

    }

    update() {
        if (this.status === "mouseDown" && this.draw.isMouseLeftDown) {
            this.mouseDown();
        } else if (this.status === "selectToolMouseMove") {
            this.selectToolMouseMove()
        } else {
            this.isDirty = false;
        }
    }

    exit() {
        this.draw.hover = null;
        this.draw.selectedTable = null;
        this.draw.schema.tables.forEach(x => x.visible = true);
    }

    getIsDirty(): boolean {
        return this.isDirty;
    }

    mouseDown = () => {
        this.isDirty = false;
        let mouseCharGrid = this.draw.getMouseCharGridPosition();
        for (let table of this.draw.schema.tables) {
            if (table.getContainingRect().contains(mouseCharGrid.x, mouseCharGrid.y)) {
                let hover = Table.initClone(table);
                hover.initNewId();
                this.draw.selectedTable = hover;
                this.draw.hover = hover;
                table.visible = false;
                this.hover = new TableHoverPreview(hover, table, table.position.x - mouseCharGrid.x, table.position.y - mouseCharGrid.y);
                this.status = 'selectToolMouseMove';
                return;
            }
        }
    }

    selectToolMouseMove = () => {
        if (! this.hover) return;
        let mouseCharGrid = this.draw.getMouseCharGridPosition();
        let newX = Math.max(0, Math.min(this.draw.getWorldCharGrid().width - this.hover.hoverTable.getContainingRect().width, mouseCharGrid.x + this.hover.hoverTablePivotX));
        let newY = Math.max(0, Math.min(this.draw.getWorldCharGrid().height - this.hover.hoverTable.getContainingRect().height, mouseCharGrid.y + this.hover.hoverTablePivotY));
        this.isDirty = !(this.hover.hoverTable!.position.x === newX && this.hover.hoverTable!.position.y === newY);
        this.hover.hoverTable!.position.x = newX;
        this.hover.hoverTable!.position.y = newY;
        
        if (! this.draw.isMouseLeftDown) {
            this.selectToolMouseUp();
        }
    };

    selectToolMouseUp = () => {
        let isGoodPlaceForTableFunc = () => {
            if (this.hover !== null) {
                let hoverRect = this.hover.hoverTable.getContainingRect();
                return this.draw.getVisibleTables()
                    .filter(x => x.id !== this.hover!.hoverTable.id)
                    .every(x => !x.getContainingRect().intersects(hoverRect))
            }
            return false
        }
        let isGoodPlaceForTable = isGoodPlaceForTableFunc();
        console.log(`isGoodPlaceForTable: ${isGoodPlaceForTable}`);
        let selectToolMouseUpDone = () => {
            this.status = "mouseDown";
            this.hover = null;
            this.isDirty = true;
            this.exit();
        }
        if (! isGoodPlaceForTable) {
            selectToolMouseUpDone();
            return;
        }

        let xDiff = this.hover!.hoverTable.position.x - this.hover!.hoverTableSource!.position.x;
        let yDiff = this.hover!.hoverTable.position.y - this.hover!.hoverTableSource!.position.y;
        
        this.draw.history.execute(new CommandMoveTableRelative(
            this.draw, {
                id: this.hover!.hoverTableSource!.id,
                x: xDiff, 
                y: yDiff
            })
        );
        selectToolMouseUpDone();
    }
}