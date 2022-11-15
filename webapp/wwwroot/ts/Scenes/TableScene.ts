import { Container } from "pixi.js";
import { IScene } from "../Manager";


export class TableScene extends Container implements IScene {


    constructor() {
        super();
        
    }

    update(deltaMS: number): void {

    }
    initHtmlUi(): void {
        throw new Error("Method not implemented.");
    }
    destroyHtmlUi(): void {
        throw new Error("Method not implemented.");
    }


}
