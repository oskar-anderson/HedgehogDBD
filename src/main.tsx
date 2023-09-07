import ReactDOM from 'react-dom/client'
import { Routes, Route, BrowserRouter } from "react-router-dom"
import Draw from "./pages/Draw";
import Info from "./pages/system/Info";
import Settings from './pages/Settings';
import Scripting from './pages/Scripting';
import Table from './pages/Table';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

root.render(
    <BrowserRouter>
        <Routes>
            <Route path={`/`} element={<Draw />}></Route>
            <Route path={`/draw`} element={<Draw />}></Route>
            <Route path={`/table/:id`} element={<Table />}></Route>
            <Route path={`/settings`} element={<Settings />}></Route>
            <Route path={`/scripting`} element={<Scripting />}></Route>
            <Route path={`/system/info`} element={<Info />}></Route>
        </Routes>
    </BrowserRouter>
)
