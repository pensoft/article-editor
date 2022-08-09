import { Node } from 'prosemirror-model';
import { parseGenericAttributes, getGenericAttributes, genericAttributtesToDom } from '../helpers';


export const ordered_list = {
    content: "list_item+",
    group: 'block',
    attrs: {
        order: { default: 1 },
        ...getGenericAttributes(),
    },
    parseDOM: [{
        tag: "ol", getAttrs(dom: any) {
            return {
                order: dom.hasAttribute("start") ? +dom.getAttribute("start") : 1 ,
                ...parseGenericAttributes(dom)
            }
        }
    }],
    toDOM(node: any) {
        return node.attrs.order == 1 ? ["ol", {
            ...genericAttributtesToDom(node)
        }, 0] : ["ol", {
            start: node.attrs.order ,
            ...genericAttributtesToDom(node)
        }, 0]
    }
}
export const bullet_list = {
    group: 'block',
    content: "list_item+",
    attrs:{
        ...getGenericAttributes(),
    },
    parseDOM: [{ tag: "ul" ,getAttrs(dom:any){
        return{
            ...parseGenericAttributes(dom)
        }
    }}],
    toDOM(node:Node) {
        return ["ul", {
            ...genericAttributtesToDom(node)
        },0]
    }
}
export const list_item = {
    content: "block*",
    attrs:{
        ...getGenericAttributes(),
    },
    parseDOM: [{ tag: "li" ,getAttrs(dom:any){
        return{
            ...parseGenericAttributes(dom)
        }
    }}],
    toDOM(node:Node) {
        return ["li", {
            ...genericAttributtesToDom(node)
        },0]
    },
    defining: true
}

export const listNodes = {
    list_item,bullet_list,ordered_list
}
