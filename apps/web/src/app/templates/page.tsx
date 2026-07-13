'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { addCalculator } from '../../store/slices/calculatorSlice';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
  Layers,
  Download,
  Copy,
  Printer,
  Sparkles,
  ShoppingBag,
  ChefHat,
  Hammer
} from 'lucide-react';

export default function TemplatesPage() {
  const dispatch = useDispatch();
  const router = useRouter();

  const templatesList = [
    {
      id: 'template-printing',
      name: 'Printing Calculator',
      description: 'Preconfigured setup for offset and digital printers. Includes Paper, Ink, Plate, Labour, and Taxes.',
      industry: 'Printing',
      icon: Printer,
      blocks: [
        { id: 'tb-1', type: 'field', fieldId: 'field-paper-cost', operatorBefore: '+' },
        { id: 'tb-2', type: 'field', fieldId: 'field-ink-cost', operatorBefore: '+' },
        { id: 'tb-3', type: 'field', fieldId: 'field-printing-cost', operatorBefore: '+' }
      ]
    },
    {
      id: 'template-granite',
      name: 'Granite Calculator',
      description: 'Calculates slab length/width in square feet, edge polishing, profile design, and transport wastage.',
      industry: 'Granite & Marble',
      icon: Layers,
      blocks: []
    },
    {
      id: 'template-bakery',
      name: 'Bakery Costing',
      description: 'Formulated for commercial bakers. Tracks flour, butter, sugar raw material weights, and chef baking hours.',
      industry: 'Food & Beverage',
      icon: ChefHat,
      blocks: []
    },
    {
      id: 'template-fabrication',
      name: 'Steel Fabrication',
      description: 'Tracks metal pipe sections, MIG/TIG welding consumable gas cylinders, grind wheels, and labour.',
      industry: 'Fabrication',
      icon: Hammer,
      blocks: []
    }
  ];

  const handleInstallTemplate = (template: typeof templatesList[0]) => {
    dispatch(addCalculator({
      name: `${template.name} (Custom)`,
      industry: template.industry,
      description: template.description,
      blocks: template.blocks as any,
      profiles: [],
      history: [],
      isActive: true,
      settings: {
        defaultCurrency: '₹',
        requireAllFields: false,
        allowCustomMargins: true
      },
      createdBy: 'Amit Kumar',
      updatedBy: 'Amit Kumar'
    }));

    router.push('/cost-calculators');
  };

  return (
    <DashboardLayout title="Templates">
      <div className="space-y-6 text-left select-none">
        {/* Header Hero */}
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 md:p-6 shadow-sm">
          <h1 className="text-xs font-bold text-zinc-900 dark:text-zinc-50">Pre-built Calculator Templates</h1>
          <p className="text-[10px] text-zinc-400 mt-1 font-medium">Get started instantly with templates compiled by domain experts for your industry.</p>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {templatesList.map(template => (
            <div key={template.id} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 text-primary rounded-lg">
                    <template.icon className="h-5 w-5" />
                  </div>
                  <div className="leading-none text-left">
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-50">{template.name}</span>
                    <span className="block text-[10px] text-zinc-400 mt-1 font-semibold">{template.industry}</span>
                  </div>
                </div>
                <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">{template.description}</p>
              </div>

              <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-850 flex gap-2 shrink-0">
                <button
                  onClick={() => handleInstallTemplate(template)}
                  className="flex-1 h-8 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" /> Install Template
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
