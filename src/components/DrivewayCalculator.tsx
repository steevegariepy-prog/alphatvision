
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calculator, X, DollarSign, Plus, ArrowRight, Trash2 } from 'lucide-react';

interface DrivewayCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'fr' | 'en';
}

interface AreaRow {
  length: string;
  width: string;
  area: number;
  rate: string;
  totalPrice: number;
}

interface LineRow {
  length: string;
  rate: string;
  totalPrice: number;
}

export const DrivewayCalculator: React.FC<DrivewayCalculatorProps> = ({ isOpen, onClose, lang }) => {
  // 3 area rows
  const [areaRows, setAreaRows] = useState<AreaRow[]>([
    { length: '6', width: '2', area: 12, rate: '0.50', totalPrice: 6.00 }, // Row 1 (user's example: 6 x 2 = 12, 12 x 0.50$ = 6$)
    { length: '4', width: '5', area: 20, rate: '0.50', totalPrice: 10.00 }, // Row 2 (4 x 5 = 20, 20 x 0.50$ = 10$)
    { length: '7', width: '4', area: 28, rate: '0.50', totalPrice: 14.00 }, // Row 3 (7 x 4 = 28, 28 x 0.50$ = 14$)
  ]);

  // Row 4: Line calculation
  const [lineRow, setLineRow] = useState<LineRow>({
    length: '20',
    rate: '1.50',
    totalPrice: 30.00
  });

  // Handle cell changes for areas
  const handleAreaChange = (index: number, field: 'length' | 'width' | 'rate', value: string) => {
    const updated = [...areaRows];
    // Allow digits, decimals or empty
    const sanitized = value.replace(/[^0-9.]/g, '');
    
    if (field === 'length') updated[index].length = sanitized;
    if (field === 'width') updated[index].width = sanitized;
    if (field === 'rate') updated[index].rate = sanitized;

    // Perform calculations
    const len = parseFloat(updated[index].length) || 0;
    const wid = parseFloat(updated[index].width) || 0;
    const rateVal = parseFloat(updated[index].rate) || 0;

    updated[index].area = len * wid;
    updated[index].totalPrice = updated[index].area * rateVal;

    setAreaRows(updated);
  };

  // Handle cell changes for line row
  const handleLineChange = (field: 'length' | 'rate', value: string) => {
    const sanitized = value.replace(/[^0-9.]/g, '');
    const updated = { ...lineRow };

    if (field === 'length') updated.length = sanitized;
    if (field === 'rate') updated.rate = sanitized;

    const len = parseFloat(updated.length) || 0;
    const rateVal = parseFloat(updated.rate) || 0;

    updated.totalPrice = len * rateVal;
    setLineRow(updated);
  };

  // Reset calculator
  const resetAll = () => {
    setAreaRows([
      { length: '', width: '', area: 0, rate: '0.50', totalPrice: 0 },
      { length: '', width: '', area: 0, rate: '0.50', totalPrice: 0 },
      { length: '', width: '', area: 0, rate: '0.50', totalPrice: 0 },
    ]);
    setLineRow({ length: '', rate: '1.50', totalPrice: 0 });
  };

  // Totals calculations
  const totalArea = areaRows.reduce((sum, row) => sum + row.area, 0);
  const totalAreaPrice = areaRows.reduce((sum, row) => sum + row.totalPrice, 0);
  const grandTotal = totalAreaPrice + lineRow.totalPrice;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-55 flex items-start justify-center p-4 md:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.95 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-zinc-900 border border-white/10 rounded-[2.5rem] p-6 md:p-8 max-w-4xl w-full shadow-2xl space-y-6 my-8"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-emerald-500/20 p-2.5 rounded-2xl border border-emerald-500/30">
                  <Calculator className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold font-display text-white">
                    {lang === 'fr' ? 'Calculateur d\'asphalte & Prix' : 'Asphalt & Cost Estimator'}
                  </h2>
                  <p className="text-xs text-zinc-400">
                    {lang === 'fr' ? 'Estimez vos superficies et le coût du scellant' : 'Estimate your surface areas and sealer price'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Instruction quick summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-zinc-950/40 p-4 rounded-2xl border border-white/5 text-xs text-zinc-300">
              <div>
                <span className="font-bold text-emerald-400 block mb-1">
                  {lang === 'fr' ? 'Pistes de Superficie (Ranger 1, 2, 3) :' : 'Area Blocks (Rows 1, 2, 3):'}
                </span>
                {lang === 'fr' ? 'Longueur x Largeur = Superficie (pi²). Multiplié par le prix au pi² pour obtenir le coût.' : 'Length x Width = Area (sq ft). Multiplied by the sq ft rate for cost.'}
              </div>
              <div>
                <span className="font-bold text-emerald-400 block mb-1">
                  {lang === 'fr' ? 'Lignes / Jointures & Fissures (Ranger 4) :' : 'Linear Crack Lines (Row 4):'}
                </span>
                {lang === 'fr' ? 'Longueur de ligne (pi linéaire) × prix du scellant linéaire pour sceller les fissures.' : 'Total line length (linear ft) × linear sealer price for cracks.'}
              </div>
            </div>

            {/* Rows 1, 2, 3 - Areas */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold font-display text-zinc-400 tracking-wider uppercase mb-2">
                {lang === 'fr' ? 'Sections d\'Asphalte (Longueur x Largeur × $/pi²)' : 'Driveway Sections (Length x Width × Rate)'}
              </h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-white/5 text-xs text-zinc-500 uppercase font-black uppercase tracking-wider">
                      <th className="py-2 px-1">{lang === 'fr' ? 'Ranger / Zone' : 'Row / Zone'}</th>
                      <th className="py-2 px-3">{lang === 'fr' ? 'Longueur (pi)' : 'Length (ft)'}</th>
                      <th className="py-2 justify-center text-center px-1"></th>
                      <th className="py-2 px-3">{lang === 'fr' ? 'Largeur (pi)' : 'Width (ft)'}</th>
                      <th className="py-2 justify-center text-center px-1"></th>
                      <th className="py-2 px-3">{lang === 'fr' ? 'Superficie (pi²)' : 'Area (sq ft)'}</th>
                      <th className="py-2 justify-center text-center px-1"></th>
                      <th className="py-2 px-3">{lang === 'fr' ? 'Prix / pi² ($)' : 'Rate / sq ft ($)'}</th>
                      <th className="py-2 px-3 text-right">{lang === 'fr' ? 'Sous-total ($)' : 'Subtotal ($)'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {areaRows.map((row, i) => (
                      <tr key={i} className="hover:bg-white/5 transition-all group">
                        {/* Title index */}
                        <td className="py-3 px-1 font-display font-bold text-zinc-300">
                          {lang === 'fr' ? `Section ${i + 1}` : `Section ${i + 1}`}
                        </td>
                        {/* Longueur */}
                        <td className="py-2 px-2">
                          <input
                            type="text"
                            inputMode="decimal"
                            value={row.length}
                            onChange={(e) => handleAreaChange(i, 'length', e.target.value)}
                            className="w-24 bg-zinc-950 border border-white/10 focus:border-emerald-500 rounded-xl px-3 py-2 text-white font-mono text-sm text-center outline-none transition-all placeholder:text-zinc-700"
                            placeholder="6"
                          />
                        </td>
                        <td className="py-2 px-1 text-center text-zinc-500 font-bold">×</td>
                        {/* Largeur */}
                        <td className="py-2 px-2">
                          <input
                            type="text"
                            inputMode="decimal"
                            value={row.width}
                            onChange={(e) => handleAreaChange(i, 'width', e.target.value)}
                            className="w-24 bg-zinc-950 border border-white/10 focus:border-emerald-500 rounded-xl px-3 py-2 text-white font-mono text-sm text-center outline-none transition-all placeholder:text-zinc-700"
                            placeholder="3"
                          />
                        </td>
                        <td className="py-2 px-1 text-center text-zinc-500 font-bold">=</td>
                        {/* Superficie output */}
                        <td className="py-2 px-2 font-mono text-sm font-bold text-emerald-400">
                          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2 text-center w-24">
                            {row.area.toFixed(0)} <span className="text-[10px] text-emerald-500">pi²</span>
                          </div>
                        </td>
                        <td className="py-2 px-1 text-center text-zinc-500 font-bold">×</td>
                        {/* Prix / pi² */}
                        <td className="py-2 px-2">
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-xs">$</span>
                            <input
                              type="text"
                              inputMode="decimal"
                              value={row.rate}
                              onChange={(e) => handleAreaChange(i, 'rate', e.target.value)}
                              className="w-24 bg-zinc-950 border border-white/10 focus:border-emerald-500 rounded-xl pl-6 pr-2 py-2 text-white font-mono text-sm outline-none transition-all placeholder:text-zinc-700"
                              placeholder="0.50"
                            />
                          </div>
                        </td>
                        {/* Output price */}
                        <td className="py-2 px-3 text-right font-mono text-sm font-bold text-white">
                          {row.totalPrice.toFixed(2)}$
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Row 4 - Lines/Cracks */}
            <div className="space-y-4 pt-4 border-t border-white/10">
              <h3 className="text-sm font-bold font-display text-zinc-400 tracking-wider uppercase mb-2">
                {lang === 'fr' ? 'Ranger 4 : Fissures & Bordures (Longueur Linéaire × $/pi)' : 'Row 4: Cracks & Borders (Linear Length × Rate)'}
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-white/5 text-xs text-zinc-500 uppercase font-black uppercase tracking-wider">
                      <th className="py-2 px-1">{lang === 'fr' ? 'Type' : 'Type'}</th>
                      <th className="py-2 px-3">{lang === 'fr' ? 'Longueur de Ligne (pi)' : 'Line Length (ft)'}</th>
                      <th className="py-2 justify-center text-center px-1"></th>
                      <th className="py-2 px-3">{lang === 'fr' ? 'Prix au pi Linéaire ($)' : 'Rate / linear ft ($)'}</th>
                      <th className="py-2 justify-center text-center px-1"></th>
                      <th className="py-2 px-3 text-right">{lang === 'fr' ? 'Sous-total ($)' : 'Subtotal ($)'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="hover:bg-white/5 transition-all group">
                      <td className="py-3 px-1 font-display font-bold text-zinc-300">
                        {lang === 'fr' ? 'Ranger 4 (Ligne)' : 'Row 4 (Line)'}
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={lineRow.length}
                          onChange={(e) => handleLineChange('length', e.target.value)}
                          className="w-48 bg-zinc-950 border border-white/10 focus:border-emerald-500 rounded-xl px-3 py-2 text-white font-mono text-sm text-center outline-none transition-all placeholder:text-zinc-700"
                          placeholder="Ex: 20"
                        />
                      </td>
                      <td className="py-2 px-1 text-center text-zinc-500 font-bold">×</td>
                      <td className="py-2 px-2">
                        <div className="relative w-48">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-xs">$</span>
                          <input
                            type="text"
                            inputMode="decimal"
                            value={lineRow.rate}
                            onChange={(e) => handleLineChange('rate', e.target.value)}
                            className="bg-zinc-950 border border-white/10 focus:border-emerald-500 rounded-xl pl-6 pr-2 py-2 text-white font-mono text-sm w-full outline-none transition-all placeholder:text-zinc-700"
                            placeholder="Ex: 1.50"
                          />
                        </div>
                      </td>
                      <td className="py-2 px-1 text-center text-zinc-500 font-bold">=</td>
                      <td className="py-2 px-3 text-right font-mono text-sm font-bold text-white">
                        {lineRow.totalPrice.toFixed(2)}$
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals Section */}
            <div className="bg-zinc-950 p-6 rounded-3xl border border-white/10 grid grid-cols-1 md:grid-cols-3 gap-6 md:divide-x md:divide-white/10">
              <div className="space-y-1">
                <span className="text-xs text-zinc-400 font-semibold tracking-wider uppercase">
                  {lang === 'fr' ? 'Superficie Totale (Ranger 1-3)' : 'Total Surface Area'}
                </span>
                <p className="text-2xl font-black font-mono text-emerald-400">
                  {totalArea.toFixed(0)} <span className="text-sm font-sans font-medium text-zinc-500">pi²</span>
                </p>
              </div>

              <div className="space-y-1 md:pl-6">
                <span className="text-xs text-zinc-400 font-semibold tracking-wider uppercase">
                  {lang === 'fr' ? 'Lignes Fissures (Ranger 4)' : 'Crack Lines length'}
                </span>
                <p className="text-2xl font-black font-mono text-emerald-400">
                  {parseFloat(lineRow.length) || 0} <span className="text-sm font-sans font-medium text-zinc-500">pi</span>
                </p>
              </div>

              <div className="space-y-1 md:pl-6 flex flex-col justify-center">
                <span className="text-xs text-zinc-400 font-black tracking-widest uppercase text-emerald-400">
                  {lang === 'fr' ? 'GRAND TOTAL ESTIMÉ' : 'ESTIMATED GRAND TOTAL'}
                </span>
                <p className="text-3xl font-black font-mono text-white">
                  {grandTotal.toFixed(2)}$
                </p>
              </div>
            </div>

            {/* Footer buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={resetAll}
                className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold rounded-xl text-sm transition-all"
              >
                {lang === 'fr' ? 'Effacer tout' : 'Clear all'}
              </button>
              <button
                onClick={onClose}
                className="px-8 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-950/40"
              >
                {lang === 'fr' ? 'Fermer' : 'Close'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
