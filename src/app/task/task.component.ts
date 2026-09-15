import { Component, input, inject } from '@angular/core'
import { Task } from "../common/utilities";
import { CardComponent } from '../shared/card/card.component';
import { DatePipe } from '@angular/common';
import { TaskService } from '../tasks/tasks.service';

@Component({
  selector: 'app-task',
  standalone: true,
  templateUrl: './task.component.html',
  styleUrl: './task.component.css',
  imports: [CardComponent, DatePipe]
})

export class TaskComponent {

  task = input.required<Task>();
  taskService = inject(TaskService);
  onComplete() {
    this.taskService.removeTask(this.task().id)
  }
}