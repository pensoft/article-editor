import { getGenericAttributes,parseGenericAttributes,genericAttributtesToDom } from "../../helpers";
const supplementary_file_citation = {
    group: 'inline',
    inline: true,
    inclusive: false,
    attrs: {
      citated_elements: { default: [''] },
      nonexistingelement:{ default:'false' },
      citateid: { default: '' },
      last_time_updated: { default: '' },
      ...getGenericAttributes(),
    },
    parseDOM: [{
        tag: "supplementary-file-citation", getAttrs(dom: HTMLElement) {
            let attrs = {
              citated_elements: dom.getAttribute('citated_elements')!.split(','),
                citateid: dom.getAttribute('citateid'),
                nonexistingelement: dom.getAttribute('nonexistingelement'),
                last_time_updated: dom.getAttribute('last_time_updated'),
                ...parseGenericAttributes(dom)
            }
            attrs.contenteditableNode = 'false';
            return attrs
        }
    }],
    toDOM(node: any) {
        node.attrs.contenteditableNode = 'false';
        return ["supplementary-file-citation", {
            "citated_elements": node.attrs.citated_elements.join(','),
            "citateid": node.attrs.citateid,
            "nonexistingelement": node.attrs.nonexistingelement,
            "last_time_updated": node.attrs.last_time_updated,
            ...genericAttributtesToDom(node)
        }]
    }
};



export default supplementary_file_citation;
