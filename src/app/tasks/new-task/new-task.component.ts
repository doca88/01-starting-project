import { Component, input, computed, signal, inject, output } from '@angular/core'
import { type Task, SubmissionType } from "../../common/utilities";
import { FormsModule } from '@angular/forms'
import { TaskService } from '../tasks.service';


@Component({
  selector: 'app-new-task',
  standalone: true,
  templateUrl: './new-task.component.html',
  styleUrl: './new-task.component.css',
  imports: [FormsModule]
})
export class NewTaskComponent {

  closed = output<boolean>();
  enteredTitle = signal<string>("");
  enteredSummary = signal<string>("");
  enteredDate = signal<string>("");
  taskService = inject(TaskService);
  userId = input<string>("");

  close() {
    this.closed.emit(true);
  }

  onSubmitted() {
    this.taskService.addTask(this.CreateSubitionType(), this.userId());
    this.close();
  }

  CreateSubitionType(): SubmissionType {
    return {
      enteredDate: this.enteredDate(),
      enteredTitle: this.enteredTitle(),
      enteredSummary: this.enteredSummary()
    }
  }
}
