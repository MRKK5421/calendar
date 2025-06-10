import { db } from '../firebase';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { Goal, Task } from '../types/firestore';

// Goals
export const createGoal = async (goal: Omit<Goal, 'id'>) => {
  const docRef = await addDoc(collection(db, 'goals'), goal);
  return { ...goal, id: docRef.id };
};

export const getGoals = async (ownerId: string) => {
  const q = query(collection(db, 'goals'), where('ownerId', '==', ownerId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Goal));
};

export const updateGoal = async (id: string, data: Partial<Goal>) => {
  const goalRef = doc(db, 'goals', id);
  await updateDoc(goalRef, data);
};

export const deleteGoal = async (id: string) => {
  const goalRef = doc(db, 'goals', id);
  await deleteDoc(goalRef);
};

// Tasks
export const createTask = async (task: Omit<Task, 'id'>) => {
  const docRef = await addDoc(collection(db, 'tasks'), task);
  return { ...task, id: docRef.id };
};

export const getTasks = async (goalId: string) => {
  const q = query(collection(db, 'tasks'), where('goalId', '==', goalId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Task));
};

export const updateTask = async (id: string, data: Partial<Task>) => {
  const taskRef = doc(db, 'tasks', id);
  await updateDoc(taskRef, data);
};

export const deleteTask = async (id: string) => {
  const taskRef = doc(db, 'tasks', id);
  await deleteDoc(taskRef);
}; 