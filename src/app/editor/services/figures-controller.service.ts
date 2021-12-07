import { ViewFlags } from '@angular/compiler/src/core';
import { AfterViewInit, Injectable } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { Fragment, Node, Slice } from 'prosemirror-model';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { figure, figure_component } from '../utils/interfaces/figureComponent';
import { endEditorNodes, endEditorSchema, schema } from '../utils/Schema';
import { ProsemirrorEditorsService } from './prosemirror-editors.service';
import { YdocService } from './ydoc.service';
import { DOMParser } from 'prosemirror-model';
import { remove } from 'lodash';
import { uuidv4 } from 'lib0/random';
import { Q } from '@angular/cdk/keycodes';
import { articleSection } from '../utils/interfaces/articleSection';
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
  figuresNumbers?: string[]
  figures: { [key: string]: figure } = {}
  renderEditorFn: any
  constructor(
    private ydocService: YdocService,
    private prosemirrorEditorsService: ProsemirrorEditorsService
  ) {
    if (this.ydocService.editorIsBuild) {
      this.initFigures()
    } else {
      this.ydocService.ydocStateObservable.subscribe((event) => {
        if (event == 'docIsBuild') {
          this.initFigures()
        }
      });
    }
  }

  initFigures() {
    let figuresNumbersFromYMap = this.ydocService.figuresMap?.get('ArticleFiguresNumbers');
    this.figuresNumbers = figuresNumbersFromYMap
  }

  setRenderEndEditorFunction(func: any) {
    this.renderEditorFn = func
  }

  writeFiguresDataGlobal(newFigureNodes: { [key: string]: Node }) {-
    this.ydocService.figuresMap!.set('ArticleFiguresNumbers', this.figuresNumbers)
    this.ydocService.figuresMap!.set('ArticleFigures', this.figures)
    Object.keys(newFigureNodes).forEach((figureID) => {
      this.updateSingleFigure(figureID, newFigureNodes[figureID],this.figures[figureID])
    })
    /* try {
      //this.ydocService.figuresMap?.set('ArticleFigures', data);
      this.figuresData = data
      this.updateAllFigures()
    } catch (e) {
      console.error(e);
    } */
  }



  citateFigures(selectedFigures: number[], sectionID: string) {
    let citateId = uuidv4();
    let insertionView = this.prosemirrorEditorsService.editorContainers[sectionID].editorView
    let citats = this.ydocService.figuresMap?.get('articleCitatsObj');
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

    let citatedFigureIds = selectedFigures.reduce<any>((prev, curr, index) => {
      return prev.concat([this.figuresNumbers![curr]])
    }, [])
    if (!citats[sectionID]) {
      citats[sectionID] = {}
    }
    citats[sectionID][citateId] = {
      figureIDs: citatedFigureIds,
      position: insertionView.state.selection.from,
      lastTimeUpdated : new Date().getTime()
    }
    this.ydocService.figuresMap?.set('articleCitatsObj', citats);

    //this.changeFiguresPlaces(citatedFigureIds,sectionID)
    this.markCitatsViews(citats)
    let citateNodeText = selectedFigures.length > 1 ? "Figs: " + selectedFigures.map(n=>n+1).join(' ,') : "Fig: " + (selectedFigures[0]+1)
    insertionView.dispatch(
      insertionView.state.tr.replaceSelectionWith(
        insertionView.state.schema.nodes.citation.create({
          citated_figures: citatedFigureIds,
          citateid: citateId
        }, insertionView.state.schema.text(citateNodeText))
      )
    )
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
  }

  changeFiguresPlaces(citatedFigureIds:string[],sectionID:string){
    this.figures = this.ydocService.figuresMap!.get('ArticleFigures')
    citatedFigureIds.forEach((id)=>{
      this.figures[id].figurePlace = sectionID
    })
    this.figures = this.ydocService.figuresMap!.set('ArticleFigures',this.figures)

  }

  markCitatsViews(citatsBySection: any) {
    let numbersCopy: string[] = JSON.parse(JSON.stringify(this.figuresNumbers));
    let viewsDisplayed: boolean[] = numbersCopy.map((figureID) => { return false })
    this.figures = this.ydocService.figuresMap!.get('ArticleFigures')

    let articleFlatStructure = this.ydocService.articleStructure?.get('articleSectionsStructureFlat');
    articleFlatStructure.forEach((section:articleSection)=>{
      let sectionID = section.sectionID

      var sortable = [];
      for (var citat in citatsBySection[sectionID]) {
        sortable.push([citat, citatsBySection[sectionID][citat]]);
      }

      sortable.sort(function (a, b) {
        return a[1].position - b[1].position;
      });

      sortable.forEach((citatData)=>{
        let biggestFigureNumberInCitat = -1;
        let citatedFiguresOnCitat: string[] = citatData[1].figureIDs;

        citatedFiguresOnCitat.forEach((figureID) => { // find the figure with biggest index on this citat
          let figNumber = numbersCopy.indexOf(figureID)
          if (figNumber > biggestFigureNumberInCitat) {
            biggestFigureNumberInCitat = figNumber
          }
        })
        let displayedFiguresViewHere:string[] = []
        if(!citatsBySection[sectionID][citatData[0]].displaydFiguresViewhere){
          citatsBySection[sectionID][citatData[0]].displaydFiguresViewhere = []
        }
        for (let i = 0; i <= biggestFigureNumberInCitat; i++) {
          if (!viewsDisplayed[i]) {
            displayedFiguresViewHere.push(numbersCopy[i])
            if(this.figures[numbersCopy[i]].figurePlace == 'endEditor'){
              this.removeFromEndEditor(numbersCopy[i])
            }
            this.figures[numbersCopy[i]].figurePlace = sectionID
            this.figures[numbersCopy[i]].viewed_by_citat = citatData[0];
            //citatsBySection[sectionID][citatData[0]].displaydFiguresViewhere.push(numbersCopy[i])
            viewsDisplayed[i] = true
          }
        }
        if(displayedFiguresViewHere.length!==citatsBySection[sectionID][citatData[0]].displaydFiguresViewhere.length||!displayedFiguresViewHere.reduce<boolean>((prev,figureID,i)=>{
          if(!citatsBySection[sectionID][citatData[0]].displaydFiguresViewhere.includes(figureID)){
            return (prev&&false)
          }
          return (prev&&true)
        },true)){
          citatsBySection[sectionID][citatData[0]].lastTimeUpdated = new Date().getTime();
          citatsBySection[sectionID][citatData[0]].displaydFiguresViewhere = displayedFiguresViewHere;
        }

      })
    })
    this.figures = this.ydocService.figuresMap!.set('ArticleFigures',this.figures)
  }

  removeFromEndEditor(figureID:string){
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
    view.dispatch(view.state.tr.replaceWith(nodeStart!, nodeEnd!,Fragment.empty).setMeta('shouldTrack', false))
  }

  updateAllFigures() {
    /* this.checkEndEditorContainer()
    this.figuresData = this.ydocService.figuresMap?.get('ArticleFigures'); */
    //let view = this.prosemirrorEditorsService.editorContainers['endEditor'].editorView
    /* view.state.doc.nodesBetween(0, view.state.doc.nodeSize - 2,(node,pos,parent)=>{
      if(node.type.name == "block_figure"){
        let descriptions = node.content.lastChild?.content
        node.content.firstChild?.content.forEach((node,offset,index)=>{
        })
      }
    }) */


    //view.dispatch(view.state.tr.replace(0, view.state.doc.nodeSize - 2, Slice.empty).setMeta('shouldTrack', false))

    /* this.figuresData.forEach((figure, index) => {
      this.updateSingleFigure(figure, index)
    }) */
  }

  getNodeFromHTML(html: string) {
    let temp = document.createElement('div');
    temp.innerHTML = html!;
    let node = this.DOMPMParser.parseSlice(temp)
    //@ts-ignore
    return node.content.content
  }

  updateSingleFigure(figureID: string, figureNodes: Node,figure:figure) {

    let view = this.prosemirrorEditorsService.editorContainers[figure.figurePlace].editorView
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

    view.dispatch(view.state.tr.replaceWith(nodeStart!, nodeEnd!, figureNodes).setMeta('shouldTrack', false))
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

  checkEndEditorContainer() {
    if (!this.endEditorContainer) {
      /* if (!this.prosemirrorEditorsService.editorContainers['endEditor']) {
        this.renderEditorFn()
      } */
      this.endEditorContainer = this.prosemirrorEditorsService.editorContainers['endEditor'];
    }
  }
}
