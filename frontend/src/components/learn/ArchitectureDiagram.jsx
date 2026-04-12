import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Data-driven architecture diagram for system design question breakdowns.
 * 
 * Props:
 *   nodes: [{ id, label, sublabel?, icon?, color?, x, y, w?, h? }]
 *   edges: [{ from, to, label?, dashed?, color? }]
 *   width?: number (SVG viewBox width, default 800)
 *   height?: number (SVG viewBox height, default 400)
 *   title?: string
 *   caption?: string
 */

const COLORS = {
  blue:   { bg: 'var(--blue-bg)',   border: 'var(--blue-border)',   text: 'var(--blue)' },
  green:  { bg: 'var(--green-bg)',  border: 'var(--green-border)',  text: 'var(--green)' },
  red:    { bg: 'var(--red-bg)',    border: 'var(--red-border)',    text: 'var(--red)' },
  yellow: { bg: 'var(--yellow-bg)', border: 'var(--yellow-border)', text: 'var(--yellow)' },
  purple: { bg: 'var(--purple-bg)', border: 'var(--purple-border)', text: 'var(--purple)' },
  cyan:   { bg: 'var(--cyan-bg)',   border: 'var(--cyan-border)',   text: 'var(--cyan)' },
  orange: { bg: 'var(--orange-bg)', border: 'var(--orange-border)', text: 'var(--orange)' },
  gray:   { bg: 'var(--bg-tertiary)', border: 'var(--border-primary)', text: 'var(--text-muted)' },
};

const ArchitectureDiagram = ({ nodes = [], edges = [], width = 800, height = 400, title, caption }) => {
  const { theme } = useTheme();

  const getNodeCenter = (node) => ({
    cx: node.x + (node.w || 120) / 2,
    cy: node.y + (node.h || 56) / 2,
  });

  const getEdgePath = (fromNode, toNode) => {
    const from = getNodeCenter(fromNode);
    const to = getNodeCenter(toNode);
    const fw = (fromNode.w || 120) / 2;
    const fh = (fromNode.h || 56) / 2;
    const tw = (toNode.w || 120) / 2;
    const th = (toNode.h || 56) / 2;

    const dx = to.cx - from.cx;
    const dy = to.cy - from.cy;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    let sx, sy, ex, ey;

    // Determine exit/entry points based on direction
    if (absDx > absDy) {
      // Horizontal dominant
      sx = from.cx + (dx > 0 ? fw : -fw);
      sy = from.cy;
      ex = to.cx + (dx > 0 ? -tw : tw);
      ey = to.cy;
    } else {
      // Vertical dominant
      sx = from.cx;
      sy = from.cy + (dy > 0 ? fh : -fh);
      ex = to.cx;
      ey = to.cy + (dy > 0 ? -th : th);
    }

    // Curved path
    const midX = (sx + ex) / 2;
    const midY = (sy + ey) / 2;
    if (absDx > absDy) {
      return `M ${sx} ${sy} C ${midX} ${sy}, ${midX} ${ey}, ${ex} ${ey}`;
    } else {
      return `M ${sx} ${sy} C ${sx} ${midY}, ${ex} ${midY}, ${ex} ${ey}`;
    }
  };

  const nodeMap = {};
  nodes.forEach(n => { nodeMap[n.id] = n; });

  return (
    <div className={`mb-8 ${theme.bg.card} ${theme.border.primary} border rounded-2xl overflow-hidden`}>
      {title && (
        <div className={`px-6 py-3 border-b ${theme.border.primary}`}>
          <h3 className={`font-semibold ${theme.text.primary}`}>{title}</h3>
          {caption && <p className={`text-sm ${theme.text.muted} mt-1`}>{caption}</p>}
        </div>
      )}
      <div className="p-4 overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full max-w-3xl mx-auto"
          style={{ minWidth: '500px' }}
        >
          {/* Arrowhead marker */}
          <defs>
            <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="var(--text-muted)" />
            </marker>
            <marker id="arrowhead-accent" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="var(--accent)" />
            </marker>
          </defs>

          {/* Edges */}
          {edges.map((edge, i) => {
            const fromNode = nodeMap[edge.from];
            const toNode = nodeMap[edge.to];
            if (!fromNode || !toNode) return null;
            const path = getEdgePath(fromNode, toNode);
            const color = edge.color === 'accent' ? 'var(--accent)' : 'var(--text-muted)';
            const markerId = edge.color === 'accent' ? 'arrowhead-accent' : 'arrowhead';

            return (
              <g key={i}>
                <path
                  d={path}
                  fill="none"
                  stroke={color}
                  strokeWidth="1.5"
                  strokeDasharray={edge.dashed ? '6 4' : 'none'}
                  markerEnd={`url(#${markerId})`}
                  opacity="0.7"
                />
                {edge.label && (() => {
                  const from = getNodeCenter(fromNode);
                  const to = getNodeCenter(toNode);
                  const lx = (from.cx + to.cx) / 2;
                  const ly = (from.cy + to.cy) / 2 - 8;
                  return (
                    <text x={lx} y={ly} textAnchor="middle" fontSize="10" fill={color} fontFamily="var(--font-primary)">
                      {edge.label}
                    </text>
                  );
                })()}
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => {
            const c = COLORS[node.color || 'gray'];
            const w = node.w || 120;
            const h = node.h || 56;
            return (
              <g key={node.id}>
                <rect
                  x={node.x} y={node.y} width={w} height={h}
                  rx="10" ry="10"
                  fill={c.bg} stroke={c.border} strokeWidth="1.5"
                />
                {node.icon && (
                  <text x={node.x + w / 2} y={node.y + (node.sublabel ? 18 : 24)} textAnchor="middle" fontSize="16">
                    {node.icon}
                  </text>
                )}
                <text
                  x={node.x + w / 2}
                  y={node.y + (node.icon ? (node.sublabel ? 34 : 40) : (node.sublabel ? h / 2 - 4 : h / 2 + 4))}
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="600"
                  fill={c.text}
                  fontFamily="var(--font-primary)"
                >
                  {node.label}
                </text>
                {node.sublabel && (
                  <text
                    x={node.x + w / 2}
                    y={node.y + (node.icon ? 48 : h / 2 + 14)}
                    textAnchor="middle"
                    fontSize="9"
                    fill="var(--text-muted)"
                    fontFamily="var(--font-primary)"
                  >
                    {node.sublabel}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default ArchitectureDiagram;
