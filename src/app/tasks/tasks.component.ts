import {Component, input, computed, signal} from '@angular/core'
import { TaskComponent } from "../task/task.component";
import { NewTaskComponent } from "./new-task/new-task.component";
import { type Task, SubmissionType } from "../common/utilities";
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
            dueDate: new Date('2024-01-25').toString(),
    }
    newTask2: Task = {
            id: 't2',
            userId: 'u3',
            text: 'Master Angular 2',
            summary: 'Learn Angular from scratch and build amazing web applications 2.',
            dueDate: new Date('2024-02-3').toString(),
        }
    newTask3: Task = {
            id: 't3',
            userId: 'u3',
            text: 'Master Angular 3',
            summary: 'Learn Angular from scratch and build amazing web applications 3.',
            dueDate: new Date('2024-03-30').toString(),
        }
    newTask4: Task = {
            id: 't4',
            userId: 'u4',
            text: 'Master Angular 4',
            summary: 'Learn Angular from scratch and build amazing web applications 4.',
            dueDate: new Date('2024-03-30').toString(),
        }
    newTask5: Task = {
            id: 't5',
            userId: 'u5',
            text: 'Master Angular 5',
            summary: 'Learn Angular from scratch and build amazing web applications 5.',
            dueDate: new Date('2024-03-30').toString(),
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

        getUserId(name: string) : string{

            return DUMMY_USERS.find(x => x.name === this.name())?.id || ''
        }

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

        onAddedTask(submissionType: SubmissionType)
        {
            const newTask: Task = {
                id: new Date().getTime().toString(),
                userId: this.getUserId(this.name()!),
                text: submissionType.enteredTitle,
                summary: submissionType.enteredSummary,
                dueDate: submissionType.enteredDate
            };
            //ovo je fora da se nova intanca niza podmetne sigmalu
            this.tasks.update(currentTasks => [newTask, ...currentTasks]);
            this.isAddingTask.set(false);
        }
}