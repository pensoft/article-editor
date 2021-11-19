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
        content: "text*",
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
    image: {
        inline: true,
        attrs: {
            src: {},
            ...getGenericAttributes(),
            alt: { default: null },
            title: { default: null },
        },
        group: "inline",
        draggable: true,
        parseDOM: [{
            tag: "img[src]", getAttrs: function getAttrs(dom: any) {
                return {
                    src: dom.getAttribute("src"),
                    title: dom.getAttribute("title"),
                    alt: dom.getAttribute("alt"),
                    ...parseGenericAttributes(dom),
                }
            }
        }],
        toDOM: function toDOM(node: Node) {
            var ref = node.attrs;
            var src = ref.src;
            var alt = ref.alt;
            var title = ref.title; return ["img", { src: src, alt: alt, title: title ,...genericAttributtesToDom(node)}]
        }
    },
    hard_break: {
        inline: true,
        group: "hard-break",
        attrs:{
            ...getGenericAttributes()
        },
        selectable: false,
        parseDOM: [{ tag: "br" ,getAttrs(dom: any) {
            return {
                ...parseGenericAttributes(dom),
            }
        }}],
        toDOM: function toDOM(node:Node) { return ["br",{...genericAttributtesToDom(node)}] }
    }
};

