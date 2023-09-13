import { EdgeProps, getBezierPath, getSmoothStepPath, BaseEdge } from 'reactflow';


type Payload = {
    pathType: "smoothstep" | "default" | "straight" | "step" | "simplebezier"
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
    const sourcePointMarkerPosition = path.getPointAtLength(0);
    const targetPointMarkerPosition = path.getPointAtLength(path.getTotalLength() - 2);
    const crowFootLenght = 7;

    return (
        <>
            <circle className='react-flow__edge-path' cx={targetPointMarkerPosition.x} cy={targetPointMarkerPosition.y} r={2} stroke='#b1b1b7' strokeWidth={1} style={{ fill: '#b1b1b7' }}  />
            <BaseEdge id={id} path={edgePath} style={style} />
            <polygon
                className="react-flow__edge-path"
                points={`
                    ${sourcePointMarkerPosition.x - crowFootLenght},${sourcePointMarkerPosition.y} 
                    ${sourcePointMarkerPosition.x},${sourcePointMarkerPosition.y - Math.tan((30 * Math.PI) / 180) * crowFootLenght} 
                    ${sourcePointMarkerPosition.x + crowFootLenght},${sourcePointMarkerPosition.y} 
                    ${sourcePointMarkerPosition.x},${sourcePointMarkerPosition.y + Math.tan((30 * Math.PI) / 180) * crowFootLenght}
                `}
                stroke="#b1b1b7"
                strokeWidth={1}
                style={{fill: "none", }}
            />
        </>
    );
};