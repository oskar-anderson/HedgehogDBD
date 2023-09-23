import { Handle, Position } from "reactflow";

export default function EmptyNode() {
    return (
        <>
            <Handle type="target" id={`cursor-node`} position={Position.Top} style={{ position: "relative", left: "0px", top: "0px" }} />
        </>
    )
}