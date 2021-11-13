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
@Component({
  selector: 'app-editor-section',
  templateUrl: './editor-section.component.html',
  styleUrls: ['./editor-section.component.scss']
})
export class EditorSectionComponent extends MaterialComponent implements AfterViewInit {
  renderEditor=false;
  
  editorContainer ?: {
    editorID: string,
    containerDiv: HTMLDivElement,
    editorState: EditorState,
    editorView: EditorView,
    dispatchTransaction: any
  };
  
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
      if(validatorsSpec.required){
        this.control.setAsyncValidators([asyncPmRequired/* ,asyncPmPattern(validatorsSpec.pattern)! */])
      }
      //this.control.setValidators([pmMaxLength(validatorsSpec.maxLength!), pmMinLength(validatorsSpec.minLength), pmPattern(validatorsSpec.pattern)!, pmRequired])
      
      //let pmEditorControl: FormControl = new FormControl({},[pmMaxLength,pmMinLength,pmPattern,pmRequired]);
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
    let node = editorData?[schema.nodeFromJSON(editorData)]:[];
    this.editorContainer = this.prosemirrorService.renderEditorWithNoSync(this.ProsemirrorEditor?.nativeElement,node,this.instance,this.control)
    this.control.updateValueAndValidity()
    this.renderEditor = true;
  }
}
