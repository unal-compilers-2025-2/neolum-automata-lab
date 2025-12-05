import { useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { InputPanel } from '@/components/InputPanel';
import { VisualizationPanel } from '@/components/VisualizationPanel';
import { 
  Automaton, 
  regexToNFALambda, 
  nfaLambdaToNFA, 
  nfaToDFA,
  parseEdgeList 
} from '@/lib/automata';
import { toast } from 'sonner';

const Index = () => {
  const [nfaLambda, setNfaLambda] = useState<Automaton | null>(null);
  const [nfa, setNfa] = useState<Automaton | null>(null);
  const [dfa, setDfa] = useState<Automaton | null>(null);

  const handleRegexSubmit = (regex: string) => {
    try {
      const nfaL = regexToNFALambda(regex);
      const nfaResult = nfaLambdaToNFA(nfaL);
      const dfaResult = nfaToDFA(nfaResult);

      setNfaLambda(nfaL);
      setNfa(nfaResult);
      setDfa(dfaResult);

      toast.success('Autómatas generados exitosamente', {
        description: `NFA-λ: ${nfaL.states.length} estados, NFA: ${nfaResult.states.length} estados, DFA: ${dfaResult.states.length} estados`,
      });
    } catch (error) {
      toast.error('Error al procesar la expresión regular', {
        description: 'Verifica la sintaxis de tu expresión',
      });
    }
  };

  const handleEdgeListSubmit = (edges: string) => {
    try {
      const nfaL = parseEdgeList(edges);
      const nfaResult = nfaLambdaToNFA(nfaL);
      const dfaResult = nfaToDFA(nfaResult);

      setNfaLambda(nfaL);
      setNfa(nfaResult);
      setDfa(dfaResult);

      toast.success('Autómatas generados exitosamente', {
        description: `NFA-λ: ${nfaL.states.length} estados, NFA: ${nfaResult.states.length} estados, DFA: ${dfaResult.states.length} estados`,
      });
    } catch (error) {
      toast.error('Error al procesar la lista de aristas', {
        description: 'Verifica el formato de entrada',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 grid-bg opacity-50" />
      <motion.div
        className="fixed top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px]"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="fixed bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[100px]"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.5, 0.3, 0.5],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen max-w-7xl mx-auto px-4">
        <Header />
        
        <main className="flex-1 py-8">
          <div className="grid lg:grid-cols-[400px_1fr] gap-6 h-full min-h-[600px]">
            <InputPanel
              onRegexSubmit={handleRegexSubmit}
              onEdgeListSubmit={handleEdgeListSubmit}
              dfa={dfa}
            />
            <VisualizationPanel
              nfaLambda={nfaLambda}
              nfa={nfa}
              dfa={dfa}
            />
          </div>
        </main>

        {/* Footer */}
        <footer className="py-4 text-center text-sm text-muted-foreground border-t border-border/30">
          <p className="font-mono">
            <span className="neon-text">NEOLUM</span>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
