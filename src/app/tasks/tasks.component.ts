import { Component, input, computed, signal, inject } from '@angular/core'
import { TaskComponent } from "../task/task.component";
import { NewTaskComponent } from "./new-task/new-task.component";
import { type Task, SubmissionType } from "../common/utilities";
import { DUMMY_USERS } from '../dummy-users';
import { TaskService } from './tasks.service';

@Component({
    selector: 'app-tasks',
    standalone: true,
    templateUrl: './tasks.component.html',
    styleUrl: './tasks.component.css',
    imports: [TaskComponent, NewTaskComponent]
})

export class TasksComponent {

    taskService = inject(TaskService);
    isAddingTask = signal<boolean>(false)
    name = input<string>();

    //svaka komponenta ce da ima novu instancu, nije dobro, mora DI
    //private taskService = new TaskService();
    //ne moze dva puta da se definise, compute radi i definiciju i inicijalizaciju, vraca signal i cim se pozove sa () iz html, compute se okida!
    //selectedTasks = signal<Task[]>([]);
    selectedTasks = computed(() => {
        // mora da bude signal, da bi se promena pratila u computed metodi, jer computed prati samo signale, a ne obicne promenljive
        //menjamo ime, a ime trigeruje compute na promenu selekcije
        let userId = this.getUserId(this.name()!);
        return this.taskService.getUserTasks(userId);
    });

    getUserId(name: string): string {
        return DUMMY_USERS.find(x => x.name === name)?.id || ''
    }

    addTask() {
        this.isAddingTask.set(true);
    }

    closeTask() {
        this.isAddingTask.set(false);
    }
}