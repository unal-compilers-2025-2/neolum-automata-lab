import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ListTree, Play, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface InputPanelProps {
  onRegexSubmit: (regex: string) => void;
  onEdgeListSubmit: (edges: string) => void;
}

export function InputPanel({ onRegexSubmit, onEdgeListSubmit }: InputPanelProps) {
  const [activeTab, setActiveTab] = useState<'regex' | 'edges'>('regex');
  const [regex, setRegex] = useState('');
  const [edgeList, setEdgeList] = useState('');

  const handleSubmit = () => {
    if (activeTab === 'regex' && regex.trim()) {
      onRegexSubmit(regex.trim());
    } else if (activeTab === 'edges' && edgeList.trim()) {
      onEdgeListSubmit(edgeList.trim());
    }
  };

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="neon-box rounded-xl p-6 h-full flex flex-col"
    >
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('regex')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-sm transition-all duration-300 ${
            activeTab === 'regex'
              ? 'bg-primary/20 text-primary border border-primary/50 glow-cyan'
              : 'bg-muted/30 text-muted-foreground hover:bg-muted/50'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Expresión Regular
        </button>
        <button
          onClick={() => setActiveTab('edges')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-sm transition-all duration-300 ${
            activeTab === 'edges'
              ? 'bg-primary/20 text-primary border border-primary/50 glow-cyan'
              : 'bg-muted/30 text-muted-foreground hover:bg-muted/50'
          }`}
        >
          <ListTree className="w-4 h-4" />
          Lista de Aristas
        </button>
      </div>

      {/* Input area */}
      <AnimatePresence mode="wait">
        {activeTab === 'regex' ? (
          <motion.div
            key="regex"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex-1 flex flex-col gap-4"
          >
            <div className="flex items-center gap-2">
              <label className="text-sm font-mono text-muted-foreground">
                Expresión Regular
              </label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-sm">
                    Operadores soportados:<br />
                    <code className="text-primary">*</code> - Clausura de Kleene<br />
                    <code className="text-primary">+</code> - Una o más repeticiones<br />
                    <code className="text-primary">?</code> - Opcional<br />
                    <code className="text-primary">|</code> - Unión (OR)<br />
                    <code className="text-primary">()</code> - Agrupación
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Input
              value={regex}
              onChange={(e) => setRegex(e.target.value)}
              placeholder="Ejemplo: (a|b)*abb"
              className="neon-input font-mono text-lg h-14"
            />
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Ejemplos:</p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li><code className="text-primary cursor-pointer hover:underline" onClick={() => setRegex('(a|b)*abb')}>(a|b)*abb</code> - Cadenas que terminan en "abb"</li>
                <li><code className="text-primary cursor-pointer hover:underline" onClick={() => setRegex('a*b*')}> a*b*</code> - Cero o más a's seguidas de cero o más b's</li>
                <li><code className="text-primary cursor-pointer hover:underline" onClick={() => setRegex('(ab)+')}>  (ab)+</code> - Una o más repeticiones de "ab"</li>
              </ul>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="edges"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex-1 flex flex-col gap-4"
          >
            <div className="flex items-center gap-2">
              <label className="text-sm font-mono text-muted-foreground">
                Lista de Aristas (NFA-λ)
              </label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-sm">
                    Formato: <code>estado_origen, símbolo, estado_destino</code><br />
                    Use <code>e</code> o <code>λ</code> para transiciones epsilon.<br />
                    Agregue <code>accept: estado1, estado2</code> para estados de aceptación.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Textarea
              value={edgeList}
              onChange={(e) => setEdgeList(e.target.value)}
              placeholder={`q0, a, q1
q1, b, q2
q1, e, q0
accept: q2`}
              className="neon-input font-mono flex-1 min-h-[200px] resize-none"
            />
            <div className="text-xs text-muted-foreground">
              <p>El primer estado listado será el estado inicial.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit button */}
      <motion.div className="mt-6">
        <Button
          onClick={handleSubmit}
          className="w-full neon-button h-12 text-lg font-orbitron"
          disabled={activeTab === 'regex' ? !regex.trim() : !edgeList.trim()}
        >
          <Play className="w-5 h-5 mr-2" />
          Generar Autómatas
        </Button>
      </motion.div>
    </motion.div>
  );
}
