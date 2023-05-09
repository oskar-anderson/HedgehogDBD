import { Draw } from "../model/Draw";
import { CommandMoveTableRelative } from "../commands/appCommands/CommandMoveTableRelative";
import { Table } from "../model/Table";
import { ITool, IToolNames } from "./ITool";
import { Manager } from "../Manager";
import { TableScene } from "../scenes/TableScene";
import CustomMouseEvent from "../model/MouseEvent";
import { Point } from "pixi.js";
import { TableDTO } from "../model/TableDTO";

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

    update(screenX: number, screenY: number, worldX: number, worldY: number) {
        if (this.hover === null) return
        let mouseCharGrid = this.draw.getWorldToCharGridPoint(worldX, worldY);
        this.updateHoverTablePosition(mouseCharGrid.x, mouseCharGrid.y);
        
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
        for (let table of this.draw.schema.tables) {
            if (table.getContainingRect().contains(mouseCharGridX, mouseCharGridY)) {
                this.hover = { 
                    hoverTable: table, 
                    hoverTableOriginalPosition: new Point(table.position.x, table.position.y),
                    hoverTablePivot: new Point(table.position.x - mouseCharGridX, table.position.y - mouseCharGridY)
                }
                return;
            }
        }
    }

    updateHoverTablePosition(mouseCharGridX: number, mouseCharGridY: number) {
        if (this.hover === null) throw Error("Trying to update hover table with hover table being null");
        let newX = Math.max(0, Math.min(this.draw.getWorldCharGrid().width - this.hover.hoverTable.getContainingRect().width, mouseCharGridX + this.hover.hoverTablePivot.x));
        let newY = Math.max(0, Math.min(this.draw.getWorldCharGrid().height - this.hover.hoverTable.getContainingRect().height, mouseCharGridY + this.hover.hoverTablePivot.y));
        this.isDirty = !(this.hover.hoverTable!.position.x === newX && this.hover.hoverTable!.position.y === newY);
        this.hover.hoverTable!.position.x = newX;
        this.hover.hoverTable!.position.y = newY;
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
            this.hover = null;
            this.isDirty = true;
            this.exit();
        }
        if (! isGoodPlaceForTable) {
            this.hover.hoverTable.position = this.hover.hoverTableOriginalPosition;
            mouseUpDone();
            return;
        }
        let diff = this.hover.hoverTable.position.subtract(this.hover.hoverTableOriginalPosition);
        if (diff.equals(new Point(0, 0))) { 
            mouseUpDone();
            return;
        }
        this.hover.hoverTable.position = this.hover.hoverTableOriginalPosition;
        this.draw.history.execute(new CommandMoveTableRelative(
            this.draw, {
                id: this.hover.hoverTable.id,
                x: diff.x, 
                y: diff.y
            })
        );
        this.draw.schema.relations.forEach(relation => relation.isDirty = true);
        mouseUpDone();
    }

    mouseEventHandler(event: CustomMouseEvent): void {
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
                    let selectedTable = this.draw.schema.tables.find(table => table.getContainingRect().contains(mouseCharGrid.x, mouseCharGrid.y))
                    if (! selectedTable) { break; }
                    Manager.getInstance().changeScene(new TableScene(TableDTO.initFromTable(selectedTable)));
                }
                break;
            default:
                break;
        }
    }
}