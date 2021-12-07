import { MatDialog } from "@angular/material/dialog";
import { InsertFigureComponent } from "@app/editor/dialogs/figures-dialog/insert-figure/insert-figure.component";
import { toggleMark } from "prosemirror-commands";
import { MenuItem } from "prosemirror-menu";
import { Fragment } from "prosemirror-model";
import { EditorState, NodeSelection, Transaction } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { AddCommentDialogComponent } from "../../add-comment-dialog/add-comment-dialog.component";
import { AddLinkDialogComponent } from "../../add-link-dialog/add-link-dialog.component";
import { InsertDiagramDialogComponent } from "../../dialogs/insert-diagram-dialog/insert-diagram-dialog.component";
import { InsertImageDialogComponent } from "../../dialogs/insert-image-dialog/insert-image-dialog.component";
import { InsertSpecialSymbolDialogComponent } from "../../dialogs/insert-special-symbol-dialog/insert-special-symbol-dialog.component";
import { TableSizePickerComponent } from "../table-size-picker/table-size-picker.component";
import { canInsert, createCustomIcon, videoPlayerIcon } from "./common-methods";

let sharedDialog: MatDialog;

export function shareDialog(dialog: MatDialog) {
  sharedDialog = dialog
}

export const insertImageItem = new MenuItem({
  title: 'Insert image',
  // @ts-ignore
  run: (state: EditorState, dispatch?: (tr: Transaction) => boolean, view?: EditorView) => {
    if (dispatch) {
      const dialogRef = sharedDialog.open(InsertImageDialogComponent, {
        width: '444px',
        height: '326px',
        panelClass: 'editor-dialog-container',
        data: { image: '' }
      });
      dialogRef.afterClosed().subscribe(image => {
        if (!image) {
          return;
        }
        // view?.dispatch(view.state.tr.replaceSelectionWith(state.schema.nodes.image.createAndFill(attrs)!))
        // view?.focus();
      });
    }
    return true;
  },
  enable(state) { return canInsert(state, state.schema.nodes.video) },
  icon: createCustomIcon('photo.svg', 17)
});

export const insertFigure = new MenuItem({
  title: 'Insert smart figure citation',
  // @ts-ignore
  run: (state: EditorState, dispatch?: (tr: Transaction) => boolean, view?: EditorView) => {
    if (dispatch) {
      const dialogRef = sharedDialog.open(InsertFigureComponent, {
        width: '80%',
        height: '90%',
        panelClass: 'insert-figure-in-editor',
        data: { view }
      });
      dialogRef.afterClosed().subscribe(result => {
      });
    }
    return true;
  },
  enable(state) { return canInsert(state,state.schema.nodes.block_figure)&&state.selection.empty },
  icon: createCustomIcon('addfigure.svg', 18)
})


export const insertDiagramItem = new MenuItem({
  title: 'Insert diagram',
  // @ts-ignore
  run: (state: EditorState, dispatch?: (tr: Transaction) => boolean, view?: EditorView) => {
    if (dispatch) {
      const dialogRef = sharedDialog.open(InsertDiagramDialogComponent, {
        width: '444px',
        height: '345px',
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
  enable(state) { return canInsert(state, state.schema.nodes.video) },
  icon: createCustomIcon('link.svg', 19)
});


export const insertSpecialSymbolItem = new MenuItem({
  title: 'Insert a special character',
  // @ts-ignore
  run: (state: EditorState, dispatch?: (tr: Transaction) => boolean, view?: EditorView) => {
    if (dispatch) {
      const dialogRef = sharedDialog.open(InsertSpecialSymbolDialogComponent, {
        width: '581px',
        height: '514px',
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
  enable(state) { return true },
  icon: createCustomIcon('Icon feather-star.svg', 20)
});


export const insertVideoItem = new MenuItem({
  title: 'Add video element',
  // @ts-ignore
  run: (state: EditorState, dispatch?: (tr: Transaction) => boolean, view?: EditorView) => {
    if (dispatch) {
      let url
      let nodetype = state.schema.nodes.video;
      const dialogRef = sharedDialog.open(AddCommentDialogComponent, {
        width: '500px',
        data: { url: url, type: 'video' }
      });
      dialogRef.afterClosed().subscribe(result => {
        if (!result) {
          return;
        }
        url = result;
        let node = nodetype.create({ 'src': url })
        view?.dispatch(view.state.tr.replaceSelectionWith(node))
        view?.focus()
      });
    }
    return true
  },
  enable(state) { return canInsert(state, state.schema.nodes.video) },
  icon: videoPlayerIcon
});

export const addMathInlineMenuItem = new MenuItem({
  title: 'Add mathematic expresions to the document',
  label: 'Math',
  // @ts-ignore
  run: addMathInline('math_inline'),
  enable(state) { return state.tr.selection.empty },
});

export const addMathBlockMenuItem = new MenuItem({
  title: 'Add mathematic expresions to the document',
  label: 'BlockMath',
  // @ts-ignore
  run: addMathInline('math_display'),
  enable(state) { return state.tr.selection.empty }
});

export const insertLinkItem = new MenuItem({
  title: 'Insert a link',
  run: (state: EditorState, dispatch: any) => {
    let url, text;
    const dialogRef = sharedDialog.open(AddLinkDialogComponent, {
      width: 'auto',
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
  enable(state) { return true },
  icon: createCustomIcon('connect.svg', 18)
})

export const insertTableItem = new MenuItem({
  title: 'Insert table',
  label: 'Insert table',
  //@ts-ignore
  run:  (state: EditorState, dispatch?: (tr: Transaction) => boolean, view?: EditorView) => {
    if (dispatch) {
      let rows, cols;
      const tableSizePickerDialog = sharedDialog.open(TableSizePickerComponent, {
        width: '275px',
        data: { rows: rows, cols: cols }
      });

      tableSizePickerDialog.afterClosed().subscribe(result => {
        const { rows, cols } = result;
        let singleRow = Fragment.fromArray(new Array(cols).fill(state.schema.nodes.table_cell.createAndFill(), 0, cols));
        let table = Fragment.fromArray(new Array(rows).fill(state.schema.nodes.table_row.create(undefined, singleRow), 0, rows));
        const tr = state.tr.replaceSelectionWith(state.schema.nodes.table.create(undefined, table));
        if (dispatch) { dispatch(tr); }
        return true;
      });
    }
    return true
  }
});

export const addAnchorTagItem = new MenuItem({
  title: 'Add anchor tag to the document',
  // @ts-ignore
  run: (state: EditorState, dispatch: any) => {
    const { selection: { $from, $to }, tr } = state;
    let anchorid;
    const dialogRef = sharedDialog.open(AddCommentDialogComponent, {
      width: 'auto',
      data: { url: anchorid, type: 'anchorTag' }
    });
    dialogRef.afterClosed().subscribe(result => {
      anchorid = result;
      toggleMark(state.schema.marks.anchorTag, { id: anchorid })(state, dispatch)
    });
  },
  enable(state) { return !state.tr.selection.empty },
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
          width: 'auto',
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
