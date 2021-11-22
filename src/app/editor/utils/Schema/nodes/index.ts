//@ts-ignore
import { NodeSpec } from 'prosemirror-model';
import { MathNodes } from './math';
import { tableNodes } from './table';
import { listNodes } from './lists';
import { parseGenericAttributes, getGenericAttributes, genericAttributtesToDom,htmlTags } from '../helpers';
import { nodes as basicNodes} from './basic-nodes'
export const nodes: NodeSpec = {
    doc: {
        content: "block+"
    },
    
    form_field:{
        content: "paragraph+",
        group: "block",
        isolating: true,
        attrs: {
            ...getGenericAttributes()
        },
        parseDOM: [{
            tag: "form-field", getAttrs(dom: any) {
                return {
                    ...parseGenericAttributes(dom)
                }
            },
        }],
        toDOM(node: any) {
            let attributesToDom:any = {
                ...genericAttributtesToDom(node)
            }
            return ["form-field", attributesToDom, 0];
        }
    },
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
    paragraph: {
        content: "inline*",
        attrs: {
            align: { default: 'set-align-left' },
            ...getGenericAttributes()
        },
        parseDOM: [{
            tag: "p", getAttrs(dom: any) {
                let classArray = dom.getAttribute('class') 
                return {
                    align:classArray,
                    ...parseGenericAttributes(dom)
                }
            },
        }],
        toDOM(node: any) {
            let attributesToDom:any = {
                ...genericAttributtesToDom(node)
            }
            
                attributesToDom['class']=node.attrs.align
            
            return ["p", attributesToDom, 0];
        }
    },
    text: {
        inline:true,
        group: "inline"
    },
    ...basicNodes,
    ...MathNodes,
    ...listNodes,
    video: {
        inline: true,
        attrs: {
            src: { default: 'https://www.youtube.com/watch?v=TgbqBx4NthI&list=RDMMTgbqBx4NthI&start_radio=1&ab_channel=CHMusicChannel' },
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
                controls: '', width: 200, height: 180, src
            }]
        }
    },
    /* htmlNode:{
        group: 'inline',
        content: "inline*",
        inline: true,
        attrs: {
            ...getGenericAttributes(),
            tagName: { default: 'htmlnode' }
        },
        parseDOM: (function () {
            return htmlTags.map((tagName: string) => {
                return {
                    tag: tagName,
                    getAttrs: (dom: any) => {
                        return {
                            ...parseGenericAttributes(dom),
                            tagName: dom.tagName
                        };
                    }
                }
            });
        })(),
        toDOM(node: any) {
            return [node.attrs.tagName, {
                ...genericAttributtesToDom(node),
            }, 0];
        }
    } */
}

