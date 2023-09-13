import { FC } from 'react';
import { EdgeProps, getBezierPath, EdgeLabelRenderer, BaseEdge } from 'reactflow';

function EdgeLabel({ transform, label }: { transform: string; label: string }) {
    return (
        <div
            style={{
                position: 'absolute',
                background: 'transparent',
                color: '#ff5050',
                fontSize: 12,
                fontWeight: 700,
                transform,
                padding: "20px"
            }}
            className="nodrag nopan"
        >
            {label}
        </div>
    );
}


export default function LabeledEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    data
  }: EdgeProps) {
    const [edgePath] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });
  
    return (
      <>
        <BaseEdge id={id} path={edgePath} />
        <EdgeLabelRenderer>
            {data.startLabel && (
                <EdgeLabel
                    transform={`translate(-50%, 0%) translate(${sourceX}px,${sourceY}px)`}
                    label={data.startLabel}
                />
            )}
            {data.endLabel && (
                <EdgeLabel
                    transform={`translate(-50%, -100%) translate(${targetX}px,${targetY}px)`}
                    label={data.endLabel}
                />
            )}
        </EdgeLabelRenderer>
      </>
    );
};

