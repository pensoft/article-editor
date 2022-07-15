import { ServiceShare } from "@app/editor/services/service-share.service";
import { uuidv4 } from "lib0/random";
import { setMaxListeners } from "process";
import { Fragment, Slice } from "prosemirror-model";
import { EditorState, Transaction } from "prosemirror-state";
import { ReplaceStep } from "prosemirror-transform";

export let changeNodesOnDragDrop = (sharedService: ServiceShare) => {

  return (transactions: Transaction[], oldState: EditorState, newState: EditorState) => {
    let moovingANodeWithUUID = false;
    let stepsIndexes: { from: number, to: number }[] = [];
    let dragDropCitation = false
    transactions.forEach((transaction) => {
      //@ts-ignore
      let meta = transaction.meta
      if (Object.keys(meta).includes("uiEvent")) {
        if (meta["uiEvent"] == 'drop') {
          if (transaction.steps.length == 1) {
            // its drag with copy so we should change the ids
            // find the step that is with the ne content
            let step = transaction.steps[0]
            if (step instanceof ReplaceStep) {
              let s = step as any;
              let fr = (s.slice as Slice).content as Fragment
              fr.nodesBetween(0, fr.size, (node, start, parent, i) => {
                if (node.type.name == 'reference_citation') {
                  moovingANodeWithUUID = true
                  //@ts-ignore
                  stepsIndexes.push({ from: step.from, to: step.from + fr.size })
                }
                if (node.marks.filter((mark) => { return mark.type.name == 'citation' }).length > 0) {
                  moovingANodeWithUUID = true
                  dragDropCitation = true
                  //@ts-ignore
                  stepsIndexes.push({ from: step.from, to: step.from + fr.size })
                }
              })
            }
            console.log('drag with copy v1');

          } else if (transaction.steps.length == 2) {
            // its only drag so we dont have to do anything
            let step = transaction.steps[1]
            if (step instanceof ReplaceStep) {
              let s = step as any;
              let fr = (s.slice as Slice).content as Fragment
              fr.nodesBetween(0, fr.size, (node, start, parent, i) => {
                if (node.marks.filter((mark) => { return mark.type.name == 'citation' }).length > 0) {
                  dragDropCitation = true
                }
              })
            }
            console.log('drag without copy v1');
          }
        }
      }
    })

    let tr = newState.tr;
    let changed = false;
    stepsIndexes.forEach((range) => {
      let fr = range.from;
      let to = range.to;
      newState.doc.nodesBetween(fr, to, (node, pos, parent, i) => {
        if (node.type.name == 'reference_citation') {
          let oldAttrs = JSON.parse(JSON.stringify(node.attrs))
          oldAttrs.refCitationID = uuidv4();
          tr = tr.setNodeMarkup(pos, node.type, oldAttrs)
          changed = true
        }
        if (node.marks.filter((mark) => { return mark.type.name == 'citation' }).length > 0) {
          let citationMark = node.marks.filter((mark) => { return mark.type.name == 'citation' })[0]
          let newid = uuidv4()
          let newMark = newState.schema.mark('citation', { ...citationMark.attrs, citateid: newid })
          tr = tr.addMark(pos, pos + node.nodeSize, newMark)
          changed = true
        }
      })
    })
    if (dragDropCitation) {
      console.log('drag drop set meta');
      sharedService.YjsHistoryService.addUndoItemInformation({
        type: 'figure-citation',
        data: {}
      })
      setTimeout(() => {
        sharedService.FiguresControllerService.updateOnlyFiguresView()
      }, 20)
    }
    return changed ? tr : undefined
  }
}

export function handleDeleteOfRefAndFigCitation(sharedService: ServiceShare) {
  return (transactions: Transaction[], oldState: EditorState, newState: EditorState) => {
    let deletedRefCitations: any[] = []

    let deletingFigCitation = false
    transactions.forEach((transaction) => {
      //@ts-ignore
      if (transaction.steps.length > 0 && (transaction.meta && transaction.meta.uiEvent != 'paste' && transaction.meta.uiEvent != 'drop')) {
        transaction.steps.forEach((step) => {
          //@ts-ignore
          if (step instanceof ReplaceStep && step.slice.content.size == 0) {
            let invertedStep = step.invert(oldState.doc)
            //@ts-ignore
            let fr = (step.slice as Slice).content as Fragment
            fr.nodesBetween(0, fr.size, (node, start, parent, i) => {
              if (node.marks.filter((mark) => { return mark.type.name == 'citation' }).length > 0) {
                deletingFigCitation = true
              }
              if (node.type.name == 'reference_citation') {
                deletedRefCitations.push(JSON.parse(JSON.stringify(node.attrs)))
              }
            })
          }
        })
      }
    })
    if (deletingFigCitation) {
      console.log('delete set meta ');
      sharedService.YjsHistoryService.addUndoItemInformation({
        type: 'figure-citation',
        data: {}
      })
      setTimeout(() => {
        sharedService.FiguresControllerService.updateOnlyFiguresView()
      }, 20)
    }
    if (deletedRefCitations.length > 0) {
      sharedService.EditorsRefsManagerService!.handleRefCitationDelete(deletedRefCitations)
    }
    return undefined;
  }
}
