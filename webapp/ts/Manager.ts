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
        
        Manager.app.ticker.add((time) => Manager.update());  // I HATE the "frame passed" approach. I would rather use `Manager.app.ticker.deltaMS`

        // listen for the browser telling us that the screen size changed
        window.addEventListener("resize", Manager.resize);

        // call it manually once so we are sure we are the correct size after starting
        Manager.resize();
    }

    // Call this function when you want to go to a new scene
    public static changeScene(newScene: IScene): void {
        // Remove and destroy old scene... if we had one..
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
        // Let the current scene know that we updated it...
        // Just for funzies, sanity check that it exists first.
        if (Manager.currentScene) {
            Manager.currentScene.update(Manager.app.ticker.deltaMS);
        }
    }

    public static resize(): void {
        // current screen size
        const screenWidth = Math.min(document.documentElement.clientWidth, Manager.width || 0);
        const screenHeight = Math.min(document.documentElement.clientHeight, Manager.height || 0);

        // uniform scale for our game
        const scale = Math.min(screenWidth / Manager.width, screenHeight / Manager.height);

        // the "uniformly englarged" size for our game
        const enlargedWidth = Math.floor(scale * Manager.width);
        const enlargedHeight = Math.floor(scale * Manager.height);

        // margins for centering our game
        const horizontalMargin = (screenWidth - enlargedWidth) / 2;
        const verticalMargin = (screenHeight - enlargedHeight) / 2;

        // now we use css trickery to set the sizes and margins
        Manager.app.view.style.width = `${enlargedWidth}px`;
        Manager.app.view.style.height = `${enlargedHeight}px`;
        Manager.app.view.style.marginLeft = Manager.app.view.style.marginRight = `${horizontalMargin}px`;
        Manager.app.view.style.marginTop = Manager.app.view.style.marginBottom = `${verticalMargin}px`;
    }

    
    public static takeScreenshot(display: DisplayObject) {
        Manager.app.renderer.plugins.extract.canvas(display).toBlob((b: Blob) => {
            const a = document.createElement('a');
            document.body.append(a);
            a.download = 'screenshot';
            a.href = URL.createObjectURL(b);
            a.click();
            a.remove();
        }, 'image/png');
    }

    /* More code of your Manager.ts like `changeScene` and `update`*/
}

// This could have a lot more generic functions that you force all your scenes to have. Update is just an example.
// Also, this could be in its own file...
export interface IScene extends DisplayObject {
    update(deltaMS: number): void;
    init(): void
    destroyHtmlUi(): void
}