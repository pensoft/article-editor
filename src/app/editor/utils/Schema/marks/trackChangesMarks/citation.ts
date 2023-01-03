/* eslint-disable no-param-reassign */
/* eslint-disable radix */
import { getGenericAttributes,parseGenericAttributes,genericAttributtesToDom } from "../../helpers";
const citation = {
    group: 'inline',
    inline: true,
    inclusive: false,
    attrs: {
      citated_elements: { default: [] },
      nonexistingelement:{ default:'false' },
      citateid: { default: '' },
      last_time_updated: { default: '' },
      elements_display_view: { default: [''] },
        ...getGenericAttributes(),
    },
    parseDOM: [{
        tag: "citation", getAttrs(dom: HTMLElement) {
            let attrs = {
              citated_elements: dom.getAttribute('citated_elements')!.split(','),
                citateid: dom.getAttribute('citateid'),
                nonexistingelement: dom.getAttribute('nonexistingelement'),
                last_time_updated: dom.getAttribute('last_time_updated'),
                elements_display_view: dom.getAttribute('elements_display_view')!.split(','),
                ...parseGenericAttributes(dom)
            }
            attrs.contenteditableNode = 'false';
            return attrs
        }
    }],
    toDOM(node: any) {
        node.attrs.contenteditableNode = 'false';
        return ["citation", {
            "citated_elements": node.attrs.citated_elements.join(','),
            "citateid": node.attrs.citateid,
            "nonexistingelement": node.attrs.nonexistingelement,
            "last_time_updated": node.attrs.last_time_updated,
            "elements_display_view": node.attrs.elements_display_view.join(','),
            ...genericAttributtesToDom(node)
        }]
    }
};



export default citation;
