'use client';

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import {
  addBlockToCalculator,
  reorderBlocksInCalculator,
  setSelectedBlockId,
  updateBlockInCalculator,
  removeBlockFromCalculator
} from '../../store/slices/calculatorSlice';
import { addField } from '../../store/slices/librarySlice';
import { calculate } from '@calcoster/calculator-engine';
import {
  Plus,
  Search,
  Star,
  ChevronDown,
  ChevronUp,
  Folder,
  Sliders,
  DollarSign,
  Percent,
  PlusCircle,
  HelpCircle,
  FolderOpen,
  ArrowDown,
  Trash2,
  Settings,
  Maximize2
} from 'lucide-react';
import { CalculatorBlock, CostCategory, CostField } from '@calcoster/types';

export default function CostBuilder() {
  const dispatch = useDispatch();
  const activeCalcId = useSelector((state: RootState) => state.calculator.activeCalculatorId);
  const selectedBlockId = useSelector((state: RootState) => state.calculator.selectedBlockId);
  const calculators = useSelector((state: RootState) => state.calculator.calculators);
  const fields = useSelector((state: RootState) => state.library.fields);
  const isSavingField = useSelector((state: RootState) => state.library.isSaving);

  const activeCalc = calculators.find(c => c.id === activeCalcId);

  const [zoom, setZoom] = useState(100);

  if (!activeCalc) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center text-center p-8 select-none">
        <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">No Calculator Selected</h2>
        <p className="text-xs text-zinc-400 mt-1">Please select or create a cost calculator to begin building costing logic.</p>
      </div>
    );
  }

  const previewInputsRedux = useSelector((state: RootState) => state.calculator.previewInputs?.[activeCalc.id] || {});

  // Live preview calculation: read from Redux, fallback to defaults
  const previewInputs: Record<string, number> = { ...previewInputsRedux };
  previewInputs['__auto_scale'] = 0; // Force manual/base preview inside canvas builder
  const collectFieldIds = (blocks: CalculatorBlock[]) => {
    blocks.forEach(b => {
      if (b.type === 'field') {
        const f = fields.find(field => field.id === b.fieldId);
        if (f && previewInputs[f.id] === undefined) {
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
            defaultQty = 50;
          }
          previewInputs[f.id] = defaultQty;
        }
      } else if (b.type === 'group') {
        collectFieldIds(b.blocks);
      }
    });
  };
  collectFieldIds(activeCalc.blocks);

  const calcResult = calculate(activeCalc, previewInputs, fields);

  const handleCreateGroupBlock = () => {
    if (selectedBlockId) {
      // Find the selected block and wrap it in a group
      const updated = JSON.parse(JSON.stringify(activeCalc.blocks)) as CalculatorBlock[];
      
      // Check if selected block is at top level
      const idx = updated.findIndex(b => b.id === selectedBlockId);
      if (idx !== -1) {
        const selectedBlock = updated[idx];
        const newGroup: CalculatorBlock = {
          id: `block-group-${Date.now()}`,
          type: 'group',
          name: 'Custom Group',
          operatorBefore: selectedBlock.operatorBefore || '+',
          blocks: [
            {
              ...selectedBlock,
              operatorBefore: '+' // Reset first item operator inside group
            }
          ]
        };
        // Replace selected block with the new group
        updated[idx] = newGroup;
        dispatch(reorderBlocksInCalculator({ calculatorId: activeCalc.id, blocks: updated }));
        dispatch(setSelectedBlockId(newGroup.id)); // Set the group as selected
        return;
      }
    }

    // Default: create a new empty group at the end
    const newGroup: CalculatorBlock = {
      id: `block-group-${Date.now()}`,
      type: 'group',
      name: 'Custom Group',
      operatorBefore: '+',
      blocks: []
    };
    dispatch(addBlockToCalculator({ calculatorId: activeCalc.id, block: newGroup }));
  };

  const handleToggleOperator = (blockId: string, currentOp: string) => {
    const ops: ('+' | '-' | '*' | '/')[] = ['+', '-', '*', '/'];
    const nextIdx = (ops.indexOf(currentOp as any) + 1) % ops.length;
    dispatch(updateBlockInCalculator({
      calculatorId: activeCalc.id,
      blockId,
      updates: { operatorBefore: ops[nextIdx] }
    }));
  };

  const handleMoveBlock = (blockId: string, direction: 'up' | 'down') => {
    const updated = JSON.parse(JSON.stringify(activeCalc.blocks)) as CalculatorBlock[];

    // 1. Check if block is at top level
    const topIdx = updated.findIndex(b => b.id === blockId);
    if (topIdx !== -1) {
      const block = updated[topIdx];
      if (direction === 'up') {
        if (topIdx > 0) {
          const prev = updated[topIdx - 1];
          if (prev.type === 'group') {
            // Move inside group as last item
            prev.blocks.push(block);
            updated.splice(topIdx, 1);
          } else {
            // Swap
            updated[topIdx] = prev;
            updated[topIdx - 1] = block;
          }
        }
      } else {
        if (topIdx < updated.length - 1) {
          const next = updated[topIdx + 1];
          if (next.type === 'group') {
            // Move inside group as first item
            next.blocks.unshift(block);
            updated.splice(topIdx, 1);
          } else {
            // Swap
            updated[topIdx] = next;
            updated[topIdx + 1] = block;
          }
        }
      }
      dispatch(reorderBlocksInCalculator({ calculatorId: activeCalc.id, blocks: updated }));
      return;
    }

    // 2. Check if block is inside a group
    for (let i = 0; i < updated.length; i++) {
      const group = updated[i];
      if (group.type === 'group') {
        const subIdx = group.blocks.findIndex(b => b.id === blockId);
        if (subIdx !== -1) {
          const block = group.blocks[subIdx];
          if (direction === 'up') {
            if (subIdx > 0) {
              // Swap inside group
              group.blocks[subIdx] = group.blocks[subIdx - 1];
              group.blocks[subIdx - 1] = block;
            } else {
              // Move out of group (above it)
              updated.splice(i, 0, block);
              group.blocks.splice(0, 1);
            }
          } else {
            if (subIdx < group.blocks.length - 1) {
              // Swap inside group
              group.blocks[subIdx] = group.blocks[subIdx + 1];
              group.blocks[subIdx + 1] = block;
            } else {
              // Move out of group (below it)
              updated.splice(i + 1, 0, block);
              group.blocks.splice(subIdx, 1);
            }
          }
          dispatch(reorderBlocksInCalculator({ calculatorId: activeCalc.id, blocks: updated }));
          return;
        }
      }
    }
  };



  // Render a block inside canvas
  const renderBlockCard = (block: CalculatorBlock, idx: number, siblings: CalculatorBlock[], isSubBlock = false) => {
    const isSelected = selectedBlockId === block.id;
    if (block.type === 'field') {
      const field = fields.find(f => f.id === block.fieldId);
      if (!field) return null;

      const cardVal = calcResult.outputs[field.id] || 0;
      const qty = previewInputs[field.id];
      const rateStr = field.type === 'Percentage'
        ? `${field.defaultValue}%`
        : `${qty !== undefined ? `${qty} ${field.unit}s × ` : ''}₹${field.defaultValue.toFixed(2)} / ${field.unit}`;

      // Color category borders
      let categoryBg = 'border-l-green-500';
      if (field.category === 'Material') categoryBg = 'border-l-emerald-500';
      else if (field.category === 'Labour') categoryBg = 'border-l-purple-500';
      else if (field.category === 'Machine') categoryBg = 'border-l-blue-500';
      else if (field.category === 'Process') categoryBg = 'border-l-indigo-500';
      else if (field.category === 'Tax') categoryBg = 'border-l-violet-500 bg-violet-500/5';
      else if (field.category === 'Profit') categoryBg = 'border-l-rose-500 bg-rose-500/5';

      const hasPrevField = idx > 0 && siblings[idx - 1].type === 'field';
      const hasNextField = idx < siblings.length - 1 && siblings[idx + 1].type === 'field';
      const prevBlock = idx > 0 ? siblings[idx - 1] : null;
      const isTransitionBetweenFields = prevBlock && prevBlock.type === 'field' && block.type === 'field';

      let wrapperMargin = 'mt-0';
      if (prevBlock && prevBlock.type === 'group') {
        wrapperMargin = 'mt-4';
      }

      let roundingClass = 'rounded-xl';
      if (hasPrevField && hasNextField) {
        roundingClass = 'rounded-none';
      } else if (hasPrevField && !hasNextField) {
        roundingClass = 'rounded-b-xl rounded-t-none';
      } else if (!hasPrevField && hasNextField) {
        roundingClass = 'rounded-t-xl rounded-b-none';
      }

      return (
        <div key={block.id} className={`flex flex-col items-center w-full ${wrapperMargin}`}>
          {idx > 0 && (
            isTransitionBetweenFields ? (
              <div className="relative w-full flex justify-center h-0 z-20">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleOperator(block.id, block.operatorBefore || '+');
                  }}
                  className="absolute -translate-y-1/2 h-5 w-5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors shadow-md cursor-pointer hover:scale-110 active:scale-95 duration-100"
                >
                  {block.operatorBefore || '+'}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleOperator(block.id, block.operatorBefore || '+');
                }}
                className="my-3 h-5 w-5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors shadow-sm cursor-pointer"
              >
                {block.operatorBefore || '+'}
              </button>
            )
          )}
          <div
            onClick={(e) => {
              e.stopPropagation();
              dispatch(setSelectedBlockId(block.id));
            }}
            className={`w-full max-w-xl bg-white dark:bg-zinc-900 border-l-4 ${categoryBg} border border-zinc-200/80 dark:border-zinc-800 ${roundingClass} ${hasPrevField ? '-mt-[1px]' : ''} px-4 py-3 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between ${
              isSelected ? 'ring-2 ring-primary ring-offset-2 dark:ring-offset-zinc-950 border-primary relative z-10' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-1.5 rounded-lg ${
                field.category === 'Material' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' :
                field.category === 'Labour' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400' :
                field.category === 'Process' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400' :
                'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
              }`}>
                {field.category === 'Tax' ? <Percent className="h-4 w-4" /> : <Sliders className="h-4 w-4" />}
              </div>
              <div className="text-left leading-none">
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{field.label}</span>
                <span className="block text-[10px] text-zinc-400 mt-1 font-medium">{field.category} Cost</span>
              </div>
            </div>

            {/* Calculations & Ordering controls */}
            <div className="flex items-center gap-4">
              <div className="text-right leading-none">
                <span className="text-[10px] text-zinc-400 font-medium">{rateStr}</span>
                <span className="block text-xs font-bold text-zinc-800 dark:text-zinc-100 mt-1">
                  ₹{cardVal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* Move up / down controls (Visible on focus) */}
              {isSelected && (
                <div className="flex flex-col gap-0.5 border-l border-zinc-200 dark:border-zinc-800 pl-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMoveBlock(block.id, 'up');
                    }}
                    className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-0.5 cursor-pointer"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMoveBlock(block.id, 'down');
                    }}
                    className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-0.5 cursor-pointer"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    } else if (block.type === 'group') {
      const prevBlock = idx > 0 ? siblings[idx - 1] : null;

      let wrapperMargin = 'mt-0';
      if (prevBlock) {
        wrapperMargin = 'mt-4';
      }

      return (
        <div key={block.id} className={`flex flex-col items-center w-full ${wrapperMargin}`}>
          {idx > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleOperator(block.id, block.operatorBefore || '+');
              }}
              className="my-3 h-5 w-5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors shadow-sm cursor-pointer"
            >
              {block.operatorBefore || '+'}
            </button>
          )}

          {/* Group container card */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              dispatch(setSelectedBlockId(block.id));
            }}
            className={`w-full max-w-xl bg-zinc-50/50 dark:bg-zinc-900/20 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 relative ${
              isSelected ? 'ring-2 ring-primary border-primary' : ''
            }`}
          >
            {/* Group Label */}
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                📦 {block.name || 'Group'}
              </span>
              <button
                onClick={() => dispatch(removeBlockFromCalculator({ calculatorId: activeCalc.id, blockId: block.id }))}
                className="text-zinc-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>

            {/* Inner blocks stack */}
            <div className="space-y-0">
              {block.blocks.length === 0 ? (
                <div className="text-[10px] text-zinc-400 p-4 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl bg-white dark:bg-zinc-950 text-center">
                  Drag / Add fields here inside group
                </div>
              ) : (
                block.blocks.map((sub, sIdx) => renderBlockCard(sub, sIdx, block.blocks, true))
              )}
            </div>

            {/* Add inside Group */}
            <div className="flex justify-center mt-3">
              <button
                onClick={() => {
                  // Simply append standard tax field or profit field inside group for demo convenience
                  const demoBlock: CalculatorBlock = {
                    id: `block-${Date.now()}`,
                    type: 'field',
                    fieldId: 'field-gst-18',
                    operatorBefore: '+'
                  };
                  const updatedBlocks = activeCalc.blocks.map(b => {
                    if (b.id === block.id) {
                      return {
                        ...b,
                        blocks: [...(b as any).blocks, demoBlock]
                      };
                    }
                    return b;
                  });
                  dispatch(reorderBlocksInCalculator({ calculatorId: activeCalc.id, blocks: updatedBlocks as any }));
                }}
                className="flex items-center gap-1 text-[10px] font-semibold text-primary hover:underline"
              >
                <Plus className="h-3 w-3" /> Add inside group
              </button>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex-1 flex flex-col bg-zinc-50 dark:bg-zinc-950 overflow-hidden relative h-full" onClick={() => dispatch(setSelectedBlockId(null))}>
      {/* Canvas Toolbar */}
      <div className="h-12 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center justify-between px-6 shrink-0 z-10 select-none">
        <div className="flex items-center gap-2">
          <button
            onClick={handleCreateGroupBlock}
            className="h-7 px-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 rounded-lg text-[10px] font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1 transition-colors"
          >
            📦 Group
          </button>
          <button
            onClick={() => {
              if (selectedBlockId) {
                dispatch(removeBlockFromCalculator({ calculatorId: activeCalc.id, blockId: selectedBlockId }));
              }
            }}
            disabled={!selectedBlockId}
            className="h-7 px-3 border border-red-200/50 dark:border-red-950/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 disabled:opacity-40 disabled:hover:bg-transparent rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-colors"
          >
            <Trash2 className="h-3 w-3" /> Delete
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Zoom Control */}
          <div className="flex items-center border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 rounded-lg overflow-hidden h-7">
            <button onClick={() => setZoom(Math.max(50, zoom - 10))} className="px-2 text-xs font-bold text-zinc-500 hover:bg-zinc-200/50">-</button>
            <span className="text-[10px] font-semibold text-zinc-700 dark:text-zinc-300 px-1 w-10 text-center">{zoom}%</span>
            <button onClick={() => setZoom(Math.min(150, zoom + 10))} className="px-2 text-xs font-bold text-zinc-500 hover:bg-zinc-200/50">+</button>
          </div>
          <button className="text-zinc-400 hover:text-zinc-600 p-1">
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Builder Flow Canvas */}
      <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center relative">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" style={{ transform: `scale(${zoom / 100})` }}></div>

        {/* Dynamic Zoom Wrapper */}
        <div className="w-full max-w-xl space-y-0 transition-transform duration-200 relative z-10" style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}>
          {activeCalc.blocks.map((block, idx) => renderBlockCard(block, idx, activeCalc.blocks))}

          {activeCalc.blocks.length === 0 && (
            <div className="py-24 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col items-center justify-center text-center text-zinc-400 bg-white dark:bg-zinc-900/40">
              <Plus className="h-8 w-8 text-zinc-300 mb-2 animate-pulse" />
              <span className="text-xs font-semibold">Formula Canvas is Empty</span>
              <span className="text-[10px] mt-1">Select and add a cost field from the library to build the costing formula.</span>
            </div>
          )}

          {/* Add a beautiful summary preview card inside flow */}
          {activeCalc.blocks.length > 0 && (
            <div className="flex flex-col items-center">
              <div className="my-2.5 h-6 w-6 rounded-full bg-primary/10 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-xs font-bold text-primary shadow-sm">
                =
              </div>
              <div className="w-full bg-gradient-to-br from-primary/10 via-primary/[0.03] to-transparent border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex items-center justify-between shadow-sm select-none hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-primary text-white flex items-center justify-center shadow-md">
                    📊
                  </div>
                  <div className="text-left leading-none">
                    <span className="text-xs font-bold text-zinc-850 dark:text-zinc-100">Estimated Total Cost</span>
                    <span className="block text-[10px] text-zinc-400 mt-1 font-semibold">Final calculated amount</span>
                  </div>
                </div>
                <span className="text-sm font-extrabold text-primary">
                  ₹{calcResult.totalCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Horizontal live subtotal summary bar */}
      <div className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 shrink-0 z-10 select-none text-left">
        <div className="flex items-center justify-between mb-3.5">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            📊 Calculation Summary
            <span className="px-1.5 py-0.5 bg-green-500/10 text-green-500 rounded text-[9px] font-bold">
              Live Preview
            </span>
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {calcResult.breakdown.map((item) => {
            let color = 'border-l-emerald-500';
            if (item.category === 'Labour') color = 'border-l-purple-500';
            else if (item.category === 'Process') color = 'border-l-indigo-500';
            else if (item.category === 'Tax') color = 'border-l-violet-500';
            else if (item.category === 'Profit') color = 'border-l-rose-500';

            return (
              <div key={item.category} className={`bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 border-l-2 ${color} p-2.5 rounded-lg text-left`}>
                <span className="text-[9px] text-zinc-400 font-semibold uppercase">{item.category}</span>
                <span className="block text-xs font-bold text-zinc-800 dark:text-zinc-100 mt-1">
                  ₹{item.amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
              </div>
            );
          })}
          <div className="bg-primary/5 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-lg text-left">
            <span className="text-[9px] text-primary font-bold uppercase">Total Cost</span>
            <span className="block text-xs font-extrabold text-primary mt-1">
              ₹{calcResult.totalCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
