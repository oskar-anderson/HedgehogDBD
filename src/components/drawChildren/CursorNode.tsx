import { Handle, Position } from "reactflow";

export default function EmptyNode() {
    return (
        <>
            CURSOR
            <Handle type="target" id={`cursor-node`} position={Position.Top} style={{ left: "0px", top: "0px" }} />
        </>
    )
}