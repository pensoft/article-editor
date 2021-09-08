import { MarkSpec, NodeSpec, Schema } from 'prosemirror-model';
import { nodes as basicnodes, marks as basicmarks } from 'prosemirror-schema-basic';
import { tableNodes } from 'prosemirror-tables';
//@ts-ignore
import {trackChangesNodes,trackChangesMarks,commentMark} from './trackChanges/wax-prosemirror-schema'
//@ts-ignore
import { SchemaHelpers } from 'wax-prosemirror-utilities';

const olDOM = ["ol", 0], ulDOM = ["ul", 0], liDOM = ["li", 0]

// :: NodeSpec
// An ordered list [node spec](#model.NodeSpec). Has a single
// attribute, `order`, which determines the number at which the list
// starts counting, and defaults to 1. Represented as an `<ol>`
// element.

// :: NodeSpec
// A bullet list node spec, represented in the DOM as `<ul>`.

// :: NodeSpec
// A list item (`<li>`) spec.


const nodes: NodeSpec = {
  doc: {
    content: "block+"
  },
  
  paragraph: {
    content: "inline*",
    group: "block",
    attrs: { 
      align: { default: 'set-align-left' } ,
      id: { default: '' },
      track: { default: [] },
      group: { default: '' },
      viewid: { default: '' },
    },
    parseDOM: [{ tag: "p" ,getAttrs(dom:any) {
      return {
        id: dom.dataset.id,
        track: SchemaHelpers.parseTracks(dom.dataset.track),
        group: dom.dataset.group,
        viewid: dom.dataset.viewid,
      }
    },}],
    toDOM(node: any) { return ["p", {
      class: node.attrs.align ,
      'data-id': node.attrs.id,
      'data-track': JSON.stringify(node.attrs.track),
      'data-group': node.attrs.group,
      'data-viewid': node.attrs.viewid,

    }, 0]; }
  },

  video: {
    inline: true,
    attrs: {
      src: { default: 'https://www.youtube.com/watch?v=TgbqBx4NthI&list=RDMMTgbqBx4NthI&start_radio=1&ab_channel=CHMusicChannel' }
    },
    group: "inline",
    draggable: true,
    parseDOM: [{
      tag: "iframe", getAttrs(dom: any) {
        return {
          src: dom.getAttribute('src'),
        }
      }
    }],
    toDOM(node: any) {
      let { src } = node.attrs;
      return ["iframe", { controls: '', width: 200, height: 180, src }]
    }
  },

  math_inline: {               // important!
    group: "inline math",
    content: "text*",        // important!
    inline: true,            // important!
    atom: true,              // important!
    toDOM: () => ["math-inline", { class: "math-node" }, 0],
    parseDOM: [{
      tag: "math-inline"   // important!
    }]
  },
  math_display: {              // important!
    group: "block math",
    content: "text*",        // important!
    atom: true,              // important!
    code: true,              // important!
    toDOM: () => {
      return ["math-display", { class: "math-node" }, 0]
    },
    parseDOM: [{
      tag: "math-display"  // important!
    }]
  },
  text: {
    group: "inline"
  },
  blockquote: basicnodes.blockquote,
  code_block: basicnodes.code_block,
  hard_break: basicnodes.hard_break,
  heading: basicnodes.heading,
  horizontal_rule: basicnodes.horizontal_rule,
  image: basicnodes.image,
  ordered_list: {
    content: "list_item+",
    group: 'block',
    attrs: { order: { default: 1 } },
    parseDOM: [{
      tag: "ol", getAttrs(dom: any) {
        return { order: dom.hasAttribute("start") ? +dom.getAttribute("start") : 1 }
      }
    }],
    toDOM(node: any) {
      return node.attrs.order == 1 ? olDOM : ["ol", { start: node.attrs.order }, 0]
    }
  },
  bullet_list: {
    group: 'block',
    content: "list_item+",
    parseDOM: [{ tag: "ul" }],
    toDOM() { return ulDOM }
  },
  list_item: {
    content: "paragraph block*",
    parseDOM: [{ tag: "li" }],
    toDOM() { return liDOM },
    defining: true
  },
  ...tableNodes({
    tableGroup: "block",
    cellContent: "block+",
    cellAttributes: {
      background: {
        default: null,
        //@ts-ignore
        getFromDOM(dom) { return dom.style.backgroundColor || null },
        setDOMAttr(value, attrs) { if (value) attrs.style = (attrs.style || "") + `background-color: ${value};` }
      }
    }
  }),
  ...trackChangesNodes,
}

const marks: MarkSpec = {
  math_select: {
    toDOM() { return ["math-select", 0] },
    parseDOM: [{ tag: "math-select" }]
  },
  subscript: {
    toDOM() { return ["sub", 0] },
    parseDOM: [{ tag: "sub" }]
  },
  superscript: {
    toDOM() { return ["sup", 0] },
    parseDOM: [{ tag: "sup" }]
  },
  comment :commentMark,
  ...trackChangesMarks,
  ...basicmarks,
}

export { nodes, marks }
export const schema = new Schema({ nodes, marks });
