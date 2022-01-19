import { createViewChild, ViewFlags } from '@angular/compiler/src/core';
import { AfterViewInit, Injectable, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { Fragment, Mark, MarkType, Node, Schema, Slice } from 'prosemirror-model';
import { EditorState, Transaction } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { figure, figure_component } from '../utils/interfaces/figureComponent';
import { endEditorNodes, endEditorSchema, schema } from '../utils/Schema';
import { ProsemirrorEditorsService } from './prosemirror-editors.service';
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
@Injectable({
  providedIn: 'root'
})
export class FiguresControllerService {

  DOMPMParser = DOMParser.fromSchema(schema)
  /* figuresArray: figure[] = []
  figuresFormGroups:FormArray = new FormArray([]) */
  endEditorContainer?: {
    editorID: string,
    containerDiv: HTMLDivElement,
    editorState: EditorState,
    editorView: EditorView,
    dispatchTransaction: any
  }
  figuresNumbers?: string[] = []
  figures: { [key: string]: figure } = {}
  renderEditorFn: any

  resetFiguresControllerService (){
    this.endEditorContainer = undefined
    this.figuresNumbers = []
    this.figures = {}
    this.renderEditorFn = undefined
  }

  constructor(
    private ydocService: YdocService,
    private prosemirrorEditorsService: ProsemirrorEditorsService,
    private serviceShare: ServiceShare,
  ) {
    this.serviceShare.shareSelf('FiguresControllerService', this)
    if (this.ydocService.editorIsBuild) {
      this.initFigures()
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
    this.figuresNumbers = figuresNumbersFromYMap
  }

  setRenderEndEditorFunction(func: any) {
    this.renderEditorFn = func
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
                        , newNode).setMeta('citatsTextChange', true).setMeta('shouldTrack', false)
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
                    newNode = newNode.mark([schema.mark('citation', { ...citationMark.attrs, citated_figures: citatedFigures })])
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

  updateFiguresNumbers(newFigures: { [key: string]: figure; }, figureNumbers: string[]) {
    Object.keys(newFigures).forEach((figureKey) => {
      let figNumber = figureNumbers.indexOf(figureKey)
      newFigures[figureKey].figureNumber = figNumber
    })
    let s = newFigures
  }

  async mergeFigureViews(newFigureNodes: { [key: string]: Node }, editedFigures: { [key: string]: boolean }) {
    let trackStatus = this.prosemirrorEditorsService.trackChangesMeta.trackTransactions
    if (!trackStatus) {
      return
    }
    this.prosemirrorEditorsService.trackChangesMeta.trackTransactions = false
    this.prosemirrorEditorsService.OnOffTrackingChangesShowTrackingSubject.next(
      this.prosemirrorEditorsService.trackChangesMeta
    )


      const mainDocumentSnapshot = Y.snapshot(this.ydocService.ydoc)
    Object.keys(editedFigures).forEach((key) => {
      if (this.figures[key]) {
        let figureData = this.figures[key];
        let xmlFragment = this.ydocService.ydoc.getXmlFragment(figureData.figurePlace);
        let view = this.prosemirrorEditorsService.editorContainers[figureData.figurePlace].editorView
        let state = view.state
        let doc = state.doc
        let startOfFigureview: number | undefined = undefined
        let endOfFigureview: number | undefined = undefined
        doc.nodesBetween(0, doc.nodeSize - 2, (container, pos, parent) => {
          if (container.type.name == 'figures_nodes_container') {
            container.descendants((figure, containeroffset, parent) => {
              if (figure.type.name == 'block_figure' && figure.attrs.figure_number == figureData.figureNumber&&figure.attrs.figure_id == figureData.figureID) {
                startOfFigureview = pos + containeroffset + 1
                endOfFigureview = pos + containeroffset + figure.nodeSize + 1
              }
            })
          }
        })
        if (startOfFigureview && endOfFigureview) {
          view.dispatch(state.tr.replaceWith(startOfFigureview,endOfFigureview,newFigureNodes[key]))
        }
      }
    })
    const updatedSnapshot = Y.snapshot(this.ydocService.ydoc)
    Object.keys(editedFigures).forEach((key) => {
      if (this.figures[key]) {
        let figureData = this.figures[key];
        let view = this.prosemirrorEditorsService.editorContainers[figureData.figurePlace].editorView
        view.dispatch(view.state.tr.setMeta(ySyncPluginKey, {
          snapshot: Y.decodeSnapshot(Y.encodeSnapshot(updatedSnapshot)),
          prevSnapshot: Y.decodeSnapshot(Y.encodeSnapshot(mainDocumentSnapshot)),
          renderingFromPopUp: true,
          trackStatus: true,
          userInfo:this.prosemirrorEditorsService.userInfo,
        }))
      }
    })
    setTimeout(() => {
      this.prosemirrorEditorsService.trackChangesMeta.trackTransactions = trackStatus
      this.prosemirrorEditorsService.OnOffTrackingChangesShowTrackingSubject.next(
        this.prosemirrorEditorsService.trackChangesMeta
      )
      this.prosemirrorEditorsService.citatEditingSubject.next({action:'deleteCitatsFromDocument'})
    }, 30)
  }

  writeFiguresDataGlobal(newFigureNodes: { [key: string]: Node }, newFigures: { [key: string]: figure; }, figureNumbers: string[], editedFigures: { [key: string]: boolean }) {
    this.mergeFigureViews(newFigureNodes, editedFigures)
    this.updateFiguresNumbers(newFigures, figureNumbers)
    this.ydocService.figuresMap!.set('ArticleFiguresNumbers', figureNumbers)
    this.ydocService.figuresMap!.set('ArticleFigures', newFigures)

    this.figuresNumbers = figureNumbers
    this.figures = newFigures


    let citats = this.ydocService.figuresMap?.get('articleCitatsObj');
    /* Object.keys(newFigureNodes).forEach((figureID) => {
      this.updateSingleFigure(figureID, newFigureNodes[figureID], this.figures[figureID])
    }) */
    this.markCitatsViews(citats)
    this.updateCitatsText(citats)
    this.ydocService.figuresMap?.set('articleCitatsObj', citats);

    /* try {
      //this.ydocService.figuresMap?.set('ArticleFigures', data);
      this.figuresData = data
      this.updateAllFigures()
    } catch (e) {
      console.error(e);
    } */
  }

  citateFigures(selectedFigures: boolean[], figuresComponentsChecked: { [key: string]: boolean[] }, sectionID: string, citatAttrs: any) {
    try {
      //check selections
      let insertionView = this.prosemirrorEditorsService.editorContainers[sectionID].editorView
      let citats = this.ydocService.figuresMap?.get('articleCitatsObj');
      let citatStartPos = insertionView.state.selection.$anchor.nodeBefore ? insertionView.state.selection.from - insertionView.state.selection.$anchor.nodeBefore!.nodeSize : insertionView.state.selection.from
      let citatEndPos = insertionView.state.selection.$anchor.nodeAfter ? insertionView.state.selection.from + insertionView.state.selection.$anchor.nodeAfter!.nodeSize : insertionView.state.selection.from
      let citateId
      if (citatAttrs) {
        citateId = citatAttrs.citateid
      } else {
        citateId = uuidv4();
      }
      if (selectedFigures.filter(e => e).length == 0 && !citatAttrs) {
        return
      } else if (selectedFigures.filter(e => e).length == 0 && citatAttrs) {
        citats[sectionID][citateId] = undefined
        insertionView.dispatch(insertionView.state.tr.replaceWith(
          citatStartPos,
          citatEndPos,
          Fragment.empty)
        )

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
            //citatString += ` ${index + 1}`
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
      if (!citats[sectionID]) {
        citats[sectionID] = {}
      }

      citats[sectionID][citateId] = {
        figureIDs: citatedFigureIds,
        position: citatAttrs ? citatStartPos : insertionView.state.selection.from,
        lastTimeUpdated: new Date().getTime()
      }

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
      //this.changeFiguresPlaces(citatedFigureIds,sectionID)
      this.markCitatsViews(citats)
      //this.updateCitatsText(citats)

      /*  if (citatAttrs) {
         insertionView.dispatch(insertionView.state.tr.addMark(citatPos,
           citatPos + insertionView.state.doc.nodeAt(citatPos)!.nodeSize
           , insertionView.state.schema.marks.citation.create({
             citated_figures: citatedFigureIds,
             citateid: citateId
           }, insertionView.state.schema.text(citateNodeText)))
         )
       } else {
         insertionView.dispatch(
           insertionView.state.tr.replaceSelectionWith(insertionView.state.schema.text('citateNodeText')
             insertionView.state.schema.marks.citation.create({
               citated_figures: citatedFigureIds,
               citateid: citateId
             }, insertionView.state.schema.text(citateNodeText))
           )
         )
       } */
      /*
           this.figuresData = this.ydocService.figuresMap?.get('ArticleFigures');
          let insertionView = this.prosemirrorEditorsService.editorContainers[sectionID].editorView
          let {from,to} = insertionView.state.selection
       */
      /* selectedFigures.forEach(figNumber => {

        let figure = this.figuresData[figNumber]
        let view = this.prosemirrorEditorsService.editorContainers[figure.path].editorView
        let nodeStart: number = view.state.doc.nodeSize - 2
        let nodeEnd: number = view.state.doc.nodeSize - 2
        let foundExistingFigure = false
        view.state.doc.nodesBetween(0, view.state.doc.nodeSize - 2, (node, pos, parent) => {
          if (node.type.name == "block_figure" && node.attrs.figure_number == figNumber) {
            foundExistingFigure = true
            nodeStart = pos;
            nodeEnd = pos + node.nodeSize
          }
        })
        let figureNode = view.state.doc.slice(nodeStart,nodeEnd);
        let removeTr = view.state.tr.replaceWith(nodeStart,nodeEnd,Fragment.empty)
        view.dispatch(removeTr);
        insertionView.dispatch(insertionView.state.tr.replaceWith(from,to,figureNode.content))
        this.figuresData[figNumber].path = sectionID
        this.ydocService.figuresMap?.set('ArticleFigures',this.figuresData);
      }) */
    } catch (e) {
      console.error(e);
    }
  }

  changeFiguresPlaces(citatedFigureIds: string[], sectionID: string) {
    this.figures = this.ydocService.figuresMap!.get('ArticleFigures')
    citatedFigureIds.forEach((id) => {
      this.figures[id].figurePlace = sectionID
    })
    this.figures = this.ydocService.figuresMap!.set('ArticleFigures', this.figures)

  }

  markCitatsViews = (citatsBySection: any) => {
    let numbersCopy: string[] = JSON.parse(JSON.stringify(this.figuresNumbers));
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
            tr1 = tr1.replaceWith(position, position + node.nodeSize, Fragment.empty).setMeta('shouldTrack', false);
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
    let viewsDisplayed: boolean[] = numbersCopy.map((figureID) => { return false })

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
        let citatedFiguresOnCitat: string[] = citatData[1].figureIDs;
        let deletedFiguresOnCitat = citatedFiguresOnCitat.reduce<string[]>((prev, figureID, i) => {
          let data = figureID.split("|")
          let figID = data[0]!
          if (numbersCopy.indexOf(figID) == -1) {
            return prev.concat([figureID])
          }
          return prev
        }, [])
        let displayedFiguresViewHere: string[] = []
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
        this.prosemirrorEditorsService.interpolateTemplate(figureTemplate.html, serializedFigureToFormIOsubmission, new FormGroup({})).then((data: string) => {
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
  }

  removeFromEndEditor(figureID: string) {
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
    view.dispatch(view.state.tr.replaceWith(nodeStart!, nodeEnd!, Fragment.empty).setMeta('shouldTrack', false))
  }

  getNodeFromHTML(html: string) {
    let temp = document.createElement('div');
    temp.innerHTML = html!;
    let node = this.DOMPMParser.parseSlice(temp)
    //@ts-ignore
    return node.content.content
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
        view.dispatch(view.state.tr.replaceWith(nodeStart!, nodeEnd!, container).setMeta('shouldTrack', false))
      } else {
        view.dispatch(view.state.tr.replaceWith(nodeStart!, nodeEnd!, figureNodes).setMeta('shouldTrack', false))
      }
    }



    /*
    let figure: any = JSON.parse(JSON.stringify(figure1))
    let view = this.prosemirrorEditorsService.editorContainers[figure.path].editorView
    let nodeStart: number = view.state.doc.nodeSize - 2
    let nodeEnd: number = view.state.doc.nodeSize - 2
    let foundExistingFigure = false
    view.state.doc.nodesBetween(0, view.state.doc.nodeSize - 2, (node, pos, parent) => {
      if (node.type.name == "block_figure" && node.attrs.figure_number == figureNumber) {
        foundExistingFigure = true
        nodeStart = pos;
        nodeEnd = pos + node.nodeSize
      }
    })

    if (!foundExistingFigure) {
    }
    let schema = view.state.schema
    let n = schema.nodes

    let figDesc = schema.nodes.figure_description.create({}, this.getNodeFromHTML(figure.description))
    let figuresDescriptions: any[] = []
    let figurecomponents = figure.components.reduce((prev: any, curr: any, i: number) => {
      figuresDescriptions.push(schema.nodes.figure_component_description.create({ component_number: i }, [
        schema.nodes.form_field.create({}, schema.nodes.paragraph.create({contenteditableNode:'false'}, [
          schema.text(String.fromCharCode(97 + i) + ':')
        ])),
        schema.nodes.form_field.create({}, this.getNodeFromHTML(curr.description)),
      ]))
      if (curr.componentType == 'video') {
        return prev.concat(...[schema.nodes.figure_component.create({ component_number: i,contenteditableNode:'false' }, [
          schema.nodes.video.create({ src: curr.url }),
        ])])
      } else if (curr.componentType == 'image') {
        return prev.concat([schema.nodes.figure_component.create({ component_number: i,contenteditableNode:'false' }, [
          schema.nodes.image.create({ src: curr.url })
        ])])
      }
    }, [])
    view.dispatch(view.state.tr.replaceWith(nodeStart!, nodeEnd!,
      schema.nodes.block_figure.create({ figure_number: figureNumber }, [
        n.figure_components_container.create({contenteditableNode:'false'}, figurecomponents),
        schema.nodes.figure_descriptions_container.create({}, [
          schema.nodes.heading.create({ tagName: 'h3',contenteditableNode:'false' }, [schema.text(`Figure: ${+figureNumber+1}`)]),
          figDesc,
          ...figuresDescriptions
        ])]
      )).setMeta('shouldTrack', false))

   */
  }

}
