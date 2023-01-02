import { extensions, InteractionManager, Application, DisplayObject, Renderer } from "pixi.js";
import { EventSystem } from '@pixi/events';

export class Manager {
    static getRenderer () {
        return this.app.renderer;
    }

    private constructor() { }

    private static app: Application;
    private static currentScene: IScene;

    private static _width: number;
    private static _height: number;


    public static get width(): number {
        return Manager._width;
    }
    public static get height(): number {
        return Manager._height;
    }


    public static initialize(width: number, height: number, background: number): void {

        Manager._width = width;
        Manager._height = height;

        extensions.remove(InteractionManager);
        Manager.app = new Application({
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
            backgroundColor: background,
            width: width,
            height: height
        });
        const { renderer } = Manager.app;        // InteractionManager with EventSystem
        renderer.addSystem(EventSystem, 'events');

        document.querySelector('.canvas-container')!.appendChild(this.app.view);
        document.querySelector('canvas')!.addEventListener('contextmenu', (e) => { e.preventDefault(); });
        document.querySelector('canvas')!.addEventListener('wheel', function(event) { event.preventDefault(); });
        this.app.view.addEventListener("click", (event) => { Manager.currentScene.mouseEventHandler(event) });
        this.app.view.addEventListener("mousedown", (event) => { Manager.currentScene.mouseEventHandler(event) });
        this.app.view.addEventListener("mouseup", (event) => { Manager.currentScene.mouseEventHandler(event) });
        
        Manager.app.ticker.add((time) => Manager.update());  // I HATE the "frame passed" approach. I would rather use `Manager.app.ticker.deltaMS`
    }

    // Call this function when you want to go to a new scene
    public static changeScene(newScene: IScene): void {
        // Remove and destroy old scene
        if (Manager.currentScene) {
            Manager.app.stage.removeChild(Manager.currentScene);
            Manager.currentScene.destroy();
            Manager.currentScene.destroyHtmlUi();
        }

        // Add the new one
        Manager.currentScene = newScene;
        Manager.app.stage.addChild(Manager.currentScene);
        newScene.init();
    }

    // This update will be called by a pixi ticker and tell the scene that a tick happened
    private static update(): void {
        if (Manager.currentScene) {
            Manager.currentScene.update(Manager.app.ticker.deltaMS);
        }
    }
}

export interface IScene extends DisplayObject {
    update(deltaMS: number): void;
    init(): void
    destroyHtmlUi(): void
    mouseEventHandler(event: MouseEvent): void
}