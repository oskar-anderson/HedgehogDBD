import { useAppStateManagement } from "../../../Store"


export default function CanvasContainer() {
    const { canvasContainerRef } = useAppStateManagement();
    return (
        <div 
            ref={canvasContainerRef} 
            className="canvas-container" 
            style={{ overflow: 'auto', width: '100vw' }}
        >
            {/* Canvas gets added here by PIXI.js */ }
        </div>
    )
}