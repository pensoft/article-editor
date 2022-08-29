import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { IUserDetail } from '@app/core/interfaces/auth.interface';
import { IContributersData } from '@app/core/interfaces/contributer.interface';
import { AllUsersService } from '@app/core/services/all-users.service';
import { AuthService } from '@app/core/services/auth.service';
import { Console } from 'console';
import { SendInvitationComponent } from './send-invitation/send-invitation.component';

export interface contributorData {
  avatar: string,
  name: string,
  role?: 'Author' | 'Viewer' | 'Commenter',
  email:string,
  userIsAdded?: boolean,
}

@Component({
  selector: 'app-add-contributors-dialog',
  templateUrl: './add-contributors-dialog.component.html',
  styleUrls: ['./add-contributors-dialog.component.scss'],
})
export class AddContributorsDialogComponent implements OnInit {
  ownerSettingsForm: FormGroup;

  searchFormControl = new FormControl('')

  showError = false;
  //public contributersData!: IContributersData[];
  public role: any[] = [];
  public contributersData: contributorData[] = [
    {
      avatar: 'avatar',
      name: 'Hrissy V.',
      email:'hrissyv@gmail.com',
      role: 'Author',
      userIsAdded: false,
    },
    {
      avatar: 'avatar',
      name: 'Nekoi Nekoisi',
      role: 'Viewer',
      email:'nekoi@gmail.com',
      userIsAdded: true,
    },
  ];

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

  searchResults:any[] = []

  userName?: any;
  // public allUsers!: any[];
  public searchText: any;

  constructor(
    private authService: AuthService,
    private allUsersService: AllUsersService,
    private dialogRef: MatDialogRef<AddContributorsDialogComponent>,
    public formBuilder: FormBuilder,
    public dialog: MatDialog
  ) {
    this.ownerSettingsForm = formBuilder.group({
      accessAdding: false,
      disableOptionsPrint: false,
    });
    this.searchFormControl.valueChanges.subscribe((value)=>{
      if(!value||value == ''||value.length == 0){
        this.searchResults = []
      }else{
        this.searchResults = this.searchData.filter((val)=>{
          return val.name.toLocaleLowerCase().includes(value.toLocaleLowerCase());
        })
      }
    })
  }

  search(inputText: HTMLInputElement) {
    let input = inputText.value
  }

  ngOnInit(): void {
    this.authService.getUserInfo().subscribe((response) => {
      const name = response.data.name;
      this.userName = response.data;
      console.log(this.userName);
    });
    this.allUsersService.getAllUsers().subscribe((response: any) => {
      // const name = response.data.name;
      this.contributersData = response.data;

      // this.role = [...this.role];
      console.log('---contributer.role.name', this.contributersData[1].role);
      console.log('---allUsers', this.contributersData);
    });
  }
  closeDialog() {
    this.dialogRef.close();
  }
  submitOwnerSettingsForm() {
    console.log('---submitOwnerSettingsForm');
  }
  addUser(contributersData: any) {
    console.log('---addUser');
    contributersData.userIsAdded = true;
  }
  removeUser(contributersData: any) {
    console.log('---removeUser');
    contributersData.userIsAdded = false;
  }
  sendAllSelectContributers() {

  }
  openAddContrDialog(contributor:any){
    const dialogRef = this.dialog.open(SendInvitationComponent, {
      width: '250px',
      data: {contributor},
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('invitation data',result);
    });
  }
}
