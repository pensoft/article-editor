import { Component, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { MaterialComponent } from '../MaterialComponent';
//@ts-ignore
import TextAreaComponent from 'formiojs/components/textarea/TextArea.js';
import isNil from 'lodash/isNil';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DOMSerializer, DOMParser, Schema, Fragment } from 'prosemirror-model';
import { schema } from 'src/app/editor/utils/Schema';
import { EditorState, TextSelection } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { editorContainer, ProsemirrorEditorsService } from 'src/app/editor/services/prosemirror-editors.service';
import { YdocService } from 'src/app/editor/services/ydoc.service';
//@ts-ignore
import Validator from 'formiojs/validator/Validator.js';
import { ClientRequest } from 'http';
import { ServiceShare } from '@app/editor/services/service-share.service';

@Component({
  selector: 'mat-formio-textarea',
  styleUrls: ['./textarea.component.scss'],
  templateUrl: './textarea.component.html',
})
export class MaterialTextareaComponent extends MaterialComponent implements AfterViewInit {
  renderEditor = false;
  @ViewChild('textarea') textarea?: ElementRef;

  pmControl?: FormControl;
  pmControl1: FormControl = new FormControl(null, [Validators.required])
  placeholder = 'asd'
  DOMPMSerializer ?: DOMSerializer
  DOMPMParser ?: DOMParser

  editorContainer?:editorContainer;
  value: any
  instanceValidations: any
  rerender = false;
  @ViewChild('ProsemirrorEditor', { read: ElementRef }) ProsemirrorEditor?: ElementRef;

  constructor(
    private prosemirrorService: ProsemirrorEditorsService,
    private ydocService: YdocService,
    public element: ElementRef,
    private serviceShare:ServiceShare,

    public ref: ChangeDetectorRef) {
    super(element, ref)
    this.editorContainer = undefined;
    //this.renderEditor = true
  }

  setInstance(instance: any) {
    instance.materialComponent = this;
    this.instance = instance;
    this.control.setInstance(instance);
    //this.instance.updateValue(value, { modified: true });
    this.instanceValidations = this.instance.component.validate
    this.instance.component.validate = {}
    this.instance.disabled = this.instance.shouldDisabled;
    /* this.setVisible(this.instance.visible); */
  }

  ngOnInit() {
  }

  onChange(keepInputRaw?: boolean) {
    return
  }
  validity:any[] = [];
  prosemirrorFocused = false;
  onChange1 = (keepInputRaw: boolean, value1?: string) => {
    let hasChanges = value1?.match(/<span class="(deletion|insertion|format-change)"/gm);
    if (hasChanges && Object.keys(this.instance.component.validate).length > 2) {
      this.instanceValidations = this.instance.component.validate
      this.instance.component.validate = {}
    } else if (!hasChanges && Object.keys(this.instance.component.validate).length == 2) {
      this.instance.component.validate = this.instanceValidations
    }
    let temp = document.createElement('div');
    temp.innerHTML = value1!
    let value = temp.textContent!

    if (value === undefined || value === null) {
      value = this.instance.emptyValue;
    }
    if(this.instance.root.rawVals){
      this.instance.root.rawVals[this.instance.component.key] = value1
    }else{
      this.instance.root.rawVals = {}
      this.instance.root.rawVals[this.instance.component.key] = value1
    }
    if (this.input && this.input.nativeElement.mask && value && !keepInputRaw) {
      this.input.nativeElement.mask.textMaskInputElement.update(value);
      this.control.setValue(this.input.nativeElement.value);
      value = this.getValue()!;
    }
    this.instance.updateValue(value, { modified: true });
    let validity = Validator.checkComponent(this.instance,{[this.instance.component.key]:value},{[this.instance.component.key]:value});
    this.validity = validity
    this.instance.setCustomValidity(validity, false);
    this.instance.root.changeVisibility(this.instance);
    this.instance.root.triggerChange()
  }

  beforeSubmit() {
    /* {
    "required": true,
    "pattern": "asd",
    "minLength": 2,
    "maxLength": 10,
    "custom": "",
    "customPrivate": false,
    "strictDateValidation": false,
    "multiple": false,
    "unique": false
    } */
    if (this.instance.component.validate.required) {
      this.instance.component.validate.required = false
    }
    if (this.instance.component.validate.pattern) {
      this.instance.component.validate.pattern = `[\\s\\S.]*`
    }
    if (this.instance.component.validate.minLength) {
      this.instance.component.validate.minLength = undefined
    }
    if (this.instance.component.validate.maxLength) {
      this.instance.component.validate.maxLength = undefined
    }
    this.control.markAsTouched();
    let containerElement = document.createElement('div');
    let htmlNOdeRepresentation = this.DOMPMSerializer.serializeFragment(this.editorContainer?.editorView.state.doc.content.firstChild!.content!)
    containerElement.appendChild(htmlNOdeRepresentation);
    /* if(htmlNOdeRepresentation.textContent == ''&&htmlNOdeRepresentation.childNodes.length==0){
      let placeholder = (this.instance.component.placeholder&&this.instance.component.placeholder!=='')?this.instance.component.placeholder:undefined
      if(placeholder){
        containerElement.innerHTML = `<pm-placeholder>${placeholder}</pm-placeholder>`
      }
    } */
    this.instance.updateValue(containerElement.innerHTML, { modified: true });
    this.control.setValue(containerElement.innerHTML);
    return this.control
  }

  getValue() {
    return this.editorContainer?.editorView.state.doc.textContent;
  }

  setValue(value1: any) {
    this.control.setValue(value1);
    return
    let hasChanges = value1?.match(/<span class="(deletion|insertion|format-change)"/gm);
    if (hasChanges && Object.keys(this.instance.component.validate).length > 2) {
      this.instanceValidations = this.instance.component.validate
      this.instance.component.validate = {}
    } else if (!hasChanges && Object.keys(this.instance.component.validate).length == 2) {
      this.instance.component.validate = this.instanceValidations
    }
    let temp = document.createElement('div');
    temp.innerHTML = value1!
    let value = temp.textContent!

    if (value === undefined || value === null) {
      value = this.instance.emptyValue;
    }
    this.control.setValue(value);
    this.instance.updateValue(value, { modified: true });
  }

  setRealValue() {
    this.rerender = true;
    this.instanceValidations = this.instance.component.validate
    this.instance.component.validate = {}
    let containerElement = document.createElement('div'); this.control.markAsTouched();
    let htmlNOdeRepresentation = this.DOMPMSerializer.serializeFragment(this.editorContainer?.editorView.state.doc.content.firstChild!.content!)
    containerElement.appendChild(htmlNOdeRepresentation);
    this.instance.updateValue(containerElement.innerHTML, { modified: true });
    this.control.setValue(containerElement.innerHTML);
  }
  options:any
  userSectionTitleAsLable = false;
  sectionTreeTitle
  getTextContent(html){
    this.sectionTreeTitle = html
  }
  renderComponents() {
    /* this.setVisible(this.instance.visible); */
    if (!this.rerender) {
      return
    }
    try {
      if(
        this.instance.originalComponent &&
        this.instance.originalComponent.properties &&
        this.instance.originalComponent.properties.useSectionTitleAsLabel&&
        this.instance.root._form.props.isSectionPopup
      ){
        this.userSectionTitleAsLable = true;
        this.sectionTreeTitle = this.instance.root._form.props.initialSectionTitle
        let labelTemplate = this.instance.root._form.props.sectionLabelTemplate
        let shouldInterpolate = /{{\s*\S*\s*}}|<span(\[innerHTML]="[\S]+"|[^>])+>[^<]*<\/span>/gm.test(labelTemplate);
        let dummyFormGroup = new FormGroup({})
        this.instance.events.addListener('formio.change',(ch,ch2)=>{

          if(shouldInterpolate && ch && ch.data ){
            let vals = JSON.parse(JSON.stringify(ch.data));
            if(this.instance.root){
              let rawVals = this.instance.root.rawVals;
              if(rawVals){
                Object.keys(rawVals).forEach((key)=>{
                  vals[key] = rawVals[key];
                })
              }
            }
            this.serviceShare.ProsemirrorEditorsService?.interpolateTemplate(labelTemplate, vals, dummyFormGroup).then((newTitle: string) => {
              this.getTextContent(newTitle)
            })
          }else if(ch&&ch.data){
            let vals = JSON.parse(JSON.stringify(ch.data));
            if(this.instance.root){
              let rawVals = this.instance.root.rawVals;
              if(rawVals){
                Object.keys(rawVals).forEach((key)=>{
                  vals[key] = rawVals[key];
                })
              }
            }
            if(vals.sectionTreeTitle){
              this.getTextContent(vals.sectionTreeTitle)
            }
          }
        })
      }
      this.value = this.control.value;
      //let node = editorData?[schema.nodeFromJSON(editorData)]:[];
      let options: any = {}
      Object.keys(this.instance.component.properties).forEach((key) => {
        options[key] = this.instance.component.properties[key]
      })
      let sectionProps = this.instance.root._form.props
      options.path = this.instance.path
      options.onChange = this.onChange1
      options.containerSection = (sectionProps&&sectionProps.sectionID)?this.serviceShare.TreeService.findNodeById(sectionProps.sectionID):undefined;
      let componentProps = (sectionProps&&sectionProps[this.instance.path])?sectionProps[this.instance.path]:{}
      Object.keys(componentProps).forEach((key) => {
        if(key == "menuType"/* &&!options[key] */){
          //options[key] = componentProps[key]
        }else if(key == "allowedTags"/* &&!options[key] */){
          //options[key] = componentProps[key]
        }else{
          options[key] = componentProps[key]
        }
      })
      let sectionView = sectionProps?this.prosemirrorService.editorContainers[sectionProps.sectionID]?this.prosemirrorService.editorContainers[sectionProps.sectionID].editorView:undefined:undefined
      let viewSchema = sectionView?sectionView.state.schema:schema
      this.DOMPMSerializer = DOMSerializer.fromSchema(viewSchema);
      this.DOMPMParser = DOMParser.fromSchema(viewSchema)
      options.sectionID = sectionProps?sectionProps.sectionID:undefined
      options.isCitableElement = (sectionProps&&sectionProps.isCitableElement)?sectionProps.isCitableElement:false
      this.options = options
      let temp = document.createElement('div');
      temp.innerHTML = this.value!;
      let node = this.value! ? this.DOMPMParser.parseSlice(temp) : undefined;
      this.editorContainer = this.prosemirrorService.renderEditorWithNoSync(this.ProsemirrorEditor?.nativeElement, this.instance, this.control, options, node);
      let containersCount = 0
      let edView = this.editorContainer.editorView;
      edView.state.doc.descendants((el) => {
        if (el.type.name == 'figures_nodes_container') {
          containersCount++;
        }
      })
      let deleted = false;
      let tr1: any
      let del = () => {
        deleted = false
        tr1 = edView.state.tr
        edView.state.doc.descendants((node, position, parent) => {
          if (node.type.name == 'figures_nodes_container' && !deleted) {
            deleted = true
            tr1 = tr1.replaceWith(position, position + node.nodeSize, Fragment.empty).setMeta('shouldTrack', false)
          }
        })
        edView.dispatch(tr1)
      }
      for (let index = 0; index < containersCount; index++) {
        del()
      }
      this.instance.component.validate = this.instanceValidations
      this.onChange1(true,this.value)

      this.renderEditor = true;
      if(!this.instance.root.firstTextFieldIsFocused&&this.instance.component.autofocus){
        this.instance.root.firstTextFieldIsFocused = true;
        let state = this.editorContainer.editorView.state
        let docSize = state.doc.content.size
        this.editorContainer.editorView.focus();
        this.editorContainer.editorView.dispatch(state.tr.setSelection(TextSelection.create(state.doc,docSize)))
        this.ref.detectChanges()
        this.prosemirrorFocused = true;
      }

      this.editorContainer.editorView.dom.addEventListener('focus', () => {
        this.prosemirrorFocused = true;
      });

      this.editorContainer.editorView.dom.addEventListener('blur', () => {
        this.prosemirrorFocused  = false;
      });

    } catch (e) {
      console.error(e);
    }
  }

  ngAfterViewInit() {
    // Attach the element so the wysiwyg will work.
    let awaitValue = () => {
      setTimeout(() => {
        if (this.value) {
          try {
            this.rerender = true
            //this.onChange1(true, this.control.value)
            this.renderComponents()
          } catch (e) {
            console.error(e);
          }
        } else if (!this.rerender) {
          this.value = this.control.value

          awaitValue()
        }
      }, 20);
      setTimeout(() => {
        if (!this.value && !this.rerender) {
          try {
            this.rerender = true
            //this.onChange1(true, this.control.value)
            this.renderComponents()
          } catch (e) {
            console.error(e);
          }
        }
      }, 500)
    }
    this.value = this.control.value
    awaitValue()
    /* let renderEditor = () => {
      try {
        this.render(this.value!)
      } catch (e) {
        console.error(e);
      }
    } */

  }

  validateOnInit() {

    return
    const { key } = this.instance.component;
    const validationValue = this.editorContainer?.editorView.state

    if (validationValue === null) {
      return;
    }

    this.instance.setPristine(false);

    const validationResult = Validator.checkComponent(
      this.instance,
      { [key]: validationValue },
      { [key]: validationValue }
    );

    if (validationResult.length) {
      this.instance.setCustomValidity(validationResult, false);
      if (!!validationValue) {
        this.control.markAsTouched();
      }
      this.ref.detectChanges();
    }
  }



  render(editorData: any) {

  }
}
TextAreaComponent.MaterialComponent = MaterialTextareaComponent;
export { TextAreaComponent };
