import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { IUserDetail } from '@app/core/interfaces/auth.interface';
import { IContributersData } from '@app/core/interfaces/contributer.interface';
import { AllUsersService } from '@app/core/services/all-users.service';
import { AuthService } from '@app/core/services/auth.service';
import { Console } from 'console';

@Component({
  selector: 'app-add-contributors-dialog',
  templateUrl: './add-contributors-dialog.component.html',
  styleUrls: ['./add-contributors-dialog.component.scss'],
})
export class AddContributorsDialogComponent implements OnInit {
  ownerSettingsForm: FormGroup;

  showError = false;
  public contributersData!: IContributersData[];
  public role: any[] = [];
  // public contributersData: any[] = [
  //   {
  //     avatar: 'avatar',
  //     name: 'Hrissy V.',
  //     roles: { role: 'Co-author' },
  //     userIsAdded: false,
  //   },
  //   {
  //     avatar: 'avatar',
  //     name: 'Nekoi Nekoisi',
  //     roles: { role: 'Viewer Only' },
  //     userIsAdded: true,
  //   },
  // ];

  userName?: IUserDetail[];
  // public allUsers!: any[];
  public searchText: any;

  constructor(
    private authService: AuthService,
    private allUsersService: AllUsersService,
    //  private dialogRef: MatDialogRef<AddContributorsDialogComponent>,
    public formBuilder: FormBuilder
  ) {
    this.ownerSettingsForm = formBuilder.group({
      accessAdding: false,
      disableOptionsPrint: false,
    });
  }

  ngOnInit(): void {
    this.authService.getUserInfo().subscribe((response) => {
      const name = response.data.name;
      this.userName = name;
    });
    this.allUsersService.getAllUsers().subscribe((response: any) => {
      // const name = response.data.name;
      this.contributersData = response.data;

      // this.role = [...this.role];
      console.log('---contributer.role.name', this.contributersData[1].role?.name);
      console.log('---allUsers', this.contributersData);
    });
  }
  closeDialog() {
    //this.dialogRef.close();
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
}
