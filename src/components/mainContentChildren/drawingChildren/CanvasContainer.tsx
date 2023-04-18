
interface CanvasContainerProps {
    canvasContainerRef: React.RefObject<HTMLDivElement>
}

export default function CanvasContainer( {canvasContainerRef}: CanvasContainerProps) {
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