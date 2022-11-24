import { Viewport } from "pixi-viewport";
import { ITool } from "./ITool";

export class PanTool implements ITool {
    
    viewport: Viewport;
    constructor(viewport: Viewport) {
        this.viewport = viewport;
    }

    init() {
        this.viewport.plugins.get("drag")!.resume();
    }

    update() {

    }

    exit() {
        this.viewport.plugins.get("drag")!.pause();
    }
    
    getIsDirty(): boolean {
        return false;
    }
}