
import { extensions, InteractionManager, Application, DisplayObject, settings, PRECISION, SCALE_MODES } from "pixi.js";
import { EventSystem } from '@pixi/events';
import { AppState } from "./components/MainContent";
import { Draw } from "./model/Draw";

export class Manager {

    private app: Application;
    private currentScene: IScene | null = null;
    /**
     * For accessing state inside React components. Query for every operation separately, not once for entire component.
     */
    public draw: Draw;
    public onSceneChange: ((newScene: IScene) => void)

    private static instance: Manager;

    public static getInstance(): Manager {
        if (this.instance === null) {
            throw new Error();
        }
        return this.instance;
    }

    public static constructInstance(
        width: number, 
        height: number, 
        background: number, 
        draw: Draw, 
        onSceneChange: (newScene: IScene) => void
        ): void {
        this.instance = new Manager(width, height, background, draw, onSceneChange);

    }

    private constructor(width: number, height: number, background: number, draw: Draw, onSceneChange: ((newScene: IScene) => void)
        ) {
        this.draw = draw;
        this.onSceneChange = onSceneChange;
        extensions.remove(InteractionManager);
        this.app = new Application({
            backgroundColor: background,
            width: width,
            height: height,
        });
        this.app.renderer.addSystem(EventSystem, 'events');        // InteractionManager with EventSystem

        // this.app.view.addEventListener('contextmenu', (e) => { e.preventDefault(); });
        // this.app.view.addEventListener('wheel', (e) => { e.preventDefault(); });
    }

    public getRenderer() {
        return this.app.renderer;
    }

    public getView() {
        return this.app.view;
    }

    public getApp() {
        return this.app;
    }

    // Call this function when you want to go to a new scene
    public changeScene(newScene: IScene): void {
        console.log(`changeScene: ${this.currentScene === null ? "null" : AppState[this.currentScene.getState()]} -> ${AppState[newScene.getState()]}`);

        // Remove and destroy old scene
        if (this.currentScene) {
            this.app.stage.removeChild(this.currentScene);
            this.currentScene.destroy();
        }

        // Add the new one
        this.currentScene = newScene;
        this.app.stage.addChild(this.currentScene);
        this.onSceneChange(newScene);
    }

    public getScene(): IScene | null {
        return this.currentScene;
    }
}

export interface IScene extends DisplayObject {
    getState(): AppState
}