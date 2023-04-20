import { Point } from "pixi.js";
import { useEffect } from "react";
import { Manager } from "../../../Manager";
import CustomMouseEvent from "../../../model/MouseEvent";
import { DrawScene } from "../../../scenes/DrawScene";
import Drawing, { DrawingUtil } from "../Drawing";

interface CanvasContainerProps {
    canvasContainerScrollableRef: React.RefObject<HTMLDivElement>
    setScreenX: React.Dispatch<React.SetStateAction<number>>,
    setScreenY: React.Dispatch<React.SetStateAction<number>>,
    setWorldX: React.Dispatch<React.SetStateAction<number>>,
    setWorldY: React.Dispatch<React.SetStateAction<number>>,
    setWorldCharX: React.Dispatch<React.SetStateAction<number>>,
    setWorldCharY: React.Dispatch<React.SetStateAction<number>>,
}

export default function CanvasContainer({ 
    canvasContainerScrollableRef, 
    setScreenX,
    setScreenY,
    setWorldX,
    setWorldY,
    setWorldCharX,
    setWorldCharY }: CanvasContainerProps) {

    useEffect(() => {
        const drawScene = (Manager.getInstance().getScene() as DrawScene);

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

        const mouseButtonEvent = (event: MouseEvent) => { drawScene.draw.activeTool.mouseEventHandler(mapMouseEvent(event)) };
        const mouseMoveEvent = (event: MouseEvent) => {
            const mouseEvent = mapMouseEvent(event);
            setScreenX(mouseEvent.screenX);
            setScreenY(mouseEvent.screenY);
            setWorldX(mouseEvent.worldX);
            setWorldY(mouseEvent.worldY);
            const charGridPoint = drawScene.draw.getWorldToCharGridPoint(mouseEvent.worldX, mouseEvent.worldY);
            setWorldCharX(charGridPoint.x);
            setWorldCharY(charGridPoint.y);
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