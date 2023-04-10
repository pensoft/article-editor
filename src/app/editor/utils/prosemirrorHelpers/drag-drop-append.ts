import { ServiceShare } from "@app/editor/services/service-share.service";
import { ServerResponse } from "http";
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
    let dragDropTableCitation = false
    let dragDropComment = false

    let rerenderingElements = false;

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
                if (node.marks.filter((mark) => { return mark.type.name == 'table_citation' }).length > 0) {
                  moovingANodeWithUUID = true
                  dragDropCitation = true
                  //@ts-ignore
                  stepsIndexes.push({ from: step.from, to: step.from + fr.size })
                }
                if (node.marks.filter((mark) => { return mark.type.name == 'comment' }).length > 0) {
                  moovingANodeWithUUID = true
                  dragDropComment = true
                  //@ts-ignore
                  stepsIndexes.push({ from: step.from, to: step.from + fr.size })
                }
              })
            }

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
                if (node.marks.filter((mark) => { return mark.type.name == 'table_citation' }).length > 0) {
                  dragDropTableCitation = true
                }
              })
            }
          }
        }
      }
      if(transaction.getMeta('citable-elements-rerender')){
        rerenderingElements = true;
      }
    })

    let tr = newState.tr;
    let changed = false;

    if(!rerenderingElements){
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
          if (node.marks.filter((mark) => { return mark.type.name == 'table_citation' }).length > 0) {
            let citationMark = node.marks.filter((mark) => { return mark.type.name == 'table_citation' })[0]
            let newid = uuidv4()
            let newMark = newState.schema.mark('table_citation', { ...citationMark.attrs, citateid: newid })
            tr = tr.addMark(pos, pos + node.nodeSize, newMark)
            changed = true
          }
          if (node.marks.filter((mark) => { return mark.type.name == 'comment' }).length > 0) {
            let commentMark = node.marks.filter((mark) => { return mark.type.name == 'comment' })[0]
            let newid = uuidv4()
            let newMark = newState.schema.mark('comment', { ...commentMark.attrs, commentmarkid: newid })
            tr = tr.addMark(pos, pos + node.nodeSize, newMark)
            changed = true
          }
        })
      })
      /* if (dragDropCitation) {
        sharedService.YjsHistoryService.addUndoItemInformation({
          type: 'figure-citation',
          data: {}
        })
      }
      if(dragDropTableCitation){
        sharedService.YjsHistoryService.addUndoItemInformation({
          type: 'table-citation',
          data: {}
        })
      } */
      if(dragDropCitation||dragDropTableCitation){
        setTimeout(() => {
          //sharedService.FiguresControllerService.updateOnlyFiguresView()
          //sharedService.CitableTablesService.updateOnlyTablesView()
          sharedService.updateCitableElementsViews()
        }, 20)
    }
    }
    return changed ? tr : undefined
  }
}

export function handleDeleteOfRefsFigsCitationsAndComments(sharedService: ServiceShare) {
  return (transactions: Transaction[], oldState: EditorState, newState: EditorState) => {
    let deletedRefCitations: any[] = []
    let deletedCommentsMarks:any[]=[]
    let deletingFigCitation = false
    let deletingTableCitation = false

    let rerenderingElements = false;

    transactions.forEach((transaction) => {
            //@ts-ignore
      if (!transaction.getMeta("deleteRefCitation") && transaction.steps.length > 0 && (transaction.meta && transaction.meta.uiEvent != 'paste' && transaction.meta.uiEvent != 'drop')) {
        transaction.steps.forEach((step) => {
          //@ts-ignore
          if (step instanceof ReplaceStep && step.slice.content.size == 0) {
            let invertedStep = step.invert(oldState.doc)
            //@ts-ignore
            let fr = (invertedStep.slice as Slice).content as Fragment
            fr.nodesBetween(0, fr.size, (node, start, parent, i) => {
              if (node.marks.filter((mark) => { return mark.type.name == 'citation' }).length > 0) {
                deletingFigCitation = true
              }
              if (node.marks.filter((mark) => { return mark.type.name == 'table_citation' }).length > 0) {
                deletingTableCitation = true
              }
              if (node.type.name == 'reference_citation') {
                deletedRefCitations.push(JSON.parse(JSON.stringify(node.attrs)))
              }
              if(node.marks.filter((mark) => { return mark.type.name == 'comment' }).length > 0){
                deletedCommentsMarks.push(JSON.parse(JSON.stringify(node.marks.filter((mark) => { return mark.type.name == 'comment' })[0])))
              }
            })
          }
        })
        if(transaction.getMeta('citable-elements-rerender')){
          rerenderingElements = true;
        }
      }
    })
    if(!rerenderingElements){
      let updateViews = ()=>{
          setTimeout(() => {
            //sharedService.FiguresControllerService.updateOnlyFiguresView()
            //sharedService.CitableTablesService.updateOnlyTablesView();
            sharedService.updateCitableElementsViews()
          }, 20)
      }
      if (deletingFigCitation) {
        setTimeout(()=>{
          /* sharedService.YjsHistoryService.addUndoItemInformation({
            type: 'figure-citation',
            data: {}
          }) */
          updateViews()
        },10)
      }
      if(deletingTableCitation){
        setTimeout(()=>{
          /* sharedService.YjsHistoryService.addUndoItemInformation({
            type: 'table-citation',
            data: {}
          }) */
          updateViews()
        },10)
      }

      if (deletedRefCitations.length > 0) {
        setTimeout(()=>{
          sharedService.YjsHistoryService.capturingNewItem = true
          sharedService.EditorsRefsManagerService!.updateRefsInEndEditorAndTheirCitations();
          setTimeout(()=>{
            sharedService.YjsHistoryService.stopCapturingUndoItem()
          },20)
        },10)
      }
      if(deletedCommentsMarks.length>0){
        setTimeout(() => {
          sharedService.CommentsService.handleDeletedComments(deletedCommentsMarks)
        }, 10);
      }
    }
    return undefined;
  }
}
