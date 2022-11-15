import { Container, Graphics, Loader } from "pixi.js";
import { IScene, Manager } from "../Manager";
import { DrawScene } from "./DrawScene";
import { Table } from "../model/Table";
import { Schema } from "../model/Schema";

export class LoaderScene extends Container implements IScene {

    // for making our loader graphics...
    private loaderBar: Container;
    private loaderBarBorded: Graphics;
    private loaderBarFill: Graphics;

    private schema: Schema;

    constructor(schema: Schema) {
        super();
        this.schema = schema;

        const loaderBarWidth = Manager.width * 0.8;

        this.loaderBarFill = new Graphics();
        this.loaderBarFill.beginFill(0x008800, 1)
        this.loaderBarFill.drawRect(0, 0, loaderBarWidth, 50);
        this.loaderBarFill.endFill();
        this.loaderBarFill.scale.x = 0;

        this.loaderBarBorded = new Graphics();
        this.loaderBarBorded.lineStyle(10, 0x0, 1);
        this.loaderBarBorded.drawRect(0, 0, loaderBarWidth, 50);

        this.loaderBar = new Container();
        this.loaderBar.addChild(this.loaderBarFill);
        this.loaderBar.addChild(this.loaderBarBorded);
        this.loaderBar.position.x = (Manager.width - this.loaderBar.width) / 2;
        this.loaderBar.position.y = (Manager.height - this.loaderBar.height) / 2;
        this.addChild(this.loaderBar);

        Loader.shared.add('../wwwroot/font/ps2p/consolas-14-xml-white-text-with-alpha-padding0-spacing1.fnt');
        
        Loader.shared.onProgress.add((loader) => {
            let progressRatio = loader.progress / 100;
            this.loaderBarFill.scale.x = progressRatio;
        });
        Loader.shared.onComplete.once((loader) => { 
            Manager.changeScene(new DrawScene(this.schema));
        });

        Loader.shared.load();
    }
    
    destroyHtmlUi(): void {

    }
    
    initHtmlUi(): void {

    }

    public update(deltaMS: number): void {
        // To be a scene we must have the update method even if we don't use it.
    }
}
