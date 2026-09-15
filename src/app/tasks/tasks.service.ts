import { Injectable } from "@angular/core";
import { type Task, SubmissionType } from "../common/utilities";
import { Component, input, computed, signal } from '@angular/core'

@Injectable(
    {
        providedIn: 'root'
    }
)


export class TaskService {

    constructor() {

        let localTasks = localStorage.getItem('tasks');
        if (localTasks && localTasks !== 'undefined') {
            let localTasksParsed = JSON.parse(localTasks)
            this.tasks.update(x => localTasksParsed);
        }
    }

    private newTask1: Task = {
        id: 't1',
        userId: 'u1',
        text: 'Master Angular',
        summary: 'Learn Angular from scratch and build amazing web applications.',
        dueDate: new Date('2024-01-25').toString(),
    }
    private newTask2: Task = {
        id: 't2',
        userId: 'u3',
        text: 'Master Angular 2',
        summary: 'Learn Angular from scratch and build amazing web applications 2.',
        dueDate: new Date('2024-02-3').toString(),
    }
    private newTask3: Task = {
        id: 't3',
        userId: 'u3',
        text: 'Master Angular 3',
        summary: 'Learn Angular from scratch and build amazing web applications 3.',
        dueDate: new Date('2024-03-30').toString(),
    }
    private newTask4: Task = {
        id: 't4',
        userId: 'u4',
        text: 'Master Angular 4',
        summary: 'Learn Angular from scratch and build amazing web applications 4.',
        dueDate: new Date('2024-03-30').toString(),
    }
    private newTask5: Task = {
        id: 't5',
        userId: 'u5',
        text: 'Master Angular 5',
        summary: 'Learn Angular from scratch and build amazing web applications 5.',
        dueDate: new Date('2024-03-30').toString(),
    }

    private tmpTasks = [this.newTask1, this.newTask2, this.newTask3, this.newTask4, this.newTask5];

    tasks = signal<Task[]>(this.tmpTasks);
    getUserTasks(userId: string) {
        return this.tasks().filter(x => x.userId == userId);
    }

    addTask(submissionType: SubmissionType, userId: string) {
        const newTask: Task = {
            id: new Date().getTime().toString(),
            userId: userId,
            text: submissionType.enteredTitle,
            summary: submissionType.enteredSummary,
            dueDate: submissionType.enteredDate
        };

        this.tasks.update(currentTasks => [newTask, ...currentTasks]);
        this.saveTasksToLocalStorage()
    }

    removeTask(id: string) {
        this.tasks.update(tasks => tasks.filter(x => x.id !== id));
        this.saveTasksToLocalStorage();
    }

    private saveTasksToLocalStorage() {

        localStorage.setItem('tasks', JSON.stringify(this.tasks()));
    }
}