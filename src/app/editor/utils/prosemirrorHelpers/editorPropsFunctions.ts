import { CompileShallowModuleMetadata } from "@angular/compiler";
import { mathBackspaceCmd } from "@benrbray/prosemirror-math";
import { debug } from "console";
import { uuidv4 } from "lib0/random";
import { Fragment, ResolvedPos, Slice, Node } from "prosemirror-model";
import { PluginKey, PluginSpec, TextSelection, Selection } from "prosemirror-state";
import { CellSelection } from "prosemirror-tables";
import { EditorView } from "prosemirror-view";

export function handlePaste(view: EditorView, event: Event, slice: Slice) {
    slice.content.nodesBetween(0, slice.size - 2, (node, pos, parent) => {
        if (node.marks.filter((mark) => { return mark.type.name == 'citation' }).length > 0) {
            let mark = node.marks.filter((mark) => { return mark.type.name == 'citation' })[0]
            mark.attrs.citateid = uuidv4()
        }
    })
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

export function selectWholeCitatMarks(view:EditorView, anchor:ResolvedPos, head:ResolvedPos) {

    let newSelection = false

    let newAnchor = anchor
    let newHead = head

    if (anchor.nodeAfter && anchor.nodeAfter.marks.filter(mark => { return mark.type.name == 'citation' }).length > 0 && anchor.pos > head.pos) {
        newAnchor = view.state.doc.resolve(anchor.nodeAfter?.nodeSize! + anchor.pos)
        newSelection = true
    }
    if (anchor.nodeBefore && anchor.nodeBefore.marks.filter(mark => { return mark.type.name == 'citation' }).length > 0 && anchor.pos < head.pos) {
        newAnchor = view.state.doc.resolve(anchor.pos - anchor.nodeBefore?.nodeSize!)
        newSelection = true
    }
    if (head.nodeAfter && head.nodeAfter.marks.filter(mark => { return mark.type.name == 'citation' }).length > 0 && anchor.pos < head.pos) {
        newHead = view.state.doc.resolve(head.pos + head.nodeAfter?.nodeSize!)
        newSelection = true
    }
    if (head.nodeBefore && head.nodeBefore.marks.filter(mark => { return mark.type.name == 'citation' }).length > 0 && anchor.pos > head.pos) {
        newHead = view.state.doc.resolve(head.pos - head.nodeBefore?.nodeSize!)
        newSelection = true
    }

    if(newSelection){
        return new TextSelection(newAnchor, newHead)
    }
}

export function handleClick(hideshowPluginKEey: PluginKey, citatContextPluginkey?: PluginKey) {
    return (view: EditorView, pos: number, event: Event) => {

        if (((event.target as HTMLElement).className == 'changes-placeholder')) {
            setTimeout(() => {
                view.dispatch(view.state.tr)
            }, 0)
            return true
        } else if (((event.target as HTMLElement).className == 'citat-menu-context') || (event.target as HTMLElement).tagName == 'CITATION') {
            return true
        } else if ((event.target as HTMLElement).className == 'citat-menu-context-delete-citat-btn') {
            setTimeout(() => { view.dispatch(view.state.tr) }, 0)
            return true
        }
        let tr1 = view.state.tr.setMeta(hideshowPluginKEey, {})
        if (citatContextPluginkey) {
            tr1 = tr1.setMeta('citatContextPlugin', { clickOutside: true })
        }
        view.dispatch(tr1)
        return false
    }
}
export function handleTripleClickOn(view: EditorView, pos: number, node: Node, nodepos: number, event: Event, direct: boolean) {
    if (view.state.selection.$from.parent.type.name !== "form_field") {
        return true;
    }
    return false
}
export const handleDoubleClick = (hideshowPluginKEey: PluginKey) => {
    return (view: EditorView, pos: number, event: Event) => {
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
    try {

        let sel = view.state.selection
        let { $from, $to } = sel
        let key = event.key
        let canEdit = false;


        /* if (sel instanceof CellSelection) {
            from = Math.min(sel.$headCell.pos, sel.$anchorCell.pos);
            to = Math.max(sel.$headCell.pos, sel.$anchorCell.pos);
        } */
        /* check the both siddes of the selection and check if there are in the same depth -> means that the selection sides are on the same level 
          true
            loop the parents of the sides and search for form_field if there is a parent form field check if its the same for both sides and use it as parent ref
                if there is no form_field parent find the first parent thats the same for both selection sides and use it as parent ref
            check if the parent ref alows editing 
        */
        if ($from.depth == $to.depth) {
            //@ts-ignore
            let pathAtFrom: Array<Node | number> = $from.path
            //@ts-ignore
            let pathAtTo: Array<Node | number> = $to.path

            if (sel instanceof CellSelection) {
                //@ts-ignore
                pathAtFrom = sel.$anchorCell.path
                //@ts-ignore
                pathAtTo = sel.$headCell.path
            }

            let parentRef: Node | undefined
            //search parents
            for (let i = pathAtTo.length; i > -1; i--) {
                if (i % 3 == 0) {
                    let parentFrom = pathAtFrom[i] as Node
                    let parentTo = pathAtTo[i] as Node
                    if (parentFrom == parentTo) {
                        if (!parentRef) {
                            parentRef = parentFrom
                        } else if (parentFrom.type.name == 'form_field' && parentRef.type.name !== 'form_field' && parentRef?.attrs.contenteditableNode !== 'false') {
                            parentRef = parentFrom
                        }

                    }
                }
            }
            if (parentRef?.attrs.contenteditableNode !== 'false') {
                canEdit = true
            }
        }
        let NodeBeforeHasNoneditableMark = sel.$anchor.nodeBefore?.marks.filter((mark) => { return mark.attrs.contenteditableNode == 'false' }).length! > 0
        let NodeAfterHasNoneditableMark = sel.$anchor.nodeAfter?.marks.filter((mark) => { return mark.attrs.contenteditableNode == 'false' }).length! > 0

        let onNoneditableMarkBorder: undefined | 'left' | 'right' = undefined
        if (NodeBeforeHasNoneditableMark && !NodeAfterHasNoneditableMark && sel.empty) {
            onNoneditableMarkBorder = 'right'
        } else if (!NodeBeforeHasNoneditableMark && NodeAfterHasNoneditableMark && sel.empty) {
            onNoneditableMarkBorder = 'left'
        } else if (NodeBeforeHasNoneditableMark && NodeAfterHasNoneditableMark) {
            canEdit = false
        }
        if (onNoneditableMarkBorder) {
            if (onNoneditableMarkBorder == 'left') {
                if (key == 'Delete') {
                    canEdit = false
                }
            } else {
                if (key == 'Backspace') {
                    canEdit = false
                }
            }
        }
        // check both sides for noneditable marks

        let check = (node: Node) => {
            let returnValue = false
            if (node) {
                returnValue = node.marks.filter((mark) => { return mark.attrs.contenteditableNode == 'false' }).length > 0
            }
            return returnValue
        }

        let noneditableMarkAfterFrom = check($from.nodeAfter!)
        let noneditableMarkBeforeFrom = check($from.nodeBefore!)

        let noneditableMarkAfterTo = check($to.nodeAfter!)
        let noneditableMarkBeforeTo = check($to.nodeBefore!)

        if (noneditableMarkAfterFrom && noneditableMarkBeforeFrom && noneditableMarkAfterTo && noneditableMarkBeforeTo) {
            canEdit = false
        } else if (noneditableMarkAfterFrom && noneditableMarkBeforeFrom) {
            canEdit = false
        } else if (noneditableMarkAfterTo && noneditableMarkBeforeTo) {
            canEdit = false
        }

        /* view.state.doc.nodesBetween(from, to, (node, pos, parent) => {
            if (node.attrs.contenteditableNode == "false") {
                if(node.type.name == ){
    
                }
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
        }) */
        /* if (key == 'Delete' || key == 'Backspace') {
            view.state.tr = view.state.tr.setMeta('userDeletion',true)
        } */
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
        /*  if(
           !canEdit&&
           key!=='Backspace'&&
           sel.empty&&
           sel.$anchor.nodeAfter?.marks.filter((mark)=>{return mark.attrs.contenteditableNode == 'false'}).length==0&&
           sel.$anchor.nodeBefore?.marks.filter((mark)=>{return mark.attrs.contenteditableNode == 'false'}).length!>0&&
           sel.$anchor.nodeBefore!.type.name == 'text'){
           let resolvedPosition = view.state.doc.resolve(sel.from+2)
           //view.dispatch(view.state.tr.setSelection(TextSelection.create(view.state.doc,sel.from+1)))
           return false
           //view.dispatch(view.state.tr.setSelection(new Selection(resolvedPosition,resolvedPosition)))
       } */
        if (!canEdit) {
            if (key == 'ArrowRight' ||
                key == 'ArrowLeft' ||
                key == 'ArrowDown' ||
                key == 'ArrowUp') {
                return false
            } else {
                return true
            }
        }
    } catch (e) { console.error(e); }
    return false
}
export const createSelectionBetween = (editorsEditableObj: any, editorId: string) => {
    return (view: EditorView, anchor: ResolvedPos, head: ResolvedPos) => {
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
