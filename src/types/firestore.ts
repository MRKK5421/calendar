export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
}

export interface Goal {
  id: string;
  ownerId: string;
  title: string;
  description?: string;
  startDate: string; // ISO date
  endDate: string; // ISO date
  assignees: string[]; // user IDs
  createdAt: string;
}

export interface Task {
  id: string;
  goalId: string;
  date: string; // ISO date
  title: string;
  completed: boolean;
  assigneeId: string;
  createdAt: string;
} 