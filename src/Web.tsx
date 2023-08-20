
import { Routes, Route } from "react-router-dom";
import App from "./App";
import Internal from "./pages/internal/Index";
import DomToImage from "./pages/internal/demo/DomToImage";
import ReactFlow1 from "./pages/internal/demo/react-flow-1/Index";
import ReactFlow2 from "./pages/internal/demo/react-flow-2/Index";
import ReactFlow3 from "./pages/internal/demo/react-flow-3/Index";

export default function Web() {
    return (
        <Routes>
            <Route path="/" element={<App />} ></Route>
            <Route path="/RasterModeler" element={<App />} ></Route>
            <Route path="/internal" element={<Internal />} ></Route>
            <Route path="/internal/demo/dom-to-image" element={<DomToImage />} ></Route>
            <Route path="/internal/demo/react-flow-1" element={<ReactFlow1 />} ></Route>
            <Route path="/internal/demo/react-flow-2" element={<ReactFlow2 />} ></Route>
            <Route path="/internal/demo/react-flow-3" element={<ReactFlow3 />} ></Route>
        </Routes>
    )
}