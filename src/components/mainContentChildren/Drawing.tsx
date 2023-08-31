import CanvasSide from "./drawingChildren/CanvasSide";
import CanvasContainer from "./drawingChildren/CanvasContainer";
import { Draw } from "../../model/Draw";
import { useEffect, useRef, useState } from "react";
import { Point, Rectangle } from "pixi.js";
import { DrawScene } from "../../scenes/DrawScene";
import { MyRect } from "../../model/MyRect";
import CanvasSecondaryTopToolbar from "./drawingChildren/CanvasSecondaryTopToolbar";
import { TableDTO } from "../../model/dto/TableDTO";
import DomHelper from "../../DomHelper";
import TopToolbarAction from "../TopToolbarAction";
import { AppState } from "../MainContent";


interface DrawingProps {
    tables: TableDTO[]
}

export default function Drawing({ tables }: DrawingProps) {
    console.log("drawing")
    const canvasContainerRef = useRef<HTMLDivElement>(null);
    const debugInfoContainer = useRef<HTMLDivElement>(null);

    const canvasSecondaryTopToolbarHeightPx = 38;
    return (
        <>
            <TopToolbarAction currentState={AppState.DrawScene} heightPx={54} />
            <div className="canvas-visibility-container">
                <CanvasSecondaryTopToolbar heightPx={canvasSecondaryTopToolbarHeightPx}/>
                <div style={{ display: 'flex', width: '100vw', height: `calc(100vh - ${54}px  - ${canvasSecondaryTopToolbarHeightPx}px)` }}>
                    <CanvasSide
                        tables={tables}
                        /* TODO add minimap */
                        debugInfoContainer={debugInfoContainer}
                    />
                    <CanvasContainer
                        canvasContainerScrollableRef={canvasContainerRef}
                        debugInfoContainer={debugInfoContainer}
                    />
                </div>

            </div>
        </>
    );
}