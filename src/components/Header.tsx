import { motion } from 'framer-motion';
import { ThemeToggle } from './ThemeToggle';
import { Cpu } from 'lucide-react';

export function Header() {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-between py-4 px-6 border-b border-border/50"
    >
      <div className="flex items-center gap-3">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="relative"
        >
          <Cpu className="w-10 h-10 text-primary" />
          <div className="absolute inset-0 blur-md bg-primary/30 rounded-full" />
        </motion.div>
        <div>
          <h1 className="text-2xl md:text-3xl font-orbitron font-bold tracking-wider neon-text">
            NEOLUM
          </h1>
          <p className="text-xs text-muted-foreground tracking-widest uppercase">
            Visualizador de Autómatas
          </p>
        </div>
      </div>
      <ThemeToggle />
    </motion.header>
  );
}
