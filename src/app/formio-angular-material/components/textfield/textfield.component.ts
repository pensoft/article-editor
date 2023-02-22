import { Component, OnInit, AfterContentInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
//@ts-ignore
import TextFieldComponent from 'formiojs/components/textfield/TextField.js';
import { MaterialComponent } from '../MaterialComponent';

export const TEXTFIELD_TEMPLATE = `
  <mat-formio-form-field [instance]="instance" [componentTemplate]="componentTemplate"></mat-formio-form-field>
  <ng-template #componentTemplate let-hasLabel>
    <mat-form-field class="formio-formfield" [appearance]="getFormFieldAppearance()" fxFill>

      <mat-label *ngIf="hasLabel">
          <span [instance]="instance" matFormioLabel></span>
      </mat-label>

      <span *ngIf="instance.component.prefix && instance.type !== 'currency'"
            matPrefix
      >
        {{ instance.component.prefix }}&nbsp;
      </span>
      <input matInput
            type="{{ inputType }}"
            [formControl]="control"
            [placeholder]="instance.component.placeholder"
            (input)="onChange()" #input
      >
      <span *ngIf="instance.component.suffix" matSuffix>{{ instance.component.suffix }}</span>

      <mat-hint *ngIf="instance.component.showWordCount || instance.component.showCharCount">
        {{ getHint() }}
      </mat-hint>

      <br/>
      <mat-error *ngIf="isError()" >{{ getErrorMessage() }}</mat-error>
    </mat-form-field>
  </ng-template>
`;

@Component({
  selector: 'mat-formio-textfield',
  styleUrls: ['./textfield.scss'],
  templateUrl: './textfield.component.html',
})
export class MaterialTextfieldComponent extends MaterialComponent implements AfterContentInit ,AfterViewInit{
  public inputType = 'text';
  @ViewChild('inputEl', { read: ElementRef }) inputEl?: ElementRef;

  ngAfterContentInit() {
    if (this.instance && this.control && this.instance.component.disabled) {
      this.control.disable();
    }
  }

  ngAfterViewInit(): void {
    if(!this.instance.root.firstTextFieldIsFocused&&this.instance.component.autofocus){
      this.instance.root.firstTextFieldIsFocused = true;
      (this.inputEl?.nativeElement as HTMLInputElement).focus();
      this.ref.detectChanges()
    }
  }

  getHint() {
    if (!this.instance || !this.control || !this.control.value) {
      return '';
    }

    const {showWordCount, showCharCount} = this.instance.component;

    if (showWordCount && showCharCount) {
      return `${this.getWordsCount()} words, ${this.control.value.length} characters`;
    } else if (showWordCount) {
      return `${this.getWordsCount()} words`;
    } else {
      return `${this.control.value.length} characters`;
    }
  }

  getWordsCount() {
    const matches = this.control.value ? this.control.value.match(/[\w\d’'-]+/gi) : [];
    return matches ? matches.length : 0;
  }

  getFormFieldAppearance() {
    const appearances = ['legacy', 'standard', 'fill', 'outline'];
    const appearance = this.instance.component.appearance ? this.instance.component.appearance.toLowerCase() : '';
    return appearances.includes(appearance) ? appearance : undefined;
  }

  isError() {
    if (this.instance.error) {
      this.control.setErrors(this.instance.component.validate);
      return true;
    }
    else {
      return false;
    }
  }

  getErrorMessage() {
    if (this.instance.error && this.instance.error.messages) {
      const { messages } = this.instance.error;

      for (const msg of messages) {
        if (msg.context && this.control.hasError(msg.context.validator)) {
          return this.instance.error.message;
        }
      }
    }
  }
}
TextFieldComponent.MaterialComponent = MaterialTextfieldComponent;
export { TextFieldComponent };
