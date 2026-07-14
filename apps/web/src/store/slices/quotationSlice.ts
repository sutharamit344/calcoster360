import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Quotation } from '@calcoster/types';
import { dbSaveQuotation, dbDeleteQuotation, dbGetQuotations } from '../../firebase/firestoreService';

interface QuotationState {
  quotations: Quotation[];
  selectedQuotationId: string | null;
  isSavingQuotation: boolean; // Tracks button loading status
}

const initialQuotations: Quotation[] = [
  {
    id: 'quote-1',
    companyId: 'company-1',
    customerName: 'Acme Corporates',
    customerEmail: 'procurement@acme.com',
    customerPhone: '+91 98765 43210',
    calculatorId: 'calc-printing',
    calculatorName: 'Printing Cost Calculator',
    profileId: 'profile-premium-card',
    profileName: 'Premium Visiting Card',
    inputs: {
      'field-paper-cost': 50,
      'field-ink-cost': 3,
      'field-printing-cost': 1000,
      'field-labour-cost': 4,
      'field-other-expenses': 1
    },
    totalCost: 13932.60,
    breakdown: [
      { category: 'Material', label: 'Material Cost', amount: 5550.00, percentageOfTotal: 39.8 },
      { category: 'Process', label: 'Process Cost', amount: 2500.00, percentageOfTotal: 17.9 },
      { category: 'Labour', label: 'Labour Cost', amount: 2000.00, percentageOfTotal: 14.4 },
      { category: 'Other', label: 'Other Cost', amount: 300.00, percentageOfTotal: 2.2 },
      { category: 'Tax', label: 'Tax Cost', amount: 1854.00, percentageOfTotal: 13.3 },
      { category: 'Profit', label: 'Profit Cost', amount: 1728.60, percentageOfTotal: 12.4 }
    ],
    status: 'Approved',
    validUntil: new Date(Date.now() + 15 * 86400000).toISOString(),
    notes: 'Standard discount of 5% applied on bulk production.',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    createdBy: 'Amit Kumar'
  },
  {
    id: 'quote-2',
    companyId: 'company-1',
    customerName: 'Nesta Furnitures',
    customerEmail: 'hello@nestafurniture.com',
    calculatorId: 'calc-printing',
    calculatorName: 'Printing Cost Calculator',
    profileId: 'profile-brochure',
    profileName: 'Brochure (4 Page)',
    inputs: {
      'field-paper-cost': 120,
      'field-ink-cost': 8,
      'field-printing-cost': 2000,
      'field-labour-cost': 10,
      'field-other-expenses': 1
    },
    totalCost: 24500.00,
    breakdown: [
      { category: 'Material', label: 'Material Cost', amount: 12800.00, percentageOfTotal: 52.2 },
      { category: 'Labour', label: 'Labour Cost', amount: 5000.00, percentageOfTotal: 20.4 },
      { category: 'Process', label: 'Process Cost', amount: 4000.00, percentageOfTotal: 16.3 },
      { category: 'Tax', label: 'Tax Cost', amount: 2700.00, percentageOfTotal: 11.1 }
    ],
    status: 'Sent',
    validUntil: new Date(Date.now() + 30 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    createdBy: 'Amit Kumar'
  }
];

const initialState: QuotationState = {
  quotations: initialQuotations,
  selectedQuotationId: null,
  isSavingQuotation: false
};

// Async Thunks for Firestore Operations
export const saveQuotationAsync = createAsyncThunk(
  'quotation/saveQuotation',
  async (quotation: Quotation) => {
    try {
      await dbSaveQuotation('company-1', quotation);
    } catch (e) {
      console.warn("Firestore save failed, updating locally:", e);
    }
    return quotation;
  }
);

export const fetchQuotationsAsync = createAsyncThunk(
  'quotation/fetchQuotations',
  async () => {
    try {
      const list = await dbGetQuotations('company-1');
      if (list.length === 0) {
        // Seed initial mock data into Firestore if Firestore is empty
        for (const q of initialQuotations) {
          await dbSaveQuotation('company-1', q);
        }
        return initialQuotations;
      }
      return list;
    } catch (e) {
      console.warn("Firestore load failed, falling back to initial data:", e);
      return initialQuotations;
    }
  }
);

export const quotationSlice = createSlice({
  name: 'quotation',
  initialState,
  reducers: {
    addQuotation: (state, action: PayloadAction<Omit<Quotation, 'id' | 'createdAt'>>) => {
      const newQuote: Quotation = {
        ...action.payload,
        id: `quote-${Date.now()}`,
        createdAt: new Date().toISOString()
      };
      state.quotations.unshift(newQuote);
      state.selectedQuotationId = newQuote.id;
      dbSaveQuotation('company-1', newQuote).catch(console.warn);
    },
    updateQuotationStatus: (state, action: PayloadAction<{ id: string; status: Quotation['status'] }>) => {
      const quote = state.quotations.find(q => q.id === action.payload.id);
      if (quote) {
        quote.status = action.payload.status;
        dbSaveQuotation('company-1', quote).catch(console.warn);
      }
    },
    deleteQuotation: (state, action: PayloadAction<string>) => {
      state.quotations = state.quotations.filter(q => q.id !== action.payload);
      if (state.selectedQuotationId === action.payload) {
        state.selectedQuotationId = state.quotations[0]?.id || null;
      }
      dbDeleteQuotation('company-1', action.payload).catch(console.warn);
    },
    setSelectedQuotationId: (state, action: PayloadAction<string | null>) => {
      state.selectedQuotationId = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Quotations Async
      .addCase(fetchQuotationsAsync.pending, (state) => {
        state.isSavingQuotation = true;
      })
      .addCase(fetchQuotationsAsync.fulfilled, (state, action) => {
        state.isSavingQuotation = false;
        state.quotations = action.payload;
      })
      .addCase(fetchQuotationsAsync.rejected, (state) => {
        state.isSavingQuotation = false;
      })
      .addCase(saveQuotationAsync.pending, (state) => {
        state.isSavingQuotation = true;
      })
      .addCase(saveQuotationAsync.fulfilled, (state, action) => {
        state.isSavingQuotation = false;
        state.quotations.unshift(action.payload);
        state.selectedQuotationId = action.payload.id;
      })
      .addCase(saveQuotationAsync.rejected, (state) => {
        state.isSavingQuotation = false;
      });
  }
});

export const { addQuotation, updateQuotationStatus, deleteQuotation, setSelectedQuotationId } = quotationSlice.actions;
export default quotationSlice.reducer;
