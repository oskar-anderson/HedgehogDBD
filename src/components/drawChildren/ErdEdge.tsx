import { EdgeProps, getBezierPath, getSmoothStepPath, BaseEdge } from 'reactflow';


type Payload = {
    pathType: "smoothstep" | "default" | "straight" | "step" | "simplebezier"
    sourceSide: "left" | "right"
    targetSide: "left" | "right"
}

export const EdgeNotationPadding = 12;

export default function ErdEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style,
    data
  }: EdgeProps<Payload>) {
    const [edgePath] = ["simplebezier", "default"].includes(data!.pathType) ? 
    getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    }) : "smoothstep" ?
    getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    }) : 
    getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    })

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', edgePath);
    let edgeSourceTableCollisionPoint = path.getPointAtLength(0);
    edgeSourceTableCollisionPoint.x += data!.sourceSide === "left" ? EdgeNotationPadding : -EdgeNotationPadding;
    let edgeTargetTableCollisionPoint = path.getPointAtLength(path.getTotalLength())
    edgeTargetTableCollisionPoint.x += data!.targetSide === "left" ? EdgeNotationPadding : -EdgeNotationPadding;

    return (
        <>
            <line className='react-flow__edge-path'
                x1={edgeTargetTableCollisionPoint.x} y1={edgeTargetTableCollisionPoint.y} 
                x2={edgeTargetTableCollisionPoint.x - (data!.targetSide === "left" ? (EdgeNotationPadding) : -(EdgeNotationPadding))} y2={edgeTargetTableCollisionPoint.y} 
                stroke='#b1b1b7' strokeWidth={1} style={{ fill: '#b1b1b7' }}
            />

            <circle className='react-flow__edge-path' cx={edgeTargetTableCollisionPoint.x + (data!.targetSide === "left" ? -3 : 3)} cy={edgeTargetTableCollisionPoint.y} r={2} stroke='#b1b1b7' strokeWidth={1} style={{ fill: '#b1b1b7' }}  />
            
            <BaseEdge id={id} path={edgePath} style={style} />
            <polygon
                className="react-flow__edge-path"
                //          3
                //  2,6             1,4
                //          5
                points={`
                    ${edgeSourceTableCollisionPoint.x + EdgeNotationPadding},${edgeSourceTableCollisionPoint.y} 
                    ${edgeSourceTableCollisionPoint.x - EdgeNotationPadding},${edgeSourceTableCollisionPoint.y} 
                    ${edgeSourceTableCollisionPoint.x},${edgeSourceTableCollisionPoint.y - Math.tan((30 * Math.PI) / 180) * EdgeNotationPadding} 
                    ${edgeSourceTableCollisionPoint.x + EdgeNotationPadding},${edgeSourceTableCollisionPoint.y} 
                    ${edgeSourceTableCollisionPoint.x},${edgeSourceTableCollisionPoint.y + Math.tan((30 * Math.PI) / 180) * EdgeNotationPadding}
                    ${edgeSourceTableCollisionPoint.x - EdgeNotationPadding},${edgeSourceTableCollisionPoint.y} 
                `}
                stroke="#b1b1b7"
                strokeWidth={1}
                style={{fill: "none", }}
            />
        </>
    );
};