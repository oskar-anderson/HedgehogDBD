import { Link } from "react-router-dom";

export default function Internal() {
    return (
        <>
            <h2>Internal page</h2>

            <div>
                <p>List of demos</p>
                <ul>
                    <li>
                        <Link to="/internal/demo/dom-to-image">/internal/demo/dom-to-image</Link> - HTML DOM element to PNG image using <a href="https://github.com/tsayen/dom-to-image">dom-to-image</a> library
                    </li>
                    <li>
                        <Link to="/internal/demo/react-flow-1">/internal/demo/react-flow-1</Link> - [BROKEN] Trying to recreate custom-node demo from <a href="https://reactflow.dev/docs/examples/nodes/custom-node/">reactflow.dev/docs/examples</a>
                    </li>
                    <li>
                        <Link to="/internal/demo/react-flow-2">/internal/demo/react-flow-2</Link> - Getting started with React Flow
                    </li>
                    <li>
                        <Link to="/internal/demo/react-flow-3">/internal/demo/react-flow-3</Link> - Creating ERD prototype
                    </li>
                </ul>
            </div>
        </>
    )
}