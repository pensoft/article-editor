import { NodeType } from "prosemirror-model"
import { EditorState } from "prosemirror-state"

export const videoPlayerIcon = {
  width: 80, height: 53,
  path: "M57,6H1C0.448,6,0,6.447,0,7v44c0,0.553,0.448,1,1,1h56c0.552,0,1-0.447,1-1V7C58,6.447,57.552,6,57,6z M10,50H2v-9h8V50z   M10,39H2v-9h8V39z M10,28H2v-9h8V28z M10,17H2V8h8V17z M36.537,29.844l-11,7C25.374,36.947,25.187,37,25,37  c-0.166,0-0.331-0.041-0.481-0.123C24.199,36.701,24,36.365,24,36V22c0-0.365,0.199-0.701,0.519-0.877  c0.32-0.175,0.71-0.162,1.019,0.033l11,7C36.825,28.34,37,28.658,37,29S36.825,29.66,36.537,29.844z M56,50h-8v-9h8V50z M56,39h-8  v-9h8V39z M56,28h-8v-9h8V28z M56,17h-8V8h8V17z"
}

export function canInsert(state: EditorState, nodeType: NodeType) {
  let $from = state.selection.$from
  for (let d = $from.depth; d >= 0; d--) {
    let index = $from.index(d)
    if ($from.node(d).canReplaceWith(index, index, nodeType)) return true
  }
  return false
}

export function createCustomIcon(name: string, width?: number, height?: number) {
  width = width || 15;
  height = height || 15;
  let icon = document.createElement('img');
  icon.setAttribute('src', `./assets/icons/${name}`);
  icon.setAttribute('width', width.toString());
  return {
    width: width, height: height,
    dom: icon
  }
}
