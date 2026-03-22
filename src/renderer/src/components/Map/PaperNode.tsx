import React, { memo } from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import { Paper } from '../../types/paper'
import { getNodeColor } from '../../utils/colorUtils'
import { formatAuthors } from '../../utils/csvUtils'

export type PaperNodeData = {
  paper: Paper
  labelMode: 'title' | 'authors'
  selected: boolean
}

function PaperNode({ data }: NodeProps): JSX.Element {
  const { paper, labelMode, selected } = data as PaperNodeData
  const color = getNodeColor(paper.tags)
  const label =
    labelMode === 'authors' ? formatAuthors(paper.authors) || paper.title : paper.title

  return (
    <div
      className={`paper-node ${selected ? 'paper-node--selected' : ''}`}
      style={{ '--node-color': color } as React.CSSProperties}
    >
      <Handle type="target" position={Position.Left} className="paper-node-handle" />

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

      <Handle type="source" position={Position.Right} className="paper-node-handle" />
    </div>
  )
}

export default memo(PaperNode)
