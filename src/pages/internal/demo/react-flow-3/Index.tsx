

import React, { useCallback, useMemo, useState } from 'react';
import ReactFlow, { useNodesState, useEdgesState, addEdge, MiniMap, Background, Controls, Position, BackgroundVariant } from 'demo-reactflow--reactflow';
import 'demo-reactflow--reactflow/dist/style.css';
import { Link } from 'react-router-dom';
import Table from "./Table"

// nodeTypes need to be defined outside the render function or using memo
const nodeTypes = { 
  tableNode: Table 
}
const initialNodes = [
    { 
      id: '1',
      type: "tableNode", 
      position: { x: 100, y: 200 },
      data: 
      {
        table: {
          position: {
            x: 0,
            y: 0
          },
          title: "person",
          rows: [
            {
                name: "id",
                type: "int"
            },
            {
                name: "firstname",
                type: "string"
            },
            {
                name: "lastname",
                type: "string"
            },
            {
                name: "email",
                type: "string"
            },
          ]
        }
      } 
    },
    { 
      id: '2', 
      type: "tableNode", 
      position: { x: 500, y: 200 }, 
      data: { 
        table: {
          position: {
            x: 0,
            y: 100
          },
          title: "registration",
          rows: [
            {
              name: "id",
              type: "int"
            },
            {
              name: "person_id",
              type: "int"
            },
            {
              name: "service_id",
              type: "int"
            }
          ]
        } 
      } 
    },
    { 
      id: '3',
      type: "tableNode", 
      position: { x: 900, y: 200 },
      data: 
      { 
        table: {  
          position: {
            x: 0,
            y: 200
          },
          title: "service",
          rows: [
            {
              name: "id",
              type: "int"
            },
            {
              name: "name",
              type: "string"
            }
          ]
        }
      } 
    }
  ];
const initialEdges = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e2-3', source: '2', target: '3' }
];

export default function ReactFlowGettingStarted() {
  /* @ts-ignore */
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const deleteTable = (i: number) => {
    setNodes([...nodes.filter((item: any, index: number) => index !== i)]);
  }
  const moveTable = (i: number) => {
    const node = nodes[i]!;
    const newNode = { ...node, position: { ...node.position, x: node.position.x + 10 } }
    setNodes([
      ...nodes.slice(0, i), 
      newNode, 
      ...nodes.slice(i + 1)
    ]);

  }

  const onConnect = useCallback((params: any) => setEdges((eds) => addEdge(params, eds)), [setEdges]);


  return (
    <div>
        <Link to="/internal">go back</Link>
        <h1>React Flow ERD prototype</h1>
        <div style={{ width: '100vw', height: '600px' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
            >
                <Controls />
                <MiniMap />
                <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            </ReactFlow>
        </div>
        <h3>Actions</h3>
        <div>
          <h4>Delete table</h4>
          { nodes.map((x, i) => {
            return (
              <div key={x.id} className="btn btn-danger" onClick={() => deleteTable(i)}>Delete {x.data.table.title}</div>
            )
          })}
          <h4>Move table</h4>
          { nodes.map((x, i) => {
            return (
              <div key={x.id} className="btn btn-primary" onClick={() => moveTable(i)}>Move {x.data.table.title} 10px right</div>
            )
          })}
        </div>

    </div>
  );
};
