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
    constructor(draw: Draw) {
        this.draw = draw;
    }

    getName(): IToolNames {
        return IToolNames.newTable;
    }

    init(): void {
        this.hover = Table.init(
            this.draw.getMouseCharGridPosition(),
            "NewTable",
            [ TableRow.init("Id", "VARCHAR(255)", ["PK"])]
        );
        this.hover.position = this.draw.clampRect(this.draw.getWorldCharGrid(), this.hover.getContainingRect());
        this.draw.selectedTable = this.hover;
        this.draw.hover = this.hover;
    }

    update(): void {
        let mouseCharGrid = this.draw.getMouseCharGridPosition();
        this.mouseMove(mouseCharGrid.x, mouseCharGrid.y);
    }

    exit(): void {
        this.draw.selectedTable = null;
        this.draw.hover = null;
    }

    getIsDirty(): boolean {
        return this.isDirty;
    }

    mouseMove(mouseCharGridX: number, mouseCharGridY: number) {
        if (this.hover === null) throw new Error("Moving new table hover with hover being null!");
        let newPos = this.draw.clampRect(
            this.draw.getWorldCharGrid(), 
            new MyRect(
                mouseCharGridX, 
                mouseCharGridY, 
                this.hover.getContainingRect().width,
                this.hover.getContainingRect().height
            ));
        this.isDirty = ! (this.hover!.position.x === newPos.x && this.hover!.position.y === newPos.y);
        this.hover.position = newPos;
    };

    createTable(mouseCharGridX: number, mouseCharGridY: number) {
        this.mouseMove(mouseCharGridX, mouseCharGridY);
        let hoverRect = this.hover!.getContainingRect();
        let isGoodPlaceForTable = this.draw.getVisibleTables()
            .filter(x => ! x.equals(this.hover!))
            .every(x => !x.getContainingRect().intersects(hoverRect));
        if (! isGoodPlaceForTable) {
            return;
        }

        console.log("CREATE TABLE");
        console.log(this.hover);
        this.draw.history.execute(new CommandCreateTable(
            this.draw, {
                tableJson: JSON.stringify(this.hover!)
            })
        );
        this.isDirty = true;
        this.init();
    }

    mouseEventHandler(event: MouseEvent): void {
        let rect = (event.currentTarget! as Element).getBoundingClientRect();
        let relativeX = Math.round(event.clientX - rect.x);
        let relativeY = Math.round(event.clientY - rect.y);
        switch (event.type) {
            case "click": 
                let mouseCharGrid = this.draw.getMouseCharGridPositionFromScreenPosition(relativeX, relativeY);
                this.createTable(mouseCharGrid.x, mouseCharGrid.y);
                break;
            default:
                break;
        }
    }
}