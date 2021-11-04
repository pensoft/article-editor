import { MarkSpec } from "prosemirror-model";
import { trackChangesMarks } from './trackChangesMarks';
import { comment } from './comment';
import { marks as basicmarks } from './basic-marks';


export const marks: MarkSpec = {
    math_select: {
        toDOM() {
            return ["math-select", 0]
        },
        parseDOM: [{ tag: "math-select" }]
    },
    subscript: {
        toDOM() {
            return ["sub", 0]
        },
        parseDOM: [{ tag: "sub" }]
    },
    superscript: {
        toDOM() {
            return ["sup", 0]
        },
        parseDOM: [{ tag: "sup" }]
    },
    comment,
    ...trackChangesMarks,
    ...basicmarks,
    invalid: {
        attrs: {
            class: { default: 'invalid' },
        },
        parseDOM: [
            {
                tag: 'span',
                getAttrs(dom: any) {
                    return {
                        class: dom.getAttribute('class'),
                    }
                },
            },
        ],
        toDOM(node: any) {
            return [
                'span',
                {
                    class: node.attrs.class,
                },
            ];
        },
    },
    anchorTag: {
        attrs: {
            class: { default: 'anchor_tag' },
            id: {},
        },
        inclusive: false,
        parseDOM: [{
            tag: "span", getAttrs(dom: any) {
                return { id: dom.getAttribute("id"), class: dom.getAttribute('class') }
            }
        }],
        toDOM(node: any) {
            return ["span", { id: node.attrs.id, class: node.attrs.class }, 0]
        }
    },
    underline: {
        parseDOM: [{ tag: 'u' }, { style: 'text-decoration=underline' }],
        toDOM() {
            return ['u', 0]
        },
    },

}