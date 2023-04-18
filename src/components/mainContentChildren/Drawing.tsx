import CanvasSide from "./drawingChildren/CanvasSide";
import CanvasContainer from "./drawingChildren/CanvasContainer";
import { Draw } from "../../model/Draw";
import { useEffect, useRef } from "react";
import { Point, Rectangle } from "pixi.js";
import { Manager } from "../../Manager";
import { Minimap } from "../Minimap";
import { DrawScene } from "../../scenes/DrawScene";
import { MyRect } from "../../model/MyRect";


export class DrawingUtil {
    static getScreen(canvasContainerRef: React.RefObject<HTMLDivElement>): MyRect {
        const { scrollLeft, scrollTop, offsetWidth, offsetHeight } = canvasContainerRef.current!;
        return new MyRect(scrollLeft, scrollTop, offsetWidth, offsetHeight)
    }        
} 

export default function drawing() {
    const canvasContainerRef = useRef<HTMLDivElement>(null);
    const minimap = new Minimap(new Rectangle(0, 0, 180, 120));

    minimap.init(
        (x: number, y: number) => { 
            console.log(`minimap navigation (x: ${x}, y: ${y})`);
            canvasContainerRef.current?.scrollTo(
                x - Math.ceil(canvasContainerRef.current!.offsetWidth / 2), 
                y - Math.ceil(canvasContainerRef.current!.offsetHeight / 2)
            );
            DrawScene.cullViewport((Manager.getInstance().getScene() as DrawScene).canvasView);
            minimap.update(Manager.getInstance().draw.getVisibleTables(), DrawingUtil.getScreen(canvasContainerRef));
        }
    );

    useEffect(() => {
        const interval = setInterval(() => {
            const drawScene = Manager.getInstance().getScene() as DrawScene;
            const draw = Manager.getInstance().draw;
            let screen = DrawingUtil.getScreen(canvasContainerRef);
            draw.setScreen(new Point(screen.x, screen.y));
            minimap.update(draw.getVisibleTables(), screen);
            draw.activeTool.update();
            if (draw.activeTool.isDirty) {
                draw.activeTool.isDirty = false;
                drawScene.renderScreen(false);
            }
        }, 1 / 30);
        canvasContainerRef.current!.appendChild(Manager.getInstance().getView());

        return () => { clearInterval(interval); }
    }, [])



    return (
        <div className="canvas-visibility-container">
            <div style={{ display: 'flex', width: '100vw', height: '720px' }}>
                <CanvasSide canvasContainerRef={canvasContainerRef} minimap={minimap} />
                <CanvasContainer canvasContainerRef={canvasContainerRef} />
            </div>

        </div>
    );
}