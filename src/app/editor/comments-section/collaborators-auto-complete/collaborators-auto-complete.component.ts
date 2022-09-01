import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AllUsersService } from '@app/core/services/all-users.service';
import { contributorData } from '@app/editor/dialogs/add-contributors-dialog/add-contributors-dialog.component';
import { SendInvitationComponent } from '@app/editor/dialogs/add-contributors-dialog/send-invitation/send-invitation.component';
import { ServiceShare } from '@app/editor/services/service-share.service';

@Component({
  selector: 'app-collaborators-auto-complete',
  templateUrl: './collaborators-auto-complete.component.html',
  styleUrls: ['./collaborators-auto-complete.component.scss']
})
export class CollaboratorsAutoCompleteComponent implements AfterViewInit {

  @Input() inputFromControl!:FormControl;
  @Output() inputFromControlChange = new EventEmitter<FormControl>();

  allusers?: contributorData[]
  searchResults:contributorData[] = []
  currCollaboratorsIneditor:any

  constructor(
    public usersService:AllUsersService,
    public serviceShare:ServiceShare,
    public dialog: MatDialog,) {
    // should get all the users at the rendering of this component
    usersService.getAllUsers().subscribe((res)=>{
      this.allusers = res
    })

    this.currCollaboratorsIneditor = this.serviceShare.YdocService.collaborators.get('collaborators')

  }

  selectedUser(user:contributorData){
    console.log('selected-user');
    let inputval = this.inputFromControl.value as string

    if(this.allusers&&this.emailAddRegex.test(inputval)){
      let vals = inputval.split(this.regexToSplit);
      this.inputFromControl.setValue(vals[0]+"@"+user.email+" ")
    }
  }

  selectedUserIndex = 0;

  keyHandle(event:KeyboardEvent){
    let key = event.key
    if(key == 'ArrowDown'&&this.selectedUserIndex<this.searchResults.length-1){
      this.selectedUserIndex++
    }else if(key == 'ArrowUp'&&this.selectedUserIndex>0){
      this.selectedUserIndex--
    }else if(key == 'Enter'){
      this.selectedUser(this.searchResults[this.selectedUserIndex])
    }
  }

  canFinishComment = (func:any,args:any[])=>{
    if(this.currCollaboratorsIneditor&&this.inputFromControl.value){
      let emailsInText:string[]|null = this.inputFromControl.value.match(/[\w-\.]+@([\w-]+\.)+[\w-]{2,4}/gm)
      if(!emailsInText){
        func(...args)
        return
      }
      let newCollaborators:any[] = [];
      emailsInText.forEach((email)=>{
        if(!this.currCollaboratorsIneditor.collaborators.find((collab)=>{
          return collab.email == email
        })){
          newCollaborators.push(email);
        }
      })
      if(newCollaborators.length>0){
        // should add contributers to editor do finish comment add
        const dialogRef = this.dialog.open(SendInvitationComponent, {
          width: '550px',
          data: { contributor:newCollaborators.map((email)=>{
            let actualUser = this.allusers.find((user)=>user.email == email)
            if(actualUser){
              return actualUser
            }else{
              return {email,name:''}
            }
          }) ,fromComment:true},
        });

        dialogRef.afterClosed().subscribe(result => {
          if (result.usersChipList.length > 0 && result.selectOptions && result.selectOptions != '' && this.currCollaboratorsIneditor) {
            let collaboratorsCopy = [...this.currCollaboratorsIneditor.collaborators];
            result.usersChipList.forEach((newColaborator) => {
              collaboratorsCopy.push({ ...newColaborator, role: result.selectOptions })
            })
            this.serviceShare.YdocService.collaborators.set('collaborators', { collaborators: collaboratorsCopy })
            func(...args)
          }
        });
      }else{
        func(...args)
      }
    }else{
      func(...args)
    }

  }

  regexToSplit = /@\S*$/gm
  emailAddRegex = /( |^)@\S*$/gm
  emailAddRegexMathStart = /( |^)@+/gm
  ngAfterViewInit(): void {
    this.inputFromControl.valueChanges.subscribe((data:string)=>{
      if(this.allusers&&this.emailAddRegex.test(data)){
        let searchVal = data.match(this.emailAddRegex)[0].replace(this.emailAddRegexMathStart,'');
        this.searchResults = this.allusers.filter((user)=>user.email.startsWith(searchVal));
        this.selectedUserIndex = 0
      }else{
        this.searchResults = []
      }
    })
  }

}
