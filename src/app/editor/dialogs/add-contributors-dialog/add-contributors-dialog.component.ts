import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { IUserDetail } from '@app/core/interfaces/auth.interface';
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
  id: string
}

export let roleMaping = {
  'Editor':'WRITER',
  "Commenter":'COMMENTER',
  "Viewer":'READER'
}

@Component({
  selector: 'app-add-contributors-dialog',
  templateUrl: './add-contributors-dialog.component.html',
  styleUrls: ['./add-contributors-dialog.component.scss'],
})
export class AddContributorsDialogComponent implements AfterViewInit, OnDestroy {
  ownerSettingsForm: FormGroup;

  searchFormControl = new FormControl('')

  showError = false;
  public role: any[] = [];

  searchData: contributorData[]
  contributersData: contributorData[]

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
    });
    this.allUsersService.getAllUsers().subscribe((response: any) => {
      this.searchData = response;
    });
  }

  clickedOutOdInput() {
    this.searchFormControl.setValue('')
  }

  editContr(contrData: any) {
    const dialogRef = this.dialog.open(EditContributorComponent, {
      width: '250px',
      data: { contrData },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.edited) {
        let editedContributors = [...this.collaborators.collaborators]
        let userIndex = editedContributors.findIndex((user) => user.email == contrData.email)
        if (result.removed) {
          editedContributors.splice(userIndex, 1)
        } else if (result.role) {
          editedContributors[userIndex].role = result.role
        }
        this.sharedService.YdocService.collaborators.set('collaborators', { collaborators: editedContributors })
      }
    });
  }

  filterSearchResults(filterVal: string) {
    if (this.collaborators && this.currentUser && this.searchData) {

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

  }
  closeDialog() {
    this.dialogRef.close();
  }
  submitOwnerSettingsForm() {
  }

  dataIsLoaded = true;




  sendAllSelectContributers() {

  }
  openAddContrDialog(contributor: any) {
    const dialogRef = this.dialog.open(SendInvitationComponent, {
      width: '550px',
      data: { contributor: [contributor] },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.usersChipList.length > 0 && result.selectOptions && result.selectOptions != '' && this.collaborators) {
        this.sharedService.ProsemirrorEditorsService.spinSpinner()
        let collaboratorsCopy = [...this.collaborators.collaborators];
        result.usersChipList.forEach((newColaborator) => {
          collaboratorsCopy.push({ ...newColaborator, role: result.selectOptions })
        })
        let articleData = {
          "id": this.sharedService.YdocService.articleData.uuid,
          "title": this.sharedService.YdocService.articleData.name
        }
        let role = result.selectOptions
        let postBody = {
          "article": articleData,
          "message": result.message,
          "invited": result.usersChipList.map((x: any) => {
            x.type = roleMaping[role];
            return x
          }),
        }
        this.allUsersService.sendInviteInformation(postBody).subscribe(
          (res) => {
            this.sharedService.YdocService.collaborators.set('collaborators', { collaborators: collaboratorsCopy })
            this.sharedService.ProsemirrorEditorsService.stopSpinner()
          },
          (err) => {
            console.error(err)
            this.sharedService.ProsemirrorEditorsService.stopSpinner()
          }
        )
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
