import { Node } from "prosemirror-model";
export const taxon = {
  attrs: {
    class: { default: 'taxon' },
    taxmarkid: { default: '' },
    taxonid: { deafult: '' },
    removedtaxon: { deafult: 'false' }
  },
  inclusive: false,
  parseDOM: [{
    tag: 'span.taxon',
    getAttrs(dom: any) {
      return {
        class: dom.getAttribute('class'),
        taxmarkid: dom.getAttribute('taxmarkid'),
        taxonid: dom.getAttribute('taxonid'),
        removedtaxon: dom.getAttribute('removedtaxon'),
      }
    },
  }],
  toDOM(node: Node) {
    return [
      'span',
      {
        class: node.attrs.class,
        'taxmarkid': node.attrs.taxmarkid,
        'taxonid': node.attrs.taxonid,
        'removedtaxon': node.attrs.removedtaxon
      },
    ];
  },
};
