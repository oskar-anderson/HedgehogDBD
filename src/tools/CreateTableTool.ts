import { Point, Rectangle } from "pixi.js";
import { CommandCreateTable } from "../commands/appCommands/CommandCreateTable";
import { Draw } from "../model/Draw";
import { Table } from "../model/Table";
import { TableRow } from "../model/TableRow";
import { MyRect } from "../model/MyRect";
import { ITool, IToolNames } from "./ITool";
import CustomMouseEvent from "../model/MouseEvent";

export class CreateTableTool implements ITool {

    isDirty = false;
    draw: Draw;
    hover: Table | null = null;
    constructor(draw: Draw) {
        this.draw = draw;
    }

    getName(): IToolNames {
        return IToolNames.newTable;
    }

    init(): void {
        this.hover = new Table(new Point(0, 0), "new_table", [ TableRow.init("id", "VARCHAR(255)", ["PK"])], undefined, undefined, true);
        this.draw.selectedTable = this.hover;
        this.draw.schema.tables.push(this.hover);
    }

    update(screenX: number, screenY: number, worldX: number, worldY: number): void {
        let mouseCharGrid = this.draw.getWorldToCharGridPoint(worldX, worldY);
        this.mouseMove(mouseCharGrid.x, mouseCharGrid.y);
    }

    exit(): void {
        this.draw.selectedTable = null;
        this.draw.schema.tables = this.draw.schema.tables.filter(x => ! x.isHover)
    }

    mouseMove(mouseCharGridX: number, mouseCharGridY: number) {
        if (this.hover === null) throw new Error("Moving new table hover with hover being null!");
        let newPos = this.getPositionInBounds(mouseCharGridX, mouseCharGridY, this.hover.getContainingRect().width, this.hover.getContainingRect().height);
        this.isDirty = ! (this.hover!.position.x === newPos.x && this.hover!.position.y === newPos.y);
        this.hover.position = newPos;
    };

    getPositionInBounds(x: number, y: number, width: number, height: number) {
        const drawableArea = this.draw.getWorldCharGrid();
        let fit = drawableArea.intersection(new MyRect(x, y, width, height));
        let newPos = new Point(fit.x - width + fit.width, fit.y - height + fit.height);
        return newPos;
    }

    createTable(mouseCharGridX: number, mouseCharGridY: number) {
        this.mouseMove(mouseCharGridX, mouseCharGridY);
        let hoverRect = this.hover!.getContainingRect();
        let isGoodPlaceForTable = this.draw.getVisibleTables()
            .filter(x => ! x.equals(this.hover!))
            .every(x => !x.getContainingRect().intersects(hoverRect));
        if (! isGoodPlaceForTable) {
            return;
        }

        this.draw.schema.tables = this.draw.schema.tables.filter(x => ! x.isHover)
        this.hover!.isHover = false;
        this.draw.history.execute(new CommandCreateTable(
            this.draw, {
                tableJson: JSON.stringify(this.hover!)
            })
        );
        this.isDirty = true;
        this.init();
    }

    mouseEventHandler(event: CustomMouseEvent): void {
        switch (event.type) {
            case "click": 
                let mouseCharGrid = this.draw.getWorldToCharGridPoint(event.worldX, event.worldY);
                this.createTable(mouseCharGrid.x, mouseCharGrid.y);
                break;
            default:
                break;
        }
    }
}