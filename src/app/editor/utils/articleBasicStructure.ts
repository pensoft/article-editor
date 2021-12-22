import { uuidv4 } from "lib0/random";
import { articleSection, editorData, editorMeta } from "./interfaces/articleSection";
import { formIODefaultValues,formIOTemplates,htmlNodeTemplates } from "./section-templates";

export function editorFactory(data?: editorMeta): editorData {
  return { editorId: uuidv4(), menuType: 'fullMenu', editorMeta: data }
}


export const articleBasicStructure: articleSection[] = [
  {
    title: { type: 'content', contentData: 'Title233', titleContent: 'Taxonomic coverage', key: 'titleContent' },  //titleContent -   title that will be displayed on the data tree ||  contentData title that will be displayed in the editor
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
  },
  {
    title: { type: 'content', contentData: 'Title233', titleContent: 'Colection Data', key: 'titleContent' },  //titleContent -   title that will be displayed on the data tree ||  contentData title that will be displayed in the editor
    sectionID: uuidv4(),
    active: false,
    edit: { bool: true, main: true },
    add: { bool: true, main: false },
    delete: { bool: true, main: false },
    mode: 'documentMode',
    formIOSchema: formIOTemplates['collectionData'],
    defaultFormIOValues: formIODefaultValues['collectionData'],
    prosemirrorHTMLNodesTempl: htmlNodeTemplates['collectionData'],
    children: []
  }];
