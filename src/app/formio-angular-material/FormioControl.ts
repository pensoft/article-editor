import { FormControl, ValidationErrors } from '@angular/forms';
import { debug } from 'console';
import unescape from 'lodash/unescape';

// @dynamic
export class FormioControl extends FormControl {
  public instance: any;

  static customValidator(control: FormioControl): Promise<ValidationErrors> {
    return new Promise((resolve) => {
      if (control.instance) {
        control.instance.validateResolve = resolve;
      } else {
        //@ts-ignore
        resolve(null);
      }
    });
  }

  constructor(...args:any) {
        //@ts-ignore
    super(args[0], [], [FormioControl.customValidator.bind(FormioControl)]);
  }

  setInstance(instance: any) {
    this.instance = instance;
    const setCustomValidity = instance.setCustomValidity;
    instance.setCustomValidity = (message: any, dirty:any, external:any, isWarning = false) => {
      let decodedMessage = message;
      /* if(this.instance.component.type == "prosemirror-editor-field"){
        setCustomValidity.call(instance, '', dirty, external, isWarning);
        instance.validateResolve(null);
        return null 
      } */
      if (Array.isArray(message)) {
        decodedMessage = message.map(msg => Object.assign(msg, { message: unescape(msg.message) }));
      }
      else if (message) {
        decodedMessage = unescape(message);
      }

      setCustomValidity.call(instance, decodedMessage, dirty, external, isWarning);
      if (instance.validateResolve) {
        instance.validateResolve(decodedMessage ? {custom: true} : null);
      }
    };
  }
}
