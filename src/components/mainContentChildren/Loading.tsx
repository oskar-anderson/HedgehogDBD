import { useEffect } from "react";
import { Manager } from "../../Manager";
import { useAppStateManagement } from "../../Store";
import { AppState } from "../MainContent";
import CanvasContainer from "./drawingChildren/CanvasContainer";
import CanvasSide from "./drawingChildren/CanvasSide";


interface LoadingProps {
    canvasContainerRef: React.RefObject<HTMLDivElement>,
}


export default function Loading({canvasContainerRef} : LoadingProps) {
    
    return (
        <>
            <div style={{ display: 'flex', width: '100vw', height: '720px' }}>
                <div 
                    ref={canvasContainerRef}
                    className="canvas-container" 
                    style={{ overflow: 'auto' }}
                >
                    {/* Canvas gets added here by PIXI.js */ }
                </div>
            </div>
        </>
    );
}
