import { uuidv4 } from 'lib0/random';
import { Node } from 'prosemirror-model';
import { parseGenericAttributes, getGenericAttributes, genericAttributtesToDom } from '../helpers';

export const math_inline = {
  group: "inline math",
  content: "text*",
  attrs: {
    ...getGenericAttributes(),
    math_id: { default: uuidv4() }
  },
  inline: true,
  marks: "",
  atom: true,
  parseDOM: [{
    tag: "math-inline", getAttrs(dom: HTMLElement) {
      return {
        ...parseGenericAttributes(dom),
        math_id: dom.getAttribute('mathid')
      }
    }
  }],
  toDOM: (node: Node) => {return ["math-inline", { class: "math-node", mathid: node.attrs.math_id, ...genericAttributtesToDom(node) }, 0]},
}
export const math_display = {
  group: "block math",
  content: "text*",
  atom: true,
  code: true,
  marks: "",
  attrs: {
    ...getGenericAttributes(),
    math_id: { default: uuidv4() }
  },
  parseDOM: [{
    tag: "math-display", getAttrs(dom: any) {
      return {
        ...parseGenericAttributes(dom),
        math_id: dom.getAttribute('mathid')
      }
    }
  }],
  toDOM: (node: Node) => {
    return ["math-display", { class: "math-node", ...genericAttributtesToDom(node), mathid: node.attrs.math_id }, 0]
  },
}

export const MathNodes = {
  math_inline, math_display
}
