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
                </ul>
            </div>
        </>
    )
}