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
        const handleScroll = (position: Point) => {
            canvasContainerScrollableRef.current!.scrollTo(position.x, position.y);
            Manager.getInstance().draw.canvasScrollPosition = position;
        };

        canvasContainerScrollableRef.current!.addEventListener("scroll", (e) => {
            handleScroll(new Point(
                (e.target as HTMLDivElement).scrollLeft, 
                (e.target as HTMLDivElement).scrollTop
            ))
        });
        // set scroll initial position, will not work outside setTimeout
        setTimeout(() => {
            canvasContainerScrollableRef.current!.style.display = "grid";
            handleScroll(Manager.getInstance().draw.canvasScrollPosition)
        }, 0);
    }, [])

    useEffect(() => {
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

        const activeToolMouseEventHandler = (event: MouseEvent) => { 
            const drawScene = (Manager.getInstance().getScene() as DrawScene);
            drawScene.draw.activeTool.mouseEventHandler(mapMouseEvent(event));
            if (drawScene.draw.activeTool.isDirty) {
                drawScene.draw.activeTool.isDirty = false;
                drawScene.renderScreen();
            }
        };

        const mouseMoveEvent = (event: MouseEvent) => {
            const drawScene = (Manager.getInstance().getScene() as DrawScene);
            const mouseEvent = mapMouseEvent(event);
            const charGridPoint = drawScene.draw.getWorldToCharGridPoint(mouseEvent.worldX, mouseEvent.worldY);
            // using useState would cause a lot of rerenders and make the app unresponsive
            if (debugInfoContainer.current !== null) {
                debugInfoContainer.current.innerHTML = `
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
            }
            activeToolMouseEventHandler(event);
         }

        Manager.getInstance().getView().addEventListener("click", activeToolMouseEventHandler);
        Manager.getInstance().getView().addEventListener("mousedown", activeToolMouseEventHandler);
        Manager.getInstance().getView().addEventListener("mouseup", activeToolMouseEventHandler);
        Manager.getInstance().getView().addEventListener('mousemove', mouseMoveEvent);

        return () => { 
            Manager.getInstance().getView().removeEventListener("click", activeToolMouseEventHandler);
            Manager.getInstance().getView().removeEventListener("mousedown", activeToolMouseEventHandler);
            Manager.getInstance().getView().removeEventListener("mouseup", activeToolMouseEventHandler);
            Manager.getInstance().getView().removeEventListener("mousemove", mouseMoveEvent);
        }
    }, []);
    return (
        <div
            ref={canvasContainerScrollableRef}
            className="canvas-outer-scrollable-container"
            style={{ overflow: 'auto', display: "none" }}
        >
            {/* display: "none" is needed to prevent content flash before the div is scrolled to correct position */}
            {/* display: "grid" is needed to stop 4px height gap between the canvas and the container bottom */}
            {/* Canvas gets added here by PIXI.js */}
        </div>
    )
}