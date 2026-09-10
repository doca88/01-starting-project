import { Component, signal } from '@angular/core';

import { HeaderComponent } from './header/header.component';
import { UserComponent } from "./user/user.component";
import {DUMMY_USERS} from './dummy-users';
import { TasksComponent } from './tasks/tasks.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HeaderComponent, UserComponent, TasksComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {

  selectedUserName = signal<string>('');
  users = DUMMY_USERS;
  onSelectUser(userId: string) 
  {

    this.selectedUserName.set(DUMMY_USERS.find(x => x.id === userId)?.name || '');
  }
}
