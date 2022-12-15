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

export const reference_citation = {
  content: "inline",
  group: "inline",
  inline:true,
  isolating: true,
  attrs: {
    ...getGenericAttributes(),
    refCitationID:{default:''},
    actualRefId:{default:''},
  },
  parseDOM: [{
    tag: "reference-citation", getAttrs(dom: any) {
      return {
        ...parseGenericAttributes(dom),
        refCitationID : dom.getAttribute('refCitationID'),
        actualRefId : dom.getAttribute('actualRefId'),
      }
    },
  }],
  toDOM(node: any) {
    let attributesToDom: any = {
      ...genericAttributtesToDom(node),
      refCitationID:node.attrs.refCitationID,
      actualRefId:node.attrs.actualRefId,
    }
    return ["reference-citation", attributesToDom, 0];
  }
}

export const reference_container = {
  content: "block*",
  group: "block",
  attrs: {
    ...getGenericAttributes(),
  },
  parseDOM: [{
    tag: "ul.reference-container", getAttrs(dom: any) {
      return {
        ...parseGenericAttributes(dom),
      }
    },
  }],
  toDOM(node: any) {
    let attributesToDom: any = {
      class:'reference-container',
      ...genericAttributtesToDom(node),
    }
    return ["ul", attributesToDom, 0];
  }
}

export const reference_block_container = {
  content: "block*",
  group: "block",
  attrs: {
    ...getGenericAttributes(),
  },
  parseDOM: [{
    tag: "li.reference-block-container", getAttrs(dom: any) {
      return {
        ...parseGenericAttributes(dom),
      }
    },
  }],
  toDOM(node: any) {
    let attributesToDom: any = {
      class:'reference-block-container',
      ...genericAttributtesToDom(node),
    }
    return ["li", attributesToDom, 0];
  }
}

export const reference_citation_end = {
  content: "inline*",
  group: "block",
  attrs: {
    ...getGenericAttributes(),
    refInstance:{default:'local'},
    refCitationID:{default:''},
    referenceData:{default:''},
    referenceStyle:{default:''},
    referenceType:{default:''},
  },
  parseDOM: [{
    tag: "reference-citation-end", getAttrs(dom: any) {
      let refData = dom.getAttribute('referencedata').split('|!|');
      let refStyle = dom.getAttribute('referencestyle').split('|!|');
      let refType = dom.getAttribute('referencetype').split('|!|');

      let referenceData = {refId:refData[0],last_modified:refData[1]}
      let referenceStyle = {name:refStyle[0],last_modified:refStyle[1]}
      let referenceType = {name:refType[0],last_modified:refType[1]}
      return {
        ...parseGenericAttributes(dom),
        refCitationID : dom.getAttribute('refCitationID'),
        referenceData,
        referenceStyle,
        referenceType,
      }
    },
  }],
  toDOM(node: any) {
    let referenceData = node.attrs.referenceData.refId+'|!|'+node.attrs.referenceData.last_modified
    let referenceStyle = node.attrs.referenceStyle.name+'|!|'+node.attrs.referenceStyle.last_modified
    let referenceType = node.attrs.referenceType.name+'|!|'+node.attrs.referenceType.last_modified
    let attributesToDom: any = {
      ...genericAttributtesToDom(node),
      refCitationID:node.attrs.refCitationID,
      referenceData,
      referenceStyle,
      referenceType
    }
    return ["reference-citation-end", attributesToDom, 0];
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


/* export const placeholder = {
  content:"inline*",
  group: "block",
  atom:true,
  attrs: {
      ...getGenericAttributes()
  },
  parseDOM: [{
      tag: "pm-placeholder", getAttrs(dom: any) {
          return {
              ...parseGenericAttributes(dom),
          }
      },
  }],
  toDOM(node: any) {
      let attributesToDom: any = {
          ...genericAttributtesToDom(node),

      }
      return ["pm-placeholder", attributesToDom,0];
  }
} */

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
  text: {
    inline: true,
    group: "inline"
  },
  ...basicNodes,
  ...MathNodes,
  ...listNodes,
}


