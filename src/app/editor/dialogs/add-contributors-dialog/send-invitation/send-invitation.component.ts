import { AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { contributorData } from '../add-contributors-dialog.component';

@Component({
  selector: 'app-send-invitation',
  templateUrl: './send-invitation.component.html',
  styleUrls: ['./send-invitation.component.scss']
})
export class SendInvitationComponent implements AfterViewInit {

  public searchData: contributorData[] = [
    {
      avatar: 'avatar',
      name: 'Hrissy V.',
      email:'hrissyv@gmail.com',
    },
    {
      avatar: 'avatar',
      name: 'Hristo Iliev',
      email:'iceto@gmail.com',
    },
    {
      avatar: 'avatar',
      name: 'Milen Milkov',
      email:'milcho@gmail.com',
    },
    {
      avatar: 'avatar',
      name: 'Ivan Bonev',
      email:'ivbon@gmail.com',
    },
    {
      avatar: 'avatar',
      name: 'Iren Hristova',
      email:'iren@gmail.com',
    },
    {
      avatar: 'avatar',
      name: 'Ralitsa Jivkova',
      email:'ral@gmail.com',
    },
    {
      avatar: 'avatar',
      name: 'Iliq Dimov',
      email:'iliq@gmail.com',
    },
    {
      avatar: 'avatar',
      name: 'Petar Petrov',
      email:'petko@gmail.com',
    },
    {
      avatar: 'avatar',
      name: 'Vladimir Tanev',
      email:'vladicha@gmail.com',
    },
    {
      avatar: 'avatar',
      name: 'Nekoi Nekoisi',
      email:'nekoi@gmail.com',
    },
  ];

  constructor(
    public dialogRef: MatDialogRef<SendInvitationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngAfterViewInit(): void {
    console.log(this.data);
  }

}
