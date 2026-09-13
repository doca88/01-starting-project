import {Component, input, computed, signal, output} from '@angular/core'
import { type Task, SubmissionType } from "../../common/utilities";
import { FormsModule } from '@angular/forms'

@Component({
  selector: 'app-new-task',
  standalone: true,
  templateUrl: './new-task.component.html',
  styleUrl: './new-task.component.css',
  imports: [FormsModule]
})
export class NewTaskComponent {

    add = output<SubmissionType>();
    canceled = output<boolean>();
    enteredTitle = signal<string>("");
    enteredSummary = signal<string>("");
    enteredDate = signal<string>("");

    cancel()
    {
       this.canceled.emit(true);
    }

    onSubmitted()
    {
       let object = this.CreateSubitionType();
       this.add.emit(object);
    }

    CreateSubitionType() : SubmissionType
    {
        return {
          enteredDate : this.enteredDate(),
          enteredTitle : this.enteredTitle(), 
          enteredSummary : this.enteredSummary()
        }
      }
    }
  