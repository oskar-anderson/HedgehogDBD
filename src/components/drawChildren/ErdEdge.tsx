import { EdgeProps, getBezierPath, getSmoothStepPath, BaseEdge, Position, getStraightPath } from 'reactflow';
import { EdgePayload } from '../../pages/Draw';
import { publish } from '../../Event';

export const EdgeNotationPadding = 12;

type ManyNotationProps = {
    tableCollisionPoint: {x: number, y: number}
}

export function ManyRight({ tableCollisionPoint } : ManyNotationProps) {
    return (
        <polygon
            className="react-flow__edge-path"
            //          1
            //          3       2,4,6
            //          5
            points={`
                ${tableCollisionPoint.x},${tableCollisionPoint.y - Math.tan((30 * Math.PI) / 180) * EdgeNotationPadding} 
                ${tableCollisionPoint.x + EdgeNotationPadding},${tableCollisionPoint.y} 

                ${tableCollisionPoint.x},${tableCollisionPoint.y} 
                ${tableCollisionPoint.x + EdgeNotationPadding},${tableCollisionPoint.y} 

                ${tableCollisionPoint.x},${tableCollisionPoint.y + Math.tan((30 * Math.PI) / 180) * EdgeNotationPadding}
                ${tableCollisionPoint.x + EdgeNotationPadding},${tableCollisionPoint.y} 
            `}
            stroke="#b1b1b7"
            strokeWidth={1}
            style={{fill: "none", }}
        />
    )
}

export function ManyLeft({ tableCollisionPoint } : ManyNotationProps) {
    return (
        <polygon
            className="react-flow__edge-path"
            //          1
            //  2,4,6   3
            //          5
            points={`
                ${tableCollisionPoint.x},${tableCollisionPoint.y - Math.tan((30 * Math.PI) / 180) * EdgeNotationPadding} 
                ${tableCollisionPoint.x - EdgeNotationPadding},${tableCollisionPoint.y} 

                ${tableCollisionPoint.x},${tableCollisionPoint.y} 
                ${tableCollisionPoint.x - EdgeNotationPadding},${tableCollisionPoint.y} 
                
                ${tableCollisionPoint.x},${tableCollisionPoint.y + Math.tan((30 * Math.PI) / 180) * EdgeNotationPadding}
                ${tableCollisionPoint.x - EdgeNotationPadding},${tableCollisionPoint.y} 
            `}
            stroke="#b1b1b7"
            strokeWidth={1}
            style={{fill: "none", }}
        />
    )
}

export function getEdgePath(pathType: string, edgeArgs: { 
    sourceX: number,
    sourceY: number,
    sourcePosition: Position,
    targetX: number,
    targetY: number,
    targetPosition: Position
}) {
    const [edgePath] = 
    "simplebezier" === pathType ?   getBezierPath(edgeArgs) :
    "default" === pathType ?        getBezierPath(edgeArgs) : 
    "smoothstep" === pathType ?     getSmoothStepPath(edgeArgs) : 
    "straight" === pathType ?       getStraightPath(edgeArgs) : 
                                    getBezierPath(edgeArgs)
    return edgePath;

}


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
  }: EdgeProps<EdgePayload>) {
    if (! data) { 
        console.error("Edge data payload was undefined!");
        return null;
    }
    const edgeArgs = { 
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition
    };
    const edgePath = getEdgePath(data.pathType, edgeArgs)

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', edgePath);
    let edgeSourceTableCollisionPoint = path.getPointAtLength(0);
    edgeSourceTableCollisionPoint.x += sourcePosition === "left" ? EdgeNotationPadding : -EdgeNotationPadding;
    let edgeTargetTableCollisionPoint = path.getPointAtLength(path.getTotalLength())
    edgeTargetTableCollisionPoint.x += targetPosition === "left" ? EdgeNotationPadding : -EdgeNotationPadding;

    return (
        <>
            <g onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                publish("e_onEdgeClick", { event: e, edgeId: id}) 
            }}>
                <line className='react-flow__edge-path'
                    x1={edgeTargetTableCollisionPoint.x} y1={edgeTargetTableCollisionPoint.y} 
                    x2={edgeTargetTableCollisionPoint.x - (targetPosition === "left" ? (EdgeNotationPadding) : -(EdgeNotationPadding))} y2={edgeTargetTableCollisionPoint.y} 
                    stroke='#b1b1b7' strokeWidth={1} style={{ fill: '#b1b1b7' }}
                />

                <circle className='react-flow__edge-path' cx={edgeTargetTableCollisionPoint.x + (targetPosition === "left" ? -3 : 3)} cy={edgeTargetTableCollisionPoint.y} r={2} stroke='#b1b1b7' strokeWidth={1} style={{ fill: '#b1b1b7' }}  />
                
                <BaseEdge interactionWidth={20} id={id} path={edgePath} style={style} />
                { sourcePosition === Position.Left ?
                <ManyLeft tableCollisionPoint={ edgeSourceTableCollisionPoint } />
                : sourcePosition === Position.Right ? 
                <ManyRight tableCollisionPoint={ edgeSourceTableCollisionPoint } />
                : null}
            </g>
        </>
    );
};