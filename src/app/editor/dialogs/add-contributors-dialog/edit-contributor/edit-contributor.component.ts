import { AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { countryNames } from '../send-invitation/send-invitation.component';

type ErrorMessage = {
  type: string;
  message: string;
}

export function validateCountry(control: AbstractControl): { [key: string]: any } | null {
  if (countryNames.indexOf(control.value) !== -1) {
    return null
  }
  console.log(control)
  return { invalidValue: true };
};

@Component({
  selector: 'app-edit-contributor',
  templateUrl: './edit-contributor.component.html',
  styleUrls: ['./edit-contributor.component.scss']
})
export class EditContributorComponent implements AfterViewInit, AfterViewChecked {

  getAffiliationGroup(data?:any){
    return new FormGroup({
      affiliation:new FormControl(data?data.affiliation:'',Validators.required),
      city:new FormControl(data?data.city:'',Validators.required),
      country:new FormControl(data?data.country:'',[Validators.required, validateCountry]),
    })
  }

  filter(val:string){
    return countryNames.filter((y:string)=>y.toLowerCase().startsWith(val.toLowerCase()))
  }

  accessSelect = new FormControl('', Validators.required)
  roleSelect = new FormControl('Contributor', Validators.required);
  affiliations = new FormArray([]);

  editUserForm: any = new FormGroup({
    'accessSelect': this.accessSelect,
    'roleSelect': this.roleSelect,
    'affiliations':this.affiliations,
  });

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

  askremove = false;

  affiliationErrorMessages: ErrorMessage[] = [
    { type: 'required', message: 'Affiliation is required.' },
  ]

  cityErrorMessages: ErrorMessage[] = [
    { type: 'required', message: 'City is required.' },
  ]

  countryErrorMessages: ErrorMessage[] = [
    { type: 'invalidValue', message: 'Country not recognized.' },
    { type: 'required', message: 'Country is required.' },
  ]

  constructor(
    public dialogRef: MatDialogRef<EditContributorComponent>,
    private ref:ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  nothingIsEdited(): boolean {
    let oldData = {
      access:this.data.contrData.access,
      role:this.data.contrData.role,
      affiliations:this.data.contrData.affiliations,
    }
    let newData = {
      access:this.accessSelect.value,
      role:this.roleSelect.value,
      affiliations:this.affiliations.value,
    }

    return JSON.stringify(oldData) == JSON.stringify(newData);
  }

  formSubmitDisabled(): boolean {
    return this.nothingIsEdited() || !this.editUserForm.valid;
  }

  ngAfterViewInit(): void {
    if(this.data.contrData.access == 'Owner'){
      this.accessOptions.push({name:'Owner'});
      this.accessSelect.disable();
    }
    this.accessSelect.setValue(this.data.contrData.access)
    this.roleSelect.setValue(this.data.contrData.role)
    this.data.contrData.affiliations.forEach((affiliation)=>{
      this.affiliations.push(this.getAffiliationGroup(affiliation));
    })
  }

  removeCollaborator(){
    this.dialogRef.close({edited:true,removed:true})
  }

  removeAffiliation(index:number){
    this.affiliations.removeAt(index)
  }

  addAffiliation(){
    this.affiliations.push(this.getAffiliationGroup());
  }

  editCollaborator(){
    this.dialogRef.close({
      edited:true,
      access:this.accessSelect.value,
      role:this.roleSelect.value,
      affiliations:this.affiliations.value.filter(x=>{
        return !((!x.affiliation||x.affiliation.length == 0)&&(!x.country||x.country.length == 0)&&(!x.city||x.city.length == 0));
      })
    })
  }

  ngAfterViewChecked(): void {
    this.ref.detectChanges()
  }
}
