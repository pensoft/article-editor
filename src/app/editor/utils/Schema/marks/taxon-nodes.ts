import { Mark } from "prosemirror-model";
export const taxon = {
  attrs: {
    class: { default: 'taxon' },
    taxmarkid: { default: '' },
    removedtaxon: { deafult: 'false' }
  },
  inclusive: false,
  excludes: "",
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
  toDOM(node: Mark) {
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
