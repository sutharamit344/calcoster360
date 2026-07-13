import { configureStore } from '@reduxjs/toolkit';
import calculatorReducer from './slices/calculatorSlice';
import libraryReducer from './slices/librarySlice';
import quotationReducer from './slices/quotationSlice';

export const store = configureStore({
  reducer: {
    calculator: calculatorReducer,
    library: libraryReducer,
    quotation: quotationReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
