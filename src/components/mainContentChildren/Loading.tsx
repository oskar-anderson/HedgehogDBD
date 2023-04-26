import { useEffect } from "react";
import { Manager } from "../../Manager";
import { useAppStateManagement } from "../../Store";
import { AppState } from "../MainContent";
import CanvasContainer from "./drawingChildren/CanvasContainer";
import CanvasSide from "./drawingChildren/CanvasSide";


interface LoadingProps {
    canvasContainerRef: React.RefObject<HTMLDivElement>
}


export default function Loading({canvasContainerRef} : LoadingProps) {
    const { setAppState } = useAppStateManagement();

    useEffect(() => {
        // this is kinda stupid but it will mean that the canvas has no knowledge of react and setState.
        const interval = setInterval(() => {
            const scene = Manager.getInstance().getScene();
            if (scene !== null && scene.getState() !== AppState.LoaderScene) {
                setAppState(scene.getState());
            }
        }, 1000 / 60)
        
        return () => { clearInterval(interval) }
    })

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
