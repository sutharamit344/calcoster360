'use client';

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import {
  setActiveCalculatorId,
  addCalculator,
  deleteCalculator,
  addProfileToCalculator,
  deleteProfileFromCalculator,
  restoreHistoryVersion,
  updateCalculatorSettings
} from '../../store/slices/calculatorSlice';
import DashboardLayout from '../../components/layout/DashboardLayout';
import CostBuilder from '../../components/calculator/CostBuilder';
import PropertiesPanel from '../../components/calculator/PropertiesPanel';
import RunCalculator from '../../components/calculator/RunCalculator';
import {
  Wrench,
  Play,
  Bookmark,
  History as HistoryIcon,
  Settings as SettingsIcon,
  ChevronRight,
  Plus,
  FolderOpen,
  Trash2,
  CheckCircle,
  FileClock
} from 'lucide-react';
import { CostProfile } from '@calcoster/types';

export default function CostCalculatorsPage() {
  const dispatch = useDispatch();
  const calculators = useSelector((state: RootState) => state.calculator.calculators);
  const activeCalcId = useSelector((state: RootState) => state.calculator.activeCalculatorId);
  const fields = useSelector((state: RootState) => state.library.fields);
  const isSavingCalc = useSelector((state: RootState) => state.calculator.isSavingCalculator);

  const activeCalc = calculators.find(c => c.id === activeCalcId);
  const [activeTab, setActiveTab] = useState<'build' | 'calculate' | 'profiles' | 'history' | 'settings'>('build');

  // New Calculator Modal
  const [isNewCalcOpen, setIsNewCalcOpen] = useState(false);
  const [newCalcName, setNewCalcName] = useState('');
  const [newCalcIndustry, setNewCalcIndustry] = useState('Manufacturing');
  const [newCalcDesc, setNewCalcDesc] = useState('');

  // New Profile Modal
  const [isNewProfileOpen, setIsNewProfileOpen] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileNotes, setNewProfileNotes] = useState('');

  const handleCreateCalculator = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCalcName.trim()) return;

    dispatch(addCalculator({
      name: newCalcName,
      industry: newCalcIndustry,
      description: newCalcDesc,
      blocks: [],
      profiles: [],
      history: [],
      isActive: true,
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
      createdBy: 'Amit Kumar',
      updatedBy: 'Amit Kumar'
    }));

    setIsNewCalcOpen(false);
    setNewCalcName('');
    setNewCalcDesc('');
    setActiveTab('build');
  };

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName.trim() || !activeCalc) return;

    // Collect current input values
    const currentValues: Record<string, number> = {};
    const collectDefaultValues = (blocks: any[]) => {
      blocks.forEach(b => {
        if (b.type === 'field') {
          const f = fields.find(field => field.id === b.fieldId);
          if (f) {
            currentValues[f.id] = f.defaultValue;
          }
        } else if (b.type === 'group') {
          collectDefaultValues(b.blocks);
        }
      });
    };
    collectDefaultValues(activeCalc.blocks);

    dispatch(addProfileToCalculator({
      calculatorId: activeCalc.id,
      profile: {
        calculatorId: activeCalc.id,
        name: newProfileName,
        values: currentValues,
        notes: newProfileNotes,
        createdBy: 'Amit Kumar'
      }
    }));

    setIsNewProfileOpen(false);
    setNewProfileName('');
    setNewProfileNotes('');
  };

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: 'Cost Calculators', href: '/cost-calculators' },
        { label: activeCalc ? activeCalc.name : 'Choose Calculator' }
      ]}
    >
      <div className="flex h-full gap-4 relative overflow-hidden select-none">
        {/* Calculators Sub-sidebar */}
        <div className="w-56 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col shrink-0 overflow-y-auto text-left">
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Calculators</span>
            <button
              onClick={() => setIsNewCalcOpen(true)}
              className="p-1 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-primary rounded-lg transition-colors border border-zinc-200 dark:border-zinc-800"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex-1 p-2 space-y-0.5">
            {calculators.map(c => (
              <button
                key={c.id}
                onClick={() => {
                  dispatch(setActiveCalculatorId(c.id));
                  setActiveTab('build');
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                  c.id === activeCalcId
                    ? 'bg-primary/10 text-primary'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900/60'
                }`}
              >
                <span className="truncate pr-1">{c.name}</span>
                <ChevronRight className="h-3 w-3 shrink-0 opacity-60" />
              </button>
            ))}
          </div>
        </div>

        {/* Workspace panel */}
        <div className="flex-1 bg-transparent flex flex-col overflow-hidden">
          {activeCalc ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Tab navigation */}
              <div className="flex justify-between items-center bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-4 py-1.5 rounded-2xl mb-4 shrink-0 shadow-sm">
                <div className="flex gap-1.5">
                  {[
                    { id: 'build', name: 'Build', icon: Wrench },
                    { id: 'calculate', name: 'Calculate', icon: Play },
                    { id: 'profiles', name: 'Cost Profiles', icon: Bookmark },
                    { id: 'history', name: 'History', icon: FileClock },
                    { id: 'settings', name: 'Settings', icon: SettingsIcon },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`h-7 px-3 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                        activeTab === tab.id
                          ? 'bg-primary text-primary-foreground'
                          : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                      }`}
                    >
                      <tab.icon className="h-3.5 w-3.5" />
                      {tab.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab contents wrapper */}
              <div className="flex-1 overflow-hidden">
                {activeTab === 'build' && (
                  <div className="flex h-full border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden bg-white dark:bg-zinc-950">
                    <CostBuilder />
                    <PropertiesPanel />
                  </div>
                )}

                {activeTab === 'calculate' && (
                  <RunCalculator />
                )}

                {activeTab === 'profiles' && (
                  <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 h-full flex flex-col overflow-y-auto">
                    <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-850 pb-4 mb-6 shrink-0">
                      <div>
                        <h2 className="text-xs font-bold text-zinc-900 dark:text-zinc-50">Cost Profiles (Presets)</h2>
                        <p className="text-[10px] text-zinc-400 font-medium">Predefined quantities and specifications for rapid quoting.</p>
                      </div>
                      <button
                        onClick={() => setIsNewProfileOpen(true)}
                        className="h-8 px-3 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm"
                      >
                        <Plus className="h-3.5 w-3.5" /> New Preset Profile
                      </button>
                    </div>

                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {activeCalc.profiles.map(p => (
                        <div key={p.id} className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex flex-col justify-between hover:shadow-md transition-shadow bg-zinc-50/20 dark:bg-zinc-900/10">
                          <div className="text-left">
                            <span className="text-xs font-bold text-zinc-850 dark:text-zinc-200 block">{p.name}</span>
                            {p.notes && (
                              <span className="text-[10px] text-zinc-400 mt-1 block leading-relaxed">{p.notes}</span>
                            )}
                            <div className="mt-3.5 pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-1">
                              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Configured inputs:</span>
                              <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px] text-zinc-650 dark:text-zinc-450 font-medium">
                                {Object.entries(p.values).map(([fid, val]) => {
                                  const f = fields.find(field => field.id === fid);
                                  return f ? (
                                    <div key={fid} className="truncate">
                                      {f.label}: <strong className="text-zinc-800 dark:text-zinc-350">{val}</strong>
                                    </div>
                                  ) : null;
                                })}
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 pt-3.5 border-t border-zinc-200 dark:border-zinc-850 flex justify-between items-center text-[10px] text-zinc-400 shrink-0">
                            <span>Created by {p.createdBy}</span>
                            <button
                              onClick={() => dispatch(deleteProfileFromCalculator({ calculatorId: activeCalc.id, profileId: p.id }))}
                              className="text-zinc-400 hover:text-red-500 transition-colors p-1"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {activeCalc.profiles.length === 0 && (
                        <div className="col-span-full py-16 flex flex-col justify-center items-center text-center text-zinc-400">
                          <FolderOpen className="h-8 w-8 text-zinc-300 mb-2 animate-bounce" />
                          <span className="text-xs font-semibold">No preset profiles created yet.</span>
                          <span className="text-[10px] mt-1">Configure profile presets to populate parameters inside calculations with 1-click.</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'history' && (
                  <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 h-full flex flex-col overflow-y-auto">
                    <div className="border-b border-zinc-100 dark:border-zinc-850 pb-4 mb-6 shrink-0 text-left">
                      <h2 className="text-xs font-bold text-zinc-900 dark:text-zinc-50">Calculator Version Log</h2>
                      <p className="text-[10px] text-zinc-400 font-medium">Revert calculator structure or rates to older checkpoints.</p>
                    </div>

                    <div className="flex-1 space-y-6 text-left relative pl-4 border-l border-zinc-200 dark:border-zinc-800 ml-2">
                      {activeCalc.history.map((entry, idx) => (
                        <div key={idx} className="relative space-y-2">
                          {/* Timeline dot */}
                          <div className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 bg-primary rounded-full ring-4 ring-white dark:ring-zinc-950"></div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                                Version {entry.version}
                              </span>
                              <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded-full font-medium">
                                {new Date(entry.updatedAt).toLocaleDateString()} at {new Date(entry.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            {idx > 0 && entry.restoreState.blocks && (
                              <button
                                onClick={() => {
                                  dispatch(restoreHistoryVersion({ calculatorId: activeCalc.id, version: entry.version }));
                                  setActiveTab('build');
                                }}
                                className="text-[10px] bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 text-zinc-650 hover:bg-zinc-100 hover:text-zinc-850 font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                              >
                                Restore Version
                              </button>
                            )}
                          </div>

                          <p className="text-[11px] text-zinc-600 dark:text-zinc-300 font-medium">{entry.description}</p>
                          <span className="block text-[9px] text-zinc-400 font-semibold">Modified by {entry.updatedBy}</span>

                          {entry.changes.length > 0 && (
                            <div className="bg-zinc-50 dark:bg-zinc-900 p-2.5 rounded-lg border border-zinc-100 dark:border-zinc-850 space-y-1">
                              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Audit Log:</span>
                              {entry.changes.map((c, cIdx) => (
                                <div key={cIdx} className="text-[10px] text-zinc-600 dark:text-zinc-450 font-medium">
                                  {c.type === 'added' && <span>➕ Added block: <strong>{c.fieldLabel}</strong></span>}
                                  {c.type === 'removed' && <span>➖ Removed block: <strong>{c.fieldLabel}</strong></span>}
                                  {c.type === 'modified' && (
                                    <span>✏️ Modified: <strong>{c.fieldLabel}</strong> from <span className="line-through">{c.from}</span> to <strong>{c.to}</strong></span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}

                      {activeCalc.history.length === 0 && (
                        <div className="py-12 flex flex-col justify-center items-center text-center text-zinc-400 -ml-4 border-l-0">
                          <CheckCircle className="h-8 w-8 text-zinc-300 mb-2" />
                          <span className="text-xs font-semibold">Initial version track active</span>
                          <span className="text-[10px] mt-1">Changes made to rates or flow parameters will trigger audit backups.</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'settings' && (
                  <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 h-full flex flex-col overflow-y-auto text-left">
                    <div className="border-b border-zinc-100 dark:border-zinc-850 pb-4 mb-6 shrink-0">
                      <h2 className="text-xs font-bold text-zinc-900 dark:text-zinc-50">Calculator Settings</h2>
                      <p className="text-[10px] text-zinc-400 font-medium">Manage localization, constraints, and deletion overrides.</p>
                    </div>

                    <div className="max-w-md space-y-5 flex-1">
                      {/* Currency Settings */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Default Currency</label>
                        <select
                          value={activeCalc.settings.defaultCurrency}
                          onChange={(e) => dispatch(updateCalculatorSettings({ calculatorId: activeCalc.id, settings: { defaultCurrency: e.target.value } }))}
                          className="w-full h-8 px-2 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary text-zinc-900 dark:text-zinc-100 font-semibold"
                        >
                          <option value="₹">₹ (INR - Rupee)</option>
                          <option value="$">$ (USD - Dollar)</option>
                          <option value="€">€ (EUR - Euro)</option>
                        </select>
                      </div>

                      {/* Require all fields toggle */}
                      <div className="flex items-center justify-between py-2 border-y border-zinc-100 dark:border-zinc-800">
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Require All Fields</span>
                          <span className="text-[10px] text-zinc-400">Strict mode validation on quote compilation</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={activeCalc.settings.requireAllFields}
                            onChange={(e) => dispatch(updateCalculatorSettings({ calculatorId: activeCalc.id, settings: { requireAllFields: e.target.checked } }))}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-zinc-200 dark:bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>

                      {/* Allow custom margins toggle */}
                      <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800">
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Allow Custom Margins</span>
                          <span className="text-[10px] text-zinc-400">Permit custom overrides during calculator runs</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={activeCalc.settings.allowCustomMargins}
                            onChange={(e) => dispatch(updateCalculatorSettings({ calculatorId: activeCalc.id, settings: { allowCustomMargins: e.target.checked } }))}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-zinc-200 dark:bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>

                      {/* Generated Quantity Settings */}
                      <div className="border-t border-zinc-100 dark:border-zinc-800 pt-5 space-y-4">
                        <div>
                          <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-50">Generated Quantity</h3>
                          <p className="text-[10px] text-zinc-400 font-medium">Configure calculation of cost per output unit (e.g. cost per piece).</p>
                        </div>

                        {/* Enable Toggle */}
                        <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800">
                          <div className="flex flex-col text-left">
                            <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Enable Generated Quantity</span>
                            <span className="text-[10px] text-zinc-400">Calculate cost per generated unit from total cost</span>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={activeCalc.settings.generatedQuantity?.enabled || false}
                              onChange={(e) => {
                                const current = activeCalc.settings.generatedQuantity || {
                                  enabled: false,
                                  label: "Produced Pieces",
                                  unit: "Pieces",
                                  defaultValue: 1,
                                  allowManualEdit: true,
                                  showCostPerUnit: true,
                                  costPerUnitLabel: "Cost Per Piece"
                                };
                                dispatch(updateCalculatorSettings({
                                  calculatorId: activeCalc.id,
                                  settings: {
                                    generatedQuantity: {
                                      ...current,
                                      enabled: e.target.checked
                                    }
                                  }
                                }));
                              }}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-zinc-200 dark:bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                          </label>
                        </div>

                        {activeCalc.settings.generatedQuantity?.enabled && (
                          <div className="space-y-4 pl-3 border-l-2 border-zinc-100 dark:border-zinc-800">
                            {/* Output Label */}
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Output Label</label>
                              <input
                                type="text"
                                value={activeCalc.settings.generatedQuantity.label}
                                onChange={(e) => {
                                  dispatch(updateCalculatorSettings({
                                    calculatorId: activeCalc.id,
                                    settings: {
                                      generatedQuantity: {
                                        ...activeCalc.settings.generatedQuantity!,
                                        label: e.target.value
                                      }
                                    }
                                  }));
                                }}
                                className="w-full h-8 px-3 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary text-zinc-900 dark:text-zinc-100"
                                placeholder="e.g. Produced Pieces, Tickets Printed"
                                required
                              />
                            </div>

                            {/* Output Unit */}
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Output Unit</label>
                              <input
                                type="text"
                                value={activeCalc.settings.generatedQuantity.unit}
                                onChange={(e) => {
                                  dispatch(updateCalculatorSettings({
                                    calculatorId: activeCalc.id,
                                    settings: {
                                      generatedQuantity: {
                                        ...activeCalc.settings.generatedQuantity!,
                                        unit: e.target.value
                                      }
                                    }
                                  }));
                                }}
                                className="w-full h-8 px-3 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary text-zinc-900 dark:text-zinc-100"
                                placeholder="e.g. Pieces, Cards, Box"
                                required
                              />
                            </div>

                            {/* Default Quantity */}
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Default Quantity</label>
                              <input
                                type="number"
                                min="1"
                                value={activeCalc.settings.generatedQuantity.defaultValue}
                                onChange={(e) => {
                                  const val = Math.max(1, Number(e.target.value));
                                  dispatch(updateCalculatorSettings({
                                    calculatorId: activeCalc.id,
                                    settings: {
                                      generatedQuantity: {
                                        ...activeCalc.settings.generatedQuantity!,
                                        defaultValue: val
                                      }
                                    }
                                  }));
                                }}
                                className="w-full h-8 px-3 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary text-zinc-900 dark:text-zinc-100"
                                required
                              />
                            </div>

                            {/* Allow Manual Edit */}
                            <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800">
                              <div className="flex flex-col text-left">
                                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Allow Manual Editing During Calculation</span>
                                <span className="text-[10px] text-zinc-400">Permit overriding quantity in calculate view</span>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={activeCalc.settings.generatedQuantity.allowManualEdit}
                                  onChange={(e) => {
                                    dispatch(updateCalculatorSettings({
                                      calculatorId: activeCalc.id,
                                      settings: {
                                        generatedQuantity: {
                                          ...activeCalc.settings.generatedQuantity!,
                                          allowManualEdit: e.target.checked
                                        }
                                      }
                                    }));
                                  }}
                                  className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-zinc-200 dark:bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                              </label>
                            </div>

                            {/* Show Cost Per Unit */}
                            <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800">
                              <div className="flex flex-col text-left">
                                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Show Cost Per Unit</span>
                                <span className="text-[10px] text-zinc-400">Display cost per unit in the summary panel</span>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={activeCalc.settings.generatedQuantity.showCostPerUnit}
                                  onChange={(e) => {
                                    dispatch(updateCalculatorSettings({
                                      calculatorId: activeCalc.id,
                                      settings: {
                                        generatedQuantity: {
                                          ...activeCalc.settings.generatedQuantity!,
                                          showCostPerUnit: e.target.checked
                                        }
                                      }
                                    }));
                                  }}
                                  className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-zinc-200 dark:bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                              </label>
                            </div>

                            {activeCalc.settings.generatedQuantity.showCostPerUnit && (
                              /* Cost Per Unit Label */
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Cost Per Unit Label</label>
                                <input
                                  type="text"
                                  value={activeCalc.settings.generatedQuantity.costPerUnitLabel}
                                  onChange={(e) => {
                                    dispatch(updateCalculatorSettings({
                                      calculatorId: activeCalc.id,
                                      settings: {
                                        generatedQuantity: {
                                          ...activeCalc.settings.generatedQuantity!,
                                          costPerUnitLabel: e.target.value
                                        }
                                      }
                                    }));
                                  }}
                                  className="w-full h-8 px-3 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary text-zinc-900 dark:text-zinc-100"
                                  placeholder="e.g. Cost Per Piece, Cost Per Card"
                                  required
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Delete Danger Section */}
                      <div className="p-4 border border-red-200/50 dark:border-red-950/20 rounded-xl bg-red-500/[0.02] space-y-3">
                        <h4 className="text-xs font-bold text-red-650 dark:text-red-400">Danger Zone</h4>
                        <p className="text-[10px] text-zinc-400">Deleting this calculator deletes all associated version logs and preset profiles. This cannot be undone.</p>
                        <button
                          onClick={() => dispatch(deleteCalculator(activeCalc.id))}
                          className="h-8 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete Cost Calculator
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-center items-center text-center p-8 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
              <FolderOpen className="h-10 w-10 text-zinc-300 dark:text-zinc-700 mb-2 animate-bounce" />
              <span className="text-xs font-semibold">Workspace is Empty</span>
              <span className="text-[10px] text-zinc-400 mt-1 max-w-[200px]">Create or select a calculator from the sidebar list.</span>
            </div>
          )}
        </div>
      </div>

      {/* New Calculator Modal */}
      {isNewCalcOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <form onSubmit={handleCreateCalculator} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-sm p-6 shadow-xl text-left select-none space-y-4">
            <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-50">Create New Calculator</h3>

            {/* Name */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Calculator Name</label>
              <input
                type="text"
                value={newCalcName}
                onChange={(e) => setNewCalcName(e.target.value)}
                placeholder="e.g. Printing Cost Calculator"
                className="w-full h-8 px-3 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary text-zinc-900 dark:text-zinc-100"
                required
              />
            </div>

            {/* Industry Category */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Industry</label>
              <select
                value={newCalcIndustry}
                onChange={(e) => setNewCalcIndustry(e.target.value)}
                className="w-full h-8 px-2 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary text-zinc-900 dark:text-zinc-100 font-semibold"
              >
                <option value="Printing">Printing</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Furniture">Furniture</option>
                <option value="Granite">Granite</option>
                <option value="Construction">Construction</option>
                <option value="Digital Agencies">Digital Agencies</option>
              </select>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Description</label>
              <textarea
                value={newCalcDesc}
                onChange={(e) => setNewCalcDesc(e.target.value)}
                className="w-full h-20 px-3 py-2 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-lg text-xs resize-none focus:outline-none focus:ring-1 focus:ring-primary text-zinc-900 dark:text-zinc-100"
                placeholder="Brief summary of costing goals..."
              />
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsNewCalcOpen(false)}
                className="h-8 px-4 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-xs font-semibold rounded-lg text-zinc-650 dark:text-zinc-450"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSavingCalc}
                className="h-8 px-4 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 min-w-[120px] disabled:opacity-50"
              >
                {isSavingCalc ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating...
                  </>
                ) : (
                  'Create Calculator'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* New Profile Modal */}
      {isNewProfileOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <form onSubmit={handleCreateProfile} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-sm p-6 shadow-xl text-left select-none space-y-4">
            <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-50">Create New Preset Profile</h3>

            {/* Name */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Profile Name</label>
              <input
                type="text"
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
                placeholder="e.g. Luxury visiting card"
                className="w-full h-8 px-3 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary text-zinc-900 dark:text-zinc-100"
                required
              />
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Description/Notes</label>
              <textarea
                value={newProfileNotes}
                onChange={(e) => setNewProfileNotes(e.target.value)}
                className="w-full h-20 px-3 py-2 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-lg text-xs resize-none focus:outline-none focus:ring-1 focus:ring-primary text-zinc-900 dark:text-zinc-100"
                placeholder="e.g. 500 Sheets, double sided, high quality..."
              />
            </div>

            <div className="text-[10px] text-zinc-400 bg-zinc-50 dark:bg-zinc-900 p-3 rounded-lg border border-zinc-200 dark:border-zinc-850">
              📌 This profile preset will capture all current values in the builder as defaults.
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsNewProfileOpen(false)}
                className="h-8 px-4 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-xs font-semibold rounded-lg text-zinc-650 dark:text-zinc-450"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSavingCalc}
                className="h-8 px-4 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 min-w-[110px] disabled:opacity-50"
              >
                {isSavingCalc ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating...
                  </>
                ) : (
                  'Create Preset'
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </DashboardLayout>
  );
}
