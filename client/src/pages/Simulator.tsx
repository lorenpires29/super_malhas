import { useCircuitStore } from "@/lib/store";
import { Link } from "wouter";
import { ArrowLeft, Play, RotateCcw, Plus, Trash2, Zap, Activity, ArrowRightLeft, Sigma, FileText, Save, Folder } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CircuitDiagram } from "@/components/CircuitDiagram";
import { CalculationReport } from "@/components/CalculationReport";
import { SavedCircuitsModal } from "@/components/SavedCircuitsModal";
import * as math from "mathjs";
import { useState, useEffect } from "react";

export default function Simulator() {
  const { 
    n, meshes, I, matrixR, vectorV, equations, currentUnit, setCurrentUnit, savedCircuits, saveCircuit, loadCircuit, deleteCircuit, loadSavedCircuits,
    addResistor, updateResistor, removeResistor,
    addSource, updateSource, removeSource,
    calculate, reset 
  } = useCircuitStore();

  const [showReport, setShowReport] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [quickSaveName, setQuickSaveName] = useState('');

  useEffect(() => {
    loadSavedCircuits();
  }, [loadSavedCircuits]);

  // Helper to find inherited components (defined in other meshes but shared with this one)
  const getInheritedResistors = (meshIdx: number) => {
    const inherited: { from: number, value: string, id: string }[] = [];
    meshes.forEach(m => {
      if (m.id === meshIdx) return;
      m.resistors.forEach(r => {
        if (r.sharedWith === meshIdx) {
          inherited.push({ from: m.id, value: r.value, id: r.id });
        }
      });
    });
    return inherited;
  };

  const getInheritedSources = (meshIdx: number) => {
    const inherited: { from: number, value: string, id: string, sourceSign: string }[] = [];
    meshes.forEach(m => {
      if (m.id === meshIdx) return;
      m.sources.forEach(s => {
        if (s.sharedWith === meshIdx) {
          const numVal = parseFloat(s.value) || 0;
          const displayVal = String(numVal * -1);
          inherited.push({ from: m.id, value: displayVal, id: s.id, sourceSign: 'negativo' });
        }
      });
    });
    return inherited;
  };

  return (
    <div className="min-h-screen w-full p-4 md:p-8 flex flex-col gap-6">
      <AnimatePresence>
        {showReport && <CalculationReport onClose={() => setShowReport(false)} />}
        {showSaved && (
          <SavedCircuitsModal 
            circuits={savedCircuits}
            onLoad={loadCircuit}
            onDelete={deleteCircuit}
            onClose={() => setShowSaved(false)}
            onSaveNew={(name) => {
              saveCircuit(name);
              setShowSaved(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-white/10">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/setup">
            <button className="p-2 hover:bg-white/5 rounded-full transition-colors border border-transparent hover:border-white/20 flex-shrink-0">
              <ArrowLeft className="w-6 h-6 text-primary" />
            </button>
          </Link>
          <div className="min-w-0">
            <h1 className="text-2xl font-display font-bold text-white truncate">SIMULADOR</h1>
            <p className="text-xs text-muted-foreground font-mono truncate">MALHAS: {n} | MODO: <span className="text-primary">DC</span></p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 md:gap-3">
          <button 
            onClick={() => setShowSaved(true)}
            className="px-3 py-2 border border-white/10 hover:bg-white/5 rounded font-mono text-xs md:text-sm flex items-center gap-2 transition-all whitespace-nowrap"
            title="Ver circuitos salvos"
          >
            <Folder className="w-4 h-4" /> SALVOS ({savedCircuits.length})
          </button>
          <button 
            onClick={reset}
            className="px-3 py-2 border border-white/10 hover:bg-white/5 rounded font-mono text-xs md:text-sm flex items-center gap-2 transition-all whitespace-nowrap"
          >
            <RotateCcw className="w-4 h-4" /> RESET
          </button>
          <button 
            onClick={calculate}
            className="px-4 py-2 bg-primary text-black font-bold font-display rounded shadow-[0_0_15px_rgba(0,243,255,0.4)] hover:shadow-[0_0_25px_rgba(0,243,255,0.6)] transition-all flex items-center gap-2 text-xs md:text-sm whitespace-nowrap"
          >
            <Play className="w-4 h-4 fill-black" /> CALCULAR
          </button>
          
          {I && I.length > 0 && (
            <div className="flex gap-2 w-full md:w-auto">
              <input 
                type="text"
                value={quickSaveName}
                onChange={(e) => setQuickSaveName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && quickSaveName.trim()) {
                    saveCircuit(quickSaveName);
                    setQuickSaveName('');
                  }
                }}
                placeholder="Salvar como..."
                className="flex-1 md:flex-none bg-black/40 border border-white/10 rounded px-2 py-2 text-xs outline-none focus:border-secondary"
              />
              <button 
                onClick={() => {
                  if (quickSaveName.trim()) {
                    saveCircuit(quickSaveName);
                    setQuickSaveName('');
                  }
                }}
                className="px-3 py-2 bg-secondary text-black font-bold rounded hover:bg-secondary/90 transition-all flex items-center gap-1 text-xs whitespace-nowrap"
              >
                <Save className="w-4 h-4" /> SALVAR
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 md:gap-6 flex-1">
        {/* Left Col: Circuit Builder */}
        <div className="md:col-span-2 lg:col-span-7 space-y-4 md:space-y-6">
          
          {/* Live Diagram */}
          <div className="h-[250px] md:h-[300px]">
            <CircuitDiagram />
          </div>

          <div className="grid gap-4 md:gap-6">
            {meshes.map((mesh, idx) => (
              <motion.div 
                key={mesh.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="glass-panel p-4 md:p-6 rounded-xl border-l-4 border-primary"
              >
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <h3 className="text-lg md:text-xl font-display font-bold text-white flex items-center gap-2 truncate">
                    <Activity className="w-5 h-5 text-primary flex-shrink-0" />
                    MALHA {idx + 1}
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {/* Resistors Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm text-muted-foreground font-mono border-b border-white/10 pb-1">
                      <span>RESISTORES (Ω)</span>
                      <button onClick={() => addResistor(idx)} className="hover:text-primary flex items-center gap-1 text-xs">
                        <Plus className="w-3 h-3" /> ADD
                      </button>
                    </div>
                    
                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                      {mesh.resistors.length === 0 && getInheritedResistors(idx).length === 0 && (
                        <div className="text-xs text-white/20 italic py-2 text-center">Nenhum resistor</div>
                      )}
                      
                      {/* Local Resistors */}
                      {mesh.resistors.map((r) => (
                        <div key={r.id} className="bg-black/20 p-2 rounded border border-white/5 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-primary">R</span>
                            <input 
                              type="text" 
                              value={r.value}
                              onChange={(e) => updateResistor(idx, r.id, 'value', e.target.value)}
                              className="flex-1 bg-black/40 border border-white/10 rounded px-2 py-1 text-sm font-mono focus:border-primary outline-none"
                              placeholder="Valor"
                            />
                            <button onClick={() => removeResistor(idx, r.id)} className="text-white/20 hover:text-destructive">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                          
                          {/* Coupling Selector */}
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                            <ArrowRightLeft className="w-3 h-3" />
                            <span>Compartilhar com:</span>
                            <select 
                              value={r.sharedWith ?? ""}
                              onChange={(e) => updateResistor(idx, r.id, 'sharedWith', e.target.value ? parseInt(e.target.value) : null)}
                              className="bg-black border border-white/10 rounded px-1 py-0.5 text-primary outline-none"
                            >
                              <option value="">Ninguém (Interno)</option>
                              {Array.from({ length: n }, (_, i) => i)
                                .filter(i => i !== idx)
                                .map(target => (
                                  <option key={target} value={target}>Malha {target + 1}</option>
                                ))
                              }
                            </select>
                          </div>
                        </div>
                      ))}

                      {/* Inherited Resistors (Read Only) */}
                      {getInheritedResistors(idx).map((r, i) => (
                         <div key={`inh-r-${i}`} className="bg-white/5 p-2 rounded border border-dashed border-white/10 opacity-70">
                           <div className="flex items-center justify-between">
                             <div className="flex items-center gap-2">
                               <span className="text-xs font-mono text-accent">R_link</span>
                               <span className="text-sm font-mono">{r.value}Ω</span>
                             </div>
                             <span className="text-[10px] text-muted-foreground">via Malha {r.from + 1}</span>
                           </div>
                         </div>
                      ))}
                    </div>
                  </div>

                  {/* Sources Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm text-muted-foreground font-mono border-b border-white/10 pb-1">
                      <span>FONTES (V)</span>
                      <button onClick={() => addSource(idx)} className="hover:text-secondary flex items-center gap-1 text-xs">
                        <Plus className="w-3 h-3" /> ADD
                      </button>
                    </div>

                    <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1 custom-scrollbar">
                      {mesh.sources.length === 0 && getInheritedSources(idx).length === 0 && (
                        <div className="text-xs text-white/20 italic py-2 text-center">Nenhuma fonte</div>
                      )}
                      
                      {/* Local Sources */}
                      {mesh.sources.map((s) => (
                        <div key={s.id} className="bg-black/20 p-2 rounded border border-white/5 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-secondary">V</span>
                            <input 
                              type="text" 
                              value={s.value}
                              onChange={(e) => updateSource(idx, s.id, 'value', e.target.value)}
                              className="flex-1 bg-black/40 border border-white/10 rounded px-2 py-1 text-sm font-mono focus:border-secondary outline-none"
                              placeholder="Value"
                            />
                            <button 
                               onClick={() => {
                                 const val = parseFloat(s.value) || 0;
                                 updateSource(idx, s.id, 'value', String(val * -1));
                               }}
                               className="text-[10px] px-1.5 py-0.5 border border-secondary/50 text-secondary rounded hover:bg-secondary/10 font-bold"
                               title="Inverter Polaridade"
                            >
                              ±
                            </button>
                            <button onClick={() => removeSource(idx, s.id)} className="text-white/20 hover:text-destructive">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                          
                          {/* Coupling Selector for Source */}
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                            <ArrowRightLeft className="w-3 h-3" />
                            <span>Compartilhar com:</span>
                            <select 
                              value={s.sharedWith ?? ""}
                              onChange={(e) => updateSource(idx, s.id, 'sharedWith', e.target.value ? parseInt(e.target.value) : null)}
                              className="bg-black border border-white/10 rounded px-1 py-0.5 text-secondary outline-none"
                            >
                              <option value="">Ninguém (Interno)</option>
                              {Array.from({ length: n }, (_, i) => i)
                                .filter(i => i !== idx)
                                .map(target => (
                                  <option key={target} value={target}>Malha {target + 1}</option>
                                ))
                              }
                            </select>
                          </div>
                        </div>
                      ))}

                      {/* Inherited Sources (Same source shown with opposite sign) */}
                      {getInheritedSources(idx).map((s, i) => (
                         <div key={`inh-s-${i}`} className="bg-white/5 p-2 rounded border border-dashed border-white/10 opacity-70">
                           <div className="flex items-center justify-between">
                             <div className="flex items-center gap-2">
                               <span className="text-xs font-mono text-accent">V</span>
                               <span className="text-sm font-mono">{s.value}V</span>
                               <span className="text-[9px] text-accent/60">(espelhado)</span>
                             </div>
                             <span className="text-[10px] text-muted-foreground">da Malha {s.from + 1}</span>
                           </div>
                         </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Col: Results */}
        <div className="md:col-span-2 lg:col-span-5 space-y-4 md:space-y-6">
          
          {/* Calculated Currents */}
          <section className="glass-panel p-6 rounded-xl min-h-[200px]">
            <div className="flex items-center justify-between mb-4 border-l-4 border-accent pl-3">
              <h3 className="text-lg font-display text-accent">RESULTADOS [CORRENTES]</h3>
              {I && (
                <button 
                  onClick={() => setShowReport(true)}
                  className="text-xs font-bold bg-accent/10 text-accent border border-accent/20 px-3 py-1.5 rounded hover:bg-accent hover:text-black transition-all flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" /> RELATÓRIO COMPLETO
                </button>
              )}
            </div>
            
            {!I ? (
              <div className="h-32 flex flex-col items-center justify-center border border-dashed border-white/10 rounded gap-2">
                <Zap className="w-8 h-8 text-white/10" />
                <span className="text-muted-foreground font-mono text-sm">CONFIGURE AS MALHAS E CALCULE</span>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  {I.map((curr: math.Complex, idx: number) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-center justify-between p-4 bg-white/5 rounded border border-white/5 hover:border-accent/50 transition-colors group"
                    >
                      <span className="font-mono text-muted-foreground group-hover:text-white transition-colors">I{idx + 1}</span>
                      <div className="text-right">
                        <div className="font-bold text-accent font-mono text-xl shadow-accent/20 drop-shadow-lg">
                          {curr.format(4)} A
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Oscilloscope Removed as per request */}
        </div>
      </div>
    </div>
  );
}

