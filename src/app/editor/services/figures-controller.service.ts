import { ViewFlags } from '@angular/compiler/src/core';
import { AfterViewInit, Injectable } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { Slice } from 'prosemirror-model';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { figure, figure_component } from '../utils/interfaces/figureComponent';
import { endEditorNodes, endEditorSchema,schema } from '../utils/Schema';
import { ProsemirrorEditorsService } from './prosemirror-editors.service';
import { YdocService } from './ydoc.service';
import { DOMParser } from 'prosemirror-model';
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
      this.ydocService.figuresMap?.set('ArticleFigures', data);
      this.figuresData = data
      this.updateAllFigures()
    } catch (e) {
      console.error(e);
    }
  }

  updateAllFigures() {
    this.checkEndEditorContainer()
    let view = this.prosemirrorEditorsService.editorContainers['endEditor'].editorView
    view.dispatch(view.state.tr.replace(1,view.state.doc.nodeSize - 2,Slice.empty))

    this.figuresData.forEach((figure, index) => {
      this.updateSingleFigure(figure, index)
    })
  }

  getNodeFromHTML(html:string){
    let temp = document.createElement('div');
    temp.innerHTML = html!;
    let node = this.DOMPMParser.parseSlice(temp) 
    //@ts-ignore
    return node.content.content
  }

  updateSingleFigure(figure: figure, figureNumber: number) {
    
    let view = this.prosemirrorEditorsService.editorContainers[figure.path].editorView
    let schema = view.state.schema
    let n = schema.nodes

    console.log(figure);
    let figDesc = this.getNodeFromHTML(figure.description)
    let figuresDescriptions:any[] = []
    let figurecomponents = figure.components.reduce<any[]>((prev:any,curr,i)=>{
      //figuresDescriptions.push(this.getNodeFromHTML(curr.description))
      figuresDescriptions.push(schema.nodes.inline_block_container.create({}, [
        schema.nodes.form_field.create({}, schema.nodes.paragraph.create({}, [
          schema.text(String.fromCharCode(97+i)+ ':')
        ])),
        schema.nodes.form_field.create({}, this.getNodeFromHTML(curr.description)),
      ]))
      if(curr.componentType == 'video'){
        return prev.concat(...[schema.nodes.figure_component.create({}, [
          schema.nodes.video.create({src:curr.url}),
        ])])
      }else if(curr.componentType == 'image'){  
        return prev.concat([schema.nodes.figure_component.create({}, [
          schema.nodes.image.create({src:curr.url})
        ])])
      }
    },[])
    view.dispatch(view.state.tr.insert(view.state.doc.nodeSize - 2, 
      schema.nodes.figure_block.create({}, [n.figure_components_container.create({}, figurecomponents),
      schema.nodes.figure_descriptions_container.create({}, [
        schema.nodes.heading.create({ tagName: 'h3' },[ schema.text('Figure:'+figureNumber)]),
        ...figDesc,
        ...figuresDescriptions
      ])]
    )))
    
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
