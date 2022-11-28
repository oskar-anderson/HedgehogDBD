import { Manager } from "../Manager";
import { Draw } from "../model/Draw";
import { TableScene } from "../Scenes/TableScene";
import { ITool, IToolNames } from "./ITool";

export class EditTableTool implements ITool {
    
    draw: Draw;
    constructor(draw: Draw) {
        this.draw = draw;
    }

    getName(): IToolNames {
        return IToolNames.editTable;
    }

    init(): void {

    }

    update(): void {
        if (! this.draw.isMouseLeftDown) return;
        this.draw.isMouseLeftDown = false;
        let mouseCharGrid = this.draw.getMouseCharGridPosition();
        for (let table of this.draw.schema.tables) {
            if (table.getContainingRect().contains(mouseCharGrid.x, mouseCharGrid.y)) {
                this.draw.selectedTable = table;
                this.draw.viewportDTO = { 
                    viewportLeft: this.draw.getScreen().x, 
                    viewportTop: this.draw.getScreen().y, 
                    viewportScale: this.draw.getScale(), 
                }
                Manager.changeScene(new TableScene(this.draw, this.draw.selectedTable),)
            }
        }
    }
    
    exit(): void {

    }

    getIsDirty(): boolean {
        return false;
    }


}