import CanvasSide from "./drawingChildren/CanvasSide";
import CanvasContainer from "./drawingChildren/CanvasContainer";
import { Draw } from "../../model/Draw";


export default function drawing() {
    return (
        <div className="canvas-visibility-container">
            <div style={{ display: 'flex', width: '100vw', height: '720px' }}>
                <CanvasSide />
                <CanvasContainer />
            </div>

        </div>
    );
}