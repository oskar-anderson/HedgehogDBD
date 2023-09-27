import { BaseEdge, EdgeProps, Position } from 'reactflow';
import { EdgeNotationPadding, ManyLeft, ManyRight, getEdgePath } from './ErdEdge';

export default function CursorEdge({
  sourceX,
  sourceY,
  sourcePosition,
  targetX,
  targetY,
  targetPosition,
  style,
}: EdgeProps) {
  const edgeArgs = { 
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition
  };

  const edgePath = getEdgePath("straight", edgeArgs);

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', edgePath);
  let edgeSourceTableCollisionPoint = path.getPointAtLength(0);
  edgeSourceTableCollisionPoint.x += sourcePosition === "left" ? EdgeNotationPadding : -EdgeNotationPadding;
  
  return (
    <>
      <g>
          <circle className='react-flow__edge-path' cx={sourceX} cy={sourceY} r={2} stroke='#b1b1b7' strokeWidth={1} style={{ fill: '#b1b1b7' }}  />
          
          <BaseEdge id={"hoverEdge"} path={edgePath} style={style} />
          { 
          sourcePosition === Position.Left ?
            <ManyLeft tableCollisionPoint={{ x: edgeSourceTableCollisionPoint.x, y: edgeSourceTableCollisionPoint.y }} />
            : sourcePosition === Position.Right ? 
            <ManyRight tableCollisionPoint={{ x: edgeSourceTableCollisionPoint.x, y: edgeSourceTableCollisionPoint.y }} />
            : null
          }
      </g>
  </>
  );
};