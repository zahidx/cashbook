import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  Timestamp,
  runTransaction,
  deleteDoc,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const getBooks = async () => {
  const querySnapshot = await getDocs(collection(db, "books"));
  const books = [];
  querySnapshot.forEach((doc) => {
    books.push({ id: doc.id, ...doc.data() });
  });
  return books;
};

export const addBook = async (bookName) => {
  try {
    await addDoc(collection(db, "books"), {
      name: bookName,
      updated: new Date().toLocaleString(),
      balance: 0,
    });
  } catch (e) {
    console.error("Error adding book: ", e);
  }
};

export const deleteBook = async (bookId) => {
  try {
    const bookRef = doc(db, "books", bookId);
    await deleteDoc(bookRef);
  } catch (e) {
    console.error("Error deleting book: ", e);
  }
};

export const updateBookName = async (bookId, newName) => {
  try {
    const bookRef = doc(db, "books", bookId);
    await updateDoc(bookRef, {
      name: newName,
      updated: new Date().toLocaleString(),
    });
  } catch (e) {
    console.error("Error updating book name: ", e);
  }
};

export const addTransactionAndUpdateBalance = async (bookId, transactionData) => {
  const bookRef = doc(db, "books", bookId);
  const transactionsColRef = collection(bookRef, "transactions");

  try {
    await runTransaction(db, async (transaction) => {
      const bookDoc = await transaction.get(bookRef);
      if (!bookDoc.exists()) throw "Book does not exist!";
      const currentBalance = bookDoc.data().balance || 0;
      const amount = transactionData.amount;
      const newBalance =
        transactionData.type === "cash-in"
          ? currentBalance + amount
          : currentBalance - amount;

      transaction.update(bookRef, {
        balance: newBalance,
        updated: new Date().toLocaleString(),
      });
      transaction.set(doc(transactionsColRef), {
        ...transactionData,
        timestamp: Timestamp.fromDate(new Date()),
      });
    });
  } catch (e) {
    console.error("Transaction failed: ", e);
  }
};

export const getTransactions = (bookId, callback) => {
  const transactionsColRef = collection(db, "books", bookId, "transactions");
  const q = query(transactionsColRef, orderBy("timestamp", "desc"));

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const transactions = [];
    querySnapshot.forEach((doc) => {
      transactions.push({ id: doc.id, ...doc.data() });
    });
    callback(transactions);
  });

  return unsubscribe;
};

export const deleteTransactionAndUpdateBalance = async (bookId, transactionToDelete) => {
  const bookRef = doc(db, "books", bookId);
  const txRef = doc(db, "books", bookId, "transactions", transactionToDelete.id);

  try {
    await runTransaction(db, async (transaction) => {
      const bookDoc = await transaction.get(bookRef);
      if (!bookDoc.exists()) throw "Book does not exist!";

      const currentBalance = bookDoc.data().balance;
      const txAmount = transactionToDelete.amount;
      const txType = transactionToDelete.type;
      const newBalance =
        txType === "cash-in"
          ? currentBalance - txAmount
          : currentBalance + txAmount;

      transaction.update(bookRef, {
        balance: newBalance,
        updated: new Date().toLocaleString(),
      });
      transaction.delete(txRef);
    });
  } catch (e) {
    console.error("Delete transaction failed:", e);
  }
};

export const updateTransactionAndUpdateBalance = async (
  bookId,
  txId,
  oldTxData,
  newTxData
) => {
  const bookRef = doc(db, "books", bookId);
  const txRef = doc(db, "books", bookId, "transactions", txId);

  try {
    await runTransaction(db, async (transaction) => {
      const bookDoc = await transaction.get(bookRef);
      if (!bookDoc.exists()) throw "Book does not exist!";

      const currentBalance = bookDoc.data().balance;
      const oldEffect = oldTxData.type === "cash-in" ? oldTxData.amount : -oldTxData.amount;
      const newEffect = oldTxData.type === "cash-in" ? newTxData.amount : -newTxData.amount;
      const balanceDifference = newEffect - oldEffect;
      const newBalance = currentBalance + balanceDifference;

      transaction.update(bookRef, {
        balance: newBalance,
        updated: new Date().toLocaleString(),
      });
      transaction.update(txRef, {
        amount: newTxData.amount,
        details: newTxData.details,
      });
    });
  } catch (e) {
    console.error("Update transaction failed:", e);
  }
};
