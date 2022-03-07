import { Node } from 'prosemirror-model';
import { parseGenericAttributes, getGenericAttributes, genericAttributtesToDom } from '../helpers';

export const math_inline = {
    group: "inline math",
    content: "text*",
    attrs:{
        ...getGenericAttributes()
    },
    inline: true,
    marks:"",
    atom: true,
    parseDOM: [{
        tag: "math-inline", getAttrs(dom: any) {
            return {
                ...parseGenericAttributes(dom),
            }
        }
    }],
    toDOM: (node:Node) => ["math-inline", { class: "math-node",...genericAttributtesToDom(node) }, 0],
}
export const math_display = {
    group: "block math",
    content: "text*",
    atom: true,
    code: true,
    marks:"",
    attrs:{
        ...getGenericAttributes()
    },
    parseDOM: [{
        tag: "math-display" , getAttrs(dom: any) {
            return {
                ...parseGenericAttributes(dom),
            }
        }
    }],
    toDOM: (node:Node) => {
        return ["math-display", { class: "math-node",...genericAttributtesToDom(node)  }, 0]
    },
}

export const MathNodes = {
    math_inline,math_display
}
