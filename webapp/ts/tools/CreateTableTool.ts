import { Point, Rectangle } from "pixi.js";
import { CommandCreateTable } from "../commands/appCommands/CommandCreateTable";
import { Draw } from "../model/Draw";
import { Table } from "../model/Table";
import { TableRow } from "../model/TableRow";
import { MyRect } from "../MyRect";
import { ITool, IToolNames } from "./ITool";

export class CreateTableTool implements ITool {

    isDirty = false;
    draw: Draw;
    hover: Table | null = null;
    status = "addHover";
    constructor(draw: Draw) {
        this.draw = draw;
    }

    getName(): IToolNames {
        return IToolNames.newTable;
    }

    init(): void {

    }

    update(): void {
        let status = this.status;
        if (status === "addHover") {
            this.addHover();
        } else if (status === "mouseMove") {
            this.mouseMove();
        }
    }

    exit(): void {
        this.draw.hover = null;
        this.draw.selectedTable = null;
        this.draw.schema.tables.forEach(x => x.visible = true);
    }

    getIsDirty(): boolean {
        return this.isDirty;
    }

    addHover = () => {
        this.hover = Table.init(
            this.draw.getMouseCharGridPosition(),
            "NewTable",
            [ TableRow.init("Id", "VARCHAR", ["PK"])]
        );
        this.hover.position = this.draw.clampRect(this.draw.getWorldCharGrid(), this.hover.getContainingRect());
        this.draw.selectedTable = this.hover;
        this.draw.hover = this.hover;
        this.status = 'mouseMove';
    }

    mouseMove = () => {
        if (this.hover === null) return;
        let newPos = this.draw.clampRect(
            this.draw.getWorldCharGrid(), 
            MyRect.init(
                this.draw.getMouseCharGridPosition(), 
                this.hover.getContainingRect().getBr()
            ));
        this.isDirty = !(JSON.stringify(this.hover!.position) === JSON.stringify(newPos));
        this.hover.position = newPos;
        
        if (this.draw.isMouseLeftDown) {
            this.createTable();
        }
    };

    createTable = () => {
        let isGoodPlaceForTableFunc = () => {
            if (this.hover !== null) {
                let hoverRect = this.hover.getContainingRect();
                return this.draw.getVisibleTables()
                    .filter(x => ! x.equals(this.hover!))
                    .every(x => !x.getContainingRect().intersects(hoverRect))
            }
            return false
        }
        let isGoodPlaceForTable = isGoodPlaceForTableFunc();
        console.log(`isGoodPlaceForTable: ${isGoodPlaceForTable}`);
        let selectToolMouseUpDone = () => {
            this.status = "addHover";
            this.hover = null;
            this.isDirty = true;
            this.exit();
        }
        if (! isGoodPlaceForTable) {
            selectToolMouseUpDone();
            return;
        }

        console.log("CREATE TABLE");
        console.log(this.hover);
        this.draw.history.execute(new CommandCreateTable(
            this.draw, {
                tableJson: JSON.stringify(this.hover!)
            })
        );
        selectToolMouseUpDone();
    }
}