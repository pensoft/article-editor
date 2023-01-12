import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AllUsersService } from '@app/core/services/all-users.service';
import { contributorData, roleMaping } from '@app/editor/dialogs/add-contributors-dialog/add-contributors-dialog.component';
import { SendInvitationComponent } from '@app/editor/dialogs/add-contributors-dialog/send-invitation/send-invitation.component';
import { ServiceShare } from '@app/editor/services/service-share.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-collaborators-auto-complete',
  templateUrl: './collaborators-auto-complete.component.html',
  styleUrls: ['./collaborators-auto-complete.component.scss']
})
export class CollaboratorsAutoCompleteComponent implements AfterViewInit,OnDestroy {

  @Input() commentmarkId?: string;
  @Output() commentmarkIdChange = new EventEmitter<string>();

  @Input() inputFormControl!: FormControl;
  @Output() inputFormControlChange = new EventEmitter<FormControl>();

  allusers?: contributorData[]
  searchResults: contributorData[] = []
  currCollaboratorsIneditor: any
  collabSub:Subscription
  constructor(
    public usersService: AllUsersService,
    public serviceShare: ServiceShare,
    public dialog: MatDialog,) {
    // should get all the users at the rendering of this component


    this.currCollaboratorsIneditor = this.serviceShare.YdocService.collaborators.get('collaborators')
    this.collabSub = this.serviceShare.YdocService.collaboratorsSubject.subscribe((collaborators)=>{
      this.currCollaboratorsIneditor = collaborators
    })
  }

  ngOnDestroy(): void {
    if(this.collabSub){
      this.collabSub.unsubscribe();
    }
  }

  selectedUser(user: contributorData) {
    let inputval = this.inputFormControl.value as string

    if (this.allusers && this.emailAddRegex.test(inputval)) {
      let vals = inputval.split(this.regexToSplit);
      this.inputFormControl.setValue(vals[0] + "@" + user.email + " ")
    }
  }

  selectedUserIndex = 0;

  keyHandle(event: KeyboardEvent) {
    let key = event.key
    if (key == 'ArrowDown' && this.selectedUserIndex < this.searchResults.length - 1) {
      this.selectedUserIndex++
    } else if (key == 'ArrowUp' && this.selectedUserIndex > 0) {
      this.selectedUserIndex--
    } else if (key == 'Enter') {
      this.selectedUser(this.searchResults[this.selectedUserIndex])
    }
  }

  addDataToBackend(emailsInText: string[], newEmails: string[],role?:string) {
    let mappedNewCollaborators = newEmails.map((email) => {
      let actualUser = this.allusers.find((user) => user.email == email)
      if (actualUser) {
        return actualUser
      } else {
        return { email, name: '' }
      }
    })
    let invitedPeople = mappedNewCollaborators;
    let mentionedPeople = this.allusers.filter((user) => {
      return (
        !mappedNewCollaborators.some((u1) => u1.email == user.email) &&
        emailsInText.some((email) => email == user.email)
      );
    })
    let articleData = {
      "id": this.serviceShare.YdocService.articleData.uuid,
      "title": this.serviceShare.YdocService.articleData.name
    }
    let message = this.inputFormControl.value;
    let commentMarkHash = this.commentmarkId
    let invited = invitedPeople.map((x:any)=>{
      x.type = roleMaping[role];
      return x
    })
    let postBody = {
      "article": articleData,
      "message": message,
      "invited": invited,
      "mentioned": mentionedPeople,
      "hash": commentMarkHash
    }
    return this.usersService.sendCommentMentionInformation(postBody);
  }

  canFinishComment = (func: any, args: any[]) => {
    let emailsInText: string[] | null = this.inputFormControl.value.match(/[\w-\.]+@([\w-]+\.)+[\w-]{2,4}/gm)
    if (this.currCollaboratorsIneditor && this.inputFormControl.value && this.allusers && emailsInText) {
      let newCollaborators: any[] = [];
      emailsInText.forEach((email) => {
        if (!this.currCollaboratorsIneditor.collaborators.find((collab) => {
          return collab.email == email
        })) {
          newCollaborators.push(email);
        }
      })
      if (newCollaborators.length > 0) {
        let mappedNewCollaborators = newCollaborators.map((email) => {
          let actualUser = this.allusers.find((user) => user.email == email)
          if (actualUser) {
            return actualUser
          } else {
            return { email, name: '' }
          }
        })
        // should add contributers to editor do finish comment add
        const dialogRef = this.dialog.open(SendInvitationComponent, {
          width: '550px',
          data: { contributor: mappedNewCollaborators, fromComment: true },
        });

        dialogRef.afterClosed().subscribe(result => {
          if (result.usersChipList.length > 0 && result.selectOptions && result.selectOptions != '' && this.currCollaboratorsIneditor) {
            this.serviceShare.ProsemirrorEditorsService.spinSpinner()
            let collaboratorsCopy = [...this.currCollaboratorsIneditor.collaborators];
            result.usersChipList.forEach((newColaborator) => {
              collaboratorsCopy.push({ ...newColaborator, role: result.selectOptions })
            })

            this.addDataToBackend(emailsInText, newCollaborators,result.selectOptions).subscribe((data)=>{
              this.serviceShare.YdocService.collaborators.set('collaborators', { collaborators: collaboratorsCopy });
              this.serviceShare.ProsemirrorEditorsService.stopSpinner()
              func(...args)
            },
            (err) => {
              console.error(err)
              this.serviceShare.ProsemirrorEditorsService.stopSpinner()
            });
          }
        });

      } else {
        this.serviceShare.ProsemirrorEditorsService.spinSpinner()
        this.addDataToBackend(emailsInText, newCollaborators).subscribe((data)=>{
              this.serviceShare.ProsemirrorEditorsService.stopSpinner()
          func(...args)
        },
        (err) => {
          console.error(err)
          this.serviceShare.ProsemirrorEditorsService.stopSpinner()
        });
      }
    } else {
      func(...args)
    }

  }

  regexToSplit = /@\S*$/gm
  emailAddRegex = /( |^)@\S*$/gm
  emailAddRegexMathStart = /( |^)@+/gm
  ngAfterViewInit(): void {
    this.inputFormControl.valueChanges.subscribe((data: string) => {
      if (this.emailAddRegex.test(data)) {
        let searchVal = data.match(this.emailAddRegex)[0].replace(this.emailAddRegexMathStart, '');
        this.usersService.getAllUsers({page:1,pageSize:10,'filter[name]':searchVal}).subscribe((res) => {
          this.allusers = res
          this.searchResults = res
          this.selectedUserIndex = 0
          //this.searchResults = this.allusers.filter((user) => user.email.startsWith(searchVal));
        })
      } else {
        this.searchResults = []
      }
    })
  }

}
