'use client';

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { addBlockToCalculator } from '../../store/slices/calculatorSlice';
import { addField } from '../../store/slices/librarySlice';
import {
  Plus,
  Search,
  ChevronDown,
  PlusCircle,
} from 'lucide-react';
import { CalculatorBlock, CostCategory, CostField } from '@calcoster/types';

export default function CostLibraryPanel() {
  const dispatch = useDispatch();
  const activeCalcId = useSelector((state: RootState) => state.calculator.activeCalculatorId);
  const calculators = useSelector((state: RootState) => state.calculator.calculators);
  const fields = useSelector((state: RootState) => state.library.fields);
  const isSavingField = useSelector((state: RootState) => state.library.isSaving);

  const activeCalc = calculators.find(c => c.id === activeCalcId);

  // Search & Filter state for left library panel
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  // New Field modal state
  const [isNewFieldOpen, setIsNewFieldOpen] = useState(false);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldCategory, setNewFieldCategory] = useState<CostCategory>('Material');
  const [newFieldUnit, setNewFieldUnit] = useState('Unit');
  const [newFieldRate, setNewFieldRate] = useState(0);

  if (!activeCalc) return null;

  const toggleCategory = (cat: string) => {
    setCollapsedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const handleAddFieldToBuilder = (field: CostField) => {
    const newBlock: CalculatorBlock = {
      id: `block-${Date.now()}`,
      type: 'field',
      fieldId: field.id,
      operatorBefore: '+'
    };
    dispatch(addBlockToCalculator({ calculatorId: activeCalc.id, block: newBlock }));
  };

  const handleCreateLocalField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFieldName.trim()) return;

    const newFieldPayload = {
      companyId: 'company-1',
      label: newFieldName,
      category: newFieldCategory,
      type: (newFieldCategory === 'Tax' || newFieldCategory === 'Profit') ? 'Percentage' as const : 'Currency' as const,
      unit: newFieldUnit,
      defaultValue: newFieldRate,
      currency: '₹',
      isShared: true,
      usedIn: [activeCalc.id],
      description: '',
      isRequired: false,
      updatedBy: 'Amit Kumar'
    };

    dispatch(addField(newFieldPayload));
    setNewFieldName('');
    setNewFieldRate(0);
    setNewFieldUnit('Unit');
    setIsNewFieldOpen(false);
  };

  const categories: CostCategory[] = ['Material', 'Labour', 'Machine', 'Process', 'Other', 'Tax'];
  const filteredFields = fields.filter(f => f.label.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex-1 flex flex-col select-none text-left h-full">
      {/* Header & Search */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 pb-4 mb-4 space-y-3">
        <div>
          <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-50">Cost Library</h3>
          <p className="text-[10px] text-zinc-400 font-medium mt-1">Select and add cost parameters to your formula canvas.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search cost fields..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8 pl-8 pr-3 text-xs bg-zinc-50/50 dark:bg-zinc-900/10 border border-zinc-200/50 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-zinc-900 dark:text-zinc-100"
          />
        </div>
      </div>

      {/* Categories List */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-3">
        {categories.map(cat => {
          const catFields = filteredFields.filter(f => f.category === cat);
          const isCollapsed = collapsedCategories[cat];

          return (
            <div key={cat} className="space-y-1">
              <button
                onClick={() => toggleCategory(cat)}
                className="w-full flex items-center justify-between py-1.5 px-2 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 rounded-md transition-colors text-left"
              >
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                  {cat}s ({catFields.length})
                </span>
                <ChevronDown className={`h-3 w-3 text-zinc-400 transition-transform ${isCollapsed ? '-rotate-90' : ''}`} />
              </button>

              {!isCollapsed && (
                <div className="space-y-0.5 pl-1">
                  {catFields.map(f => (
                    <div
                      key={f.id}
                      className="flex items-center justify-between p-2 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 rounded-lg border border-transparent hover:border-zinc-200/20 dark:hover:border-zinc-800/50 transition-all text-xs text-zinc-700 dark:text-zinc-300"
                    >
                      <div className="leading-none text-left max-w-[80%]">
                        <span className="font-semibold block text-zinc-800 dark:text-zinc-200 truncate">{f.label}</span>
                        <span className="text-[9px] text-zinc-400 mt-1 font-medium block">
                          {f.type === 'Percentage' ? `${f.defaultValue}%` : `₹${f.defaultValue}/${f.unit}`}
                        </span>
                      </div>
                      <button
                        onClick={() => handleAddFieldToBuilder(f)}
                        className="p-1 text-primary hover:bg-primary/10 rounded-md transition-colors cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                  {catFields.length === 0 && (
                    <div className="text-[10px] text-zinc-400 px-2 py-1 italic">No fields in category</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Create Field Button */}
      <div className="pt-3 mt-3 border-t border-zinc-200 dark:border-zinc-800">
        <button
          onClick={() => setIsNewFieldOpen(true)}
          className="w-full h-8 border border-dashed border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-[11px] font-semibold text-zinc-650 dark:text-zinc-450 hover:text-zinc-900 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <PlusCircle className="h-4 w-4 text-primary" />
          New Cost Field
        </button>
      </div>

      {/* New Field dialog / Modal */}
      {isNewFieldOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <form onSubmit={handleCreateLocalField} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-sm p-6 shadow-xl text-left select-none space-y-4">
            <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-50">Create New Field</h3>

            {/* Name */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Field Name</label>
              <input
                type="text"
                value={newFieldName}
                onChange={(e) => setNewFieldName(e.target.value)}
                placeholder="e.g. Paper Lamination"
                className="w-full h-8 px-3 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary text-zinc-900 dark:text-zinc-100"
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Category</label>
              <select
                value={newFieldCategory}
                onChange={(e) => setNewFieldCategory(e.target.value as CostCategory)}
                className="w-full h-8 px-2 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary text-zinc-900 dark:text-zinc-100"
              >
                <option value="Material">Material Cost</option>
                <option value="Labour">Labour Cost</option>
                <option value="Machine">Machine Cost</option>
                <option value="Process">Process Cost</option>
                <option value="Other">Other Cost</option>
                <option value="Tax">Tax</option>
                <option value="Profit">Profit</option>
              </select>
            </div>

            {/* Rate & Unit */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Unit</label>
                <input
                  type="text"
                  value={newFieldUnit}
                  onChange={(e) => setNewFieldUnit(e.target.value)}
                  className="w-full h-8 px-3 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary text-zinc-900 dark:text-zinc-100"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Rate / Percent</label>
                <input
                  type="number"
                  value={newFieldRate}
                  onChange={(e) => setNewFieldRate(Number(e.target.value))}
                  className="w-full h-8 px-3 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary text-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsNewFieldOpen(false)}
                className="h-8 px-4 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-xs font-semibold rounded-lg text-zinc-600 dark:text-zinc-450"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSavingField}
                className="h-8 px-4 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 min-w-[90px] disabled:opacity-50"
              >
                {isSavingField ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating...
                  </>
                ) : (
                  'Create Field'
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
