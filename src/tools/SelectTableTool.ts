import { Draw } from "../model/Draw";
import { CommandMoveTableRelative, CommandMoveTableRelativeArgs } from "../commands/appCommands/CommandMoveTableRelative";
import { Table } from "../model/Table";
import { ITool, IToolNames } from "./ITool";
import { Manager } from "../Manager";
import { TableScene } from "../scenes/TableScene";
import { MyMouseEvent } from "../model/MyMouseEvent";
import { Point } from "pixi.js";
import { TableDTO } from "../model/dto/TableDTO";

export class SelectTableTool implements ITool {

    isDirty = false;
    draw: Draw;
    hover: { 
        hoverTable: Table;
        hoverTableOriginalPosition: Point;
        hoverTablePivot: Point;
    } | null = null;

    constructor(draw: Draw) {
        this.draw = draw;
    }

    getName(): IToolNames {
        return IToolNames.select;
    }

    init() {

    }

    exit() {

    }

    mouseDown(mouseCharGridX: number, mouseCharGridY: number) {
        /** 
            The mouseUp will not register unless it is inside the canvas.
            It is possible that the user selected a table by holding down left mouse and 
            dragged it off the canvas and let go of left mouse. 
        */
        if (this.hover !== null) return
        this.isDirty = false;
        for (let table of this.draw.schema.getTables()) {
            if (table.getContainingRect().contains(mouseCharGridX, mouseCharGridY)) {
                this.hover = { 
                    hoverTable: table, 
                    hoverTableOriginalPosition: table.getPosition().clone(),
                    hoverTablePivot: new Point(table.getPosition().x - mouseCharGridX, table.getPosition().y - mouseCharGridY)
                }
                this.hover.hoverTable.setIsHover(true, this.draw.schema.getTables());
                this.isDirty = true;
                return;
            }
        }
    }

    updateHoverTablePosition(mouseCharGridX: number, mouseCharGridY: number) {
        if (this.hover === null) throw Error("Trying to update hover table with hover table being null");
        let newX = Math.max(0, Math.min(this.draw.getWorldCharGrid().width - this.hover.hoverTable.getContainingRect().width, mouseCharGridX + this.hover.hoverTablePivot.x));
        let newY = Math.max(0, Math.min(this.draw.getWorldCharGrid().height - this.hover.hoverTable.getContainingRect().height, mouseCharGridY + this.hover.hoverTablePivot.y));
        this.isDirty = !(this.hover.hoverTable!.getPosition().x === newX && this.hover.hoverTable!.getPosition().y === newY);
        this.hover.hoverTable!.setPosition(new Point(newX, newY), this.draw.selectedFontSize);
    };

    mouseEventUp(mouseCharGridX: number, mouseCharGridY: number) {
        if (this.hover === null) return;
        this.updateHoverTablePosition(mouseCharGridX, mouseCharGridY);
        let isGoodPlaceForTableFunc = () => {
            let hoverRect = this.hover!.hoverTable.getContainingRect();
            return this.draw.getVisibleTables()
                .filter(x => ! x.equals(this.hover!.hoverTable))
                .every(x => !x.getContainingRect().intersects(hoverRect))
        }
        let isGoodPlaceForTable = isGoodPlaceForTableFunc();
        let mouseUpDone = () => {
            this.hover!.hoverTable.setIsHover(false, this.draw.schema.getTables());
            this.hover = null;
            this.isDirty = true;
            this.exit();
        }
        if (! isGoodPlaceForTable) {
            this.hover.hoverTable.setPosition(this.hover.hoverTableOriginalPosition, this.draw.selectedFontSize);
            mouseUpDone();
            return;
        }
        let diff = this.hover.hoverTable.getPosition().clone().subtract(this.hover.hoverTableOriginalPosition);
        if (diff.equals(new Point(0, 0))) {
            mouseUpDone();
            return;
        }
        this.hover.hoverTable.setPosition(this.hover.hoverTableOriginalPosition, this.draw.selectedFontSize);
        this.draw.history.execute(new CommandMoveTableRelative(
            this.draw, new CommandMoveTableRelativeArgs(this.hover.hoverTable.id, diff.x, diff.y)
        ));
        mouseUpDone();
    }

    mouseEventHandler(event: MyMouseEvent): void {
        let mouseCharGrid = this.draw.getWorldToCharGridPoint(event.worldX, event.worldY);
        switch (event.type) {
            case "mousedown":
                this.mouseDown(mouseCharGrid.x, mouseCharGrid.y);
                break;
            case "mouseup":
                if (this.hover === null) return;
                this.mouseEventUp(mouseCharGrid.x, mouseCharGrid.y);
                break;
            case "click": 
                if (event.detail === 2) {  // double click
                    let selectedTable = this.draw.schema.getTables().find(table => table.getContainingRect().contains(mouseCharGrid.x, mouseCharGrid.y))
                    if (! selectedTable) { break; }
                    Manager.getInstance().changeScene(new TableScene(TableDTO.initFromTable(selectedTable)));
                }
                break;
            case "mousemove":
                if (this.hover === null) return
                this.updateHoverTablePosition(mouseCharGrid.x, mouseCharGrid.y);
            default:
                break;
        }
    }
}