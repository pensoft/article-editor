/* eslint-disable no-param-reassign */
/* eslint-disable radix */
import { Node } from "prosemirror-model";
import { getGenericAttributes,parseGenericAttributes,genericAttributtesToDom } from "../../helpers";
const citation = {
    group: 'inline',
    inline: true,
    inclusive: false,
    attrs: {
        citated_figures: { default: [] },
        nonexistingFigure:{ default:'false' },
        citateid: { default: '' },
        last_time_updated: { default: '' },
        figures_display_view: { default: [] },
        ...getGenericAttributes(),
    },
    parseDOM: [{
        tag: "citation", getAttrs(dom: HTMLElement) {
            let attrs = {
                citated_figures: dom.getAttribute('citated_figures')!.split(','),
                citateid: dom.getAttribute('citateid'),
                nonexistingFigure: dom.getAttribute('nonexistingfigure'),
                last_time_updated: dom.getAttribute('last_time_updated'),
                figures_display_view: dom.getAttribute('figures_display_view')!.split(','),
                ...parseGenericAttributes(dom)
            }
            attrs.contenteditableNode = 'false';
            return attrs
        }
    }],
    toDOM(node: any) {
        node.attrs.contenteditableNode = 'false';
        return ["citation", {
            "citated_figures": node.attrs.citated_figures.join(','),
            "citateid": node.attrs.citateid,
            "nonexistingfigure": node.attrs.nonexistingFigure,
            "last_time_updated": node.attrs.last_time_updated,
            "figures_display_view": node.attrs.figures_display_view.join(','),
            ...genericAttributtesToDom(node)
        }]
    }
};



export default citation;
