import { BitmapText, Point, Rectangle } from "pixi.js";
import { CommandCreateTable, CommandCreateTableArgs } from "../commands/appCommands/CommandCreateTable";
import { Draw } from "../model/Draw";
import { Table } from "../model/Table";
import { TableRow } from "../model/TableRow";
import { MyRect } from "../model/MyRect";
import { ITool, IToolNames } from "./ITool";
import CustomMouseEvent from "../model/MouseEvent";
import { TableDTO } from "../model/dto/TableDTO";

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
        this.hover = new Table(new Point(0, 0), "new_table", [ new TableRow("id", "VARCHAR(255)", ["PK"])], Table.initDisplayable(), undefined, undefined, true);
        this.draw.schema.tables.push(this.hover);
    }

    exit(): void {
        this.draw.schema.tables = this.draw.schema.tables.filter(x => ! x.isHover)
    }

    mouseMove(mouseCharGridX: number, mouseCharGridY: number) {
        if (this.hover === null) throw new Error("Moving new table hover with hover being null!");
        let newPos = this.getPositionInBounds(mouseCharGridX, mouseCharGridY, this.hover.getContainingRect().width, this.hover.getContainingRect().height);
        this.isDirty = ! (this.hover!.getPosition().x === newPos.x && this.hover!.getPosition().y === newPos.y);
        this.hover.setPosition(newPos, this.draw.selectedFontSize);
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
            this.draw, new CommandCreateTableArgs(TableDTO.initFromTable(this.hover!))
        ));
        this.isDirty = true;
        this.init();
    }

    mouseEventHandler(event: CustomMouseEvent): void {
        let mouseCharGrid = this.draw.getWorldToCharGridPoint(event.worldX, event.worldY);
        switch (event.type) {
            case "click": 
                this.createTable(mouseCharGrid.x, mouseCharGrid.y);
                break;
            case "mousemove":
                this.mouseMove(mouseCharGrid.x, mouseCharGrid.y);
            default:
                break;
        }
    }
}