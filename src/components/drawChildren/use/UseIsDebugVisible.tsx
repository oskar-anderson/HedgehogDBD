import { useEffect, useRef, useState } from "react";


export default function useIsDebugVisible() {
    const pressedKeySequence = useRef("");
    const [isDebugVisible, setIsDebugVisible] = useState(false);
    
    useEffect(() => {
        const sequenceToListenTo = "hdbdpos";
        const action = function(e: KeyboardEvent) {
            pressedKeySequence.current = (pressedKeySequence.current + e.key).slice(-sequenceToListenTo.length);
            if (pressedKeySequence.current.toLowerCase().endsWith(sequenceToListenTo)) {
              setIsDebugVisible(state => ! state);
              pressedKeySequence.current = '';
            }
        }
        window.addEventListener('keydown', action);
        return () => window.removeEventListener('keydown', action)
    })

    return isDebugVisible;
}