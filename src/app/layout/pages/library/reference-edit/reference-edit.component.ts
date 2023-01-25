import { AfterViewInit, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { formioAuthorsDataGrid, formIOTextFieldTemplate, reference } from '../data/data';
import { SaveComponent } from './save/save.component';

@Component({
  selector: 'app-reference-edit',
  templateUrl: './reference-edit.component.html',
  styleUrls: ['./reference-edit.component.scss']
})
export class ReferenceEditComponent implements AfterViewInit {
  referenceForms: FormGroup = new FormGroup({})
  formIOSchema: any = undefined;
  referenceFormControl = new FormControl(null, [Validators.required]);
  stylesFormControl = new FormControl(null, [Validators.required]);
  referenceTypesFromBackend: any[] = []
  dataSave:any
  referenceStyles:any
  constructor(
    public dialogRef: MatDialogRef<ReferenceEditComponent>,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private cahngeDetectorRef: ChangeDetectorRef
  ) {
  }

  generateFormIOJSON(type: any) {
    this.formIOSchema = undefined;
    this.cahngeDetectorRef.detectChanges()

    let newFormIOJSON = JSON.parse(JSON.stringify(type.formIOScheme));
    let oldFormIOData = this.dataSave?this.dataSave:this.data.oldData?this.data.oldData.refData.formioData:undefined;
    //let oldFormIOData = this.dataSave?this.dataSave:this.data.oldData?this.data.oldData.formioSubmission:undefined;
    newFormIOJSON.components.forEach((component:any)=>{
      let val = oldFormIOData?oldFormIOData[component.key]:undefined;
      if(val){
        component.defaultValue = val
      }
    })
    setTimeout(() => {
      this.formIOSchema = newFormIOJSON;
      this.cahngeDetectorRef.detectChanges();
    }, 100)
    return
  }

  ngAfterViewInit(): void {
    this.referenceTypesFromBackend = this.data.referenceTypesFromBackend;
    this.referenceStyles = this.data.referenceStyles
    if (!this.data.oldData) {
      this.referenceFormControl.setValue(this.referenceTypesFromBackend[0]);
      this.stylesFormControl.setValue(this.referenceStyles[0])
    } else {
      let oldBuildData = this.data.oldData;

      if (this.referenceTypesFromBackend.find((ref) => {
        return (ref.name == oldBuildData.refType.name||ref.type == oldBuildData.refType.type)
      })) {
        let index = this.referenceTypesFromBackend.findIndex((ref) => {
          return (ref.name == oldBuildData.refType.name||ref.type == oldBuildData.refType.type)
        });
        this.referenceFormControl.setValue(this.referenceTypesFromBackend[index]);
      }else{
        this.referenceFormControl.setValue(this.referenceTypesFromBackend[0]);
      }

      if (this.referenceStyles.find((style:any) => {
        return style.name == oldBuildData.refStyle.name
      })) {
        let index = this.referenceStyles.findIndex((style:any) => {
          return style.name == oldBuildData.refStyle.name
        });
        this.stylesFormControl.setValue(this.referenceStyles[index]);
      }else{
        this.stylesFormControl.setValue(this.referenceStyles[0])
      }

    }

    this.generateFormIOJSON(this.referenceFormControl.value)
  }

  onSubmit(submission: any) {
    this.dialogRef.close({
      submissionData: submission,
      referenceScheme: this.referenceFormControl.value,
      referenceStyle: this.stylesFormControl.value,
    })
  }

  onChange(change: any) {
    this.dataSave = change.data;
  }

  ready(event: any) {
  }

}
