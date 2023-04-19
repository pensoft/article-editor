import { MarkSpec } from "prosemirror-model";
import { trackChangesMarks } from './trackChangesMarks';
import { comment, overlapComment } from './comment';
import { marks as basicmarks } from './basic-marks';
import { Node } from "prosemirror-model";
import delFromPopup from "./trackChangesMarks/delFromPopupMark";
import insFromPopup from "./trackChangesMarks/insFromPopup";
import citation from "./trackChangesMarks/citation";
import  table_citation  from "./trackChangesMarks/table-citation";
import supplementary_file_citation from "./trackChangesMarks/supplementary-file-citation";
import end_note_citation from "./trackChangesMarks/end-note-citation";
import { taxon } from "./taxon-nodes";

const calcYChangeStyle = (ychange: any) => {
    switch (ychange.type) {
        case 'removed':
            return `color:${ychange.color.dark}`
        case 'added':
            return `background-color:${ychange.color.light}`
        case null:
            return ''
    }
}



const hoverWrapper = (ychange:any, els:any) =>
  ychange === null ? els : [['span', { class: 'ychange-hover', style: `background-color:${ychange.color.dark}` }, ychange.user || 'Unknown'], ['span', ...els]]


const calcYchangeDomAttrs = (attrs: any, domAttrs: any = {}) => {
    domAttrs = Object.assign({}, domAttrs)
    if (attrs.ychange !== null) {
        domAttrs.ychange_user = attrs.ychange.user
        domAttrs.ychange_type = attrs.ychange.type
        domAttrs.ychange_color = attrs.ychange.color.light
        domAttrs.style = calcYChangeStyle(attrs.ychange)
    }
    return domAttrs
}

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
    taxon,
    comment,
    overlapComment,
    ...trackChangesMarks,
    delFromPopup,
    insFromPopup,
    table_citation,
    end_note_citation,
    citation,
    supplementary_file_citation,
    ...basicmarks,
    invalid: {
        parseDOM: [
            { tag: 'div.invalid' },
        ],
        toDOM(node: any) {
            return [
                'div',
                {
                    class: 'invalid',
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
            tag: "span.anchor_tag", getAttrs(dom: any) {
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
    ychange: {
        attrs: {
            user: { default: null },
            type: { default: null },
            color: { default: null }
        },
        inclusive: false,
        parseDOM: [{ tag: 'ychange' }],
        toDOM(node: Node) {
            return ['ychange', { ychange_user: node.attrs.user, ychange_type: node.attrs.type, style: calcYChangeStyle(node.attrs), ychange_color: node.attrs.color.light }, ...hoverWrapper(node.attrs, [0])]
        }
    }
}
