import { Container, Graphics, Loader } from "pixi.js";
import { IScene, Manager } from "../Manager";
import { DrawScene } from "./DrawScene";
import { Draw } from "../model/Draw";
import { RefObject } from "react";
import { AppState } from "../components/MainContent";

export class LoaderScene extends Container implements IScene {

    // for making our loader graphics...
    private loaderBar: Container;
    private loaderBarBorded: Graphics;
    private loaderBarFill: Graphics;

    constructor() {
        super();
        Manager.getInstance().scrollTo(0, 0);
        const loaderBarWidth = Manager.getInstance().getScreen().width * 0.8;

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
        this.loaderBar.position.x = (Manager.getInstance().getScreen().width - this.loaderBar.width) / 2;
        this.loaderBar.position.y = (Manager.getInstance().getScreen().height - this.loaderBar.height) / 2;
        this.addChild(this.loaderBar);

        Loader.shared.add('../wwwroot/font/consolas/consolas-7-xml-white-text-with-alpha-padding0-spacing1.fnt');
        Loader.shared.add('../wwwroot/font/consolas/consolas-8-xml-white-text-with-alpha-padding0-spacing1.fnt');
        Loader.shared.add('../wwwroot/font/consolas/consolas-9-xml-white-text-with-alpha-padding0-spacing1.fnt');
        Loader.shared.add('../wwwroot/font/consolas/consolas-10-xml-white-text-with-alpha-padding0-spacing1.fnt');
        Loader.shared.add('../wwwroot/font/consolas/consolas-11-xml-white-text-with-alpha-padding0-spacing1.fnt');
        Loader.shared.add('../wwwroot/font/consolas/consolas-12-xml-white-text-with-alpha-padding0-spacing1.fnt');
        Loader.shared.add('../wwwroot/font/consolas/consolas-14-xml-white-text-with-alpha-padding0-spacing1.fnt');
        Loader.shared.add('../wwwroot/font/consolas/consolas-16-xml-white-text-with-alpha-padding0-spacing1.fnt');
        Loader.shared.add('../wwwroot/font/consolas/consolas-18-xml-white-text-with-alpha-padding0-spacing1.fnt');
        Loader.shared.add('../wwwroot/font/consolas/consolas-20-xml-white-text-with-alpha-padding0-spacing1.fnt');
        Loader.shared.add('../wwwroot/font/consolas/consolas-22-xml-white-text-with-alpha-padding0-spacing1.fnt');
        Loader.shared.add('../wwwroot/font/consolas/consolas-24-xml-white-text-with-alpha-padding0-spacing1.fnt');
        
        Loader.shared.onProgress.add((loader) => {
            let progressRatio = loader.progress / 100;
            this.loaderBarFill.scale.x = progressRatio;
        });
        Loader.shared.onComplete.once((loader) => { 
            let scene = new DrawScene()
            Manager.getInstance().changeScene(scene);
        });

        Loader.shared.load();
    }

    mouseEventHandler(event: MouseEvent): void {
        throw new Error("Method not implemented.");
    }
    
    init(): void {

    }

    update(deltaMS: number): void {
        // To be a scene we must have the update method even if we don't use it.
    }

        
    getState(): AppState {
        return AppState.LoaderScene;
    }
}
