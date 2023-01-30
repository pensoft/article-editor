import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { IUserDetail } from '@app/core/interfaces/auth.interface';
import { AllUsersService } from '@app/core/services/all-users.service';
import { AuthService } from '@app/core/services/auth.service';
import { ServiceShare } from '@app/editor/services/service-share.service';
import { Console } from 'console';
import { of, Subscription } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { Transaction, YMapEvent } from 'yjs/dist/src';
import { EditContributorComponent } from './edit-contributor/edit-contributor.component';
import { SendInvitationComponent } from './send-invitation/send-invitation.component';

export interface contributorData {
  name: string,
  access?: 'Editor' | 'Viewer' | 'Commenter',
  email: string,
  id: string
}

export let accessMaping = {
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
  public access: any[] = [];

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
    this.searchFormControl.valueChanges.pipe(
      switchMap((value:string) => {
        return this.allUsersService.getAllUsersV2({page:1,pageSize:10,'filter[search]':value})
    })).subscribe(({data = []}:any)=>{
      this.searchData = data;
      this.searchResults = data;
    })
  }

  clickedOutOdInput() {
    this.searchFormControl.setValue('')
  }

  editContr(contrData: any) {
    const dialogRef = this.dialog.open(EditContributorComponent, {
      width: '445px',
      panelClass: 'contributors-dialog',
      data: { contrData },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.edited) {
        let editedContributors = [...this.collaborators.collaborators]
        let userIndex = editedContributors.findIndex((user) => user.email == contrData.email)
        if (result.removed) {
          editedContributors.splice(userIndex, 1)
        } else if (result.access) {
          editedContributors[userIndex].access = result.access
        }
        console.log('set contributors after change',{ collaborators: editedContributors });
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
      console.log('get contributors setCollaboratorsData add dialog',collaboratorsData);
      if (this.currentUser) {
        this.checkIfCurrUserIsOwner()
      }
    }, 30)
  }

  checkIfCurrUserIsOwner() {
    let user = this.collaborators.collaborators.find((col) => { return col.email == this.currentUser.email });
    this.sharedService.EnforcerService.enforceAsync('is-admin','admin-can-do-anything').subscribe((admin)=>{
      if(admin){
        this.isOwner = true
      }else{
        if (user.access == 'Owner') {
          this.isOwner = true
        }
      }
    })
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
      width: '445px',
      panelClass: 'contributors-dialog',
      data: { contributor: [contributor] },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.usersChipList.length > 0 && result.selectOptions && result.selectOptions != '' && this.collaborators) {
        this.sharedService.ProsemirrorEditorsService.spinSpinner()
        let collaboratorsCopy = [...this.collaborators.collaborators];
        result.usersChipList.forEach((newColaborator) => {
          collaboratorsCopy.push({ ...newColaborator, access: result.selectOptions })
        })
        let articleData = {
          "id": this.sharedService.YdocService.articleData.uuid,
          "title": this.sharedService.YdocService.articleData.name
        }
        let access = result.selectOptions
        let postBody = {
          "article": articleData,
          "message": result.message,
          "invited": result.usersChipList.map((x: any) => {
            x.type = accessMaping[access];
            return x
          }),
        }
        this.allUsersService.sendInviteInformation(postBody).subscribe(
          (res) => {
            console.log('set contributors after add',{ collaborators: collaboratorsCopy });
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
