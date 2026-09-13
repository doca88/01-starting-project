export interface Task {
    id: string;
    userId: string;
    text: string;
    summary: string;
    dueDate: string;
}

export interface User {
  id: string;
  avatar: string;
  name: string;
};

export interface SubmissionType {
    enteredTitle : string;
    enteredSummary : string;
    enteredDate : string;
}