import { createContext, useContext, useRef, useState } from "react";
import { AppState } from "./components/MainContent";
import { IToolNames } from "./tools/ITool";

interface AppStateManagement {
    highlightActiveSideToolbarTool: IToolNames
    setHighlightActiveSideToolbarTool: React.Dispatch<React.SetStateAction<IToolNames>>

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
    const [appState, setAppState] = useState(AppState.LoaderScene)

    return {
        highlightActiveSideToolbarTool: highlightActiveSideToolbarTool,
        setHighlightActiveSideToolbarTool: setHighlightActiveSideToolbarTool,

        canvasSideMinimapContainerRef: useRef<HTMLDivElement>(null),

        appState: appState,
        setAppState: setAppState
    }
}
