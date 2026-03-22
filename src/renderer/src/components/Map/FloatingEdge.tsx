import React from 'react'
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  useInternalNode,
  Position,
  type EdgeProps
} from '@xyflow/react'

// Infer the InternalNode type from the hook so we stay compatible with any v12 patch
type INode = NonNullable<ReturnType<typeof useInternalNode>>

/** Absolute centre of a node */
function nodeCenter(node: INode): { x: number; y: number } {
  const { positionAbsolute } = node.internals
  const w = node.measured?.width ?? 150
  const h = node.measured?.height ?? 100
  return { x: positionAbsolute.x + w / 2, y: positionAbsolute.y + h / 2 }
}

/**
 * Find the point where the ray from the node's centre towards `target`
 * intersects the node's rectangular border, and which side it exits through.
 */
function borderIntersection(
  node: INode,
  target: { x: number; y: number }
): { x: number; y: number; position: Position } {
  const { positionAbsolute } = node.internals
  const w = node.measured?.width ?? 150
  const h = node.measured?.height ?? 100

  const cx = positionAbsolute.x + w / 2
  const cy = positionAbsolute.y + h / 2

  const dx = target.x - cx
  const dy = target.y - cy

  // Handle degenerate case (nodes exactly overlap)
  if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01) {
    return { x: cx + w / 2, y: cy, position: Position.Right }
  }

  // Parametric: smallest t > 0 such that the ray hits a wall
  // x-walls at ±w/2 → t = (w/2) / |dx|
  // y-walls at ±h/2 → t = (h/2) / |dy|
  const tx = Math.abs(dx) > 0.001 ? (w / 2) / Math.abs(dx) : Infinity
  const ty = Math.abs(dy) > 0.001 ? (h / 2) / Math.abs(dy) : Infinity
  const t = Math.min(tx, ty)

  const x = cx + dx * t
  const y = cy + dy * t

  // Which wall did we hit first?
  let position: Position
  if (tx <= ty) {
    position = dx > 0 ? Position.Right : Position.Left
  } else {
    position = dy > 0 ? Position.Bottom : Position.Top
  }

  return { x, y, position }
}

export default function FloatingEdge({
  id,
  source,
  target,
  markerEnd,
  style,
  label
}: EdgeProps): JSX.Element | null {
  const sourceNode = useInternalNode(source)
  const targetNode = useInternalNode(target)

  if (!sourceNode || !targetNode) return null

  const sourceCentre = nodeCenter(sourceNode)
  const targetCentre = nodeCenter(targetNode)

  const { x: sx, y: sy, position: sourcePosition } = borderIntersection(sourceNode, targetCentre)
  const { x: tx, y: ty, position: targetPosition } = borderIntersection(targetNode, sourceCentre)

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX: sx,
    sourceY: sy,
    sourcePosition,
    targetX: tx,
    targetY: ty,
    targetPosition
  })

  return (
    <>
      <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={style} />

      {label && (
        <EdgeLabelRenderer>
          <div
            className="nodrag nopan edge-label"
            style={{
              position: 'absolute',
              transform: `translate(-50%,-50%) translate(${labelX}px,${labelY}px)`
            }}
          >
            {String(label)}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}
