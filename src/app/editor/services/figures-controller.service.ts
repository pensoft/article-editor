import { ViewFlags } from '@angular/compiler/src/core';
import { AfterViewInit, Injectable } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { Fragment, Slice } from 'prosemirror-model';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { figure, figure_component } from '../utils/interfaces/figureComponent';
import { endEditorNodes, endEditorSchema, schema } from '../utils/Schema';
import { ProsemirrorEditorsService } from './prosemirror-editors.service';
import { YdocService } from './ydoc.service';
import { DOMParser } from 'prosemirror-model';
import { remove } from 'lodash';
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
  figuresData: figure[] = []
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
    let figuresDataFromYjs = this.ydocService.figuresMap?.get('ArticleFigures');
    this.figuresData = figuresDataFromYjs
  }

  setRenderEndEditorFunction(func: any) {
    this.renderEditorFn = func
  }

  writeFiguresDataGlobal(data: figure[]) {
    try {
      //this.ydocService.figuresMap?.set('ArticleFigures', data);
      this.figuresData = data
      this.updateAllFigures()
    } catch (e) {
      console.error(e);
    }
  }

  citateFigures(selectedFigures: number[], sectionID: string) {
    this.figuresData = this.ydocService.figuresMap?.get('ArticleFigures');
    let insertionView = this.prosemirrorEditorsService.editorContainers[sectionID].editorView
    let {from,to} = insertionView.state.selection

    selectedFigures.forEach(figNumber => {

      let figure = this.figuresData[figNumber]
      let view = this.prosemirrorEditorsService.editorContainers[figure.path].editorView
      let nodeStart: number = view.state.doc.nodeSize - 2
      let nodeEnd: number = view.state.doc.nodeSize - 2
      let foundExistingFigure = false
      view.state.doc.nodesBetween(0, view.state.doc.nodeSize - 2, (node, pos, parent) => {
        if (node.type.name == "inline_figure" && node.attrs.figure_number == figNumber) {
          foundExistingFigure = true
          nodeStart = pos;
          nodeEnd = pos + node.nodeSize
          console.log('replacingFigureNode', pos, pos + node.nodeSize, node.attrs.figure_number);
        }
      })
      let figureNode = view.state.doc.slice(nodeStart,nodeEnd);
      let removeTr = view.state.tr.replaceWith(nodeStart,nodeEnd,Fragment.empty)
      view.dispatch(removeTr);
      insertionView.dispatch(insertionView.state.tr.replaceWith(from,to,figureNode.content))
      this.figuresData[figNumber].path = sectionID
      this.ydocService.figuresMap?.set('ArticleFigures',this.figuresData);
    })
  }

  updateAllFigures() {
    this.checkEndEditorContainer()
    this.figuresData = this.ydocService.figuresMap?.get('ArticleFigures');
    //let view = this.prosemirrorEditorsService.editorContainers['endEditor'].editorView
    /* view.state.doc.nodesBetween(0, view.state.doc.nodeSize - 2,(node,pos,parent)=>{
      if(node.type.name == "inline_figure"){
        console.log(node,pos,pos+node.nodeSize,node.attrs.figure_number);
        let descriptions = node.content.lastChild?.content
        node.content.firstChild?.content.forEach((node,offset,index)=>{
          console.log('figurecomponentNumber',node.attrs.component_number,'description',descriptions?.child(index+2));
        })
      }
    }) */


    //view.dispatch(view.state.tr.replace(0, view.state.doc.nodeSize - 2, Slice.empty).setMeta('shouldTrack', false))

    this.figuresData.forEach((figure, index) => {
      this.updateSingleFigure(figure, index)
    })
  }

  getNodeFromHTML(html: string) {
    let temp = document.createElement('div');
    temp.innerHTML = html!;
    let node = this.DOMPMParser.parseSlice(temp)
    //@ts-ignore
    return node.content.content
  }

  updateSingleFigure(figure1: figure, figureNumber: number) {
    let figure: any = JSON.parse(JSON.stringify(figure1))
    console.log(figure.path);
    let view = this.prosemirrorEditorsService.editorContainers[figure.path].editorView
    let nodeStart: number = view.state.doc.nodeSize - 2
    let nodeEnd: number = view.state.doc.nodeSize - 2
    let foundExistingFigure = false
    view.state.doc.nodesBetween(0, view.state.doc.nodeSize - 2, (node, pos, parent) => {
      if (node.type.name == "inline_figure" && node.attrs.figure_number == figureNumber) {
        foundExistingFigure = true
        nodeStart = pos;
        nodeEnd = pos + node.nodeSize
        console.log('replacingFigureNode', pos, pos + node.nodeSize, node.attrs.figure_number);
      }
    })

    if (!foundExistingFigure) {
      console.log('insertingFigureNodeAtEnd', figureNumber);
    }
    let schema = view.state.schema
    let n = schema.nodes

    let figDesc = schema.nodes.figure_description.create({}, this.getNodeFromHTML(figure.description))
    let figuresDescriptions: any[] = []
    let figurecomponents = figure.components.reduce((prev: any, curr: any, i: number) => {
      figuresDescriptions.push(schema.nodes.figure_component_description.create({ component_number: i }, [
        schema.nodes.form_field.create({}, schema.nodes.paragraph.create({}, [
          schema.text(String.fromCharCode(97 + i) + ':')
        ])),
        schema.nodes.form_field.create({}, this.getNodeFromHTML(curr.description)),
      ]))
      if (curr.componentType == 'video') {
        return prev.concat(...[schema.nodes.figure_component.create({ component_number: i }, [
          schema.nodes.video.create({ src: curr.url }),
        ])])
      } else if (curr.componentType == 'image') {
        return prev.concat([schema.nodes.figure_component.create({ component_number: i }, [
          schema.nodes.image.create({ src: curr.url })
        ])])
      }
    }, [])
    view.dispatch(view.state.tr.replaceWith(nodeStart!, nodeEnd!,
      schema.nodes.inline_figure.create({ figure_number: figureNumber }, [
        n.figure_components_container.create({}, figurecomponents),
        schema.nodes.figure_descriptions_container.create({}, [
          schema.nodes.heading.create({ tagName: 'h3' }, [schema.text(`Figure: ${+figureNumber+1}`)]),
          figDesc,
          ...figuresDescriptions
        ])]
      )).setMeta('shouldTrack', false))

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
