import {Component, input, computed, signal, output} from '@angular/core'
import { type Task } from "../../common/utilities";



@Component({
  selector: 'app-new-task',
  standalone: true,
  templateUrl: './new-task.component.html',
  styleUrl: './new-task.component.css',
  imports: []
})
export class NewTaskComponent {

    canceled = output<boolean>();
    cancel()
    {
       this.canceled.emit(true);
    }
}