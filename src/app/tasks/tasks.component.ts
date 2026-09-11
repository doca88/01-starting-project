import {Component, input, computed, signal} from '@angular/core'
import { TaskComponent } from "../task/task.component";
import { NewTaskComponent } from "./new-task/new-task.component";
import { type Task } from "../common/utilities";
import {DUMMY_USERS} from '../dummy-users';


@Component({
  selector: 'app-tasks',
  standalone: true,
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.css',
  imports: [TaskComponent, NewTaskComponent]
})

export class TasksComponent {

    isAddingTask = signal<boolean>(false)
    name = input<string>();

    newTask1: Task = {
            id: 't1',
            userId: 'u1',
            text: 'Master Angular',
            summary: 'Learn Angular from scratch and build amazing web applications.',
            dueDate: new Date('2024-01-25'),
    }
    newTask2: Task = {
            id: 't2',
            userId: 'u3',
            text: 'Master Angular 2',
            summary: 'Learn Angular from scratch and build amazing web applications 2.',
            dueDate: new Date('2024-02-3'),
        }
    newTask3: Task = {
            id: 't3',
            userId: 'u3',
            text: 'Master Angular 3',
            summary: 'Learn Angular from scratch and build amazing web applications 3.',
            dueDate: new Date('2024-03-30'),
        }
    newTask4: Task = {
            id: 't4',
            userId: 'u4',
            text: 'Master Angular 4',
            summary: 'Learn Angular from scratch and build amazing web applications 4.',
            dueDate: new Date('2024-03-30'),
        }
    newTask5: Task = {
            id: 't5',
            userId: 'u5',
            text: 'Master Angular 5',
            summary: 'Learn Angular from scratch and build amazing web applications 5.',
            dueDate: new Date('2024-03-30'),
        }
    // mora da bude signal, da bi se promena pratila u computed metodi, jer computed prati samo signale, a ne obicne promenljive
    tasks = signal<Task[]>([this.newTask1, this.newTask2, this.newTask3, this.newTask4, this.newTask5]);

    // ne moze dva puta da se definise, compute radi i definiciju i inicijalizaciju, vraca signal i cim se pozove sa () iz html, compute se okida!
    //selectedTasks = signal<Task[]>([]);
    selectedTasks = computed(() => 
        {
            const userId = DUMMY_USERS.find(x => x.name === this.name())?.id || '';
            return this.findATask(userId);
        });

        findATask(id: string) : Task[]
        {
            return this.tasks().filter(x => x.userId === id);
        }

        onCompleteTask(taskId: string) {
            this.tasks.set(this.tasks().filter(x => x.id !== taskId));
        }
    addTask() {  
        this.isAddingTask.set(true);
    }
    cancelTask() {  
        this.isAddingTask.set(false);
    }
}