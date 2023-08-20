

import React, { useCallback } from 'react';
import ReactFlow, { useNodesState, useEdgesState, addEdge, MiniMap, Background, Controls, Position, BackgroundVariant } from 'demo-reactflow--reactflow';
import 'demo-reactflow--reactflow/dist/style.css';
import { Link } from 'react-router-dom';


const initialNodes = [
    { id: '1', position: { x: 0, y: 0 }, data: { label: '1' } },
    { id: '2', position: { x: 0, y: 100 }, data: { label: '2' } },
  ];
const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }];

export default function ReactFlowGettingStarted() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback((params: any) => setEdges((eds) => addEdge(params, eds)), [setEdges]);


  return (
    <div>
        <Link to="/internal">go back</Link>
        <h1>React Flow getting started demo</h1>
        <div style={{ width: '100vw', height: '600px' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
            >
                <Controls />
                <MiniMap />
                <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            </ReactFlow>
        </div>
    </div>
  );
};
