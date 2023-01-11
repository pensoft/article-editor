//@ts-ignore
import { NodeSpec } from 'prosemirror-model';
import { MathNodes } from './math';
import { tableNodes } from './table';
import { listNodes } from './lists';
import { parseGenericAttributes, getGenericAttributes, genericAttributtesToDom, htmlTags } from '../helpers';
import { nodes as basicNodes } from './basic-nodes'
import { figureNodes } from './figure-nodes';
import { tableNodes as citableTableNodes } from './citable-tables';
import { supplementaryFileNodes } from './supplementary-files';
import { endNotesNodes } from './end-notes';
import { reference_block_container, reference_citation, reference_citation_end, reference_container } from './ref-nodes';

export const paragraph = {
  content: "inline*",
  group: 'block',
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

export const form_field_inline = {
  content: "inline*",
  group: "block",
  isolating: true,
  attrs: {
    ...getGenericAttributes()
  },
  parseDOM: [{
    tag: "form-field-inline", getAttrs(dom: any) {
      return {
        ...parseGenericAttributes(dom),

      }
    },
  }],
  toDOM(node: any) {
    let attributesToDom: any = {
      ...genericAttributtesToDom(node),

    }
    return ["form-field-inline", attributesToDom, 0];
  }
}

export const form_field_inline_view = {
  content: "block*",
  group: "block",
  isolating: true,
  attrs: {
    ...getGenericAttributes()
  },
  parseDOM: [{
    tag: "form-field-inline-view", getAttrs(dom: any) {
      return {
        ...parseGenericAttributes(dom),
      }
    },
  }],
  toDOM(node: any) {
    let attributesToDom: any = {
      ...genericAttributtesToDom(node),

    }
    return ["form-field-inline-view", attributesToDom, 0];
  }
}

export const form_field = {
  content: "(paragraph|block)+",
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

export const inline_block_container = {
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
  form_field_inline,
  form_field_inline_view,
  reference_citation,
  reference_citation_end,
  reference_container,
  reference_block_container,
  //placeholder,
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
  ...citableTableNodes,
  ...supplementaryFileNodes,
  ...endNotesNodes,
  text: {
    inline: true,
    group: "inline"
  },
  ...basicNodes,
  ...MathNodes,
  ...listNodes,
}


