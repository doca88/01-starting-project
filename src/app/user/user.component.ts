import { Component, signal, computed, Input, input, Output, EventEmitter, output } from '@angular/core';
//import {DUMMY_USERS} from '../dummy-users';

type User = {
  id: string;
  avatar: string;
  name: string;
};

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css'
})
export class UserComponent {

    path = computed(() => '/assets/' + this.user()?.avatar);
    //@Input({required: true}) avatar!: string; 
    //@Input({required: true}) name!: string;

    // id = input<string>('');
    // avatar = input<string>('');
    // name = input<string>('');
    user = input<User>();
    //path = computed(() => '/assets/' + this.user()?.avatar);
    output = output<string>();  

    selectUserEvent = output<string>();
  //@Output() select = new EventEmitter();
  //randomIndex = Math.floor(Math.random() * DUMMY_USERS.length);
  //selectedUser = signal(DUMMY_USERS[this.randomIndex]);

  //path = computed(() => '/assets/' + this.selectedUser().avatar);

  // get path() {
  //   return '/assets/' + this.selectedUser().avatar;
  // }

  // get path() {
  //   return '/assets/' + this.avatar();
  // }
  onSelectedUser() {
    
  this.selectUserEvent.emit(this.user()?.id || '');
  this.output.emit(this.user()?.name || '');
  
    //console.log('Selected user:', this.selectedUser);
    //const randomIndex1 = Math.floor(Math.random() * DUMMY_USERS.length);
    //this.selectedUser.set(DUMMY_USERS[randomIndex1]);
    //this.selectedUser = DUMMY_USERS[randomIndex1];
  }
}
