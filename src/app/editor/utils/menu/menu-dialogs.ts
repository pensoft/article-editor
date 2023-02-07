import { I } from "@angular/cdk/keycodes";
import { MatDialog } from "@angular/material/dialog";
import { InsertFigureComponent } from "@app/editor/dialogs/figures-dialog/insert-figure/insert-figure.component";
import { ServiceShare } from "@app/editor/services/service-share.service";
import { CitateReferenceDialogComponent } from "@app/layout/pages/library/citate-reference-dialog/citate-reference-dialog.component";
import { uuidv4 } from "lib0/random";
import { toggleMark } from "prosemirror-commands";
//@ts-ignore
import {MenuItem} from '../prosemirror-menu-master/src/index.js';
import { Fragment, Node } from "prosemirror-model";
import { EditorState, NodeSelection, Selection, TextSelection, Transaction } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { AddCommentDialogComponent } from "../../add-comment-dialog/add-comment-dialog.component";
import { AddLinkDialogComponent } from "../../add-link-dialog/add-link-dialog.component";
import { InsertDiagramDialogComponent } from "../../dialogs/insert-diagram-dialog/insert-diagram-dialog.component";
import { InsertImageDialogComponent } from "../../dialogs/insert-image-dialog/insert-image-dialog.component";
import { InsertSpecialSymbolDialogComponent } from "../../dialogs/insert-special-symbol-dialog/insert-special-symbol-dialog.component";
import { TableSizePickerComponent } from "../table-size-picker/table-size-picker.component";
import { canInsert, createCustomIcon, videoPlayerIcon } from "./common-methods";
import { InsertTableComponent } from "@app/editor/dialogs/citable-tables-dialog/insert-table/insert-table.component";
import { StateEffectType } from "@codemirror/state";
import { InsertSupplementaryFileComponent } from "@app/editor/dialogs/supplementary-files/insert-supplementary-file/insert-supplementary-file.component";
import { InsertEndNoteComponent } from "@app/editor/dialogs/end-notes/insert-end-note/insert-end-note.component";
import { RefsInArticleCiteDialogComponent } from "@app/editor/dialogs/refs-in-article-cite-dialog/refs-in-article-cite-dialog.component";

let sharedDialog: MatDialog;

export function shareDialog(dialog: MatDialog) {
  sharedDialog = dialog
}

let citateRef = (sharedService: ServiceShare) => {
  return (state: EditorState, dispatch: any, view: EditorView) => {
    //@ts-ignore
    let resolvedPosPath = state.selection.$anchor.path
    let citedRefsAtPos
    let citationAtPos
    let citationPos
    let citationObj
    for(let i = resolvedPosPath.length-3;i>=0&&!citedRefsAtPos;i-=3){
      let node:Node = resolvedPosPath[i];
      if(!citedRefsAtPos&&node.type.name == 'reference_citation'){
        citedRefsAtPos = node.attrs.citedRefsIds;
        citationAtPos = node
        citationPos = resolvedPosPath[i-1]
        citationObj = {
          citedRefsAtPos,
          citationAtPos,
          citationPos
        }
      }
    }

    let dialogRef = sharedDialog.open(RefsInArticleCiteDialogComponent,{
      panelClass: 'editor-dialog-container',
      data:{citedRefsAtPos},
      width: '680px',
      // height:'461px',
    })
    dialogRef.afterClosed().subscribe(result => {
      if(result){
        let citedRefs = result.citedRefs
        let refsInYdoc = JSON.parse(JSON.stringify(result.refsInYdoc))
        Object.values(refsInYdoc).forEach((ref:any)=>{
          ref.citation.text = ref.citation.data.text;
        })
        sharedService.EditorsRefsManagerService.citateSelectedReferencesInEditor(result.citedRefs,view,citationObj)
      }
      /* if(result){
        sharedService.YjsHistoryService.startCapturingNewUndoItem();
        if(result.refInstance=='local'){
          let refInYdoc = sharedService.EditorsRefsManagerService!.addReferenceToEditor(result)
          let recCitationAttrs:any = {
            contenteditableNode: 'false',
            refCitationID:uuidv4(),
            actualRefId:refInYdoc.ref.refData.referenceData.id,
          }
          let tr = state.tr.replaceWith(start, end, nodeType.create(recCitationAttrs,state.schema.text(refInYdoc.citationDisplayText)))
          tr = tr.setSelection(new TextSelection(tr.doc.resolve(end+2+refInYdoc.citationDisplayText.length),tr.doc.resolve(end+2+refInYdoc.citationDisplayText.length)))
          dispatch(tr)
        }else if(result.refInstance=='external'){
          let refInYdoc = sharedService.EditorsRefsManagerService!.addReferenceToEditor(result)
          let recCitationAttrs:any = {
            contenteditableNode: 'false',
            refCitationID:uuidv4(),
            actualRefId:refInYdoc.ref.refData.referenceData.id,
          }
          let tr = state.tr.replaceWith(start, end, nodeType.create(recCitationAttrs,state.schema.text(refInYdoc.citationDisplayText)))
          tr = tr.setSelection(new TextSelection(tr.doc.resolve(end+2+refInYdoc.citationDisplayText.length),tr.doc.resolve(end+2+refInYdoc.citationDisplayText.length)))
          dispatch(tr)
        }
      } */
    });
  }
}
let canCitate = (state: EditorState) => {
  let sel = state.selection;
  if(!state.schema.nodes.reference_citation) return false;
  if(sel.from !== sel.to) return false;
  return true;
}
export const citateReference = (sharedService: ServiceShare) => {
  return new MenuItem({
    title: 'Citate a Reference.',
    run: citateRef(sharedService),
    enable: canCitate,
    icon: createCustomIcon('refCitation.svg', 20, 20, 0, 5)
  })
};

export const insertImageItem = new MenuItem({
  title: 'Insert image',
  // @ts-ignore
  run: (state: EditorState, dispatch?: (tr: Transaction) => boolean, view?: EditorView) => {
    if (dispatch) {
      const dialogRef = sharedDialog.open(InsertImageDialogComponent, {
        width: '680px',
        // height: '454px',
        panelClass: 'editor-dialog-container',
        data: { image: '' }
      });
      dialogRef.afterClosed().subscribe(image => {
        if (!image || !image.imgURL) {
          return;
        }
        if (image.imgURL) {
          view?.dispatch(view.state.tr.replaceSelectionWith(state.schema.nodes.image.create({ src: image.imgURL })));
        }

        // view?.dispatch(view.state.tr.replaceSelectionWith(state.schema.nodes.image.createAndFill(attrs)!))
        // view?.focus();
      });
    }
    return true;
  },
  enable(state:EditorState) { return state.schema.nodes.image&&canInsert(state, state.schema.nodes.image) },
  icon: createCustomIcon('photo.svg', 17)
});

export const insertEndNote = new MenuItem({
  title: 'Insert end note citation.',
  // @ts-ignore
  run: (state: EditorState, dispatch?: (tr: Transaction) => boolean, view?: EditorView) => {
    let nodeAtCursor = state.selection.$from.parent
    let nodeAt = state.doc.nodeAt(state.selection.from)
    let data
    let citatmark = nodeAt?.marks.filter((mark) => { return mark.type.name == 'end_note_citation' })
    if (citatmark?.length! > 0) {
      data = JSON.parse(JSON.stringify(citatmark![0].attrs));
    }
    const dialogRef = sharedDialog.open(InsertEndNoteComponent, {
      width: '582px',
      // height: '90%',
      panelClass: 'insert-figure-in-editor',
      data: { view, citatData: data }
    });
    dialogRef.afterClosed().subscribe(result => {
    });
    return true;
  },
  //@ts-ignore
  enable(state) { return state.schema.marks.citation&&state.selection.empty && (state.doc.resolve(state.selection.from).path as Array<Node | number>).reduce((prev, curr, index) => { if (curr instanceof Node && [/* 'figures_nodes_container', 'block_figure' */].includes(curr.type.name)) { return prev && false } else { return prev && true } }, true) },
  icon: createCustomIcon('end-note.svg', 20,20,3,0)
})

export const insertSupplementaryFile = new MenuItem({
  title: 'Insert supplementary file citation.',
  // @ts-ignore
  run: (state: EditorState, dispatch?: (tr: Transaction) => boolean, view?: EditorView) => {
    let nodeAtCursor = state.selection.$from.parent
    let nodeAt = state.doc.nodeAt(state.selection.from)
    let data
    let citatmark = nodeAt?.marks.filter((mark) => { return mark.type.name == 'supplementary_file_citation' })
    if (citatmark?.length! > 0) {
      data = JSON.parse(JSON.stringify(citatmark![0].attrs));
    }
    const dialogRef = sharedDialog.open(InsertSupplementaryFileComponent, {
      width: '582px',
      // height: '90%',
      panelClass: 'insert-figure-in-editor',
      data: { view, citatData: data }
    });
    dialogRef.afterClosed().subscribe(result => {
    });
    return true;
  },
  //@ts-ignore
  enable(state) { return state.schema.marks.citation&&state.selection.empty && (state.doc.resolve(state.selection.from).path as Array<Node | number>).reduce((prev, curr, index) => { if (curr instanceof Node && [/* 'figures_nodes_container', 'block_figure' */].includes(curr.type.name)) { return prev && false } else { return prev && true } }, true) },
  icon: createCustomIcon('supplementary-file.svg', 22,22,3,0)
})

export const insertFigure = new MenuItem({
  title: 'Insert smart figure citation',
  // @ts-ignore
  run: (state: EditorState, dispatch?: (tr: Transaction) => boolean, view?: EditorView) => {
    let nodeAtCursor = state.selection.$from.parent
    let nodeAt = state.doc.nodeAt(state.selection.from)
    let data
    let citatmark = nodeAt?.marks.filter((mark) => { return mark.type.name == 'citation' })
    if (citatmark?.length! > 0) {
      data = JSON.parse(JSON.stringify(citatmark![0].attrs));
    }
    const dialogRef = sharedDialog.open(InsertFigureComponent, {
      width: 'max-content',
      // height: '90%',
      minWidth : '582px',
      panelClass: 'insert-figure-in-editor',
      data: { view, citatData: data }
    });
    dialogRef.afterClosed().subscribe(result => {
    });
    return true;
  },
  //@ts-ignore
  enable(state) { return state.schema.marks.citation&&state.selection.empty && (state.doc.resolve(state.selection.from).path as Array<Node | number>).reduce((prev, curr, index) => { if (curr instanceof Node && [/* 'figures_nodes_container', 'block_figure' */].includes(curr.type.name)) { return prev && false } else { return prev && true } }, true) },
  icon: createCustomIcon('addfigure.svg', 18)
})

export const insertTable = new MenuItem({
  title: 'Insert smart table citation',
  // @ts-ignore
  run: (state: EditorState, dispatch?: (tr: Transaction) => boolean, view?: EditorView) => {
    let nodeAtCursor = state.selection.$from.parent
    let nodeAt = state.doc.nodeAt(state.selection.from)
    let data
    let citatmark = nodeAt?.marks.filter((mark) => { return mark.type.name == 'table_citation' })
    if (citatmark?.length! > 0) {
      data = JSON.parse(JSON.stringify(citatmark![0].attrs));
    }
    const dialogRef = sharedDialog.open(InsertTableComponent, {
      width: '582px',
      // height: '90%',
      panelClass: 'insert-figure-in-editor',
      data: { view, citatData: data }
    });
    dialogRef.afterClosed().subscribe(result => {
    });
    return true;
  },
  //@ts-ignore
  enable(state) { return state.schema.marks.table_citation&&state.selection.empty && (state.doc.resolve(state.selection.from).path as Array<Node | number>).reduce((prev, curr, index) => { if (curr instanceof Node && [/* 'tables_nodes_container', 'block_table' */].includes(curr.type.name)) { return prev && false } else { return prev && true } }, true) },
  icon: createCustomIcon('citeTable.svg', 18,18,0,2,1.2)
})


export const insertDiagramItem = new MenuItem({
  title: 'Insert diagram',
  // @ts-ignore
  run: (state: EditorState, dispatch?: (tr: Transaction) => boolean, view?: EditorView) => {
    if (dispatch) {
      const dialogRef = sharedDialog.open(InsertDiagramDialogComponent, {
        width: '680px',
        // height: '345px',
        panelClass: 'editor-dialog-container',
        data: { type: 'pie' }
      });
      dialogRef.afterClosed().subscribe(data => {
        if (!data) {
          return;
        }
        // view?.dispatch(view.state.tr.replaceSelectionWith(state.schema.nodes.image.createAndFill(attrs)!))
        // view?.focus();
      });
    }
    return true;
  },
  enable(state:EditorState) { return canInsert(state, state.schema.nodes.video) },
  icon: createCustomIcon('link.svg', 19)
});


export const insertSpecialSymbolItem = new MenuItem({
  title: 'Insert a special character',
  // @ts-ignore
  run: (state: EditorState, dispatch?: (tr: Transaction) => boolean, view?: EditorView) => {
    if (dispatch) {
      const dialogRef = sharedDialog.open(InsertSpecialSymbolDialogComponent, {
        width: '680px',
        // height: '557px',
        panelClass: ['editor-dialog-container', 'special-symbols-dialog'],
        data: { type: 'pie' }
      });
      dialogRef.afterClosed().subscribe(data => {
        if (data) {
          view.dispatch(view.state.tr.replaceSelectionWith(state.schema.text(data)))
        }
      });
    }
    return true;
  },
  enable(state:EditorState) { return true },
  icon: createCustomIcon('Icon feather-star.svg', 20)
});

export let insertVideoItem = (serviceShare:ServiceShare)=>{
  return new MenuItem({
    title: 'Add video element',
    // @ts-ignore
    run: (state: EditorState, dispatch?: (tr: Transaction) => boolean, view?: EditorView) => {
      if (dispatch) {
        let url
        let nodetype = state.schema.nodes.video;
        const dialogRef = sharedDialog.open(AddCommentDialogComponent, {
          width: '500px',
          panelClass: 'insert-figure-in-editor',
          data: { url: url, type: 'video' }
        });
        dialogRef.afterClosed().subscribe(result => {
          if (!result) {
            return;
          }

          //  get dataurl with fetch and file riderFiguresDataURLSFiguresDataURLSFiguresDataURLS
          //  let dataURLObj = this.serviceShare.YdocService!.figuresMap!.get('ArticleFiguresDataURLS');
          //  dataURLObj[url] = dataurl;
          //  this.serviceShare.YdocService!.figuresMap!.set('ArticleFiguresDataURLS', dataURLObj);

          url = result;
          let node = nodetype.create({ 'src': url })
          view?.dispatch(view.state.tr.replaceSelectionWith(node))
          view?.focus()
        });
      }
      return true
    },
    enable(state:EditorState) { return state.schema.nodes.video&&canInsert(state, state.schema.nodes.video) },
    icon: videoPlayerIcon
  });
}

export const addMathInlineMenuItem = new MenuItem({
  title: 'Add inline mathematic expresions to the document',
  // @ts-ignore
  run: addMathInline('math_inline'),
  enable(state:EditorState) { return state.schema.nodes.math_inline&&state.tr.selection.empty },
  icon: createCustomIcon('math-icon.svg', 13)
});

export const addMathBlockMenuItem = new MenuItem({
  title: 'Add block mathematic expresions to the document',
  // @ts-ignore
  run: addMathInline('math_display'),
  enable(state:EditorState) { return state.schema.nodes.math_display&&state.tr.selection.empty },
  icon: createCustomIcon('symbols.svg', 20)
});

export const insertLinkItem = new MenuItem({
  title: 'Insert a link',
  run: (state: EditorState, dispatch: any) => {
    let url, text;
    const dialogRef = sharedDialog.open(AddLinkDialogComponent, {
      width: '582px',
      panelClass: 'insert-figure-in-editor',
      data: { url: url, text: text }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        let { from, to } = state.selection;
        let mark = state.schema.marks.link.create({ href: result.url, title: result.text })
        let newtextNode = state.schema.text(result.text, [mark])
        let tr = state.tr.replaceRangeWith(from, to, newtextNode);
        dispatch(tr);
        toggleMark(state.schema.marks.link);
      }
    })
  },
  enable(state:EditorState) { return state.schema.marks.link },
  icon: createCustomIcon('connect.svg', 18)
})

export const insertTableItem = new MenuItem({
  title: 'Insert table',
  label: 'Insert table',
  //@ts-ignore
  run: (state: EditorState, dispatch?: (tr: Transaction) => boolean, view?: EditorView) => {
    if (dispatch) {
      let rows, cols;
      const tableSizePickerDialog = sharedDialog.open(TableSizePickerComponent, {
        width: '275px',
        data: { rows: rows, cols: cols }
      });

      tableSizePickerDialog.afterClosed().subscribe(result => {
        const { rows, cols } = result;
        let paragraph = state.schema.nodes.paragraph.createAndFill()
        let formField = state.schema.nodes.form_field.createAndFill(undefined, paragraph)
        let singleRow = Fragment.fromArray(new Array(cols).fill(state.schema.nodes.table_cell.createAndFill(undefined, formField), 0, cols));
        let table = Fragment.fromArray(new Array(rows).fill(state.schema.nodes.table_row.create(undefined, singleRow), 0, rows));
        const tr = state.tr.replaceSelectionWith(state.schema.nodes.table.create(undefined, table));
        if (dispatch) { dispatch(tr); }
        return true;
      });
    }
    return true
  },
  enable(state:EditorState) { return state.schema.nodes.table },
});

export const addAnchorTagItem = new MenuItem({
  title: 'Remove link on selection.',
  // @ts-ignore
  run: (state: EditorState, dispatch: any) => {
    let doc = state.doc
    let from = state.selection.$from;

    let markStart = state.selection.from;
    let markEnd = state.selection.from;

    let nodeBefore = from.nodeBefore
    let markBefore = nodeBefore.marks.find((m)=>m.type.name == "link")
    let nodeAfter = from.nodeAfter
    let markAfter = nodeAfter.marks.find((m)=>m.type.name == "link")
    let originalMarksAttr = markAfter.attrs;
    let doneWithStart = false;
    let doneWithEnd = false;

    let checkAttrs = (attrs)=>{
      return originalMarksAttr.title == attrs.title&&originalMarksAttr.href == attrs.href
    }
    while(!doneWithStart||!doneWithEnd){
      let newStart = doc.resolve(markStart - nodeBefore.nodeSize);
      let newStartNodeBefore = newStart.nodeBefore;
      let newEnd = doc.resolve(markEnd + nodeAfter.nodeSize+1);
      let newNodeNodeAfter = newEnd.nodeBefore;
      if(!newStartNodeBefore||!newStartNodeBefore.marks.find((m)=>m.type.name == "link")||!checkAttrs(newStartNodeBefore.marks.find((m)=>m.type.name == "link").attrs)){
        markStart = markStart - nodeBefore.nodeSize
        doneWithStart = true;
      }
      if(!doneWithStart){
        markStart = markStart - nodeBefore.nodeSize
      }
      if(!newNodeNodeAfter||!newNodeNodeAfter.marks.find((m)=>m.type.name == "link")||!checkAttrs(newNodeNodeAfter.marks.find((m)=>m.type.name == "link").attrs)){
        markEnd = markEnd + nodeAfter.nodeSize
        doneWithEnd = true;
      }
      if(!doneWithEnd){
        markEnd = markEnd + nodeAfter.nodeSize
      }
    }
    dispatch(state.tr.removeMark(markStart,markEnd,markBefore))
   /*  const dialogRef = sharedDialog.open(AddCommentDialogComponent, {
      width: 'auto',
      data: { url: anchorid, type: 'anchorTag' }
    });
    dialogRef.afterClosed().subscribe(result => {
      anchorid = result;
      toggleMark(state.schema.marks.anchorTag, { id: anchorid })(state, dispatch)
    }); */
  },
  enable(state:EditorState) {
    let {$from} = state.selection
    let nodeBefore = $from.nodeBefore
    let nodeAfter = $from.nodeAfter
    if(nodeBefore&&nodeAfter&&nodeBefore.marks.some((m)=>m.type.name == "link")&&nodeAfter.marks.some((m)=>m.type.name == "link")){
      return true
    }
    return false
  },
  icon: createCustomIcon('anchortag.svg', 19)
})

function addMathInline(mathType: string) {
  return (state: EditorState, dispatch: any, view: EditorView) => {
    let sel = state.selection
    if (dispatch) {
      if (sel.empty) {
        let mathExpresion;
        let { from, to } = state.selection
        let mathNode = state.schema.nodes[mathType]
        const dialogRef = sharedDialog.open(AddCommentDialogComponent, {
          width: '582px',
          panelClass: 'insert-figure-in-editor',
          data: { url: mathExpresion, type: 'mathinline' }
        });
        dialogRef.afterClosed().subscribe(result => {
          mathExpresion = result
          let newmathNode = mathNode.create(undefined, state.schema.text(mathExpresion))
          let tr = view.state.tr.replaceSelectionWith(newmathNode);
          view.dispatch(tr)
          if (mathType == 'math_display') {
            view.dispatch(view.state.tr.setSelection(NodeSelection.create(tr.doc, from - 1)));
          }
        });
      }
    }
    return true;
  }
}
