import { MyMouseEvent } from "./model/MyMouseEvent";
import { MyRect } from "./model/MyRect";


export default class DomHelper {

    /**
     * Converts regular JavaScript mouseEvent to custom mouseevent for better handling.
     * Handles event coordinate mapping:
     * * world - coordinates relative to the entire container
     * * screen - coordinates relative to the visible portion of the container
     * @param event regular JavaScript mouseEvent
     * @param canvasContainerScrollableRef The HTML container that captured the event.
     * @returns 
     */
    static mapMouseEvent(event: MouseEvent, canvasContainerScrollableRef: React.RefObject<HTMLElement>): MyMouseEvent {
        return {
            worldX: event.offsetX,
            worldY: event.offsetY,
            screenX: event.offsetX - DomHelper.getScreen(canvasContainerScrollableRef).x,
            screenY: event.offsetY - DomHelper.getScreen(canvasContainerScrollableRef).y,
            detail: event.detail,
            type: event.type
        }
    }

    /**
     * Get visible portion of the container relative to the whole container. Will not include the scrollbars
     * @param canvasContainerRef HTML container
     * @returns 
     */
    static getScreen(canvasContainerRef: React.RefObject<HTMLElement>): MyRect {
        const { scrollLeft, scrollTop, clientWidth, clientHeight } = canvasContainerRef.current!;
        return new MyRect(scrollLeft, scrollTop, clientWidth, clientHeight)
    }
    
}