import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Calculator, CalculatorBlock, CostProfile, CalculatorSettings, CalculatorHistoryEntry } from '@calcoster/types';
import { dbSaveCalculator, dbDeleteCalculator, dbGetCalculators } from '../../firebase/firestoreService';

interface CalculatorState {
  calculators: Calculator[];
  activeCalculatorId: string | null;
  selectedBlockId: string | null;
  isSavingCalculator: boolean; // Tracks button loading status
  previewInputs: Record<string, Record<string, number>>; // calculatorId -> { fieldId -> value }
}

// Prepopulated calculators
const initialCalculators: Calculator[] = [
  {
    id: 'calc-printing',
    name: 'Printing Cost Calculator',
    description: 'Calculate setup, paper, ink, labour, and profit margins for print jobs.',
    industry: 'Printing',
    isActive: true,
    version: 3,
    createdBy: 'Amit Kumar',
    updatedBy: 'Amit Kumar',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    settings: {
      defaultCurrency: '₹',
      requireAllFields: true,
      allowCustomMargins: true,
      generatedQuantity: {
        enabled: false,
        label: "Produced Pieces",
        unit: "Pieces",
        defaultValue: 1,
        allowManualEdit: true,
        showCostPerUnit: true,
        costPerUnitLabel: "Cost Per Piece"
      }
    },
    blocks: [
      {
        id: 'block-1',
        type: 'field',
        fieldId: 'field-paper-cost',
        operatorBefore: '+'
      },
      {
        id: 'block-2',
        type: 'field',
        fieldId: 'field-ink-cost',
        operatorBefore: '+'
      },
      {
        id: 'block-3',
        type: 'field',
        fieldId: 'field-printing-cost',
        operatorBefore: '+'
      },
      {
        id: 'block-4',
        type: 'field',
        fieldId: 'field-labour-cost',
        operatorBefore: '+'
      },
      {
        id: 'block-5',
        type: 'field',
        fieldId: 'field-other-expenses',
        operatorBefore: '+'
      },
      {
        id: 'block-group-tax-profit',
        type: 'group',
        name: 'Taxes & Margin',
        operatorBefore: '+',
        blocks: [
          {
            id: 'block-6',
            type: 'field',
            fieldId: 'field-gst-18',
            operatorBefore: '+'
          },
          {
            id: 'block-7',
            type: 'field',
            fieldId: 'field-profit-15',
            operatorBefore: '+'
          }
        ]
      }
    ],
    profiles: [
      {
        id: 'profile-premium-card',
        calculatorId: 'calc-printing',
        name: 'Premium Visiting Card',
        values: {
          'field-paper-cost': 50,
          'field-ink-cost': 3,
          'field-printing-cost': 1000,
          'field-labour-cost': 4,
          'field-other-expenses': 1,
          'field-gst-18': 18,
          'field-profit-15': 15
        },
        notes: 'Double-sided printed premium textured card with lamination',
        createdBy: 'Amit Kumar',
        createdAt: new Date().toISOString()
      },
      {
        id: 'profile-economy-card',
        calculatorId: 'calc-printing',
        name: 'Economy Visiting Card',
        values: {
          'field-paper-cost': 10,
          'field-ink-cost': 1,
          'field-printing-cost': 500,
          'field-labour-cost': 2,
          'field-other-expenses': 1,
          'field-gst-18': 18,
          'field-profit-15': 15
        },
        notes: 'Single-sided regular visiting cards, low quantity',
        createdBy: 'Amit Kumar',
        createdAt: new Date().toISOString()
      },
      {
        id: 'profile-brochure',
        calculatorId: 'calc-printing',
        name: 'Brochure (4 Page)',
        values: {
          'field-paper-cost': 120,
          'field-ink-cost': 8,
          'field-printing-cost': 2000,
          'field-labour-cost': 10,
          'field-other-expenses': 1,
          'field-gst-18': 18,
          'field-profit-15': 20
        },
        notes: 'A4 Bi-fold premium brochure',
        createdBy: 'Amit Kumar',
        createdAt: new Date().toISOString()
      }
    ],
    history: [
      {
        version: 3,
        updatedAt: new Date().toISOString(),
        updatedBy: 'Amit Kumar',
        description: 'Added Taxes & Margin group block',
        changes: [
          { fieldLabel: 'Taxes & Margin', type: 'added' }
        ],
        restoreState: {
          blocks: []
        }
      },
      {
        version: 2,
        updatedAt: new Date(Date.now() - 3600000).toISOString(),
        updatedBy: 'Amit Kumar',
        description: 'Configured Labour hours default rate to ₹500',
        changes: [
          { fieldLabel: 'Labour Cost', type: 'modified', from: 400, to: 500 }
        ],
        restoreState: {
          blocks: []
        }
      },
      {
        version: 1,
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
        updatedBy: 'System',
        description: 'Initial creation',
        changes: [],
        restoreState: {
          blocks: []
        }
      }
    ]
  },
  {
    id: 'calc-furniture',
    name: 'Furniture Cost Calculator',
    description: 'Calculate wood material, varnish, carpentry hours, and profit margins.',
    industry: 'Furniture',
    isActive: true,
    version: 1,
    createdBy: 'Amit Kumar',
    updatedBy: 'Amit Kumar',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    settings: {
      defaultCurrency: '₹',
      requireAllFields: true,
      allowCustomMargins: true,
      generatedQuantity: {
        enabled: false,
        label: "Produced Pieces",
        unit: "Pieces",
        defaultValue: 1,
        allowManualEdit: true,
        showCostPerUnit: true,
        costPerUnitLabel: "Cost Per Piece"
      }
    },
    blocks: [
      {
        id: 'block-wood',
        type: 'field',
        fieldId: 'field-wood-ply',
        operatorBefore: '+'
      },
      {
        id: 'block-labour',
        type: 'field',
        fieldId: 'field-labour-hours',
        operatorBefore: '+'
      }
    ],
    profiles: [],
    history: []
  },
  {
    id: 'calc-granite',
    name: 'Granite Cost Calculator',
    description: 'Custom slab sizes, cutting charges, transport, and wastage margins.',
    industry: 'Granite',
    isActive: true,
    version: 1,
    createdBy: 'Amit Kumar',
    updatedBy: 'Amit Kumar',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    settings: {
      defaultCurrency: '₹',
      requireAllFields: true,
      allowCustomMargins: false,
      generatedQuantity: {
        enabled: false,
        label: "Produced Pieces",
        unit: "Pieces",
        defaultValue: 1,
        allowManualEdit: true,
        showCostPerUnit: true,
        costPerUnitLabel: "Cost Per Piece"
      }
    },
    blocks: [],
    profiles: [],
    history: []
  },
  {
    id: 'calc-website',
    name: 'Website Cost Calculator',
    description: 'Estimate development hours, designer cost, APIs, hosting, and buffer.',
    industry: 'Digital Agencies',
    isActive: true,
    version: 1,
    createdBy: 'Amit Kumar',
    updatedBy: 'Amit Kumar',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    settings: {
      defaultCurrency: '₹',
      requireAllFields: false,
      allowCustomMargins: true,
      generatedQuantity: {
        enabled: false,
        label: "Produced Pieces",
        unit: "Pieces",
        defaultValue: 1,
        allowManualEdit: true,
        showCostPerUnit: true,
        costPerUnitLabel: "Cost Per Piece"
      }
    },
    blocks: [],
    profiles: [],
    history: []
  }
];

const initialState: CalculatorState = {
  calculators: initialCalculators,
  activeCalculatorId: 'calc-printing',
  selectedBlockId: 'block-1',
  isSavingCalculator: false,
  previewInputs: {
    'calc-printing': {
      'field-paper-cost': 50,
      'field-ink-cost': 3,
      'field-printing-cost': 1000,
      'field-labour-cost': 4,
      'field-other-expenses': 1
    }
  }
};

// Async Thunks for Firestore Operations
export const saveCalculatorAsync = createAsyncThunk(
  'calculator/saveCalculator',
  async (calculator: Calculator) => {
    try {
      await dbSaveCalculator('company-1', calculator);
    } catch (e) {
      console.warn("Firestore save failed, updating locally:", e);
    }
    return calculator;
  }
);

export const deleteCalculatorAsync = createAsyncThunk(
  'calculator/deleteCalculator',
  async (calculatorId: string) => {
    try {
      await dbDeleteCalculator('company-1', calculatorId);
    } catch (e) {
      console.warn("Firestore delete failed, updating locally:", e);
    }
    return calculatorId;
  }
);

export const fetchCalculatorsAsync = createAsyncThunk(
  'calculator/fetchCalculators',
  async () => {
    try {
      const list = await dbGetCalculators('company-1');
      if (list.length === 0) {
        // Seed initial mock data into Firestore if Firestore is empty
        for (const c of initialCalculators) {
          await dbSaveCalculator('company-1', c);
        }
        return initialCalculators;
      }
      return list;
    } catch (e) {
      console.warn("Firestore load failed, falling back to initial data:", e);
      return initialCalculators;
    }
  }
);

export const calculatorSlice = createSlice({
  name: 'calculator',
  initialState,
  reducers: {
    setActiveCalculatorId: (state, action: PayloadAction<string | null>) => {
      state.activeCalculatorId = action.payload;
      state.selectedBlockId = null;
    },
    setSelectedBlockId: (state, action: PayloadAction<string | null>) => {
      state.selectedBlockId = action.payload;
    },
    addCalculator: (state, action: PayloadAction<Omit<Calculator, 'id' | 'createdAt' | 'updatedAt' | 'version'>>) => {
      const newCalc: Calculator = {
        ...action.payload,
        id: `calc-${Date.now()}`,
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      state.calculators.push(newCalc);
      state.activeCalculatorId = newCalc.id;
      dbSaveCalculator('company-1', newCalc).catch(console.warn);
    },
    updateCalculator: (state, action: PayloadAction<Partial<Calculator> & { id: string }>) => {
      const idx = state.calculators.findIndex(c => c.id === action.payload.id);
      if (idx !== -1) {
        state.calculators[idx] = {
          ...state.calculators[idx],
          ...action.payload,
          updatedAt: new Date().toISOString()
        };
        dbSaveCalculator('company-1', state.calculators[idx]).catch(console.warn);
      }
    },
    deleteCalculator: (state, action: PayloadAction<string>) => {
      state.calculators = state.calculators.filter(c => c.id !== action.payload);
      if (state.activeCalculatorId === action.payload) {
        state.activeCalculatorId = state.calculators[0]?.id || null;
      }
      dbDeleteCalculator('company-1', action.payload).catch(console.warn);
    },
    addBlockToCalculator: (state, action: PayloadAction<{ calculatorId: string; block: CalculatorBlock }>) => {
      const calc = state.calculators.find(c => c.id === action.payload.calculatorId);
      if (calc) {
        calc.blocks.push(action.payload.block);
        calc.version += 1;
        calc.updatedAt = new Date().toISOString();
        dbSaveCalculator('company-1', calc).catch(console.warn);
      }
    },
    updateBlockInCalculator: (state, action: PayloadAction<{ calculatorId: string; blockId: string; updates: Partial<CalculatorBlock> }>) => {
      const calc = state.calculators.find(c => c.id === action.payload.calculatorId);
      if (calc) {
        const updateBlockRecursive = (blocks: CalculatorBlock[]): boolean => {
          for (let i = 0; i < blocks.length; i++) {
            if (blocks[i].id === action.payload.blockId) {
              blocks[i] = { ...blocks[i], ...action.payload.updates } as CalculatorBlock;
              return true;
            }
            if (blocks[i].type === 'group') {
              const group = blocks[i] as any;
              if (updateBlockRecursive(group.blocks)) return true;
            }
          }
          return false;
        };

        const updated = updateBlockRecursive(calc.blocks);
        if (updated) {
          calc.version += 1;
          calc.updatedAt = new Date().toISOString();
          dbSaveCalculator('company-1', calc).catch(console.warn);
        }
      }
    },
    removeBlockFromCalculator: (state, action: PayloadAction<{ calculatorId: string; blockId: string }>) => {
      const calc = state.calculators.find(c => c.id === action.payload.calculatorId);
      if (calc) {
        const removeBlockRecursive = (blocks: CalculatorBlock[]): CalculatorBlock[] => {
          return blocks
            .filter(b => b.id !== action.payload.blockId)
            .map(b => {
              if (b.type === 'group') {
                return {
                  ...b,
                  blocks: removeBlockRecursive((b as any).blocks)
                } as CalculatorBlock;
              }
              return b;
            });
        };

        calc.blocks = removeBlockRecursive(calc.blocks);
        calc.version += 1;
        calc.updatedAt = new Date().toISOString();
        dbSaveCalculator('company-1', calc).catch(console.warn);
        if (state.selectedBlockId === action.payload.blockId) {
          state.selectedBlockId = null;
        }
      }
    },
    reorderBlocksInCalculator: (state, action: PayloadAction<{ calculatorId: string; blocks: CalculatorBlock[] }>) => {
      const calc = state.calculators.find(c => c.id === action.payload.calculatorId);
      if (calc) {
        calc.blocks = action.payload.blocks;
        calc.updatedAt = new Date().toISOString();
        dbSaveCalculator('company-1', calc).catch(console.warn);
      }
    },
    addProfileToCalculator: (state, action: PayloadAction<{ calculatorId: string; profile: Omit<CostProfile, 'id' | 'createdAt'> }>) => {
      const calc = state.calculators.find(c => c.id === action.payload.calculatorId);
      if (calc) {
        const newProfile: CostProfile = {
          ...action.payload.profile,
          id: `profile-${Date.now()}`,
          createdAt: new Date().toISOString()
        };
        calc.profiles.push(newProfile);
        calc.updatedAt = new Date().toISOString();
        dbSaveCalculator('company-1', calc).catch(console.warn);
      }
    },
    deleteProfileFromCalculator: (state, action: PayloadAction<{ calculatorId: string; profileId: string }>) => {
      const calc = state.calculators.find(c => c.id === action.payload.calculatorId);
      if (calc) {
        calc.profiles = calc.profiles.filter(p => p.id !== action.payload.profileId);
        calc.updatedAt = new Date().toISOString();
        dbSaveCalculator('company-1', calc).catch(console.warn);
      }
    },
    saveHistoryVersion: (state, action: PayloadAction<{ calculatorId: string; description: string; updatedBy: string; changes: CalculatorHistoryEntry['changes'] }>) => {
      const calc = state.calculators.find(c => c.id === action.payload.calculatorId);
      if (calc) {
        const newEntry: CalculatorHistoryEntry = {
          version: calc.version,
          updatedAt: new Date().toISOString(),
          updatedBy: action.payload.updatedBy,
          description: action.payload.description,
          changes: action.payload.changes,
          restoreState: {
            blocks: JSON.parse(JSON.stringify(calc.blocks))
          }
        };
        calc.history.unshift(newEntry);
        dbSaveCalculator('company-1', calc).catch(console.warn);
      }
    },
    restoreHistoryVersion: (state, action: PayloadAction<{ calculatorId: string; version: number }>) => {
      const calc = state.calculators.find(c => c.id === action.payload.calculatorId);
      if (calc) {
        const historyItem = calc.history.find(h => h.version === action.payload.version);
        if (historyItem && historyItem.restoreState.blocks.length > 0) {
          calc.blocks = JSON.parse(JSON.stringify(historyItem.restoreState.blocks));
          calc.version += 1;
          calc.updatedAt = new Date().toISOString();
          dbSaveCalculator('company-1', calc).catch(console.warn);
        }
      }
    },
    updateCalculatorSettings: (state, action: PayloadAction<{ calculatorId: string; settings: Partial<CalculatorSettings> }>) => {
      const calc = state.calculators.find(c => c.id === action.payload.calculatorId);
      if (calc) {
        calc.settings = {
          ...calc.settings,
          ...action.payload.settings
        };
        calc.updatedAt = new Date().toISOString();
        dbSaveCalculator('company-1', calc).catch(console.warn);
      }
    },
    updatePreviewInputs: (state, action: PayloadAction<{ calculatorId: string; inputs: Record<string, number> }>) => {
      if (!state.previewInputs) {
        state.previewInputs = {};
      }
      state.previewInputs[action.payload.calculatorId] = {
        ...(state.previewInputs[action.payload.calculatorId] || {}),
        ...action.payload.inputs
      };
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Calculators Async
      .addCase(fetchCalculatorsAsync.pending, (state) => {
        state.isSavingCalculator = true;
      })
      .addCase(fetchCalculatorsAsync.fulfilled, (state, action) => {
        state.isSavingCalculator = false;
        state.calculators = action.payload;
        if (!state.activeCalculatorId && action.payload.length > 0) {
          state.activeCalculatorId = action.payload[0].id;
        }
      })
      .addCase(fetchCalculatorsAsync.rejected, (state) => {
        state.isSavingCalculator = false;
      })
      // Save Calculator Async
      .addCase(saveCalculatorAsync.pending, (state) => {
        state.isSavingCalculator = true;
      })
      .addCase(saveCalculatorAsync.fulfilled, (state, action) => {
        state.isSavingCalculator = false;
        const idx = state.calculators.findIndex(c => c.id === action.payload.id);
        if (idx !== -1) {
          state.calculators[idx] = action.payload;
        }
      })
      .addCase(saveCalculatorAsync.rejected, (state) => {
        state.isSavingCalculator = false;
      })
      // Delete Calculator Async
      .addCase(deleteCalculatorAsync.pending, (state) => {
        state.isSavingCalculator = true;
      })
      .addCase(deleteCalculatorAsync.fulfilled, (state, action) => {
        state.isSavingCalculator = false;
        state.calculators = state.calculators.filter(c => c.id !== action.payload);
        if (state.activeCalculatorId === action.payload) {
          state.activeCalculatorId = state.calculators[0]?.id || null;
        }
      })
      .addCase(deleteCalculatorAsync.rejected, (state) => {
        state.isSavingCalculator = false;
      });
  }
});

export const {
  setActiveCalculatorId,
  setSelectedBlockId,
  addCalculator,
  updateCalculator,
  deleteCalculator,
  addBlockToCalculator,
  updateBlockInCalculator,
  removeBlockFromCalculator,
  reorderBlocksInCalculator,
  addProfileToCalculator,
  deleteProfileFromCalculator,
  saveHistoryVersion,
  restoreHistoryVersion,
  updateCalculatorSettings,
  updatePreviewInputs
} = calculatorSlice.actions;

export default calculatorSlice.reducer;
