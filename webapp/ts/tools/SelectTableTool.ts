import { Draw } from "../model/Draw";
import { CommandMoveTableRelative } from "../commands/appCommands/CommandMoveTableRelative";
import { Table } from "../model/Table";
import { TableHoverPreview } from "../model/TableHoverPreview";
import { ITool, IToolNames } from "./ITool";
import { Manager } from "../Manager";
import { TableScene } from "../Scenes/TableScene";

export class SelectTableTool implements ITool {

    isDirty = false;
    draw: Draw;
    hover: TableHoverPreview | null = null;
    isMouseDown = false;
    constructor(draw: Draw) {
        this.draw = draw;
    }

    getName(): IToolNames {
        return IToolNames.select;
    }

    init() {

    }

    update() {
        if (this.isMouseDown) {
            let mouseCharGrid = this.draw.getMouseCharGridPosition();
            this.updateHoverTablePosition(mouseCharGrid.x, mouseCharGrid.y);
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
                this.isMouseDown = true;
                return;
            }
        }
    }

    updateHoverTablePosition(mouseCharGridX: number, mouseCharGridY: number) {
        if (! this.hover) throw Error("Trying to update hover table with hover table being null");
        let newX = Math.max(0, Math.min(this.draw.getWorldCharGrid().width - this.hover.hoverTable.getContainingRect().width, mouseCharGridX + this.hover.hoverTablePivotX));
        let newY = Math.max(0, Math.min(this.draw.getWorldCharGrid().height - this.hover.hoverTable.getContainingRect().height, mouseCharGridY + this.hover.hoverTablePivotY));
        this.isDirty = !(this.hover.hoverTable!.position.x === newX && this.hover.hoverTable!.position.y === newY);
        this.hover.hoverTable!.position.x = newX;
        this.hover.hoverTable!.position.y = newY;
    };

    mouseEventUp(mouseCharGridX: number, mouseCharGridY: number) {
        this.updateHoverTablePosition(mouseCharGridX, mouseCharGridY);
        let isGoodPlaceForTableFunc = () => {
            if (this.hover !== null) {
                let hoverRect = this.hover.hoverTable.getContainingRect();
                return this.draw.getVisibleTables()
                    .filter(x => ! x.equals(this.hover!.hoverTable))
                    .every(x => !x.getContainingRect().intersects(hoverRect))
            }
            return false
        }
        let isGoodPlaceForTable = isGoodPlaceForTableFunc();
        console.log(`isGoodPlaceForTable: ${isGoodPlaceForTable}`);
        let mouseUpDone = () => {
            this.isMouseDown = false;
            this.hover = null;
            this.isDirty = true;
            this.exit();
        }
        if (! isGoodPlaceForTable) {
            mouseUpDone();
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
        this.draw.schema.relations.forEach(relation => relation.isDirty = true);
        mouseUpDone();
    }

    mouseEventHandler(event: MouseEvent): void {
        let rect = (event.currentTarget! as Element).getBoundingClientRect();
        let relativeX = Math.round(event.clientX - rect.x);
        let relativeY = Math.round(event.clientY - rect.y);
        switch (event.type) {
            case "mousedown":
                this.mouseDown();
                break;
            case "mouseup":
                if (this.isMouseDown) {
                    let mouseCharGrid = this.draw.getMouseCharGridPositionFromScreenPosition(relativeX, relativeY);
                    console.log(`mouseCharGrid.x: ${mouseCharGrid.x}, mouseCharGrid.y: ${mouseCharGrid.y}`)
                    this.mouseEventUp(mouseCharGrid.x, mouseCharGrid.y);
                }
                break;
            case "click": 
                if (event.detail === 2) {  // double click
                    let mouseCharGrid = this.draw.getMouseCharGridPosition();
                    let selectedTable = this.draw.schema.tables.find(table => table.getContainingRect().contains(mouseCharGrid.x, mouseCharGrid.y))
                    if (! selectedTable) { break; }
                    this.draw.selectedTable = selectedTable;
                    this.draw.viewportDTO = { 
                        viewportLeft: this.draw.getScreen().x, 
                        viewportTop: this.draw.getScreen().y, 
                        viewportScale: this.draw.getScale(), 
                    }
                    Manager.changeScene(new TableScene(this.draw, this.draw.selectedTable));
                }
                break;
            default:
                break;
        }
    }
}