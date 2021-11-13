import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild ,AfterContentInit, ChangeDetectorRef} from '@angular/core';
import { FormioCustomComponent } from '@formio/angular';
import { uuidv4 } from 'lib0/random';
import { ProsemirrorEditorsService } from '../../services/prosemirror-editors.service';
import { YdocService } from '../../services/ydoc.service';
//@ts-ignore
import Validator from 'formiojs/validator/Validator.js';

import * as Y from 'yjs'
import { AbstractType } from 'yjs';
import { Components, MaterialComponent, registerComponent } from 'src/app/formio-angular-material/angular-material-formio.module';
import { articleSection, editorData, editorMeta, sectionContentData, titleContentData } from '../../utils/interfaces/articleSection';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { schema } from '../../utils/Schema';
import { FormControl } from '@angular/forms';
import { asyncPmPattern, asyncPmRequired, pmMaxLength, pmMinLength, pmPattern, pmRequired } from '../../utils/pmEditorFormValidators/validators';
import { P } from '@angular/cdk/keycodes';
import { DOMParser, DOMSerializer } from 'prosemirror-model';
@Component({
  selector: 'app-editor-section',
  templateUrl: './editor-section.component.html',
  styleUrls: ['./editor-section.component.scss']
})
export class EditorSectionComponent extends MaterialComponent implements AfterViewInit {
  renderEditor=false;
  
  pmControl ?: FormControl ;

  editorContainer ?: {
    editorID: string,
    containerDiv: HTMLDivElement,
    editorState: EditorState,
    editorView: EditorView,
    dispatchTransaction: any
  };
  DOMPMParser = DOMParser.fromSchema(schema)
  value:any
  
  @ViewChild('ProsemirrorEditor', {read: ElementRef}) ProsemirrorEditor?: ElementRef;
  
  constructor(
    private prosemirrorService:ProsemirrorEditorsService,
    private ydocService:YdocService,
    public element: ElementRef, 
     
    public ref: ChangeDetectorRef) { 
      super(element,ref)
    }

    validateOnInit() {
      console.log('validate');
      const {key} = this.instance.component;
      const validationValue = this.editorContainer?.editorView.state
  
      if (validationValue === null) {
        return;
      }
  
      this.instance.setPristine(false);
  
      const validationResult = Validator.checkComponent(
        this.instance,
        {[key]: validationValue},
        {[key]: validationValue}
      );
  
      if (validationResult.length) {
        this.instance.setCustomValidity(validationResult, false);
        if (!!validationValue) {
          this.control.markAsTouched();
        }
        this.ref.detectChanges();
      }
    }
    
    setInstance(instance:any){
      this.control.clearAsyncValidators();
      this.control.clearValidators();
      let validatorsSpec = instance.component.validate
      let validators :any[]= []
      if(validatorsSpec.pattern){
        validators.push(pmPattern(instance.component.validate.pattern+''));
        instance.component.validate.pattern='[\\.\\S\\s]*';
      }
      
      if(validatorsSpec.required){
        instance.component.validate.required=false;
        validators.push(pmRequired)
      }
      this.pmControl = new FormControl(null,validators)

      instance.error = this.pmControl.errors
      super.setInstance(instance);

  }
  
  ngAfterViewInit(): void {
    let awaitValue = ()=>{
      setTimeout(() => {
        if(this.value!==undefined){
          renderEditor()
        }else{
          awaitValue()
        }
      }, 100);
    }
    console.log(this.control.value );
    this.value= this.control.value 
    awaitValue()
    let renderEditor = ()=>{
      try{
        this.render(this.value!)
      }catch(e){
        console.log(e);
      }
    }
  }

  render(editorData:any){
    //let node = editorData?[schema.nodeFromJSON(editorData)]:[];
    console.log(this.instance);
    let options:any = {}
    if(this.instance.component.properties.noLabel){
      options.noLabel = true
    }
    let temp = document.createElement('div');
    temp.innerHTML = editorData;
    let node = editorData?this.DOMPMParser.parseSlice(temp):undefined;
    console.log('node when rendered in popup',editorData);
    this.editorContainer = this.prosemirrorService.renderEditorWithNoSync(this.ProsemirrorEditor?.nativeElement,this.instance,this.control,options,node);
    this.control.updateValueAndValidity();
    this.renderEditor = true;
  }
}
