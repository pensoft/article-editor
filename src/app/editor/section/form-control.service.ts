import { Injectable } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { articleSection } from '../utils/interfaces/articleSection';

@Injectable({
  providedIn: 'root'
})
export class FormControlService {

  formGroups: { [key: string]: FormGroup } = {}; // form groups for every rendered (active) section

  popUpSectionConteiners: { [key: string]: HTMLDivElement } = {}

  groupsAreRendered = false;

  constructor() { }

  initFormControls(articleSectionsStructure: articleSection[]) {  // called from the ydocService after the ydoc is initialized
    
    if (this.groupsAreRendered) {
      return
    }

    let iterateSectionsRecursively = (sectionArray: articleSection[]) => { // iterate trough the sectons articleSectionsStructure
      sectionArray.forEach((section) => {
        if (section.children.length > 0) {
          iterateSectionsRecursively(section.children);
        }
      })
    }

    iterateSectionsRecursively(articleSectionsStructure)


    //   let renderControlsRecursivly = (iterateArr: any) => { // iterate trough the formIo component in the formIO schema
    //     iterateArr.forEach((componentObj: any) => {
    //       if (componentObj) {

    //       }
    //     })
    //   }

    this.groupsAreRendered = true;
  }

  getFormGroupBySectionId = (section: articleSection) => {
    return this.formGroups[section.sectionID]
  }

  setFormGroupBySectionId = (sectionID: string, group: FormGroup) => {
    this.formGroups[sectionID] = group;
  }

  getFormField = (sectionID: string, formFieldKey: string) => {
    if (!this.formGroups[sectionID]) {
      console.error(`Could not find formGroup with sectionID "${sectionID}"`);
    }
    if (!this.formGroups[sectionID].controls[formFieldKey]) {
      console.error(`Could not find field with key "${formFieldKey}" in formGroup with sectionID "${sectionID}"`);
    }
    return this.formGroups[sectionID].controls[formFieldKey];
  }

}
