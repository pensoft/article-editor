import { I } from "@angular/cdk/keycodes";
import { MatDialog } from "@angular/material/dialog";
import { InsertFigureComponent } from "@app/editor/dialogs/figures-dialog/insert-figure/insert-figure.component";
import { ServiceShare } from "@app/editor/services/service-share.service";
import { CitateReferenceDialogComponent } from "@app/layout/pages/library/citate-reference-dialog/citate-reference-dialog.component";
import { uuidv4 } from "lib0/random";
import { toggleMark } from "prosemirror-commands";
import { MenuItem } from "prosemirror-menu";
import { Fragment, Node } from "prosemirror-model";
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

let citateRef = (sharedService: ServiceShare) => {
  return (state: EditorState, dispatch: any, view: EditorView) => {
    let start = state.selection.from;
    let end = state.selection.to;
    let nodeType = state.schema.nodes.reference_citation;

    let dialogRef = sharedDialog.open(CitateReferenceDialogComponent,{
      panelClass: 'editor-dialog-container',
      width:'400px',
      height:'511px',
    })
    dialogRef.afterClosed().subscribe(result => {
      if(result){
        if(result.refInstance=='local'){
          let refInYdoc = sharedService.EditorsRefsManagerService!.addReferenceToEditor(result)
          let referenceData = {refId:result.ref.refData.referenceData.id,last_modified:result.ref.refData.last_modified};
          let referenceStyle = {name:result.ref.refStyle.name,last_modified:result.ref.refStyle.last_modified};
          let referenceType = {name:result.ref.refType.name,last_modified:result.ref.refType.last_modified};
          let recCitationAttrs:any =  {
            contenteditableNode: 'false',
            refCitationID:uuidv4(),
            referenceData,
            referenceStyle,
            referenceType,
            refInstance:result.refInstance
          }
          recCitationAttrs = {
            contenteditableNode: 'false',
            refCitationID:uuidv4(),
            actualRefId:refInYdoc.ref.refData.referenceData.id,
          }
          let tr = state.tr.replaceWith(start, end, nodeType.create(recCitationAttrs,state.schema.text(refInYdoc.citationDisplayText)))
          dispatch(tr)
        }else if(result.refInstance=='external'){
          let refInYdoc = sharedService.EditorsRefsManagerService!.addReferenceToEditor(result)
          let referenceData = result.ref
          let recCitationAttrs:any =  {
            contenteditableNode: 'false',
            refCitationID:uuidv4(),
            referenceData:'',
            referenceStyle:'',
            referenceType:'',
            refInstance:result.refInstance
          }
          recCitationAttrs = {
            contenteditableNode: 'false',
            refCitationID:uuidv4(),
            actualRefId:refInYdoc.ref.id,
          }
          let tr = state.tr.replaceWith(start, end, nodeType.create(recCitationAttrs,state.schema.text(refInYdoc.citationDisplayText)))
          dispatch(tr)
        }
      }
    });
  }
}
let canCitate = (state: EditorState) => {
  let sel = state.selection;
  if(sel.from !== sel.to) return false;
  //@ts-ignore
  if(sel.$anchor.path){
    //@ts-ignore
    let p = sel.$anchor.path;
    for(let i = p.length-1;i>-1;i--){
      let el = p[i];
      if(i%3==0&&el.type.name == 'reference_citation'){
        return false;
      }
    }
  }
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
        width: '444px',
        height: '454px',
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
  enable(state) { return canInsert(state, state.schema.nodes.video) },
  icon: createCustomIcon('photo.svg', 17)
});

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
      width: '80%',
      height: '90%',
      panelClass: 'insert-figure-in-editor',
      data: { view, citatData: data }
    });
    dialogRef.afterClosed().subscribe(result => {
    });
    return true;
  },
  //@ts-ignore
  enable(state) { return state.selection.empty && (state.doc.resolve(state.selection.from).path as Array<Node | number>).reduce((prev, curr, index) => { if (curr instanceof Node && ['figures_nodes_container', 'block_figure'].includes(curr.type.name)) { return prev && false } else { return prev && true } }, true) },
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
    enable(state) { return canInsert(state, state.schema.nodes.video) },
    icon: videoPlayerIcon
  });
}

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
