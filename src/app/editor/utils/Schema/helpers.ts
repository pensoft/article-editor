//getGenericAttribute
//parseGenerictributes
//genericArtibutesToDom

import { Node } from "prosemirror-model"

export const getGenericAttributes = () => {
    return {
        controlPath: { default: '' },
        formControlName: { default: '' },
        contenteditableNode: { default: '' },
        menuType: { default: '' },
        commentable: { default: '' },
        invalid:{default:''}
    }
}

export const parseGenericAttributes = (dom: any) => {
    
    
    return {
        controlPath: dom.getAttribute('controlPath'),
        formControlName: dom.getAttribute('formControlName'),
        contenteditableNode: dom.getAttribute('contenteditableNode'),
        menuType: dom.getAttribute('menuType'),
        commentable: dom.getAttribute('commentable'),
        invalid: dom.getAttribute('invalid'),
    }
}

export const genericAttributtesToDom = (node: Node) => {
    let toDomAttrs:any = {
    }
    Object.keys(node.attrs).forEach((key)=>{
        /* if(key == 'ivalid'){
            toDomAttrs['class']=toDomAttrs['class']?toDomAttrs['class']:'';
            node.attrs[key] !== ''?(toDomAttrs['class'] += node.attrs[key]):undefined;
            toDomAttrs[key] = node.attrs[key];
        }else  */if(node.attrs[key] !== ''){
            toDomAttrs[key] = node.attrs[key]
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
"summary",
"var"]