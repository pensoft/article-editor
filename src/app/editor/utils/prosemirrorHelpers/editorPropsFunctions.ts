import { CompileShallowModuleMetadata } from "@angular/compiler";
import { Fragment, ResolvedPos, Slice ,Node} from "prosemirror-model";
import { PluginKey, PluginSpec, TextSelection,Selection } from "prosemirror-state";
import { CellSelection } from "prosemirror-tables";
import { EditorView } from "prosemirror-view";

export function handlePaste(view: EditorView, event: Event, slice: Slice) {
    let sel = view.state.selection
    let noneditableNodes = false;
    view.state.doc.nodesBetween(sel.from, sel.to, (node, pos, parent) => {
        if (node.attrs.contenteditableNode == "false") {
            noneditableNodes = true;
        }
    })
    if (noneditableNodes) {
        return true
    }
    return false
}

export function handleClick(hideshowPluginKEey:PluginKey) {
    return (view: EditorView, pos: number, event: Event)=>{

        if (((event.target as HTMLElement).className == 'changes-placeholder')) {
            setTimeout(() => {
                view.dispatch(view.state.tr)
            }, 0)
            return true
        }
        let tr1 = view.state.tr.setMeta(hideshowPluginKEey, {})
        view.dispatch(tr1)
        return false
    }
}
export function handleTripleClickOn(view:EditorView, pos:number, node:Node, nodepos:number, event:Event, direct:boolean) {
    if (view.state.selection.$from.parent.type.name !== "form_field") {
        return true;
    }
    return false
}
export const handleDoubleClick = (hideshowPluginKEey:PluginKey)=>{
    return (view: EditorView, pos: number, event: Event)=> {
        let node = view.state.doc.nodeAt(pos)
        let marks = node?.marks
        let hasTrackChnagesMark = node?.marks.some((mark) => {
            return mark!.type.name == 'insertion' 
            || mark!.type.name == 'deletion'  
            || mark!.type.name == 'insFromPopup' 
            || mark!.type.name == 'delFromPopup' 
        })
        if (hasTrackChnagesMark) {
            let cursurCoord = view.coordsAtPos(pos);
            let tr1 = view.state.tr.setMeta(hideshowPluginKEey, { marks, focus: view.hasFocus(), coords: cursurCoord })
            view.dispatch(tr1)
            return true
        }
        return false
    }
}
export function handleKeyDown(view: EditorView, event: KeyboardEvent) {
    let sel = view.state.selection
    let { $anchor,$head,from, to, empty } = sel
    let key = event.key
    let noneditableNodes = false;
    /* if (sel instanceof CellSelection) {
        from = Math.min(sel.$headCell.pos, sel.$anchorCell.pos);
        to = Math.max(sel.$headCell.pos, sel.$anchorCell.pos);
    } */
    view.state.doc.nodesBetween(from, to, (node, pos, parent) => {
        if (node.attrs.contenteditableNode == "false") {
            noneditableNodes = true;
        }

        if (node.type.name == "form_field") {
            let nodeEnd = node.nodeSize + pos
            // there is a form_field that is in the selection we should not edit if or outside of it 
            if ((from <= pos && pos <= to) || (from <= nodeEnd && nodeEnd <= to)) {
                if ((from <= pos && pos <= to)) {
                    from = pos + 2
                }
                if ((from <= nodeEnd && nodeEnd <= to)) {
                    to = nodeEnd - 2
                }
                view.dispatch(view.state.tr.setSelection(new TextSelection(view.state.doc.resolve(from), view.state.doc.resolve(to))))
            }
        }
    })
    /* if (key == 'Delete' || key == 'Backspace') {
      if (!sel.empty) {
        return noneditableNodes
      } else {
        if (noneditableNodes) {
          return noneditableNodes
        } else {
          if (key == 'Delete') {
            if (sel.$anchor.nodeAfter == null && sel.$anchor.parent.type.name == 'paragraph') {
              //@ts-ignore
              let s = sel.$anchor.parent.parent.content.lastChild === sel.$anchor.parent
              if (s) {
                return true
              }
            }
          } else if (key == 'Backspace') {
            if (sel.$anchor.nodeBefore == null && sel.$anchor.parent.type.name == 'paragraph') {
              //@ts-ignore
              let s = sel.$anchor.parent.parent.content.firstChild === sel.$anchor.parent
              if (s) {
                return true
              }
            }
          }
        }

      } 
      if (noneditableNodes) {
        return noneditableNodes
      }
    }*/
    if (noneditableNodes) {
        if (key == 'ArrowRight' ||
            key == 'ArrowLeft' ||
            key == 'ArrowDown' ||
            key == 'ArrowUp') {
            return false
        } else {
            return true
        }
    }
    return false
}
export const createSelectionBetween = (editorsEditableObj:any,editorId:string)=>{
    return (view:EditorView, anchor:ResolvedPos, head:ResolvedPos)=> {
        //return undefined
        //@ts-ignore
        if (anchor.pos == head.pos) {
            return new TextSelection(anchor, head);
        }
        let headRangeMin = anchor.pos
        let headRangeMax = anchor.pos
        let sel = view.state.selection
    
        //@ts-ignore
        let anchorPath = sel.$anchor.path
        let counter = anchorPath.length - 1
        let parentNode: Node | undefined = undefined;
        let parentNodePos: number | undefined = undefined;
        let formFieldParentFound = false
        while (counter > -1 && !formFieldParentFound) {
            let pathValue = anchorPath[counter]
            if (typeof pathValue !== 'number') {   // node       
                let parentType = pathValue.type.name
                if (parentType == "form_field") {
                    parentNode = pathValue   // store the form_field node that the selection is currently in
                    parentNodePos = anchorPath[counter - 1];
                    formFieldParentFound = true
                } else if (parentType !== "doc") {
                    parentNode = pathValue   // store last node in the path that is diffetant than the doc node
                    parentNodePos = anchorPath[counter - 1];
                }
            }
            counter--;
        }
    
        if (parentNode) {
            headRangeMin = parentNodePos! + 1 // the parents inner start position
            headRangeMax = parentNodePos! + parentNode?.nodeSize! - 1 // the parent inner end position
        }
    
        //this.editorsEditableObj[editorID] = true
    
        if (headRangeMin > head.pos || headRangeMax < head.pos) {
            let headPosition = headRangeMin > head.pos ? headRangeMin : headRangeMax
            let newHeadResolvedPosition = view.state.doc.resolve(headPosition)
            let from = Math.min(view.state.selection.$anchor.pos, newHeadResolvedPosition.pos)
            let to = Math.max(view.state.selection.$anchor.pos, newHeadResolvedPosition.pos)
            view.state.doc.nodesBetween(from, to, (node, pos, parent) => {
                if (node.attrs.contenteditableNode == 'false') {
                    editorsEditableObj[editorId] = false;
    
                }
            })
            let newSelection = new TextSelection(anchor, newHeadResolvedPosition);
            return newSelection
        }
        let from = Math.min(anchor.pos, head.pos)
        let to = Math.max(anchor.pos, head.pos)
        view.state.doc.nodesBetween(from, to, (node, pos, parent) => {
            if (node.attrs.contenteditableNode == 'false') {
                editorsEditableObj[editorId] = false;
            }
        })
        return undefined
    }

}
