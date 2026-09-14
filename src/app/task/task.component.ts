import {Component, input, output} from '@angular/core'
import { Task } from "../common/utilities";
import { CardComponent } from '../shared/card/card.component';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-task',
  standalone: true,
  templateUrl: './task.component.html',
  styleUrl: './task.component.css',
  imports: [CardComponent, DatePipe]
})

export class TaskComponent {

       task = input.required<Task>();  
       completed = output<string>();

       onComplete(){
        this.completed.emit(this.task().id);  
        }
       
      }