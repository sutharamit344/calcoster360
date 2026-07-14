'use client';

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { updateQuotationStatus, deleteQuotation, setSelectedQuotationId } from '../../store/slices/quotationSlice';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
  FileText,
  Printer,
  Trash2,
  Mail,
  CheckCircle,
  Clock,
  Ban,
  ChevronRight,
  Send,
  User,
  Calendar
} from 'lucide-react';

export default function QuotationsPage() {
  const dispatch = useDispatch();
  const quotations = useSelector((state: RootState) => state.quotation.quotations);
  const selectedQuoteId = useSelector((state: RootState) => state.quotation.selectedQuotationId);

  // Set first quotation as selected if none is active
  const activeQuoteId = selectedQuoteId || quotations[0]?.id || null;
  const activeQuote = quotations.find(q => q.id === activeQuoteId);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400 border-green-200/50';
      case 'Sent':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200/50';
      case 'Declined':
        return 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 border-red-200/50';
      default:
        return 'bg-zinc-100 text-zinc-650 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200/50';
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <DashboardLayout title="Quotations">
      <div className="flex h-full gap-4 relative overflow-hidden select-none text-left">
        {/* Left List Column */}
        <div className="w-80 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col shrink-0 overflow-y-auto">
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Quotations ({quotations.length})</span>
          </div>

          <div className="flex-1 p-2 space-y-1">
            {quotations.map(q => (
              <button
                key={q.id}
                onClick={() => dispatch(setSelectedQuotationId(q.id))}
                className={`w-full text-left p-3 rounded-xl flex flex-col gap-1.5 transition-colors border ${
                  q.id === activeQuoteId
                    ? 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'
                    : 'border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-900/60'
                }`}
              >
                <div className="flex justify-between items-start w-full">
                  <span className="text-xs font-bold text-zinc-850 dark:text-zinc-200 truncate max-w-[120px]">{q.customerName}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${getStatusColor(q.status)}`}>
                    {q.status}
                  </span>
                </div>
                <div className="flex justify-between items-center w-full">
                  <span className="text-[10px] text-zinc-400 font-medium truncate">{q.calculatorName}</span>
                  <span className="text-xs font-extrabold text-zinc-800 dark:text-zinc-100">
                    ₹{q.totalCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </span>
                </div>
              </button>
            ))}

            {quotations.length === 0 && (
              <div className="text-xs text-zinc-400 py-12 text-center">No quotations generated yet.</div>
            )}
          </div>
        </div>

        {/* Right Preview Column */}
        <div className="flex-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col overflow-hidden">
          {activeQuote ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Toolbar */}
              <div className="h-12 border-b border-zinc-100 dark:border-zinc-800 px-5 flex items-center justify-between shrink-0">
                {/* Status selector */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Status:</span>
                  <select
                    value={activeQuote.status}
                    onChange={(e) => dispatch(updateQuotationStatus({ id: activeQuote.id, status: e.target.value as any }))}
                    className="h-7 px-2 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-[10px] font-bold rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-zinc-850 dark:text-zinc-100"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Sent">Sent</option>
                    <option value="Approved">Approved</option>
                    <option value="Declined">Declined</option>
                  </select>
                </div>

                {/* Quick actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrint}
                    className="h-7 px-2.5 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-lg text-[10px] font-bold text-zinc-650 dark:text-zinc-350 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Printer className="h-3 w-3" /> Print Quote
                  </button>
                  <button
                    onClick={() => dispatch(deleteQuotation(activeQuote.id))}
                    className="h-7 px-2.5 border border-red-200/50 dark:border-red-950/20 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                </div>
              </div>

              {/* Printable Invoice Preview */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-zinc-50/30 dark:bg-zinc-950" id="printable-quote">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-6 md:p-8 shadow-sm space-y-6 max-w-2xl mx-auto">
                  {/* Invoice Header */}
                  <div className="flex justify-between items-start gap-4">
                    <div className="text-left">
                      <span className="text-sm font-black text-zinc-900 dark:text-zinc-50 tracking-tight">CALCOSTER360 INC.</span>
                      <span className="block text-[9px] text-zinc-400 font-semibold mt-0.5">ESTIMATE INVOICE</span>
                    </div>
                    <div className="text-right leading-none">
                      <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
                        Estimate
                      </span>
                      <span className="block text-[10px] text-zinc-400 mt-2 font-medium">#{activeQuote.id.slice(-6).toUpperCase()}</span>
                    </div>
                  </div>

                  {/* Customer context */}
                  <div className="grid grid-cols-2 gap-4 border-t border-b border-zinc-100 dark:border-zinc-800 py-4 text-xs font-semibold">
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-zinc-450 uppercase tracking-wider">Prepared For:</span>
                      <div className="text-zinc-900 dark:text-zinc-50 flex items-center gap-1">
                        <User className="h-3 w-3 text-zinc-400" />
                        {activeQuote.customerName}
                      </div>
                      {activeQuote.customerEmail && (
                        <div className="text-zinc-500 font-medium flex items-center gap-1">
                          <Mail className="h-3 w-3 text-zinc-400" />
                          {activeQuote.customerEmail}
                        </div>
                      )}
                    </div>
                    <div className="space-y-1 text-right">
                      <span className="text-[9px] font-bold text-zinc-450 uppercase tracking-wider block">Valid Until:</span>
                      <div className="text-zinc-900 dark:text-zinc-50 flex items-center justify-end gap-1">
                        <Calendar className="h-3 w-3 text-zinc-400" />
                        {new Date(activeQuote.validUntil).toLocaleDateString()}
                      </div>
                      <span className="text-[9px] text-zinc-450 font-medium block mt-1">
                        Created on {new Date(activeQuote.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Calculations Details */}
                  <div className="space-y-3">
                    <span className="text-[9px] font-bold text-zinc-450 uppercase tracking-wider block">Calculation Specs:</span>
                    <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-850">
                      <div className="grid grid-cols-2 gap-2 text-[10px] text-zinc-600 dark:text-zinc-400 font-medium">
                        {Object.entries(activeQuote.inputs).map(([fid, val]) => (
                          <div key={fid} className="truncate">
                            💡 Field Parameter {fid.replace('field-', '').replace('-', ' ')}: <strong className="text-zinc-800 dark:text-zinc-350">{val}</strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Itemized summary table */}
                  <div className="space-y-2">
                    <span className="text-[9px] font-bold text-zinc-450 uppercase tracking-wider block">Estimate Breakdown:</span>
                    <div className="border border-zinc-200 dark:border-zinc-850 rounded-xl overflow-hidden">
                      <table className="w-full text-xs border-collapse">
                        <thead>
                          <tr className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-850 text-zinc-500 font-bold uppercase text-[9px]">
                            <th className="py-2.5 px-3 text-left">Category</th>
                            <th className="py-2.5 px-3 text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                          {activeQuote.breakdown.map(item => (
                            <tr key={item.category}>
                              <td className="py-2.5 px-3 font-semibold text-zinc-700 dark:text-zinc-300">{item.category} Cost</td>
                              <td className="py-2.5 px-3 text-right font-bold text-zinc-800 dark:text-zinc-200">
                                ₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </td>
                            </tr>
                          ))}
                          <tr className="bg-primary/[0.02] font-bold">
                            <td className="py-3 px-3 text-primary text-xs">Total Estimate</td>
                            <td className="py-3 px-3 text-right text-primary text-xs font-black">
                              ₹{activeQuote.totalCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Footer Terms */}
                  {activeQuote.notes && (
                    <div className="text-[10px] text-zinc-450 bg-zinc-50 dark:bg-zinc-900 p-3 rounded-lg border border-zinc-100 dark:border-zinc-850 text-left font-medium leading-relaxed">
                      <strong>Notes / Terms:</strong> {activeQuote.notes}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-center items-center text-center p-8">
              <FileText className="h-10 w-10 text-zinc-350 mb-2 animate-pulse" />
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">No Quotation Selected</span>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
