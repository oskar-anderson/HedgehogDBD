import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "./../components/Layout"
import ReactFlow, { useNodesState, useEdgesState, addEdge, MiniMap, Background, Controls, Position, BackgroundVariant, NodeChange, NodePositionChange } from 'demo-reactflow--reactflow';
import DrawTable from "../components/drawChildren/DrawTable";
import 'demo-reactflow--reactflow/dist/style.css';
import { TOP_TOOLBAR_HEIGHT_PX } from "../components/TopToolbarAction"
import SecondaryTopToolbar, { SECONDARY_TOOLBAR_HEIGHT_PX } from "../components/drawChildren/SecondaryTopToolbar";
import CommandMoveTableRelative, { CommandMoveTableRelativeArgs } from "../commands/appCommands/CommandMoveTableRelative"
import ManagerSingleton from "../ManagerSingleton";


// nodeTypes need to be defined outside the render function or using memo
const nodeTypes = { 
    tableNode: DrawTable
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

export default function draw() {
    const draw = ManagerSingleton.getDraw();
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    let nodeDraggedChanges: NodePositionChange[] = [];
    const onNodesChangeAfterListener = (nodeChanges: NodeChange[]) => {
        if (nodeChanges.every(x => x.type === "position")) {
            if (nodeChanges.length !== 1) throw Error("Unexpected nodeChanges array lenght!")
            let nodeChange = nodeChanges[0] as NodePositionChange;
            nodeDraggedChanges.push(nodeChange);

            // console.log(nodeChange);
            if (! nodeChange.dragging) {
                if (nodeDraggedChanges.length <= 2) {
                    return
                }
                const startPosition = nodeDraggedChanges[0];
                const endPosition = nodeDraggedChanges[nodeChanges.length - 2];
                const command = new CommandMoveTableRelative(draw, new CommandMoveTableRelativeArgs(
                    nodeChange.id, 
                    startPosition.position!.x - endPosition.position!.x, 
                    startPosition.position!.y - endPosition.position!.y
                ));
                draw.history.execute(command);
                nodeDraggedChanges = [];
            } else {
              onNodesChange(nodeChanges);
            }
        }
        else {
            onNodesChange(nodeChanges);
        }
    }

    useEffect(() => {
        const attribution = document.querySelector(".react-flow__attribution");
        const attribuitionTextElement = attribution?.children[0] as HTMLLinkElement;
        attribuitionTextElement!.innerHTML = "HedgehogDBD uses React Flow";
        // attribuitionTextElement!.href = "https://github.com/oskar-anderson/RasterModeler";
    }, [])

    return <>
        <Layout currentlyLoadedLink={"Draw"}>
            <SecondaryTopToolbar />
            <div style={{ width: '100vw', height: `calc(100vh - ${TOP_TOOLBAR_HEIGHT_PX}px  - ${SECONDARY_TOOLBAR_HEIGHT_PX}px)` }}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={nodeTypes}
                    onNodesChange={onNodesChangeAfterListener}
                    onEdgesChange={onEdgesChange}
                >
                    <Controls />
                    <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
                </ReactFlow>
            </div>
        </Layout>
    </>
}