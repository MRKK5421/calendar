import { db } from './firebase';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';

// Tasks
export const addTask = async (userId, task) => {
  try {
    console.log('Adding task to Firestore:', { userId, task });
    
    // Convert dates to Firestore Timestamps
    const taskData = {
      ...task,
      userId,
      start: Timestamp.fromDate(new Date(task.start)),
      end: Timestamp.fromDate(new Date(task.end)),
      createdAt: Timestamp.now(),
    };
    
    console.log('Processed task data:', taskData);
    
    const docRef = await addDoc(collection(db, 'tasks'), taskData);
    console.log('Task added successfully with ID:', docRef.id);
    
    return {
      id: docRef.id,
      ...taskData,
    };
  } catch (error) {
    console.error('Error adding task:', error);
    throw error;
  }
};

export const getTasks = async (userId) => {
  try {
    console.log('Fetching tasks for user:', userId);
    const tasksQuery = query(
      collection(db, 'tasks'),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(tasksQuery);
    const tasks = [];
    
    querySnapshot.forEach((doc) => {
      const task = doc.data();
      tasks.push({
        id: doc.id,
        ...task,
        start: task.start?.toDate(),
        end: task.end?.toDate(),
        createdAt: task.createdAt?.toDate(),
      });
    });
    
    console.log('Fetched tasks:', tasks);
    return tasks;
  } catch (error) {
    console.error('Error getting tasks:', error);
    throw error;
  }
};

export const updateTask = async (userId, taskId, updates) => {
  try {
    console.log('Updating task:', { userId, taskId, updates });
    const taskRef = doc(db, 'tasks', taskId);
    await updateDoc(taskRef, updates);
    console.log('Task updated successfully');
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

export const deleteTask = async (userId, taskId) => {
  try {
    console.log('Deleting task:', { userId, taskId });
    const taskRef = doc(db, 'tasks', taskId);
    await deleteDoc(taskRef);
    console.log('Task deleted successfully');
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};

// Goals
export const addGoal = async (userId, goal) => {
  try {
    console.log('Adding goal to Firestore:', { userId, goal });
    const goalData = {
      ...goal,
      userId,
      deadline: Timestamp.fromDate(new Date(goal.deadline)),
      createdAt: Timestamp.now(),
    };
    
    const docRef = await addDoc(collection(db, 'goals'), goalData);
    console.log('Goal added successfully with ID:', docRef.id);
    
    return {
      id: docRef.id,
      ...goalData,
    };
  } catch (error) {
    console.error('Error adding goal:', error);
    throw error;
  }
};

export const getGoals = async (userId) => {
  try {
    console.log('Fetching goals for user:', userId);
    const goalsQuery = query(
      collection(db, 'goals'),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(goalsQuery);
    const goals = [];
    
    querySnapshot.forEach((doc) => {
      const goal = doc.data();
      goals.push({
        id: doc.id,
        ...goal,
        deadline: goal.deadline?.toDate(),
        createdAt: goal.createdAt?.toDate(),
      });
    });
    
    console.log('Fetched goals:', goals);
    return goals;
  } catch (error) {
    console.error('Error getting goals:', error);
    throw error;
  }
};

export const updateGoal = async (userId, goalId, updates) => {
  try {
    console.log('Updating goal:', { userId, goalId, updates });
    const goalRef = doc(db, 'goals', goalId);
    await updateDoc(goalRef, updates);
    console.log('Goal updated successfully');
  } catch (error) {
    console.error('Error updating goal:', error);
    throw error;
  }
};

export const deleteGoal = async (userId, goalId) => {
  try {
    console.log('Deleting goal:', { userId, goalId });
    const goalRef = doc(db, 'goals', goalId);
    await deleteDoc(goalRef);
    console.log('Goal deleted successfully');
  } catch (error) {
    console.error('Error deleting goal:', error);
    throw error;
  }
}; 