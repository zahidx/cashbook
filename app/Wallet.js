// app/Wallet.js
"use client";
import React, { useState, useEffect, useMemo, useRef } from 'react';
// Corrected the import path using a standard Next.js alias
import { getTransactions, addTransactionAndUpdateBalance, updateTransactionAndUpdateBalance, deleteTransactionAndUpdateBalance } from './lib/firebase';

// --- ICONS ---
const BackArrowIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.438.995s.145.755.438.995l1.003.827c.48.398.668 1.03.26 1.431l-1.296 2.247a1.125 1.125 0 01-1.37.49l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.332.183-.582.495-.645.87l-.213 1.28c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.063-.374-.313-.686-.645-.87a6.52 6.52 0 01-.22-.127c-.324-.196-.72-.257-1.075-.124l-1.217.456a1.125 1.125 0 01-1.37-.49l-1.296-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.437-.995s-.145-.755-.437-.995l-1.004-.827a1.125 1.125 0 01-.26-1.431l1.296-2.247a1.125 1.125 0 011.37.49l1.217.456c.355.133.75.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.645.87l.213-1.28z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const UserPlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" /></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>;
const DeleteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.067-2.09.92-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>;
const MoreVertIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" /></svg>;

// --- SUB-COMPONENTS ---

const TransactionRow = ({ transaction, onEdit, onDelete }) => {
    const [showActions, setShowActions] = useState(false);
    const actionsMenuRef = useRef(null);

    const isCashIn = transaction.type === 'cash-in';
    const amountColor = isCashIn ? 'text-green-500' : 'text-red-500';
    const mobileAmountColor = isCashIn ? 'text-green-400' : 'text-red-400';

    const formattedDateTime = transaction.timestamp?.toDate().toLocaleString();
    const formattedTime = transaction.timestamp?.toDate().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    // Effect to close the action menu if clicked outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target)) {
                // Check to ensure the click is not on the toggle button itself
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
            {/* --- Mobile Card Layout (Updated with Action Menu) --- */}
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
                        {/* Three-dot menu button */}
                        <button
                            onClick={() => setShowActions(prev => !prev)}
                            className="text-gray-400 hover:text-white p-1 rounded-full action-toggle-button"
                        >
                            <MoreVertIcon />
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
                            <EditIcon />
                            <span>Edit</span>
                        </button>
                        <button
                            onClick={() => { onDelete(transaction); setShowActions(false); }}
                            className="flex items-center gap-3 w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-gray-500 rounded-b-md"
                        >
                            <DeleteIcon />
                            <span>Delete</span>
                        </button>
                    </div>
                )}
            </div>

            {/* --- Desktop Table Row Layout (Updated) --- */}
            <div className="hidden lg:grid grid-cols-11 gap-4 items-center p-3">
                <div className="col-span-1 flex justify-center"><input type="checkbox" className="form-checkbox h-4 w-4 text-blue-600 rounded" /></div>
                <div className="col-span-3 text-sm text-gray-600">{formattedDateTime}</div>
                <div className="col-span-4 text-sm font-medium text-gray-800">{transaction.details}</div>
                <div className="col-span-1 text-sm text-gray-600">{isCashIn ? 'Cash In' : 'Cash Out'}</div>
                <div className={`col-span-1 text-sm font-semibold ${amountColor} text-right`}>{transaction.amount.toFixed(2)}</div>
                <div className="col-span-1 flex items-center justify-center gap-2">
                    <button onClick={() => onEdit(transaction)} className="text-blue-600 hover:text-blue-800 p-1"><EditIcon /></button>
                    <button onClick={() => onDelete(transaction)} className="text-red-600 hover:text-red-800 p-1"><DeleteIcon /></button>
                </div>
            </div>
        </div>
    );
};


const TransactionModal = ({ show, onSave, onClose, type, initialData }) => {
    const [amount, setAmount] = useState('');
    const [details, setDetails] = useState('');

    useEffect(() => {
        if (show) {
            setAmount(initialData?.amount || '');
            setDetails(initialData?.details || '');
        }
    }, [show, initialData]);

    if (!show) return null;

    const handleSave = () => {
        const parsedAmount = parseFloat(amount);
        if (!parsedAmount || parsedAmount <= 0 || !details.trim()) {
            alert('Please enter a valid amount and details.');
            return;
        }
        onSave({ amount: parsedAmount, details: details.trim() });
    };

    const modalTitle = initialData ? 'Edit Transaction' : (type === 'cash-in' ? 'Cash In' : 'Cash Out');
    const buttonColor = type === 'cash-in' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700';

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
                <h2 className="text-2xl font-bold mb-4">{modalTitle}</h2>
                <div className="space-y-4">
                    <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" className="w-full p-2 border rounded-md" />
                    <input type="text" value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Purpose / Details" className="w-full p-2 border rounded-md" />
                </div>
                <div className="flex justify-end gap-4 mt-6">
                    <button onClick={onClose} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400">Cancel</button>
                    <button onClick={handleSave} className={`${buttonColor} text-white px-4 py-2 rounded-md`}>Save</button>
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
            {/* The main container applies the background color */}
            <div className="bg-gray-900 lg:bg-gray-100 min-h-screen">
                
                {/* --- Mobile Header --- */}
                <header className="bg-gray-800 p-3 flex items-center justify-between lg:hidden sticky top-0 z-10 border-b border-gray-700">
                    <div className="flex items-center gap-2">
                        <button onClick={onBack} className="text-white"><BackArrowIcon /></button>
                        <h1 className="text-lg font-bold text-white truncate">{book.name}</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="text-white"><UserPlusIcon /></button>
                        <button className="text-white font-bold text-xs bg-gray-700 px-3 py-2 rounded-md">PDF</button>
                        <button className="text-white"><SettingsIcon /></button>
                    </div>
                </header>

                {/* --- Desktop Header --- */}
                <div className="p-4 sm:p-6 hidden lg:block">
                    <header className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2 sm:gap-4">
                            <button onClick={onBack} className="text-gray-600 hover:text-gray-900"><BackArrowIcon /></button>
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 truncate">{book.name}</h1>
                            <button className="text-gray-500 hover:text-gray-800 hidden sm:block"><SettingsIcon /></button>
                            <button className="text-gray-500 hover:text-gray-800 hidden sm:block"><UserPlusIcon /></button>
                        </div>
                    </header>
                </div>
                
                {/* --- Content Area --- */}
                <div className="lg:p-4 sm:p-6">
                    {/* --- Mobile Summary Card --- */}
                    <div className="lg:hidden p-3">
                        <div className="bg-gray-800 rounded-lg p-4 text-white">
                            <p className="text-sm text-gray-400">Net Balance</p>
                            <p className="text-3xl font-bold mt-1">${netBalance.toFixed(2)}</p>
                            <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between">
                                <div className='flex-1'>
                                    <p className="text-sm text-gray-400">Total In (+)</p>
                                    <p className="font-semibold text-green-400 text-lg">${totalCashIn.toFixed(2)}</p>
                                </div>
                                <div className='flex-1'>
                                    <p className="text-sm text-gray-400">Total Out (-)</p>
                                    <p className="font-semibold text-red-400 text-lg">${totalCashOut.toFixed(2)}</p>
                                </div>
                            </div>
                            <button className="text-blue-400 font-semibold mt-4 text-sm w-full text-left">VIEW REPORTS &gt;</button>
                        </div>
                    </div>

                    {/* --- Desktop Actions & Summary --- */}
                    <div className="hidden lg:block">
                        <div className="flex justify-end gap-2 mb-6">
                            <button onClick={() => handleOpenModalForNew('cash-in')} className="bg-green-600 text-white font-bold py-2 px-4 rounded-md hover:bg-green-700 w-auto">+ In</button>
                            <button onClick={() => handleOpenModalForNew('cash-out')} className="bg-red-600 text-white font-bold py-2 px-4 rounded-md hover:bg-red-700 w-auto">- Out</button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                            <div className="bg-white p-4 rounded-lg border flex items-center gap-4"><div className="text-green-500 p-2 bg-green-100 rounded-full text-lg font-bold">+</div><div><p className="text-sm text-gray-500">Cash In</p><p className="text-xl font-bold text-gray-800">${totalCashIn.toFixed(2)}</p></div></div>
                            <div className="bg-white p-4 rounded-lg border flex items-center gap-4"><div className="text-red-500 p-2 bg-red-100 rounded-full text-lg font-bold">-</div><div><p className="text-sm text-gray-500">Cash Out</p><p className="text-xl font-bold text-gray-800">${totalCashOut.toFixed(2)}</p></div></div>
                            <div className="bg-white p-4 rounded-lg border flex items-center gap-4 sm:col-span-3"><div className="text-blue-500 p-2 bg-blue-100 rounded-full text-lg">📊</div><div><p className="text-sm text-gray-500">Net Balance</p><p className="text-xl font-bold text-gray-800">${netBalance.toFixed(2)}</p></div></div>
                        </div>
                    </div>
                </div>

                {/* --- Transaction List --- */}
                <div className="pb-24 lg:pb-0"> {/* Padding bottom for mobile to avoid overlap with FAB */}
                    {/* --- Mobile List (New, Grouped by Date) --- */}
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

                    {/* --- Desktop List (Original) --- */}
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

                {/* --- Mobile Floating Action Buttons (New) --- */}
                <div className="fixed bottom-0 left-0 right-0 p-3 bg-gray-900/80 backdrop-blur-sm border-t border-gray-700 flex gap-3 lg:hidden z-10">
                    <button onClick={() => handleOpenModalForNew('cash-in')} className="w-full bg-green-600 text-white font-bold py-3 rounded-md hover:bg-green-700 flex items-center justify-center gap-2">
                        + CASH IN
                    </button>
                    <button onClick={() => handleOpenModalForNew('cash-out')} className="w-full bg-red-600 text-white font-bold py-3 rounded-md hover:bg-red-700 flex items-center justify-center gap-2">
                        - CASH OUT
                    </button>
                </div>
            </div>
        </>
    );
}