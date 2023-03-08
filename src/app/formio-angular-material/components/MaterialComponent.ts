import { Component, Input, ViewChild, ElementRef, ChangeDetectorRef, AfterViewInit, OnInit, OnDestroy, Pipe, PipeTransform } from '@angular/core';
import FormioComponent from './Base';
//@ts-ignore
import Validator from 'formiojs/validator/Validator.js';
import { FormioControl } from '../FormioControl';
import get from 'lodash/get';
import { DomSanitizer } from '@angular/platform-browser';
import { MaterialNestedComponent } from './MaterialNestedComponent';

@Pipe({ name: 'safe' })
export class SafePipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) { }
  transform(url: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
@Pipe({ name: 'safehtml' })
export class SafeHtmlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) { }
  transform(html: string) {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
@Component({
  selector: 'mat-formio-comp',
  template: '<mat-card>Unknown Component: {{ instance.component.type }}</mat-card>'
})
export class MaterialComponent implements AfterViewInit, OnInit, OnDestroy {
  @Input() instance: any;
  @ViewChild('input') input?: ElementRef;
  @Input() control: FormioControl = new FormioControl();
  constructor(public element: ElementRef, public ref: ChangeDetectorRef) { }

  setInstance(instance: any) {
    instance.materialComponent = this;
    this.instance = instance;
    this.control.setInstance(instance);
    this.instance.disabled = this.instance.shouldDisabled;
    this.renderComponents();
  }

  ngOnDestroy() {
  }

  ngOnInit() {
    if (this.instance) {
      if (this.shouldValidateOnInit()) {
        this.storeFormData();
        this.validateOnInit();
      }
      this.instance.component.defaultValue ? this.setValue(this.instance.component.defaultValue) : '';
    }
  }

  validateOnInit() {
    const { key } = this.instance.component;
    const validationValue = this.getFormValue(this.instance.path);
    this.instance.updateValue(this.control.value, { modified: true });

    if (validationValue === null) {
      return;
    }

    this.instance.setPristine(false)
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
    let isvisible = this.instance.conditionallyVisible()
    this.setVisible(isvisible);
  }

  storeFormData() {
    if (this.instance.parent && this.instance.parent.submission && this.instance.parent.submission.data) {
      sessionStorage.setItem('formData', JSON.stringify(this.instance.parent.submission.data));
    }
  }

  getFormValue(path: any) {
    const formData = JSON.parse(sessionStorage.getItem('formData')!);

    if (!formData) {
      return null;
    }

    return get(formData, path);
  }

  renderComponents() {
    this.setVisible(this.instance._visible)
    //this.setVisible(true);
  }

  onChange(keepInputRaw?: boolean) {
    let value = this.getValue();
    if (value === undefined || value === null) {
      value = this.instance.emptyValue;
    }

    if (this.input && this.input.nativeElement.mask && value && !keepInputRaw) {
      this.input.nativeElement.mask.textMaskInputElement.update(value);
      this.control.setValue(this.input.nativeElement.value);
      value = this.getValue();
    }
    this.instance.updateValue(value, { modified: true });
    this.instance.root.changeVisibility(this.instance);
  }

  getValue() {
    return this.control.value;
  }

  setValue(value: any) {
    this.control.setValue(value);
  }

  beforeSubmit() {

    this.control.markAsTouched();
    return this.control
  }

  hasError() {
    return !!this.instance && !!this.instance.error;
  }

  shouldValidateOnInit() {
    if (!this.instance) {
      return;
    }

    return this.instance.options.validateOnInit
      || this.instance.parent.options.validateOnInit;
  }

  setDisabled(disabled: any) {
    if (disabled) {
      this.control.disable();
    } else {
      this.control.enable();
    }
  }

  setVisible(visible: any) {
    if (this.element && this.element.nativeElement) {
      if (visible) {
        this.element.nativeElement.removeAttribute('hidden');
        this.element.nativeElement.style.visibility = 'visible';
        this.element.nativeElement.style.display = 'block !important';
        this.element.nativeElement.style.position = 'relative';
      } else {
        this.element.nativeElement.setAttribute('hidden', true);
        this.element.nativeElement.style.visibility = 'hidden';
        this.element.nativeElement.style.display = 'none !important';
        this.element.nativeElement.style.position = 'absolute';
      }
    }
  }

  updateVisibility(instance: any,visibleParent?:true) {
    if(instance == null/* ||visibleParent */){
      this.setVisible(this.instance._visible)
    }
    let isvisible = this.instance.conditionallyVisible()
    if(instance){
      this.instance.root.setFullValue();
      setTimeout(()=>{
        this.setVisible(isvisible);
      },200)
    }
    /* if (instance&&
      this.instance.component.conditional &&
      this.instance.component.conditional.when == instance.component.path) {
        this.instance.root.setFullValue();
        setTimeout(()=>{
          this.setVisible((instance.getValue() == this.instance.component.conditional.eq)?this.instance.component.conditional.show:!this.instance.component.conditional.show)
        },200)
    } */
    if (this.instance.components && this.instance.components.length > 0) {
      this.instance.components.forEach((component: any) => {
        if (component.materialComponent) {
          component.materialComponent.updateVisibility(instance);
        }
      })
    }
  }

  ngAfterViewInit() {
    if (this.element && this.element.nativeElement && this.instance) {
      // Add custom classes to elements.
      if (this.instance.component.customClass) {
        this.element.nativeElement.classList.add(this.instance.component.customClass);
      }
    }

    if (this.input) {
      // Set the input masks.
      this.instance.setInputMask(this.input.nativeElement);
      this.instance.addFocusBlurEvents(this.input.nativeElement);
    }
  }
}

FormioComponent.MaterialComponent = MaterialComponent;
export { FormioComponent };
