import { Tooltip } from "bootstrap";
import { useEffect, useState } from "react";

export default function UseIconTooltip(ref: React.RefObject<HTMLElement>) {
    const [isIconFocused, setIsIconFocused] = useState(false);

    useEffect(() => {
        if (!ref.current) return;
        let tooltip = new Tooltip(ref.current!)

        // While using something more React oriented might be more elequent, this works wihout flickering side effects (unlike react-bootstrap - https://github.com/react-bootstrap/react-bootstrap/issues/6314). 
        const [handleIconShow, handleSettingsHide] = 
        [
            () => setIsIconFocused(true), 
            () => setIsIconFocused(false)
        ]
        ref.current!.addEventListener("show.bs.tooltip", handleIconShow);
        ref.current!.addEventListener("hide.bs.tooltip", handleSettingsHide);

        return () => tooltip.dispose(); // remove the tooltip when the target element gets removed
    }, [ref])
    return isIconFocused;
}