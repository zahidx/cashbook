// app/components/TransactionModal.js
"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CircleDollarSign, BookText } from 'lucide-react'; // <-- Import icons from Lucide

const TransactionModal = ({ show, onSave, onClose, type, initialData }) => {
    const [amount, setAmount] = useState('');
    const [details, setDetails] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (show) {
            setAmount(initialData?.amount || '');
            setDetails(initialData?.details || '');
            setError('');
        }
    }, [show, initialData]);

    useEffect(() => {
        if (error) setError('');
    }, [amount, details]);

    const handleSave = () => {
        const parsedAmount = parseFloat(amount);
        if (!parsedAmount || parsedAmount <= 0 || !details.trim()) {
            setError('Please enter a valid amount and details.');
            return;
        }
        onSave({ amount: parsedAmount, details: details.trim() });
    };

    const modalTitle = initialData ? 'Edit Transaction' : (type === 'cash-in' ? 'Cash In' : 'Cash Out');
    
    const saveButtonColor = type === 'cash-in'
      ? 'bg-emerald-500 hover:bg-emerald-600 focus:ring-emerald-300'
      : 'bg-rose-500 hover:bg-rose-600 focus:ring-rose-300';
    
    return (
        <AnimatePresence>
            {show && (
                <div className="fixed inset-0 bg-black/60 flex justify-center items-end sm:items-center z-50">
                    {/* --- Backdrop --- */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0"
                        onClick={onClose}
                    />

                    {/* --- Modal Content --- */}
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", stiffness: 400, damping: 40 }}
                        className="relative w-full max-w-md bg-gray-800 rounded-t-2xl sm:rounded-2xl"
                    >
                        {/* --- Header with a grab handle for mobile feel --- */}
                        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                            <div className="w-8"></div> {/* Spacer */}
                            <h2 className="text-lg font-semibold text-white text-center">{modalTitle}</h2>
                            <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-700">
                                <X size={22} />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            {/* --- Form Inputs --- */}
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
                                    <CircleDollarSign size={20} />
                                </div>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="Amount"
                                    className="w-full pl-12 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-emerald-500 text-lg"
                                />
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
                                    <BookText size={20} />
                                </div>
                                <input
                                    type="text"
                                    value={details}
                                    onChange={(e) => setDetails(e.target.value)}
                                    placeholder="Purpose / Details"
                                    className="w-full pl-12 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-emerald-500 text-lg"
                                />
                            </div>
                            
                            {/* --- Error Message --- */}
                            {error && (
                                <p className="text-rose-400 text-sm text-center -my-2">{error}</p>
                            )}
                            
                            {/* --- Action Button --- */}
                            <button
                                onClick={handleSave}
                                className={`w-full py-4 rounded-lg font-bold text-white text-lg transition-colors focus:outline-none focus:ring-2 ${saveButtonColor}`}
                            >
                                Save Transaction
                            </button>
                        </div>
                         {/* --- Padding for iPhone home bar --- */}
                        <div className="pb-[env(safe-area-inset-bottom)]"></div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default TransactionModal;