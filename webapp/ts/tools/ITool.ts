import { Viewport } from "pixi-viewport";
import { Draw } from "../model/Draw";
import { CreateTableTool } from "./CreateTableTool";
import { EditTableTool } from "./EditTableTool";
import { PanTool } from "./PanTool";
import { MoveTableTool } from "./MoveTableTool";

export interface ITool {
    init(): void;
    update(): void;
    exit(): void;
    getIsDirty(): boolean;
    getName(): IToolNames;
}

export enum IToolNames {
    pan = "pan",
    select = "select",
    editTable = "editTable",
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
                draw.activeTool = new MoveTableTool(draw);
                break;
            case IToolNames.editTable:
                draw.activeTool = new EditTableTool(draw);
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