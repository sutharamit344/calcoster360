import { db } from './config';
import { doc, setDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { CostField, Calculator, Quotation } from '@calcoster/types';

// Helper to delay for demo loading spinner visibility
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

/**
 * Saves/Updates a Cost Field in Firestore.
 */
export async function dbSaveCostField(companyId: string, field: CostField): Promise<void> {
  await delay(600); // Dynamic loader status delay
  const ref = doc(db, 'companies', companyId, 'costFields', field.id);
  await setDoc(ref, field, { merge: true });
}

/**
 * Deletes a Cost Field in Firestore.
 */
export async function dbDeleteCostField(companyId: string, fieldId: string): Promise<void> {
  await delay(500);
  const ref = doc(db, 'companies', companyId, 'costFields', fieldId);
  await deleteDoc(ref);
}

/**
 * Saves/Updates a Calculator layout in Firestore.
 */
export async function dbSaveCalculator(companyId: string, calculator: Calculator): Promise<void> {
  await delay(800);
  const ref = doc(db, 'companies', companyId, 'calculators', calculator.id);
  await setDoc(ref, calculator, { merge: true });
}

/**
 * Deletes a Calculator in Firestore.
 */
export async function dbDeleteCalculator(companyId: string, calculatorId: string): Promise<void> {
  await delay(600);
  const ref = doc(db, 'companies', companyId, 'calculators', calculatorId);
  await deleteDoc(ref);
}

/**
 * Saves/Creates a Quotation in Firestore.
 */
export async function dbSaveQuotation(companyId: string, quotation: Quotation): Promise<void> {
  await delay(700);
  const ref = doc(db, 'companies', companyId, 'quotations', quotation.id);
  await setDoc(ref, quotation);
}

/**
 * Deletes a Quotation in Firestore.
 */
export async function dbDeleteQuotation(companyId: string, quotationId: string): Promise<void> {
  await delay(500);
  const ref = doc(db, 'companies', companyId, 'quotations', quotationId);
  await deleteDoc(ref);
}

/**
 * Fetches all Cost Fields from Firestore.
 */
export async function dbGetCostFields(companyId: string): Promise<CostField[]> {
  const ref = collection(db, 'companies', companyId, 'costFields');
  const snapshot = await getDocs(ref);
  return snapshot.docs.map(doc => doc.data() as CostField);
}

/**
 * Fetches all Calculators from Firestore.
 */
export async function dbGetCalculators(companyId: string): Promise<Calculator[]> {
  const ref = collection(db, 'companies', companyId, 'calculators');
  const snapshot = await getDocs(ref);
  return snapshot.docs.map(doc => doc.data() as Calculator);
}

/**
 * Fetches all Quotations from Firestore.
 */
export async function dbGetQuotations(companyId: string): Promise<Quotation[]> {
  const ref = collection(db, 'companies', companyId, 'quotations');
  const snapshot = await getDocs(ref);
  return snapshot.docs.map(doc => doc.data() as Quotation);
}
