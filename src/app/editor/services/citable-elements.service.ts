import { Injectable } from '@angular/core';
import { uuidv4 } from 'lib0/random';
import { Fragment, Mark, Node, Schema } from 'prosemirror-model';
import { Transaction } from 'prosemirror-state';
import { citationShouldBeIgnored, getCitationIfAny } from '../utils/citableElementsHelpers';
import { articleSection } from '../utils/interfaces/articleSection';
import { ServiceShare } from './service-share.service';
import { DOMParser } from 'prosemirror-model';
import { Subject } from 'rxjs';
import { EditorView } from 'prosemirror-view';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { E } from '@angular/cdk/keycodes';
import { schema } from '../utils/Schema';
import { endNote } from '../utils/interfaces/endNotes';


export interface citations {
  [key: string]: { // section keys
    [key: string]: { // citations in section
      displayedViewsHere: any[],
      citedElementsIDs: string[], // cited elements ids of the type that this citation is
      position: number,
      citationType: string,
    }
  }
}

export let citationsPMNodeNames = ['table_citation', 'citation','supplementary_file_citation','end_note_citation']
export let citationsHTMLNodeNames = []
export let elementsTypes = ['figure', 'table','supplementary-file','end-note']
export let elTypeToCitMap = {
  'figure': 'citation',
  'table': 'table_citation',
  'supplementary-file':'supplementary_file_citation',
  'end-note':'end_note_citation'
}

// means that views of this type of element should stay only in the end editor
export let citableElementWithStaticViews = ['supplementary_file_citation','end_note_citation']

export let citationElementMap = {
  'supplementary_file_citation':{
    htmlTag: 'supplementary-file-citation',
    type: 'supplementary-file',
    yjsMap: 'supplementaryFilesMap',
    elementsObj: 'supplementaryFiles',
    elementNumberProp : 'supplementary_file_number',
    elementNumbersObj: 'supplementaryFilesNumbers',
    templatesObj: 'supplementaryFilesTemplates',
    elementCitations: 'citedSupplementaryFiles',
    containerNodeName: 'supplementary_files_nodes_container',
    contextMenuTxt:'supplementary file',
    contextMenuBoxWidth:'230px',
    contextMenuArrowPosition:{
      topright:{left:'208px'}
    },
    singleElTxt: ' Suppl. material ',
    multipleElTxt: ' Suppl. materials ',
    deletedElTxt: ' Cited item deleted ',
    getElsStrings: function (elementData) {
      let elStrings = '';
      elStrings = elStrings.concat(elementData.brief_description)
      return elStrings
    },
    setSectionData: function (elementData, sectionId, citeId) {
    },
    getElFormIOSubmission: function (elementData, citatID) {
      let serializedSupplementaryFileToFormIOsubmission: any = {}
      serializedSupplementaryFileToFormIOsubmission.supplementaryFileTitle = elementData.title
      serializedSupplementaryFileToFormIOsubmission.supplementaryFileAuthors = elementData.authors
      serializedSupplementaryFileToFormIOsubmission.supplementaryFileDataType = elementData.data_type
      serializedSupplementaryFileToFormIOsubmission.supplementaryFileBriefDescription = elementData.brief_description
      serializedSupplementaryFileToFormIOsubmission.supplementaryFileURL = elementData.url
      serializedSupplementaryFileToFormIOsubmission.supplementary_file_ID = elementData.supplementary_file_ID
      serializedSupplementaryFileToFormIOsubmission.supplementary_file_number = elementData.supplementary_file_number
      return serializedSupplementaryFileToFormIOsubmission;
    },
    getEndEditorPrefixNodes:function():Node[]{
      return [schema.nodes.heading.create({'contenteditableNode':false},schema.nodes.paragraph.create({'contenteditableNode':false},schema.text('Supplementary materials')))];
    },
    buildElementFormGroup: function (submision: any): FormGroup {
      let supplementaryFileFormGroup = new FormGroup({})
      let supplementaryFileTitle = new FormControl(submision.supplementaryFileTitle);
      let supplementaryFileAuthors = new FormControl(submision.supplementaryFileAuthors);
      let supplementaryFileDataType = new FormControl(submision.supplementaryFileDataType);
      let supplementaryFileBriefDescription = new FormControl(submision.supplementaryFileBriefDescription);
      let supplementaryFileURL = new FormControl(submision.supplementaryFileURL);
      supplementaryFileFormGroup.addControl('supplementaryFileTitle', supplementaryFileTitle);
      supplementaryFileFormGroup.addControl('supplementaryFileAuthors', supplementaryFileAuthors);
      supplementaryFileFormGroup.addControl('supplementaryFileDataType', supplementaryFileDataType);
      supplementaryFileFormGroup.addControl('supplementaryFileBriefDescription', supplementaryFileBriefDescription);
      supplementaryFileFormGroup.addControl('supplementaryFileURL', supplementaryFileURL);
      return supplementaryFileFormGroup
    }
  },
  'table_citation': {
    htmlTag: 'table-citation',
    type: 'table',
    yjsMap: 'tablesMap',
    elementsObj: 'ArticleTables',
    elementNumberProp : 'tableNumber',
    elementNumbersObj: 'ArticleTablesNumbers',
    templatesObj: 'tablesTemplates',
    containerNodeName: 'tables_nodes_container',
    contextMenuBoxWidth:'160px',
    contextMenuArrowPosition:{
      topright:{left:'143px'}
    },
    singleElTxt: ' Table ',
    contextMenuTxt:'tables',
    multipleElTxt: ' Tables. ',


    deletedElTxt: ' Cited item deleted ',
    getElsStrings: function (elementData) {
      let elStrings = '';
      elStrings = elStrings.concat(elementData.header)
      elStrings = elStrings.concat(elementData.content)
      elStrings = elStrings.concat(elementData.footer)
      return elStrings
    },
    setSectionData: function (elementData, sectionId, citeId) {
      elementData.viewed_by_citat = citeId;
      elementData.tablePlace = sectionId
    },
    getElFormIOSubmission: function (elementData, citatID) {
      let serializedTableToFormIOsubmission: any = {}
      serializedTableToFormIOsubmission.tableContent = elementData.content
      serializedTableToFormIOsubmission.tableHeader = elementData.header
      serializedTableToFormIOsubmission.tableFooter = elementData.footer
      serializedTableToFormIOsubmission.tableID = elementData.tableID
      serializedTableToFormIOsubmission.tableNumber = elementData.tableNumber
      serializedTableToFormIOsubmission.viewed_by_citat = citatID
      return serializedTableToFormIOsubmission;
    },
    getEndEditorPrefixNodes:function():Node[]{
      return [schema.nodes.heading.create({'contenteditableNode':false},schema.nodes.paragraph.create({'contenteditableNode':false},schema.text('Tables')))];
    },
    buildElementFormGroup: function (submision: any): FormGroup {
      let tableFormGroup = new FormGroup({})
      let tabCont = new FormControl(submision.tableContent);
      let tabHead = new FormControl(submision.tableHeader);
      let tabFoot = new FormControl(submision.tableFooter);
      tableFormGroup.addControl('tableContent', tabCont);
      tableFormGroup.addControl('tableHeader', tabHead);
      tableFormGroup.addControl('tableFooter', tabFoot);
      return tableFormGroup
    }
  },
  'citation': {
    htmlTag: 'citation',
    type: 'figure',
    containerNodeName: 'figures_nodes_container',
    yjsMap: 'figuresMap',
    elementsObj: 'ArticleFigures',
    elementNumberProp : 'figureNumber',
    elementNumbersObj: 'ArticleFiguresNumbers',
    templatesObj: 'figuresTemplates',
    contextMenuTxt:'figures',
    contextMenuArrowPosition:{
      topright:{left:'143px'}
    },
    contextMenuBoxWidth:'160px',
    singleElTxt: ' Fig. ',
    multipleElTxt: ' Figs. ',
    deletedElTxt: ' Cited item deleted ',
    getElsStrings: function (elementData) {
      let elStrings = '';
      elStrings = elStrings.concat(elementData.description);
      elementData.components.forEach((comp) => {
        elStrings = elStrings.concat(comp.description);
      })
      return elStrings
    },
    setSectionData: function (elementData, sectionId, citeId) {
      elementData.viewed_by_citat = citeId;
      elementData.figurePlace = sectionId
    },
    getElFormIOSubmission: function (elementData, citatID) {
      let serializedFigureToFormIOsubmission: any = {}
      serializedFigureToFormIOsubmission.figureComponents = elementData.components.reduce((prev: any[], curr: any, i: number) => {
        return prev.concat([{ container: curr }])
      }, [])
      serializedFigureToFormIOsubmission.figureDescription = elementData.description
      serializedFigureToFormIOsubmission.figureID = elementData.figureID
      serializedFigureToFormIOsubmission.figureNumber = elementData.figureNumber
      serializedFigureToFormIOsubmission.viewed_by_citat = citatID
      serializedFigureToFormIOsubmission.nOfColumns = elementData.canvasData.nOfColumns;
      return serializedFigureToFormIOsubmission
    },
    getEndEditorPrefixNodes:function():Node[]{
      return [schema.nodes.heading.create({'contenteditableNode':false},schema.nodes.paragraph.create({'contenteditableNode':false},schema.text('Figures')))];
    },
    buildElementFormGroup: function (submision: any): FormGroup {
      let figureFormGroup = new FormGroup({})
      let figDesc = new FormControl(submision.figureDescription);
      let formComponents: FormGroup[] = []
      submision.figureComponents.forEach((comp: any) => {
        let compFormGroup = new FormGroup({});
        let compDescription = new FormControl(comp.container.description);
        compFormGroup.addControl('figureComponentDescription', compDescription);
        formComponents.push(compFormGroup);
      })
      let figComponentArray = new FormArray(formComponents);
      figureFormGroup.addControl('figureDescription', figDesc);
      figureFormGroup.addControl('figureComponents', figComponentArray);
      return figureFormGroup
    }
  },
  'end_note_citation':{
    htmlTag: 'end-note-citation',
    type: 'end-note',
    yjsMap: 'endNotesMap',
    elementsObj: 'endNotes',
    contextMenuArrowPosition:{
      topright:{left:'162px'}
    },
    elementNumberProp : 'end_note_number',
    elementNumbersObj: 'endNotesNumbers',
    templatesObj: 'endNotesTemplates',
    elementCitations: 'endNotesCitations',
    contextMenuTxt:'end notes',
    contextMenuBoxWidth:'180px',
    containerNodeName: 'end_notes_nodes_container',
    singleElTxt: '*',
    multipleElTxt: '*',
    deletedElTxt: ' Cited item deleted ',
    getElsStrings: function (elementData:endNote) {
      let elStrings = '';
      elStrings = elStrings.concat(elementData.end_note)
      return elStrings
    },
    getCitationNode:function(citedEls:string[],attrs:any,citatedElements:any,edView:EditorView){
      let schema = edView.state.schema as Schema
      let citatMark = schema.mark('end_note_citation', { ...attrs, citated_elements: citatedElements, nonexistingtable: 'false' })
      let superscriptMark = schema.mark('superscript', { ...attrs, citated_elements: citatedElements, nonexistingtable: 'false' })
      let newNodePrefix = schema.text("*",[citatMark]) as Node;
      let newNodeCitedEls = schema.text(citedEls.join(', '),[citatMark/* ,superscriptMark */]) as Node;

      return Fragment.from([newNodePrefix,newNodeCitedEls])
    },
    setSectionData: function (elementData:endNote, sectionId, citeId) {
    },
    getElFormIOSubmission: function (elementData:endNote, citatID) {
      let serializedEndNoteToFormIOsubmission: any = {}
      serializedEndNoteToFormIOsubmission.endNote = elementData.end_note
      serializedEndNoteToFormIOsubmission.end_note_ID = elementData.end_note_ID
      serializedEndNoteToFormIOsubmission.end_note_number = elementData.end_note_number
      return serializedEndNoteToFormIOsubmission;
    },
    getEndEditorPrefixNodes:function():Node[]{
      return [schema.nodes.heading.create({'contenteditableNode':false},schema.nodes.paragraph.create({'contenteditableNode':false},schema.text('Endnotes')))];
    },
    buildElementFormGroup: function (submision: any): FormGroup {
      let endNoteFormGroup = new FormGroup({})
      let endNote = new FormControl(submision.endNote);
      endNoteFormGroup.addControl('endNote', endNote);
      return endNoteFormGroup
    }
  }
}
export let elementsContainersPMNodesNames = ['figures_nodes_container', 'tables_nodes_container','supplementary_files_nodes_container','end_notes_nodes_container']

@Injectable({
  providedIn: 'root'
})
export class CitableElementsService {

  rendered = 0;

  constructor(
    private serviceShare: ServiceShare
  ) {
    this.serviceShare.shareSelf('CitableElementsService', this)
  }

  getElementsTemplates() {
    let elementsTemplatesObj = {};
    citationsPMNodeNames.forEach((elcitatName) => {
      let elMapping = citationElementMap[elcitatName];
      let elTemplatesYjsMap = this.serviceShare.YdocService[elMapping.yjsMap].get(elMapping.templatesObj);
      elementsTemplatesObj[elMapping.type] = elTemplatesYjsMap;
    })
    return elementsTemplatesObj
  }

  getElementsNumbersObjs() {
    let elementsNumbersObjs: any = {};
    citationsPMNodeNames.forEach((citType) => {
      let elMap = citationElementMap[citType];
      let elementNumbers = this.serviceShare.YdocService[elMap.yjsMap].get(elMap.elementNumbersObj);
      elementsNumbersObjs[elMap.type] = elementNumbers;
    })
    return elementsNumbersObjs
  }

  updateCitatsText(citats: { [sectionID: string]: { [citatID: string]: any } | undefined }) {
    let elementsNumbersObjs = this.getElementsNumbersObjs()
    Object.keys(citats).forEach((sectionID) => {
      if (citats[sectionID]) {
        Object.keys(citats[sectionID]!).forEach((citatID) => {
          if (!this.serviceShare.ProsemirrorEditorsService.editorContainers[sectionID]) {
            //@ts-ignore
            citats[sectionID] = undefined
          } else {
            let edView = this.serviceShare.ProsemirrorEditorsService.editorContainers[sectionID].editorView;
            edView.state.doc.nodesBetween(0, edView.state.doc.nodeSize - 2, (node, pos, parent) => {
              let citatMark = getCitationIfAny(node);
              if (citatMark.length > 0) {
                let citationMark = citatMark[0];
                if (citationMark.attrs.citateid == citatID) {
                  let citatedElements = [...citationMark.attrs.citated_elements]
                  let citatedElementsCopy = [...citationMark.attrs.citated_elements];
                  let elementMaping = citationElementMap[citationMark.type.name];
                  let citatType = elementMaping.type;

                  let elementNumbers = elementsNumbersObjs[citatType];

                  let citElClearFromComponents: string[] = []
                  let citElsComponents: { [key: string]: string[] } = {}
                  citatedElements.forEach((el: String) => {
                    let data = el.split('|')
                    let elId = data[0]
                    if (data[1]) {
                      if (!citElsComponents[elId]) {
                        citElsComponents[elId] = []
                      }
                      citElsComponents[elId].push(data[1])
                    }
                    if (citElClearFromComponents.indexOf(elId) == -1) {
                      citElClearFromComponents.push(elId)
                    }
                  })
                  if (((citElClearFromComponents.length == 1 && elementNumbers?.indexOf(citElClearFromComponents[0]) == -1) ||
                    (citElClearFromComponents.length > 1 && citElClearFromComponents.filter((table) => { return elementNumbers?.indexOf(table) !== -1 }).length == 0))) {
                    if (citationMark.attrs.nonexistingelement !== 'true') {
                      let citateNodeText = elementMaping.deletedElTxt;
                      let newNode = (edView.state.schema as Schema).text(citateNodeText) as Node
                      newNode = newNode.mark([edView.state.schema.mark(citationMark.type.name, { ...citationMark.attrs, nonexistingelement: 'true' })])
                      edView.dispatch(edView.state.tr.replaceWith(pos,
                        pos + node.nodeSize
                        , newNode).setMeta('citatsTextChange', true)
                      )
                    }
                  } else {
                    citElClearFromComponents.forEach((elid) => {
                      if (elementNumbers?.indexOf(elid) == -1) {
                        citatedElements = citatedElements.filter((elIDS: string) => {
                          let data = elIDS.split('|')
                          if (data[0] == elid) {
                            return false
                          }
                          return true
                        })
                      }
                    })
                    citElClearFromComponents = citElClearFromComponents.filter((elId: string) => {
                      return elementNumbers.includes(elId);
                    })
                    let citatString = citElClearFromComponents.length == 1 ? elementMaping.singleElTxt : elementMaping.multipleElTxt
                    let elsArr: string[] = []
                    elementNumbers?.forEach((element, i) => {
                      if (citElClearFromComponents.indexOf(element) !== -1) {
                        if (citElsComponents[element]) {
                          citElsComponents[element].forEach((elComponent, j) => {
                            if (j == 0) {
                              elsArr.push(`${i + 1}${String.fromCharCode(97 + +elComponent)}`)
                            } else {
                              elsArr.push(`${String.fromCharCode(97 + +elComponent)}`)
                            }
                          })
                        } else {
                          elsArr.push(`${i + 1}`)
                        }
                      }
                    })
                    let newNode
                    if(elementMaping.getCitationNode){
                      newNode = elementMaping.getCitationNode(elsArr,citationMark.attrs,citatedElements,edView);
                    }else{
                      citatString += elsArr.join(', ')
                      citatString += ' '
                      newNode = (edView.state.schema as Schema).text(citatString) as Node
                      newNode = newNode.mark([edView.state.schema.mark(citationMark.type.name, { ...citationMark.attrs, citated_elements: citatedElements, nonexistingtable: 'false' })])
                    }
                    edView.dispatch(edView.state.tr.replaceWith(pos,
                      pos + node.nodeSize
                      , newNode).setMeta('citatsTextChange', true)
                    )
                  }
                }
              }
            })

          }
        })
      }
    })
  }

  getElementsCitations(dontIgnore?:true) {
    let citations: citations = {}
    let edCont = this.serviceShare.ProsemirrorEditorsService.editorContainers
    Object.keys(edCont).forEach((sectionid) => {
      let view = edCont[sectionid].editorView;
      if (!citations[sectionid]) {
        citations[sectionid] = {}
      }
      view.state.doc.nodesBetween(0, view.state.doc.nodeSize - 2, (node, pos, parent) => {
        let citationsMarks = getCitationIfAny(node)
        if (citationsMarks.length > 0) {
          let markResolvePos = view.state.doc.resolve(pos);
          //@ts-ignore
          let posPath = markResolvePos.path;

          let citationMark = citationsMarks[0];
          let citatedElements = [...citationMark.attrs.citated_elements]
          let citateid = citationMark.attrs.citateid
          if (!citationShouldBeIgnored(posPath)||dontIgnore) {
            let citationType = citationMark.type.name;
            citations[sectionid][citateid] = {
              displayedViewsHere: [],
              citedElementsIDs: citatedElements,
              position: pos,
              citationType: citationElementMap[citationType].type
            }
          }
        }
      })
    })
    this.serviceShare.ProsemirrorEditorsService.editorContainers
    return citations
  }

  getElementsObj() {
    let elementsObjs: any = {};
    citationsPMNodeNames.forEach((citType) => {
      let elMap = citationElementMap[citType];
      if(this.elementsFromPopupEdit[citType]){
        elementsObjs[elMap.type] = this.elementsFromPopupEdit[citType];
      }else{
        let elementObjs = this.serviceShare.YdocService[elMap.yjsMap].get(elMap.elementsObj);
        elementsObjs[elMap.type] = elementObjs;
      }
    })
    return elementsObjs
  }

  resetCountedRenderedViews() {
    this.rendered = 0;
  }

  /* countRenderedFigures() {
    this.rendered++;
    let allElements = 0;
    let elementObjs = this.getElementsObj()
    Object.values(elementObjs).forEach((elsObj) => {
      allElements += Object.keys(elsObj).length;
    })
    if (elementObjs == this.rendered) {
      this.allElsAreRendered()
    }
  } */

  allElsAreRendered() {
    setTimeout(() => {
      if (this.updatingElementsAndElementsCitations) {
        this.serviceShare.YjsHistoryService.stopCapturingUndoItem()
        this.updatingElementsAndElementsCitations = false;
      }
      if (this.updatingOnlyElementsView) {
        this.serviceShare.YjsHistoryService.stopCapturingUndoItem()
        this.updatingOnlyElementsView = false;
      }
      this.serviceShare.YjsHistoryService.stopBigNumberItemsCapturePrevention()
    }, 20)
  }

  getCitationsInElementsObj(elementObj) {
    let elTypes = Object.keys(elementObj);
    let elMaps = {}

    elTypes.forEach((type) => {
      let citationName = elTypeToCitMap[type];
      elMaps[type] = citationElementMap[citationName]
    })
    let citationsInElements = {} //

    elTypes.forEach((elType) => {
      let elementsOfType = elementObj[elType];
      let elementsIds = Object.keys(elementsOfType);
      citationsInElements[elType] = {}
      elementsIds.forEach((elId) => {
        let elData = elementsOfType[elId];
        let HTMLstringInEl = elMaps[elType].getElsStrings(elData);
        let citationsInElement = [] // hold all the citation in the element seperated by types
        elTypes.forEach((elType1) => {
          let elementCitationHTMLTag = elMaps[elType1].htmlTag;
          let searchElementCitationREGEX = new RegExp(`<${elementCitationHTMLTag}.+?(?=<\/${elementCitationHTMLTag}>)<\/${elementCitationHTMLTag}>`, 'gm');
          let searchElementIdREGEX = new RegExp(`citated_elements=".+?"`, 'gm');

          let innerCited = []
          let match;
          while ((match = searchElementCitationREGEX.exec(HTMLstringInEl)) !== null) {
            if (match[0].length > 0) {
              let citetElementsTest = 'cited_elements="asdasdasd|2,asd"'
              let citedElements = match[0].match(searchElementIdREGEX);
              if (citedElements.length > 0) {
                citedElements = citedElements[0].split('"')[1].split(',').map((el) => el.split('|')[0])
              }
              citedElements = citedElements.filter(el => el.length > 0)
              innerCited.push({
                citat: match[0],
                index: match.index,
                type: elType1,
                citationName: elTypeToCitMap[elType1],
                citedElements
              })
            }
          }
          citationsInElement.push(...innerCited);
        })
        citationsInElement.sort((a, b) => {
          return a.index - b.index;
        })
        /* citationsInElement.sort((a, b) => {
          return a.index - b.index;
        }) */

        citationsInElements[elType][elId] = citationsInElement
      })
    })
    return citationsInElements
  }

  getViewsOnCitation(
    citedElementsIds: string[],
    citaitonType: string,
    elementsNumbersObj: any,
    displayedElementsObj: any,
    citationsInElementsObj: any,
    displayedElsOnCurrCitation: any[]
  ) {
    let filteredElementIDs = []
    // filter elements ids that repeat
    citedElementsIds.forEach((el) => {
      if (!filteredElementIDs.includes(el)) {
        filteredElementIDs.push(el);
      }
    })
    this.calcDisplayedViewsInCitation(
      filteredElementIDs,
      citaitonType,
      elementsNumbersObj,
      displayedElementsObj,
      citationsInElementsObj,
      displayedElsOnCurrCitation
    )

  }

  updateElementsNumbers(newElements: { [key: string]: any }, elementNumbers: string[],elementNumberProp) {
    Object.keys(newElements).forEach((elKey) => {
      let elNumber = elementNumbers.indexOf(elKey)
      newElements[elKey][elementNumberProp] = elNumber
    })
  }

  getFigureRowsOrderData(data: any/* ,figuresObj:{[key:string]:figure},key:string */) {
    let figs = data.figRows;
    let rows = data.nOfRows;
    let columns = data.nOfColumns;

    for (let i = 0; i < rows; i++) {
      let rowH = 0;
      for (let j = 0; j < columns; j++) {
        if (figs[i][j]) {
          let cel = figs[i][j].container;
          if (rowH < cel.h) {
            let url: string = cel.url
          }
        }
      }
    }
  }

  writeElementDataGlobal( newElements: { [key: string]: any }, elementsNumbers: string[],type:string) {
    let elementMapping = citationElementMap[type];
    let oldCitats = JSON.parse(JSON.stringify(this.serviceShare.YdocService.citableElementsMap?.get('elementsCitations')));
    let oldElNums = JSON.parse(JSON.stringify(this.serviceShare.YdocService[elementMapping.yjsMap].get(elementMapping.elementNumbersObj)))
    let oldEls = JSON.parse(JSON.stringify(this.serviceShare.YdocService[elementMapping.yjsMap].get(elementMapping.elementsObj)))
    this.serviceShare.YjsHistoryService!.startCapturingNewUndoItem();

    let newElsCopy = JSON.parse(JSON.stringify(newElements))
    let newElsNumsCopy = JSON.parse(JSON.stringify(elementsNumbers))

    this.updateElementsNumbers(newElsCopy, newElsNumsCopy,elementMapping.elementNumberProp)
    this.serviceShare.YdocService[elementMapping.yjsMap].set(elementMapping.elementNumbersObj, newElsNumsCopy)
    this.serviceShare.YdocService[elementMapping.yjsMap].set(elementMapping.elementsObj, newElements)

    let citats = this.serviceShare.YdocService.citableElementsMap?.get('elementsCitations');
    this.serviceShare.YjsHistoryService!.addUndoItemInformation({
      type: elementMapping.type, data: {
        oldData: {
          cites:oldCitats,
          elementNumbers:oldElNums,
          elements:oldEls
        },
        newData: {
          cites: JSON.parse(JSON.stringify(citats)),
          elementNumbers: JSON.parse(JSON.stringify(elementsNumbers)),
          elements: JSON.parse(JSON.stringify(newElements))
        }
      }
    })
    //this.updateTablesAndTablesCitations(JSON.parse(JSON.stringify(newTables)))
    this.elementsFromPopupEdit[type] = newElsCopy;
    this.serviceShare.YdocService.citableElementsMap?.set('elementsCitations', citats);
    this.serviceShare.updateCitableElementsViewsAndCites()
  }

  elementsFromPopupEdit:{
    [key:string]:any // type : elements of type
  } = {}

  calcDisplayedViewsInCitation(
    citedElementsIds: string[],
    citationType: string,
    elementsNumbersObj: any,
    displayedElementsObj: any,
    citationsInElementsObj: any,
    displayedElsOnCurrCitation: any[]
  ) {
    // dont display view of elements that should be shown only in the end editor
    if(citableElementWithStaticViews.includes(elTypeToCitMap[citationType])){
      return;
    }
    // loops all the view that are cited on the passed citation but are not displayed and add these views in displayedElsOnCurrCitation
    // calcs the views nested in one another in order
    let elsOfCurrTypeNumbers = elementsNumbersObj[citationType] as string[]
    let elsDisplayedOfCurrType = displayedElementsObj[citationType] as boolean[]
    let citationsInElsOfCurrType = citationsInElementsObj[citationType] as { [key: string]: any[] };

    // get the element with highest index number in order

    let maxIndex = -1;
    citedElementsIds.forEach((el) => {
      let i = elsOfCurrTypeNumbers.indexOf(el)
      if (i > maxIndex) {
        maxIndex = i
      }
    })

    // get all element until el with max index cited

    let allCitedElements: string[] = []
    for (let i = 0; i <= maxIndex; i++) {
      let elId = elementsNumbersObj[citationType][i];
      allCitedElements.push(elId);
    }

    // filter all id of elements that are not displayed

    let notDisplayedElsIds: string[] = []

    allCitedElements.forEach((elId, i) => {
      if (!elsDisplayedOfCurrType[i]) {
        notDisplayedElsIds.push(elId)
      }
    })

    // mark each el that is not displayed for display on the curr citation and loop all citation on the element
    notDisplayedElsIds.forEach((elId) => {
      let elIndex = elsOfCurrTypeNumbers.indexOf(elId);
      if(!elsDisplayedOfCurrType[elIndex]){
        displayedElsOnCurrCitation.push({ elId, type: citationType });
        elsDisplayedOfCurrType[elIndex] = true;
        let citationsOnEl = citationsInElsOfCurrType[elId];
        citationsOnEl.forEach((citation) => {
          let citedElsInCitation = citation.citedElements;
          let citationTypeInner = citation.type;
          this.calcDisplayedViewsInCitation(
            citedElsInCitation,
            citationTypeInner,
            elementsNumbersObj,
            displayedElementsObj,
            citationsInElementsObj,
            displayedElsOnCurrCitation,
          )
        })
      }
    })
  }

  markElementsCitatsViews = (citatsBySection: citations, elsDisplayedInObj: { [key: string]: { [key: string]: string } }) => {
    this.resetCountedRenderedViews();
    let elementsNumbersObjs = this.getElementsNumbersObjs();
    let elementsNumbersObjsCopy = {}
    Object.keys(elementsNumbersObjs).forEach((elType) => {
      elementsNumbersObjsCopy[elType] = JSON.parse(JSON.stringify(elementsNumbersObjs[elType]));
    })

    let elementsObjs = this.getElementsObj()
    Object.keys(this.serviceShare.ProsemirrorEditorsService.editorContainers).forEach((key) => {
      let containersCount = 0
      let view = this.serviceShare.ProsemirrorEditorsService.editorContainers[key].editorView;
      view.state.doc.descendants((el) => {
        if (elementsContainersPMNodesNames.includes(el.type.name)) {
          containersCount++;
        }
      })
      let deleted = false;
      let tr1: Transaction
      let del = () => {
        deleted = false
        tr1 = view.state.tr
        view.state.doc.descendants((node, position, parent) => {
          if (elementsContainersPMNodesNames.includes(node.type.name) && !deleted) {
            deleted = true
            tr1 = tr1.replaceWith(position, position + node.nodeSize, Fragment.empty).setMeta('citable-elements-rerender', true);
          }
        })
        view.dispatch(tr1)
      }
      for (let index = 0; index < containersCount; index++) {
        del()
      }
      if (key == 'endEditor') {

      }
    })

    let elementsDysplayedViews = {};
    Object.keys(elementsNumbersObjsCopy).forEach((elType) => {
      elementsDysplayedViews[elType] = elementsNumbersObjsCopy[elType].map((elId) => { return false });
    })

    let articleFlatStructure = this.serviceShare.YdocService.articleStructure?.get('articleSectionsStructureFlat');

    let citationsInElementsObj = this.getCitationsInElementsObj(elementsObjs);
    articleFlatStructure.forEach((section: articleSection) => {
      let sectionID = section.sectionID

      var sortable = [];
      for (var citat in citatsBySection[sectionID]) {
        if (citatsBySection[sectionID][citat]) {
          sortable.push([citat, citatsBySection[sectionID][citat]]);
        }
      }

      sortable.sort(function (a, b) {
        return a[1].position - b[1].position;
      });

      sortable.forEach((citatData) => {
        let displayedElementViewsHere: any[] = []
        let citationType = citatData[1].citationType;
        let citedElements = citatData[1].citedElementsIDs.map(el => el.split('|')[0]);

        this.getViewsOnCitation(citedElements, citationType, elementsNumbersObjs, elementsDysplayedViews, citationsInElementsObj, displayedElementViewsHere);
        citatsBySection[sectionID][citatData[0]].displayedViewsHere = displayedElementViewsHere;
        displayedElementViewsHere.forEach((el) => {
          elsDisplayedInObj[el.type][el.elId] = sectionID;
        })
      })
    })
    let nonDisplayedViewsWithIndexes = {};
    Object.keys(elsDisplayedInObj).forEach((type) => {
      let elementsOfType = elsDisplayedInObj[type];
      nonDisplayedViewsWithIndexes[type] = []
      Object.keys(elementsOfType).forEach((elId) => {
        if (elementsOfType[elId] == 'endEditor') {
          nonDisplayedViewsWithIndexes[type].push({ elId, elIndex: elementsNumbersObjs[type].indexOf(elId) });
        }
      })
    })
    let typesToRenderInEndEdtior = 0
    let count = 0;
    let countRendered = () => {
      count++;
      if (count == typesToRenderInEndEdtior) {
        this.countRenderedViews()
      }
    }
    let numberOfNonDisplayedView = 0;
    Object.values(nonDisplayedViewsWithIndexes).reduce((prev:number,curr:any[],index,array)=>{
      return prev+=curr.length;
    },0)
    if(numberOfNonDisplayedView==0){
      this.countRenderedViews()
    }
    Object.keys(nonDisplayedViewsWithIndexes).forEach((type) => {
      let nonDisplayedEditors = nonDisplayedViewsWithIndexes[type];
      if (nonDisplayedEditors.length > 0) {
        typesToRenderInEndEdtior++;
      }
      nonDisplayedEditors.sort((a, b) => a.elIndex - b.elIndex);

      this.addElementsInEndEditor(type, nonDisplayedEditors, countRendered);
    })
    return citatsBySection
  }

  addElementsInEndEditor(type: string, nonDisplayedEditors: any[], countRendered: any) {
    let elType = type;
    let typeMapping = citationElementMap[elTypeToCitMap[elType]]

    let elementObjs = this.getElementsObj()
    let elementsTemplates = this.getElementsTemplates()
    let renderedViewsMetaData: any = []
    let renderedViews = 0;
    let view = this.serviceShare.ProsemirrorEditorsService.editorContainers['endEditor'].editorView
    let DOMPMParser = DOMParser.fromSchema(view.state.schema)

    let displayViews = (data: any) => {
      let nodeStart: number = view.state.doc.nodeSize - 2
      let nodeEnd: number = view.state.doc.nodeSize - 2

      let elementNodes = data.renderedViewsMetaData.map((el) => {
        return el.renderedData
      })

      let endEditorPrefixNodes = typeMapping.getEndEditorPrefixNodes?typeMapping.getEndEditorPrefixNodes():[]

      let schema = view.state.schema as Schema;
      let container = schema.nodes[typeMapping.containerNodeName].create({}, [...endEditorPrefixNodes,...elementNodes]);
      view.dispatch(view.state.tr.replaceWith(nodeStart!, nodeEnd!, container).setMeta('citable-elements-rerender', true))
      setTimeout(() => {
        countRendered()
      }, 0)
    }

    nonDisplayedEditors.forEach((el, i) => {
      let elId = el.elId;
      let elementData = elementObjs[elType][elId];
      let elementTemplate = elementsTemplates[elType][elId];
      typeMapping.setSectionData(elementData, 'endEditor', 'endEditor');
      let serializedElementToFormIOsubmission = typeMapping.getElFormIOSubmission(elementData, 'endEditor');
      let elementFormGroup = typeMapping.buildElementFormGroup(serializedElementToFormIOsubmission);
      this.serviceShare.ProsemirrorEditorsService.interpolateTemplate(elementTemplate.html, serializedElementToFormIOsubmission, elementFormGroup).then((data: any) => {
        let templ = document.createElement('div')
        templ.innerHTML = data
        let Slice = DOMPMParser.parse(templ.firstChild!)
        renderedViews++;
        renderedViewsMetaData[i] = {
          renderedData: Slice.content.firstChild,
          elementData,
          elType
        }
        if (renderedViews == nonDisplayedEditors.length) {
          displayViews({
            renderedViewsMetaData:renderedViewsMetaData.sort((a,b)=>a.elementData[typeMapping.elementNumberProp]-b.elementData[typeMapping.elementNumberProp]),
            citationType: type,
          })
        }
      });
    });
  }

  citateEndNote(selectedEndNotes: boolean[], sectionID: string, citatAttrs: any) {
    try {
      this.serviceShare.YjsHistoryService.startCapturingNewUndoItem();

      let matkType = 'end_note_citation';

      let endNotesMaping = citationElementMap[matkType];

      let endNotesNumbers = this.serviceShare.YdocService[endNotesMaping.yjsMap].get(endNotesMaping.elementNumbersObj);
      let endNotesCitations = this.serviceShare.YdocService[endNotesMaping.yjsMap].get(endNotesMaping.elementCitations);

      //check selections
      let insertionView = this.serviceShare.ProsemirrorEditorsService.editorContainers[sectionID].editorView
      let citatStartPos: number
      let citatEndPos: number

      if (citatAttrs) {
        let citatId = citatAttrs.citateid
        insertionView.state.doc.nodesBetween(0, insertionView.state.doc.nodeSize - 2, (node, pos, parent) => {
          if (node.marks.filter((mark) => { return mark.type.name == matkType }).length > 0) {
            let citationMark = node.marks.filter((mark) => { return mark.type.name == matkType })[0];
            if (citationMark.attrs.citateid == citatId) {
              citatStartPos = pos
              citatEndPos = pos + node.nodeSize
            }
          }
        })
      }

      let citateId
      if (citatAttrs) {
        citateId = citatAttrs.citateid
      } else {
        citateId = uuidv4();
      }
      if (selectedEndNotes.filter(e => e).length == 0 && !citatAttrs) {
        return
      } else if (selectedEndNotes.filter(e => e).length == 0 && citatAttrs) {
        insertionView.dispatch(insertionView.state.tr.replaceWith(
          citatStartPos,
          citatEndPos,
          Fragment.empty)
        )
        citatAttrs.citated_elements.forEach(citatId => {
          if(endNotesCitations[citatId] > 1) {
            endNotesCitations[citatId]--;
          } else {
            delete endNotesCitations[citatId];
          }
        })
        this.serviceShare.updateCitableElementsViews();
        return
      }

      let citatString = selectedEndNotes.filter(e => e).length > 1 ? endNotesMaping.multipleElTxt : endNotesMaping.singleElTxt;
      let citated: any = []
      selectedEndNotes.forEach((fig, index) => {
        if (fig) {
          citated.push(index + 1)
        }
      })
      citatString += citated.join(',  ')
      citatString += ' '
      let citatedEndNotesIds = selectedEndNotes.reduce<any>((prev, curr, index) => {
        if (curr) {
          return prev.concat(curr ? [endNotesNumbers![index]] : []);
        } else {
          return prev;
        }
      }, [])


      let citateNodeText = citatString
      let node = (insertionView.state.schema as Schema).text(citateNodeText) as Node
      let mark = (insertionView.state.schema as Schema).mark(matkType, {
        "citated_elements": citatedEndNotesIds,
        "citateid": citateId
      })
      node = node.mark([mark])
      if (citatAttrs) {
        insertionView.dispatch(insertionView.state.tr.replaceWith(citatStartPos,
          citatEndPos
          , node).setMeta('citatsTextChange', true)
        )
      } else {
        insertionView.dispatch(insertionView.state.tr.replaceWith(insertionView.state.selection.from,
          insertionView.state.selection.to
          , node)
        )
      }

      citatedEndNotesIds.forEach(citatId => {
        if(!endNotesCitations[citatId]) {
          endNotesCitations[citatId] = 1;
        } else {
          endNotesCitations[citatId]++;
        }
      })

      this.serviceShare.YdocService[endNotesMaping.yjsMap].set('endNotesCitations', endNotesCitations);

      this.serviceShare.updateCitableElementsViews();
    } catch (e) {
      console.error(e);
    }
  }

  citateSupplementaryFile(selectedSupplementaryFiles: boolean[], sectionID: string, citatAttrs: any) {
    try {
      this.serviceShare.YjsHistoryService.startCapturingNewUndoItem();

      let matkType = 'supplementary_file_citation';

      let supplementaryFileMaping = citationElementMap[matkType];

      let supplementaryFileNumbers = this.serviceShare.YdocService[supplementaryFileMaping.yjsMap].get(supplementaryFileMaping.elementNumbersObj);
      let supplementaryFiles = this.serviceShare.YdocService[supplementaryFileMaping.yjsMap].get(supplementaryFileMaping.elementCitations);

      //check selections
      let insertionView = this.serviceShare.ProsemirrorEditorsService.editorContainers[sectionID].editorView
      let citatStartPos: number
      let citatEndPos: number

      if (citatAttrs) {
        let citatId = citatAttrs.citateid
        insertionView.state.doc.nodesBetween(0, insertionView.state.doc.nodeSize - 2, (node, pos, parent) => {
          if (node.marks.filter((mark) => { return mark.type.name == matkType }).length > 0) {
            let citationMark = node.marks.filter((mark) => { return mark.type.name == matkType })[0];
            if (citationMark.attrs.citateid == citatId) {
              citatStartPos = pos
              citatEndPos = pos + node.nodeSize
            }
          }
        })
      }

      let citateId
      if (citatAttrs) {
        citateId = citatAttrs.citateid
      } else {
        citateId = uuidv4();
      }
      if (selectedSupplementaryFiles.filter(e => e).length == 0 && !citatAttrs) {
        return
      } else if (selectedSupplementaryFiles.filter(e => e).length == 0 && citatAttrs) {
        insertionView.dispatch(insertionView.state.tr.replaceWith(
          citatStartPos,
          citatEndPos,
          Fragment.empty)
        )
        citatAttrs.citated_elements.forEach(citatId => {
          if(supplementaryFiles[citatId] > 1) {
            supplementaryFiles[citatId]--;
          } else {
            delete supplementaryFiles[citatId];
          }
        })
        this.serviceShare.updateCitableElementsViews();
        return
      }

      let citatString = selectedSupplementaryFiles.filter(e => e).length > 1 ? supplementaryFileMaping.multipleElTxt : supplementaryFileMaping.singleElTxt;
      let citated: any = []
      selectedSupplementaryFiles.forEach((fig, index) => {
        if (fig) {
          citated.push(index + 1)
        }
      })
      citatString += citated.join(',  ')
      citatString += ' '
      let citatedSupplementaryFilesIds = selectedSupplementaryFiles.reduce<any>((prev, curr, index) => {
        if (curr) {
          return prev.concat(curr ? [supplementaryFileNumbers![index]] : []);
        } else {
          return prev;
        }
      }, [])


      let citateNodeText = citatString
      let node = (insertionView.state.schema as Schema).text(citateNodeText) as Node
      let mark = (insertionView.state.schema as Schema).mark(matkType, {
        "citated_elements": citatedSupplementaryFilesIds,
        "citateid": citateId
      })
      node = node.mark([mark])
      if (citatAttrs) {
        insertionView.dispatch(insertionView.state.tr.replaceWith(citatStartPos,
          citatEndPos
          , node).setMeta('citatsTextChange', true)
        )
      } else {
        insertionView.dispatch(insertionView.state.tr.replaceWith(insertionView.state.selection.from,
          insertionView.state.selection.to
          , node)
        )
      }

      citatedSupplementaryFilesIds.forEach(citatId => {
        if(!supplementaryFiles[citatId]) {
          supplementaryFiles[citatId] = 1;
        } else {
          supplementaryFiles[citatId]++;
        }
      })
      this.serviceShare.YdocService[supplementaryFileMaping.yjsMap].set('citedSupplementaryFiles', supplementaryFiles);
      /* this.serviceShare.YjsHistoryService.addUndoItemInformation({
        type: 'table-citation',
        data: {}
      }) */
      //this.updateOnlyTablesView()
      this.serviceShare.updateCitableElementsViews();
    } catch (e) {
      console.error(e);
    }
  }

  citateTables(selectedTables: boolean[], sectionID: string, citatAttrs: any) {
    try {
      this.serviceShare.YjsHistoryService.startCapturingNewUndoItem();

      let matkType = 'table_citation';

      let tableMaping = citationElementMap[matkType];

      let tablesNumbers = this.serviceShare.YdocService[tableMaping.yjsMap].get(tableMaping.elementNumbersObj);

      //check selections
      let insertionView = this.serviceShare.ProsemirrorEditorsService.editorContainers[sectionID].editorView
      let citatStartPos: number
      let citatEndPos: number

      if (citatAttrs) {
        let citatId = citatAttrs.citateid
        insertionView.state.doc.nodesBetween(0, insertionView.state.doc.nodeSize - 2, (node, pos, parent) => {
          if (node.marks.filter((mark) => { return mark.type.name == matkType }).length > 0) {
            let citationMark = node.marks.filter((mark) => { return mark.type.name == matkType })[0];
            if (citationMark.attrs.citateid == citatId) {
              citatStartPos = pos
              citatEndPos = pos + node.nodeSize
            }
          }
        })
      }

      let citateId
      if (citatAttrs) {
        citateId = citatAttrs.citateid
      } else {
        citateId = uuidv4();
      }
      if (selectedTables.filter(e => e).length == 0 && !citatAttrs) {
        return
      } else if (selectedTables.filter(e => e).length == 0 && citatAttrs) {
        insertionView.dispatch(insertionView.state.tr.replaceWith(
          citatStartPos,
          citatEndPos,
          Fragment.empty)
        )
        /* this.serviceShare.YjsHistoryService.addUndoItemInformation({
          type: 'table-citation',
          data: {}
        }) */
        //this.updateOnlyTablesView()
        this.serviceShare.updateCitableElementsViews();
        return
      }

      /* ``` citats obj type
      citats:{
        [key:string](articleSectionID):{
          [key:string](citatID):{
            tableIDs:string[](citatesTablesIDs),
            position:number(positioninEditor)
          }
        }
      }
      */
      let citatString = selectedTables.filter(e => e).length > 1 ? tableMaping.multipleElTxt : tableMaping.singleElTxt;
      let citated: any = []
      selectedTables.forEach((fig, index) => {
        if (fig) {
          citated.push(index + 1)
        }
      })
      citatString += citated.join(',  ')
      citatString += ' '
      let citatedFigureIds = selectedTables.reduce<any>((prev, curr, index) => {
        if (curr) {
          return prev.concat(curr ? [tablesNumbers![index]] : []);
        } else {
          return prev;
        }
      }, [])


      let citateNodeText = citatString
      let node = (insertionView.state.schema as Schema).text(citateNodeText) as Node
      let mark = (insertionView.state.schema as Schema).mark(matkType, {
        "citated_elements": citatedFigureIds,
        "citateid": citateId
      })
      node = node.mark([mark])
      if (citatAttrs) {
        insertionView.dispatch(insertionView.state.tr.replaceWith(citatStartPos,
          citatEndPos
          , node).setMeta('citatsTextChange', true)
        )
      } else {
        insertionView.dispatch(insertionView.state.tr.replaceWith(insertionView.state.selection.from,
          insertionView.state.selection.to
          , node)
        )
      }
      /* this.serviceShare.YjsHistoryService.addUndoItemInformation({
        type: 'table-citation',
        data: {}
      }) */
      //this.updateOnlyTablesView()
      this.serviceShare.updateCitableElementsViews();
    } catch (e) {
      console.error(e);
    }
  }

  citateFigures(selectedFigures: boolean[], figuresComponentsChecked: { [key: string]: boolean[] }, sectionID: string, citatAttrs: any) {
    try {
      this.serviceShare.YjsHistoryService.startCapturingNewUndoItem();

      let matkType = 'citation'

      let figureMaping = citationElementMap[matkType];

      let figuresNumbers = this.serviceShare.YdocService[figureMaping.yjsMap].get(figureMaping.elementNumbersObj);

      //check selections
      let insertionView = this.serviceShare.ProsemirrorEditorsService.editorContainers[sectionID].editorView
      let citatStartPos: number
      let citatEndPos: number

      if (citatAttrs) {
        let citatId = citatAttrs.citateid
        insertionView.state.doc.nodesBetween(0, insertionView.state.doc.nodeSize - 2, (node, pos, parent) => {
          if (node.marks.filter((mark) => { return mark.type.name == matkType }).length > 0) {
            let citationMark = node.marks.filter((mark) => { return mark.type.name == matkType })[0];
            if (citationMark.attrs.citateid == citatId) {
              citatStartPos = pos
              citatEndPos = pos + node.nodeSize
            }
          }
        })
      }

      let citateId
      if (citatAttrs) {
        citateId = citatAttrs.citateid
      } else {
        citateId = uuidv4();
      }
      if (selectedFigures.filter(e => e).length == 0 && !citatAttrs) {
        return
      } else if (selectedFigures.filter(e => e).length == 0 && citatAttrs) {
        insertionView.dispatch(insertionView.state.tr.replaceWith(
          citatStartPos,
          citatEndPos,
          Fragment.empty)
        )
        /* this.serviceShare.YjsHistoryService.addUndoItemInformation({
          type: 'figure-citation',
          data: {}
        }) */
        //this.updateOnlyFiguresView()
        this.serviceShare.updateCitableElementsViews()
        return
      }

      let citatString = selectedFigures.filter(e => e).length > 1 ? figureMaping.multipleElTxt : figureMaping.singleElTxt;
      let citated: any = []
      selectedFigures.forEach((fig, index) => {
        if (fig) {
          citated.push(index + 1)
          if (figuresComponentsChecked[figuresNumbers![index]].filter(e => !e).length > 0) {
            let count = 0
            figuresComponentsChecked[figuresNumbers![index]].forEach((comp, j) => {
              if (comp) {
                if (count == 0) {
                  citated[citated.length - 1] += String.fromCharCode(97 + j)
                  count++
                } else {
                  citated.push(String.fromCharCode(97 + j))
                  count++
                }
              }
            })
          }

        }
      })
      citatString += citated.join(',  ')
      citatString += ' '
      let citatedFigureIds = selectedFigures.reduce<any>((prev, curr, index) => {
        if (curr) {
          if (figuresComponentsChecked[figuresNumbers![index]].filter(e => e).length == figuresComponentsChecked[figuresNumbers![index]].length) {// means the whole figure is citated
            //citated.push(index + 1)
            //citatString +=  ${index + 1}`
            return prev.concat(curr ? [figuresNumbers![index]] : []);
          } else {
            //citated.push(index + 1)
            //citatString += ` ${index + 1}`
            let idsWithComponents = figuresComponentsChecked[figuresNumbers![index]].reduce<string[]>((p, c, i) => {
              //citatString += c ? `${String.fromCharCode(97 + i)}, ` : ''
              //return prev
              return p.concat(c ? [figuresNumbers![index] + '|' + i] : [])
            }, [])
            return prev.concat(idsWithComponents);
          }
          return prev.concat(curr ? [figuresNumbers![index]] : []);
        } else {
          return prev;
        }
      }, [])


      let citateNodeText = citatString
      let node = (insertionView.state.schema as Schema).text(citateNodeText) as Node
      let mark = (insertionView.state.schema as Schema).mark(matkType, {
        "citated_elements": citatedFigureIds,
        "citateid": citateId
      })
      node = node.mark([mark])
      if (citatAttrs) {
        insertionView.dispatch(insertionView.state.tr.replaceWith(citatStartPos,
          citatEndPos
          , node).setMeta('citatsTextChange', true)
        )
      } else {
        insertionView.dispatch(insertionView.state.tr.replaceWith(insertionView.state.selection.from,
          insertionView.state.selection.to
          , node)
        )
      }
      /* this.serviceShare.YjsHistoryService.addUndoItemInformation({
        type: 'figure-citation',
        data: {}
      }) */
      //this.updateOnlyFiguresView()
      this.serviceShare.updateCitableElementsViews()
    } catch (e) {
      console.error(e);
    }
  }

  sub

  buildElTypeForm(sub: any) {

  }

  updateElementsCitationsV2 (){
    let citations = this.getElementsCitations(true);
    this.updateCitatsText(citations);
    setTimeout(()=>{
      this.serviceShare.YjsHistoryService.endBigOperationCapture()
    },10)
  }

  allViewAreRendered() {
    setTimeout(() => {
      if(this.updatingElementsAndElementsCitations){
        this.updateElementsCitationsV2()
      }else{
        this.serviceShare.YjsHistoryService.endBigOperationCapture()
      }
      citationsPMNodeNames.forEach((citType) => {
        if(this.elementsFromPopupEdit[citType]){
          this.elementsFromPopupEdit[citType] = undefined
        }
      })
    }, 10)
  }

  renderedViews = 0 // 2 1- for viewd element and 1-for element in end editor
  countRenderedViews() {
    this.renderedViews++;
    if (this.renderedViews == 2) {
      if(this.sub){
        this.sub?.unsubscribe()
        this.sub = undefined
      }
      this.renderedViews = 0;
      this.allViewAreRendered()
    }
  }

  displayElements(citats: citations, elsDisplayedInObj) {
    if (this.sub) {
      return
    }
    let elementObjs = this.getElementsObj()
    let elementsTemplates = this.getElementsTemplates();
    let numberOfElsObj: number = 0;
    Object.keys(elementObjs).forEach((type: any) => {
      let elsOfType = elementObjs[type];
      let nOfEls = Object.keys(elsOfType).filter((elId) => {
        return elsDisplayedInObj[type][elId] != 'endEditor';
      }).length
      numberOfElsObj += nOfEls
    })
    if (numberOfElsObj == 0) {
      this.countRenderedViews()
      return
    }
    let doneEditing = new Subject();
    Object.keys(citats).forEach((sectionId) => {
      let view = this.serviceShare.ProsemirrorEditorsService.editorContainers[sectionId].editorView;
      let citatsInEditor = citats[sectionId];
      Object.keys(citatsInEditor).forEach((citatId) => {
        let citat = citatsInEditor[citatId];
        let citatID = citatId
        let editFigureContainer = (
          citatID: string,
          dispatchSubject: Subject<any>,
          elementsViewsToDisplay: any[],
          edView: EditorView) => {
          let renderedViewsMetaData: any = []
          let renderedViews = 0;
          elementsViewsToDisplay.forEach((displayedView, i) => {
            let elType = displayedView.type;
            let elId = displayedView.elId;
            let elementData = elementObjs[elType][elId];
            let elementTemplate = elementsTemplates[elType][elId];
            let typeMapping = citationElementMap[elTypeToCitMap[elType]]
            typeMapping.setSectionData(elementData, sectionId, citatID);
            let serializedElementToFormIOsubmission = typeMapping.getElFormIOSubmission(elementData, citatID);
            let elementFormGroup = typeMapping.buildElementFormGroup(serializedElementToFormIOsubmission);

            this.serviceShare.ProsemirrorEditorsService.interpolateTemplate(elementTemplate.html, serializedElementToFormIOsubmission, elementFormGroup).then((data: any) => {
              let templ = document.createElement('div')
              templ.innerHTML = data
              let DOMParserFormCurrSection  = DOMParser.fromSchema(view.state.schema)
              let Slice = DOMParserFormCurrSection.parse(templ.firstChild!)
              renderedViews++;
              renderedViewsMetaData[i] = {
                renderedData: Slice.content.firstChild,
                elementData,
                elType
              }
              if (renderedViews == elementsViewsToDisplay.length) {
                dispatchSubject.next({
                  renderedViewsMetaData,
                  citationType: elTypeToCitMap[citat.citationType],
                  citatID,
                  edView
                })
              }
            });
          })

        }
        if (citat.displayedViewsHere.length > 0) {
          editFigureContainer(citatID, doneEditing, citat.displayedViewsHere, view)
        }
      })

    })
    let rendered = 0;
    let checkRendered = (nOnRenderedItems: number) => {
      rendered += nOnRenderedItems;

      if (rendered == numberOfElsObj) {
        this.countRenderedViews()
        this.sub?.unsubscribe()
        this.sub = undefined
      }
    }
    this.sub = doneEditing.subscribe((data: any) => {
      try {
        let citatNewPosition: any
        let wrappingNodes = ['paragraph', 'heading', 'table', 'code_block', 'ordered_list', 'bullet_list', 'math_inline', 'math_display', 'form_field']
        let resolvedPositionOfCitat: any
        let posAtParentBorder: any
        let resolvedPositionATparentNodeBorder: any
        let contAfter: any
        let updateMetaInfo = () => {
          let docSize = data.edView.state.doc.nodeSize
          data.edView.state.doc.nodesBetween(0, docSize - 2, (node: any, pos: any, i: any) => {
            let marks = node.marks.filter((mark: Mark) => { return (mark.type.name == data.citationType) })
            if (marks.length > 0 && marks[0].attrs.citateid == data.citatID) {
              citatNewPosition = pos
            }
          })
          if (!citatNewPosition) {
            return
          }
          resolvedPositionOfCitat = data.edView.state.doc.resolve(citatNewPosition)
          //@ts-ignore
          let resolvedCitationPath: Array<Node | number> = resolvedPositionOfCitat.path
          let offsetOfwrappingParent: number
          let wrappingParent
          let nodeAfterWrappingParent

          if (!wrappingParent) {
            for (let i = resolvedCitationPath.length - 1; i > -1; i--) {
              let el = resolvedCitationPath[i];
              if (el instanceof Node) {
                if (wrappingNodes.includes(el.type.name)) {
                  offsetOfwrappingParent = resolvedCitationPath[i - 1] as number
                  wrappingParent = el
                }
              }
            }
          }

          posAtParentBorder = offsetOfwrappingParent! + wrappingParent?.nodeSize!
          resolvedPositionATparentNodeBorder = data.edView.state.doc.resolve(posAtParentBorder)
          contAfter = data.edView.state.doc.nodeAt(posAtParentBorder)!;

          contAfter = resolvedPositionATparentNodeBorder.nodeAfter!
          while (contAfter && elementsContainersPMNodesNames.includes(contAfter.type.name)) {
            posAtParentBorder = posAtParentBorder + contAfter.content.size + contAfter.content.content.length;
            resolvedPositionATparentNodeBorder = data.edView.state.doc.resolve(posAtParentBorder)
            contAfter = resolvedPositionATparentNodeBorder.nodeAfter!
          }
        }

        updateMetaInfo()
        //@ts-ignore
        if (!resolvedPositionATparentNodeBorder) {
          return
        }
        let viesNodes: Node[] = [];
        data.renderedViewsMetaData.forEach((renderedViewData) => {
          let type = renderedViewData.elType;
          let node = renderedViewData.renderedData
          let containerNodeName = citationElementMap[elTypeToCitMap[type]].containerNodeName;
          let containerNode = data.edView.state.schema.nodes[containerNodeName].create({}, node);
          viesNodes.push(containerNode)
        })
        let viesNodesFragment = Fragment.from(viesNodes);
        data.edView.dispatch(data.edView.state.tr.insert(resolvedPositionATparentNodeBorder.pos, viesNodesFragment).setMeta('citable-elements-rerender', true))
        setTimeout(() => {
          checkRendered(data.renderedViewsMetaData.length);
        }, 0)
      } catch (e) {
        console.error(e);
      }
    })
  }

  updatingElementsAndElementsCitations = false
  updateElementsAndElementsCitations() {
    this.updatingElementsAndElementsCitations = true;
    let citations = this.getElementsCitations();
    this.updateCitatsText(citations);
    let elsDisplayedInObj = {};
    let elementsObj = this.getElementsObj();
    Object.keys(elementsObj).forEach((elType) => {
      elsDisplayedInObj[elType] = {}
      Object.keys(elementsObj[elType]).forEach((elId) => {
        elsDisplayedInObj[elType][elId] = 'endEditor'
      })
    })
    let newCitatsObj = this.markElementsCitatsViews(citations, elsDisplayedInObj);
    this.serviceShare.YdocService.citableElementsMap?.set('elementsCitations', newCitatsObj);
    this.displayElements(newCitatsObj, elsDisplayedInObj);
  }

  updatingOnlyElementsView = false;
  updateOnlyElementsViews() {
    this.updatingOnlyElementsView = true;
    let citations = this.getElementsCitations()
    let elsDisplayedInObj = {};
    let elementsObj = this.getElementsObj();
    Object.keys(elementsObj).forEach((elType) => {
      elsDisplayedInObj[elType] = {}
      Object.keys(elementsObj[elType]).forEach((elId) => {
        elsDisplayedInObj[elType][elId] = 'endEditor'
      })
    });
    let newCitatsObj = this.markElementsCitatsViews(citations, elsDisplayedInObj);
    this.serviceShare.YdocService.citableElementsMap?.set('elementsCitations', newCitatsObj);
    this.displayElements(newCitatsObj, elsDisplayedInObj);
  }
}
