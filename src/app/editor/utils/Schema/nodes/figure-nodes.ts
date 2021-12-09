import { NodeSpec } from 'prosemirror-model';
import { MathNodes } from './math';
import { tableNodes } from './table';
import { listNodes } from './lists';
import { parseGenericAttributes, getGenericAttributes, genericAttributtesToDom, htmlTags } from '../helpers';
import { nodes as basicNodes } from './basic-nodes';
import { Node } from 'prosemirror-model';

export const image = {
    inline: true,
    attrs: {
        src: { default: 'https://www.kenyons.com/wp-content/uploads/2017/04/default-image-620x600.jpg' },
        alt: { default: '' },
        title: { default: 'default image' },

        ...getGenericAttributes(),
    },
    group: "inline",
    draggable: true,
    parseDOM: [{
        tag: "img[src]", getAttrs: function getAttrs(dom: any) {
            return {
                src: dom.getAttribute("src"),
                title: dom.getAttribute("title"),
                alt: dom.getAttribute("alt"),
                ...parseGenericAttributes(dom),
            }
        }
    }],
    toDOM: function toDOM(node: Node) {
        var ref = node.attrs;
        var src = ref.src;
        var alt = ref.alt;

        var title = ref.title; return ["img", { src: src, alt: alt, title: title, ...genericAttributtesToDom(node) }]
    }
}
export const video = {
    inline: true,
    attrs: {
        src: { default: 'https://www.youtube.com/embed/l_MtK_kPtNU' },
        ...getGenericAttributes()
    },
    group: "inline",
    draggable: true,
    parseDOM: [{
        tag: "iframe", getAttrs(dom: any) {
            return {
                src: dom.getAttribute('src'), ...parseGenericAttributes(dom),
            }
        }
    }],
    toDOM(node: any) {
        let { src } = node.attrs;
        return ["iframe", {
            ...genericAttributtesToDom(node),
            controls: '', src
        }]
    }
}

export const figures_nodes_container = {
    content: "block*",
    group: 'block',
    inline: false,
    isolating: true,

    attrs: {
        containerid: { default: '' },
        ...getGenericAttributes(),
    },
    parseDOM: [{
        tag: "figures-nodes-container", getAttrs(dom: HTMLElement) {
            return {
                containerid: dom.getAttribute('containerid'),
                ...parseGenericAttributes(dom)
            }
        }
    }],
    toDOM(node: any) {
        return ["figures-nodes-container", {
            'containerid': node.attrs.containerid,
            ...genericAttributtesToDom(node)
        }, 0]
    }
}

export const block_figure = {
    content: "block+",
    group: 'block',
    inline: false,
    isolating: true,
    attrs: {
        figure_number: {},
        figure_id: {},
        viewed_by_citat: {default:""},
        ...getGenericAttributes(),
    },
    parseDOM: [{
        tag: "block-figure", getAttrs(dom: HTMLElement) {
            return {
                figure_number: dom.getAttribute('figure_number'),
                figure_id: dom.getAttribute('figure_id'),
                viewed_by_citat: dom.getAttribute('viewed_by_citat'),
                ...parseGenericAttributes(dom)
            }
        }
    }],
    toDOM(node: any) {
        return ["block-figure", {
            'figure_number': node.attrs.figure_number,
            'figure_id': node.attrs.figure_id,
            'viewed_by_citat': node.attrs.viewed_by_citat,
            ...genericAttributtesToDom(node)
        }, 0]
    }
}
export const citation = {
    group: 'inline',
    content: "inline+",
    inline: true,
    attrs: {
        citated_figures: { default: [] },

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
                last_time_updated: dom.getAttribute('last_time_updated'),
                figures_display_view: dom.getAttribute('figures_display_view')!.split(','),
                ...parseGenericAttributes(dom)
            }
            attrs.contenteditableNode = 'false';
            return attrs
        }
    }],
    toDOM(node: Node) {
        node.attrs.contenteditableNode = 'false';
        return ["citation", {
            "citated_figures": node.attrs.citated_figures.join(','),
            "citateid": node.attrs.citateid,
            "last_time_updated": node.attrs.last_time_updated,
            "figures_display_view": node.attrs.figures_display_view.join(','),
            ...genericAttributtesToDom(node)
        }, 0]
    }
}

export const figure_components_container = {
    group: 'block',
    content: "block+",
    inline: false,
    attrs: {
        ...getGenericAttributes(),
    },
    parseDOM: [{
        tag: "figure-components-container", getAttrs(dom: any) {
            return {
                ...parseGenericAttributes(dom)
            }
        }
    }],
    toDOM(node: Node) {
        return ["figure-components-container", {
            ...genericAttributtesToDom(node)
        }, 0]
    }
}

export const figure_component = {
    group: 'block',
    content: "inline+",
    inline: false,
    attrs: {
        component_number: {},
        viewed_by_citat: {default:""},
        ...getGenericAttributes(),
    },
    parseDOM: [{
        tag: "figure-component", getAttrs(dom: any) {
            return {
                component_number: dom.getAttribute('component_number'),
                viewed_by_citat: dom.getAttribute('viewed_by_citat'),
                ...parseGenericAttributes(dom)
            }
        }
    }],
    toDOM(node: Node) {
        return ["figure-component", {
            'viewed_by_citat': node.attrs.viewed_by_citat,
            'component_number': node.attrs.component_number,
            ...genericAttributtesToDom(node)
        }, 0]
    }
}

export const figure_descriptions_container = {
    group: 'block',
    content: "block+",
    isolating: true,
    inline: false,
    attrs: {
        ...getGenericAttributes(),
    },
    parseDOM: [{
        tag: "figure-descriptions-container", getAttrs(dom: any) {
            return {
                ...parseGenericAttributes(dom)
            }
        }
    }],
    toDOM(node: Node) {
        return ["figure-descriptions-container", {
            ...genericAttributtesToDom(node)
        }, 0]
    }
}

export const figure_description = {
    content: "block+",
    group: "block",
    isolating: true,
    inline: false,
    attrs: {
        ...getGenericAttributes()
    },
    parseDOM: [{
        tag: "figure-description", getAttrs(dom: any) {
            return {
                ...parseGenericAttributes(dom),
            }
        },
    }],
    toDOM(node: any) {
        let attributesToDom: any = {
            ...genericAttributtesToDom(node),
            style: 'display:block;'

        }
        return ["figure-description", attributesToDom, 0];
    }
}

export const figure_component_description = {
    content: "block+",
    isolating: true,
    group: "block",
    inline: false,
    attrs: {
        component_number: {},
        viewed_by_citat:{default:""},
        ...getGenericAttributes()
    },
    parseDOM: [{
        tag: "figure-component-description", getAttrs(dom: any) {
            return {
                component_number: dom.getAttribute('component_number'),
                viewed_by_citat: dom.getAttribute('viewed_by_citat'),
                ...parseGenericAttributes(dom),
            }
        },
    }],
    toDOM(node: any) {
        let attributesToDom: any = {
            'viewed_by_citat': node.attrs.viewed_by_citat,
            'component_number': node.attrs.component_number,
            ...genericAttributtesToDom(node),
            style: 'display:flex;'

        }
        return ["figure-component-description", attributesToDom, 0];
    }
}



/* export const figure = {
    content: "block_figure+",
    group: 'block',
    attrs: {
        ...getGenericAttributes(),
    },
    parseDOM: [{
        tag: "figure-component", getAttrs(dom: any) {
            return {
                ...parseGenericAttributes(dom)
            }
        }
    }],
    toDOM(node: any) {
        return ["figure-component", {
            ...genericAttributtesToDom(node)
        }, 0]
    }
} */
export const figureNodes = {
    image,
    video,
    //figure,
    citation,
    block_figure,
    figure_components_container,
    figure_component,
    figures_nodes_container,
    figure_descriptions_container,
    figure_component_description,
    figure_description,
}

/* export const figure_description = {
    group: 'block+',
    content: "inline+",
    attrs:{
        ...getGenericAttributes(),
    },
    parseDOM: [{ tag: "figure-description" ,getAttrs(dom:any){
        return{
            ...parseGenericAttributes(dom)
        }
    }}],
    toDOM(node:Node) {
        return ["figure-description", {
            ...genericAttributtesToDom(node)
        },0]
    }
} */
