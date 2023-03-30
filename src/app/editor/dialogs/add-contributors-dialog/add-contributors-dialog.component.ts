import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
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

export interface authorListData {authorId:string,authorEmail:string}
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

  authorsList:authorListData[]

  searchResults: any[] = []

  currentUser?: any;
  // public allUsers!: any[];
  public searchText: any;

  @ViewChild('searchUsersInput', { read: ElementRef }) searchUsersInput?: ElementRef;
  constructor(
    private allUsersService: AllUsersService,
    private dialogRef: MatDialogRef<AddContributorsDialogComponent>,
    public formBuilder: FormBuilder,
    public dialog: MatDialog,
    public sharedService: ServiceShare,
    private ref:ChangeDetectorRef
  ) {
    this.ownerSettingsForm = formBuilder.group({
      accessAdding: false,
      disableOptionsPrint: false,
    });
    this.searchFormControl.valueChanges.pipe(
      switchMap((value:string) => {
        return this.allUsersService.getAllUsersV2({page:1,pageSize:10,'filter[search]':value})
    })).subscribe((val:any)=>{
      if(val.meta.filter && val.meta.filter.search){
        this.searchData = val.data.filter(user => !this.collaborators.collaborators.find((col) => col.email == user.email));
        this.searchResults = val.data.filter(user => !this.collaborators.collaborators.find((col) => col.email == user.email));
      }else{
        this.searchData = [];
        this.searchResults = [];
      }
    })
  }

  hideResults(){
    this.searchResults = []
  }

  showResult(){
    let val = this.searchFormControl.value;
    if(!val||val.length == 0) return
    this.searchResults = this.searchData
  }

  editContr(contrData: any) {
    const dialogRef = this.dialog.open(EditContributorComponent, {
      maxWidth: '80%',
      panelClass: 'contributors-dialog',
      data: { contrData },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.edited) {
        let editedContributors = [...this.collaborators.collaborators]
        let authorsListCopy:authorListData[] = [...this.authorsList];
        let userIndex
        if(contrData.id){
          userIndex = editedContributors.findIndex((user) => user.id == contrData.id)
        }else{
          userIndex = editedContributors.findIndex((user) => user.email == contrData.email)
        }
        let userInCollaboratorsArr = editedContributors[userIndex]
        if (result.removed && userInCollaboratorsArr) {
          editedContributors.splice(userIndex, 1)
          if(userInCollaboratorsArr.role ==  'Author' || userInCollaboratorsArr.role == 'Co-author'){

            if(userInCollaboratorsArr.id&&authorsListCopy.some(x=>x.authorId == userInCollaboratorsArr.id)){
              authorsListCopy = authorsListCopy.filter(x=>x.authorId != userInCollaboratorsArr.id)
            }else if(!userInCollaboratorsArr.id&&userInCollaboratorsArr.email&&authorsListCopy.some(x=>x.authorEmail == userInCollaboratorsArr.email)){
              authorsListCopy = authorsListCopy.filter(x=>x.authorEmail != userInCollaboratorsArr.email)
            }

          }
        } else if (result.access) {
          if((userInCollaboratorsArr.role ==  'Author' || userInCollaboratorsArr.role == 'Co-author')&&result.role == 'Contributor'){
            let prop
            let val
            if(userInCollaboratorsArr.id){
              prop = 'authorId'
              val = userInCollaboratorsArr.id
            }else{
              prop = 'authorEmail'
              val = userInCollaboratorsArr.email
            }
            let indexOfAuthor = authorsListCopy.findIndex(user=>user[prop] == val);
            if(indexOfAuthor>=0){
              authorsListCopy.splice(indexOfAuthor,1);
            }
          }else if(userInCollaboratorsArr.role ==  'Contributor'&&(result.role ==  'Author' || result.role == 'Co-author')){
            authorsListCopy.push({authorEmail:userInCollaboratorsArr.email,authorId:userInCollaboratorsArr.id});
          }
          editedContributors[userIndex].access = result.access;
          editedContributors[userIndex].role = result.role;
          editedContributors[userIndex].affiliations = result.affiliations;
        }
        if(authorsListCopy.length!=this.authorsList.length){
          this.sharedService.YdocService.collaborators.set('authorsList', authorsListCopy);
        }
        this.sharedService.YdocService.collaborators.set('collaborators', { collaborators: editedContributors })
      }
    });
  }

  drop(event: CdkDragDrop<any[]>) {
    let authorsCopy = [...this.authorsList]
    moveItemInArray(authorsCopy, event.previousIndex, event.currentIndex);
    moveItemInArray(this.authors, event.previousIndex, event.currentIndex);

    this.sharedService.YdocService.collaborators.set('authorsList',authorsCopy)
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

  authors:any[]
  contributors:any[]


  setCollaboratorsData(collaboratorsData: any) {
    setTimeout(() => {
      this.collaborators = collaboratorsData
      this.authorsList = this.sharedService.YdocService.collaborators.get('authorsList');

      this.authors = this.authorsList.map((user)=>{
        let prop
        let val
        if(user.authorId){
          prop = 'id'
          val = user.authorId
        }else{
          prop = 'email'
          val = user.authorEmail
        }
        return this.collaborators.collaborators.find(x=>x[prop] == val);
      })

      this.contributors = this.collaborators.collaborators.filter((user)=>{
        let prop
        let val
        if(user.id){
          prop = 'authorId'
          val = user.id
        }else{
          prop = 'authorEmail'
          val = user.email
        }
        return !this.authorsList.some(x=>x[prop] == val);
      })

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
    this.sharedService.AuthService.currentUser$.subscribe((response) => {
      this.currentUser = response;
      if (this.collaborators) {
        this.checkIfCurrUserIsOwner()
      }
    });
    this.collaboratorstSubs = this.sharedService.YdocService.collaboratorsSubject.subscribe((data) => {
      this.setCollaboratorsData(data)
    });
    this.setCollaboratorsData(this.sharedService.YdocService.collaborators.get('collaborators'))
    this.searchUsersInput.nativeElement.focus()
    this.ref.detectChanges()
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
      maxWidth: '80%',
      panelClass: 'contributors-dialog',
      data: { contributor: [contributor] },
    });

    dialogRef.afterClosed().subscribe((result:{
      'usersChipList': any,
      'notifyingPeople': any,
      'accessSelect': string,
      'roleSelect': string,
      'affiliations':{
        affiliation:string,
        city:string,
        country:string
      }[],
      'message': string
    }) => {
      if (result&&result.usersChipList.length > 0 && result.accessSelect && result.accessSelect != '' && this.collaborators) {
        this.sharedService.ProsemirrorEditorsService.spinSpinner()
        let collaboratorsCopy = [...this.collaborators.collaborators];
        result.usersChipList.forEach((newColaborator) => {
          collaboratorsCopy.push({ ...newColaborator, access: result.accessSelect,role:result.roleSelect,affiliations:result.affiliations })
        })
        let authorsListCopy:authorListData[] = [...this.authorsList];
        if(result.roleSelect == 'Author' || result.roleSelect == 'Co-author'){
          authorsListCopy.push(...result.usersChipList.map(user=>{return {authorId:user.id,authorEmail:user.email}}));
        }
        let articleData = {
          "id": this.sharedService.YdocService.articleData.uuid,
          "title": this.sharedService.YdocService.articleData.name
        }
        let access = result.accessSelect
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
            this.sharedService.YdocService.collaborators.set('collaborators', { collaborators: collaboratorsCopy })
            this.sharedService.YdocService.collaborators.set('authorsList', authorsListCopy)
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
