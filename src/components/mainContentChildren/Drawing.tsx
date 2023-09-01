import CanvasSide from "./drawingChildren/CanvasSide";
import CanvasContainer from "./drawingChildren/CanvasContainer";
import { Draw } from "../../model/Draw";
import { useEffect, useRef, useState } from "react";
import { Point, Rectangle } from "pixi.js";
import { MyRect } from "../../model/MyRect";
import CanvasSecondaryTopToolbar from "./drawingChildren/CanvasSecondaryTopToolbar";
import { TableDTO } from "../../model/dto/TableDTO";
import TopToolbarAction from "../TopToolbarAction";
import { AppState } from "../MainContent";


interface DrawingProps {
    draw: Draw
    switchToTableView: (table: TableDTO) => void
}

export default function Drawing({ draw, switchToTableView }: DrawingProps) {
    console.log("drawing")
    const canvasContainerRef = useRef<HTMLDivElement>(null);
    const debugInfoContainer = useRef<HTMLDivElement>(null);
    const [isScreenDirty, setIsScreenDirty] = useState(false);

    const TopToolbarHeightPx = 54;
    const canvasSecondaryTopToolbarHeightPx = 38;
    return (
        <>
            <div className="canvas-visibility-container">
                <CanvasSecondaryTopToolbar draw={draw} setIsScreenDirty={setIsScreenDirty} heightPx={canvasSecondaryTopToolbarHeightPx}/>
                <div style={{ display: 'flex', width: '100vw', height: `calc(100vh - ${TopToolbarHeightPx}px - ${canvasSecondaryTopToolbarHeightPx}px)` }}>
                    <CanvasSide
                        tables={draw.schema.tables.map(x => TableDTO.initFromTable(x))}
                        /* TODO add minimap */
                        debugInfoContainer={debugInfoContainer}
                    />
                    <CanvasContainer
                        draw={draw}
                        switchToTableView={switchToTableView}
                        setIsScreenDirty={setIsScreenDirty}
                        canvasContainerScrollableRef={canvasContainerRef}
                        debugInfoContainer={debugInfoContainer}
                    />
                </div>

            </div>
        </>
    );
}