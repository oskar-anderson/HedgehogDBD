import { Point } from "pixi.js";
import { useEffect } from "react";
import { Manager } from "../../../Manager";
import CustomMouseEvent from "../../../model/MouseEvent";
import { DrawScene } from "../../../scenes/DrawScene";
import Drawing, { DrawingUtil } from "../Drawing";

interface CanvasContainerProps {
    canvasContainerScrollableRef: React.RefObject<HTMLDivElement>
    debugInfoContainer: React.RefObject<HTMLDivElement>
}

export default function CanvasContainer({ 
    canvasContainerScrollableRef,
    debugInfoContainer 
}: CanvasContainerProps) {

    console.log("CanvasContainer")

    useEffect(() => {
        console.log("CanvasContainer useEffect")

        const mapMouseEvent = (event: MouseEvent): CustomMouseEvent => {
            return {
                worldX: event.offsetX,
                worldY: event.offsetY,
                screenX: event.offsetX - DrawingUtil.getScreen(canvasContainerScrollableRef).x,
                screenY: event.offsetY - DrawingUtil.getScreen(canvasContainerScrollableRef).y,
                detail: event.detail,
                type: event.type
            }
        }

        const mouseButtonEvent = (event: MouseEvent) => { 
            const drawScene = (Manager.getInstance().getScene() as DrawScene);
            drawScene.draw.activeTool.mouseEventHandler(mapMouseEvent(event)) 
        };
        const mouseMoveEvent = (event: MouseEvent) => {
            const drawScene = (Manager.getInstance().getScene() as DrawScene);
            const mouseEvent = mapMouseEvent(event);
            const charGridPoint = drawScene.draw.getWorldToCharGridPoint(mouseEvent.worldX, mouseEvent.worldY);
            // using useState would cause a lot of rerenders and make the app unresponsive
            debugInfoContainer.current!.innerHTML = `
            <div>
                Sx: ${mouseEvent.screenX}, Sy: ${mouseEvent.screenY}
            </div>
            <div>
                Wx: ${mouseEvent.worldX}, Wy: ${mouseEvent.worldY}
            </div>
            <div>
                WCx: ${charGridPoint.x}, WCy: ${charGridPoint.y}
            </div>
            `;
            drawScene.draw.activeTool.update(mouseEvent.screenX, mouseEvent.screenY, mouseEvent.worldX, mouseEvent.worldY);
            if (drawScene.draw.activeTool.isDirty) {
                drawScene.draw.activeTool.isDirty = false;
                drawScene.renderScreen(false);
            }
         }

        Manager.getInstance().getView().addEventListener("click", mouseButtonEvent);
        Manager.getInstance().getView().addEventListener("mousedown", mouseButtonEvent);
        Manager.getInstance().getView().addEventListener("mouseup", mouseButtonEvent);
        Manager.getInstance().getView().addEventListener('mousemove', mouseMoveEvent);

        return () => { 
            Manager.getInstance().getView().removeEventListener("click", mouseButtonEvent);
            Manager.getInstance().getView().removeEventListener("mousedown", mouseButtonEvent);
            Manager.getInstance().getView().removeEventListener("mouseup", mouseButtonEvent);
            Manager.getInstance().getView().removeEventListener("mousemove", mouseMoveEvent);
        }
    }, []);
    return (
        <div
            ref={canvasContainerScrollableRef}
            className="canvas-outer-scrollable-container"
            style={{ overflow: 'auto', display: "grid" }}
        >
            {/* display: "grid" is needed to stop 4px height gap between the canvas and the container bottom */}
            {/* Canvas gets added here by PIXI.js */}
        </div>
    )
}