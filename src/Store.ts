import { createContext, useContext, useRef, useState } from "react";
import { AppState } from "./components/MainContent";
import { IToolNames } from "./tools/ITool";

interface AppStateManagement {
    highlightActiveSideToolbarTool: IToolNames
    setHighlightActiveSideToolbarTool: React.Dispatch<React.SetStateAction<IToolNames>>

    isTopToolbarVisible: boolean
    setIsTopToolbarVisible: React.Dispatch<React.SetStateAction<boolean>>

    canvasContainerRef: React.RefObject<HTMLDivElement>
    canvasSideMinimapContainerRef: React.RefObject<HTMLDivElement>

    appState: AppState,
    setAppState: React.Dispatch<React.SetStateAction<AppState>>
}
  
export const AppStateManagementContext = createContext({} as AppStateManagement);

export function useAppStateManagement(): AppStateManagement {
    return useContext(AppStateManagementContext);
}

export function useAppStateManagementDefault(): AppStateManagement {
    const [highlightActiveSideToolbarTool, setHighlightActiveSideToolbarTool] = useState(IToolNames.select);
    const [isTopToolbarVisible, setIsTopToolbarVisible] = useState(false);
    const [appState, setAppState] = useState(AppState.LoaderScene)

    return {
        highlightActiveSideToolbarTool: highlightActiveSideToolbarTool,
        setHighlightActiveSideToolbarTool: setHighlightActiveSideToolbarTool,

        isTopToolbarVisible: isTopToolbarVisible,
        setIsTopToolbarVisible: setIsTopToolbarVisible,

        canvasContainerRef: useRef<HTMLDivElement>(null),
        canvasSideMinimapContainerRef: useRef<HTMLDivElement>(null),

        appState: appState,
        setAppState: setAppState
    }
}
