export interface Task {
    id: string;
    userId: string;
    text: string;
    summary: string;
    dueDate: Date;
}

export interface User {
  id: string;
  avatar: string;
  name: string;
};