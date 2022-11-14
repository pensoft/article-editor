import {yDocToProsemirrorJSON} from "src/app/y-prosemirror-src/y-prosemirror.js"
import  {schema, PMDOMSerializer} from "../../utils/Schema/index"

export let getYdocData = function (ydoc) {

  let ydocData:any = {}
  let loopSection = (section, fn) => {
    fn(section);
    if (section.children && section.children.length > 0) {
      section.children.forEach((child) => {
        loopSection(child, fn);
      })
    }
  }
  let articleStructure = ydoc.getMap('articleStructure');
  let articleSectionsStructure = articleStructure.get('articleSectionsStructure')
  let articleSectionsStructureFlat = articleStructure.get('articleSectionsStructureFlat')
  ydocData.articleSectionsStructure = articleSectionsStructure
  ydocData.articleSectionsStructureFlat = articleSectionsStructureFlat

  let sectionFormGroupsStructures = ydoc.getMap('sectionFormGroupsStructures'); // ------------
  let sectionFromGroupsData = {}
  articleSectionsStructure.forEach((section) => {
    loopSection(section, (section) => {
      let sectionid = section.sectionID;
      let sectionFromGroupData = sectionFormGroupsStructures.get(sectionid);
      sectionFromGroupsData[sectionid] = sectionFromGroupData
    })
  })
  ydocData.sectionFromGroupsData = sectionFromGroupsData

  let sectionPMNodesJson = {}
  let sectionPMNodesDomEls = {}
  articleSectionsStructure.forEach((section) => {
    loopSection(section, (section) => {
      let sectionid = section.sectionID;
      let pmJson = yDocToProsemirrorJSON(ydoc, sectionid)
      let node = schema.nodeFromJSON(pmJson);
      let editorDom = document.createElement('div')
      editorDom.className = 'ProseMirror-example-setup-style';
      editorDom.setAttribute('section-name', section.title.name)
      //@ts-ignore
      node.content.content.forEach(ch => {
        let chdom = PMDOMSerializer.serializeNode(ch);
        editorDom.appendChild(chdom);
      })
      sectionPMNodesJson[sectionid] = pmJson
      sectionPMNodesDomEls[sectionid] = editorDom
    })
  })
  let endEditorJSON = yDocToProsemirrorJSON(ydoc, 'endEditor')
  let node = schema.nodeFromJSON(endEditorJSON);
  let editorDom = document.createElement('div')
  editorDom.className = 'ProseMirror-example-setup-style';
  editorDom.setAttribute('section-name', 'endEditor')
      //@ts-ignore
  node.content.content.forEach(ch => {
    let chdom = PMDOMSerializer.serializeNode(ch);
    editorDom.appendChild(chdom);
  })
  sectionPMNodesJson['endEditor'] = endEditorJSON
  sectionPMNodesDomEls['endEditor'] = editorDom
  ydocData.sectionPMNodesJson = sectionPMNodesJson
  ydocData.sectionPMNodesDomEls = sectionPMNodesDomEls;


  let figuresMap = ydoc.getMap('ArticleFiguresMap');// ------------
  let ArticleFigures = figuresMap.get('ArticleFigures')
  let articleCitatsObj = figuresMap.get('articleCitatsObj')
  let figuresTemplates = figuresMap.get('figuresTemplates')
  let ArticleFiguresNumbers = figuresMap.get('ArticleFiguresNumbers')
  ydocData.ArticleFigures = ArticleFigures
  ydocData.articleCitatsObj = articleCitatsObj
  ydocData.figuresTemplates = figuresTemplates
  ydocData.ArticleFiguresNumbers = ArticleFiguresNumbers

  let mathMap = ydoc.getMap('mathDataURLMap');// ------------
  let dataURLObj = mathMap.get('dataURLObj');
  ydocData.dataURLObj = dataURLObj

  let printMap = ydoc.getMap('print'); // ------------
  let pdfPrintSettings = printMap.get('pdfPrintSettings')
  ydocData.pdfPrintSettings = pdfPrintSettings

  let customSectionProps = ydoc.getMap('customSectionProps'); // ------------
  let customPropsObj = customSectionProps.get('customPropsObj');
  ydocData.customPropsObj = customPropsObj

  let referenceCitationsMap = ydoc.getMap('referenceCitationsMap');
  let references = referenceCitationsMap.get('references')
  let referencesInEditor = referenceCitationsMap.get('referencesInEditor')
  let externalRefs = referenceCitationsMap.get('externalRefs')
  let localRefs = referenceCitationsMap.get('localRefs')
  ydocData.references = references
  ydocData.referencesInEditor = referencesInEditor
  ydocData.externalRefs = externalRefs
  ydocData.localRefs = localRefs

  let trackChangesMetadata = ydoc.getMap('trackChangesMetadata'); // ------------
  let trackChangesMetadata1 = trackChangesMetadata.get('trackChangesMetadata')
  ydocData.trackChangesMetadata = trackChangesMetadata1

  let comments = ydoc.getMap('comments'); // ------------
  let articleComments:any = {}
  Array.from(comments.keys()).forEach((commentid:string) => {
    let comment = comments.get(commentid)
    if (comment) {
      articleComments[commentid] = comment
    }
  })
  ydocData.articleComments = articleComments;

  let collaborators = ydoc.getMap('articleCollaborators'); // ------------
  let collaborators1 = collaborators.get('collaborators')
  ydocData.collaborators = collaborators1;

  return ydocData
}
