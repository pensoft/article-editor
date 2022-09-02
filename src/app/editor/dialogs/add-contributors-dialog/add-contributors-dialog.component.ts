import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { IUserDetail } from '@app/core/interfaces/auth.interface';
import { IContributersData } from '@app/core/interfaces/contributer.interface';
import { AllUsersService } from '@app/core/services/all-users.service';
import { AuthService } from '@app/core/services/auth.service';
import { ServiceShare } from '@app/editor/services/service-share.service';
import { Console } from 'console';
import { Subscription } from 'rxjs';
import { Transaction, YMapEvent } from 'yjs/dist/src';
import { EditContributorComponent } from './edit-contributor/edit-contributor.component';
import { SendInvitationComponent } from './send-invitation/send-invitation.component';

export interface contributorData {
  name: string,
  role?: 'Editor' | 'Viewer' | 'Commenter',
  email: string,
}

export let searchData: contributorData[] = [
  {
    name: 'Hrissy V.',
    email: 'hrissyv@gmail.com',
  },
  {
    name: 'Hristo Iliev',
    email: 'iceto@gmail.com',
  },
  {
    name: 'Milen Milkov',
    email: 'milcho@gmail.com',
  },
  {
    name: 'Ivan Bonev',
    email: 'ivbon@gmail.com',
  },
  {
    name: 'Iren Hristova',
    email: 'iren@gmail.com',
  },
  {
    name: 'Ralitsa Jivkova',
    email: 'ral@gmail.com',
  },
  {
    name: 'Iliq Dimov',
    email: 'iliq@gmail.com',
  },
  {
    name: 'Petar Petrov',
    email: 'petko@gmail.com',
  },
  {
    name: 'Vladimir Tanev',
    email: 'vladicha@gmail.com',
  },
  {
    name: 'Nekoi Nekoisi',
    email: 'nekoi@gmail.com',
  },
];

@Component({
  selector: 'app-add-contributors-dialog',
  templateUrl: './add-contributors-dialog.component.html',
  styleUrls: ['./add-contributors-dialog.component.scss'],
})
export class AddContributorsDialogComponent implements AfterViewInit, OnDestroy {
  ownerSettingsForm: FormGroup;

  searchFormControl = new FormControl('')

  showError = false;
  //public contributersData!: IContributersData[];
  public role: any[] = [];
  public contributersData: contributorData[] = [
    {
      name: 'Hrissy V.',
      email: 'hrissyv@gmail.com',
      role: 'Editor',
    },
    {
      name: 'Nekoi Nekoisi',
      role: 'Viewer',
      email: 'nekoi@gmail.com',
    },
  ];
  searchData = searchData;


  searchResults: any[] = []

  currentUser?: any;
  // public allUsers!: any[];
  public searchText: any;

  constructor(
    private allUsersService: AllUsersService,
    private dialogRef: MatDialogRef<AddContributorsDialogComponent>,
    public formBuilder: FormBuilder,
    public dialog: MatDialog,
    public sharedService: ServiceShare
  ) {
    this.ownerSettingsForm = formBuilder.group({
      accessAdding: false,
      disableOptionsPrint: false,
    });
    this.searchFormControl.valueChanges.subscribe((value) => {
      if (!value || value == '' || value.length == 0) {
        this.searchResults = []
      } else {
        this.searchResults = this.filterSearchResults(value)
      }
    })
  }

  clickedOutOdInput() {
    this.searchFormControl.setValue('')
  }

  editContr(contrData:any){
    const dialogRef = this.dialog.open(EditContributorComponent, {
      width: '250px',
      data: { contrData },
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result&&result.edited){
        let editedContributors = [...this.collaborators.collaborators]
        let userIndex = editedContributors.findIndex((user)=>user.email == contrData.email)
        if(result.removed){
          editedContributors.splice(userIndex,1)
        }else if(result.role){
          editedContributors[userIndex].role = result.role
        }
        this.sharedService.YdocService.collaborators.set('collaborators',{collaborators:editedContributors})
      }
    });
  }

  filterSearchResults(filterVal: string) {
    if (this.collaborators && this.currentUser) {

      return this.searchData.filter((user) => { return (user.email.includes(filterVal.toLocaleLowerCase()) && user.email != this.currentUser.email && !this.collaborators.collaborators.find((col) => col.email == user.email)) })
    } else {
      return []
    }
  }

  search(inputText: HTMLInputElement) {
    let input = inputText.value
  }

  collaborators?: { collaborators: any[] }
  isOwner = false;
  setCollaboratorsData(collaboratorsData: any) {
    setTimeout(() => {
      this.collaborators = collaboratorsData
      if (this.currentUser) {
        this.checkIfCurrUserIsOwner()
      }
    }, 30)
  }

  checkIfCurrUserIsOwner() {
    let user = this.collaborators.collaborators.find((col) => { return col.email == this.currentUser.email });
    if (user.role == 'Owner') {
      this.isOwner = true
    }
  }

  collaboratorstSubs: Subscription
  ngAfterViewInit(): void {
    this.sharedService.AuthService.getUserInfo().subscribe((response) => {
      this.currentUser = response.data;
      if (this.collaborators) {
        this.checkIfCurrUserIsOwner()
      }
    });
    this.collaboratorstSubs = this.sharedService.YdocService.collaboratorsSubject.subscribe((data) => {
      this.setCollaboratorsData(data)
    });
    this.setCollaboratorsData(this.sharedService.YdocService.collaborators.get('collaborators'))
    this.allUsersService.getAllUsers().subscribe((response: any) => {
      // const name = response.data.name;
      this.contributersData = response.data;
    });
  }
  closeDialog() {
    this.dialogRef.close();
  }
  submitOwnerSettingsForm() {
  }
  addUser(contributersData: any) {
    contributersData.userIsAdded = true;
  }
  removeUser(contributersData: any) {
    contributersData.userIsAdded = false;
  }

  dataIsLoaded = true;




  sendAllSelectContributers() {

  }
  openAddContrDialog(contributor: any) {
    const dialogRef = this.dialog.open(SendInvitationComponent, {
      width: '550px',
      data: { contributor:[contributor] },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.usersChipList.length > 0 && result.selectOptions && result.selectOptions != '' && this.collaborators) {
        let collaboratorsCopy = [...this.collaborators.collaborators];
        result.usersChipList.forEach((newColaborator) => {
          collaboratorsCopy.push({ ...newColaborator, role: result.selectOptions })
        })
        this.sharedService.YdocService.collaborators.set('collaborators', { collaborators: collaboratorsCopy })
      }
      this.searchFormControl.setValue(null)
    });
  }
  ngOnDestroy(): void {
    if (this.collaboratorstSubs) {
      this.collaboratorstSubs.unsubscribe()
    }
  }
}
