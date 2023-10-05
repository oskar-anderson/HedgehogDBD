import { useEffect } from "react";
import { publish } from "../../Event";


export enum CANCEL_INDICATOR_EMITTED { 
    CANCEL_INDICATOR_TRIGGER = "e_cancelIndicatorTrigger"
}

export enum CANCEL_INDICATOR_ARGUMENT_TYPE {
    EDGE = "edge",
    TABLE = "table",
    ALL = "all"
}

type CancelIndicatorProps = {
    type: CANCEL_INDICATOR_ARGUMENT_TYPE,
    show: boolean,
    children: JSX.Element
}

export default function CancelIndicator({ type, show, children }: CancelIndicatorProps) {
    
    useEffect(() => {
        const onEscClick = (e: KeyboardEvent) => {
            if (e.key === "Escape" && show) {
                publish(CANCEL_INDICATOR_EMITTED.CANCEL_INDICATOR_TRIGGER, { type })
            }
        }
        const onRightClick = (e: MouseEvent) => {
            if (e.button === 2 && show) {
                publish(CANCEL_INDICATOR_EMITTED.CANCEL_INDICATOR_TRIGGER, { type })
            }
        }
        document.addEventListener("keydown", onEscClick);
        document.addEventListener("contextmenu", onRightClick);
        return (() => {
            document.removeEventListener("keydown", onEscClick)
            document.removeEventListener("contextmenu", onRightClick)
        });
    }, [show, type])

    return (
        show ?
        <div className="d-flex justify-content-center pt-2">
            <div style={{ zIndex: 2, userSelect: "none"}}>
                {children}
            </div>
        </div> :
        null
    )
}