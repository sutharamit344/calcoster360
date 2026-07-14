import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { CostField } from '@calcoster/types';
import { dbSaveCostField, dbDeleteCostField, dbGetCostFields } from '../../firebase/firestoreService';

interface LibraryState {
  fields: CostField[];
  searchQuery: string;
  selectedCategory: string | null;
  isSaving: boolean; // Tracks button loading status
}

// Initial cost fields
const initialFields: CostField[] = [
  {
    id: 'field-paper-cost',
    companyId: 'company-1',
    label: 'Paper Cost',
    category: 'Material',
    type: 'Currency',
    unit: 'Sheet',
    defaultValue: 90.0,
    currency: '₹',
    isShared: true,
    usedIn: ['calc-printing'],
    description: 'Cost of paper per sheet',
    isRequired: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    updatedBy: 'Amit Kumar'
  },
  {
    id: 'field-ink-cost',
    companyId: 'company-1',
    label: 'Ink Cost',
    category: 'Material',
    type: 'Currency',
    unit: 'Litre',
    defaultValue: 350.0,
    currency: '₹',
    isShared: true,
    usedIn: ['calc-printing'],
    description: 'Special printing ink rate',
    isRequired: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    updatedBy: 'Amit Kumar'
  },
  {
    id: 'field-plate-cost',
    companyId: 'company-1',
    label: 'Plate Cost',
    category: 'Material',
    type: 'Currency',
    unit: 'Unit',
    defaultValue: 120.0,
    currency: '₹',
    isShared: true,
    usedIn: [],
    description: 'Offset printing metal plate cost',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    updatedBy: 'Amit Kumar'
  },
  {
    id: 'field-printing-cost',
    companyId: 'company-1',
    label: 'Printing Cost',
    category: 'Process',
    type: 'Currency',
    unit: 'Side',
    defaultValue: 2.5,
    currency: '₹',
    isShared: true,
    usedIn: ['calc-printing'],
    description: 'Per side offset printing charge',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    updatedBy: 'Amit Kumar'
  },
  {
    id: 'field-labour-cost',
    companyId: 'company-1',
    label: 'Labour Cost',
    category: 'Labour',
    type: 'Currency',
    unit: 'Hour',
    defaultValue: 500.0,
    currency: '₹',
    isShared: true,
    usedIn: ['calc-printing'],
    description: 'Hourly wage rate',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    updatedBy: 'Amit Kumar'
  },
  {
    id: 'field-other-expenses',
    companyId: 'company-1',
    label: 'Other Expenses',
    category: 'Other',
    type: 'Currency',
    unit: 'Unit',
    defaultValue: 300.0,
    currency: '₹',
    isShared: false,
    usedIn: ['calc-printing'],
    description: 'Miscellaneous setup fees',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    updatedBy: 'Amit Kumar'
  },
  {
    id: 'field-gst-18',
    companyId: 'company-1',
    label: 'GST (18%)',
    category: 'Tax',
    type: 'Percentage',
    unit: '%',
    defaultValue: 18.0,
    currency: '₹',
    isShared: true,
    usedIn: ['calc-printing'],
    description: 'Standard Goods & Services Tax',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    updatedBy: 'Amit Kumar'
  },
  {
    id: 'field-profit-15',
    companyId: 'company-1',
    label: 'Profit (15%)',
    category: 'Profit',
    type: 'Percentage',
    unit: '%',
    defaultValue: 15.0,
    currency: '₹',
    isShared: true,
    usedIn: ['calc-printing'],
    description: 'Desired profit margin percentage',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    updatedBy: 'Amit Kumar'
  }
];

const initialState: LibraryState = {
  fields: initialFields,
  searchQuery: '',
  selectedCategory: null,
  isSaving: false
};

// Async Thunks for Firestore Operations
export const saveFieldAsync = createAsyncThunk(
  'library/saveField',
  async (field: CostField) => {
    try {
      await dbSaveCostField(field.companyId, field);
    } catch (e) {
      console.warn("Firestore save failed, updating locally:", e);
    }
    return field;
  }
);

export const deleteFieldAsync = createAsyncThunk(
  'library/deleteField',
  async ({ companyId, fieldId }: { companyId: string; fieldId: string }) => {
    try {
      await dbDeleteCostField(companyId, fieldId);
    } catch (e) {
      console.warn("Firestore delete failed, updating locally:", e);
    }
    return fieldId;
  }
);

export const fetchFieldsAsync = createAsyncThunk(
  'library/fetchFields',
  async () => {
    try {
      const list = await dbGetCostFields('company-1');
      if (list.length === 0) {
        // Seed initial mock data into Firestore if Firestore is empty
        for (const f of initialFields) {
          await dbSaveCostField('company-1', f);
        }
        return initialFields;
      }
      return list;
    } catch (e) {
      console.warn("Firestore load failed, falling back to initial data:", e);
      return initialFields;
    }
  }
);

export const librarySlice = createSlice({
  name: 'library',
  initialState,
  reducers: {
    // Sync hooks for components
    addField: (state, action: PayloadAction<Omit<CostField, 'id' | 'createdAt' | 'updatedAt'>>) => {
      const newField: CostField = {
        ...action.payload,
        id: `field-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      state.fields.push(newField);
      // Run side-effect firestore call in background
      dbSaveCostField(newField.companyId, newField).catch(console.warn);
    },
    updateField: (state, action: PayloadAction<Partial<CostField> & { id: string }>) => {
      const idx = state.fields.findIndex(f => f.id === action.payload.id);
      if (idx !== -1) {
        state.fields[idx] = {
          ...state.fields[idx],
          ...action.payload,
          updatedAt: new Date().toISOString()
        };
        dbSaveCostField(state.fields[idx].companyId, state.fields[idx]).catch(console.warn);
      }
    },
    deleteField: (state, action: PayloadAction<string>) => {
      const field = state.fields.find(f => f.id === action.payload);
      if (field) {
        state.fields = state.fields.filter(f => f.id !== action.payload);
        dbDeleteCostField(field.companyId, field.id).catch(console.warn);
      }
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setSelectedCategory: (state, action: PayloadAction<string | null>) => {
      state.selectedCategory = action.payload;
    },
    addFieldToCalculator: (state, action: PayloadAction<{ fieldId: string; calculatorId: string }>) => {
      const field = state.fields.find(f => f.id === action.payload.fieldId);
      if (field && !field.usedIn.includes(action.payload.calculatorId)) {
        field.usedIn.push(action.payload.calculatorId);
        dbSaveCostField(field.companyId, field).catch(console.warn);
      }
    },
    removeFieldFromCalculator: (state, action: PayloadAction<{ fieldId: string; calculatorId: string }>) => {
      const field = state.fields.find(f => f.id === action.payload.fieldId);
      if (field) {
        field.usedIn = field.usedIn.filter(id => id !== action.payload.calculatorId);
        dbSaveCostField(field.companyId, field).catch(console.warn);
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Fields Async
      .addCase(fetchFieldsAsync.pending, (state) => {
        state.isSaving = true;
      })
      .addCase(fetchFieldsAsync.fulfilled, (state, action) => {
        state.isSaving = false;
        state.fields = action.payload;
      })
      .addCase(fetchFieldsAsync.rejected, (state) => {
        state.isSaving = false;
      })
      // Save Field Async
      .addCase(saveFieldAsync.pending, (state) => {
        state.isSaving = true;
      })
      .addCase(saveFieldAsync.fulfilled, (state, action) => {
        state.isSaving = false;
        const idx = state.fields.findIndex(f => f.id === action.payload.id);
        if (idx !== -1) {
          state.fields[idx] = action.payload;
        } else {
          state.fields.push(action.payload);
        }
      })
      .addCase(saveFieldAsync.rejected, (state) => {
        state.isSaving = false;
      })
      // Delete Field Async
      .addCase(deleteFieldAsync.pending, (state) => {
        state.isSaving = true;
      })
      .addCase(deleteFieldAsync.fulfilled, (state, action) => {
        state.isSaving = false;
        state.fields = state.fields.filter(f => f.id !== action.payload);
      })
      .addCase(deleteFieldAsync.rejected, (state) => {
        state.isSaving = false;
      });
  }
});

export const {
  addField,
  updateField,
  deleteField,
  setSearchQuery,
  setSelectedCategory,
  addFieldToCalculator,
  removeFieldFromCalculator
} = librarySlice.actions;

export default librarySlice.reducer;
