import React from 'react';
import { BaseEdge, ConnectionLineComponentProps, Position } from 'reactflow';
import ErdEdge, { EdgeNotationPadding, ManyLeft, ManyRight, getEdgePath } from './ErdEdge';
import { handleSize as HANDLE_SIZE } from './DrawTable';

export default ({
  fromX,
  fromY,
  fromPosition,
  toX,
  toY,
  toPosition,
  connectionLineType,
  connectionLineStyle,
}: ConnectionLineComponentProps) => {
  // needed to adjust the edge source to begin from the left or right side of the handle, not the handle center
  const sourceX = 
    "left" === fromPosition ? fromX - (HANDLE_SIZE / 2) : 
    "right" === fromPosition ? fromX + (HANDLE_SIZE / 2) :
    -1; // not supported
  const edgeArgs = { 
      sourceX: sourceX,
      sourceY: fromY,
      sourcePosition: fromPosition,
      targetX: toX,
      targetY: toY,
      targetPosition: toPosition
  };

  const edgePath = getEdgePath("straight", edgeArgs);

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', edgePath);
  let edgeSourceTableCollisionPoint = path.getPointAtLength(0);
  edgeSourceTableCollisionPoint.x += fromPosition === "left" ? EdgeNotationPadding : -EdgeNotationPadding;
  
  return (
    <>
      <g>
          <circle className='react-flow__edge-path' cx={toX} cy={toY} r={2} stroke='#b1b1b7' strokeWidth={1} style={{ fill: '#b1b1b7' }}  />
          
          <BaseEdge id={"hoverEdge"} path={edgePath} style={connectionLineStyle} />
          { 
          fromPosition === Position.Left ?
            <ManyLeft tableCollisionPoint={{ x: edgeSourceTableCollisionPoint.x, y: edgeSourceTableCollisionPoint.y }} />
            : fromPosition === Position.Right ? 
            <ManyRight tableCollisionPoint={{ x: edgeSourceTableCollisionPoint.x, y: edgeSourceTableCollisionPoint.y }} />
            : null
          }
      </g>
  </>
  );
};