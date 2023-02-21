import {uuidv4} from "lib0/random";
import {articleSection, editorData, editorMeta} from "./interfaces/articleSection";
import {formIODefaultValues, formIOTemplates, htmlNodeTemplates} from "./section-templates";

import * as Y from 'yjs'
import {taxonTreatmentSection} from "@core/services/custom_sections/taxon_treatment_section";
import {taxonSection} from "@core/services/custom_sections/taxon";
import {material} from "@core/services/custom_sections/material";
import { parseSecFormIOJSONMenuAndSchemaDefs, parseSecHTMLMenuAndSchemaDefs } from "./fieldsMenusAndScemasFns";

export function editorFactory(data?: editorMeta): editorData {
  return {editorId: uuidv4(), menuType: 'fullMenu', editorMeta: data}
}

export function isValidNumber (num) {
  return typeof num === 'number' && !isNaN(num);
  }

export const articleBasicStructure: articleSection[] = [
  {
    title: {label: 'Taxonomic coverage', name: 'Taxonomic coverage', template: 'Taxonomic coverage', editable: true},  //titleContent -   title that will be displayed on the data tree ||  contentData title that will be displayed in the editor
    sectionID: uuidv4(),
    active: false,
    edit: {active: true, main: true},
    add: {active: true, main: false},
    delete: {active: true, main: false},
    mode: 'documentMode',
    formIOSchema: formIOTemplates['taxonomicCoverage'],
    defaultFormIOValues: formIODefaultValues['taxonomicCoverage'],
    prosemirrorHTMLNodesTempl: htmlNodeTemplates['taxonomicCoverage'],
    children: [],
    type: 'simple',
    sectionIdFromBackend: 0,
      menusAndSchemasDefs:{menus:{},schemas:{}},
      sectionTypeVersion: 1,
    sectionTypeID: 1,
    pivotId:-1,
    sectionMeta: {main: false},
    customSchema:{isCustom:false}
  },
  {
    title: {label: 'Collection Data', name: 'Collection Data', template: 'Collection Data', editable: true},  //titleContent -   title that will be displayed on the data tree ||  contentData title that will be displayed in the editor
    sectionID: uuidv4(),
    active: false,
    edit: {active: true, main: true},
    add: {active: true, main: false},
    delete: {active: true, main: false},
    mode: 'documentMode',
    pivotId:-2,
    sectionIdFromBackend: 0,
    formIOSchema: formIOTemplates['collectionData'],
    defaultFormIOValues: formIODefaultValues['collectionData'],
    prosemirrorHTMLNodesTempl: htmlNodeTemplates['collectionData'],
    children: [],
    menusAndSchemasDefs:{menus:{},schemas:{}},
    type: 'simple',
    sectionTypeID: 2,
    sectionTypeVersion: 1,
    sectionMeta: {main: false},
    customSchema:{isCustom:false}
  }];

export const customSectionEnums = {
  Taxon: taxonSection
}

export const renderSectionFunc:
  /*  */(sectionFromBackend: any, parentContainer: articleSection[], ydoc: Y.Doc, index?: number | string) => articleSection
  = /**/(sectionFromBackend: any, parentContainer: articleSection[], ydoc: Y.Doc, index?: number | string) => {
    let sectionTemplateRaw = sectionFromBackend.template || taxonTreatmentSection.template;
    let {sectionMenusAndSchemaHTMLDefs,sectionTemplate} = parseSecHTMLMenuAndSchemaDefs(sectionTemplateRaw,{menusL:"customSectionHTMLMenuType",tagsL:"customSectionHTMLAllowedTags"});
    let sectionJSON;
    if(sectionFromBackend.type == 0 || sectionFromBackend.type == 1){
      sectionJSON = sectionFromBackend.schema;
    }else if(sectionFromBackend.type == 2){
      sectionJSON = sectionFromBackend.schema?.schema ? sectionFromBackend.schema?.schema : taxonTreatmentSection.schema;
    }
    let {sectionMenusAndSchemaDefsFromJSON,formIOJSON,sectionMenusAndSchemasDefsfromJSONByfieldsTags} = parseSecFormIOJSONMenuAndSchemaDefs(sectionJSON,{menusL:"customSectionJSONMenuType",tagsL:'customSectionJSONAllowedTags'});

    let sectionMenusAndSchemaDefs = {
      menus:{...sectionMenusAndSchemaHTMLDefs.menus,...sectionMenusAndSchemaDefsFromJSON.menus},
      schemas:{...sectionMenusAndSchemaHTMLDefs.schemas,...sectionMenusAndSchemaDefsFromJSON.schemas},
    }
    let deepIterator = (target, override) => {
    if (typeof target === 'object') {
      if(target.sections) {
        target.sections.forEach(child => {
          child.override = override;
          deepIterator(child, JSON.parse(JSON.stringify(override)));
        })
      }
      // for (const key in target) {
      //   deepIterator(target[key]);
      // }
    }
  }
  let children: any[] = []
  if (sectionFromBackend.type == 1) {
    sectionFromBackend.sections.forEach((childSection: any, indexOfChild: number) => {
      childSection.settings = sectionFromBackend.complex_section_settings[indexOfChild]
      if(childSection.name != 'Citable Elements Schemas'){
        renderSectionFunc(childSection, children, ydoc)
      }
    })
  }

  if (sectionFromBackend.type == 2) {
    sectionFromBackend.schema.sections.forEach((child: any, indexOfChild: number) => {
      const childSection = JSON.parse(JSON.stringify(customSectionEnums[child]));
      childSection.override = sectionFromBackend.schema.override;
      const props = Object.keys(sectionFromBackend.schema.override.categories).map(key => {
        return sectionFromBackend.schema.override.categories[key].entries.map(entry => {
          return entry.localName
        })
      }).flat();
      props.map(el => {
        material.schema.components.push({
          "label": el,
          "autoExpand": false,
          "tableView": true,
          "key": el,
          "type": "textarea",
          "input": true
        } as any)
      })
      deepIterator(childSection, JSON.parse(JSON.stringify(sectionFromBackend.schema.override)));
      // childSection.settings = sectionFromBackend.complex_section_settings[indexOfChild]
      renderSectionFunc(childSection, children, ydoc)
    })
  }
  let newId = uuidv4()
  let newArticleSection: articleSection

  let sectionLabel = (sectionFromBackend.settings && sectionFromBackend.settings.label && sectionFromBackend.settings.label != "") ? sectionFromBackend.settings.label : sectionFromBackend.label
  console.log('sectionFromBackend',sectionFromBackend);
  if (sectionFromBackend.type == 0) {
    newArticleSection = {
      title: {
        label: sectionLabel,
        name: sectionFromBackend.name,
        template: sectionLabel,
        editable: !sectionFromBackend.label_read_only && !/{{\s*\S*\s*}}/gm.test(sectionLabel)
      },  //titleContent -   title that will be displayed on the data tree ||  contentData title that will be displayed in the editor
      sectionID: newId,
      active: sectionFromBackend.active ? sectionFromBackend.active : false,
      edit: sectionFromBackend.edit || {active: true, main: true},
      add: sectionFromBackend.add || {active: true, main: false},
      delete: sectionFromBackend.delete || {active: true, main: false},
      addSubSection: sectionFromBackend.addSubSection ||  {active: false, main: false},
      mode: 'documentMode',
      pivotId:sectionFromBackend.pivot_id,
      menusAndSchemasDefs:sectionMenusAndSchemaDefs,
      initialRender: sectionFromBackend.initialRender ? sectionFromBackend.initialRender : undefined,
      formIOSchema: formIOJSON,
      defaultFormIOValues: sectionFromBackend.defaultFormIOValues ? sectionFromBackend.defaultFormIOValues : undefined,
      prosemirrorHTMLNodesTempl: sectionTemplate,
      children: children,
      sectionIdFromBackend: sectionFromBackend.id,
      type: 'simple',
      custom:sectionFromBackend.customSection?true:undefined,
      sectionTypeID: sectionFromBackend.id,
      sectionTypeVersion: sectionFromBackend.version,
      sectionMeta: {main: false},
      customSchema:{isCustom:false}
    }
    if(!sectionFromBackend.schema||!sectionFromBackend.schema.components||sectionFromBackend.schema.components.length == 0){
      newArticleSection.edit.active = false;
    }
  } else if (sectionFromBackend.type == 1) { // complex section
    newArticleSection = {
      title: {
        label: sectionLabel,
        name: sectionFromBackend.name,
        template: sectionLabel,
        editable: !sectionFromBackend.label_read_only &&  !/{{\s*\S*\s*}}/gm.test(sectionLabel)
      },  //titleContent -   title that will be displayed on the data tree ||  contentData title that will be displayed in the editor
      sectionID: newId,
      edit: sectionFromBackend.edit || {active: true, main: true},
      add: sectionFromBackend.add || {active: true, main: false},
      delete: sectionFromBackend.delete ||{active: true, main: false},
      addSubSection: sectionFromBackend.addSubSection ||{active: true, main: false},
      mode: 'documentMode',
      formIOSchema: formIOJSON,
      pivotId:sectionFromBackend.pivot_id,
      menusAndSchemasDefs:sectionMenusAndSchemaDefs,
      initialRender: sectionFromBackend.initialRender ? sectionFromBackend.initialRender : undefined,
      active: sectionFromBackend.active ? sectionFromBackend.active : false,
      defaultFormIOValues: sectionFromBackend.defaultFormIOValues ? sectionFromBackend.defaultFormIOValues : undefined,
      prosemirrorHTMLNodesTempl: sectionTemplate,
      children: children,
      type:  'complex' ,
      custom:sectionFromBackend.customSection?true:undefined,
      sectionIdFromBackend: sectionFromBackend.id,
      sectionTypeID: sectionFromBackend.id,
      sectionTypeVersion: sectionFromBackend.version,
      sectionMeta: {main: false},
      customSchema:{isCustom:false},
      compatibility: sectionFromBackend.compatibility ? sectionFromBackend.compatibility : undefined
    }
    if (sectionFromBackend.complex_section_settings) {
      let minmaxValds: any = {};
      sectionFromBackend.complex_section_settings.forEach((secMinMax: {
        "min_instances": number,
        "max_instances": number,
        "version_id": number,
        pivot_id:number,
        section_id:number,
        label:string,
        index:number
      }) => {
        minmaxValds[secMinMax.pivot_id] = {min: secMinMax.min_instances, max: secMinMax.max_instances};
      })
      newArticleSection.subsectionValidations = minmaxValds;
    }
    if(!sectionFromBackend.schema||!sectionFromBackend.schema.components||sectionFromBackend.schema.components.length == 0){
      newArticleSection.edit.active = false;
      newArticleSection.mode = 'noSchemaSectionMode';
    }
  } else if (sectionFromBackend.type == 2) {
    // newArticleSection = taxonTreatmentSection as any;
    // newArticleSection.title = {
    //   label: sectionLabel,
    //   name: sectionFromBackend.name,
    //   template: sectionLabel,
    //   editable: !/{{\s*\S*\s*}}/gm.test(sectionLabel)
    // };
    newArticleSection = {
      title: {
        label: sectionLabel,
        name: sectionFromBackend.name,
        template: sectionLabel,
        editable: !taxonTreatmentSection.label_read_only && !/{{\s*\S*\s*}}/gm.test(sectionLabel)
      },  //titleContent -   title that will be displayed on the data tree ||  contentData title that will be displayed in the editor
      sectionID: newId,
      edit: {active: true, main: true},
      add: {active: false, main: false},
      delete: {active: true, main: false},
      menusAndSchemasDefs:sectionMenusAndSchemaDefs,
      addSubSection: {active: true, main: true},
      mode: 'documentMode',
      formIOSchema: formIOJSON,
      pivotId:sectionFromBackend.pivot_id,
      initialRender: sectionFromBackend.initialRender ? sectionFromBackend.initialRender : (taxonTreatmentSection['initialRender'] ? taxonTreatmentSection['initialRender'] : (undefined)),
      active: sectionFromBackend.active ? sectionFromBackend.active : false,
      defaultFormIOValues: sectionFromBackend.defaultFormIOValues ? sectionFromBackend.defaultFormIOValues : undefined,
      prosemirrorHTMLNodesTempl: sectionTemplate,
      children: children,
      override: sectionFromBackend.schema.override,
      type: 'complex',
      custom:true,
      sectionIdFromBackend: sectionFromBackend.id,
      sectionTypeID: sectionFromBackend.id,
      sectionTypeVersion: sectionFromBackend.version,
      sectionMeta: {main: false},
      customSchema:{isCustom:false},
      compatibility: taxonTreatmentSection.compatibility ? taxonTreatmentSection.compatibility : undefined
    }

    if (sectionFromBackend.complex_section_settings) {
      let minmaxValds: any = {};
      sectionFromBackend.complex_section_settings.forEach((secMinMax: {
        "min_instances": number,
        "max_instances": number,
        "version_id": number,
        pivot_id:number,
        section_id:number,
        label:string,
        index:number
      }) => {
        minmaxValds[secMinMax.pivot_id] = {min: secMinMax.min_instances, max: secMinMax.max_instances};
      })
      newArticleSection.subsectionValidations = minmaxValds;
    }
  }
  newArticleSection.sectionMenusAndSchemasDefsfromJSONByfieldsTags = sectionMenusAndSchemasDefsfromJSONByfieldsTags
  //@ts-ignore
  newArticleSection.initialRender = ydoc.guid
  //@ts-ignore
  newArticleSection.active = true;

  filterSectionChildren(newArticleSection!);

  if (typeof index == 'number') {

    parentContainer.splice(index, 0, newArticleSection!);

  } else {
    if (index == 'end') {
      parentContainer.push(newArticleSection!)
    }
  }
  if (!index && index !== 0) {
    parentContainer.push(newArticleSection!);
  }
  return newArticleSection!
}

export const checkIfSectionsAreUnderOrAtMin = (childToCheck: articleSection, parentNode: articleSection, container?: articleSection[]) => {
  let v = parentNode.subsectionValidations
  if (v && Object.keys(v).length > 0) {
    let nodeID = childToCheck.pivotId;
    if (isValidNumber(nodeID)&&v[nodeID]) {
      let nOfNodesOfSameType = 0;
      (container ? container : parentNode.children).forEach((child: articleSection) => {
        if (child.pivotId == nodeID) {
          nOfNodesOfSameType++;
        }
      })
      if (v[nodeID].min >= nOfNodesOfSameType) {
        return false;
      }
    }
  }
  return true
}

export let getSubSecCountWithValidation = (complexSection: articleSection, validation: { secIdBackEnd: number }, complexSectionChildren?: articleSection[]) => {
  let count = 0;
  (complexSectionChildren ? complexSectionChildren : complexSection.children).forEach((child: articleSection) => {
    if (
      child.pivotId == validation.secIdBackEnd
    ) {
      count++
    }
  })
  return count;
}
export let filterSectionsFromBackendWithComplexMinMaxValidations = (sectionsFromBackend: any[], complexSection: articleSection, sectionChildren?: articleSection[]) => {
  return sectionsFromBackend.filter((section, index) => {
    let secIdFromBackend = section.pivot_id;
    if (
      complexSection.subsectionValidations &&
      complexSection.subsectionValidations[secIdFromBackend]
    ) {
      let min = complexSection.subsectionValidations[secIdFromBackend].min;
      let max = complexSection.subsectionValidations[secIdFromBackend].max;
      let count = getSubSecCountWithValidation(complexSection, {secIdBackEnd: secIdFromBackend}, sectionChildren)
      if (count >= max) {
        return false
      }
    }

    return true;
  })
}

export const checkIfSectionsAreAboveOrAtMax = (childToCheck: articleSection, parentNode: articleSection, container?: articleSection[]) => {
  let v = parentNode.subsectionValidations
  if (v && Object.keys(v).length > 0) {
    let secIDFromBackend = childToCheck.pivotId;
    if (isValidNumber(secIDFromBackend)&&v[secIDFromBackend]) {
      let nOfNodesOfSameType = 0;
      (container ? container : parentNode.children).forEach((child: articleSection) => {
        if (child.pivotId == secIDFromBackend) {
          nOfNodesOfSameType++;
        }
      })
      if (v[secIDFromBackend].max <= nOfNodesOfSameType) {
        return false;
      }
    }
  }
  return true
}

export const checkIfSectionsAreAboveOrAtMaxAtParentList = (listSections:articleSection[],sectionToCheck:articleSection,parentListRules?:{sectionName:string,min:number,max:number}[]) => {
  if(parentListRules && parentListRules.length > 0){
    let ruleForCurrSec = parentListRules.find((r)=>{
      return r.sectionName == sectionToCheck.title.name;
    })
    if(ruleForCurrSec){
      let count = 0;
      listSections.forEach((sec)=>{
        if(sec.title.name == ruleForCurrSec.sectionName){
          count++;
        }
      })
      if (ruleForCurrSec.max <= count) {
        return false;
      }
    }
  }
  return true;
}

export const checkIfSectionsAreAboveOrAtMaxAtParentListWithName = (listSections:articleSection[],sectionToCheckName:string,parentListRules?:{sectionName:string,min:number,max:number}[]) => {
  if(parentListRules && parentListRules.length > 0){
    let ruleForCurrSec = parentListRules.find((r)=>{
      return r.sectionName == sectionToCheckName;
    })
    if(ruleForCurrSec){
      let count = 0;
      listSections.forEach((sec)=>{
        if(sec.title.name == ruleForCurrSec.sectionName){
          count++;
        }
      })
      if (ruleForCurrSec.max <= count) {
        return false;
      }
    }
  }
  return true;
}

export const checkIfSectionsAreUnderOrAtMinAtParentList = (listSections:articleSection[],sectionToCheck:articleSection,parentListRules?:{sectionName:string,min:number,max:number}[]) => {
  if(parentListRules && parentListRules.length > 0){
    let ruleForCurrSec = parentListRules.find((r)=>{
      return r.sectionName == sectionToCheck.title.name;
    })
    if(ruleForCurrSec){
      let count = 0;
      listSections.forEach((sec)=>{
        if(sec.title.name == ruleForCurrSec.sectionName){
          count++;
        }
      })
      if (ruleForCurrSec.min >= count) {
        return false;
      }
    }
  }
  return true;
}

export const checkMinWhenMoovingASectionOut = (moovingNode: articleSection, outOfNode: articleSection) => {
  return checkIfSectionsAreUnderOrAtMin(moovingNode, outOfNode)
}

export const checkMaxWhenMoovingASectionIn = (moovingNode: articleSection, inNode: articleSection) => {
  return checkIfSectionsAreAboveOrAtMax(moovingNode, inNode);
}

export const checkCompatibilitySection = (compatibility: any, section: articleSection) => {

  if (!compatibility) {
    return true
  }
  if (compatibility.allow.all) {
    return true
  } else if (!compatibility.allow.all && compatibility.allow.values.includes(section.sectionTypeID)) {
    return true
  } else if (compatibility.deny.all) {
    return false;
  } else if (!compatibility.deny.all && compatibility.deny.values.includes(section.sectionTypeID)) {
    return false
  }
  return true;
}

export const checkCompatibilitySectionFromBackend = (compatibility: any, section: any) => {
  if (compatibility.allow.all) {
    return true
  } else if (!compatibility.allow.all && (compatibility.allow.values as number[]).includes(section.id)) {
    return true
  } else if (compatibility.deny.all) {
    return false;
  } else if (!compatibility.deny.all && compatibility.deny.values.includes(section.id)) {
    return false
  }
  return true;
}

export const filterChooseSectionsFromBackend = (compatibility: any, data: any) => {
  if (compatibility) {
    return data.filter((el: any) => {
      let r = checkCompatibilitySectionFromBackend(compatibility, el);
      return r
    });
  } else {
    return data
  }
}


export const filterSectionChildren = (section: articleSection) => {
  if (section!.type == 'complex' && section!.compatibility && section.children.length > 0) {
    section.children = section.children.filter((el) => {
      return checkCompatibilitySection(section.compatibility, el)
    })
  } else {
  }
}

export const countSectionFromBackendLevel = (section: any) => {
  let level = 0;
  let count = (section: any, l: number) => {
    if (l > level) {
      level = l
    }
    if (section.type == 1 && section.sections.length > 0) {
      section.sections.forEach((child: any) => {
        count(child, l + 1);
      })
    }
  }
  count(section, 0);
  return level;
}
