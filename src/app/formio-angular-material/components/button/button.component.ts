import { Component } from '@angular/core';
//@ts-ignore
import ButtonComponent from 'formiojs/components/button/Button.js';
import { MaterialComponent } from '../MaterialComponent';
import { AngularButtonsThemes, ButtonsThemes } from '../../const/ButtonsThemes';

@Component({
  selector: 'mat-formio-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.css']
})
export class MaterialButtonComponent extends MaterialComponent {
  public loading = false;
  public done = false;
  public error = false;
  public disabled = false;
  public clicked = false;

  get color() {
    if (this.error) {
      return AngularButtonsThemes.WARN;
    }
    const theme = this.angularButtonTheme;
    return theme || AngularButtonsThemes.PRIMARY;
  }

  get angularButtonTheme() {
    switch (this.instance.component.theme) {
      case ButtonsThemes.PRIMARY:
        return AngularButtonsThemes.PRIMARY;

      case ButtonsThemes.WARNING:
        return AngularButtonsThemes.ACCENT;

      case ButtonsThemes.DANGER:
        return AngularButtonsThemes.WARN;

      case ButtonsThemes.SECONDARY:
        return AngularButtonsThemes.BASIC;

      default:
        return '';
    }
  }

  get buttonClass() {
    let className = this.instance.component.block ? 'mat-formio-button-block' : '';
    className += this.instance.component.size ? ` mat-formio-button-${this.instance.component.size}` : '';
    className += !this.angularButtonTheme ? ` mat-formio-theme-${this.instance.component.theme}` : '';
    return className;
  }

  onClick(event:any) {
    this.clicked = true;
    this.instance.onClick(event);
  }

  getValue() {
    return this.clicked;
  }

  setState(loading:any, error:any, done:any) {
    this.loading = loading;
    this.done = done;
    this.error = error;
  }

  getIconFontSet(icon: string) {
    const fontSet = icon.split(' ')[0];
    return fontSet;
  }

  getIconName(icon: string) {
    return icon.replace(this.getIconFontSet(icon), '');
  }

  setInstance(instance:any) {
    const retVal = super.setInstance(instance);
    this.disabled = instance.shouldDisabled;
    instance.on('submitButton', () => this.setState(true, false, false));
    instance.on('submitDone', () => this.setState(false, false, true));
    instance.on('submitError', () => this.setState(false, true, false));
    instance.on('requestButton', () => this.setState(true, false, false));
    instance.on('requestDone', () => this.setState(false, false, true));
    instance.on('change', (event:any) => {
      this.disabled = this.instance.shouldDisabled || (this.instance.component.disableOnInvalid && !event.isValid);
      if (event.isValid) {
        this.loading = false;
        this.error = false;
      }
    });
    return retVal;
  }
}
ButtonComponent.MaterialComponent = MaterialButtonComponent;
export { ButtonComponent };
