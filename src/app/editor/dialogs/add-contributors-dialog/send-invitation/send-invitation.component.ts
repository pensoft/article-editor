import { AfterViewInit, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Location } from '@angular/common';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { Observable } from 'rxjs';
import {map, startWith, tap} from 'rxjs/operators';
import { contributorData, searchData } from '../add-contributors-dialog.component';
@Component({
  selector: 'app-send-invitation',
  templateUrl: './send-invitation.component.html',
  styleUrls: ['./send-invitation.component.scss']
})
export class SendInvitationComponent implements OnInit, AfterViewInit {
  inviteUsersForm: FormGroup;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  invitedPeople = new FormControl('');
  filteredInvitedPeople: Observable<contributorData[]>;
  users: contributorData[] = [];
  searchData = searchData
  @ViewChild('usersInput') usersInput: ElementRef<HTMLInputElement>;

  selectOptions: any[]=[
    {
      name: 'Viewer'
    },
    {
      name: 'Commenter'
    },
    {
      name: 'Editor'
    },
  ]


  constructor(
    private location: Location,
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<SendInvitationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
   this.filteredInvitedPeople = this.invitedPeople.valueChanges.pipe(
    map((invitedUser: any) => {console.log(invitedUser);return invitedUser ? this._filter(invitedUser) : this._filter('')})
   )

  }

  ngOnInit() {
    this.inviteUsersForm = this.formBuilder.group({
      usersChipList: ['', Validators.required],
      notifyingPeople: ['', Validators.required],
      selectOptions:['', Validators.required],
      message: ['', Validators.required],
    });
  }

  backClicked() {
    this.location.back();
  }

  remove(deluser: contributorData): void {
    const index = this.users.findIndex((user)=>user.name == deluser.name)

    if (index >= 0) {
      this.users.splice(index, 1);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.users.push(event.option.value);
    this.usersInput.nativeElement.value = '';
    this.invitedPeople.setValue(null);
  }

  private _filter(value: string|contributorData): contributorData[] {
    let filterValue
    if(typeof value == 'string'){
      filterValue = value.toLowerCase();
    }else{
      filterValue = value.name.toLowerCase()
    }
    return this.searchData.filter(user => (user.name.toLowerCase().includes(filterValue)&&!this.users.find((data)=>data.name == user.name)));
  }
  onNoClick(): void {
    this.dialogRef.close();
  }
  // doAction(data: any) {
  //   this.dialogRef.close({ data});
  // }
  submitInviteUsersForm(){
    this.inviteUsersForm.controls.usersChipList.setValue(this.users)
    console.log('inviteUsersForm', this.inviteUsersForm.value);
    setTimeout(()=>{
      this.dialogRef.close();
    },2000)
  }
  ngAfterViewInit(): void {
    console.log(this.data);
    this.users.push(this.data.contributor)
  }

}
