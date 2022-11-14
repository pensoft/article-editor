
import { DOMParser, Schema } from 'prosemirror-model';
import { nodes } from './nodes';
import { marks } from './marks';
export  *  from './endEditorSchema';
const { DOMSerializer } = require('prosemirror-model')

export { nodes, marks }
export const schema = new Schema({ nodes, marks }); // default schema
export const PMDomParser = DOMParser.fromSchema(schema);
export const PMDOMSerializer = DOMSerializer.fromSchema(schema);
