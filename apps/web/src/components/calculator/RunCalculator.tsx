'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { calculate } from '@calcoster/calculator-engine';
import { addQuotation } from '../../store/slices/quotationSlice';
import { Play, FileText, ChevronDown, Check, RefreshCw, Bookmark } from 'lucide-react';
import { CostField } from '@calcoster/types';

export default function RunCalculator() {
  const dispatch = useDispatch();
  const activeCalcId = useSelector((state: RootState) => state.calculator.activeCalculatorId);
  const calculators = useSelector((state: RootState) => state.calculator.calculators);
  const fields = useSelector((state: RootState) => state.library.fields);
  const isSavingQuote = useSelector((state: RootState) => state.quotation.isSavingQuotation);

  const activeCalc = calculators.find(c => c.id === activeCalcId);

  // Profile presets selector state
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');

  // Form input quantities: fieldId -> user-entered amount
  const [inputs, setInputs] = useState<Record<string, number>>({});

  // Quotation trigger state
  const [isQuoting, setIsQuoting] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [isQuoteSuccess, setIsQuoteSuccess] = useState(false);

  // Initialize inputs from active calculator blocks
  useEffect(() => {
    if (activeCalc) {
      const initialInputs: Record<string, number> = {};
      const setDefaults = (blocks: any[]) => {
        blocks.forEach(b => {
          if (b.type === 'field') {
            const f = fields.find(field => field.id === b.fieldId);
            if (f) {
              // Match mock preview defaults:
              let defaultQty = 1;
              if (f.category === 'Tax' || f.category === 'Profit') {
                defaultQty = f.defaultValue;
              } else if (activeCalc.id === 'calc-printing') {
                if (f.id === 'field-paper-cost') defaultQty = 50;
                else if (f.id === 'field-ink-cost') defaultQty = 3;
                else if (f.id === 'field-printing-cost') defaultQty = 1000;
                else if (f.id === 'field-labour-cost') defaultQty = 4;
                else if (f.id === 'field-other-expenses') defaultQty = 1;
              } else {
                defaultQty = 50; // standard fallback
              }
              initialInputs[f.id] = defaultQty;
            }
          } else if (b.type === 'group') {
            setDefaults(b.blocks);
          }
        });
      };
      setDefaults(activeCalc.blocks);
      setInputs(initialInputs);
      setSelectedProfileId('');
    }
  }, [activeCalcId, activeCalc]);

  if (!activeCalc) return null;

  // Gather flat list of all active fields in this calculator
  const activeFields: CostField[] = [];
  const collectActiveFields = (blocks: any[]) => {
    blocks.forEach(b => {
      if (b.type === 'field') {
        const f = fields.find(field => field.id === b.fieldId);
        if (f && !activeFields.some(existing => existing.id === f.id)) {
          activeFields.push(f);
        }
      } else if (b.type === 'group') {
        collectActiveFields(b.blocks);
      }
    });
  };
  collectActiveFields(activeCalc.blocks);

  // Handle preset profile selection
  const handleProfileSelect = (profileId: string) => {
    setSelectedProfileId(profileId);
    const profile = activeCalc.profiles.find(p => p.id === profileId);
    if (profile) {
      const updatedInputs = { ...inputs };
      Object.entries(profile.values).forEach(([fid, val]) => {
        updatedInputs[fid] = val;
      });
      setInputs(updatedInputs);
    }
  };

  const handleInputChange = (fieldId: string, val: number) => {
    setInputs(prev => ({
      ...prev,
      [fieldId]: val
    }));
  };

  const handleResetInputs = () => {
    const reset: Record<string, number> = {};
    activeFields.forEach(f => {
      reset[f.id] = (f.category === 'Tax' || f.category === 'Profit') ? f.defaultValue : 1;
    });
    setInputs(reset);
    setSelectedProfileId('');
  };

  // Perform Calculation
  const result = calculate(activeCalc, inputs, fields);

  // Generate Quote
  const handleGenerateQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName) return;

    const selectedProfile = activeCalc.profiles.find(p => p.id === selectedProfileId);

    dispatch(addQuotation({
      companyId: 'company-1',
      customerName,
      customerEmail: customerEmail || undefined,
      calculatorId: activeCalc.id,
      calculatorName: activeCalc.name,
      profileId: selectedProfileId || undefined,
      profileName: selectedProfile ? selectedProfile.name : undefined,
      inputs,
      totalCost: result.totalCost,
      breakdown: result.breakdown,
      status: 'Sent',
      validUntil: new Date(Date.now() + 15 * 86450000).toISOString(),
      createdBy: 'Amit Kumar'
    }));

    setIsQuoteSuccess(true);
    setTimeout(() => {
      setIsQuoteSuccess(false);
      setIsQuoting(false);
      setCustomerName('');
      setCustomerEmail('');
    }, 2000);
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row gap-6 h-full select-none text-left">
      {/* Inputs Column */}
      <div className="flex-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 md:p-6 flex flex-col overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-850 pb-5 mb-5 shrink-0">
          <div>
            <h2 className="text-xs font-bold text-zinc-900 dark:text-zinc-50">Enter Calculation Parameters</h2>
            <span className="text-[10px] text-zinc-400 font-medium">Configure quantities and rates below to evaluate final costing.</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Profiles Dropdown */}
            {activeCalc.profiles.length > 0 && (
              <div className="relative">
                <select
                  value={selectedProfileId}
                  onChange={(e) => handleProfileSelect(e.target.value)}
                  className="h-8 pl-8 pr-8 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs font-semibold rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-zinc-850 dark:text-zinc-100 appearance-none"
                >
                  <option value="">Load Cost Preset Profile...</option>
                  {activeCalc.profiles.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <Bookmark className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
                <ChevronDown className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
              </div>
            )}

            <button
              onClick={handleResetInputs}
              className="h-8 px-3 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-lg text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="h-3 w-3" /> Reset
            </button>
          </div>
        </div>

        {/* Inputs List */}
        <div className="flex-1 space-y-4">
          {activeFields.length === 0 ? (
            <div className="text-xs text-zinc-400 italic py-8 text-center">
              No fields configured in this calculator. Go to the Build tab to add fields.
            </div>
          ) : (
            activeFields.map(f => {
              const isPercentage = f.type === 'Percentage';
              const val = inputs[f.id] !== undefined ? inputs[f.id] : (isPercentage ? f.defaultValue : 1);

              return (
                <div key={f.id} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center py-2.5 border-b border-zinc-100 dark:border-zinc-900 last:border-b-0">
                  <div className="md:col-span-2 text-left">
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                      {f.label} {isPercentage ? `(${f.unit})` : `(${f.unit}s)`}
                    </span>
                    <span className="block text-[10px] text-zinc-400 mt-1 font-medium">
                      {!isPercentage && (
                        <span className="text-primary font-bold mr-1.5">
                          Rate: ₹{f.defaultValue.toFixed(2)} / {f.unit}
                        </span>
                      )}
                      {f.description && (
                        <>
                          {!isPercentage && <span className="text-zinc-300 dark:text-zinc-700 mx-1.5">•</span>}
                          {f.description}
                        </>
                      )}
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      value={val}
                      onChange={(e) => handleInputChange(f.id, Number(e.target.value))}
                      className="w-full h-8 px-3 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary text-zinc-900 dark:text-zinc-100 text-right pr-8"
                    />
                    <span className="absolute right-3 top-2.5 text-[9px] text-zinc-400 uppercase font-semibold">
                      {isPercentage ? '%' : f.unit}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Actions Button panel */}
        {activeFields.length > 0 && (
          <div className="pt-5 mt-5 border-t border-zinc-100 dark:border-zinc-850 flex gap-3 shrink-0">
            <button
              onClick={() => setIsQuoting(true)}
              className="flex-1 h-9 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 shadow-sm"
            >
              <FileText className="h-4 w-4" />
              Generate Customer Quotation
            </button>
          </div>
        )}
      </div>

      {/* Live Cost Summary Column */}
      <div className="w-full lg:w-96 flex flex-col gap-6 shrink-0">
        {/* Main Cost Banner */}
        <div className="bg-zinc-900 text-white rounded-2xl p-6 border border-zinc-800/80 shadow-md">
          <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Estimated Cost</span>
          <div className="text-2xl font-extrabold text-white mt-2">
            ₹{result.totalCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-zinc-400 mt-2 block font-medium">Includes defined margins and tax rates.</span>
        </div>

        {/* Breakdown details */}
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 flex flex-col">
          <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-50 border-b border-zinc-100 dark:border-zinc-850 pb-3 mb-4">
            Cost Category Breakdown
          </h3>

          <div className="space-y-4 flex-1">
            {result.breakdown.length === 0 ? (
              <div className="text-xs text-zinc-400 italic py-4 text-center">No cost components to display</div>
            ) : (
              result.breakdown.map(item => {
                let barColor = 'bg-green-500';
                if (item.category === 'Labour') barColor = 'bg-purple-500';
                else if (item.category === 'Process') barColor = 'bg-indigo-500';
                else if (item.category === 'Tax') barColor = 'bg-violet-500';
                else if (item.category === 'Profit') barColor = 'bg-rose-500';

                return (
                  <div key={item.category} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-500 font-semibold">{item.category} Cost</span>
                      <span className="font-bold text-zinc-800 dark:text-zinc-200">
                        ₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="w-full bg-zinc-100 dark:bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${barColor}`} style={{ width: `${item.percentageOfTotal}%` }}></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Quote Dialog Modal */}
      {isQuoting && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <form onSubmit={handleGenerateQuote} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-sm p-6 shadow-xl text-left space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-50">Generate Customer Quotation</h3>
            </div>

            {isQuoteSuccess ? (
              <div className="py-6 flex flex-col justify-center items-center text-center">
                <div className="h-10 w-10 bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400 rounded-full flex items-center justify-center mb-3">
                  <Check className="h-5 w-5 animate-bounce" />
                </div>
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Quotation Created!</span>
                <span className="text-[10px] text-zinc-400 mt-1">Available in the Quotations panel.</span>
              </div>
            ) : (
              <>
                {/* Customer Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Customer Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Reliance Retail"
                    className="w-full h-8 px-3 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary text-zinc-900 dark:text-zinc-100"
                    required
                  />
                </div>

                {/* Customer Email */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Customer Email</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="e.g. procurement@reliance.com"
                    className="w-full h-8 px-3 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                {/* Preview Cost */}
                <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-150 dark:border-zinc-850 flex justify-between items-center">
                  <span className="text-[10px] text-zinc-500 font-semibold uppercase">Total Quote Amount</span>
                  <span className="text-sm font-extrabold text-primary">
                    ₹{result.totalCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsQuoting(false)}
                    className="h-8 px-4 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-xs font-semibold rounded-lg text-zinc-650 dark:text-zinc-450"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingQuote}
                    className="h-8 px-4 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 min-w-[90px] disabled:opacity-50"
                  >
                    {isSavingQuote ? (
                      <>
                        <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Creating...
                      </>
                    ) : (
                      'Create Quote'
                    )}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
