import { createViewChild, ViewFlags } from '@angular/compiler/src/core';
import { AfterViewInit, Injectable, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { Fragment, Mark, MarkType, Node, Schema, Slice } from 'prosemirror-model';
import { EditorState, Transaction } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { figure, figure_component } from '../utils/interfaces/figureComponent';
import { endEditorNodes, endEditorSchema, schema } from '../utils/Schema';
import { editorContainer, ProsemirrorEditorsService } from './prosemirror-editors.service';
import { YdocService } from './ydoc.service';
import { DOMParser } from 'prosemirror-model';
import { indexOf, remove } from 'lodash';
import { uuidv4 } from 'lib0/random';
import { articleSection } from '../utils/interfaces/articleSection';
import { Transform } from 'prosemirror-transform';
import { debug } from 'console';
import { I } from '@angular/cdk/keycodes';
import { viewClassName } from '@angular/compiler';
import { ServiceShare } from './service-share.service';
import * as Y from 'yjs'
//@ts-ignore
import { ySyncPluginKey } from '../../y-prosemirror-src/plugins/keys.js';
//@ts-ignore
import { updateYFragment } from '../../y-prosemirror-src/plugins/sync-plugin.js'
import { buildFigureForm } from '../utils/prosemirrorHelpers';
import { Subject, Subscriber, Subscription } from 'rxjs';
import { citationShouldBeIgnored, getElementWithLargestNumberInCitationWithNestedElement } from '../utils/citableElementsHelpers';

@Injectable({
  providedIn: 'root'
})
export class FiguresControllerService {

  DOMPMParser = DOMParser.fromSchema(schema)
  /* figuresArray: figure[] = []
  figuresFormGroups:FormArray = new FormArray([]) */
  endEditorContainer?: editorContainer
  figuresNumbers?: string[] = []
  figures: { [key: string]: figure } = {}
  renderEditorFn: any

  resetFiguresControllerService() {
    this.endEditorContainer = undefined
    this.figuresNumbers = []
    this.figures = {}
    this.renderEditorFn = undefined
    this.sub = undefined
  }

  constructor(
    private ydocService: YdocService,
    private prosemirrorEditorsService: ProsemirrorEditorsService,
    private serviceShare: ServiceShare,
  ) {
    this.serviceShare.shareSelf('FiguresControllerService', this)
    if (this.ydocService.editorIsBuild) {
      this.initFigures()
      this.ydocService.ydocStateObservable.subscribe((event) => {
        if (event == 'docIsBuild') {
          this.initFigures()
        }
      });
    } else {
      this.ydocService.ydocStateObservable.subscribe((event) => {
        if (event == 'docIsBuild') {
          this.initFigures()
        }
      });
    }
    this.prosemirrorEditorsService.setFigureRerenderFunc(this.markCitatsViews);
  }

  initFigures() {
    let figuresNumbersFromYMap = this.ydocService.figuresMap?.get('ArticleFiguresNumbers');
    let figuresFromYdoc = this.ydocService.figuresMap!.get('ArticleFigures');
    this.figures = figuresFromYdoc;
    this.figuresNumbers = figuresNumbersFromYMap
  }

  rendered = 0;

  allFigsAreRendered() {
    setTimeout(() => {
      if (this.updatingFiguresAndFiguresCitations) {
        this.serviceShare.YjsHistoryService.stopCapturingUndoItem()
        this.updatingFiguresAndFiguresCitations = false;
      }
      if (this.updatingOnlyFiguresView) {
        this.serviceShare.YjsHistoryService.stopCapturingUndoItem()
        this.updatingOnlyFiguresView = false;
      }
      this.serviceShare.YjsHistoryService.stopBigNumberItemsCapturePrevention()
    }, 20)
  }

  resetCountedRenderedViews() {
    this.rendered = 0;
  }

  countRenderedFigures() {
    this.rendered++;
    let allFigs = this.ydocService.figuresMap!.get('ArticleFigures')
    if (Object.keys(allFigs).length == this.rendered) {
      this.allFigsAreRendered()
    }
  }

  updateCitatsText(citats: { [sectionID: string]: { [citatID: string]: any } | undefined }) {
    this.figuresNumbers = this.ydocService.figuresMap!.get('ArticleFiguresNumbers')
    let figNumbers = this.figuresNumbers;
    Object.keys(citats).forEach((sectionID) => {
      if (citats[sectionID]) {
        Object.keys(citats[sectionID]!).forEach((citatID) => {
          if (!this.prosemirrorEditorsService.editorContainers[sectionID]) {
            //@ts-ignore
            citats[sectionID] = undefined
          } else {
            let edView = this.prosemirrorEditorsService.editorContainers[sectionID].editorView
            if (!citats[sectionID][citatID].nonFigureCitation) {
              edView.state.doc.nodesBetween(0, edView.state.doc.nodeSize - 2, (node, pos, parent) => {
                if (node.marks.filter((mark) => { return mark.type.name == 'citation' }).length > 0) {
                  let citationMark = node.marks.filter((mark) => { return mark.type.name == 'citation' })[0];
                  if (citationMark.attrs.citateid == citatID) {
                    let citatedFigures = [...citationMark.attrs.citated_figures]

                    let citFigureClearFromComponents: string[] = []
                    let citFigureComponents: { [key: string]: string[] } = {}
                    citatedFigures.forEach((fig: String) => {
                      let data = fig.split('|')
                      let figID = data[0]
                      if (data[1]) {
                        if (!citFigureComponents[figID]) {
                          citFigureComponents[figID] = []
                        }
                        citFigureComponents[figID].push(data[1])
                      }
                      if (citFigureClearFromComponents.indexOf(figID) == -1) {
                        citFigureClearFromComponents.push(figID)
                      }
                    })
                    if (((citFigureClearFromComponents.length == 1 && figNumbers?.indexOf(citFigureClearFromComponents[0]) == -1) ||
                      (citFigureClearFromComponents.length > 1 && citFigureClearFromComponents.filter((fig) => { return figNumbers?.indexOf(fig) !== -1 }).length == 0))) {
                      if (citationMark.attrs.nonexistingFigure !== 'true') {
                        let citateNodeText = ' Cited item deleted '
                        let newNode = (edView.state.schema as Schema).text(citateNodeText) as Node
                        newNode = newNode.mark([schema.mark('citation', { ...citationMark.attrs, nonexistingFigure: 'true' })])
                        edView.dispatch(edView.state.tr.replaceWith(pos,
                          pos + node.nodeSize
                          , newNode).setMeta('citatsTextChange', true)
                        )
                      }
                    } else {
                      citFigureClearFromComponents.forEach((fig) => {
                        if (figNumbers?.indexOf(fig) == -1) {
                          citatedFigures = citatedFigures.filter((figureID: string) => {
                            let data = figureID.split('|')
                            if (data[0] == fig) {
                              return false
                            }
                            return true
                          })
                        }
                      })
                      let citatString = citFigureClearFromComponents.length == 1 ? ' Fig.  ' : ' Figs.  '
                      let figsArr: string[] = []
                      figNumbers?.forEach((fig, i) => {
                        if (citFigureClearFromComponents.indexOf(fig) !== -1) {
                          if (citFigureComponents[fig]) {
                            citFigureComponents[fig].forEach((figComponent, j) => {
                              if (j == 0) {
                                figsArr.push(`${i + 1}${String.fromCharCode(97 + +figComponent)}`)
                              } else {
                                figsArr.push(`${String.fromCharCode(97 + +figComponent)}`)
                              }
                            })
                          } else {
                            figsArr.push(`${i + 1}`)
                          }
                        }
                      })
                      citatString += figsArr.join(', ')
                      citatString += ' '
                      let newNode = (edView.state.schema as Schema).text(citatString) as Node
                      newNode = newNode.mark([schema.mark('citation', { ...citationMark.attrs, citated_figures: citatedFigures, nonexistingFigure: 'false' })])
                      edView.dispatch(edView.state.tr.replaceWith(pos,
                        pos + node.nodeSize
                        , newNode).setMeta('citatsTextChange', true)
                      )
                    }
                  }
                }
              })
            }
          }
        })
      }
    })
  }

  updateFiguresNumbers(newFigures: { [key: string]: figure; }, figureNumbers: string[]) {
    Object.keys(newFigures).forEach((figureKey) => {
      let figNumber = figureNumbers.indexOf(figureKey)
      newFigures[figureKey].figureNumber = figNumber
    })
    let s = newFigures
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

  writeFiguresDataGlobalV2(citats, figNums, figs) {
    let articleCitatsObj = JSON.parse(JSON.stringify(citats))
    let ArticleFiguresNumbers = JSON.parse(JSON.stringify(figNums))
    let ArticleFigures = JSON.parse(JSON.stringify(figs))
    Object.keys(ArticleFigures).forEach((key) => {
      this.getFigureRowsOrderData(ArticleFigures[key].canvasData);
    })
    let fgsToSet = JSON.parse(JSON.stringify(ArticleFigures))
    this.prosemirrorEditorsService.saveScrollPosition()
    this.updateFiguresNumbers(ArticleFigures, ArticleFiguresNumbers)
    this.ydocService.figuresMap!.set('ArticleFiguresNumbers', ArticleFiguresNumbers)
    this.ydocService.figuresMap!.set('ArticleFigures', ArticleFigures)
    this.figuresNumbers = ArticleFiguresNumbers
    this.figures = ArticleFigures
    this.serviceShare.updateCitableElementsViewsAndCites(fgsToSet, undefined);
    //this.updateFiguresAndFiguresCitations(fgsToSet)
    this.ydocService.figuresMap?.set('articleCitatsObj', articleCitatsObj);
    this.prosemirrorEditorsService.applyLastScrollPosition();
  }

  writeFiguresDataGlobal(newFigureNodes: { [key: string]: Node }, newFigures: { [key: string]: figure; }, figureNumbers: string[], editedFigures: { [key: string]: boolean }) {
    let oldCitats = JSON.parse(JSON.stringify(this.ydocService.figuresMap?.get('articleCitatsObj')));
    let oldFigsNums = JSON.parse(JSON.stringify(this.ydocService.figuresMap!.get('ArticleFiguresNumbers')))
    let oldFigs = JSON.parse(JSON.stringify(this.ydocService.figuresMap!.get('ArticleFigures')))
    this.serviceShare.YjsHistoryService!.startCapturingNewUndoItem();
    Object.keys(newFigures).forEach((key) => {
      this.getFigureRowsOrderData(newFigures[key].canvasData/* ,newFigures,key */);
    })
    this.prosemirrorEditorsService.saveScrollPosition()
    this.updateFiguresNumbers(newFigures, figureNumbers)
    this.ydocService.figuresMap!.set('ArticleFiguresNumbers', figureNumbers)
    this.ydocService.figuresMap!.set('ArticleFigures', newFigures)

    this.figuresNumbers = figureNumbers
    this.figures = newFigures


    let citats = this.ydocService.figuresMap?.get('articleCitatsObj');
    this.serviceShare.YjsHistoryService!.addUndoItemInformation({
      type: 'figure', data: {
        oldData: {
          articleCitatsObj: oldCitats,
          ArticleFiguresNumbers: oldFigsNums,
          ArticleFigures: oldFigs
        },
        newData: {
          articleCitatsObj: JSON.parse(JSON.stringify(citats)),
          ArticleFiguresNumbers: JSON.parse(JSON.stringify(figureNumbers)),
          ArticleFigures: JSON.parse(JSON.stringify(newFigures))
        }
      }
    })
    //this.updateFiguresAndFiguresCitations(JSON.parse(JSON.stringify(newFigures)))
    this.serviceShare.updateCitableElementsViewsAndCites(JSON.parse(JSON.stringify(newFigures)), undefined)
    this.ydocService.figuresMap?.set('articleCitatsObj', citats);

    /* try {
      //this.ydocService.figuresMap?.set('ArticleFigures', data);
      this.figuresData = data
      this.updateAllFigures()
    } catch (e) {
      console.error(e);
    } */
    this.prosemirrorEditorsService.applyLastScrollPosition();
  }

  citateFigures(selectedFigures: boolean[], figuresComponentsChecked: { [key: string]: boolean[] }, sectionID: string, citatAttrs: any) {
    try {
      this.serviceShare.YjsHistoryService.startCapturingNewUndoItem();
      if (!this.figuresNumbers || !this.figures) {
        this.figuresNumbers = this.ydocService.figuresMap!.get('ArticleFiguresNumbers')
        this.figures = this.ydocService.figuresMap!.get('ArticleFigures')
      }
      //check selections
      let insertionView = this.prosemirrorEditorsService.editorContainers[sectionID].editorView
      let citatStartPos: number
      let citatEndPos: number

      if (citatAttrs) {
        let citatId = citatAttrs.citateid
        insertionView.state.doc.nodesBetween(0, insertionView.state.doc.nodeSize - 2, (node, pos, parent) => {
          if (node.marks.filter((mark) => { return mark.type.name == 'citation' }).length > 0) {
            let citationMark = node.marks.filter((mark) => { return mark.type.name == 'citation' })[0];
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
        this.serviceShare.YjsHistoryService.addUndoItemInformation({
          type: 'figure-citation',
          data: {}
        })
        //this.updateOnlyFiguresView()
        this.serviceShare.updateCitableElementsViews()
        return
      }

      /* ``` citats obj type
      citats:{
        [key:string](articleSectionID):{
          [key:string](citatID):{
            figureIDs:string[](citatesFiguresIDs),
            position:number(positioninEditor)
          }
        }
      }
      */
      let citatString = selectedFigures.filter(e => e).length > 1 ? ' Figs.  ' : ' Fig.  ';
      let citated: any = []
      selectedFigures.forEach((fig, index) => {
        if (fig) {
          citated.push(index + 1)
          if (figuresComponentsChecked[this.figuresNumbers![index]].filter(e => !e).length > 0) {
            let count = 0
            figuresComponentsChecked[this.figuresNumbers![index]].forEach((comp, j) => {
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
          if (figuresComponentsChecked[this.figuresNumbers![index]].filter(e => e).length == figuresComponentsChecked[this.figuresNumbers![index]].length) {// means the whole figure is citated
            //citated.push(index + 1)
            //citatString +=  ${index + 1}`
            return prev.concat(curr ? [this.figuresNumbers![index]] : []);
          } else {
            //citated.push(index + 1)
            //citatString += ` ${index + 1}`
            let idsWithComponents = figuresComponentsChecked[this.figuresNumbers![index]].reduce<string[]>((p, c, i) => {
              //citatString += c ? `${String.fromCharCode(97 + i)}, ` : ''
              //return prev
              return p.concat(c ? [this.figuresNumbers![index] + '|' + i] : [])
            }, [])
            return prev.concat(idsWithComponents);
          }
          return prev.concat(curr ? [this.figuresNumbers![index]] : []);
        } else {
          return prev;
        }
      }, [])


      let citateNodeText = citatString
      let node = (insertionView.state.schema as Schema).text(citateNodeText) as Node
      let mark = (insertionView.state.schema as Schema).mark('citation', {
        "citated_figures": citatedFigureIds,
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
        type: 'figure-citation',
        data: {}
      })
      //this.updateOnlyFiguresView()
      this.serviceShare.updateCitableElementsViews()
    } catch (e) {
      console.error(e);
    }
  }

  markCitatsViews = (citatsBySection: any) => {
    this.resetCountedRenderedViews();
    let numbersCopy: string[] = JSON.parse(JSON.stringify(this.figuresNumbers));
    let tableNembersCopy: string[] = this.ydocService.tablesMap.get('ArticleTablesNumbers');

    this.figures = this.ydocService.figuresMap!.get('ArticleFigures')
    Object.keys(this.prosemirrorEditorsService.editorContainers).forEach((key) => {
      let containersCount = 0
      let view = this.prosemirrorEditorsService.editorContainers[key].editorView;
      view.state.doc.descendants((el) => {
        if (el.type.name == 'figures_nodes_container') {
          containersCount++;
        }
      })
      let deleted = false;
      let tr1: Transaction
      let del = () => {
        deleted = false
        tr1 = view.state.tr
        view.state.doc.descendants((node, position, parent) => {
          if (node.type.name == 'figures_nodes_container' && !deleted) {
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
    let viewsDisplayed: boolean[] = numbersCopy.map((figureID) => { return false });
    let tableViewsDisplayed: boolean[] = tableNembersCopy.map((figureID) => { return false });

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
        let biggestFigureNumberInCitat = -1;
        let displayedFiguresViewHere: string[] = []
        if (citatData[1].nonFigureCitation ) {

          let citedTablesOnCitat: string[] = citatData[1].tableIDs;
          let deletedTablesOnCitat = citedTablesOnCitat.reduce<string[]>((prev, tableID, i) => {
            let data = tableID.split("|")
            let tID = data[0]!
            if (tableNembersCopy.indexOf(tID) == -1) {
              return prev.concat([tableID])
            }
            return prev
          }, [])
          if (!citatsBySection[sectionID][citatData[0]].displaydtablesViewhere) {
            citatsBySection[sectionID][citatData[0]].displaydtablesViewhere = []
          }
          let displayedTablesViewHere = displayedFiguresViewHere;
          let biggestTableNumberInCitat = biggestFigureNumberInCitat;
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
              let tNumber = tableNembersCopy.indexOf(tID)

              if (tNumber > biggestTableNumberInCitat) {
                biggestTableNumberInCitat = tNumber
              }
            })
            for (let i = 0; i <= biggestTableNumberInCitat; i++) {
              if (!tableViewsDisplayed[i]) {
                displayedTablesViewHere.push(tableNembersCopy[i])
                //citatsBySection[sectionID][citatData[0]].displaydtablesViewhere.push(numbersCopy[i])
                tableViewsDisplayed[i] = true
              }
            }
          }

        } else {
          let citatedFiguresOnCitat: string[] = citatData[1].figureIDs;
          let deletedFiguresOnCitat = citatedFiguresOnCitat.reduce<string[]>((prev, figureID, i) => {
            let data = figureID.split("|")
            let figID = data[0]!
            if (numbersCopy.indexOf(figID) == -1) {
              return prev.concat([figureID])
            }
            return prev
          }, [])
          if (!citatsBySection[sectionID][citatData[0]].displaydFiguresViewhere) {
            citatsBySection[sectionID][citatData[0]].displaydFiguresViewhere = []
          }
          if (deletedFiguresOnCitat.length < citatedFiguresOnCitat.length) {
            deletedFiguresOnCitat.forEach((figID) => {
              citatedFiguresOnCitat.splice(citatedFiguresOnCitat.indexOf(figID!), 1)
            })
            citatedFiguresOnCitat.forEach((figureID) => { // find the figure with biggest index on this citat
              let figID: string
              let componentId: string
              let data = figureID.split("|")
              figID = data[0]
              componentId = data[1]
              let figNumber = numbersCopy.indexOf(figID)

              if (figNumber > biggestFigureNumberInCitat) {
                biggestFigureNumberInCitat = figNumber
              }
            })
            for (let i = 0; i <= biggestFigureNumberInCitat; i++) {
              if (!viewsDisplayed[i]) {
                displayedFiguresViewHere.push(numbersCopy[i])

                if (this.figures[numbersCopy[i]].figurePlace == 'endEditor') {
                  this.removeFromEndEditor(numbersCopy[i])
                }
                this.figures[numbersCopy[i]].figurePlace = sectionID
                this.figures[numbersCopy[i]].viewed_by_citat = citatData[0];
                //citatsBySection[sectionID][citatData[0]].displaydFiguresViewhere.push(numbersCopy[i])
                viewsDisplayed[i] = true
              }
            }
          }
        }
        let displayedType:'table'|'figure' = citatData[1].nonFigureCitation?'table':'figure'
        let highestNumFigInNestedCitation = getElementWithLargestNumberInCitationWithNestedElement(
          displayedFiguresViewHere,
          numbersCopy,
          tableNembersCopy,
          'figure',
          this.serviceShare,
          citatsBySection[sectionID][citatData[0]].citatType,
          displayedType)
        console.log(highestNumFigInNestedCitation);
        if(citatData[1].nonFigureCitation){
          biggestFigureNumberInCitat = -1;
          displayedFiguresViewHere = [];
        }
        if (highestNumFigInNestedCitation > biggestFigureNumberInCitat) {
          for (let i = biggestFigureNumberInCitat + 1; i <= highestNumFigInNestedCitation; i++) {
            if (!viewsDisplayed[i]) {
              displayedFiguresViewHere.push(numbersCopy[i])

              if (this.figures[numbersCopy[i]].figurePlace == 'endEditor') {
                this.removeFromEndEditor(numbersCopy[i])
              }
              this.figures[numbersCopy[i]].figurePlace = sectionID
              this.figures[numbersCopy[i]].viewed_by_citat = citatData[0];
              //citatsBySection[sectionID][citatData[0]].displaydFiguresViewhere.push(numbersCopy[i])
              viewsDisplayed[i] = true
            }
          }
        }

        /* if(displayedFiguresViewHere.length!==citatsBySection[sectionID][citatData[0]].displaydFiguresViewhere.length||!displayedFiguresViewHere.reduce<boolean>((prev,figureID,i)=>{
          if(!citatsBySection[sectionID][citatData[0]].displaydFiguresViewhere.includes(figureID)){
            return (prev&&false)
          }
          return (prev&&true)
        },true)){
        } */
        citatsBySection[sectionID][citatData[0]].lastTimeUpdated = new Date().getTime();
        citatsBySection[sectionID][citatData[0]].displaydFiguresViewhere = displayedFiguresViewHere;

      })
    })
    this.figures = this.ydocService.figuresMap!.set('ArticleFigures', this.figures)
    viewsDisplayed.forEach((view, index) => {
      if (view == false) {
        this.figures[numbersCopy[index]].figurePlace = 'endEditor'
        let figureTemplate = this.ydocService.figuresMap?.get('figuresTemplates')[numbersCopy[index]];

        let figureData = this.figures[numbersCopy[index]]
        let serializedFigureToFormIOsubmission: any = {}
        serializedFigureToFormIOsubmission.figureComponents = figureData.components.reduce((prev: any[], curr: any, i: number) => {
          return prev.concat([{ container: curr }])
        }, [])
        serializedFigureToFormIOsubmission.figureDescription = figureData.description
        serializedFigureToFormIOsubmission.figureID = figureData.figureID
        serializedFigureToFormIOsubmission.figureNumber = figureData.figureNumber
        let figureFormGroup = buildFigureForm(serializedFigureToFormIOsubmission)
        this.prosemirrorEditorsService.interpolateTemplate(figureTemplate.html, serializedFigureToFormIOsubmission, figureFormGroup).then((data: string) => {
          let templ = document.createElement('div')
          templ.innerHTML = data
          let pmnodes = this.DOMPMParser.parse(templ.firstChild!).content.firstChild;
          this.updateSingleFigure(numbersCopy[index], pmnodes!, figureData);
        })
      }
    })
    this.ydocService.figuresMap!.set('ArticleFigures', this.figures)
    this.ydocService.figuresMap?.set('articleCitatsObj', citatsBySection);
    this.prosemirrorEditorsService.dispatchEmptyTransaction()
    return citatsBySection
  }

  removeFromEndEditor(figureID: string) {
    this.serviceShare.YjsHistoryService.preventCaptureOfLessUpcommingItems()
    let view = this.prosemirrorEditorsService.editorContainers['endEditor'].editorView
    let nodeStart: number = view.state.doc.nodeSize - 2
    let nodeEnd: number = view.state.doc.nodeSize - 2
    let foundExistingFigure = false
    view.state.doc.nodesBetween(0, view.state.doc.nodeSize - 2, (node, pos, parent) => {
      if (node.type.name == "block_figure" && node.attrs.figure_id == figureID) {
        foundExistingFigure = true
        nodeStart = pos;
        nodeEnd = pos + node.nodeSize
      }
    })
    let schema = view.state.schema
    let n = schema.nodes
    view.dispatch(view.state.tr.replaceWith(nodeStart!, nodeEnd!, Fragment.empty).setMeta('citable-elements-rerender', true))
  }

  updateSingleFigure(figureID: string, figureNodes: Node, figure: figure) {
    let view = this.prosemirrorEditorsService.editorContainers[figure.figurePlace].editorView
    let nodeStart: number = view.state.doc.nodeSize - 2
    let nodeEnd: number = view.state.doc.nodeSize - 2

    let foundPlace = false
    let foundContainer = false
    let figureisrendered = false

    this.figuresNumbers
    view.state.doc.forEach((node, offset, index) => {
      if (node.type.name == 'figures_nodes_container') {
        foundContainer = true;
        nodeStart = offset + node.nodeSize - 1
        nodeEnd = offset + node.nodeSize - 1
        node.forEach((figureNode, figOffset, figi) => {
          if (node.type.name == "block_figure" && this.figuresNumbers?.indexOf(node.attrs.figure_id)! > this.figuresNumbers?.indexOf(figureID)! && !foundPlace) {
            foundPlace = true
            nodeStart = offset + figOffset + 1;
            nodeEnd = offset + figOffset + 1
          } else if (node.type.name == "block_figure" && this.figuresNumbers?.indexOf(node.attrs.figure_id)! == this.figuresNumbers?.indexOf(figureID)! && !foundPlace) {
            figureisrendered = true
            foundPlace = true
            nodeStart = offset + figOffset + 1;
            nodeEnd = offset + figOffset + 1 + node.nodeSize
          }
        })
      }
    })
    let schema = view.state.schema as Schema
    if (!figureisrendered) {
      if (!foundContainer) {
        let container = schema.nodes.figures_nodes_container.create({}, figureNodes);
        view.dispatch(view.state.tr.replaceWith(nodeStart!, nodeEnd!, container).setMeta('citable-elements-rerender', true))
      } else {
        view.dispatch(view.state.tr.replaceWith(nodeStart!, nodeEnd!, figureNodes).setMeta('citable-elements-rerender', true))
      }
      this.countRenderedFigures()
    }


  }

  getFigureCitations() {
    let citations: {
      [key: string]: {
        [key: string]: {
          displaydFiguresViewhere: string[],
          figureIDs: string[],
          position: number,
          nonFigureCitation: boolean,
          citatType: string
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
        if (node.marks.filter((mark) => { return (mark.type.name == 'citation' || mark.type.name == 'table_citation') }).length > 0) {
          let markResolvePos = view.state.doc.resolve(pos);
          //@ts-ignore
          let posPath = markResolvePos.path;
          let ignoringCitation = citationShouldBeIgnored(posPath)

          let citationMark = node.marks.filter((mark) => { return (mark.type.name == 'citation' || mark.type.name == 'table_citation') })[0];
          let nonFigureCitation = citationMark.type.name != 'citation'
          let citatedFigures = nonFigureCitation ? [...citationMark.attrs.citated_tables] : [...citationMark.attrs.citated_figures]
          let citateid = citationMark.attrs.citateid
          if (!ignoringCitation) {
            citations[sectionid][citateid] = {
              displaydFiguresViewhere: [],
              figureIDs: citatedFigures,
              position: pos,
              nonFigureCitation,
              citatType: citationMark.type.name
            }
            if (nonFigureCitation) {
              let citateid = citationMark.attrs.citateid
              if (!ignoringCitation) {
                citations[sectionid][citateid] = {
                  //@ts-ignore
                  displaydTablesViewhere: [],
                  //@ts-ignore
                  tableIDs: citatedFigures,
                  position: pos,
                  //@ts-ignore
                  nonFigureCitation,
                  citatType: citationMark.type.name
                }
              }
            }
          }
        }
      })
    })
    this.serviceShare.ProsemirrorEditorsService.editorContainers
    return citations
  }

  sub?: Subscription

  displayFigures(citats: {
    [key: string]: {
      [key: string]: {
        displaydFiguresViewhere: string[],
        figureIDs: string[],
        position: number,
        nonFigureCitation: boolean,
        citatType: string
      }
    }
  }, newFigures?: any) {
    if (this.sub) {
      return
    }
    let figures = newFigures ? newFigures : this.ydocService.figuresMap.get('ArticleFigures');
    let figuresTemplates = this.ydocService.figuresMap!.get('figuresTemplates');
    let DOMPMParser = DOMParser.fromSchema(schema)
    let numberOfFigures = Object.values(figures).filter((fig: any) => {
      return fig.figurePlace !== 'endEditor'
    }).length
    if (numberOfFigures == 0) {
      return
    }
    let doneEditing = new Subject();
    Object.keys(citats).forEach((sectionId) => {
      let view = this.prosemirrorEditorsService.editorContainers[sectionId].editorView;
      let citatsInEditor = citats[sectionId];
      Object.keys(citatsInEditor).forEach((citatId) => {
        let citat = citatsInEditor[citatId];
        let citatID = citatId
        console.log(citat);
        let editFigureContainer = (
          citatID: string,
          dispatchSubject: Subject<any>,
          figureViewsToAdd: string[],
          edView: EditorView) => {
          figureViewsToAdd.forEach((figureID) => {
            let figureData = figures[figureID];
            let figureTemplate = figuresTemplates[figureID];

            let serializedFigureToFormIOsubmission: any = {}
            serializedFigureToFormIOsubmission.figureComponents = figureData.components.reduce((prev: any[], curr: any, i: number) => {
              return prev.concat([{ container: curr }])
            }, [])
            serializedFigureToFormIOsubmission.figureDescription = figureData.description
            serializedFigureToFormIOsubmission.figureID = figureData.figureID
            serializedFigureToFormIOsubmission.figureNumber = figureData.figureNumber
            serializedFigureToFormIOsubmission.viewed_by_citat = citatID
            let figureFormGroup = buildFigureForm(serializedFigureToFormIOsubmission)
            this.prosemirrorEditorsService.interpolateTemplate(figureTemplate!.html, serializedFigureToFormIOsubmission, figureFormGroup).then((data: any) => {
              let templ = document.createElement('div')
              templ.innerHTML = data
              let Slice = DOMPMParser.parse(templ.firstChild!)
              dispatchSubject.next(
                {
                  citatID,
                  renderedData: Slice.content.firstChild,
                  edView,
                  figureData: figureData,
                })
            });
          })

        }
        if (citat.displaydFiguresViewhere.length > 0) {
          editFigureContainer(citatID, doneEditing, citat.displaydFiguresViewhere, view)
        }
      })

    })
    let rendered = 0;
    let checkRendered = () => {
      rendered++;

      this.countRenderedFigures()
      if (rendered == numberOfFigures) {
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
            let marks = node.marks.filter((mark: Mark) => { return (mark.type.name == 'citation'||mark.type.name == 'table_citation') })
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
              if (el.type.name == "tables_nodes_container") {
                offsetOfwrappingParent = resolvedCitationPath[i - 1] as number
                wrappingParent = el
              }
            }
          }
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
        if (contAfter && contAfter.type.name == 'figures_nodes_container') {

          let insertFrom: number = posAtParentBorder + 1
          let figureIsRendered = false;
          contAfter.content.forEach((node, offset, index) => {
            if (node.attrs.figure_number == data.figureData.figureNumber) {
              figureIsRendered = true
            }
            if (node.attrs.figure_number < data.figureData.figureNumber) {
              insertFrom = posAtParentBorder + 1 + offset + node.nodeSize
            }
          })
          if (!figureIsRendered) {
            data.edView.dispatch(data.edView.state.tr.insert(insertFrom, data.renderedData).setMeta('citable-elements-rerender', true))
          } else {
            let replaceStart: number = -1
            let replaceEnd: number = -1
            contAfter.forEach((node, offset, index) => {
              if (node.attrs.figure_number == data.figureData.figureNumber) {
                replaceStart = posAtParentBorder + 1 + offset
                replaceEnd = posAtParentBorder + 1 + offset + node.nodeSize
              }
            })
            if (replaceStart !== -1) {
              data.edView.dispatch(data.edView.state.tr.replaceWith(replaceStart, replaceEnd, data.renderedData).setMeta('citable-elements-rerender', true))
            }
          }
        } else {
          if (!resolvedPositionATparentNodeBorder) {
            return
          }
          let container = schema.nodes.figures_nodes_container.create({}, data.renderedData);
          data.edView.dispatch(data.edView.state.tr.insert(resolvedPositionATparentNodeBorder.pos, container).setMeta('citable-elements-rerender', true))
        }
        checkRendered()
      } catch (e) {
        console.error(e);
      }
    })
  }
  updatingFiguresAndFiguresCitations = false
  updateFiguresAndFiguresCitations(newFigures?: any) {
    this.updatingFiguresAndFiguresCitations = true
    this.serviceShare.YjsHistoryService.preventCaptureOfBigNumberOfUpcomingItems();
    let citations = this.getFigureCitations();
    this.updateCitatsText(citations);
    let newCitatsObj = this.markCitatsViews(citations);
    this.ydocService.figuresMap?.set('articleCitatsObj', newCitatsObj);
    this.displayFigures(newCitatsObj, newFigures);
  }

  updatingOnlyFiguresView = false;
  updateOnlyFiguresView() {
    this.updatingOnlyFiguresView = true
    this.serviceShare.YjsHistoryService.preventCaptureOfBigNumberOfUpcomingItems();
    let citations = this.getFigureCitations();
    let newCitatsObj = this.markCitatsViews(citations);
    this.ydocService.figuresMap?.set('articleCitatsObj', newCitatsObj);
    this.displayFigures(newCitatsObj);
  }
}
