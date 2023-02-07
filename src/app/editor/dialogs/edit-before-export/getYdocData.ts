import {yDocToProsemirrorJSON} from "src/app/y-prosemirror-src/y-prosemirror.js"

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

  let sectionPMNodesJson:any = {}
  articleSectionsStructure.forEach((section) => {
    loopSection(section, (section) => {
      let sectionid = section.sectionID;
      let pmJson = yDocToProsemirrorJSON(ydoc, sectionid)
      sectionPMNodesJson[sectionid] = pmJson
    })
  })
  let endEditorJSON = yDocToProsemirrorJSON(ydoc, 'endEditor')
  sectionPMNodesJson['endEditor'] = endEditorJSON
  ydocData.sectionPMNodesJson = sectionPMNodesJson

  let supplementaryFilesMap = ydoc.getMap('supplementaryFilesMap');
  let supplementaryFiles = supplementaryFilesMap.get('supplementaryFiles');
  let supplementaryFilesTemplates = supplementaryFilesMap.get('supplementaryFilesTemplates');
  let supplementaryFilesNumbers = supplementaryFilesMap.get('supplementaryFilesNumbers');
  ydocData.supplementaryFiles = supplementaryFiles
  ydocData.supplementaryFilesTemplates = supplementaryFilesTemplates
  ydocData.supplementaryFilesNumbers = supplementaryFilesNumbers

  let endNotesMap = ydoc.getMap('endNotesMap');
  let endNotes = endNotesMap.get('endNotes');
  let endNotesNumbers = endNotesMap.get('endNotesNumbers');
  let endNotesTemplates = endNotesMap.get('endNotesTemplates');
  ydocData.endNotes = endNotes
  ydocData.endNotesNumbers = endNotesNumbers
  ydocData.endNotesTemplates = endNotesTemplates

  let figuresMap = ydoc.getMap('ArticleFiguresMap');// ------------
  let ArticleFigures = figuresMap.get('ArticleFigures')
  let articleCitatsObj = figuresMap.get('articleCitatsObj')
  let figuresTemplates = figuresMap.get('figuresTemplates')
  let ArticleFiguresNumbers = figuresMap.get('ArticleFiguresNumbers')
  ydocData.ArticleFigures = ArticleFigures
  ydocData.articleCitatsObj = articleCitatsObj
  ydocData.figuresTemplates = figuresTemplates
  ydocData.ArticleFiguresNumbers = ArticleFiguresNumbers

  let citableElementsMap = ydoc.getMap('citableElementsMap');// ------------
  let elementsCitations = citableElementsMap.get('elementsCitations');
  ydocData.elementsCitations = elementsCitations

  let ArticleTablesMap = ydoc.getMap('ArticleTablesMap');// ------------
  let ArticleTablesNumbers = ArticleTablesMap.get('ArticleTablesNumbers')
  let tablesTemplates = ArticleTablesMap.get('tablesTemplates')
  let ArticleTables = ArticleTablesMap.get('ArticleTables')
  ydocData.ArticleTablesNumbers = ArticleTablesNumbers
  ydocData.tablesTemplates = tablesTemplates
  ydocData.ArticleTables = ArticleTables

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
  Array.from(comments.keys()).forEach((commentid:any) => {
    let comment = comments.get(commentid)
    if (comment) {
      articleComments[commentid] = comment
    }
  })
  ydocData.articleComments = articleComments;

  let collaboratorsMap = ydoc.getMap('articleCollaborators'); // ------------
  let collaborators = collaboratorsMap.get('collaborators').collaborators
  let authors = collaboratorsMap.get('authorsList');
  ydocData.collaborators = collaborators;
  ydocData.authors = authors;

  return ydocData
}
