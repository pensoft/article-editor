import { AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { countryNames } from '../send-invitation/send-invitation.component';

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
      country:new FormControl(data?data.country:'',Validators.required),
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

  constructor(
    public dialogRef: MatDialogRef<EditContributorComponent>,
    private ref:ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  nothingIsEdited(){
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
    return JSON.stringify(oldData) == JSON.stringify(newData)
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
      affiliations:this.affiliations.value
    })
  }

  ngAfterViewChecked(): void {
    this.ref.detectChanges()
  }
}
