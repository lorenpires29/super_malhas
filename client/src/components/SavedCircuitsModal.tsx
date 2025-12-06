import { SavedCircuit } from "@/lib/store";
import { motion } from "framer-motion";
import { X, Trash2, Upload, Folder, Save } from "lucide-react";
import { useState } from "react";

interface SavedCircuitsModalProps {
  circuits: SavedCircuit[];
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  onSaveNew: (name: string) => void;
}

export function SavedCircuitsModal({ circuits, onLoad, onDelete, onClose, onSaveNew }: SavedCircuitsModalProps) {
  const [newName, setNewName] = useState('');

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[90vh] bg-[#0a0a0a] border border-primary/30 rounded-xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
          <div>
            <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
              <Folder className="w-6 h-6 text-primary"/>
              CIRCUITOS SALVOS
            </h2>
            <p className="text-sm text-muted-foreground font-mono mt-1">Total: {circuits.length}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-muted-foreground hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[60vh] font-mono text-sm custom-scrollbar">
          {/* Save New */}
          <div className="mb-6 pb-6 border-b border-white/10">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Salvar novo circuito</p>
            <div className="flex flex-col md:flex-row gap-2">
              <input 
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && newName.trim()) {
                    onSaveNew(newName);
                    setNewName('');
                  }
                }}
                placeholder="Nome do circuito"
                className="flex-1 bg-black/40 border border-white/10 rounded px-3 py-2 text-white text-sm outline-none focus:border-primary"
              />
              <button
                onClick={() => {
                  if (newName.trim()) {
                    onSaveNew(newName);
                    setNewName('');
                  }
                }}
                className="px-4 py-2 bg-primary text-black font-bold rounded hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <Save className="w-4 h-4" /> SALVAR
              </button>
            </div>
          </div>

          {/* Saved Circuits List */}
          {circuits.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Nenhum circuito salvo ainda</div>
          ) : (
            <div className="space-y-2">
              {circuits.map((circuit) => (
                <div key={circuit.id} className="bg-white/5 border border-white/10 p-3 rounded flex flex-col md:flex-row md:items-center md:justify-between hover:border-primary/30 transition-colors gap-2 md:gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-bold truncate">{circuit.name}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {circuit.n} malhas • {new Date(circuit.timestamp).toLocaleString('pt-BR')}
                    </div>
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                    <button
                      onClick={() => {
                        onLoad(circuit.id);
                        onClose();
                      }}
                      className="flex-1 md:flex-none px-3 py-1 bg-primary/20 text-primary rounded text-xs font-bold hover:bg-primary/40 transition-colors flex items-center justify-center gap-1 whitespace-nowrap"
                    >
                      <Upload className="w-3 h-3" /> CARREGAR
                    </button>
                    <button
                      onClick={() => onDelete(circuit.id)}
                      className="px-2 py-1 text-white/30 hover:text-destructive transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-white/5 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-primary text-black rounded font-bold hover:bg-primary/90 transition-colors"
          >
            FECHAR
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
