import { Point } from "pixi.js";
import { useEffect } from "react";
import { Manager } from "../../../Manager";
import DomHelper from "../../../DomHelper";
import { DrawScene } from "../../../scenes/DrawScene";
import { MyMouseEvent } from "../../../model/MyMouseEvent";

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
        const activeToolMouseEventHandler = (event: MyMouseEvent) => {
            const drawScene = (Manager.getInstance().getScene() as DrawScene);
            drawScene.draw.activeTool.mouseEventHandler(event);
            if (drawScene.draw.activeTool.isDirty) {
                drawScene.draw.activeTool.isDirty = false;
                drawScene.renderScreen();
            }
        };

        let lastMousePosition: MyMouseEvent = {
            worldX: 0,
            worldY: 0,
            screenX: 0,
            screenY: 0,
            detail: 0,
            type: "mousemove"
        }

        const mouseMoveEventHandler = (mouseEvent: MyMouseEvent) => {
            const drawScene = (Manager.getInstance().getScene() as DrawScene);
            lastMousePosition = mouseEvent;
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
            activeToolMouseEventHandler(mouseEvent);
        }

        // this is here to allow activetool update on scrollEvent since scrollEvent will change mousePosition 
        const scrollEventHandler = (event: Event) => {
            lastMousePosition.worldY = lastMousePosition.screenY + (event.target as HTMLDivElement).scrollTop;
            lastMousePosition.worldX = lastMousePosition.screenX + (event.target as HTMLDivElement).scrollLeft;
            if (DomHelper.getScreen(canvasContainerScrollableRef).contains(lastMousePosition.worldX, lastMousePosition.worldY)) {
                mouseMoveEventHandler(lastMousePosition)
            }
        }

        const wrappedMouseMoveEventHandler = (event: MouseEvent) => {
            mouseMoveEventHandler(DomHelper.mapMouseEvent(event, canvasContainerScrollableRef))
        }

        const wrappedActiveToolMouseEventHandler = (event: MouseEvent) => {
            activeToolMouseEventHandler(DomHelper.mapMouseEvent(event, canvasContainerScrollableRef))
        }

        Manager.getInstance().getView().addEventListener("click", wrappedActiveToolMouseEventHandler);
        Manager.getInstance().getView().addEventListener("mousedown", wrappedActiveToolMouseEventHandler);
        Manager.getInstance().getView().addEventListener("mouseup", wrappedActiveToolMouseEventHandler);
        Manager.getInstance().getView().addEventListener('mousemove', wrappedMouseMoveEventHandler);
        canvasContainerScrollableRef.current!.addEventListener("scroll", scrollEventHandler)

        return () => {
            Manager.getInstance().getView().removeEventListener("click", wrappedActiveToolMouseEventHandler);
            Manager.getInstance().getView().removeEventListener("mousedown", wrappedActiveToolMouseEventHandler);
            Manager.getInstance().getView().removeEventListener("mouseup", wrappedActiveToolMouseEventHandler);
            Manager.getInstance().getView().removeEventListener("mousemove", wrappedMouseMoveEventHandler);
            // canvasContainerScrollableRef events are removed automatically
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