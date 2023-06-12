
interface LoadingProps {
    canvasContainerRef: React.RefObject<HTMLDivElement>,
}


export default function Loading({canvasContainerRef} : LoadingProps) {
    
    return (
        <>
            <div style={{ display: 'flex', width: '100vw', height: '100vh' }}>
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
