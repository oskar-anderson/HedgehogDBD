import { Viewport } from "pixi-viewport";
import * as PIXI from "pixi.js";
import { Rectangle } from "pixi.js";

export class Draw {

    // @ts-ignore: Object is possibly 'null'.
    app: PIXI.Application = null;
    // @ts-ignore: Object is possibly 'null'.
    viewport: Viewport = null;

    constructor() {

    }

    getScreensize() {
        if (this.viewport === null) {
            return new Rectangle(0, 0, 1280, 720);
        }
        return new Rectangle(Math.floor(this.viewport.x), Math.floor(this.viewport.y), 1280, 720);
    }

    async init(drawArea: string[], width: number, height: number, fontSize = 14) {
        let screen = this.getScreensize();
        let maxWorldSizeToZoomOutRatio = 1;
        let minZoomOut = 4;
        let maxZoomIn = 2;
        this.app = new PIXI.Application({
            width: screen.width,
            height: screen.height,
            backgroundColor: 0xAAAAAA
        });

        document.querySelector('.canvas-container')?.appendChild(this.app.view);

        this.app.loader.add('../wwwroot/font/ps2p/14xml/ps2p-14.fnt');

        this.viewport = new Viewport({
            screenHeight: screen.height,
            screenWidth:  screen.width,
            worldHeight:  screen.height * minZoomOut * maxWorldSizeToZoomOutRatio,
            worldWidth:   screen.width * minZoomOut * maxWorldSizeToZoomOutRatio,

            interaction: this.app.renderer.plugins.interaction
        });

        this.app.stage.addChild(this.viewport);
        
        // activate plugins
        this.viewport
            .drag().clamp({ 
                left:  -screen.width * minZoomOut * maxWorldSizeToZoomOutRatio + screen.width,
                top:   -screen.height * minZoomOut * maxWorldSizeToZoomOutRatio + screen.height,
                right:  screen.width * minZoomOut,
                bottom: screen.height * minZoomOut,
            })
            .wheel().clampZoom({ 
                maxScale: maxZoomIn, 
                minScale: 1/minZoomOut
            });

        let sprite = this.viewport.addChild(new PIXI.Sprite(PIXI.Texture.WHITE))
        sprite.tint = 0xff0000
        sprite.width = sprite.height = 100
        sprite.position.set(1600, 100)

        await new Promise<void>((resolve, reject) => {
            this.app.loader.load();
            
            this.app.loader.onComplete.add(() => {
                console.log("Loader complete");
                resolve();
            })
            this.app.loader.onError.add(() => {
                console.log("Loader error");
                reject();
            })
        })
        
    }

    initScreen(drawArea: string[], width: number, height: number, fontSize = 14) {
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let tile = drawArea[y * width + x];
                let bitmapText = new PIXI.BitmapText(tile,
                    {
                        fontName: "Press Start 2P",
                        fontSize: fontSize,
                        align: 'right',
                        tint: 0x008000
                    });
                bitmapText.x = x * fontSize;
                bitmapText.y = y * fontSize;
                this.viewport.addChild(bitmapText)
            }
        }
    }

    render(drawArea: string[], width: number, height: number) {
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                (this.viewport.children[y * width + x] as PIXI.Text).text = drawArea[y * width + x]
            }
        }
    }
}

