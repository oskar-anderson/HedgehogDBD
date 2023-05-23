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
import CanvasSecondaryTopToolbar from "./drawingChildren/CanvasSecondaryTopToolbar";


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

    const setZoomFontSize = (size: number): void => {
        const draw = Manager.getInstance().draw;
        let centerScreenOriginalXPercent = DrawingUtil.getScreen(canvasContainerRef).getCenter().x / draw.getWorld().width;
        let centerScreenOriginalYPercent = DrawingUtil.getScreen(canvasContainerRef).getCenter().y / draw.getWorld().height;
        let widthCharGridOriginal = draw.getWorldCharGrid().width;
        let heightCharGridOriginal = draw.getWorldCharGrid().height;
        draw.selectedFontSize = Draw.fontSizes_Inconsolata.find(x => x.size === size)!;
        let widthWorldResize = widthCharGridOriginal * draw.selectedFontSize.width;
        let heightWorldResize = heightCharGridOriginal * draw.selectedFontSize.height;
        Manager.getInstance().getRenderer().resize(widthWorldResize, heightWorldResize);
        draw.setWorld(new MyRect(0, 0, widthWorldResize, heightWorldResize))
        let centerScreenResizeXPercent = DrawingUtil.getScreen(canvasContainerRef).getCenter().x / draw.getWorld().width;
        let centerScreenResizeYPercent = DrawingUtil.getScreen(canvasContainerRef).getCenter().y / draw.getWorld().height;
        canvasContainerRef.current!.scrollTo(
            DrawingUtil.getScreen(canvasContainerRef).x + draw.getWorld().width * (centerScreenOriginalXPercent - centerScreenResizeXPercent),
            DrawingUtil.getScreen(canvasContainerRef).y + draw.getWorld().height * (centerScreenOriginalYPercent - centerScreenResizeYPercent)
        );
        draw.schema.tables.forEach(x => x.setIsDirty(true));
        draw.schema.tables.forEach(x => x.relations.forEach(y => y.isDirty = true));
        (Manager.getInstance().getScene() as DrawScene).renderScreen();
    }


    return (
        <div className="canvas-visibility-container">
            <CanvasSecondaryTopToolbar
                setZoomFontSize={setZoomFontSize}
            />
            <div style={{ display: 'flex', width: '100vw', height: '720px' }}>
                <CanvasSide
                    setZoomFontSize={setZoomFontSize}
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