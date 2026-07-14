'use client';

import React, { useRef, useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { store, AppStore, AppDispatch } from '../store';
import { fetchCalculatorsAsync } from '../store/slices/calculatorSlice';
import { fetchFieldsAsync } from '../store/slices/librarySlice';
import { fetchQuotationsAsync } from '../store/slices/quotationSlice';

function DataInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchCalculatorsAsync());
    dispatch(fetchFieldsAsync());
    dispatch(fetchQuotationsAsync());
  }, [dispatch]);

  return <>{children}</>;
}

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = store;
  }

  return (
    <Provider store={storeRef.current}>
      <DataInitializer>{children}</DataInitializer>
    </Provider>
  );
}
