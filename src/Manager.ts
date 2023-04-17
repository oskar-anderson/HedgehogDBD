import { extensions, InteractionManager, Application, DisplayObject } from "pixi.js";
import { EventSystem } from '@pixi/events';
import { MyRect } from "./model/MyRect";
import { useAppStateManagement } from "./Store";
import { AppState } from "./components/MainContent";
import { Draw } from "./model/Draw";

export class Manager {

    private app: Application;
    private currentScene: IScene | null = null;
    public updateFunc: (deltaMs: number) => void = () => { };
    public draw: Draw;
    private canvasContainerRef: React.RefObject<HTMLDivElement>;

    private static instance: Manager;

    public static getInstance(): Manager {
        if (this.instance === null) {
            throw new Error();
        }
        return this.instance;
    }

    public static constructInstance(width: number, height: number, background: number, draw: Draw): void {
        const { canvasContainerRef } = useAppStateManagement();
        this.instance = new Manager(width, height, background, canvasContainerRef, draw);
    }

    private constructor(width: number, height: number, background: number, canvasContainerRef: React.RefObject<HTMLDivElement>, draw: Draw) {
        this.draw = draw;
        this.canvasContainerRef = canvasContainerRef;
        this.app = new Application({
            backgroundColor: background,
            width: width,
            height: height
        });
        extensions.remove(InteractionManager);
        this.app.renderer.addSystem(EventSystem, 'events');        // InteractionManager with EventSystem

        this.app.view.addEventListener('contextmenu', (e) => { e.preventDefault(); });
        this.app.view.addEventListener('wheel', function(event) { event.preventDefault(); });

        this.app.ticker.add((time) => { this.update() });
        canvasContainerRef.current?.appendChild(this.app.view);
    }

    public getScreen() {
        const { scrollLeft, scrollTop, getBoundingClientRect } = this.canvasContainerRef.current!;
        return new MyRect(scrollLeft, scrollTop, getBoundingClientRect().width, getBoundingClientRect().height);
    }

    public scrollTo(worldX: number, worldY: number) {
        this.canvasContainerRef.current!.scrollTo(worldX, worldY);
    }

    public scrollBy(worldX: number, worldY: number) {
        this.canvasContainerRef.current!.scrollBy(worldX, worldY);
    }

    public getRenderer() {
        return this.app.renderer;
    }

    // Call this function when you want to go to a new scene
    public changeScene(newScene: IScene): void {
        const { setAppState, setIsTopToolbarVisible } = useAppStateManagement();
        setIsTopToolbarVisible(false);

        // Remove and destroy old scene
        if (this.currentScene) {
            this.app.stage.removeChild(this.currentScene);
            this.currentScene.destroy();
        }

        // Add the new one
        this.currentScene = newScene;
        this.app.stage.addChild(this.currentScene);
        newScene.init();
        setAppState(newScene.getState())
    }

    public getScene() {
        return this.currentScene;
    }

    // This update will be called by a pixi ticker and tell the scene that a tick happened
    public update(): void {
        this.updateFunc(this.app.ticker.deltaMS)
    }
}

export interface IScene extends DisplayObject {
    update(deltaMS: number): void;
    init(): void
    mouseEventHandler(event: MouseEvent): void
    getState(): AppState
}