import { useState } from "react";
import { useLocation } from "wouter";
import { useCircuitStore } from "@/lib/store";
import { motion } from "framer-motion";
import { Cpu, ArrowRight } from "lucide-react";

export default function Setup() {
  const [meshes, setMeshes] = useState(2);
  const [, setLocation] = useLocation();
  const setStoreN = useCircuitStore((s) => s.setN);

  const handleStart = () => {
    setStoreN(meshes);
    setLocation("/simulator");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel w-full max-w-lg p-8 rounded-xl relative overflow-hidden"
      >
        {/* Decorative Corner */}
        <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-primary rounded-tr-xl opacity-50" />
        <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-primary rounded-bl-xl opacity-50" />

        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-primary/10 rounded-lg border border-primary/30">
            <Cpu className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold text-white">
              CONFIGURAÇÃO
            </h2>
            <p className="text-primary/60 text-sm font-mono">
              DEFINIR PARÂMETROS INICIAIS
            </p>
          </div>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <label className="block text-sm font-mono text-muted-foreground">
              NÚMERO DE MALHAS
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="10"
                value={meshes}
                onChange={(e) => setMeshes(parseInt(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <span className="font-display text-4xl font-bold text-primary w-12 text-center">
                {meshes}
              </span>
            </div>
          </div>

          <button
            onClick={handleStart}
            className="w-full py-4 bg-gradient-to-r from-primary to-secondary text-white font-display font-bold text-lg rounded hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
          >
            CARREGAR SIMULAÇÃO <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
