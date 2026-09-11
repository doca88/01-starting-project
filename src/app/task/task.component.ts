import {Component, input, output} from '@angular/core'
import { Task } from "../common/utilities";


@Component({
  selector: 'app-task',
  standalone: true,
  templateUrl: './task.component.html',
  styleUrl: './task.component.css'
})

export class TaskComponent {

       task = input.required<Task>();  
       completed = output<string>();

       onComplete(){
        this.completed.emit(this.task().id);  
        }
       
      }