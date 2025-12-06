import { create } from 'zustand';
import * as math from 'mathjs';

export interface Resistor {
  id: string;
  value: string;
  sharedWith: number | null; // Mesh ID it shares with, or null
}

export interface Source {
  id: string;
  value: string;
  sharedWith: number | null;
}

export interface MeshData {
  id: number;
  resistors: Resistor[];
  sources: Source[];
}

export interface SavedCircuit {
  id: string;
  name: string;
  timestamp: number;
  n: number;
  meshes: MeshData[];
}

export interface CircuitState {
  n: number;
  meshes: MeshData[];
  I: math.Complex[] | null;
  
  // Debug/Display Data
  matrixR: string[][];
  vectorV: string[];
  equations: string[];
  currentUnit: 'A' | 'mA' | 'µA' | 'kA';
  
  // Saved circuits
  savedCircuits: SavedCircuit[];

  setN: (n: number) => void;
  setCurrentUnit: (unit: 'A' | 'mA' | 'µA' | 'kA') => void;
  
  addResistor: (meshIndex: number) => void;
  updateResistor: (meshIndex: number, id: string, field: keyof Resistor, value: any) => void;
  removeResistor: (meshIndex: number, id: string) => void;

  addSource: (meshIndex: number) => void;
  updateSource: (meshIndex: number, id: string, field: keyof Source, value: any) => void;
  removeSource: (meshIndex: number, id: string) => void;

  calculate: () => void;
  reset: () => void;
  
  saveCircuit: (name: string) => void;
  loadCircuit: (id: string) => void;
  deleteCircuit: (id: string) => void;
  loadSavedCircuits: () => void;
}

export const useCircuitStore = create<CircuitState>((set, get) => ({
  n: 2,
  meshes: [],
  I: null,
  matrixR: [],
  vectorV: [],
  equations: [],
  currentUnit: 'A',
  savedCircuits: [],

  setN: (n: number) => {
    const meshes: MeshData[] = Array.from({ length: n }, (_, i) => ({
      id: i,
      resistors: [],
      sources: []
    }));
    set({ n, meshes, I: null, matrixR: [], vectorV: [], equations: [] });
  },

  setCurrentUnit: (unit: 'A' | 'mA' | 'µA' | 'kA') => {
    set({ currentUnit: unit });
  },

  saveCircuit: (name: string) => {
    const { n, meshes, savedCircuits } = get();
    const newCircuit: SavedCircuit = {
      id: Math.random().toString(36).substr(2, 9),
      name: name || `Circuito ${new Date().toLocaleString('pt-BR')}`,
      timestamp: Date.now(),
      n,
      meshes: JSON.parse(JSON.stringify(meshes))
    };
    const updated = [...savedCircuits, newCircuit];
    set({ savedCircuits: updated });
    localStorage.setItem('savedCircuits', JSON.stringify(updated));
  },

  loadCircuit: (id: string) => {
    const { savedCircuits } = get();
    const circuit = savedCircuits.find(c => c.id === id);
    if (circuit) {
      set({ 
        n: circuit.n, 
        meshes: JSON.parse(JSON.stringify(circuit.meshes)),
        I: null,
        matrixR: [],
        vectorV: [],
        equations: []
      });
    }
  },

  deleteCircuit: (id: string) => {
    const { savedCircuits } = get();
    const updated = savedCircuits.filter(c => c.id !== id);
    set({ savedCircuits: updated });
    localStorage.setItem('savedCircuits', JSON.stringify(updated));
  },

  loadSavedCircuits: () => {
    const saved = localStorage.getItem('savedCircuits');
    if (saved) {
      set({ savedCircuits: JSON.parse(saved) });
    }
  },

  addResistor: (meshIndex: number) => {
    const { meshes } = get();
    const newMeshes = [...meshes];
    newMeshes[meshIndex] = {
      ...newMeshes[meshIndex],
      resistors: [...newMeshes[meshIndex].resistors, { 
        id: Math.random().toString(36).substr(2, 9), 
        value: '0',
        sharedWith: null
      }]
    };
    set({ meshes: newMeshes });
  },

  updateResistor: (meshIndex, id, field, value) => {
    const { meshes } = get();
    const newMeshes = [...meshes];
    const resistors = newMeshes[meshIndex].resistors.map(r => 
      r.id === id ? { ...r, [field]: value } : r
    );
    newMeshes[meshIndex] = { ...newMeshes[meshIndex], resistors };
    set({ meshes: newMeshes });
  },

  removeResistor: (meshIndex, id) => {
    const { meshes } = get();
    const newMeshes = [...meshes];
    const resistors = newMeshes[meshIndex].resistors.filter(r => r.id !== id);
    newMeshes[meshIndex] = { ...newMeshes[meshIndex], resistors };
    set({ meshes: newMeshes });
  },

  addSource: (meshIndex: number) => {
    const { meshes } = get();
    const newMeshes = [...meshes];
    newMeshes[meshIndex] = {
      ...newMeshes[meshIndex],
      sources: [...newMeshes[meshIndex].sources, { 
        id: Math.random().toString(36).substr(2, 9), 
        value: '0',
        sharedWith: null
      }]
    };
    set({ meshes: newMeshes });
  },

  updateSource: (meshIndex, id, field, value) => {
    const { meshes } = get();
    const newMeshes = [...meshes];
    
    // Update the source
    const sources = newMeshes[meshIndex].sources.map(s => 
      s.id === id ? { ...s, [field]: value } : s
    );
    newMeshes[meshIndex] = { ...newMeshes[meshIndex], sources };
    set({ meshes: newMeshes });
  },

  removeSource: (meshIndex, id) => {
    const { meshes } = get();
    const newMeshes = [...meshes];
    
    // Remove the source
    const sources = newMeshes[meshIndex].sources.filter(s => s.id !== id);
    newMeshes[meshIndex] = { ...newMeshes[meshIndex], sources };
    set({ meshes: newMeshes });
  },

  calculate: () => {
    const { n, meshes } = get();
    try {
      const R = Array(n).fill(0).map(() => Array(n).fill(0));
      const V = Array(n).fill(0);

      const evalVal = (val: string) => {
        try { 
          return math.evaluate(val || '0');
        } catch { return 0; }
      };

      // First, zero out matrices
      for(let i=0; i<n; i++) {
        V[i] = 0;
        for(let j=0; j<n; j++) R[i][j] = 0;
      }

      // Iterate through all meshes to build R and V
      // KVL: Starting with 0 on both sides, then moving voltage sources to the right side (inverted sign)
      meshes.forEach((mesh, meshIdx) => {
        // 1. Voltage Sources
        // Equation: KVL = 0 = -V + I*R => I*R = V (so V goes on the right side, positive)
        mesh.sources.forEach(s => {
          const val = evalVal(s.value);
          
          // Move voltage source to right side (inverted from left side)
          V[meshIdx] = math.subtract(V[meshIdx], val);

          // If this source is shared with another mesh, handle it
          if (s.sharedWith !== null && s.sharedWith !== undefined) {
            const neighborIdx = s.sharedWith;
            // Shared sources: same source but affects neighbor with opposite effect
            V[neighborIdx] = math.add(V[neighborIdx], val);
          }
        });

        // 2. Resistors
        mesh.resistors.forEach(r => {
          const val = evalVal(r.value);
          
          // Always add to self-resistance diagonal (R_ii)
          R[meshIdx][meshIdx] = math.add(R[meshIdx][meshIdx], val);

          // If shared with another mesh, update mutual resistance terms
          if (r.sharedWith !== null && r.sharedWith !== undefined) {
            const neighborIdx = r.sharedWith;
            
            // Add to neighbor's self-resistance too (resistor is in both loops)
            R[neighborIdx][neighborIdx] = math.add(R[neighborIdx][neighborIdx], val);
            
            // Mutual resistance off-diagonal terms: R_ij = -R_shared
            const negVal = math.unaryMinus(val);
            R[meshIdx][neighborIdx] = math.add(R[meshIdx][neighborIdx], negVal);
            R[neighborIdx][meshIdx] = math.add(R[neighborIdx][meshIdx], negVal);
          }
        });
      });

      // Solve R * I = V
      const result = math.lusolve(R, V) as any;
      const currents = result.map((x: any) => math.complex(x[0]));
      
      // Format matrices for display
      const fmt = (val: any) => {
         try { 
            if (typeof val === 'number') return val.toFixed(2);
            if (math.typeOf(val) === 'Complex') return val.format(2);
            return String(val);
         } catch { return String(val); }
      };

      const displayR = R.map(row => row.map(val => fmt(val)));
      const displayV = V.map(val => fmt(val));

      // Generate Equations Strings
      const equations = R.map((row, i) => {
        let eq = "";
        row.forEach((val, j) => {
          const valStr = fmt(val);
          if (parseFloat(valStr) === 0 && valStr !== "0") {
             // Keep small complex numbers or non-zero
          }
          
          // Heuristic to skip 0 terms for clarity, unless diagonal
          if (valStr === "0" || valStr === "0.00") {
             return;
          }

          const sign = (valStr.startsWith('-') || j === 0) ? "" : "+ ";
          eq += `${sign}${valStr}·I${j+1} `;
        });
        eq += `= ${displayV[i]} V`;
        return eq.trim();
      });

      set({ I: currents, matrixR: displayR, vectorV: displayV, equations });
    } catch (e) {
      console.error("Calculation Failed", e);
      alert("Erro no cálculo. Verifique os valores inseridos.");
    }
  },

  reset: () => {
    set({ I: null, matrixR: [], vectorV: [], equations: [] });
  }
}));
