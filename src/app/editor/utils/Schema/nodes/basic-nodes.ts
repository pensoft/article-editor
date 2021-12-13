import { Node } from "prosemirror-model";
import { parseGenericAttributes, getGenericAttributes, genericAttributtesToDom,htmlTags } from '../helpers';

export const nodes = {
    blockquote: {
        content: "block+",
        group: "block",
        attrs:{
            ...getGenericAttributes()
        },
        defining: true,
        parseDOM: [{ tag: "blockquote" ,getAttrs: (dom: any) => {
            return {
                ...parseGenericAttributes(dom),
            };
        }}],
        toDOM: function toDOM(node:Node) { return ["blockquote",{...genericAttributtesToDom(node)},0] }
    },
    horizontal_rule: {
        group: "block",
        attrs:{
            ...getGenericAttributes()
        },
        parseDOM: [{ tag: "hr" ,getAttrs: (dom: any) => {
            return {
                ...parseGenericAttributes(dom),
            };
        }}],
        toDOM: function toDOM(node:Node) { return ["hr",{...genericAttributtesToDom(node)}] }
    },
    heading: {
        attrs: { tagName: { default: 'heading' },...getGenericAttributes() },
        content: "inline*",
        group: "block",
        defining: true,
        parseDOM: (function () {
            return ['h1','h2','h3','h4','h5','h6'].map((tagName: string) => {
                return {
                    tag: tagName,
                    getAttrs: (dom: any) => {
                        return {
                            ...parseGenericAttributes(dom),
                            tagName: dom.tagName
                        };
                    }
                }
            });
        })(),
        toDOM: function toDOM(node: Node) { return [node.attrs.tagName,{...genericAttributtesToDom(node)}, 0] }
    },
    code_block: {
        content: "inline*",
        attrs:{
            ...getGenericAttributes()
        },
        marks: "",
        group: "block",
        code: true,
        defining: true,
        parseDOM: [{ tag: "pre", preserveWhitespace: "full" ,getAttrs(dom: any) {
            return {
                ...parseGenericAttributes(dom),
            }
        }}],
        toDOM: function toDOM(node:Node) { return ["pre", {...genericAttributtesToDom(node)},["code", 0]] }
    },
    
    hard_break: {
        inline: true,
        group: "inline",
        attrs:{
            ...getGenericAttributes()
        },
        selectable: false,
        parseDOM: [{ tag: "br" ,getAttrs(dom: any) {
            return {
                ...parseGenericAttributes(dom),
            }
        }}],
        toDOM(node:Node) { return ["br",{...genericAttributtesToDom(node)}] }
    },
    spacer:{
        inline: false,
        group: "block",
        attrs:{
            ...getGenericAttributes()
        },
        selectable: false,
        parseDOM: [{ tag: "spacer" ,getAttrs(dom: any) {
            return {
                ...parseGenericAttributes(dom),
            }
        }}],
        toDOM(node:Node) { return ["spacer",{...genericAttributtesToDom(node)}] }
    }
};

