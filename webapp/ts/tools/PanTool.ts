import { Viewport } from "pixi-viewport";
import { ITool, IToolNames } from "./ITool";

export class PanTool implements ITool {
    
    viewport: Viewport;
    isDirty = false;
    constructor(viewport: Viewport) {
        this.viewport = viewport;
    }

    getName(): IToolNames {
        return IToolNames.pan;
    }

    init() {
        this.viewport.plugins.get("drag")!.resume();
    }

    update() {
        
    }

    exit() {
        this.viewport.plugins.get("drag")!.pause();
    }

    mouseEventHandler(event: MouseEvent): void {
        
    }
}