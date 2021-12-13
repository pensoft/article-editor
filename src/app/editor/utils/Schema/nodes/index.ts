//@ts-ignore
import { NodeSpec } from 'prosemirror-model';
import { MathNodes } from './math';
import { tableNodes } from './table';
import { listNodes } from './lists';
import { parseGenericAttributes, getGenericAttributes, genericAttributtesToDom, htmlTags } from '../helpers';
import { nodes as basicNodes } from './basic-nodes'
import { figureNodes, video } from './figure-nodes';

export const paragraph = {
    content: "inline*",
    group:'block',
    attrs: {
        align: { default: 'set-align-left' },
        ...getGenericAttributes()
    },
    parseDOM: [{
        tag: "p", getAttrs(dom: any) {
            let classArray = dom.getAttribute('class')
            return {
                align: classArray,
                ...parseGenericAttributes(dom)
            }
        },
    }],
    toDOM(node: any) {
        let attributesToDom: any = {
            ...genericAttributtesToDom(node)
        }

        attributesToDom['class'] = node.attrs.align

        return ["p", attributesToDom, 0];
    }
}

export const form_field = {
    content: "block*",
    group: "block",
    isolating: true,
    attrs: {
        ...getGenericAttributes()
    },
    parseDOM: [{
        tag: "form-field", getAttrs(dom: any) {
            return {
                ...parseGenericAttributes(dom),
            }
        },
    }],
    toDOM(node: any) {
        let attributesToDom: any = {
            ...genericAttributtesToDom(node),

        }
        return ["form-field", attributesToDom, 0];
    }
}

export const inline_block_container= {
    content: "block+",
    group: "block",
    attrs: {
        ...getGenericAttributes()
    },
    parseDOM: [{
        tag: "inline-block-container", getAttrs(dom: any) {
            return {
                ...parseGenericAttributes(dom),
            }
        },
    }],
    toDOM(node: any) {
        let attributesToDom: any = {
            ...genericAttributtesToDom(node),
        }
        return ["inline-block-container", attributesToDom, 0];
    }
}

export const nodes: NodeSpec = {
    doc: {
        content: "block*"
    },
    form_field,
    inline_block_container,
    paragraph,
    ...tableNodes({
        tableGroup: "block",
        cellContent: "form_field{1}",
        cellAttributes: {
            background: {
                default: null,
                //@ts-ignore
                getFromDOM(dom) {
                    return dom.style.backgroundColor || null
                },
                setDOMAttr(value: any, attrs: any) {
                    if (value) attrs.style = (attrs.style || "") + `background-color: ${value};`
                }
            }
        }
    }),
    ...figureNodes,
    text: {
        inline: true,
        group: "inline"
    },
    ...basicNodes,
    ...MathNodes,
    ...listNodes,
}


