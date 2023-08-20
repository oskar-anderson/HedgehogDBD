
import { Routes, Route } from "react-router-dom";
import App from "./App";
import Internal from "./pages/internal/Index";
import DomToImage from "./pages/internal/demo/DomToImage";

export default function Web() {
    return (
        <Routes>
            <Route path="/" element={<App />} ></Route>
            <Route path="/internal" element={<Internal />} ></Route>
            <Route path="/internal/demo/dom-to-image" element={<DomToImage />} ></Route>
        </Routes>
    )
}