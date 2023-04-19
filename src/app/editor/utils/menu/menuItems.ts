//@ts-ignore
import { DocumentHelpers } from 'wax-prosemirror-utilities';
import { joinDown, joinUp, toggleMark } from "prosemirror-commands";
import { Dropdown } from "prosemirror-menu"
//@ts-ignore
import { MenuItem } from '../prosemirror-menu-master/src/index.js'
import { EditorState, NodeSelection, Selection, TextSelection, Transaction } from "prosemirror-state"
import { EditorView } from "prosemirror-view"
import { schema } from "../Schema";
import { addColumnAfter, addColumnBefore, deleteColumn, addRowAfter, addRowBefore, deleteRow, mergeCells, splitCell, setCellAttr, toggleHeaderRow, toggleHeaderColumn, toggleHeaderCell, deleteTable } from "../../../../../prosemirror-tables/src/index";
import { icons } from 'prosemirror-menu'
//@ts-ignore'../../y-prosemirror-src/y-prosemirror.js'
import { redo, undo } from '../../../y-prosemirror-src/y-prosemirror.js';
import { wrapItem, blockTypeItem, selectParentNodeItem as selectParentNodeItemPM } from "prosemirror-menu";
import { YMap } from "yjs/dist/src/internals";
import { liftListItem, sinkListItem, wrapInList } from "./listLogic";
import { Subject } from 'rxjs';
import { canInsert, createCustomIcon, isCitationSelected } from './common-methods';
import { insertFigure,insertSupplementaryFile, insertImageItem, insertSpecialSymbolItem, insertDiagramItem, insertVideoItem, addMathBlockMenuItem, addMathInlineMenuItem, insertLinkItem, addAnchorTagItem, insertTableItem, citateReference, insertTable, insertEndNote } from './menu-dialogs';
import { MarkType, Node, NodeType, DOMParser, DOMSerializer, Mark, Fragment } from 'prosemirror-model';
//@ts-ignore
import { undo as undoLocalHistory, redo as redoLocalHistory } from 'prosemirror-history'
//@ts-ignore
import * as Y from 'yjs'
import { D } from '@angular/cdk/keycodes';
import { ServiceShare } from '@app/editor/services/service-share.service';
import { EditSectionService } from '@app/editor/dialogs/edit-section-dialog/edit-section.service.js';
import { includes } from 'lodash';
import { state } from '@angular/animations';
import { isInTable } from "./../../../../../prosemirror-tables/src"

export const undoIcon = {
  width: 1024, height: 1024,
  path: "M761 1024c113-206 132-520-313-509v253l-384-384 384-384v248c534-13 594 472 313 775z"
}
export const redoIcon = {
  width: 1024, height: 1024,
  path: "M576 248v-248l384 384-384 384v-253c-446-10-427 303-313 509-280-303-221-789 313-775z"
}

const addCommentIcon = {
  width: 1024, height: 1024,
  path: "M512 219q-116 0-218 39t-161 107-59 145q0 64 40 122t115 100l49 28-15 54q-13 52-40 98 86-36 157-97l24-21 32 3q39 4 74 4 116 0 218-39t161-107 59-145-59-145-161-107-218-39zM1024 512q0 99-68 183t-186 133-257 48q-40 0-82-4-113 100-262 138-28 8-65 12h-2q-8 0-15-6t-9-15v-0q-1-2-0-6t1-5 2-5l3-5t4-4 4-5q4-4 17-19t19-21 17-22 18-29 15-33 14-43q-89-50-141-125t-51-160q0-99 68-183t186-133 257-48 257 48 186 133 68 183z"
}

export const cut = (arr: MenuItem<any>[]) => arr.filter(x => x)

function getLinkMenuItemRun(state: EditorState, dispatch: any, view: EditorView) {

}

function markItem(markType: MarkType,markKey:string, options: any) {
  let passedOptions: any = {
    active(state: EditorState) { return markActive(state, markType) },
    enable:(state:EditorState)=>{
    if (state.doc.firstChild?.type.name == 'form_field' && state.doc.firstChild.attrs.allowedTags == 'customTableJSONAllowedTags1') {
      return isInTable(state)
    }
      return isCitationSelected(state, undefined,state.schema.marks[markKey])
    }
  }
  for (let prop in options) passedOptions[prop] = options[prop]
  return cmdItem(toggleMark(markType), passedOptions)
}

function wrapListItem(nodeType: NodeType,nodeItem:string, options: any) {
  let wrapListMenuItem = cmdItem((state,dispatch,view)=>{
    wrapInList(nodeType, options.attrs)(state,dispatch,view);
  }, options)
  wrapListMenuItem.enable = (state:EditorState)=>{return state.schema.nodes[nodeItem]}
  return wrapListMenuItem
}

function cmdItem(cmd: any, options: any) {
  let passedOptions: any = {
    label: options.title,
    run: cmd,
  }
  for (let prop in options) passedOptions[prop] = options[prop]
  if ((!options.enable || options.enable === true) && !options.select)
    passedOptions[options.enable ? "enable" : "select"] = (state: EditorState) => cmd(state)

  return new MenuItem(passedOptions)
}

function markActive(state: EditorState, type: MarkType) {
  let { from, $from, to, empty } = state.selection
  if (empty) return type.isInSet(state.storedMarks || $from.marks()) ? true : false
  else return state.doc.rangeHasMark(from, to, type)
}

function setAlignment(alignment: string) {
  return function (state: EditorState, dispatch?: (tr: Transaction) => boolean) {
    let sel = state.selection

    if (dispatch) {

      let tr1 = state.tr;
      state.tr.doc.nodesBetween(sel.from, sel.to, (node, pos, parent, index) => {
        if (node.attrs.align) {

          tr1 = tr1.setNodeMarkup(pos, node.type, { 'align': alignment })
        }
      })

      dispatch(tr1);
    }
    return true
  }
}

const createComment = (commentsMap: YMap<any>, addCommentSubject: Subject<any>, sectionId: string) => {
  return (state: EditorState, dispatch: any) => {
    addCommentSubject.next({ type: 'commentData', sectionId, showBox: true })
    /*const {
        selection: { $from, $to },
        tr,
    } = state;
    let commentId = uuidv4()
    let commentContent
     const dialogRef = sharedDialog.open(AddCommentDialogComponent, {
        width: 'auto',

        data: { url: commentContent, type: 'comment' }
    });
    dialogRef.afterClosed().subscribe(result => {
        commentContent = result
        let userCommentId = uuidv4()
        let userComment = {
            id: userCommentId,
            comment: commentContent
        }
        if (result) {
            commentsMap.set(commentId, [userComment]);
            toggleMark(state.schema.marks.comment, {
                id: commentId
            })(state, dispatch);
        }
    }); */


    return true
  };
}

export const isCommentAllowed = (state: EditorState): boolean => {
  if(!state.schema.marks.comment)return false
  const commentMark = state.schema.marks.comment;
  const mark = DocumentHelpers.findMark(state, commentMark, true);

  let allowed = true;
  if (state.selection.empty) {
    allowed = false;
  }
  state.doc.nodesBetween(
    state.selection.$from.pos,
    state.selection.$to.pos,
    (node, from) => {
      if (
        node.type.name === 'math_display' ||
        node.type.name === 'math_inline' ||
        node.type.name === 'image'
      ) {
        allowed = false;
      }
    },
  );

  // TODO Overlapping comments . for now don't allow
  // if (mark.length >= 1) allowed = false;
  return allowed;
};

const toggleUnderline = markItem(schema.marks.underline,'underline', { title: "Toggle underline", icon: createCustomIcon('underline.svg', 14) })

const toggleStrong = markItem(schema.marks.strong,'strong', { title: "Toggle strong style", icon: createCustomIcon('Text2.svg', 12) })

const toggleEm = markItem(schema.marks.em,'em', { title: "Toggle emphasis", icon: createCustomIcon('italic.svg') })

const toggleCode = markItem(schema.marks.code,'code', { title: "Toggle code font", icon: icons.code })

let liftItem = liftListItem(schema.nodes.list_item)
let wrapInBulletListFunc = wrapInList(schema.nodes.bullet_list)
const wrapBulletList = new MenuItem({
  title: "Wrap in bullet list",
  enable(state: EditorState) {
    if (state.doc.firstChild?.type.name == 'form_field' && state.doc.firstChild.attrs.allowedTags == 'customTableJSONAllowedTags1') {
      return isInTable(state)
    }
    return true;
    // isCitationSelected(state, () =>  wrapInBulletListFunc(state))
  },
  run(state: EditorState, dispatch: any,view) {
    let {$from, $to} = state.selection
    let range = $from.blockRange($to, node => node.childCount > 0 && node.firstChild!.type == schema.nodes.list_item)
    
    if (range) {
      liftItem(state, dispatch, view);
    } else {
    wrapInBulletListFunc(state,dispatch,view);
    }

    // joinUp(view.state,view.dispatch,view)
    // joinDown(view.state,view.dispatch,view)
  },
  icon: createCustomIcon('bullets.svg', 25, 25)
})

let wrapInOrderedListFunc = wrapInList(schema.nodes.ordered_list)
const wrapOrderedList = new MenuItem({
  title: "Wrap in ordered list",
  enable(state: EditorState) {
    if (state.doc.firstChild?.type.name == 'form_field' && state.doc.firstChild.attrs.allowedTags == 'customTableJSONAllowedTags1') {
      return isInTable(state)
    }
    return true;
    // isCitationSelected(state, () => wrapInOrderedListFunc(state))
  },
  run(state: EditorState, dispatch: any,view) {
    let {$from, $to} = state.selection
    let range = $from.blockRange($to, node => node.childCount > 0 && node.firstChild!.type == schema.nodes.list_item)

    if(range) {
      liftItem(state, dispatch, view);
    } else {
    wrapInOrderedListFunc(state,view.dispatch,view);
    }

    // joinUp(view.state,view.dispatch,view)
    // joinDown(view.state,view.dispatch,view)
  },
  icon: createCustomIcon('numbering.svg', 16)
})


const wrapBlockQuote = wrapItem(schema.nodes.blockquote, {
  title: "Wrap in block quote",
  icon: icons.blockquote,
  enable:(state:EditorState)=>{return !!state.schema.nodes.blockquote}
})

const makeParagraph = blockTypeItem(schema.nodes.paragraph, {
  title: "Change to paragraph",
  label: "Plain",
  enable:(state:EditorState)=>{return !!state.schema.nodes.paragraph}
})

const makeCodeBlock = blockTypeItem(schema.nodes.code_block, {
  title: "Change to code block",
  label: "Code",
  enable:(state:EditorState)=>{return !!state.schema.nodes.code_block}
})

let headingsObj: any = {};

function wrapParagraphIn(nodeType: NodeType, options: any) {
  let passedOptions: any = {
    run(state: EditorState, dispatch: any) {
      let paragraphNode: any = undefined;
      let paragraphStartPos: number | undefined = undefined
      let paragraphParent: Node | undefined = undefined;
      let paragraphParentStartPos: number | undefined = undefined
      //@ts-ignore
      let path = state.selection.$from.path;
      for (let i = 0; i < path.length; i += 3) {
        let node = path[i];
        let nodeIndexAsChild = path[i + 1];
        let nodePosition = path[i + 2];
        if (!paragraphNode && node.type.name == 'paragraph') {
          paragraphNode = node;
          paragraphStartPos = nodePosition
          if (path[i - 1] !== undefined && path[i - 2] !== undefined && path[i - 3] !== undefined) {
            paragraphParent = path[i - 3];
            paragraphParentStartPos = path[i - 1];
          }
        }
      }
      if (paragraphStartPos && paragraphParentStartPos) {
        let paragraph = state.doc.slice(paragraphStartPos - 1, paragraphStartPos - 1 + paragraphNode.nodeSize);
        let newNode = nodeType.create(options.attrs || {}, paragraph.content)
        let from = state.selection.from
        let to = state.selection.to

        let tr

        if (paragraphParent!.childCount == 1 && paragraphParent?.firstChild == paragraphNode && paragraphParent?.type.name !== 'form_field') {
          tr = state.tr.replaceWith(paragraphParentStartPos - 1, paragraphParent!.nodeSize + paragraphParentStartPos - 1, newNode);
          tr = tr.setSelection(new TextSelection(tr.doc.resolve(from), tr.doc.resolve(to)));
        } else {
          tr = state.tr.replaceWith(paragraphStartPos - 1, paragraphStartPos + paragraphNode.nodeSize - 1, newNode);
          tr = tr.setSelection(new TextSelection(tr.doc.resolve(from + 1), tr.doc.resolve(to + 1)));
        }
        return dispatch(tr)
      }

      //return dispatch(state.tr)
    },
    select(state: EditorState) {
      return true
    }
  }
  for (let prop in options) { passedOptions[prop] = options[prop] }
  return new MenuItem(passedOptions)
}

for (let i = 1; i <= 6; i++)
  headingsObj["makeHead" + i] = wrapParagraphIn(schema.nodes.heading, {
    title: "Change to heading " + i,
    label: "Level " + i,
    attrs: { tagName: 'h' + i },
    enable:(state:EditorState)=>{
      if (state.doc.firstChild?.type.name == 'form_field' && state.doc.firstChild.attrs.allowedTags == 'customTableJSONAllowedTags1') {
        return isInTable(state)
      }
      return !!state.schema.nodes.heading
    }
  })
const headings = Object.values(headingsObj);

const insertHorizontalRule = new MenuItem({
  title: "Insert horizontal rule",
  label: "Horizontal rule",
  enable(state: EditorState) { return state.schema.nodes.horizontal_rule&&canInsert(state, schema.nodes.horizontal_rule) },
  run(state: EditorState, dispatch: any) { dispatch(state.tr.replaceSelectionWith(schema.nodes.horizontal_rule.create())) }
})

const toggleSuperscriptItem = markItem(schema.marks.superscript,'superscript', { title: 'Toggle superscript', icon: createCustomIcon('superscript.svg', 20) })

const toggleSubscriptItem = markItem(schema.marks.subscript,'subscript', { title: 'Toggle subscript', icon: createCustomIcon('subscript.svg', 20) })

const setAlignLeft = new MenuItem({
  title: 'Align element to left',
  // @ts-ignore
  run: setAlignment('set-align-left'),
  enable(state: EditorState) { return true },
  select: (state: EditorState) => { return setAlignment('set-align-left')(state) },
  icon: createCustomIcon('align2.svg', 20)
})

let selectionIsInListItem = (decrease:boolean)=>{
  return (state:EditorState)=>{
    if (state.doc.firstChild?.type.name == 'form_field' && state.doc.firstChild.attrs.allowedTags == 'customTableJSONAllowedTags1') {
      return isInTable(state)
    }
    
    let {$from,$to} = state.selection;

    //@ts-ignore
    let fromPath = $from.path as any[]
    //@ts-ignore
    let toPath = $to.path as any[]

    let fromIsInListItem = false;
    let listItemThatFromIsIn:Node
    let toIsInListItem = false;
    let listItemThatToIsIn:Node;

    let parrentList:Node
    for(let i = fromPath.length-3;i>=0;i-=3){
      let node = fromPath[i] as Node
      if(!listItemThatFromIsIn&&node.type.name == 'list_item'){
        fromIsInListItem = true;
        listItemThatFromIsIn = node
      }else if(!parrentList&&(node.type.name == 'bullet_list'||node.type.name == 'ordered_list')){
        parrentList = node;
      }
    }

    for(let i = toPath.length-3;i>=0;i-=3){
      let node = toPath[i] as Node
      if(!listItemThatToIsIn&&node.type.name == 'list_item'){
        toIsInListItem = true;
        listItemThatToIsIn = node
      }
    }

    if((listItemThatFromIsIn == listItemThatToIsIn&&parrentList&&(parrentList.firstChild!=listItemThatToIsIn)||decrease)){
      return true
    }else{
      return false;
    }
  }
}

const decreaseIndent = new MenuItem({
  title: 'Format Indent Decrease',
  run: liftListItem(schema.nodes.list_item),
  enable:selectionIsInListItem(true),
  icon: createCustomIcon('format_indent_decrease.svg', 20,20,3,0,1.1)
})

const increaseIndent = new MenuItem({
  title: 'Format Indent Increase',
  run: sinkListItem(schema.nodes.list_item),
  enable:selectionIsInListItem(false),
  icon: createCustomIcon('format_indent_increase.svg', 20,20,3,0,1.1)
})


const setAlignCenter = new MenuItem({
  title: 'Align element to center',
  // @ts-ignore
  run: setAlignment('set-align-center'),
  enable(state: EditorState) { return true },
  select: (state: EditorState) => { return setAlignment('set-align-left')(state) },
  icon: createCustomIcon('align.svg', 18)
})
const setAlignRight = new MenuItem({
  title: 'Align element to right',
  // @ts-ignore
  run: setAlignment('set-align-right'),
  enable(state: EditorState) { return true },
  select: (state: EditorState) => { return setAlignment('set-align-right')(state) },
  icon: createCustomIcon('align1.svg', 20)
})

const getLinkMenuItem = new MenuItem({
  title: 'Get link',
  // @ts-ignore
  run: getLinkMenuItemRun,
  enable(state: EditorState) { return true },
  icon: createCustomIcon('link.svg', 19)
})



const functionItem = new MenuItem({
  title: 'Function',
  // @ts-ignore
  run: getLinkMenuItemRun,
  enable(state: EditorState) { return true },
  icon: createCustomIcon('symbols.svg', 20)
})

const highLightMenuItem = new MenuItem({
  title: 'HighLight text',
  // @ts-ignore
  run: getLinkMenuItemRun,
  enable(state: EditorState) { return true },
  icon: createCustomIcon('highlight.svg')
})

function insertPB(state: EditorState, dispatch: (p: Transaction) => void, view: EditorView, event: Event) {
  let pbnode = state.schema.nodes.page_break
  let p = state.schema.nodes.paragraph
  let selectionEnd = state.selection.to;

  let pbinsertplace = 0;
  state.doc.forEach((node, offset, i) => {
    if (selectionEnd > pbinsertplace) {
      pbinsertplace = offset + node.nodeSize;
    }
  })
  let text = state.schema.text('Page Break')
  let paragraph = p.create({ contenteditableNode: false }, text)
  let pageBreak = pbnode.create({ contenteditableNode: false }, paragraph)
  if (state.doc.nodeAt(pbinsertplace)?.type.name == 'page_break') {
    dispatch(state.tr.replaceWith(pbinsertplace, pbinsertplace + state.doc.nodeAt(pbinsertplace)?.nodeSize!, Fragment.empty))
  } else {
    dispatch(state.tr.insert(pbinsertplace, pageBreak))
  }
}

function canInsertPB(state: EditorState) {
  if (state.doc.firstChild?.type.name == 'form_field' && state.doc.firstChild.attrs.allowedTags == 'customTableJSONAllowedTags1') {
    return isInTable(state)
  }
  return !!state.schema.nodes.page_break;
}

const insertPageBreak = new MenuItem({
  title: 'Insert page break after this block node.',
  run: insertPB,
  enable: canInsertPB,
  icon: createCustomIcon('pagebreak.svg', 20, 20, 0, 3)
})

const footnoteMenuItem = new MenuItem({
  title: 'Add Footnote',
  // @ts-ignore
  run: getLinkMenuItemRun,
  enable(state: EditorState) { return true },
  icon: createCustomIcon('insert.svg', 20)
})

const spellCheckMenuItem = new MenuItem({
  title: 'Turn off/on spellcheck',
  // @ts-ignore
  run: getLinkMenuItemRun,
  enable(state: EditorState) { return isCitationSelected(state, undefined, true) },
  icon: createCustomIcon('spellcheck.svg', 29)
})
function logNodesItemRun(state: EditorState, dispatch: any, view: EditorView) {
  try {
    let input_container = state.schema.nodes.input_container as NodeType;
    let input_label = state.schema.nodes.input_label as NodeType;
    let input_placeholder = state.schema.nodes.input_placeholder as NodeType;

    let noneditableMark = state.schema.marks.noneditableMark as MarkType;

    /* let leb = input_label.create({text:'label'})
    let pl = input_placeholder.create({},schema.text('placeholder'))
    let co = input_container.create({},[leb,pl]);

    */
    let r = toggleMark(noneditableMark)(state, dispatch)
    /* let text = schema.text('dwq', [noneditableMark.create()])
    let newTr = state.tr.replaceSelectionWith(text)
    view.dispatch(newTr); */
    return true && r;
  } catch (e) {
    console.error(e);
  }
}

export let undoItemPM = new MenuItem({
  title: "Undo last change",
  run: undoLocalHistory,
  enable: (state: EditorState) => undoLocalHistory(state),
  icon: undoIcon
})

// :: MenuItem
// Menu item for the `redo` command.
export let redoItemPM = new MenuItem({
  title: "Redo last undone change",
  run: redoLocalHistory,
  enable: (state: EditorState) => redoLocalHistory(state),
  icon: redoIcon
})






const tableMenu = [
  //@ts-ignore
  insertTableItem,
  new MenuItem({ label: "Insert column before", enable: addColumnBefore, run: addColumnBefore }),
  new MenuItem({ label: "Insert column after", enable: addColumnAfter, run: addColumnAfter }),
  new MenuItem({ label: "Delete column", enable: deleteColumn, run: deleteColumn }),
  new MenuItem({ label: "Insert row before", enable: addRowBefore, run: addRowBefore }),
  new MenuItem({ label: "Insert row after", enable: addRowAfter, run: addRowAfter }),
  new MenuItem({ label: "Delete row", enable: deleteRow, run: deleteRow }),
  new MenuItem({ label: "Delete table", enable: deleteTable, run: deleteTable }),
  new MenuItem({ label: "Merge cells", enable: mergeCells, run: mergeCells }),
  new MenuItem({ label: "Split cell", enable: splitCell, run: splitCell }),
  new MenuItem({ label: "Toggle header column", enable: toggleHeaderColumn, run: toggleHeaderColumn }),
  new MenuItem({ label: "Toggle header row", enable: toggleHeaderRow, run: toggleHeaderRow }),
  new MenuItem({ label: "Toggle header cells", enable: toggleHeaderCell, run: toggleHeaderCell }),
  new MenuItem({ label: "Make cell green", enable: setCellAttr("background", "#dfd"), run: setCellAttr("background", "#dfd") }),
  new MenuItem({ label: "Make cell not-green", enable: setCellAttr("background", null), run: setCellAttr("background", null) }),
];


let allMenuItems: { [key: string]: MenuItem | any } = {
  'addMathInlineMenuItem': addMathInlineMenuItem,
  'addMathBlockMenuItem': addMathBlockMenuItem,
  'toggleStrong': toggleStrong,
  'insertTable':insertTable,
  'toggleEm': toggleEm,
  'toggleCode': toggleCode,
  'insertImage': insertImageItem,
  'wrapBulletList': wrapBulletList,
  'wrapOrderedList': wrapOrderedList,
  'wrapBlockQuote': wrapBlockQuote,
  'makeParagraph': makeParagraph,
  'makeCodeBlock': makeCodeBlock,
  'headings': headings,
  'insertPageBreak': insertPageBreak,
  'insertHorizontalRule': insertHorizontalRule,
  'insertSupplementaryFile':insertSupplementaryFile,
  'undoItem': undoItemPM,
  'redoItem': redoItemPM,
  'increaseIndent':increaseIndent,
  'undoItemPM': undoItemPM,
  'redoItemPM': redoItemPM,
  'insertEndNote':insertEndNote,
  'toggleSuperscriptItem': toggleSuperscriptItem,
  'toggleSubscriptItem': toggleSubscriptItem,
  'insertLink': insertLinkItem,
  'setAlignLeft': setAlignLeft,
  'setAlignCenter': setAlignCenter,
  'setAlignRight': setAlignRight,
  'citateReference': citateReference,
  'insertVideoItem': insertVideoItem,
  'selectParentNodeItem': selectParentNodeItemPM,
  'tableMenu': tableMenu,
  'alignMenu': [setAlignLeft, setAlignCenter, setAlignRight],
  'addAnchorTagMenuItem': addAnchorTagItem,
  'insertSpecialSymbol': insertSpecialSymbolItem,
  'getLinkMenuItem': getLinkMenuItem,
  'starMenuItem': functionItem,
  'highLightMenuItem': highLightMenuItem,
  'footnoteMenuItem': footnoteMenuItem,
  'decreaseIndent':decreaseIndent,
  'spellCheckMenuItem': spellCheckMenuItem,
  'toggleUnderline': toggleUnderline,
  'insertFigure': insertFigure,
  // unfinished menu :
  'textMenu': [toggleStrong, toggleEm, toggleUnderline, 'menuseparator', wrapOrderedList, wrapBulletList, 'menuseparator', toggleSubscriptItem, toggleSuperscriptItem, spellCheckMenuItem],
  'insertMenu': [insertImageItem, insertDiagramItem, new Dropdown(tableMenu, { class: "table-icon vertival-dropdown" }), footnoteMenuItem, functionItem, insertSpecialSymbolItem]
  // should do some missing menu items :
  /* 'textMenu':[[toggleStrong,toggleEm,toggleUnderLine],
  [wrapOrderedList,wrapBulletList],
  [toggleSubscriptItem,toggleSuperscriptItem,toggleOther,toggleSpellcheck]],
  'toggleHighLight':toggleHighLight,
  'inserMenu':[insertImage,getLinkMenuItem,tableMenu,,addMathInlineMenuItem,starMenuItem] */

}

export const getItems = () => {
  return allMenuItems;
}
