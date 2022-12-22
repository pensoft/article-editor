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

/* export const removeInitProps: (section: articleSection) => void = (section: articleSection) => {
  if (section.type == 'complex' && section.children.length > 0) {
    section.children.forEach((child) => {
      removeInitProps(child)
    })
  }
  //section.initialRender = undefined;
} */

/* export const addInitProps:(section:articleSection,ydoc:Y.Doc)=>void = (section:articleSection,ydoc:Y.Doc)=>{
  if(section.type=='complex'&&section.children.length>0){
    section.children.forEach((child)=>{
      removeInitProps(child)
    })
  }
  section.initialRender = ydoc.guid;
} */

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
    sectionVersionId: 0,
      menusAndSchemasDefs:{menus:{},schemas:{}},
      sectionTypeVersion: 1,
    sectionTypeID: 1,
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
    sectionVersionId: 0,
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
    let {sectionMenusAndSchemaHTMLDefs,sectionTemplate} = parseSecHTMLMenuAndSchemaDefs(sectionTemplateRaw);
    let sectionJSON;
    if(sectionFromBackend.type == 0 || sectionFromBackend.type == 1){
      sectionJSON = sectionFromBackend.schema;
    }else if(sectionFromBackend.type == 2){
      sectionJSON = sectionFromBackend.schema?.schema ? sectionFromBackend.schema?.schema : taxonTreatmentSection.schema;
    }
    let {sectionMenusAndSchemaDefsFromJSON,formIOJSON,sectionMenusAndSchemasDefsfromJSONByfieldsTags} = parseSecFormIOJSONMenuAndSchemaDefs(sectionJSON);

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
      renderSectionFunc(childSection, children, ydoc)
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
      menusAndSchemasDefs:sectionMenusAndSchemaDefs,
      initialRender: sectionFromBackend.initialRender ? sectionFromBackend.initialRender : undefined,
      formIOSchema: formIOJSON,
      defaultFormIOValues: sectionFromBackend.defaultFormIOValues ? sectionFromBackend.defaultFormIOValues : undefined,
      prosemirrorHTMLNodesTempl: sectionTemplate,
      children: children,
      sectionVersionId: sectionFromBackend.version_id,
      type: 'simple',
      custom:sectionFromBackend.customSection?true:undefined,
      sectionTypeID: sectionFromBackend.id,
      sectionTypeVersion: sectionFromBackend.version,
      sectionMeta: {main: false},
      customSchema:{isCustom:false}
    }
  } else if (sectionFromBackend.type == 1) {
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
      addSubSection: sectionFromBackend.addSubSection ||{active: true, main: true},
      mode: 'documentMode',
      formIOSchema: formIOJSON,
      menusAndSchemasDefs:sectionMenusAndSchemaDefs,
      initialRender: sectionFromBackend.initialRender ? sectionFromBackend.initialRender : undefined,
      active: sectionFromBackend.active ? sectionFromBackend.active : false,
      defaultFormIOValues: sectionFromBackend.defaultFormIOValues ? sectionFromBackend.defaultFormIOValues : undefined,
      prosemirrorHTMLNodesTempl: sectionTemplate,
      children: children,
      type:  'complex' ,
      custom:sectionFromBackend.customSection?true:undefined,
      sectionVersionId: sectionFromBackend.version_id,
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
        "version_id": number
      }) => {
        minmaxValds[secMinMax.version_id] = {min: secMinMax.min_instances, max: secMinMax.max_instances};
      })
      newArticleSection.subsectionValidations = minmaxValds;
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
      initialRender: sectionFromBackend.initialRender ? sectionFromBackend.initialRender : (taxonTreatmentSection['initialRender'] ? taxonTreatmentSection['initialRender'] : (undefined)),
      active: sectionFromBackend.active ? sectionFromBackend.active : false,
      defaultFormIOValues: sectionFromBackend.defaultFormIOValues ? sectionFromBackend.defaultFormIOValues : undefined,
      prosemirrorHTMLNodesTempl: sectionTemplate,
      children: children,
      override: sectionFromBackend.schema.override,
      type: 'complex',
      custom:true,
      sectionVersionId: sectionFromBackend.version_id,
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
        "version_id": number
      }) => {
        minmaxValds[secMinMax.version_id] = {min: secMinMax.min_instances, max: secMinMax.max_instances};
      })
      newArticleSection.subsectionValidations = minmaxValds;
    }
  }
  newArticleSection.sectionMenusAndSchemasDefsfromJSONByfieldsTags = sectionMenusAndSchemasDefsfromJSONByfieldsTags
  let checkIfSecionHasCustomSchema = (secFromBackend:any,newMappedSection:articleSection)=>{
    if(secFromBackend.name == "Section with Schema1"){
      newMappedSection.customSchema.isCustom = true;
      newMappedSection.customSchema.schema = {
        nodes:[
          "doc",
          "form_field",
          "inline_block_container",
          "paragraph",
          "form_field_inline",
          "form_field_inline_view",
          "reference_citation",
          "reference_citation_end",
          "reference_container",
          "reference_block_container",
          "image",
          "video",
          "text",
          "blockquote",
          "horizontal_rule",
          "heading",
          "code_block",
          "hard_break",
          "page_break",
          "spacer",
          "math_inline",
          "math_display",
          "list_item",
          "bullet_list",
          "ordered_list"
      ],
        marks:[
          "math_select",
          "subscript",
          "superscript",
          "comment",
          "format_change",
          "insertion",
          "deletion",
          "delFromPopup",
          "insFromPopup",
          "link",
          "em",
          "strong",
          "code",
          "invalid",
          "anchorTag",
          "underline",
          "ychange"
      ]
      }
    }else if(secFromBackend.name == "Section with Schema2"){
      newMappedSection.customSchema.isCustom = true;
      newMappedSection.customSchema.schema = {
        nodes:[
          "doc",
          "form_field",
          "inline_block_container",
          "paragraph",
          "form_field_inline",
          "form_field_inline_view",
          "reference_citation",
          "reference_citation_end",
          "reference_container",
          "reference_block_container",
          "table",
          "table_row",
          "table_cell",
          "table_header",
          "image",
          "video",
          "block_figure",
          "figure_components_container",
          "figure_component",
          "figures_nodes_container",
          "figure_descriptions_container",
          "figure_component_description",
          "figure_description",
          "tables_nodes_container",
          "block_table",
          "table_header_container",
          "table_footer_container",
          "table_description",
          "table_content",
          "table_container",
          "text",
          "blockquote",
          "horizontal_rule",
          "heading",
          "code_block",
          "hard_break",
          "page_break",
          "spacer",
          "list_item",
          "bullet_list",
          "ordered_list"
      ],
        marks:[
          "math_select",
          "comment",
          "format_change",
          "insertion",
          "deletion",
          "delFromPopup",
          "insFromPopup",
          "table_citation",
          "citation",
          "link",
          "code",
          "invalid",
          "anchorTag",
          "underline",
          "ychange"
      ]
      }
    }
  }
  checkIfSecionHasCustomSchema(sectionFromBackend,newArticleSection)
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
    let nodeVersionID = childToCheck.sectionVersionId;
    if (v[nodeVersionID]) {
      let nOfNodesOfSameType = 0;
      (container ? container : parentNode.children).forEach((child: articleSection) => {
        if (child.sectionVersionId == nodeVersionID) {
          nOfNodesOfSameType++;
        }
      })
      if (v[nodeVersionID].min >= nOfNodesOfSameType) {
        return false;
      }
    }
  }
  return true
}

export let getSubSecCountWithValidation = (complexSection: articleSection, validation: { secVersionId: number }, complexSectionChildren?: articleSection[]) => {
  let count = 0;
  (complexSectionChildren ? complexSectionChildren : complexSection.children).forEach((child: articleSection) => {
    if (
      child.sectionVersionId == validation.secVersionId
    ) {
      count++
    }
  })
  return count;
}
export let filterSectionsFromBackendWithComplexMinMaxValidations = (sectionsFromBackend: any[], complexSection: articleSection, sectionChildren?: articleSection[]) => {
  return sectionsFromBackend.filter((section, index) => {
    let sectionVersionId = section.version_id;
    if (
      complexSection.subsectionValidations &&
      complexSection.subsectionValidations[sectionVersionId]
    ) {
      let min = complexSection.subsectionValidations[sectionVersionId].min;
      let max = complexSection.subsectionValidations[sectionVersionId].max;
      let count = getSubSecCountWithValidation(complexSection, {secVersionId: sectionVersionId}, sectionChildren)
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
    let secVersionId = childToCheck.sectionVersionId;
    if (v[secVersionId]) {
      let nOfNodesOfSameType = 0;
      (container ? container : parentNode.children).forEach((child: articleSection) => {
        if (child.sectionVersionId == secVersionId) {
          nOfNodesOfSameType++;
        }
      })
      if (v[secVersionId].max <= nOfNodesOfSameType) {
        return false;
      }
    }
  }
  return true
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
