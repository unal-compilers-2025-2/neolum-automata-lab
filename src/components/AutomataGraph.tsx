import { motion } from 'framer-motion';
import { Automaton } from '@/lib/automata';
import { useMemo } from 'react';

interface AutomataGraphProps {
  automaton: Automaton;
  title: string;
}

interface NodePosition {
  x: number;
  y: number;
}

export function AutomataGraph({ automaton, title }: AutomataGraphProps) {
  const { states, transitions } = automaton;

  // Calculate node positions in a circular layout
  const nodePositions = useMemo(() => {
    const positions: Map<string, NodePosition> = new Map();
    const centerX = 300;
    const centerY = 200;
    const radius = Math.min(150, 50 + states.length * 20);

    states.forEach((state, index) => {
      const angle = (2 * Math.PI * index) / states.length - Math.PI / 2;
      positions.set(state.id, {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      });
    });

    return positions;
  }, [states]);

  // Group transitions by from-to pair
  const groupedTransitions = useMemo(() => {
    const groups = new Map<string, string[]>();
    transitions.forEach(t => {
      const key = `${t.from}-${t.to}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(t.symbol);
    });
    return groups;
  }, [transitions]);

  const renderArrow = (from: NodePosition, to: NodePosition, symbols: string[], isSelfLoop: boolean, index: number) => {
    const nodeRadius = 25;
    
    if (isSelfLoop) {
      // Self-loop
      const loopRadius = 20;
      const startAngle = -Math.PI / 4;
      const cx = from.x;
      const cy = from.y - nodeRadius - loopRadius;
      
      return (
        <g key={`transition-${index}`}>
          <motion.path
            d={`M ${from.x - 10} ${from.y - nodeRadius} 
                C ${from.x - 30} ${from.y - nodeRadius - 40}, 
                  ${from.x + 30} ${from.y - nodeRadius - 40}, 
                  ${from.x + 10} ${from.y - nodeRadius}`}
            fill="none"
            className="stroke-primary"
            strokeWidth="2"
            markerEnd="url(#arrowhead)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          />
          <motion.text
            x={from.x}
            y={from.y - nodeRadius - 35}
            textAnchor="middle"
            className="fill-secondary text-sm font-mono font-bold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 + index * 0.1 }}
          >
            {symbols.join(', ')}
          </motion.text>
        </g>
      );
    }

    // Calculate direction vector
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const unitX = dx / dist;
    const unitY = dy / dist;

    // Adjust start and end points to be on the edge of nodes
    const startX = from.x + unitX * nodeRadius;
    const startY = from.y + unitY * nodeRadius;
    const endX = to.x - unitX * (nodeRadius + 8);
    const endY = to.y - unitY * (nodeRadius + 8);

    // Curve the line slightly for bidirectional edges
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;
    const perpX = -unitY * 20;
    const perpY = unitX * 20;

    return (
      <g key={`transition-${index}`}>
        <motion.path
          d={`M ${startX} ${startY} Q ${midX + perpX} ${midY + perpY} ${endX} ${endY}`}
          fill="none"
          className="stroke-primary"
          strokeWidth="2"
          markerEnd="url(#arrowhead)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        />
        <motion.text
          x={midX + perpX * 0.8}
          y={midY + perpY * 0.8}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-secondary text-sm font-mono font-bold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 + index * 0.1 }}
        >
          {symbols.join(', ')}
        </motion.text>
      </g>
    );
  };

  if (states.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>No hay autómata para mostrar</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      <h3 className="text-lg font-orbitron neon-text mb-4">{title}</h3>
      <div className="flex-1 relative">
        <svg viewBox="0 0 600 400" className="w-full h-full">
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                className="fill-primary"
              />
            </marker>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Render transitions */}
          {Array.from(groupedTransitions.entries()).map(([key, symbols], index) => {
            const [fromId, toId] = key.split('-');
            const from = nodePositions.get(fromId);
            const to = nodePositions.get(toId);
            if (!from || !to) return null;
            return renderArrow(from, to, symbols, fromId === toId, index);
          })}

          {/* Render start arrow */}
          {states.map((state, index) => {
            if (!state.isStart) return null;
            const pos = nodePositions.get(state.id);
            if (!pos) return null;
            return (
              <motion.path
                key={`start-${state.id}`}
                d={`M ${pos.x - 60} ${pos.y} L ${pos.x - 28} ${pos.y}`}
                fill="none"
                className="stroke-neon-green"
                strokeWidth="2"
                markerEnd="url(#arrowhead)"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            );
          })}

          {/* Render states */}
          {states.map((state, index) => {
            const pos = nodePositions.get(state.id);
            if (!pos) return null;

            return (
              <motion.g
                key={state.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                {/* Accept state double circle */}
                {state.isAccept && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={30}
                    fill="none"
                    className="stroke-secondary"
                    strokeWidth="2"
                    filter="url(#glow)"
                  />
                )}
                {/* Main circle */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={25}
                  className={`fill-card stroke-primary ${state.isStart ? 'stroke-[3]' : 'stroke-2'}`}
                  filter="url(#glow)"
                />
                {/* State label */}
                <text
                  x={pos.x}
                  y={pos.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-foreground text-sm font-mono font-bold"
                >
                  {state.id}
                </text>
              </motion.g>
            );
          })}
        </svg>
      </div>
      
      {/* Legend */}
      <div className="flex gap-6 mt-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full border-2 border-neon-green" />
          <span>Inicio</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full border-2 border-secondary">
            <div className="w-2 h-2 rounded-full border border-secondary m-0.5" />
          </div>
          <span>Aceptación</span>
        </div>
      </div>
    </div>
  );
}
