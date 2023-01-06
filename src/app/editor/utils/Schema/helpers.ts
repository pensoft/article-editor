//getGenericAttribute
//parseGenerictributes
//genericArtibutesToDom

import { Mark, Node } from "prosemirror-model"

export const getGenericAttributes = (defaults?:{[key:string]:any}) => {
    let attrs = {
        controlPath: { default: '' },
        customPropPath: { default: '' },
        formControlName: { default: '' },
        contenteditableNode: { default: '' },
        menuType: { default: '' },
        allowedTags: { default: '' },
        commentable: { default: '' },
        invalid:{default:'false'},
        styling:{default:''},
    }
    if(defaults){
      Object.keys(defaults).forEach((attr)=>{
        attrs[attr] = defaults[attr]
      })
    }
    return attrs
}

export const parseGenericAttributes = (dom: any) => {
    return {
        controlPath: dom.getAttribute('controlPath'),
        customPropPath: dom.getAttribute('customPropPath'),
        formControlName: dom.getAttribute('formControlName'),
        contenteditableNode: dom.getAttribute('contenteditableNode'),
        menuType: dom.getAttribute('menuType'),
        allowedTags: dom.getAttribute('allowedTags'),
        commentable: dom.getAttribute('commentable'),
        invalid: dom.getAttribute('invalid'),
        styling: dom.getAttribute('style'),
    }
}

export const genericAttributtesToDom = (node: Node|Mark) => {
    let toDomAttrs:any = {
        controlPath: node.attrs.controlPath,
        customPropPath: node.attrs.customPropPath,
        formControlName: node.attrs.formControlName,
        contenteditableNode: node.attrs.contenteditableNode,
        menuType: node.attrs.menuType,
        allowedTags: node.attrs.allowedTags,
        commentable: node.attrs.commentable,
        invalid: node.attrs.invalid,
        style: node.attrs.styling,
    }
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
"summary",
"var"]
