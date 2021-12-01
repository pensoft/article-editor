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
        src: { default:'https://www.kenyons.com/wp-content/uploads/2017/04/default-image-620x600.jpg' },
        alt: { default: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAMFBMVEXp7vG6vsG3u77s8fTCxsnn7O/f5OfFyczP09bM0dO8wMPk6ezY3eDd4uXR1tnJzdBvAX/cAAACVElEQVR4nO3b23KDIBRA0ShGU0n0//+2KmO94gWZ8Zxmr7fmwWEHJsJUHw8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwO1MHHdn+L3rIoK6eshsNJ8kTaJI07fERPOO1Nc1vgQm2oiBTWJ+d8+CqV1heplLzMRNonED+4mg7L6p591FC+133/xCRNCtd3nL9BlxWP++MOaXFdEXFjZ7r8D9l45C8y6aG0cWtP/SUGhs2d8dA/ZfGgrzYX+TVqcTNRRO9l+fS5eSYzQs85psUcuzk6igcLoHPz2J8gvzWaH/JLS+95RfOD8o1p5CU5R7l5LkfKEp0mQ1UX7hsVXqDpRrifILD/3S9CfmlUQFhQfuFu0STTyJ8gsP3PH7GVxN1FC4t2sbBy4TNRTu7LyHJbqaqKFw+/Q0ncFloo7CjRPwMnCWqKXQZ75El4nKC9dmcJaou9AXOE5UXbi+RGeJygrz8Uf+GewSn9uXuplnWDZJ7d8f24F/s6iq0LYf9olbS3Q8i5oKrRu4S9ybwaQ/aCkqtP3I28QDgeoK7TBya/aXqL5COx67PTCD2grtdOwH+pQV2r0a7YVBgZoKwwIVFQYG6ikMDVRTGByopjD8ATcKb0UhhRTe77sKs2DV7FKSjId18TUEBYVyLhUThWfILHTDqmI85/2RWWjcE/bhP6OD7maT3h20MHsA47JC3PsW0wcwLhv9t0OOPOIkCn21y2bXXwlyylxiYMPk1SuCSmpfK8bNQvIrpAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADwNX4BCbAju9/X67UAAAAASUVORK5CYII=' },
        title: { default: 'default image' },
        height:{default:280},
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
        var height = ref.height;
        var title = ref.title; return ["img", { src: src, alt: alt, title: title ,height,...genericAttributtesToDom(node)}]
    }
}
export const video = {
    inline: true,
    attrs: {
        src: { default: 'https://www.youtube.com/embed/l_MtK_kPtNU' },
        height:{default:280},
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
        let { src,height } = node.attrs;
        return ["iframe", {
            ...genericAttributtesToDom(node),
            controls: '',  height, src
        }]
    }
}

export const figure_block = {
    content: "block+",
    group: 'block',
    inline: false,
    attrs: { 
        ...getGenericAttributes(),
    },
    parseDOM: [{
        tag: "figure-block", getAttrs(dom: any) {
            return { 
                ...parseGenericAttributes(dom)
            }
        }
    }],
    toDOM(node: any) {
        return ["figure-block", { 
            ...genericAttributtesToDom(node)
        }, 0]
    }
}

export const figure_components_container = {
    group: 'block',
    content: "block+",
    inline: false,
    attrs:{
        ...getGenericAttributes(),
    },
    parseDOM: [{ tag: "figure-components-container" ,getAttrs(dom:any){
        return{
            ...parseGenericAttributes(dom)
        }
    }}],
    toDOM(node:Node) {
        return ["figure-components-container", {
            ...genericAttributtesToDom(node)
        },0]
    }
}

export const figure_descriptions_container = {
    group: 'block',
    content: "block+",
    inline: false,
    attrs:{
        ...getGenericAttributes(),
    },
    parseDOM: [{ tag: "figure-descriptions-container" ,getAttrs(dom:any){
        return{
            ...parseGenericAttributes(dom)
        }
    }}],
    toDOM(node:Node) {
        return ["figure-descriptions-container", {
            ...genericAttributtesToDom(node)
        },0]
    }
}

export const figure_component = {
    group: 'block',
    content: "inline+",
    inline: false,
    attrs:{
        ...getGenericAttributes(),
    },
    parseDOM: [{ tag: "figure-component" ,getAttrs(dom:any){
        return{
            ...parseGenericAttributes(dom)
        }
    }}],
    toDOM(node:Node) {
        return ["figure-component", {
            ...genericAttributtesToDom(node)
        },0]
    }
}

/* export const figure = {
    content: "figure_block+",
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
    figure_block,
    figure_components_container,
    figure_component,
    figure_descriptions_container,
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
