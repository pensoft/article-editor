import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-users-role-is-changed',
  templateUrl: './users-role-is-changed.component.html',
  styleUrls: ['./users-role-is-changed.component.scss']
})
export class UsersRoleIsChangedComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit(): void {
  }

}
