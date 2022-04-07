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
  possibleReferenceTypes: reference[] = []

  constructor(
    public dialogRef: MatDialogRef<ReferenceEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private cahngeDetectorRef:ChangeDetectorRef
  ) {
  }

  generateFormIOJSON(type: reference) {
    this.formIOSchema = undefined;
    this.cahngeDetectorRef.detectChanges()
    console.log('refType',type);
    let forms = type.formFields;
    let newFormIOJSON: any = {
      "components": [

      ]
    }
    forms.forEach((form) => {
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
        if(form.required){
          if(!formTemplate.validate){
            formTemplate['validate'] = {}
          }
          formTemplate.validate.required = true;
        }
      }
      formTemplate.label = form.label;
      formTemplate.key = form.cslKey;

      newFormIOJSON.components.push(formTemplate)
    })
    newFormIOJSON.components.push({
      "type": "button",
      "label": "Submit",
      "key": "submit",
      "disableOnInvalid": true,
      "input": true,
      "tableView": false
    })
    setTimeout(()=>{
      this.formIOSchema = newFormIOJSON;
      this.cahngeDetectorRef.detectChanges();
    },100)

  }

  ngAfterViewInit(): void {
    this.possibleReferenceTypes = this.data.possibleReferenceTypes;
    this.referenceFormControl.registerOnChange(()=>{
      let value = this.referenceFormControl.value;
      if(value){
        this.generateFormIOJSON(value);
      }
    })
    if(!this.data.defaultData){
      this.referenceFormControl.setValue(this.possibleReferenceTypes[0]);
    }
  }

  onSubmit(submission: any) {
    this.dialogRef.close({
      submissionData:submission,
      referenceData:this.referenceFormControl.value
    })
  }

  onChange(change: any) {
  }

  ready(event: any) {
  }

}
