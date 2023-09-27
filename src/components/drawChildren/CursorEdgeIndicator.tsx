import { useEffect } from "react";
import { CursorEdgePayload } from "../drawChildren/use/UseCursorEdgeCreation";


type CursorEdgeIndicatorProps = {
    setCursorEdge: (value: React.SetStateAction<CursorEdgePayload>) => void,
    cursorEdge: CursorEdgePayload
}

export default function CursorEdgeIndicator({ setCursorEdge, cursorEdge }: CursorEdgeIndicatorProps) {

    useEffect(() => {
        const onEscClick = (e: KeyboardEvent) => {
            if (e.key === "Escape" && cursorEdge) {
                setCursorEdge(null);
            }
        }
        document.addEventListener("keydown", onEscClick);
        return (() => document.removeEventListener("keydown", onEscClick))
    }, [cursorEdge])

    return (
        cursorEdge ?
        <div className="d-flex justify-content-center pt-2">
            <div style={{ zIndex: 1}}>
                Click ESC to cancel adding relation!
            </div>
        </div> :
        null
    )
}