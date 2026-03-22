import React, { useCallback, useEffect, useMemo } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  NodeDragHandler,
  OnNodesChange,
  OnEdgesChange,
  applyNodeChanges,
  applyEdgeChanges,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  MarkerType
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { usePapers } from '../../context/PaperContext'
import { getNodeColor } from '../../utils/colorUtils'
import PaperNode, { PaperNodeData } from './PaperNode'

const nodeTypes = { paper: PaperNode }

export default function LiteratureMap(): JSX.Element {
  const {
    filteredPapers,
    layout,
    selectedPaperId,
    labelMode,
    selectPaper,
    updateNodePosition
  } = usePapers()

  const filteredIds = useMemo(() => new Set(filteredPapers.map((p) => p.id)), [filteredPapers])

  // Build ReactFlow nodes
  const rfNodes: Node[] = useMemo(() => {
    return filteredPapers.map((paper) => ({
      id: paper.id,
      type: 'paper',
      position: layout[paper.id] ?? { x: 0, y: 0 },
      data: {
        paper,
        labelMode,
        selected: paper.id === selectedPaperId
      } satisfies PaperNodeData,
      selected: paper.id === selectedPaperId
    }))
  }, [filteredPapers, layout, labelMode, selectedPaperId])

  // Build ReactFlow edges from relatedPapers (only between visible nodes)
  const rfEdges: Edge[] = useMemo(() => {
    const edges: Edge[] = []
    for (const paper of filteredPapers) {
      for (const rel of paper.relatedPapers) {
        if (filteredIds.has(rel.targetId)) {
          edges.push({
            id: `${paper.id}->${rel.targetId}`,
            source: paper.id,
            target: rel.targetId,
            label: rel.label || undefined,
            labelStyle: { fill: '#a0a0b8', fontSize: 11 },
            labelBgStyle: { fill: '#1a1a2e', fillOpacity: 0.85 },
            style: { stroke: '#4a4a6a', strokeWidth: 1.5 },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#4a4a6a' }
          })
        }
      }
    }
    return edges
  }, [filteredPapers, filteredIds])

  const [nodes, setNodes, onNodesChange] = useNodesState(rfNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(rfEdges)

  // Sync when rfNodes/rfEdges change (filter, label mode, selection)
  useEffect(() => {
    setNodes(rfNodes)
  }, [rfNodes, setNodes])

  useEffect(() => {
    setEdges(rfEdges)
  }, [rfEdges, setEdges])

  const onNodeDragStop: NodeDragHandler = useCallback(
    (_, node) => {
      updateNodePosition(node.id, node.position)
    },
    [updateNodePosition]
  )

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      selectPaper(node.id)
    },
    [selectPaper]
  )

  const onPaneClick = useCallback(() => {
    selectPaper(null)
  }, [selectPaper])

  return (
    <div className="literature-map">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange as OnNodesChange}
        onEdgesChange={onEdgesChange as OnEdgesChange}
        onNodeDragStop={onNodeDragStop}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2.5}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          color="#2d2d3d"
          gap={20}
          size={1}
        />
        <Controls
          style={{
            background: '#1a1a24',
            border: '1px solid #2d2d3d',
            borderRadius: 8
          }}
        />
        <MiniMap
          nodeColor={(n) => {
            const paper = filteredPapers.find((p) => p.id === n.id)
            return paper ? getNodeColor(paper.tags) : '#6b7280'
          }}
          style={{
            background: '#12121a',
            border: '1px solid #2d2d3d',
            borderRadius: 8
          }}
          maskColor="#0f0f1388"
        />
      </ReactFlow>
    </div>
  )
}
