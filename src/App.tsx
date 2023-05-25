import { AppStateManagementContext, useAppStateManagementDefault } from './Store';
import MainContent from './components/MainContent';
import FontFaceObserver from "fontfaceobserver"

function App() {
  new FontFaceObserver('Inconsolata').load();
  new FontFaceObserver('RealReal_Consolas').load();
  
  const appStateManagementValue = useAppStateManagementDefault();

  return (
    <AppStateManagementContext.Provider value={appStateManagementValue}>
      <MainContent />
    </AppStateManagementContext.Provider>
  )
}

export default App
