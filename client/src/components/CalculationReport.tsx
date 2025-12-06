import { useCircuitStore } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export function CalculationReport({ onClose }: { onClose: () => void }) {
  const { matrixR, vectorV, equations, I, currentUnit, setCurrentUnit } = useCircuitStore();

  if (!I || !matrixR || !vectorV) return null;

  const convertCurrent = (current: any, unit: 'A' | 'mA' | 'µA' | 'kA') => {
    const mult: { [key: string]: number } = { 'A': 1, 'mA': 1000, 'µA': 1e6, 'kA': 0.001 };
    if (typeof current === 'number') {
      return (current * mult[unit]).toFixed(6);
    }
    // Handle complex numbers
    if (current.re !== undefined) {
      const re = current.re * mult[unit];
      const im = current.im * mult[unit];
      // If imaginary part is negligible, show only real part
      if (Math.abs(im) < 1e-8) {
        return re.toFixed(6);
      }
      return `${re.toFixed(6)} + ${im.toFixed(6)}i`;
    }
    return current.format(4);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
    >
      <motion.div 
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-3xl bg-[#0a0a0a] border border-primary/30 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
          <div>
            <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
              <span className="w-2 h-6 bg-primary rounded-sm"/>
              RELATÓRIO DE CÁLCULO
            </h2>
            <p className="text-sm text-muted-foreground font-mono mt-1">ANÁLISE MATEMÁTICA DETALHADA (MÉTODO MATRICIAL)</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-muted-foreground hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 font-mono text-sm custom-scrollbar">
          
          {/* 1. Equações LKT */}
          <section>
            <h3 className="text-primary font-bold text-lg mb-3 flex items-center gap-2">
              1. EQUAÇÕES DE MALHA (LKT)
            </h3>
            <div className="bg-black/40 border border-white/10 p-4 rounded-lg space-y-2">
              <p className="text-muted-foreground mb-2 text-xs uppercase tracking-wider">Sistema Linear Gerado:</p>
              {equations.map((eq, i) => (
                <div key={i} className="flex items-baseline gap-3 text-white/90">
                  <span className="text-secondary font-bold">Malha {i+1}:</span>
                  <span className="tracking-wide">{eq}</span>
                </div>
              ))}
            </div>
          </section>

          {/* 2. Forma Matricial */}
          <section>
            <h3 className="text-primary font-bold text-lg mb-3 flex items-center gap-2">
              2. FORMA MATRICIAL [R]·[I] = [V]
            </h3>
            <div className="flex items-center gap-4 overflow-x-auto pb-2">
              {/* Matrix R */}
              <div className="relative p-4 border-x-2 border-white/20 rounded-lg bg-white/5">
                {matrixR.map((row, i) => (
                  <div key={i} className="flex gap-4 justify-center py-1">
                    {row.map((val, j) => (
                      <span key={j} className="w-16 text-right font-bold text-white">{val}</span>
                    ))}
                  </div>
                ))}
                <div className="absolute -bottom-6 left-0 w-full text-center text-xs text-muted-foreground">[R] (Impedância)</div>
              </div>

              <span className="text-2xl text-white/50">×</span>

              {/* Vector I */}
              <div className="relative p-4 border-x-2 border-white/20 rounded-lg bg-white/5 min-w-[60px]">
                {matrixR.map((_, i) => (
                  <div key={i} className="flex justify-center py-1">
                    <span className="font-bold text-accent">I{i+1}</span>
                  </div>
                ))}
                <div className="absolute -bottom-6 left-0 w-full text-center text-xs text-muted-foreground">[I] (Incógnitas)</div>
              </div>

              <span className="text-2xl text-white/50">=</span>

              {/* Vector V */}
              <div className="relative p-4 border-x-2 border-white/20 rounded-lg bg-white/5 min-w-[60px]">
                 {vectorV.map((val, i) => (
                  <div key={i} className="flex justify-center py-1">
                    <span className="font-bold text-secondary">{val}</span>
                  </div>
                ))}
                <div className="absolute -bottom-6 left-0 w-full text-center text-xs text-muted-foreground">[V] (Fontes)</div>
              </div>
            </div>
          </section>

          {/* 3. Solução (Inversa) */}
          <section>
            <h3 className="text-primary font-bold text-lg mb-3 flex items-center gap-2">
              3. SOLUÇÃO (Método da Matriz Inversa)
            </h3>
            <p className="text-muted-foreground mb-4">
              O sistema é resolvido calculando <span className="text-white font-bold">[I] = [R]⁻¹ · [V]</span>
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {I.map((curr, idx) => (
                <div key={idx} className="bg-primary/5 border border-primary/20 p-4 rounded-lg relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary/50"></div>
                  <h4 className="text-primary font-bold mb-2">Corrente I{idx+1}</h4>
                  <div className="text-2xl text-white font-display mb-1">
                    {convertCurrent(curr, currentUnit)} <span className="text-lg text-secondary">{currentUnit}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-white/5 flex justify-between items-center">
          <div className="flex gap-2">
            {['A', 'mA', 'µA', 'kA'].map((unit) => (
              <button
                key={unit}
                onClick={() => setCurrentUnit(unit as 'A' | 'mA' | 'µA' | 'kA')}
                className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                  currentUnit === unit 
                    ? 'bg-primary text-black' 
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {unit}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => window.print()}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded text-white text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Imprimir PDF
            </button>
            <button 
              onClick={onClose}
              className="px-6 py-2 bg-primary text-black rounded font-bold hover:bg-primary/90 transition-colors"
            >
              FECHAR
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
