'use client';

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import {
  updateBlockInCalculator,
  removeBlockFromCalculator,
  setSelectedBlockId
} from '../../store/slices/calculatorSlice';
import { updateField } from '../../store/slices/librarySlice';
import { Trash2, Settings, HelpCircle, ChevronRight } from 'lucide-react';
import { CostCategory, FieldType } from '@calcoster/types';
import CostLibraryPanel from './CostLibraryPanel';

export default function PropertiesPanel() {
  const dispatch = useDispatch();
  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const activeCalcId = useSelector((state: RootState) => state.calculator.activeCalculatorId);
  const selectedBlockId = useSelector((state: RootState) => state.calculator.selectedBlockId);
  const calculators = useSelector((state: RootState) => state.calculator.calculators);
  const fields = useSelector((state: RootState) => state.library.fields);

  const activeCalc = calculators.find(c => c.id === activeCalcId);

  // Helper to find block recursive
  const findBlockRecursive = (blocks: any[], id: string): any => {
    for (const b of blocks) {
      if (b.id === id) return b;
      if (b.type === 'group') {
        const found = findBlockRecursive(b.blocks, id);
        if (found) return found;
      }
    }
    return null;
  };

  const selectedBlock = activeCalc ? findBlockRecursive(activeCalc.blocks, selectedBlockId || '') : null;
  const selectedField = selectedBlock && selectedBlock.type === 'field'
    ? fields.find(f => f.id === selectedBlock.fieldId)
    : null;

  if (!selectedBlock) {
    return (
      <div className="w-80 border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 flex flex-col h-full overflow-hidden select-none">
        <CostLibraryPanel />
      </div>
    );
  }

  const handleFieldChange = (updates: any) => {
    if (selectedField) {
      dispatch(updateField({ id: selectedField.id, ...updates }));
    }
  };

  const handleBlockChange = (updates: any) => {
    if (activeCalcId && selectedBlockId) {
      dispatch(updateBlockInCalculator({
        calculatorId: activeCalcId,
        blockId: selectedBlockId,
        updates
      }));
    }
  };

  const handleDelete = () => {
    if (activeCalcId && selectedBlockId) {
      dispatch(removeBlockFromCalculator({
        calculatorId: activeCalcId,
        blockId: selectedBlockId
      }));
    }
  };

  return (
    <div className="w-80 border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 flex flex-col h-full overflow-y-auto select-none">
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4 mb-4">
        <div className="flex items-center gap-1.5">
          <button 
            onClick={() => dispatch(setSelectedBlockId(null))}
            className="text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 p-1 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-zinc-200/50 dark:hover:border-zinc-800/60"
            title="Back to Cost Library"
          >
            <ChevronRight className="h-4 w-4 rotate-180" />
          </button>
          <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-50">Properties</h3>
        </div>
        {selectedBlock.type === 'field' && (
          <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-650 dark:text-zinc-300 px-2 py-0.5 rounded font-bold">
            Field
          </span>
        )}
        {selectedBlock.type === 'group' && (
          <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-bold">
            Group
          </span>
        )}
      </div>

      {selectedBlock.type === 'field' && selectedField ? (
        <div className="flex-1 space-y-4 text-left">
          {/* Selected Field Dropdown */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Selected Field</label>
            <select
              value={selectedField.id}
              onChange={(e) => handleBlockChange({ fieldId: e.target.value })}
              className="w-full h-8 px-2 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary text-zinc-900 dark:text-zinc-100"
            >
              {fields.map(f => (
                <option key={f.id} value={f.id}>{f.label}</option>
              ))}
            </select>
          </div>

          {/* Label Input */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Label</label>
            <input
              type="text"
              value={selectedField.label}
              onChange={(e) => handleFieldChange({ label: e.target.value })}
              className="w-full h-8 px-3 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary text-zinc-900 dark:text-zinc-100"
            />
          </div>

          {/* Category Selector */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Category</label>
            <select
              value={selectedField.category}
              onChange={(e) => handleFieldChange({ category: e.target.value as CostCategory })}
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

          {/* Field Type */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Field Type</label>
            <select
              value={selectedField.type}
              onChange={(e) => handleFieldChange({ type: e.target.value as FieldType })}
              className="w-full h-8 px-2 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary text-zinc-900 dark:text-zinc-100"
            >
              <option value="Currency">Currency (₹)</option>
              <option value="Number">Number</option>
              <option value="Percentage">Percentage (%)</option>
            </select>
          </div>

          {/* Unit Rate */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Unit</label>
              <input
                type="text"
                value={selectedField.unit}
                onChange={(e) => handleFieldChange({ unit: e.target.value })}
                placeholder="e.g. Sheet"
                className="w-full h-8 px-3 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary text-zinc-900 dark:text-zinc-100"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Default Rate</label>
              <input
                type="number"
                value={selectedField.defaultValue}
                onChange={(e) => handleFieldChange({ defaultValue: Number(e.target.value) })}
                className="w-full h-8 px-3 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          {/* Required Fields toggle */}
          <div className="flex items-center justify-between py-2 border-y border-zinc-100 dark:border-zinc-800">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Required Field</span>
              <span className="text-[10px] text-zinc-400">Must have value in calculations</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={selectedField.isRequired || false}
                onChange={(e) => handleFieldChange({ isRequired: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-zinc-200 dark:bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Description (Optional)</label>
            <textarea
              value={selectedField.description || ''}
              onChange={(e) => handleFieldChange({ description: e.target.value })}
              className="w-full h-20 px-3 py-2 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-lg text-xs resize-none focus:outline-none focus:ring-1 focus:ring-primary text-zinc-900 dark:text-zinc-100"
            />
          </div>

          {/* Advanced Settings */}
          <div 
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 py-2 cursor-pointer font-semibold border-t border-zinc-100 dark:border-zinc-900 mt-3 pt-3"
          >
            <span className="flex items-center gap-1.5">
              <Settings className="h-3.5 w-3.5 text-zinc-400" />
              Advanced Settings
            </span>
            <ChevronRight className={`h-4 w-4 transition-transform duration-250 ${showAdvanced ? 'rotate-90' : ''}`} />
          </div>

          {showAdvanced && (
            <div className="space-y-4 pl-3 border-l-2 border-zinc-200 dark:border-zinc-800 animate-in fade-in slide-in-from-top-1 duration-200 mt-2.5">
              {/* For Output Quantity */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">For Output Quantity</label>
                  <span className="text-[9px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded font-bold">Yield Scale</span>
                </div>
                <input
                  type="number"
                  min="0.0001"
                  step="any"
                  value={selectedField.forOutputQty !== undefined ? selectedField.forOutputQty : 1}
                  onChange={(e) => handleFieldChange({ forOutputQty: Number(e.target.value) || 1 })}
                  className="w-full h-8 px-3 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary text-zinc-900 dark:text-zinc-100"
                  placeholder="e.g. 1"
                />
                <span className="block text-[9px] text-zinc-400 leading-normal font-medium mt-1">
                  The number of produced/generated units this field's usage rate applies to. Default is 1.
                </span>
              </div>

              {/* Output Yield Unit */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Output Yield Unit</label>
                  <span className="text-[9px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded font-bold">Yield Unit</span>
                </div>
                <input
                  type="text"
                  value={selectedField.outputUnit !== undefined ? selectedField.outputUnit : ''}
                  onChange={(e) => handleFieldChange({ outputUnit: e.target.value })}
                  className="w-full h-8 px-3 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary text-zinc-900 dark:text-zinc-100"
                  placeholder="e.g. Piece (fallback is 'units')"
                />
                <span className="block text-[9px] text-zinc-400 leading-normal font-medium mt-1">
                  The unit of produced items for the yield scale (e.g. Piece, Box, Card).
                </span>
              </div>
            </div>
          )}
        </div>
      ) : selectedBlock.type === 'group' ? (
        <div className="flex-1 space-y-4 text-left">
          {/* Group Name */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Group Name</label>
            <input
              type="text"
              value={selectedBlock.name}
              onChange={(e) => handleBlockChange({ name: e.target.value })}
              className="w-full h-8 px-3 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div className="text-[10px] text-zinc-400 bg-zinc-50 dark:bg-zinc-900 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800">
            <strong>Group Behavior:</strong> Nested groups behave like math brackets. All fields inside this group are aggregated first, before applying operators.
          </div>
        </div>
      ) : null}

      {/* Delete Block */}
      <button
        onClick={handleDelete}
        className="w-full h-8 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 mt-4 shrink-0 transition-colors"
      >
        <Trash2 className="h-3.5 w-3.5" />
        Delete Field
      </button>
    </div>
  );
}
