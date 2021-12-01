//@ts-ignore
import { NodeSpec, Schema } from 'prosemirror-model';
import { MathNodes } from './nodes/math';
import { tableNodes } from './nodes/table';
import { listNodes } from './nodes/lists';
import { parseGenericAttributes, getGenericAttributes, genericAttributtesToDom, htmlTags } from './helpers';
import { nodes as basicNodes } from './nodes/basic-nodes'
import { figureNodes } from './nodes/figure-nodes';
import { marks } from './marks';
import { form_field, inline_block_container, paragraph } from './nodes';
export const endEditorNodes = {
    doc: {
        content: "block*"
    },
    
    ...figureNodes,
    ...MathNodes,
    ...listNodes,
    ...basicNodes,
    form_field,
    paragraph,
    inline_block_container,
    text: {
        inline: true,
        group: "inline"
    },
}
let nodes1 : NodeSpec = endEditorNodes
let endEditorSchema1
try{
    endEditorSchema1 = new Schema({ nodes:nodes1, marks });
}catch(e){
    console.error(e);
}

export let nodes = nodes1
export let endEditorSchema = endEditorSchema1