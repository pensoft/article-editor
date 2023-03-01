import { AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Location } from '@angular/common';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { Observable, Subject, Subscription } from 'rxjs';
import { map, startWith, tap } from 'rxjs/operators';
import { contributorData } from '../add-contributors-dialog.component';
import { AllUsersService } from '@app/core/services/all-users.service';
import { ServiceShare } from '@app/editor/services/service-share.service';
export let countryNames = ["Afghanistan","Albania","Algeria","Andorra","Angola","Anguilla","Antigua &amp; Barbuda","Argentina","Armenia","Aruba","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bermuda","Bhutan","Bolivia","Bosnia &amp; Herzegovina","Botswana","Brazil","British Virgin Islands","Brunei","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Cape Verde","Cayman Islands","Chad","Chile","China","Colombia","Congo","Cook Islands","Costa Rica","Cote D Ivoire","Croatia","Cruise Ship","Cuba","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea","Estonia","Ethiopia","Falkland Islands","Faroe Islands","Fiji","Finland","France","French Polynesia","French West Indies","Gabon","Gambia","Georgia","Germany","Ghana","Gibraltar","Greece","Greenland","Grenada","Guam","Guatemala","Guernsey","Guinea","Guinea Bissau","Guyana","Haiti","Honduras","Hong Kong","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Isle of Man","Israel","Italy","Jamaica","Japan","Jersey","Jordan","Kazakhstan","Kenya","Kuwait","Kyrgyz Republic","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Macau","Macedonia","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Mauritania","Mauritius","Mexico","Moldova","Monaco","Mongolia","Montenegro","Montserrat","Morocco","Mozambique","Namibia","Nepal","Netherlands","Netherlands Antilles","New Caledonia","New Zealand","Nicaragua","Niger","Nigeria","Norway","Oman","Pakistan","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Puerto Rico","Qatar","Reunion","Romania","Russia","Rwanda","Saint Pierre &amp; Miquelon","Samoa","San Marino","Satellite","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","South Africa","South Korea","Spain","Sri Lanka","St Kitts &amp; Nevis","St Lucia","St Vincent","St. Lucia","Sudan","Suriname","Swaziland","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Timor L'Este","Togo","Tonga","Trinidad &amp; Tobago","Tunisia","Turkey","Turkmenistan","Turks &amp; Caicos","Uganda","Ukraine","United Arab Emirates","United Kingdom","Uruguay","Uzbekistan","Venezuela","Vietnam","Virgin Islands (US)","Yemen","Zambia","Zimbabwe"];

@Component({
  selector: 'app-send-invitation',
  templateUrl: './send-invitation.component.html',
  styleUrls: ['./send-invitation.component.scss']
})
export class SendInvitationComponent implements OnInit, AfterViewInit, OnDestroy, AfterViewChecked {


  getAffiliationGroup(){
    return new FormGroup({
      affiliation:new FormControl('',Validators.required),
      city:new FormControl('',Validators.required),
      country:new FormControl('',Validators.required),
    })
  }

  filter(val:string){
    return countryNames.filter((y:string)=>y.toLowerCase().startsWith(val.toLowerCase()))
  }

  usersChipList = new FormControl('', Validators.required);
  notifyingPeople = new FormControl('', Validators.required);
  accessSelect = new FormControl('Viewer', Validators.required);
  roleSelect = new FormControl('Contributor', Validators.required);
  affiliations = new FormArray([this.getAffiliationGroup()]);
  message = new FormControl('Invitation message.');

  inviteUsersForm: any = new FormGroup({
    'usersChipList': this.usersChipList,
    'notifyingPeople': this.notifyingPeople,
    'accessSelect': this.accessSelect,
    'roleSelect': this.roleSelect,
    'affiliations':this.affiliations,
    'message': this.message
  });

  removeAffiliation(index:number){
    this.affiliations.removeAt(index)
  }

  addAffiliation(){
    this.affiliations.push(this.getAffiliationGroup());
  }

  separatorKeysCodes: number[] = [ENTER, COMMA];
  invitedPeople = new FormControl('');
  filteredInvitedPeople: Observable<contributorData[]>;
  users: contributorData[] = [];
  searchData :contributorData[]
  @ViewChild('usersInput') usersInput: ElementRef<HTMLInputElement>;

  accessOptions: any[] = [
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

  roleOptions: any[] = [
    {
      name: 'Author'
    },
    {
      name: 'Co-author'
    },
    {
      name: 'Contributor'
    },
  ]

  resultData=new Subject<contributorData[]>()

  constructor(
    private location: Location,
    private serviceShare:ServiceShare,
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<SendInvitationComponent>,
    public allUsersService:AllUsersService,
    private ref:ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.invitedPeople.valueChanges.subscribe((value)=>{
      this.allUsersService.getAllUsersV2({page:1,pageSize:10,'filter[search]':value}).subscribe((val:any)=>{
        if(val.meta.filter && val.meta.filter.search){
          this.resultData.next(val.data.filter(user => {
            return (
              !this.collaborators.collaborators.find((col) =>{
                if(col.id) return col.id == user.id;
                if(user.email) return col.email == user.email;
              })&&
              !this.users.find((col) =>{
                if(col.id) return col.id == user.id;
                if(user.email) return col.email == user.email;
              })
              )
          }))
        }else{
          this.resultData.next([])
        }
      })
    })
    /* this.filteredInvitedPeople = this.invitedPeople.valueChanges.pipe(
      map((invitedUser: any) => { return invitedUser ? this._filter(invitedUser) : this._filter('') })
    ) */

  }

  add(event: MatChipInputEvent): void {
    if (event.value) {
      //this.users.push({ email: event.value, name: '' });
    }

    // Clear the input value
    event.chipInput!.clear();

    this.invitedPeople.setValue(null);
  }

  ngOnInit() {
/*     this.inviteUsersForm = this.formBuilder.group({

    }); */
  }

  backClicked() {
    this.location.back();
  }

  remove(deluser: contributorData): void {
    const index = this.users.findIndex((user) => user.email == deluser.email)

    if (index >= 0) {
      this.users.splice(index, 1);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.users.push(event.option.value);
    this.usersInput.nativeElement.value = '';
    this.invitedPeople.setValue(null);
  }

  private _filter(value: string | contributorData): contributorData[] {
    let filterValue
    if (typeof value == 'string') {
      filterValue = value.toLowerCase();
    } else {
      filterValue = value.email.toLowerCase()
    }
    return this.searchData.filter(user => (user.email.toLowerCase().includes(filterValue) && !this.users.find((data) => data.email == user.email)));
  }
  onNoClick(): void {
    this.dialogRef.close();
  }
  // doAction(data: any) {
  //   this.dialogRef.close({ data});
  // }
  submitInviteUsersForm() {
    this.inviteUsersForm.controls.usersChipList.setValue(this.users)
    let usersDataCopy = JSON.parse(JSON.stringify(this.inviteUsersForm.value));
    usersDataCopy.affiliations = usersDataCopy.affiliations.filter(x=>{
      return !((!x.affiliation||x.affiliation.length == 0)&&(!x.country||x.country.length == 0)&&(!x.city||x.city.length == 0));
    })
    this.dialogRef.close(usersDataCopy);
  }
  dialogIsOpenedFromComment = false
  collaboratorstSubs: Subscription

  ngAfterViewInit(): void {
    this.users.push(...this.data.contributor)
    if (this.data.fromComment) {
      this.dialogIsOpenedFromComment = true
    }
    this.collaboratorstSubs = this.serviceShare.YdocService.collaboratorsSubject.subscribe((data) => {
      this.setCollaboratorsData(data)
    });
    this.setCollaboratorsData(this.serviceShare.YdocService.collaborators.get('collaborators'))
    this.usersInput.nativeElement.focus()
    this.ref.detectChanges();
  }

  ngAfterViewChecked(): void {
    this.ref.detectChanges()
  }

  collaborators
  setCollaboratorsData(collaboratorsData: any) {
    setTimeout(() => {
      this.collaborators = collaboratorsData
    }, 30)
  }

  ngOnDestroy(): void {
    if (this.collaboratorstSubs) {
      this.collaboratorstSubs.unsubscribe()
    }
  }

}
