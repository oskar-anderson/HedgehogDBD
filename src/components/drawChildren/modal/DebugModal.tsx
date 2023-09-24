import useIsDebugVisible from "../../drawChildren/UseIsDebugVisible";


type DebugModalProps = {
    currentViewport: { x: number, y: number, zoom: number },
    mouseScreenPosition: { x: number, y: number }
    mouseWorldPosition: { x: number, y: number }
}

export default function DebugModal({ currentViewport, mouseScreenPosition, mouseWorldPosition }: DebugModalProps) {
    const isDebugModalVisible = useIsDebugVisible();
    
    return (
        isDebugModalVisible ?
        <div style={{ 
            position: "absolute", 
            top: 0, 
            right: 0,
            width: "200px",
            backgroundColor: "rgba(30, 30, 30, 0.8)", 
            zIndex: 1,
            color: "#eee",
            pointerEvents: 'none',
        }} className="p-1" 
            onContextMenu={(e) => { 
            // prevent right click context menu from appearing unless shift is down
            if (! e.shiftKey) {
                e.preventDefault();
            }
        }}>
            <div>
                <div>
                    Screen x: {currentViewport.x.toFixed(2)}
                </div>
                
                <div>
                    Screen y: {currentViewport.y.toFixed(2)}
                </div>
                
                <div>
                    Zoom: {currentViewport.zoom.toFixed(2)}
                </div>

                <div>
                    Mouse sx: {mouseScreenPosition.x.toFixed(2)}
                </div>
                <div>
                    Mouse sy: {mouseScreenPosition.y.toFixed(2)}
                </div>

                <div>
                    Mouse wx: {mouseWorldPosition.x.toFixed(2)}
                </div>
                <div>
                    Mouse wy: {mouseWorldPosition.y.toFixed(2)}
                </div>
            </div>
        </div> :
        null
    )
}