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
    paragraph: {
        content: "inline*",
        group: "block",
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
    inline_text: {
        content: "text*",
        group: "inline",
        inline:true,
        attrs: {
            //style:{default:''},
            ...getGenericAttributes()
        },
        parseDOM: [{
            tag: "inline-text", getAttrs(dom: any) {
                return {
                    //style:dom.getAttribute('style'),
                    ...parseGenericAttributes(dom)
                }
            },
        }],
        toDOM(node: any) {
            let attributesToDom:any = {
                ...genericAttributtesToDom(node)
            }
            //attributesToDom['style'] = node.attrs.style
            return ["inline-text", attributesToDom, 0];
        }
    },
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
    text: {
        group: "inline"
    },
    ...MathNodes,
    ...listNodes,
    ...tableNodes({
        tableGroup: "block",
        cellContent: "block+",
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
    ...basicNodes,
    htmlNode:{
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
    }
}

