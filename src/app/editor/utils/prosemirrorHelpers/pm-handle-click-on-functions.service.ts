import { Injectable } from '@angular/core';
import { uuidv4 } from 'lib0/random';
import { Slice, Node } from 'prosemirror-model';
import { PluginKey } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

@Injectable({
  providedIn: 'root'
})
export class PmHandleClickOnFunctionsService {

  constructor() { }

  handleClick = (hideshowPluginKEey: PluginKey, citatContextPluginkey?: PluginKey) => {
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

  handleTripleClickOn = (view: EditorView, pos: number, node: Node, nodepos: number, event: Event, direct: boolean) => {
    if (view.state.selection.$from.parent.type.name !== "form_field") {
      return true;
    }
    return false
  }

  handleDoubleClick = (hideshowPluginKEey: PluginKey) => {
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

  handleClickOn = (citatContextPluginKey: PluginKey) => {
    return (view: EditorView, pos: number, node: Node, nodePos: number, e: MouseEvent, direct: boolean) => {
      if (node.marks.filter((mark) => { return mark.type.name == 'citation' }) &&
        (("which" in e && e.which == 3) ||
          ("button" in e && e.button == 2)
        )) {
        let cursurCoord = view.coordsAtPos(pos);
        view.dispatch(view.state.tr.setMeta('citatContextPlugin', {
          clickPos: pos,
          citatPos: nodePos,
          clickEvent: e,
          focus: view.hasFocus(),
          direct,
          coords: cursurCoord
        }))
        return false
      } else if (citatContextPluginKey.getState(view.state).decorations !== undefined) {
        return false
      } else {
        return true
      }
    }
  }
}
