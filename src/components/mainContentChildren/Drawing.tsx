import CanvasSide from "./drawingChildren/CanvasSide";
import CanvasContainer from "./drawingChildren/CanvasContainer";
import { Draw } from "../../model/Draw";
import { useEffect, useRef, useState } from "react";
import { Point, Rectangle } from "pixi.js";
import { Manager } from "../../Manager";
import { Minimap } from "../Minimap";
import { DrawScene } from "../../scenes/DrawScene";
import { MyRect } from "../../model/MyRect";
import { AppState } from "../MainContent";
import { useAppStateManagement } from "../../Store";


export class DrawingUtil {
    static getScreen(canvasContainerRef: React.RefObject<HTMLDivElement>): MyRect {
        const { scrollLeft, scrollTop, offsetWidth, offsetHeight } = canvasContainerRef.current!;
        return new MyRect(scrollLeft, scrollTop, offsetWidth, offsetHeight)
    }
}

export default function Drawing() {
    console.log("drawing")
    const minimap = new Minimap(new Rectangle(0, 0, 180, 120));
    const canvasContainerRef = useRef<HTMLDivElement>(null);
    const debugInfoContainer = useRef<HTMLDivElement>(null);
    const { setAppState } = useAppStateManagement();

    useEffect(() => {
        canvasContainerRef.current!.appendChild(Manager.getInstance().getView());
    }, []);

    useEffect(() => {
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
        
        const minimapUpdateInterval = setInterval(() => {
            const draw = Manager.getInstance().draw;
            if (canvasContainerRef.current == null) {
                console.log("Element canvasContainer not found! Stopped updating minimap!");
                clearInterval(minimapUpdateInterval)
                return;
            }
            let screen = DrawingUtil.getScreen(canvasContainerRef);
            minimap.update(draw.getVisibleTables(), screen);
        }, 1000 / 30);
        
        return () => { clearInterval(minimapUpdateInterval) }
    }, [])



    return (
        <div className="canvas-visibility-container">
            <div style={{ display: 'flex', width: '100vw', height: '720px' }}>
                <CanvasSide 
                    canvasContainerRef={canvasContainerRef}
                    minimap={minimap} 
                    debugInfoContainer={debugInfoContainer}
                />
                <CanvasContainer
                    canvasContainerScrollableRef={canvasContainerRef}
                    debugInfoContainer={debugInfoContainer}
                />
            </div>

        </div>
    );
}