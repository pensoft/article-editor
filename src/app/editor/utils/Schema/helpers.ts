//getGenericAttribute
//parseGenerictributes
//genericArtibutesToDom

import { Node } from "prosemirror-model"

export const getGenericAttributes = () => {
    return {
        controlPath: { default: '' },
        formControlName: { default: '' },
        contenteditable: { default: '' },
        class: {default:''},
    }
}

export const parseGenericAttributes = (dom: any) => {
    
    
    return {
        controlPath: dom.getAttribute('controlPath'),
        formControlName: dom.getAttribute('formControlName'),
        contenteditable: dom.getAttribute('contenteditable'),

    }
}

export const genericAttributtesToDom = (node: Node) => {
    let toDomAttrs:any = {
    }
    Object.keys(node.attrs).forEach((key)=>{
        if(node.attrs[key] !== ''){
            toDomAttrs[key] = node.attrs.contenteditable
        }
    })
    return toDomAttrs
}

export const htmlTags = ["a",
"address",
"article",
"bdo",
"caption",
"cite",
"dd",
"del",
"details",
"dfn",
"figcaption",
"figure",
"ins",
"kbd",
"mark",
"q",
"rp",
"rt",
"ruby",
"s",
"samp",
"section",
"small",
"span",
"summary",
"var"]