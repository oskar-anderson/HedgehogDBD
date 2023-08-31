import { AppStateManagementContext, useAppStateManagementDefault } from './Store';
import MainContent from './components/MainContent';
import FontFaceObserver from "fontfaceobserver"
import Drawing from './components/mainContentChildren/Drawing';

function App() {
  new FontFaceObserver('Inconsolata').load();
  new FontFaceObserver('RealReal_Consolas').load();
  
  const appStateManagementValue = useAppStateManagementDefault();

  return (
    <AppStateManagementContext.Provider value={appStateManagementValue}>
      <Drawing topToolBarHeightPx={topToolBarHeightPx} tables={tables} />
    </AppStateManagementContext.Provider>
  )
}

export default App
