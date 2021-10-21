import { uuidv4 } from "lib0/random";
import { articleSection, editorData, editorMeta } from "./interfaces/articleSection";
import { templates } from "./formIOJsonTemplates";
export function editorFactory(data?: editorMeta): editorData {
  return { editorId: uuidv4(), menuType: 'fullMenu', editorMeta: data }
}

export const articleBasicStructure: articleSection[] = [
  {
    title: { type: 'content', contentData: 'Title233', titleContent: 'Taxonomic coverage', key: 'titleContent' },  //titleContent -   title that will be displayed on the data tree ||  contentData title that will be displayed in the editor
    sectionContent: {
      type: 'TaxonTreatmentsMaterial', contentData: editorFactory(
        {
          prosemirrorJsonTemplate:
          {
            "type": "doc",
          }, formioJson: templates['TaxonTreatmentsMaterial']
        }), key: 'sectionContent'
    },
    sectionID: uuidv4(),
    active: false,
    edit: { bool: true, main: true },
    add: { bool: true, main: false },
    delete: { bool: true, main: false },
    mode: 'documentMode',
    sectionStartingFormIo: templates['TaxonTreatmentsMaterial'],
    children: [
      {
        title: { type: 'editorContentType', contentData: editorFactory({ placeHolder: 'Type Title here...' }), titleContent: 'Taxonomic subsection', key: 'titleContent' },
        sectionContent: { type: 'editorContentType', contentData: editorFactory({ placeHolder: 'examplePlaceHolder' }), key: 'sectionContent' },
        sectionID: uuidv4(),
        active: false, mode: 'documentMode',
        edit: { bool: true, main: true },
        add: { bool: true, main: false },
        delete: { bool: true, main: false },
        sectionStartingFormIo: templates['AdvancedTemplate'],
        children: [],
      }
    ],
  }, {
    title: { type: 'content', contentData: 'Title2', titleContent: 'Taxon treatment', key: 'titleContent' },
    sectionContent: {
      type: 'TaxonTreatmentsMaterial', contentData: editorFactory(
        {
          prosemirrorJsonTemplate:
          {
            "type": "doc",
          }, formioJson: templates['TaxonTreatmentsMaterial']
        }), key: 'sectionContent'
    },
    sectionID: uuidv4(),
    active: false,
    edit: { bool: true, main: true },
    add: { bool: true, main: false },
    delete: { bool: true, main: false },
    mode: 'documentMode',
    sectionStartingFormIo: templates['TaxonTreatmentsMaterial'],
    children: [
      {
        title: { type: 'editorContentType', contentData: editorFactory({ placeHolder: 'Type Title here...' }), titleContent: 'Taxon subsection', key: 'titleContent' },
        sectionContent: { type: 'editorContentType', contentData: editorFactory(/* {placeHolder:'examplePlaceHolder',label:'exampleLabel'} */), key: 'sectionContent' },
        sectionID: uuidv4(),
        active: false, mode: 'documentMode',
        edit: { bool: true, main: true },
        add: { bool: true, main: false },
        delete: { bool: true, main: false },
        sectionStartingFormIo: templates['AdvancedTemplate'],
        children: [],
      }
    ],
  }, {
    title: { type: 'content', contentData: 'Title2', titleContent: 'Discussion', key: 'titleContent' },
    sectionContent: { type: 'editorContentType', contentData: editorFactory(), key: 'sectionContent' },
    sectionID: uuidv4(),
    active: false,
    edit: { bool: true, main: true },
    add: { bool: true, main: false },
    delete: { bool: true, main: false },
    mode: 'documentMode',
    sectionStartingFormIo: templates['TaxonTreatmentsMaterial'],
    children: [
      {
        title: { type: 'editorContentType', contentData: editorFactory({ placeHolder: 'Type Title here...' }), titleContent: 'Discussion subsection', key: 'titleContent' },
        sectionContent: { type: 'editorContentType', contentData: editorFactory({ placeHolder: 'examplePlaceHolder' }), key: 'sectionContent' },
        sectionID: uuidv4(),
        active: false, mode: 'documentMode',
        edit: { bool: true, main: true },
        add: { bool: true, main: false },
        delete: { bool: true, main: false },
        sectionStartingFormIo: templates['AdvancedTemplate'],
        children: [],
      }
    ],
  }];