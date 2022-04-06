import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { basicJournalArticleData, jsonSchemaForCSL, possibleReferenceTypes, exampleCitation, pensoftStyle, lang as langData, reference, formioAuthorsDataGrid, formIOTextFieldTemplate } from './data/data';
import { SelectReferenceComponent } from './select-reference/select-reference.component';
//@ts-ignore
import { CSL } from './data/citeproc.js'
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDrawer } from '@angular/material/sidenav';
let citeprocSys = {
  // Given a language tag in RFC-4646 form, this method retrieves the
  // locale definition file.  This method must return a valid *serialized*
  // CSL locale. (In other words, an blob of XML as an unparsed string.  The
  // processor will fail on a native XML object or buffer).
  retrieveLocale: (lang: any) => {
    /* xhr.open('GET', 'locales-' + lang + '.xml', false);
    xhr.send(null); */
    return langData;
  },

  // Given an identifier, this retrieves one citation item.  This method
  // must return a valid CSL-JSON object.
  retrieveItem: (id: any) => {
    return basicJournalArticleData;
  }
};
@Component({
  selector: 'app-library',
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.scss']
})
export class LibraryPage implements OnInit {

  referenceForms: FormGroup = new FormGroup({})
  formIOSchema: any = undefined;
  editingReference = false;
  creatingReference = false;
  citeproc: any
  userReferences: reference[] = []
  referenceFormControl = new FormControl(null, [Validators.required]);

  constructor(public dialog: MatDialog) {
    this.citeproc = new CSL.Engine(citeprocSys, pensoftStyle);
    var citationStrings = this.citeproc.processCitationCluster(exampleCitation[0], exampleCitation[1], [])[1];
  }
  possibleReferenceTypes: any[] = possibleReferenceTypes



  createReference(): void {
    const dialogRef = this.dialog.open(SelectReferenceComponent, {
      data: { possibleReferenceTypes: this.possibleReferenceTypes }
    });

    dialogRef.afterClosed().subscribe((result: reference) => {
      if (result) {
        this.creatingReference = true;
        this.stopEditingIfTrue();
        this.referenceFormControl.setValue(result);
        this.generateFormIOJSON(result)
      }
    });
  }

  generateFormIOJSON(type: reference) {
    console.log(type);
    let forms = type.formFields;
    let newFormIOJSON: any = {
      "components": [

      ]
    }
    forms.forEach((form) => {
      let formTemplate: any
      if (form.cslKey == 'authors' || form.cslKey == 'editor') {
        formTemplate = JSON.parse(JSON.stringify(formioAuthorsDataGrid));
        let loopAndChangeConditions = (obj:any)=>{
          debugger
          if(obj['conditional']){
            obj['conditional'].when = obj['conditional'].when.replace(formTemplate.key,form.cslKey)
          }
          if(obj instanceof Array){
            obj.forEach((el:any)=>{
              loopAndChangeConditions(el);
            })
          }else if(typeof obj == 'object'&&Object.keys(obj).length>0){
            Object.keys(obj).forEach((key)=>{
              let el = obj[key];
              if(el){
                loopAndChangeConditions(el);
              }
            })
          }
        }
        loopAndChangeConditions(formTemplate)
      } else {
        formTemplate = JSON.parse(JSON.stringify(formIOTextFieldTemplate));
      }
      formTemplate.label = form.label;
      formTemplate.key = form.cslKey;
      if (form.cslKey == 'authors' || form.cslKey == 'editor') {
        console.log(formTemplate);
      }
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
    console.log(newFormIOJSON);
    this.formIOSchema = newFormIOJSON
  }

  onSubmit(submision:any){
    console.log(submision);
  }

  onChange(change:any){
    console.log(change);
  }

  ready(event:any){
    console.log(event);
  }

  stopEditingIfTrue() {
    if (this.editingReference) {
      this.editingReference = false;
    }
  }

  ngOnInit(): void {
  }


}



