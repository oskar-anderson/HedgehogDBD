import { Viewport } from "pixi-viewport";
import { Draw } from "../model/Draw";
import { CreateTableTool } from "./CreateTableTool";
import { PanTool } from "./PanTool";
import { SelectTableTool } from "./MoveTableTool";

export interface ITool {
    init(): void;
    update(): void;
    exit(): void;
    getIsDirty(): boolean;
    getName(): IToolNames;
    mouseEventHandler(event: MouseEvent): void
}

export enum IToolNames {
    pan = "pan",
    select = "select",
    newTable = "newTable",
}

export class IToolManager {


    static toolActivate(draw: Draw, tool: IToolNames, options: { viewport: Viewport }) {
        if (draw.activeTool) {
            draw.activeTool.exit();
        }
        switch(tool) {
            case IToolNames.pan:
                draw.activeTool = new PanTool(options.viewport);
                break;
            case IToolNames.select:
                draw.activeTool = new SelectTableTool(draw);
                break;
            case IToolNames.newTable:
                draw.activeTool = new CreateTableTool(draw);
                break;
            default:
                throw Error(`toolActivate. Tool: '${tool}' does not exist!`);
        }
        draw.activeTool!.init();
    }
}