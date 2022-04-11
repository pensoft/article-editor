import { AfterViewInit, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { formioAuthorsDataGrid, formIOTextFieldTemplate, reference } from '../data/data';

@Component({
  selector: 'app-reference-edit',
  templateUrl: './reference-edit.component.html',
  styleUrls: ['./reference-edit.component.scss']
})
export class ReferenceEditComponent implements AfterViewInit {
  referenceForms: FormGroup = new FormGroup({})
  formIOSchema: any = undefined;
  referenceFormControl = new FormControl(null, [Validators.required]);
  possibleReferenceTypes: any[] = []
  dataSave:any
  constructor(
    public dialogRef: MatDialogRef<ReferenceEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private cahngeDetectorRef: ChangeDetectorRef
  ) {
  }

  generateFormIOJSON(type: any) {
    this.formIOSchema = undefined;
    this.cahngeDetectorRef.detectChanges()

    let newFormIOJSON = type.formIOScheme;
    let oldFormIOData = this.dataSave?this.dataSave:this.data.oldData?this.data.oldData.formioSubmission:undefined;
    newFormIOJSON.components.forEach((component:any)=>{
      let val = oldFormIOData[component.key];
      if(val){
        component.defaultValue = val
      }
    })
    setTimeout(() => {
      this.formIOSchema = newFormIOJSON;
      this.cahngeDetectorRef.detectChanges();
    }, 100)
    return
    let forms = type.formFields;
    let newFormIOJSON1: any = {
      "components": [

      ]
    }
    let oldFormIOData1 = this.dataSave?this.dataSave:this.data.oldData?this.data.oldData.formioSubmission:undefined
    forms.forEach((form:any) => {
      let formTemplate: any
      if (form.cslKey == 'authors' || form.cslKey == 'editor') {

        formTemplate = JSON.parse(JSON.stringify(formioAuthorsDataGrid));
        let loopAndChangeConditions = (obj: any) => {
          if (obj['conditional']) {
            obj['conditional'].when = obj['conditional'].when.replace(formTemplate.key, form.cslKey)
          }
          if (obj instanceof Array) {
            obj.forEach((el: any) => {
              loopAndChangeConditions(el);
            })
          } else if (typeof obj == 'object' && Object.keys(obj).length > 0) {
            Object.keys(obj).forEach((key) => {
              let el = obj[key];
              if (el) {
                loopAndChangeConditions(el);
              }
            })
          }
        }
        loopAndChangeConditions(formTemplate)
      } else {
        formTemplate = JSON.parse(JSON.stringify(formIOTextFieldTemplate));
        if (form.validations) {
          formTemplate['validate'] = {}
          if(form.validations.required){
            formTemplate.validate.required = true;
          }
          if(form.validations.pattern){
            formTemplate.validate.pattern = form.validations.pattern
          }
          if (form.validations.min) {
            formTemplate.validate.minLength = form.validations.min
          }
          if (form.validations.max) {
            formTemplate.validate.maxLength = form.validations.max
          }
        }
      }

      formTemplate.label = form.label;
      if(form.cslKey){

      }
      formTemplate.key = form.cslKey;
      if(oldFormIOData&&oldFormIOData[form.cslKey]){
        formTemplate.defaultValue = oldFormIOData[form.cslKey];
      }
      newFormIOJSON.components.push(formTemplate);
    })
    newFormIOJSON.components.push({
      "type": "button",
      "label": "Submit",
      "key": "submit",
      "disableOnInvalid": true,
      "input": true,
      "tableView": false
    })
    setTimeout(() => {
      console.log('formIOSchema',newFormIOJSON);
      this.formIOSchema = newFormIOJSON;
      this.cahngeDetectorRef.detectChanges();
    }, 100)
  }

  ngAfterViewInit(): void {
    this.possibleReferenceTypes = this.data.referenceTypesFromBackend;
    //this.possibleReferenceTypes = this.data.possibleReferenceTypes;
    if (!this.data.oldData) {
      this.referenceFormControl.setValue(this.possibleReferenceTypes[0]);
    } else {
      let oldBuildData = this.data.oldData.refBuildData;
      if (this.possibleReferenceTypes.find((ref) => {
        return ref.name == oldBuildData.name
      })) {
        let index = this.possibleReferenceTypes.findIndex((ref) => {
          return ref.name == oldBuildData.name
        });
        this.referenceFormControl.setValue(this.possibleReferenceTypes[index]);
      }
    }
    this.generateFormIOJSON(this.referenceFormControl.value)
  }

  onSubmit(submission: any) {
    this.dialogRef.close({
      submissionData: submission,
      referenceData: this.referenceFormControl.value
    })
  }

  onChange(change: any) {
    this.dataSave = change.data;
  }

  ready(event: any) {
  }

}
