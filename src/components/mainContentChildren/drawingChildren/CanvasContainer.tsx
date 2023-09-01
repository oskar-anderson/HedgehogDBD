import { Point } from "pixi.js";
import { useEffect } from "react";
import DomHelper from "../../../DomHelper";
import { MyMouseEvent } from "../../../model/MyMouseEvent";
import { Draw } from "../../../model/Draw";
import { TableDTO } from "../../../model/dto/TableDTO";
import { AppState } from "../../MainContent";

interface CanvasContainerProps {
    draw: Draw,
    switchToTableView: (table: TableDTO) => void,
    setIsScreenDirty: React.Dispatch<React.SetStateAction<boolean>>
    canvasContainerScrollableRef: React.RefObject<HTMLDivElement>
    debugInfoContainer: React.RefObject<HTMLDivElement>
}

export default function CanvasContainer({
    draw,
    switchToTableView,
    setIsScreenDirty,
    canvasContainerScrollableRef,
    debugInfoContainer
}: CanvasContainerProps) {

    console.log("CanvasContainer")

    useEffect(() => {
        const handleScroll = (position: Point) => {
            canvasContainerScrollableRef.current!.scrollTo(position.x, position.y);
            draw.canvasScrollPosition = position;
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
            handleScroll(draw.canvasScrollPosition)
        }, 0);
    }, [])

    useEffect(() => {
        const activeToolMouseEventHandler = (event: MyMouseEvent) => {
            let mouseEventResult = draw.activeTool.mouseEventHandler(event);
            if (mouseEventResult && mouseEventResult.type === "changeScene") {
                let selectedTable = mouseEventResult.payload as TableDTO;
                switchToTableView(selectedTable);
            }

            if (draw.activeTool.isDirty) {
                draw.activeTool.isDirty = false;
                setIsScreenDirty(true)
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
            lastMousePosition = mouseEvent;
            const charGridPoint = draw.getWorldToCharGridPoint(mouseEvent.worldX, mouseEvent.worldY);
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

        canvasContainerScrollableRef.current!.addEventListener("click", wrappedActiveToolMouseEventHandler);
        canvasContainerScrollableRef.current!.addEventListener("mousedown", wrappedActiveToolMouseEventHandler);
        canvasContainerScrollableRef.current!.addEventListener("mouseup", wrappedActiveToolMouseEventHandler);
        canvasContainerScrollableRef.current!.addEventListener('mousemove', wrappedMouseMoveEventHandler);
        canvasContainerScrollableRef.current!.addEventListener("scroll", scrollEventHandler)

        return () => {
            canvasContainerScrollableRef.current!.removeEventListener("click", wrappedActiveToolMouseEventHandler);
            canvasContainerScrollableRef.current!.removeEventListener("mousedown", wrappedActiveToolMouseEventHandler);
            canvasContainerScrollableRef.current!.removeEventListener("mouseup", wrappedActiveToolMouseEventHandler);
            canvasContainerScrollableRef.current!.removeEventListener("mousemove", wrappedMouseMoveEventHandler);
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