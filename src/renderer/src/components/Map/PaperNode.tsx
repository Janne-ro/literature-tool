import React, { memo } from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import { Paper } from '../../types/paper'
import { getNodeColor } from '../../utils/colorUtils'
import { formatAuthors } from '../../utils/csvUtils'

export type PaperNodeData = {
  paper: Paper
  labelMode: 'title' | 'authors'
  selected: boolean
  aiHighlighted: boolean
}

/** Invisible handle style — still required by React Flow for edge connectivity */
const hiddenHandle: React.CSSProperties = { opacity: 0, pointerEvents: 'none' }

function PaperNode({ data }: NodeProps): JSX.Element {
  const { paper, labelMode, selected, aiHighlighted } = data as PaperNodeData
  const color = getNodeColor(paper.tags)
  const label =
    labelMode === 'authors' ? formatAuthors(paper.authors) || paper.title : paper.title

  return (
    <div
      className={[
        'paper-node',
        selected ? 'paper-node--selected' : '',
        aiHighlighted ? 'paper-node--ai-highlight' : ''
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ '--node-color': color } as React.CSSProperties}
    >
      {/* Four invisible handles on every side — FloatingEdge picks its own attach point */}
      <Handle id="t" type="target"  position={Position.Top}    style={hiddenHandle} />
      <Handle id="r" type="source"  position={Position.Right}  style={hiddenHandle} />
      <Handle id="b" type="source"  position={Position.Bottom} style={hiddenHandle} />
      <Handle id="l" type="target"  position={Position.Left}   style={hiddenHandle} />

      <div className="paper-node-color-bar" style={{ background: color }} />

      <div className="paper-node-content">
        <div className="paper-node-label" title={label}>
          {label}
        </div>
        <div className="paper-node-year">{paper.year}</div>
        {paper.tags.length > 0 && (
          <div className="paper-node-tag" style={{ background: color + '33', color }}>
            {paper.tags[0]}
          </div>
        )}
      </div>
    </div>
  )
}

export default memo(PaperNode)
