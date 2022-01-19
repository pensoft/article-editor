import { uuidv4 } from "lib0/random";
import { articleSection, editorData, editorMeta } from "./interfaces/articleSection";
import { formIODefaultValues, formIOTemplates, htmlNodeTemplates } from "./section-templates";

import { complexSectionFormIoSchema } from '@app/editor/utils/section-templates/form-io-json/complexSection';
import { ViewPlugin } from "@codemirror/view";
export function editorFactory(data?: editorMeta): editorData {
  return { editorId: uuidv4(), menuType: 'fullMenu', editorMeta: data }
}


export const articleBasicStructure: articleSection[] = [
  {
    title: { label: 'Taxonomic coverage', name: 'Taxonomic coverage', template: 'Taxonomic coverage', editable: true },  //titleContent -   title that will be displayed on the data tree ||  contentData title that will be displayed in the editor
    sectionID: uuidv4(),
    active: false,
    edit: { bool: true, main: true },
    add: { bool: true, main: false },
    delete: { bool: true, main: false },
    mode: 'documentMode',
    formIOSchema: formIOTemplates['taxonomicCoverage'],
    defaultFormIOValues: formIODefaultValues['taxonomicCoverage'],
    prosemirrorHTMLNodesTempl: htmlNodeTemplates['taxonomicCoverage'],
    children: [],
    type: 'simple',
    sectionTypeID: 1,
    sectionMeta: { main: false }
  },
  {
    title: { label: 'Collection Data', name: 'Collection Data', template: 'Collection Data', editable: true },  //titleContent -   title that will be displayed on the data tree ||  contentData title that will be displayed in the editor
    sectionID: uuidv4(),
    active: false,
    edit: { bool: true, main: true },
    add: { bool: true, main: false },
    delete: { bool: true, main: false },
    mode: 'documentMode',
    formIOSchema: formIOTemplates['collectionData'],
    defaultFormIOValues: formIODefaultValues['collectionData'],
    prosemirrorHTMLNodesTempl: htmlNodeTemplates['collectionData'],
    children: [],
    type: 'simple',
    sectionTypeID: 2,
    sectionMeta: { main: false }
  }];

export const renderSectionFunc: (sectionFromBackend: any, parentContainer: articleSection[], index?: number | string) => articleSection
  = (sectionFromBackend: any, parentContainer: articleSection[], index?: number | string) => {
    let children: any[] = []
    if (sectionFromBackend.type == 1) {
      sectionFromBackend.schema.forEach((childSection: any) => {
        renderSectionFunc(childSection, children)
      })
    }
    let newId = uuidv4()
    let newArticleSection: articleSection

    if (sectionFromBackend.type == 0) {
      newArticleSection = {
        title: { label: sectionFromBackend.label, name: sectionFromBackend.name, template: sectionFromBackend.label, editable: !/{{\s*\S*\s*}}/gm.test(sectionFromBackend.label) },  //titleContent -   title that will be displayed on the data tree ||  contentData title that will be displayed in the editor
        sectionID: newId,
        active: false,
        edit: { bool: true, main: true },
        add: { bool: true, main: false },
        delete: { bool: true, main: false },
        mode: 'documentMode',
        formIOSchema: sectionFromBackend.schema[0],
        defaultFormIOValues: undefined,
        prosemirrorHTMLNodesTempl: sectionFromBackend.template,
        children: children,
        type: sectionFromBackend.type == 1 ? 'complex' : 'simple',
        sectionTypeID: sectionFromBackend.id,
        sectionMeta: { main: false }
      }
    } else if (sectionFromBackend.type == 1) {
      newArticleSection = {
        title: { label: sectionFromBackend.label, name: sectionFromBackend.name, template: sectionFromBackend.label, editable: !/{{\s*\S*\s*}}/gm.test(sectionFromBackend.label) },  //titleContent -   title that will be displayed on the data tree ||  contentData title that will be displayed in the editor
        sectionID: newId,
        active: false,
        edit: { bool: true, main: true },
        add: { bool: true, main: false },
        delete: { bool: true, main: false },
        mode: 'documentMode',
        formIOSchema: complexSectionFormIoSchema,
        defaultFormIOValues: undefined,
        prosemirrorHTMLNodesTempl: sectionFromBackend.template,
        children: children,
        type: sectionFromBackend.type == 1 ? 'complex' : 'simple',
        sectionTypeID: sectionFromBackend.id,
        sectionMeta: { main: false },
        compatibility: sectionFromBackend.compatibility ? sectionFromBackend.compatibility : undefined
      }
    }

    filterSectionChildren(newArticleSection!);

    if (typeof index == 'number') {

      parentContainer.splice(index, 0, newArticleSection!);

    } else {
      if (index == 'end') {
        parentContainer.push(newArticleSection!)
      }
    }
    if (!index) {
      parentContainer.unshift(newArticleSection!);
    }
    return newArticleSection!
  }


export const checkCompatibilitySection = (compatibility: any, section: articleSection) => {

  if(!compatibility){
    return true
  }
  if (compatibility.allow.all) {
    return true
  } else if (!compatibility.allow.all&&compatibility.allow.values.includes(section.sectionTypeID)) {
      return true
  } else if (compatibility.deny.all) {
    return false;
  } else if (!compatibility.deny.all&&compatibility.deny.values.includes(section.sectionTypeID)) {
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
  if(compatibility){
    return data.filter((el:any)=>{
      let r = checkCompatibilitySectionFromBackend(compatibility, el);
      return r
    });
  }else{
    return data
  }
}


export const filterSectionChildren = (section: articleSection) => {
  if (section!.type == 'complex' && section!.compatibility && section.children.length > 0) {

    section.children = section.children.filter((el) => { return checkCompatibilitySection(section.compatibility, el) })
  } else {
    console.error(`ection!.type == 'complex' && section!.compatibility&&section.children.length>0 not true`);
  }
}

export const countSectionFromBackendLevel = (section:any)=>{
  let level = 0;
  let count = (section:any,l:number) => {
    if(l>level){
      level = l
    }
    if(section.type == 1&&section.schema.length>0){
      section.schema.forEach((child:any)=>{
        count(child,l+1);
      })
    }
  }
  count(section,0);
  return level;
}
