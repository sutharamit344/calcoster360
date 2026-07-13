'use client';

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { addField, updateField, deleteField } from '../../store/slices/librarySlice';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
  Search,
  Plus,
  Trash2,
  Edit2,
  Globe,
  Lock,
  PlusCircle,
  Tag,
  Star
} from 'lucide-react';
import { CostCategory, CostField, FieldType } from '@calcoster/types';

export default function CostLibraryPage() {
  const dispatch = useDispatch();
  const fields = useSelector((state: RootState) => state.library.fields);
  const isSavingField = useSelector((state: RootState) => state.library.isSaving);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  // New field modal
  const [isNewFieldOpen, setIsNewFieldOpen] = useState(false);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldCategory, setNewFieldCategory] = useState<CostCategory>('Material');
  const [newFieldUnit, setNewFieldUnit] = useState('Unit');
  const [newFieldRate, setNewFieldRate] = useState(0);
  const [newFieldShared, setNewFieldShared] = useState(true);

  // Edit field modal
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [editFieldName, setEditFieldName] = useState('');
  const [editFieldCategory, setEditFieldCategory] = useState<CostCategory>('Material');
  const [editFieldUnit, setEditFieldUnit] = useState('Unit');
  const [editFieldRate, setEditFieldRate] = useState(0);
  const [editFieldShared, setEditFieldShared] = useState(true);

  const handleCreateField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFieldName.trim()) return;

    dispatch(addField({
      companyId: 'company-1',
      label: newFieldName,
      category: newFieldCategory,
      type: (newFieldCategory === 'Tax' || newFieldCategory === 'Profit') ? 'Percentage' : 'Currency',
      unit: newFieldUnit,
      defaultValue: newFieldRate,
      currency: '₹',
      isShared: newFieldShared,
      usedIn: [],
      updatedBy: 'Amit Kumar'
    }));

    setIsNewFieldOpen(false);
    setNewFieldName('');
    setNewFieldRate(0);
    setNewFieldUnit('Unit');
  };

  const handleEditClick = (field: CostField) => {
    setEditingFieldId(field.id);
    setEditFieldName(field.label);
    setEditFieldCategory(field.category);
    setEditFieldUnit(field.unit);
    setEditFieldRate(field.defaultValue);
    setEditFieldShared(field.isShared);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFieldName.trim() || !editingFieldId) return;

    dispatch(updateField({
      id: editingFieldId,
      label: editFieldName,
      category: editFieldCategory,
      type: (editFieldCategory === 'Tax' || editFieldCategory === 'Profit') ? 'Percentage' : 'Currency',
      unit: editFieldUnit,
      defaultValue: editFieldRate,
      isShared: editFieldShared,
      updatedBy: 'Amit Kumar'
    }));

    setEditingFieldId(null);
  };

  const filteredFields = fields.filter(f => {
    const matchesSearch = f.label.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || f.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <DashboardLayout title="Cost Library">
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 md:p-6 h-full flex flex-col overflow-y-auto select-none text-left">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-150 dark:border-zinc-850 pb-5 mb-5 shrink-0">
          <div>
            <h2 className="text-xs font-bold text-zinc-900 dark:text-zinc-50">Global Cost Library</h2>
            <p className="text-[10px] text-zinc-400 font-medium">Standardized cost fields. Shared fields update every linked calculator instantly.</p>
          </div>
          <button
            onClick={() => setIsNewFieldOpen(true)}
            className="h-8 px-3 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" /> Add Cost Field
          </button>
        </div>

        {/* Toolbar & Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5 shrink-0">
          {/* Category Tabs */}
          <div className="flex gap-1 overflow-x-auto pb-1 md:pb-0">
            {['All', 'Material', 'Labour', 'Machine', 'Process', 'Tax', 'Profit'].map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`h-7 px-3 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer shrink-0 ${
                  activeCategory === cat
                    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 font-bold'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative w-64 max-w-full">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search library..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-8 pr-3 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-zinc-900 dark:text-zinc-100"
            />
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-150 dark:border-zinc-850 text-zinc-400 font-bold uppercase text-[9px] tracking-wider">
                <th className="py-3 px-3">Field Name</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Default Value</th>
                <th className="py-3 px-3">Scope</th>
                <th className="py-3 px-3">Used In</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
              {filteredFields.map(field => (
                <tr key={field.id} className="hover:bg-zinc-50/40 dark:hover:bg-zinc-900/10 transition-colors">
                  <td className="py-3.5 px-3 font-semibold text-zinc-850 dark:text-zinc-200">{field.label}</td>
                  <td className="py-3.5 px-3">
                    <span className="text-[10px] bg-zinc-50 dark:bg-zinc-900 px-2 py-0.5 rounded font-semibold text-zinc-500">
                      {field.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-zinc-550 dark:text-zinc-400 font-medium">{field.type}</td>
                  <td className="py-3.5 px-3 font-bold text-zinc-800 dark:text-zinc-200">
                    {field.type === 'Percentage' ? `${field.defaultValue}%` : `₹${field.defaultValue.toFixed(2)} / ${field.unit}`}
                  </td>
                  <td className="py-3.5 px-3">
                    {field.isShared ? (
                      <span className="flex items-center gap-1 text-[10px] text-green-600 dark:text-green-400 font-bold">
                        <Globe className="h-3 w-3" /> Shared
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] text-zinc-450 dark:text-zinc-500 font-bold">
                        <Lock className="h-3 w-3" /> Local
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 text-zinc-400 font-bold">{field.usedIn.length} Calcs</td>
                  <td className="py-3.5 px-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEditClick(field)}
                        className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 rounded"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => dispatch(deleteField(field.id))}
                        className="p-1 hover:bg-red-50 dark:hover:bg-red-950/20 text-zinc-400 hover:text-red-500 rounded"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredFields.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-400 italic">
                    No cost fields found matching filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Field Modal */}
      {isNewFieldOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <form onSubmit={handleCreateField} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-sm p-6 shadow-xl text-left select-none space-y-4">
            <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-50">Create Cost Library Field</h3>

            {/* Name */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Field Name</label>
              <input
                type="text"
                value={newFieldName}
                onChange={(e) => setNewFieldName(e.target.value)}
                placeholder="e.g. Laminating foil"
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
                className="w-full h-8 px-2 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary text-zinc-900 dark:text-zinc-100 font-semibold"
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

            {/* Scope (Shared vs Local) */}
            <div className="flex items-center justify-between py-2 border-y border-zinc-100 dark:border-zinc-800">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-850 dark:text-zinc-200">Global Shared Field</span>
                <span className="text-[10px] text-zinc-400">Updates every calculator if edited</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={newFieldShared}
                  onChange={(e) => setNewFieldShared(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-zinc-200 dark:bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsNewFieldOpen(false)}
                className="h-8 px-4 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-xs font-semibold rounded-lg text-zinc-650 dark:text-zinc-450"
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

      {/* Edit Field Modal */}
      {editingFieldId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <form onSubmit={handleSaveEdit} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-sm p-6 shadow-xl text-left select-none space-y-4">
            <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-50">Edit Cost Field</h3>

            {/* Name */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Field Name</label>
              <input
                type="text"
                value={editFieldName}
                onChange={(e) => setEditFieldName(e.target.value)}
                className="w-full h-8 px-3 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary text-zinc-900 dark:text-zinc-100"
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Category</label>
              <select
                value={editFieldCategory}
                onChange={(e) => setEditFieldCategory(e.target.value as CostCategory)}
                className="w-full h-8 px-2 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary text-zinc-900 dark:text-zinc-100 font-semibold"
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
                  value={editFieldUnit}
                  onChange={(e) => setEditFieldUnit(e.target.value)}
                  className="w-full h-8 px-3 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary text-zinc-900 dark:text-zinc-100"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Rate / Percent</label>
                <input
                  type="number"
                  value={editFieldRate}
                  onChange={(e) => setEditFieldRate(Number(e.target.value))}
                  className="w-full h-8 px-3 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary text-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>

            {/* Scope */}
            <div className="flex items-center justify-between py-2 border-y border-zinc-100 dark:border-zinc-800">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-850 dark:text-zinc-200">Global Shared Field</span>
                <span className="text-[10px] text-zinc-400">Updates every calculator if edited</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={editFieldShared}
                  onChange={(e) => setEditFieldShared(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-zinc-200 dark:bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditingFieldId(null)}
                className="h-8 px-4 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-xs font-semibold rounded-lg text-zinc-650 dark:text-zinc-450"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSavingField}
                className="h-8 px-4 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 min-w-[100px] disabled:opacity-50"
              >
                {isSavingField ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </DashboardLayout>
  );
}
