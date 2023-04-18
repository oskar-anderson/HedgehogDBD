import CanvasContainer from "./drawingChildren/CanvasContainer";
import CanvasSide from "./drawingChildren/CanvasSide";


interface LoadingProps {
    canvasContainerRef: React.RefObject<HTMLDivElement>
}


export default function Loading({canvasContainerRef} : LoadingProps) {
    return (
        <>
            <CanvasContainer canvasContainerRef={canvasContainerRef}/>
        </>
    );
}
