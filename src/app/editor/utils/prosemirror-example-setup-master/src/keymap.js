import {wrapIn, setBlockType, chainCommands, toggleMark, exitCode,
        joinUp, joinDown, lift, selectParentNode,selectNodeBackward,selectNodeForward} from "prosemirror-commands"
import {wrapInList, splitListItem, liftListItem, sinkListItem} from "prosemirror-schema-list"
import {undo, redo} from "prosemirror-history"
import {undoInputRule} from "prosemirror-inputrules"
import { EditorState, NodeSelection, TextSelection } from "prosemirror-state"
import { Selection } from "prosemirror-state"
import { ResolvedPos } from "prosemirror-model"
import { selectParentNodeItem } from "prosemirror-menu"

const mac = typeof navigator != "undefined" ? /Mac/.test(navigator.platform) : false

// :: (Schema, ?Object) → Object
// Inspect the given schema looking for marks and nodes from the
// basic schema, and if found, add key bindings related to them.
// This will add:
//
// * **Mod-b** for toggling [strong](#schema-basic.StrongMark)
// * **Mod-i** for toggling [emphasis](#schema-basic.EmMark)
// * **Mod-`** for toggling [code font](#schema-basic.CodeMark)
// * **Ctrl-Shift-0** for making the current textblock a paragraph
// * **Ctrl-Shift-1** to **Ctrl-Shift-Digit6** for making the current
//   textblock a heading of the corresponding level
// * **Ctrl-Shift-Backslash** to make the current textblock a code block
// * **Ctrl-Shift-8** to wrap the selection in an ordered list
// * **Ctrl-Shift-9** to wrap the selection in a bullet list
// * **Ctrl->** to wrap the selection in a block quote
// * **Enter** to split a non-empty textblock in a list item while at
//   the same time splitting the list item
// * **Mod-Enter** to insert a hard break
// * **Mod-_** to insert a horizontal rule
// * **Backspace** to undo an input rule
// * **Alt-ArrowUp** to `joinUp`
// * **Alt-ArrowDown** to `joinDown`
// * **Mod-BracketLeft** to `lift`
// * **Escape** to `selectParentNode`
//
// You can suppress or map these bindings by passing a `mapKeys`
// argument, which maps key names (say `"Mod-B"` to either `false`, to
// remove the binding, or a new key name string.
export function buildKeymap(schema, mapKeys) {
  let keys = {}, type
  function bind(key, cmd) {
    if (mapKeys) {
      let mapped = mapKeys[key]
      if (mapped === false) return
      if (mapped) key = mapped
    }
    keys[key] = cmd
  }

  function setSelection(sel,state){
    let newResolvedStart = sel.$from
    let newResolvedEnd = sel.$to
    if(sel.$anchor.nodeBefore!==null&&sel.$anchor.nodeAfter==null){
      let nodeBeforeSize = sel.$anchor.nodeBefore.nodeSize
      newResolvedStart = state.doc.resolve(sel.$anchor.pos - nodeBeforeSize)
    }else if(sel.$anchor.nodeBefore==null&&sel.$anchor.nodeAfter!==null){
      let nodeBeforeSize = sel.$anchor.nodeAfter.nodeSize
      newResolvedEnd = state.doc.resolve(sel.$anchor.pos + nodeBeforeSize)
    }else if(sel.$head.nodeBefore==null&&sel.$head.nodeAfter!==null){
      let nodeBeforeSize = sel.$head.nodeAfter.nodeSize
      newResolvedEnd = state.doc.resolve(sel.$head.pos + nodeBeforeSize)
    }else if(sel.$head.nodeBefore!==null&&sel.$head.nodeAfter==null){
      let nodeBeforeSize = sel.$head.nodeBefore.nodeSize
      newResolvedStart = state.doc.resolve(sel.$head.pos - nodeBeforeSize)
    }else{
      let nodeBeforeSize = sel.$anchor.nodeAfter.nodeSize
      newResolvedEnd = state.doc.resolve(sel.$anchor.pos + nodeBeforeSize)
      let nodeAfterSize = sel.$anchor.nodeBefore.nodeSize
      newResolvedStart = state.doc.resolve(sel.$anchor.pos - nodeAfterSize)
    }
    let newTr = state.tr.setSelection(new TextSelection(newResolvedStart,newResolvedEnd))
    return newTr
  }
  
  function selectNode(state,dispatch,view){
    let sel = state.selection
    //console.log('$anchor',sel.$anchor.nodeAfter,sel.$anchor.nodeBefore);
    //console.log('$head',sel.$head.nodeAfter,sel.$head.nodeBefore);
    
    let newTr = setSelection(sel,state);
    dispatch(newTr)
    return true;
  }
  function selectTextNode(direction){
    if(direction == 'left'){
      return (state,dispatch,view)=>{
        let sel = state.selection
        if(!sel.$head.nodeBefore){
          return true
        }else if(sel.$head.nodeBefore.type.name == 'text'){
          return selectNodeBackward(state,dispatch,view)
        }
        return true
      }
    }else if(direction == 'right'){
      return (state,dispatch,view)=>{
        if(!sel.$head.nodeAfter){
          return true
        }else if(sel.$head.nodeAfter.type.name == 'text'){
          return selectNodeForward(state,dispatch,view)
        }
        return true
      }
    }
  }
  bind("Mod-z", undo)
  bind("Ctrl-a",selectNode)
  bind("Shift-Mod-z", redo)
  bind("Backspace", undoInputRule)
  if (!mac) bind("Mod-y", redo)

  bind("Alt-ArrowUp", joinUp)
  bind("Alt-ArrowDown", joinDown)
  bind("Mod-BracketLeft", lift)
  bind("Escape", selectParentNode)
  bind("Ctrl-Shift-ArrowLeft", selectTextNode('left'))
  bind("Ctrl-Shift-ArrowRight", selectTextNode('right'))

  if (type = schema.marks.strong) {
    bind("Mod-b", toggleMark(type))
    bind("Mod-B", toggleMark(type))
  }
  if (type = schema.marks.em) {
    bind("Mod-i", toggleMark(type))
    bind("Mod-I", toggleMark(type))
  }
  if (type = schema.marks.code)
    bind("Mod-`", toggleMark(type))

  if (type = schema.nodes.bullet_list)
    bind("Shift-Ctrl-8", wrapInList(type))
  if (type = schema.nodes.ordered_list)
    bind("Shift-Ctrl-9", wrapInList(type))
  if (type = schema.nodes.blockquote)
    bind("Ctrl->", wrapIn(type))
  if (type = schema.nodes.hard_break) {
    let br = type, cmd = chainCommands(exitCode, (state, dispatch) => {
      dispatch(state.tr.replaceSelectionWith(br.create()).scrollIntoView())
      return true
    })
    bind("Mod-Enter", cmd)
    bind("Shift-Enter", cmd)
    if (mac) bind("Ctrl-Enter", cmd)
  }
  if (type = schema.nodes.list_item) {
    bind("Enter", splitListItem(type))
    bind("Mod-[", liftListItem(type))
    bind("Mod-]", sinkListItem(type))
  }
  if (type = schema.nodes.paragraph)
    bind("Shift-Ctrl-0", setBlockType(type))
  if (type = schema.nodes.code_block)
    bind("Shift-Ctrl-\\", setBlockType(type))
  if (type = schema.nodes.heading)
    for (let i = 1; i <= 6; i++) bind("Shift-Ctrl-" + i, setBlockType(type, {level: i}))
  if (type = schema.nodes.horizontal_rule) {
    let hr = type
    bind("Mod-_", (state, dispatch) => {
      dispatch(state.tr.replaceSelectionWith(hr.create()).scrollIntoView())
      return true
    })
  }

  return keys
}
