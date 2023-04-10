import {uuidv4} from "lib0/random";
import {articleSection, editorData, editorMeta} from "./interfaces/articleSection";
import {formIODefaultValues, formIOTemplates, htmlNodeTemplates} from "./section-templates";

import * as Y from 'yjs'
import {taxonTreatmentSection} from "@core/services/custom_sections/taxon_treatment_section";
import {taxonSection} from "@core/services/custom_sections/taxon";
import {material} from "@core/services/custom_sections/material";
import { parseSecFormIOJSONMenuAndSchemaDefs, parseSecHTMLMenuAndSchemaDefs } from "./fieldsMenusAndScemasFns";
import { mainSectionValidations } from "../services/ydoc.service";
import { ServiceShare } from "../services/service-share.service";

export interface sectionChooseData {
  id: number
  name: string
  secname: string
  version: number
  version_date: string
  pivot_id?: number
  source:'template'|'backend',
  template?:any
}

export function editorFactory(data?: editorMeta): editorData {
  return {editorId: uuidv4(), menuType: 'fullMenu', editorMeta: data}
}

export function isValidNumber (num) {
  return typeof num === 'number' && !isNaN(num);
  }


export const customSectionEnums = {
  Taxon: taxonSection
}

export const renderSectionFunc:
  /*  */(sectionFromBackend: any, parentContainer: articleSection[], ydoc: Y.Doc,serviceShare:ServiceShare, index?: number | string) => articleSection
  = /**/(sectionFromBackend: any, parentContainer: articleSection[], ydoc: Y.Doc,serviceShare:ServiceShare, index?: number | string) => {
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
      if(childSection.name != 'Figures'||childSection.name != 'References'||childSection.name != 'Tables'||childSection.name != 'SupplementaryMaterials'||childSection.name != 'Footnotes'){
        renderSectionFunc(childSection, children, ydoc,serviceShare)
      }
    })
  }

  if (sectionFromBackend.type == 2) {
    sectionFromBackend.schema.sections?sectionFromBackend.schema.sections.forEach((child: any, indexOfChild: number) => {
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
        renderSectionFunc(childSection, children, ydoc,serviceShare)
    }):undefined
  }
  let newId = uuidv4()
  let newArticleSection: articleSection

  let sectionLabel = (sectionFromBackend.settings && sectionFromBackend.settings.label && sectionFromBackend.settings.label != "") ? sectionFromBackend.settings.label : sectionFromBackend.label
  if (sectionFromBackend.type == 0) {
    newArticleSection = {
      title: {
        label: sectionLabel,
        name: sectionFromBackend.name,
        template: sectionLabel,
        editable: !sectionFromBackend.label_read_only && !/{{\s*\S*\s*}}|<span(\[innerHTML]="[\S]+"|[^>])+>[^<]*<\/span>/gm.test(sectionLabel)
      },  //titleContent -   title that will be displayed on the data tree ||  contentData title that will be displayed in the editor
      sectionID: newId,
      active: sectionFromBackend.active ? sectionFromBackend.active : false,
      edit: sectionFromBackend.edit || {active: true, main: true},
      add: sectionFromBackend.add || {active: true, main: false},
      allow_compatibility:sectionFromBackend.allow_compatibility,
      compatibility_extended:sectionFromBackend.compatibility_extended,
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
      originalSectionTemplate:JSON.parse(JSON.stringify(sectionFromBackend)),
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
        editable: !sectionFromBackend.label_read_only &&  !/{{\s*\S*\s*}}|<span(\[innerHTML]="[\S]+"|[^>])+>[^<]*<\/span>/gm.test(sectionLabel)
      },  //titleContent -   title that will be displayed on the data tree ||  contentData title that will be displayed in the editor
      sectionID: newId,
      edit: sectionFromBackend.edit || {active: true, main: true},
      add: sectionFromBackend.add || {active: true, main: false},
      delete: sectionFromBackend.delete ||{active: true, main: false},
      addSubSection: sectionFromBackend.addSubSection ||{active: true, main: false},
      mode: 'documentMode',
      formIOSchema: formIOJSON,
      pivotId:sectionFromBackend.pivot_id,
      allow_compatibility:sectionFromBackend.allow_compatibility,
      compatibility_extended:sectionFromBackend.compatibility_extended,
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
      originalSectionTemplate:JSON.parse(JSON.stringify(sectionFromBackend)),
      customSchema:{isCustom:false},
      compatibility: sectionFromBackend.compatibility ? sectionFromBackend.compatibility : undefined,
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
        editable: !taxonTreatmentSection.label_read_only && !/{{\s*\S*\s*}}|<span(\[innerHTML]="[\S]+"|[^>])+>[^<]*<\/span>/gm.test(sectionLabel)
      },  //titleContent -   title that will be displayed on the data tree ||  contentData title that will be displayed in the editor
      sectionID: newId,
      edit: {active: true, main: true},
      add: {active: false, main: false},
      delete: {active: true, main: false},
      menusAndSchemasDefs:sectionMenusAndSchemaDefs,
      addSubSection: {active: true, main: true},
      mode: (!sectionFromBackend.schema.schema||!sectionFromBackend.schema.schema.components||sectionFromBackend.schema.schema.components.length == 0)?'noSchemaSectionMode':'documentMode',
      formIOSchema: formIOJSON,
      pivotId:sectionFromBackend.pivot_id,
      allow_compatibility:sectionFromBackend.allow_compatibility,
      compatibility_extended:sectionFromBackend.compatibility_extended,
      initialRender: sectionFromBackend.initialRender ? sectionFromBackend.initialRender : (taxonTreatmentSection['initialRender'] ? taxonTreatmentSection['initialRender'] : (undefined)),
      active: sectionFromBackend.active ? sectionFromBackend.active : false,
      defaultFormIOValues: sectionFromBackend.defaultFormIOValues ? sectionFromBackend.defaultFormIOValues : undefined,
      prosemirrorHTMLNodesTempl: sectionTemplate,
      children: children,
      override: sectionFromBackend.schema.override,
      type: (sectionFromBackend.schema.sections&&sectionFromBackend.schema.sections.length>0)?'complex':'simple',
      custom:true,
      jats_tag:sectionFromBackend.schema.jats_tag?sectionFromBackend.schema.jats_tag:undefined,
      sectionIdFromBackend: sectionFromBackend.id,
      sectionTypeID: sectionFromBackend.id,
      sectionTypeVersion: sectionFromBackend.version,
      sectionMeta: {main: false},
      customSchema:{isCustom:false},
      originalSectionTemplate:JSON.parse(JSON.stringify(sectionFromBackend)),
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

export const willBeMoreThan4Levels:(currlevel:number,nodefromBackend:any)=>boolean = (currlevel,nodefromBackend)=>{
  let levelsSum = currlevel;
  let countLevels = (node,level)=>{
    if(level > levelsSum){
      levelsSum = level
    }
    if(node.sections && node.sections.length>0){
      node.sections.forEach((sec)=>{
        countLevels(sec,level+1)
      })
    }
  }
  countLevels(nodefromBackend,currlevel)
  return levelsSum>3
}

export const checkIfSectionsAreUnderOrAtMin = (childToCheck: articleSection, parentNode: articleSection, container?: articleSection[]) => {
  let v = parentNode.subsectionValidations
  if (v && Object.keys(v).length > 0) {
    let nodeID = childToCheck.pivotId
    let settingsPvID = childToCheck.originalSectionTemplate.settings.pivot_id
    if ((isValidNumber(nodeID)&&v[nodeID]) || (isValidNumber(settingsPvID)&&v[settingsPvID])) {
      let nOfNodesOfSameType = 0;
      ((container&&container.length>0) ? container : parentNode.children).forEach((child: articleSection) => {
        if (child.pivotId == nodeID) {
          nOfNodesOfSameType++;
        }
      })
      if (v[nodeID]?.min >= nOfNodesOfSameType ||  v[settingsPvID]?.min >= nOfNodesOfSameType) {
        return false;
      }
    }
  }
  return true
}

export let getSubSecCountWithValidation = (complexSection: articleSection, validation: { pivotid: number }, complexSectionChildren: articleSection[]) => {
  let count = 0;
  (complexSectionChildren ? complexSectionChildren : complexSection.children).forEach((child: articleSection) => {
    if (
      child.pivotId == validation.pivotid
    ) {
      count++
    }
  })
  return count;
}
export let filterSectionsFromBackendWithComplexMinMaxValidations = (sectionsFromBackend: any[], complexSection: articleSection, sectionChildren: articleSection[]) => {
  return sectionsFromBackend.filter((section, index) => {
    let pivotid = section.pivot_id
    if (
      complexSection.subsectionValidations &&
      complexSection.subsectionValidations[pivotid]
    ) {
      let min = complexSection.subsectionValidations[pivotid].min;
      let max = complexSection.subsectionValidations[pivotid].max;
      let count = getSubSecCountWithValidation(complexSection, {pivotid: pivotid}, sectionChildren)
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
    let pivotId = childToCheck.pivotId
    let settingsPvID = childToCheck.originalSectionTemplate.settings.pivot_id
    if ((isValidNumber(pivotId)&&v[pivotId]) || (isValidNumber(settingsPvID)&&v[settingsPvID])) {
      let nOfNodesOfSameType = 0;
      (container ? container : parentNode.children).forEach((child: articleSection) => {
        if (child.pivotId == pivotId) {
          nOfNodesOfSameType++;
        }
      })
      if (v[pivotId]?.max <= nOfNodesOfSameType ||  v[settingsPvID]?.max <= nOfNodesOfSameType) {
        return false;
      }
    }
  }
  return true
}

export const checkIfSectionsAreAboveOrAtMaxAtParentList = (listSections:articleSection[],sectionToCheck:articleSection,parentListRules:mainSectionValidations) => {
  if(parentListRules&&sectionToCheck.pivotId&&isValidNumber(sectionToCheck.pivotId)){
    let secPivotId = sectionToCheck.pivotId
    let ruleForCurrSec = parentListRules[secPivotId]
    if(ruleForCurrSec){
      let count = 0;
      listSections.forEach((sec)=>{
        if(sec.pivotId == secPivotId){
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

export const checkIfSectionsAreAboveOrAtMaxAtParentListWithName = (listSections:articleSection[],sectionFromBackend:any,parentListRules:mainSectionValidations) => {
  if(parentListRules && sectionFromBackend.pivot_id){
    let secPivotId = sectionFromBackend.pivot_id
    let ruleForCurrSec = parentListRules[secPivotId]
    if(ruleForCurrSec){
      let count = 0;
      listSections.forEach((sec)=>{
        if(sec.pivotId == secPivotId){
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

export const getFilteredSectionChooseData :(node:articleSection)=>sectionChooseData[]= (node) =>{
  let fullSectionChooseData = getAllAllowedNodesOnSection(node);

  let pivotIdsAtMax:number[] = []

  Object.keys(node.subsectionValidations).forEach((pivot_id)=>{
    let validation = node.subsectionValidations[pivot_id]
    let count = 0;
    node.children.forEach((child)=>{
      if(child.pivotId == +pivot_id){
        count++;
      }
    })
    if(count >= validation?.max){
      pivotIdsAtMax.push(+pivot_id);
    }

  })
  let filtered: sectionChooseData[] = fullSectionChooseData.filter(x=>{return (!x.pivot_id||!pivotIdsAtMax.includes(x.pivot_id))})
  return filtered
}

export const getAllAllowedNodesOnSection:(node:articleSection)=>sectionChooseData[] = (node)=>{
  let sectionsChooseData: sectionChooseData[] = []
  if(node.allow_compatibility&&node.compatibility_extended&&node.compatibility_extended.length>0){
    node.compatibility_extended.forEach((secdata)=>{
      sectionsChooseData.push({
        id: secdata.id,
        name: secdata.name,
        version: secdata.version,
        secname:secdata.name,
        version_date: secdata.version_date,
        source:'backend',
        pivot_id : undefined,
        template:undefined
      })
    })
  }
  let nodeInitialSections = node.originalSectionTemplate.sections
  if(nodeInitialSections&&nodeInitialSections.length>0){
    nodeInitialSections.forEach((sec)=>{
      sectionsChooseData.push({
        id: sec.id,
        name: (sec.settings && sec.settings.label && sec.settings.label.length>0)?sec.settings.label:sec.name,
        version: sec.version,
        version_date: sec.version_date,
        secname:sec.name,
        source:'template',
        pivot_id : sec.pivot_id,
        template:sec
      })
    })
  }
  return sectionsChooseData
}

export const checkIfSectionsAreUnderOrAtMinAtParentList = (listSections:articleSection[],sectionToCheck:articleSection,parentListRules:mainSectionValidations) => {
  if(parentListRules && sectionToCheck.pivotId){
    let secPivotId = sectionToCheck.pivotId
    let ruleForCurrSec = parentListRules[secPivotId]
    if(ruleForCurrSec){
      let count = 0;
      listSections.forEach((sec)=>{
        if(sec.pivotId == secPivotId){
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
