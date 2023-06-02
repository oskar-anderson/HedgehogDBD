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
import { TableDTO } from "../../model/dto/TableDTO";
import DomHelper from "../../DomHelper";


interface DrawingProps {
    topToolBarHeightPx: number,
    tables: TableDTO[]
    onTablesUpdateCallbackOuterReadonly: (tables: TableDTO[]) => void
}

export default function Drawing({ topToolBarHeightPx, tables, onTablesUpdateCallbackOuterReadonly }: DrawingProps) {
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
                minimap.update(Manager.getInstance().draw.getVisibleTables(), DomHelper.getScreen(canvasContainerRef));
            }
        );

        const minimapUpdateInterval = setInterval(() => {
            const draw = Manager.getInstance().draw;
            if (canvasContainerRef.current == null) {
                console.log("Element canvasContainer not found! Stopped updating minimap!");
                clearInterval(minimapUpdateInterval)
                return;
            }
            let screen = DomHelper.getScreen(canvasContainerRef);
            minimap.update(draw.getVisibleTables(), screen);
        }, 1000 / 30);

        return () => { clearInterval(minimapUpdateInterval) }
    }, [])

    const setZoomFontSize = (size: number): void => {
        const draw = Manager.getInstance().draw;
        let centerScreenOriginalXPercent = DomHelper.getScreen(canvasContainerRef).getCenter().x / draw.getWorld().width;
        let centerScreenOriginalYPercent = DomHelper.getScreen(canvasContainerRef).getCenter().y / draw.getWorld().height;
        let widthCharGridOriginal = draw.getWorldCharGrid().width;
        let heightCharGridOriginal = draw.getWorldCharGrid().height;
        draw.selectedFontSize = Draw.fontSizes_Inconsolata.find(x => x.size === size)!;
        let widthWorldResize = widthCharGridOriginal * draw.selectedFontSize.width;
        let heightWorldResize = heightCharGridOriginal * draw.selectedFontSize.height;
        Manager.getInstance().getRenderer().resize(widthWorldResize, heightWorldResize);
        draw.setWorld(new MyRect(0, 0, widthWorldResize, heightWorldResize))
        let centerScreenResizeXPercent = DomHelper.getScreen(canvasContainerRef).getCenter().x / draw.getWorld().width;
        let centerScreenResizeYPercent = DomHelper.getScreen(canvasContainerRef).getCenter().y / draw.getWorld().height;
        canvasContainerRef.current!.scrollTo(
            DomHelper.getScreen(canvasContainerRef).x + draw.getWorld().width * (centerScreenOriginalXPercent - centerScreenResizeXPercent),
            DomHelper.getScreen(canvasContainerRef).y + draw.getWorld().height * (centerScreenOriginalYPercent - centerScreenResizeYPercent)
        );
        draw.schema.getTables().forEach(x => x.setIsDirty(true));
        draw.schema.getTables().forEach(x => x.relations.forEach(y => y.isDirty = true));
        (Manager.getInstance().getScene() as DrawScene).renderScreen();
    }
    const canvasSecondaryTopToolbarHeightPx = 38;

    return (
        <div className="canvas-visibility-container">
            <CanvasSecondaryTopToolbar
                setZoomFontSize={setZoomFontSize} heightPx={canvasSecondaryTopToolbarHeightPx} onTablesUpdateCallback={onTablesUpdateCallbackOuterReadonly}
            />
            <div style={{ display: 'flex', width: '100vw', height: `calc(100vh - ${topToolBarHeightPx}px  - ${canvasSecondaryTopToolbarHeightPx}px)` }}>
                <CanvasSide
                    tables={tables}
                    minimap={minimap}
                    debugInfoContainer={debugInfoContainer}
                    setZoomFontSize={setZoomFontSize}
                />
                <CanvasContainer
                    canvasContainerScrollableRef={canvasContainerRef}
                    debugInfoContainer={debugInfoContainer}
                />
            </div>

        </div>
    );
}