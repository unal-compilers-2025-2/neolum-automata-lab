import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Automaton } from '@/lib/automata';
import { AutomataGraph } from './AutomataGraph';
import { Zap, GitBranch, CheckCircle2 } from 'lucide-react';

interface VisualizationPanelProps {
  nfaLambda: Automaton | null;
  nfa: Automaton | null;
  dfa: Automaton | null;
}

type TabType = 'nfa-lambda' | 'nfa' | 'dfa';

const tabs: { id: TabType; label: string; icon: typeof Zap }[] = [
  { id: 'nfa-lambda', label: 'NFA-λ', icon: Zap },
  { id: 'nfa', label: 'NFA', icon: GitBranch },
  { id: 'dfa', label: 'DFA', icon: CheckCircle2 },
];

export function VisualizationPanel({ nfaLambda, nfa, dfa }: VisualizationPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('nfa-lambda');

  const getCurrentAutomaton = () => {
    switch (activeTab) {
      case 'nfa-lambda':
        return nfaLambda;
      case 'nfa':
        return nfa;
      case 'dfa':
        return dfa;
    }
  };

  const getTitle = () => {
    switch (activeTab) {
      case 'nfa-lambda':
        return 'Autómata Finito No Determinista con Transiciones λ';
      case 'nfa':
        return 'Autómata Finito No Determinista';
      case 'dfa':
        return 'Autómata Finito Determinista';
    }
  };

  const currentAutomaton = getCurrentAutomaton();

  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="neon-box-magenta rounded-xl p-6 h-full flex flex-col"
    >
      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isDisabled = 
            (tab.id === 'nfa-lambda' && !nfaLambda) ||
            (tab.id === 'nfa' && !nfa) ||
            (tab.id === 'dfa' && !dfa);

          return (
            <button
              key={tab.id}
              onClick={() => !isDisabled && setActiveTab(tab.id)}
              disabled={isDisabled}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-sm transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-secondary/20 text-secondary border border-secondary/50 glow-magenta'
                  : isDisabled
                  ? 'bg-muted/10 text-muted-foreground/50 cursor-not-allowed'
                  : 'bg-muted/30 text-muted-foreground hover:bg-muted/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Visualization area */}
      <div className="flex-1 relative rounded-lg bg-background/50 border border-border/30 overflow-hidden">
        <AnimatePresence mode="wait">
          {currentAutomaton ? (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="p-4 h-full"
            >
              <AutomataGraph automaton={currentAutomaton} title={getTitle()} />
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-full text-muted-foreground"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 1, 0.5] 
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  ease: "easeInOut" 
                }}
                className="w-24 h-24 rounded-full border-2 border-dashed border-primary/30 flex items-center justify-center mb-4"
              >
                <Zap className="w-10 h-10 text-primary/50" />
              </motion.div>
              <p className="text-lg font-mono">Ingresa una expresión regular</p>
              <p className="text-sm">o una lista de aristas para visualizar</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grid overlay effect */}
        <div className="absolute inset-0 grid-bg pointer-events-none opacity-30" />
      </div>

      {/* Stats */}
      {currentAutomaton && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex gap-6 text-sm"
        >
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Estados:</span>
            <span className="text-primary font-mono font-bold">{currentAutomaton.states.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Transiciones:</span>
            <span className="text-primary font-mono font-bold">{currentAutomaton.transitions.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Alfabeto:</span>
            <span className="text-secondary font-mono font-bold">
              {'{' + currentAutomaton.alphabet.join(', ') + '}'}
            </span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
