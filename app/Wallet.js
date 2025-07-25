// app/Wallet.js
"use client";
import { useState, useEffect, useMemo, useRef } from 'react';
import { getTransactions, addTransactionAndUpdateBalance, updateTransactionAndUpdateBalance, deleteTransactionAndUpdateBalance } from './lib/firebase';
import TransactionModal from './components/TransactionModal';

// --- ICONS (Imported from lucide-react) ---
import {
    ArrowLeft,
    Settings,
    UserPlus,
    FilePenLine,
    Trash2,
    MoreVertical,
    FileDown,
    Plus,
    Minus,
    ArrowUpCircle,
    ArrowDownCircle,
    Landmark,
    TrendingUp,
    TrendingDown,
    Scale
} from 'lucide-react';

// --- SUB-COMPONENTS ---

const TransactionRow = ({ transaction, onEdit, onDelete }) => {
    const [showActions, setShowActions] = useState(false);
    const actionsMenuRef = useRef(null);

    const isCashIn = transaction.type === 'cash-in';
    const amountColor = isCashIn ? 'text-green-500' : 'text-red-500';
    const mobileAmountColor = isCashIn ? 'text-green-400' : 'text-red-400';

    const formattedDateTime = transaction.timestamp?.toDate().toLocaleString();
    const formattedTime = transaction.timestamp?.toDate().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target)) {
                if (!event.target.closest('.action-toggle-button')) {
                    setShowActions(false);
                }
            }
        };

        if (showActions) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showActions]);


    return (
        <div className="bg-gray-800 lg:bg-white border-b border-gray-700 lg:border-gray-200 hover:bg-gray-700 lg:hover:bg-gray-50">
            {/* --- Mobile Card Layout --- */}
            <div className="p-4 lg:hidden relative">
                <div className="flex justify-between items-start">
                    <div className="flex-grow pr-4">
                        <span className="bg-gray-700 text-blue-300 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">
                            {isCashIn ? 'CASH IN' : 'CASH OUT'}
                        </span>
                        <p className="font-semibold text-white mt-2 truncate">{transaction.details}</p>
                        <p className="text-sm text-gray-400">Entry by You at {formattedTime}</p>
                    </div>

                    <div className="flex-shrink-0 flex items-start gap-1">
                        <div className="text-right">
                             <p className={`text-lg font-bold ${mobileAmountColor}`}>
                                {transaction.amount.toFixed(0)}
                            </p>
                        </div>
                        <button
                            onClick={() => setShowActions(prev => !prev)}
                            className="text-gray-400 hover:text-white p-1 rounded-full action-toggle-button"
                        >
                            <MoreVertical className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* --- Action Menu (conditionally rendered) --- */}
                {showActions && (
                    <div ref={actionsMenuRef} className="absolute top-12 right-4 z-20 w-36 bg-gray-600 rounded-md shadow-lg border border-gray-500">
                        <button
                            onClick={() => { onEdit(transaction); setShowActions(false); }}
                            className="flex items-center gap-3 w-full text-left px-3 py-2 text-sm text-white hover:bg-gray-500 rounded-t-md"
                        >
                            <FilePenLine className="w-5 h-5" />
                            <span>Edit</span>
                        </button>
                        <button
                            onClick={() => { onDelete(transaction); setShowActions(false); }}
                            className="flex items-center gap-3 w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-gray-500 rounded-b-md"
                        >
                            <Trash2 className="w-5 h-5" />
                            <span>Delete</span>
                        </button>
                    </div>
                )}
            </div>

            {/* --- Desktop Table Row Layout --- */}
            <div className="hidden lg:grid grid-cols-11 gap-4 items-center p-3">
                <div className="col-span-1 flex justify-center"><input type="checkbox" className="form-checkbox h-4 w-4 text-blue-600 rounded" /></div>
                <div className="col-span-3 text-sm text-gray-600">{formattedDateTime}</div>
                <div className="col-span-4 text-sm font-medium text-gray-800">{transaction.details}</div>
                <div className="col-span-1 text-sm text-gray-600">{isCashIn ? 'Cash In' : 'Cash Out'}</div>
                <div className={`col-span-1 text-sm font-semibold ${amountColor} text-right`}>${transaction.amount.toFixed(2)}</div>
                <div className="col-span-1 flex items-center justify-center gap-2">
                    <button onClick={() => onEdit(transaction)} className="text-blue-600 hover:text-blue-800 p-1"><FilePenLine className="w-5 h-5" /></button>
                    <button onClick={() => onDelete(transaction)} className="text-red-600 hover:text-red-800 p-1"><Trash2 className="w-5 h-5" /></button>
                </div>
            </div>
        </div>
    );
};


// --- MAIN WALLET COMPONENT ---

export default function Wallet({ book, onBack }) {
    const [transactions, setTransactions] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [transactionType, setTransactionType] = useState(null);
    const [editingTransaction, setEditingTransaction] = useState(null);

    useEffect(() => {
        if (!book.id) return;
        const unsubscribe = getTransactions(book.id, setTransactions);
        return () => unsubscribe();
    }, [book.id]);
    
    const { totalCashIn, totalCashOut, netBalance, sortedTransactions } = useMemo(() => {
        let cashIn = 0, cashOut = 0;
        
        const sorted = [...transactions].sort((a, b) => b.timestamp?.toMillis() - a.timestamp?.toMillis());
        
        sorted.forEach(tx => {
            if (tx.type === 'cash-in') {
                cashIn += tx.amount;
            } else {
                cashOut += tx.amount;
            }
        });

        return {
            totalCashIn: cashIn,
            totalCashOut: cashOut,
            netBalance: cashIn - cashOut,
            sortedTransactions: sorted
        };
    }, [transactions]);

    const groupedTransactions = useMemo(() => {
      return sortedTransactions.reduce((acc, tx) => {
          const date = tx.timestamp?.toDate().toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
          });
          if (!acc[date]) {
              acc[date] = [];
          }
          acc[date].push(tx);
          return acc;
      }, {});
    }, [sortedTransactions]);


    const handleOpenModalForNew = (type) => {
        setEditingTransaction(null);
        setTransactionType(type);
        setShowModal(true);
    };

    const handleOpenModalForEdit = (transaction) => {
        setEditingTransaction(transaction);
        setTransactionType(transaction.type);
        setShowModal(true);
    }
    
    const handleCloseModal = () => {
        setShowModal(false);
        setEditingTransaction(null);
        setTransactionType(null);
    }

    const handleSaveTransaction = async (data) => {
        if (editingTransaction) {
            await updateTransactionAndUpdateBalance(book.id, editingTransaction.id, editingTransaction, data);
        } else {
            await addTransactionAndUpdateBalance(book.id, { ...data, type: transactionType });
        }
        handleCloseModal();
    };

    const handleDeleteTransaction = async (transaction) => {
        if (window.confirm("Are you sure you want to delete this entry?")) {
            await deleteTransactionAndUpdateBalance(book.id, transaction);
        }
    };

    return (
        <>
            <TransactionModal
                show={showModal}
                onClose={handleCloseModal}
                onSave={handleSaveTransaction}
                type={transactionType}
                initialData={editingTransaction}
            />
            
            <div className="bg-gray-900 lg:bg-gray-100 min-h-screen">
                
                {/* --- Mobile Header --- */}
                <header className="bg-gray-800 p-3 flex items-center justify-between lg:hidden sticky top-0 z-30 border-b border-gray-700">
                    <div className="flex items-center gap-2">
                        <button onClick={onBack} className="text-white p-1"><ArrowLeft size={24} /></button>
                        <h1 className="text-lg font-bold text-white truncate">{book.name}</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="text-white p-1"><UserPlus size={22} /></button>
                        <button className="text-white font-bold text-xs bg-gray-700 px-3 py-2 rounded-md flex items-center gap-1">
                            <FileDown size={14} />
                            <span>PDF</span>
                        </button>
                        <button className="text-white p-1"><Settings size={22} /></button>
                    </div>
                </header>

                {/* --- Desktop Header --- */}
                <div className="p-4 sm:p-6 hidden lg:block">
                    <header className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2 sm:gap-4">
                            <button onClick={onBack} className="text-gray-600 hover:text-gray-900 p-1"><ArrowLeft size={24} /></button>
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 truncate">{book.name}</h1>
                            <button className="text-gray-500 hover:text-gray-800 p-1 hidden sm:block"><Settings size={22} /></button>
                            <button className="text-gray-500 hover:text-gray-800 p-1 hidden sm:block"><UserPlus size={22} /></button>
                        </div>
                    </header>
                </div>
                
                {/* --- Content Area --- */}
                <div className="lg:px-4 sm:px-6">
                    {/* --- Mobile Summary Card --- */}
                    <div className="lg:hidden p-3">
                        <div className="bg-gray-800 rounded-lg p-4 text-white">
                            <p className="text-sm text-gray-400 flex items-center gap-2"><Scale size={16} /> Net Balance</p>
                            <p className="text-3xl font-bold mt-1">${netBalance.toFixed(2)}</p>
                            <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between">
                                <div className='flex-1'>
                                    <p className="text-sm text-gray-400 flex items-center gap-1"><TrendingUp size={14} className="text-green-400"/> Total In</p>
                                    <p className="font-semibold text-green-400 text-lg">${totalCashIn.toFixed(2)}</p>
                                </div>
                                <div className='flex-1'>
                                    <p className="text-sm text-gray-400 flex items-center gap-1"><TrendingDown size={14} className="text-red-400"/> Total Out</p>
                                    <p className="font-semibold text-red-400 text-lg">${totalCashOut.toFixed(2)}</p>
                                </div>
                            </div>
                            <button className="text-blue-400 font-semibold mt-4 text-sm w-full text-left">VIEW REPORTS &gt;</button>
                        </div>
                    </div>

                    {/* --- Desktop Actions & Summary --- */}
                    <div className="hidden lg:block lg:mx-2">
                        <div className="flex justify-end gap-3 mb-6">
                            <button onClick={() => handleOpenModalForNew('cash-in')} className="bg-green-600 text-white font-bold py-2 px-4 rounded-md hover:bg-green-700 flex items-center gap-2"><Plus size={16} /> In</button>
                            <button onClick={() => handleOpenModalForNew('cash-out')} className="bg-red-600 text-white font-bold py-2 px-4 rounded-md hover:bg-red-700 flex items-center gap-2"><Minus size={16} /> Out</button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                            <div className="bg-white p-4 rounded-lg border flex items-center gap-4"><ArrowUpCircle className="text-green-500" size={32} strokeWidth={1.5} /><div><p className="text-sm text-gray-500">Cash In</p><p className="text-xl font-bold text-gray-800">${totalCashIn.toFixed(2)}</p></div></div>
                            <div className="bg-white p-4 rounded-lg border flex items-center gap-4"><ArrowDownCircle className="text-red-500" size={32} strokeWidth={1.5} /><div><p className="text-sm text-gray-500">Cash Out</p><p className="text-xl font-bold text-gray-800">${totalCashOut.toFixed(2)}</p></div></div>
                            <div className="bg-white p-4 rounded-lg border flex items-center gap-4"><Landmark className="text-blue-500" size={32} strokeWidth={1.5} /><div><p className="text-sm text-gray-500">Net Balance</p><p className="text-xl font-bold text-gray-800">${netBalance.toFixed(2)}</p></div></div>
                        </div>
                    </div>
                </div>

                {/* --- Transaction List --- */}
                <div className="pb-24 lg:pb-0">
                    {/* --- Mobile List --- */}
                    <div className="lg:hidden">
                        <div className="px-3">
                            <div className="text-sm text-gray-400 border-t border-b border-gray-700 py-2">
                                Showing {transactions.length} entries
                            </div>
                        </div>
                        {Object.keys(groupedTransactions).length > 0 ? (
                            Object.entries(groupedTransactions).map(([date, txs]) => (
                                <div key={date}>
                                    <h3 className="bg-gray-900 text-gray-400 font-semibold text-sm px-4 py-2">{date}</h3>
                                    {txs.map((tx) => (
                                        <TransactionRow key={tx.id} transaction={tx} onEdit={handleOpenModalForEdit} onDelete={handleDeleteTransaction} />
                                    ))}
                                </div>
                            ))
                        ) : (
                            <p className="p-4 text-center text-gray-500">No transactions yet.</p>
                        )}
                    </div>

                    {/* --- Desktop List --- */}
                    <div className="hidden lg:block bg-white rounded-t-lg lg:rounded-lg border-t lg:border lg:shadow-sm lg:mx-6">
                         <div className="flex items-center justify-between p-3 text-sm text-gray-600 border-b"><p>Showing {transactions.length} entries</p></div>
                         <div className="hidden lg:grid grid-cols-11 gap-4 bg-gray-50 p-3 font-semibold text-xs text-gray-500 uppercase border-b">
                             <div className="col-span-1 flex justify-center"><input type="checkbox" className="form-checkbox h-4 w-4 rounded"/></div>
                             <div className="col-span-3">Date & Time</div>
                             <div className="col-span-4">Details</div>
                             <div className="col-span-1">Category</div>
                             <div className="col-span-1 text-right">Amount</div>
                             <div className="col-span-1 text-center">Actions</div>
                         </div>
                         <div>
                              {sortedTransactions.length > 0 ? (
                                  sortedTransactions.map((tx) => (
                                      <TransactionRow key={tx.id} transaction={tx} onEdit={handleOpenModalForEdit} onDelete={handleDeleteTransaction} />
                                  ))
                              ) : (
                                  <p className="p-4 text-center text-gray-500">No transactions yet.</p>
                              )}
                         </div>
                    </div>
                </div>

                {/* --- Mobile Floating Action Buttons --- */}
                <div className="fixed bottom-0 left-0 right-0 p-3 bg-gray-900/80 backdrop-blur-sm border-t border-gray-700 flex gap-3 lg:hidden z-20">
                    <button onClick={() => handleOpenModalForNew('cash-in')} className="w-full bg-green-600 text-white font-bold py-3 rounded-md hover:bg-green-700 flex items-center justify-center gap-2">
                        <Plus size={20} /> CASH IN
                    </button>
                    <button onClick={() => handleOpenModalForNew('cash-out')} className="w-full bg-red-600 text-white font-bold py-3 rounded-md hover:bg-red-700 flex items-center justify-center gap-2">
                        <Minus size={20} /> CASH OUT
                    </button>
                </div>
            </div>
        </>
    );
}