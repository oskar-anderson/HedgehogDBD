import { Container, DisplayObject, Rectangle } from "pixi.js";
import { ChangeEvent, RefObject, useEffect, useRef, useState } from "react";
import { Manager } from "../../../Manager";
import { Draw } from "../../../model/Draw";
import { MyRect } from "../../../model/MyRect";
import { DrawScene } from "../../../scenes/DrawScene";
import { IToolManager, IToolNames } from "../../../tools/ITool";
import { Minimap } from "../../Minimap";
import { DrawingUtil } from "../Drawing";


interface CanvasSideProps {
    canvasContainerRef: React.RefObject<HTMLDivElement>
    minimap: Minimap,
    debugInfoContainer: React.RefObject<HTMLDivElement>
}


function CanvasSide({ 
    canvasContainerRef, minimap, debugInfoContainer
}: CanvasSideProps) {
    const minimapContainerRef = useRef<HTMLDivElement>(null);
    console.log("CanvasSide")

    useEffect(() => {
        minimapContainerRef.current!.appendChild(minimap.app.view);
    }, [])

    const [highlightActiveSideToolbarTool, setHighlightActiveSideToolbarTool] = useState(IToolNames.select);


    const setZoomFontSize = (e: ChangeEvent): void => {
        const draw = Manager.getInstance().draw;
        let size = Number.parseInt((e.target as HTMLSelectElement).value);
        let centerScreenOriginalXPercent = DrawingUtil.getScreen(canvasContainerRef).getCenter().x / draw.getWorld().width;
        let centerScreenOriginalYPercent = DrawingUtil.getScreen(canvasContainerRef).getCenter().y / draw.getWorld().height;
        let widthCharGridOriginal = draw.getWorldCharGrid().width;
        let heightCharGridOriginal = draw.getWorldCharGrid().height;
        draw.selectedFontSize = Draw.fontSizes.find(x => x.size === size)!;
        let widthWorldResize = widthCharGridOriginal * draw.selectedFontSize.width;
        let heightWorldResize = heightCharGridOriginal * draw.selectedFontSize.height;
        Manager.getInstance().getRenderer().resize(widthWorldResize, heightWorldResize);
        draw.setWorld(new MyRect(0, 0, widthWorldResize, heightWorldResize))
        let centerScreenResizeXPercent = DrawingUtil.getScreen(canvasContainerRef).getCenter().x / draw.getWorld().width;
        let centerScreenResizeYPercent = DrawingUtil.getScreen(canvasContainerRef).getCenter().y / draw.getWorld().height;
        canvasContainerRef.current!.scrollTo(
            DrawingUtil.getScreen(canvasContainerRef).x + draw.getWorld().width * (centerScreenOriginalXPercent - centerScreenResizeXPercent),
            DrawingUtil.getScreen(canvasContainerRef).y + draw.getWorld().height * (centerScreenOriginalYPercent - centerScreenResizeYPercent)
        );
        (Manager.getInstance().getScene() as DrawScene).renderScreen();
    }

    const onToolSelectClick = (selectedTool: IToolNames): void => {
        const draw = Manager.getInstance().draw;
        setHighlightActiveSideToolbarTool(selectedTool);
        IToolManager.toolActivate(draw, selectedTool);
        (Manager.getInstance().getScene() as DrawScene).renderScreen();  // clean up new table hover
    };

    const undo = (): void  => {
        const draw = Manager.getInstance().draw;
        draw.history.undo(draw);
        draw.schema.tables.flatMap(x => x.relations).forEach(relation => relation.isDirty = true);
        (Manager.getInstance().getScene() as DrawScene).renderScreen();
    }

    const redo = (): void => {
        const draw = Manager.getInstance().draw;
        draw.history.redo(draw);
        draw.schema.tables.flatMap(x => x.relations).forEach(relation => relation.isDirty = true);
        (Manager.getInstance().getScene() as DrawScene).renderScreen();
    }

    return (
        <div className="canvas-side" style={{ display: 'flex', marginLeft: '6px', backgroundColor: '#f5f5f5' }}>
            <div>
                <span>Bird's Eye</span>
                <div style={{ display: 'flex' }}>
                    <span>Zoom:</span>
                    <select defaultValue={14} name="zoom-font-size" onChange={ (e) => setZoomFontSize(e) } className="zoom-font-size" autoComplete="off" style={{ marginLeft: '6px' }}>
                        <option value={7}>7</option>
                        <option value={8}>8</option>
                        <option value={9}>9</option>
                        <option value={10}>10</option>
                        <option value={11}>11</option>
                        <option value={12}>12</option>
                        <option value={14}>14</option>
                        <option value={16}>16</option>
                        <option value={18}>18</option>
                        <option value={20}>20</option>
                        <option value={22}>22</option>
                        <option value={24}>24</option>
                    </select>
                </div>
                <div className="canvas-side-minimap" ref={minimapContainerRef} style={{ marginTop: '6px' }}></div>
                <span>Reset browser zoom to 100% (ctrl + 0) if image is blurry</span>
                <div ref={debugInfoContainer}>

                </div>
            </div>
            <div className="canvas-side-tools" style={{ backgroundColor: '#eeeeee' }}>
                <header style={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>

                    <button onClick={ () => onToolSelectClick(IToolNames.select) } className={`tool-select btn btn-light ${highlightActiveSideToolbarTool === IToolNames.select ? 'active' : ''}`} style={{borderRadius: 0}} title="Select/Edit table">
                        <svg width="16px" height="16px" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M3.29227 0.048984C3.47033 -0.032338 3.67946 -0.00228214 3.8274 0.125891L12.8587 7.95026C13.0134 8.08432 13.0708 8.29916 13.0035 8.49251C12.9362 8.68586 12.7578 8.81866 12.5533 8.82768L9.21887 8.97474L11.1504 13.2187C11.2648 13.47 11.1538 13.7664 10.9026 13.8808L8.75024 14.8613C8.499 14.9758 8.20255 14.8649 8.08802 14.6137L6.15339 10.3703L3.86279 12.7855C3.72196 12.934 3.50487 12.9817 3.31479 12.9059C3.1247 12.8301 3 12.6461 3 12.4414V0.503792C3 0.308048 3.11422 0.130306 3.29227 0.048984ZM4 1.59852V11.1877L5.93799 9.14425C6.05238 9.02363 6.21924 8.96776 6.38319 8.99516C6.54715 9.02256 6.68677 9.12965 6.75573 9.2809L8.79056 13.7441L10.0332 13.178L8.00195 8.71497C7.93313 8.56376 7.94391 8.38824 8.03072 8.24659C8.11753 8.10494 8.26903 8.01566 8.435 8.00834L11.2549 7.88397L4 1.59852Z" fill="#000000" />
                        </svg>
                    </button>

                    <button onClick={ () => onToolSelectClick(IToolNames.newTable) } className={`tool-select btn btn-light ${highlightActiveSideToolbarTool === IToolNames.newTable ? 'active' : ''}`} style={{borderRadius: 0}} title="New table">
                        <svg width="16px" height="16px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none">
                            <path stroke="#000000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2M3 8v6m0-6h6m12 0v4m0-4H9m-6 6v4a2 2 0 0 0 2 2h4m-6-6h6m0-6v6m0 0h4a2 2 0 0 0 2-2V8m-6 6v6m0 0h2m7-5v3m0 0v3m0-3h3m-3 0h-3" />
                        </svg>
                    </button>

                    <button onClick={() => undo()} className="btn btn-light" style={{borderRadius: 0}} title="Undo">
                        <svg fill="#000000" height="16px" viewBox="0 0 24 24" width="16px" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h24v24H0z" fill="none"></path><path className="icon inactive" d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"></path></svg>
                    </button>

                    <button onClick={() => redo()} className="btn btn-light" style={{borderRadius: 0}} title="Redo">
                        <svg fill="#000000" height="16px" viewBox="0 0 24 24" width="16px" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h24v24H0z" fill="none"></path><path className="icon inactive" d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"></path></svg>
                    </button>
                </header>

            </div>
        </div>
    )
}

export default CanvasSide;