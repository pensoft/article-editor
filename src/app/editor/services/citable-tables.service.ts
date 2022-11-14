import { Injectable } from '@angular/core';
import { editorContainer, ProsemirrorEditorsService } from './prosemirror-editors.service';
import { ServiceShare } from './service-share.service';
import { YdocService } from './ydoc.service';
import { DOMParser, Fragment, Schema, Node, Mark } from 'prosemirror-model';
import { schema } from '../utils/Schema';
import { Subject, Subscription } from 'rxjs';
import { Transaction } from 'prosemirror-state';
import { articleSection } from '../utils/interfaces/articleSection';
import { citableTable } from '../utils/interfaces/citableTables';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { EditorView } from 'prosemirror-view';
import { uuidv4 } from 'lib0/random';
import { createNgModule } from '@angular/compiler/src/core';

export function buildTableForm(submision:any):FormGroup{
  let tableFormGroup =  new FormGroup({})
  let tabDesc = new FormControl(submision.tableDescription);

  let tabComponents = new FormControl(submision.tableComponents);
  tableFormGroup.addControl('tableDescription',tabDesc);
  tableFormGroup.addControl('tableComponents',tabComponents);
  return tableFormGroup
}

@Injectable({
  providedIn: 'root'
})
export class CitableTablesService {

  DOMPMParser = DOMParser.fromSchema(schema)
  /* tablesArray: table[] = []
  tablesFormGroups:FormArray = new FormArray([]) */
  endEditorContainer?: editorContainer
  tablesNumbers?: string[] = []
  tables: { [key: string]: citableTable } = {}
  renderEditorFn: any
  sub?: Subscription
  rendered = 0;

  reRntablesControllerService() {
    this.endEditorContainer = undefined
    this.tablesNumbers = []
    this.tables = {}
    this.renderEditorFn = undefined
    this.sub = undefined
  }

  constructor(
    private ydocService: YdocService,
    private prosemirrorEditorsService: ProsemirrorEditorsService,
    private serviceShare: ServiceShare,
  ) {
    this.serviceShare.shareSelf('CitableTablesService', this)
    if (this.ydocService.editorIsBuild) {
      this.initCitableTables()
      this.ydocService.ydocStateObservable.subscribe((event) => {
        if (event == 'docIsBuild') {
          this.initCitableTables()
        }
      });
    } else {
      this.ydocService.ydocStateObservable.subscribe((event) => {
        if (event == 'docIsBuild') {
          this.initCitableTables()
        }
      });
    }
    this.prosemirrorEditorsService.setTablesRerenderFunc(this.markTableCitatsViews);
  }

  citateTables(selectedTables: boolean[], sectionID: string, citatAttrs: any) {
    try {
      this.serviceShare.YjsHistoryService.startCapturingNewUndoItem();
      if (!this.tablesNumbers || !this.tables) {
        this.tablesNumbers = this.ydocService.tablesMap!.get('ArticleTablesNumbers')
        this.tables = this.ydocService.tablesMap!.get('ArticleTables')
      }
      //check selections
      let insertionView = this.prosemirrorEditorsService.editorContainers[sectionID].editorView
      let citatStartPos: number
      let citatEndPos: number

      if (citatAttrs) {
        let citatId = citatAttrs.citateid
        insertionView.state.doc.nodesBetween(0, insertionView.state.doc.nodeSize - 2, (node, pos, parent) => {
          if (node.marks.filter((mark) => { return mark.type.name == 'table_citation' }).length > 0) {
            let citationMark = node.marks.filter((mark) => { return mark.type.name == 'table_citation' })[0];
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
        this.serviceShare.YjsHistoryService.addUndoItemInformation({
          type: 'table-citation',
          data: {}
        })
        this.updateOnlyTablesView()
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
      let citatString = selectedTables.filter(e => e).length > 1 ? ' Tables.  ' : ' Table.  ';
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
          return prev.concat(curr ? [this.tablesNumbers![index]] : []);
        } else {
          return prev;
        }
      }, [])


      let citateNodeText = citatString
      let node = (insertionView.state.schema as Schema).text(citateNodeText) as Node
      let mark = (insertionView.state.schema as Schema).mark('table_citation', {
        "citated_tables": citatedFigureIds,
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
      this.serviceShare.YjsHistoryService.addUndoItemInformation({
        type: 'table-citation',
        data: {}
      })
      this.updateOnlyTablesView()
    } catch (e) {
      console.error(e);
    }
  }

  initCitableTables() {
    let tablesNumbersFromYMap = this.ydocService.tablesMap?.get('ArticleTablesNumbers');
    let tablesFromYdoc = this.ydocService.tablesMap!.get('ArticleTables');
    this.tables = tablesFromYdoc;
    this.tablesNumbers = tablesNumbersFromYMap
  }

  resetCountedRenderedViews() {
    this.rendered = 0;
  }

  markTableCitatsViews = (citatsBySection: any) => {
    this.resetCountedRenderedViews();
    let numbersCopy: string[] = JSON.parse(JSON.stringify(this.tablesNumbers));

    this.tables = this.ydocService.tablesMap!.get('ArticleTables')
    Object.keys(this.prosemirrorEditorsService.editorContainers).forEach((key) => {
      let containersCount = 0
      let view = this.prosemirrorEditorsService.editorContainers[key].editorView;
      view.state.doc.descendants((el) => {
        if (el.type.name == 'tables_nodes_container') {
          containersCount++;
        }
      })
      let deleted = false;
      let tr1: Transaction
      let del = () => {
        deleted = false
        tr1 = view.state.tr
        view.state.doc.descendants((node, position, parent) => {
          if (node.type.name == 'tables_nodes_container' && !deleted) {
            deleted = true
            tr1 = tr1.replaceWith(position, position + node.nodeSize, Fragment.empty);
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
    let viewsDisplayed: boolean[] = numbersCopy.map((tableID) => { return false })

    let articleFlatStructure = this.ydocService.articleStructure?.get('articleSectionsStructureFlat');
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
        let biggestTableNumberInCitat = -1;
        let citedTablesOnCitat: string[] = citatData[1].tableIDs;
        let deletedTablesOnCitat = citedTablesOnCitat.reduce<string[]>((prev, tableID, i) => {
          let data = tableID.split("|")
          let tID = data[0]!
          if (numbersCopy.indexOf(tID) == -1) {
            return prev.concat([tableID])
          }
          return prev
        }, [])
        let displayedTablesViewHere: string[] = []
        if (!citatsBySection[sectionID][citatData[0]].displaydtablesViewhere) {
          citatsBySection[sectionID][citatData[0]].displaydtablesViewhere = []
        }
        if (deletedTablesOnCitat.length < citedTablesOnCitat.length) {
          deletedTablesOnCitat.forEach((tID) => {
            citedTablesOnCitat.splice(citedTablesOnCitat.indexOf(tID!), 1)
          })
          citedTablesOnCitat.forEach((tableID) => { // find the table with biggest index on this citat
            let tID: string
            let componentId: string
            let data = tableID.split("|")
            tID = data[0]
            componentId = data[1]
            let tNumber = numbersCopy.indexOf(tID)

            if (tNumber > biggestTableNumberInCitat) {
              biggestTableNumberInCitat = tNumber
            }
          })
          for (let i = 0; i <= biggestTableNumberInCitat; i++) {
            if (!viewsDisplayed[i]) {
              displayedTablesViewHere.push(numbersCopy[i])

              if (this.tables[numbersCopy[i]].tablePlace == 'endEditor') {
                this.removeFromEndEditor(numbersCopy[i])
              }
              this.tables[numbersCopy[i]].tablePlace = sectionID
              this.tables[numbersCopy[i]].viewed_by_citat = citatData[0];
              //citatsBySection[sectionID][citatData[0]].displaydtablesViewhere.push(numbersCopy[i])
              viewsDisplayed[i] = true
            }
          }
        }

        /* if(displayedtablesViewHere.length!==citatsBySection[sectionID][citatData[0]].displaydtablesViewhere.length||!displayedtablesViewHere.reduce<boolean>((prev,tableID,i)=>{
          if(!citatsBySection[sectionID][citatData[0]].displaydtablesViewhere.includes(tableID)){
            return (prev&&false)
          }
          return (prev&&true)
        },true)){
        } */
        citatsBySection[sectionID][citatData[0]].lastTimeUpdated = new Date().getTime();
        citatsBySection[sectionID][citatData[0]].displaydTablesViewhere = displayedTablesViewHere;

      })
    })
    citatsBySection
    this.tables = this.ydocService.tablesMap!.set('ArticleTables', this.tables)
    viewsDisplayed.forEach((view, index) => {
      if (view == false) {
        this.tables[numbersCopy[index]].tablePlace = 'endEditor'
        let tableTemplate = this.ydocService.tablesMap?.get('tablesTemplates')[numbersCopy[index]];

        let tableData = this.tables[numbersCopy[index]]
        let serializedtableToFormIOsubmission: any = {}
        serializedtableToFormIOsubmission.tableComponents = tableData.components;
        serializedtableToFormIOsubmission.tableDescription = tableData.description
        serializedtableToFormIOsubmission.tableID = tableData.tableID
        serializedtableToFormIOsubmission.tableNumber = tableData.tableNumber
        let tableFormGroup = buildTableForm(serializedtableToFormIOsubmission)
        this.prosemirrorEditorsService.interpolateTemplate(tableTemplate.html, serializedtableToFormIOsubmission, tableFormGroup).then((data: string) => {
          let templ = document.createElement('div')
          templ.innerHTML = data
          let pmnodes = this.DOMPMParser.parse(templ.firstChild!).content.firstChild;
          this.updateSingleTable(numbersCopy[index], pmnodes!, tableData);
        })
      }
    })
    this.ydocService.tablesMap!.set('ArticleTables', this.tables)
    this.ydocService.tablesMap?.set('tableCitatsObj', citatsBySection);
    this.prosemirrorEditorsService.dispatchEmptyTransaction()
    return citatsBySection
  }

  updateSingleTable(tableID: string, tableNodes: Node, table: citableTable) {
    let view = this.prosemirrorEditorsService.editorContainers[table.tablePlace].editorView
    let nodeStart: number = view.state.doc.nodeSize - 2
    let nodeEnd: number = view.state.doc.nodeSize - 2

    let foundPlace = false
    let foundContainer = false
    let tableisrendered = false

    this.tablesNumbers
    view.state.doc.forEach((node, offset, index) => {
      if (node.type.name == 'tables_nodes_container') {
        foundContainer = true;
        nodeStart = offset + node.nodeSize - 1
        nodeEnd = offset + node.nodeSize - 1
        node.forEach((tableNode, tabOffset, tagi) => {
          if (node.type.name == "block_table" && this.tablesNumbers?.indexOf(node.attrs.table_id)! > this.tablesNumbers?.indexOf(tableID)! && !foundPlace) {
            foundPlace = true
            nodeStart = offset + tabOffset + 1;
            nodeEnd = offset + tabOffset + 1
          } else if (node.type.name == "block_table" && this.tablesNumbers?.indexOf(node.attrs.table_id)! == this.tablesNumbers?.indexOf(tableID)! && !foundPlace) {
            tableisrendered = true
            foundPlace = true
            nodeStart = offset + tabOffset + 1;
            nodeEnd = offset + tabOffset + 1 + node.nodeSize
          }
        })
      }
    })
    let schema = view.state.schema as Schema
    if (!tableisrendered) {
      if (!foundContainer) {
        let container = schema.nodes.tables_nodes_container.create({}, tableNodes);
        view.dispatch(view.state.tr.replaceWith(nodeStart!, nodeEnd!, container))
      } else {
        view.dispatch(view.state.tr.replaceWith(nodeStart!, nodeEnd!, tableNodes))
      }
      this.countRenderedTables()
    }


  }

  countRenderedTables() {
    this.rendered++;
    let allTables = this.ydocService.tablesMap!.get('ArticleTables')
    if (Object.keys(allTables).length == this.rendered) {
      this.allTablesAreRendered()
    }
  }

  allTablesAreRendered() {
    setTimeout(() => {
      if (this.updatingTablesAndTablesCitations) {
        this.serviceShare.YjsHistoryService.stopCapturingUndoItem()
        this.updatingTablesAndTablesCitations = false;
      }
      if (this.updatingOnlyTablesView) {
        this.serviceShare.YjsHistoryService.stopCapturingUndoItem()
        this.updatingOnlyTablesView = false;
      }
      this.serviceShare.YjsHistoryService.stopBigNumberItemsCapturePrevention()
    }, 20)
  }

  removeFromEndEditor(tableID: string) {
    this.serviceShare.YjsHistoryService.preventCaptureOfLessUpcommingItems()
    let view = this.prosemirrorEditorsService.editorContainers['endEditor'].editorView
    let nodeStart: number = view.state.doc.nodeSize - 2
    let nodeEnd: number = view.state.doc.nodeSize - 2
    let foundExistingtable = false
    view.state.doc.nodesBetween(0, view.state.doc.nodeSize - 2, (node, pos, parent) => {
      if (node.type.name == "block_table" && node.attrs.table_id == tableID) {
        foundExistingtable = true
        nodeStart = pos;
        nodeEnd = pos + node.nodeSize
      }
    })
    let schema = view.state.schema
    let n = schema.nodes
    view.dispatch(view.state.tr.replaceWith(nodeStart!, nodeEnd!, Fragment.empty))
  }

  getTableCitations() {
    let citations: {
      [key: string]: {
        [key: string]: {
          displaydTablesViewhere: string[],
          tableIDs: string[],
          position: number
        }
      }
    } = {}
    let edCont = this.serviceShare.ProsemirrorEditorsService.editorContainers
    Object.keys(edCont).forEach((sectionid) => {
      let view = edCont[sectionid].editorView;
      if (!citations[sectionid]) {
        citations[sectionid] = {}
      }
      view.state.doc.nodesBetween(0, view.state.doc.nodeSize - 2, (node, pos, parent) => {
        if (node.marks.filter((mark) => { return mark.type.name == 'table_citation' }).length > 0) {
          console.log(node);
          let citationIsInCitableTable = false;
          let currLoopNode = node;
          //@ts-ignore
          while(currLoopNode&&currLoopNode.parent){
          //@ts-ignore
            if(currLoopNode.parent.type.name == "tables_nodes_container"){
              citationIsInCitableTable = true;
              currLoopNode = undefined;
            }else{
              //@ts-ignore
              currLoopNode = currLoopNode.parent
            }
          }
          let citationMark = node.marks.filter((mark) => { return mark.type.name == 'table_citation' })[0];
          let citatedTables = [...citationMark.attrs.citated_tables]
          let citateid = citationMark.attrs.citateid
          if(!citationIsInCitableTable){
            citations[sectionid][citateid] = {
              displaydTablesViewhere: [],
              tableIDs: citatedTables,
              position: pos
            }
          }
        }
      })
    })
    this.serviceShare.ProsemirrorEditorsService.editorContainers
    return citations
  }

  updateCitatsText(citats: { [sectionID: string]: { [citatID: string]: any } | undefined }) {
    this.tablesNumbers = this.ydocService.tablesMap!.get('ArticleTablesNumbers')
    let tableNumbers = this.tablesNumbers;
    Object.keys(citats).forEach((sectionID) => {
      if (citats[sectionID]) {
        Object.keys(citats[sectionID]!).forEach((citatID) => {
          if (!this.prosemirrorEditorsService.editorContainers[sectionID]) {
            //@ts-ignore
            citats[sectionID] = undefined
          } else {
            let edView = this.prosemirrorEditorsService.editorContainers[sectionID].editorView
            edView.state.doc.nodesBetween(0, edView.state.doc.nodeSize - 2, (node, pos, parent) => {
              if (node.marks.filter((mark) => { return mark.type.name == 'table_citation' }).length > 0) {
                let citationMark = node.marks.filter((mark) => { return mark.type.name == 'table_citation' })[0];
                if (citationMark.attrs.citateid == citatID) {
                  let citatedTables = [...citationMark.attrs.citated_tables]
                  let citatedTablesCopy = [...citationMark.attrs.citated_tables]
                  if (((citatedTablesCopy.length == 1 && tableNumbers?.indexOf(citatedTablesCopy[0]) == -1) ||
                    (citatedTablesCopy.length > 1 && citatedTablesCopy.filter((table) => { return tableNumbers?.indexOf(table) !== -1 }).length == 0))) {
                    if (citationMark.attrs.nonexistingtable !== 'true') {
                      let citateNodeText = ' Cited item deleted '
                      let newNode = (edView.state.schema as Schema).text(citateNodeText) as Node
                      newNode = newNode.mark([schema.mark('table_citation', { ...citationMark.attrs, nonexistingtable: 'true' })])
                      edView.dispatch(edView.state.tr.replaceWith(pos,
                        pos + node.nodeSize
                        , newNode).setMeta('citatsTextChange', true)
                      )
                    }
                  } else {
                    citatedTables = citatedTables.filter((tableID: string) => {
                      return tableNumbers.includes(tableID);
                    })
                    let citatString = citatedTables.length == 1 ? ' Table  ' : ' Tables.  '
                    let tablesArr: string[] = []
                    tableNumbers?.forEach((table, i) => {
                      if (citatedTables.indexOf(table) !== -1) {
                        tablesArr.push(`${i + 1}`);
                      }
                    })
                    citatString += tablesArr.join(', ')
                    citatString += ' '
                    let newNode = (edView.state.schema as Schema).text(citatString) as Node
                    newNode = newNode.mark([schema.mark('table_citation', { ...citationMark.attrs, citated_tabless: citatedTables, nonexistingtable: 'false' })])
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

  updateTablesNumbers(newTables: { [key: string]: citableTable; }, tableNumbers: string[]) {
    Object.keys(newTables).forEach((tableKey) => {
      let tableNumber = tableNumbers.indexOf(tableKey)
      newTables[tableKey].tableNumber = tableNumber
    })
  }

  writeTablesDataGlobalV2(citats, tableNums, tables) {
    let tableCitatsObj = JSON.parse(JSON.stringify(citats))
    let ArticleTablesNumbers = JSON.parse(JSON.stringify(tableNums))
    let ArticleTables = JSON.parse(JSON.stringify(tables))
    let fgsToSet = JSON.parse(JSON.stringify(ArticleTables))
    this.prosemirrorEditorsService.saveScrollPosition()
    this.updateTablesNumbers(ArticleTables, ArticleTablesNumbers)
    this.ydocService.tablesMap!.set('ArticleTablesNumbers', ArticleTablesNumbers)
    this.ydocService.tablesMap!.set('ArticleTables', ArticleTables)
    this.tablesNumbers = ArticleTablesNumbers
    this.tables = ArticleTables
    this.updateTablesAndTablesCitations(fgsToSet)
    this.ydocService.tablesMap?.set('tableCitatsObj', tableCitatsObj);
    this.prosemirrorEditorsService.applyLastScrollPosition();
  }

  writeTablesDataGlobal(newFigureNodes: { [key: string]: Node }, newTables: { [key: string]: citableTable; }, tableNumbers: string[], editedTables: { [key: string]: boolean }) {
    let oldCitats = JSON.parse(JSON.stringify(this.ydocService.tablesMap?.get('tableCitatsObj')));
    let oldFigsNums = JSON.parse(JSON.stringify(this.ydocService.tablesMap!.get('ArticleTablesNumbers')))
    let oldFigs = JSON.parse(JSON.stringify(this.ydocService.tablesMap!.get('ArticleTables')))
    this.serviceShare.YjsHistoryService!.startCapturingNewUndoItem();

    this.prosemirrorEditorsService.saveScrollPosition()
    this.updateTablesNumbers(newTables, tableNumbers)
    this.ydocService.tablesMap!.set('ArticleTablesNumbers', tableNumbers)
    this.ydocService.tablesMap!.set('ArticleTables', newTables)

    this.tablesNumbers = tableNumbers
    this.tables = newTables


    let citats = this.ydocService.tablesMap?.get('tableCitatsObj');
    this.serviceShare.YjsHistoryService!.addUndoItemInformation({
      type: 'citable-teble', data: {
        oldData: {
          tableCitatsObj: oldCitats,
          ArticleTablesNumbers: oldFigsNums,
          ArticleTables: oldFigs
        },
        newData: {
          tableCitatsObj: JSON.parse(JSON.stringify(citats)),
          ArticleTablesNumbers: JSON.parse(JSON.stringify(tableNumbers)),
          ArticleTables: JSON.parse(JSON.stringify(newTables))
        }
      }
    })
    this.updateTablesAndTablesCitations(JSON.parse(JSON.stringify(newTables)))
    this.ydocService.tablesMap?.set('articleCitatsObj', citats);
    this.prosemirrorEditorsService.applyLastScrollPosition();
  }

  displayTables(citats: {
    [key: string]: {
      [key: string]: {
        displaydTablesViewhere: string[],
        tableIDs: string[],
        position: number
      }
    }
  },newTables?:any) {
    if (this.sub) {
      return
    }
    let tables = newTables?newTables:this.ydocService.tablesMap.get('ArticleTables');
    let tablesTemplates = this.ydocService.tablesMap!.get('tablesTemplates');
    let DOMPMParser = DOMParser.fromSchema(schema)
    let numberOfTables = Object.values(tables).filter((table: any) => {
      return table.tablePlace !== 'endEditor'
    }).length
    if (numberOfTables == 0) {
      return
    }
    let doneEditing = new Subject();
    Object.keys(citats).forEach((sectionId) => {
      let view = this.prosemirrorEditorsService.editorContainers[sectionId].editorView;
      let citatsInEditor = citats[sectionId];
      Object.keys(citatsInEditor).forEach((citatId) => {
        let citat = citatsInEditor[citatId];
        let citatID = citatId

        let editTableContainer = (
          citatID: string,
          dispatchSubject: Subject<any>,
          tablesViewsToAdd: string[],
          edView: EditorView) => {
            tablesViewsToAdd.forEach((tableID) => {
            let tableData = tables[tableID];
            let tableTemplate = tablesTemplates[tableID];

            let serializedTableToFormIOsubmission: any = {}
            serializedTableToFormIOsubmission.tableComponents = tableData.components
            serializedTableToFormIOsubmission.tableDescription = tableData.description
            serializedTableToFormIOsubmission.tableID = tableData.tableID
            serializedTableToFormIOsubmission.tableNumber = tableData.tableNumber
            serializedTableToFormIOsubmission.viewed_by_citat = citatID
            let tableFormGroup = buildTableForm(serializedTableToFormIOsubmission)

            this.prosemirrorEditorsService.interpolateTemplate(tableTemplate!.html, serializedTableToFormIOsubmission, tableFormGroup).then((data: any) => {
              let templ = document.createElement('div')
              templ.innerHTML = data
              let Slice = DOMPMParser.parse(templ.firstChild!)
              dispatchSubject.next(
                {
                  citatID,
                  renderedData: Slice.content.firstChild,
                  edView,
                  tableData: tableData,
                })
            });
          })

        }
        if (citat.displaydTablesViewhere.length > 0) {
          editTableContainer(citatID, doneEditing, citat.displaydTablesViewhere, view)
        }
      })

    })
    let rendered = 0;
    let checkRendered = () => {
      rendered++;

      this.countRenderedTables()
      if (rendered == numberOfTables) {
        this.sub?.unsubscribe()
        this.sub = undefined
      }
    }
    this.sub = doneEditing.subscribe((data: any) => {
      try {
        let citatNewPosition: any
        let wrappingNodes = ['paragraph', 'heading', 'table', 'code_block', 'ordered_list', 'bullet_list', 'math_inline', 'math_display']
        let resolvedPositionOfCitat: any
        let posAtParentBorder: any
        let resolvedPositionATparentNodeBorder: any
        let updateMetaInfo = () => {
          let docSize = data.edView.state.doc.nodeSize
          data.edView.state.doc.nodesBetween(0, docSize - 2, (node: any, pos: any, i: any) => {
            let marks = node.marks.filter((mark: Mark) => { return mark.type.name == 'table_citation' })
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

          for (let i = resolvedCitationPath.length - 1; i > -1; i--) {
            let el = resolvedCitationPath[i];
            if (el instanceof Node) {
              if (el.type.name == "figures_nodes_container") {
                offsetOfwrappingParent = resolvedCitationPath[i - 1] as number
                wrappingParent = el
              }
            }
          }
          if(!wrappingParent){
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
          //@ts-ignore
          //parentIndexAndOffset = data.edView.state.doc.content.findIndex(citatNewPosition)
          /* parentNode = data.edView.state.doc.content.child(parentIndexAndOffset.index)
          posAtParentBorder = parentIndexAndOffset.offset + parentNode.nodeSize
          resolvedPositionATparentNodeBorder = data.edView.state.doc.resolve(posAtParentBorder) */

          contAfter = resolvedPositionATparentNodeBorder.nodeAfter!
        }

        let contAfter: Node | null
        updateMetaInfo()
        //@ts-ignore
        if (contAfter && contAfter.type.name == 'tables_nodes_container') {

          let insertFrom: number = posAtParentBorder + 1
          let tableIsRendered = false;
          contAfter.content.forEach((node, offset, index) => {
            if (node.attrs.table_number == data.tableData.tableNumber) {
              tableIsRendered = true
            }
            if (node.attrs.table_number < data.tableData.tableNumber) {
              insertFrom = posAtParentBorder + 1 + offset + node.nodeSize
            }
          })
          if (!tableIsRendered) {
            data.edView.dispatch(data.edView.state.tr.insert(insertFrom, data.renderedData))
          } else {
            let replaceStart: number = -1
            let replaceEnd: number = -1
            contAfter.forEach((node, offset, index) => {
              if (node.attrs.table_number == data.tableData.tableNumber) {
                replaceStart = posAtParentBorder + 1 + offset
                replaceEnd = posAtParentBorder + 1 + offset + node.nodeSize
              }
            })
            if (replaceStart !== -1) {
              data.edView.dispatch(data.edView.state.tr.replaceWith(replaceStart, replaceEnd, data.renderedData))
            }
          }
        } else {
          if (!resolvedPositionATparentNodeBorder) {
            return
          }
          let container = schema.nodes.tables_nodes_container.create({}, data.renderedData);
          data.edView.dispatch(data.edView.state.tr.insert(resolvedPositionATparentNodeBorder.pos, container))
        }
        checkRendered()
      } catch (e) {
        console.error(e);
      }
    })
  }

  updatingTablesAndTablesCitations = false
  updateTablesAndTablesCitations(newTables?:any) {
    this.updatingTablesAndTablesCitations = true
    this.serviceShare.YjsHistoryService.preventCaptureOfBigNumberOfUpcomingItems()
    let citations = this.getTableCitations()
    this.updateCitatsText(citations);
    let newCitatsObj = this.markTableCitatsViews(citations)
    this.ydocService.tablesMap?.set('tableCitatsObj', newCitatsObj)
    this.displayTables(newCitatsObj,newTables)
  }

  updatingOnlyTablesView = false;
  updateOnlyTablesView() {
    this.updatingOnlyTablesView = true
    this.serviceShare.YjsHistoryService.preventCaptureOfBigNumberOfUpcomingItems()

    let citations = this.getTableCitations()
    let newCitatsObj = this.markTableCitatsViews(citations)
    this.ydocService.tablesMap?.set('tableCitatsObj', newCitatsObj)
    this.displayTables(newCitatsObj)

  }
}
