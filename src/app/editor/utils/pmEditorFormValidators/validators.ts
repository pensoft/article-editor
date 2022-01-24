import { AbstractControl, FormControl } from "@angular/forms";
import { FormArray, FormGroup, Validators } from '@angular/forms';
import { max } from "lodash";

import { DOMParser, Node } from "prosemirror-model";
import { of } from "rxjs";
import { schema } from "../Schema";

let DOMPMparser = DOMParser.fromSchema(schema)

let parseNodeHTmlStringToTextContent = (html:string) => {
    let html1 = html.match(/<span class="(deletion|insertion|format-change)"/gm);
    if(html1){
        return true
    }
    let teml = document.createElement('div');
    teml.innerHTML = html
    let pmNode = schema.nodes.form_field.create({},DOMPMparser.parseSlice(teml).content);
    return pmNode.textContent
}
function isEmptyInputValue(value:string) {
    // we don't check for string here so it also works with arrays
    return value == null || value.length === 0;
}

function hasValidLength(value:string) {
    // non-strict comparison is intentional, to check for both `null` and `undefined` values
    return value != null && typeof value.length === 'number';
}

/* export function asyncPmRequired(control: AbstractControl) {

    if(!control.value){
        return of(null)
    }
    let textContent = parseNodeHTmlStringToTextContent(control.value)
    return of(isEmptyInputValue(textContent) ? { 'required': true } : null)
} */

export function pmRequired(control: AbstractControl) {
    if(!control.value){
        return null
    }
    let textContent = parseNodeHTmlStringToTextContent(control.value)
    if(textContent == true){
        return null
    }
    return isEmptyInputValue(textContent) ? { 'required': {value:true,message:`This field is required.`} } : null;
}

export function pmMaxLength(maxLength: number) {
    return (control: AbstractControl) => {
        if(!control.value){
            return null
        }
        let textContent = parseNodeHTmlStringToTextContent(control.value)
        if(textContent == true){
            return null
        }
        if (isEmptyInputValue(textContent) || !hasValidLength(textContent)) {
            // don't validate empty values to allow optional controls
            // don't validate values without `length` property
            return null;
        }
        return textContent.length > maxLength ?
            { 'maxlength': { 'requiredLength': maxLength, 'actualLength': textContent.length,message:`Max length for this field is ${maxLength}.` } } :
            null;
    }
}

export function pmMinLength(minLength: number) {
    return (control: AbstractControl) => {
        if(!control.value){
            return null
        }
        let textContent = parseNodeHTmlStringToTextContent(control.value)
        if(textContent == true){
            return null
        }
        return hasValidLength(textContent) && textContent.length < minLength ?
            { 'minlength': { 'requiredLength': minLength, 'actualLength': textContent.length,message:`Minimal length for this field is ${minLength}.` } } :
            null;
    }
}

/*export function asyncPmPattern(pattern: any) {
    return asyncPmRequired
     if (!pattern){
        return null;
    }
    let regex : any;
    let regexStr : any;
    if (typeof pattern === 'string') {
        regexStr = '';
        if (pattern.charAt(0) !== '^')
            regexStr += '^';
        regexStr += pattern;
        if (pattern.charAt(pattern.length - 1) !== '$')
            regexStr += '$';
        regex = new RegExp(regexStr);
    }else{
        regexStr = pattern.toString();
        regex = pattern;
    }
    return (control: AbstractControl)=>{
        if(!control.value){
            return of(null)
        }
        let prosemirrorNode: Node = schema.nodeFromJSON(control.value)
        let textContent = prosemirrorNode.textContent
        if (isEmptyInputValue(textContent)) {
            return of(null); // don't validate empty values to allow optional controls
        }
        const value = textContent;
        return regex.test(value) ? of(null) :
            of({ 'pattern': { 'requiredPattern': regexStr, 'actualValue': value } })
    }
} */

export function pmPattern(pattern: any) {
    if (!pattern){
        return null;
    }
    let regex : any;
    let regexStr : any;
    if (typeof pattern === 'string') {
        regexStr = '';
        if (pattern.charAt(0) !== '^')
            regexStr += '^';
        regexStr += pattern;
        if (pattern.charAt(pattern.length - 1) !== '$')
            regexStr += '$';
        regex = new RegExp(regexStr);
    }else{
        regexStr = pattern.toString();
        regex = pattern;
    }
    return (control: AbstractControl)=>{
        if(!control.value){
            return null
        }
        let textContent = parseNodeHTmlStringToTextContent(control.value)
        if(textContent == true){
            return null
        }
        if (isEmptyInputValue(textContent)) {
            return null; // don't validate empty values to allow optional controls
        }
        const value = textContent;
        let result = regex.test(value) ? null :
            { 'pattern': { 'requiredPattern': regexStr, 'actualValue': value,message:`This field does not match the pattern {${regexStr}}.` } };
        return result
    }
}
