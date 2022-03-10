//@ts-ignore
import { DocumentHelpers } from 'wax-prosemirror-utilities';
import { toggleMark } from "prosemirror-commands";
import { Dropdown, MenuItem} from "prosemirror-menu"
import { EditorState, NodeSelection, Transaction } from "prosemirror-state"
import { EditorView } from "prosemirror-view"
import { schema } from "../Schema";
import { addColumnAfter, addColumnBefore, deleteColumn, addRowAfter, addRowBefore, deleteRow, mergeCells, splitCell, setCellAttr, toggleHeaderRow, toggleHeaderColumn, toggleHeaderCell, deleteTable } from "prosemirror-tables";
import { icons } from 'prosemirror-menu'
//@ts-ignore'../../y-prosemirror-src/y-prosemirror.js'
import { redo, undo, yCursorPlugin, yDocToProsemirrorJSON, ySyncPlugin, yUndoPlugin } from '../../../y-prosemirror-src/y-prosemirror.js';
import { wrapItem, blockTypeItem, selectParentNodeItem as selectParentNodeItemPM } from "prosemirror-menu";
import { YMap } from "yjs/dist/src/internals";
import { wrapInList } from "prosemirror-schema-list";
import { Subject } from 'rxjs';
import { canInsert, createCustomIcon } from './common-methods';
import { insertFigure, insertImageItem, insertSpecialSymbolItem, insertDiagramItem, insertVideoItem, addMathBlockMenuItem, addMathInlineMenuItem, insertLinkItem, addAnchorTagItem, insertTableItem } from './menu-dialogs';
import { MarkType, Node, NodeType, DOMParser, DOMSerializer, Mark, Fragment } from 'prosemirror-model';
//@ts-ignore
import { undo as undoLocalHistory,redo as redoLocalHistory} from '../prosemirror-history/history.js'
//@ts-ignore
import * as Y from 'yjs'
import { D } from '@angular/cdk/keycodes';

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

function markItem(markType: MarkType, options: any) {
    let passedOptions: any = {
        active(state: EditorState) { return markActive(state, markType) },
        enable: true
    }
    for (let prop in options) passedOptions[prop] = options[prop]
    return cmdItem(toggleMark(markType), passedOptions)
}

function wrapListItem(nodeType: NodeType, options: any) {
    return cmdItem(wrapInList(nodeType, options.attrs), options)
}

function cmdItem(cmd: any, options: any) {
    let passedOptions: any = {
        label: options.title,
        run: cmd
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
    if (mark.length >= 1) allowed = false;
    return allowed;
};

const toggleUnderline = markItem(schema.marks.underline, { title: "Toggle underline", icon: createCustomIcon('underline.svg', 14) })

const toggleStrong = markItem(schema.marks.strong, { title: "Toggle strong style", icon: createCustomIcon('Text2.svg', 12) })

const toggleEm = markItem(schema.marks.em, { title: "Toggle emphasis", icon: createCustomIcon('italic.svg') })

const toggleCode = markItem(schema.marks.code, { title: "Toggle code font", icon: icons.code })

const wrapBulletList = wrapListItem(schema.nodes.bullet_list, {
    title: "Wrap in bullet list",
    icon: createCustomIcon('bullets.svg', 25, 25)
})

const wrapOrderedList = wrapListItem(schema.nodes.ordered_list, {
    title: "Wrap in ordered list",
    icon: createCustomIcon('numbering.svg', 16)
})

const wrapBlockQuote = wrapItem(schema.nodes.blockquote, {
    title: "Wrap in block quote",
    icon: icons.blockquote
})

const makeParagraph = blockTypeItem(schema.nodes.paragraph, {
    title: "Change to paragraph",
    label: "Plain"
})

const makeCodeBlock = blockTypeItem(schema.nodes.code_block, {
    title: "Change to code block",
    label: "Code"
})

let headingsObj: any = {};

for (let i = 1; i <= 10; i++)
    headingsObj["makeHead" + i] = blockTypeItem(schema.nodes.heading, {
        title: "Change to heading " + i,
        label: "Level " + i,
        attrs: { level: i }
    })
const headings = headingsObj;

const insertHorizontalRule = new MenuItem({
    title: "Insert horizontal rule",
    label: "Horizontal rule",
    enable(state) { return canInsert(state, schema.nodes.horizontal_rule) },
    run(state, dispatch) { dispatch(state.tr.replaceSelectionWith(schema.nodes.horizontal_rule.create())) }
})

const undoYJS = new MenuItem({
    icon: undoIcon,
    label: "undo",
    enable(state) { return true },
    //@ts-ignore
    run: undo
})

const redoYJS = new MenuItem({
    icon: redoIcon,
    label: "redo",
    enable(state) { return true },
    //@ts-ignore
    run: redo
})

const toggleSuperscriptItem = markItem(schema.marks.superscript, { title: 'Toggle superscript', icon: createCustomIcon('superscript.svg', 20) })

const toggleSubscriptItem = markItem(schema.marks.subscript, { title: 'Toggle subscript', icon: createCustomIcon('subscript.svg', 20) })

const setAlignLeft = new MenuItem({
    title: 'Align element to left',
    // @ts-ignore
    run: setAlignment('set-align-left'),
    enable(state) { return true },
    select: (state) => { return setAlignment('set-align-left')(state) },
    icon: createCustomIcon('align2.svg', 20)
})

const setAlignCenter = new MenuItem({
    title: 'Align element to center',
    // @ts-ignore
    run: setAlignment('set-align-center'),
    enable(state) { return true },
    select: (state) => { return setAlignment('set-align-left')(state) },
    icon: createCustomIcon('align.svg', 18)
})
const setAlignRight = new MenuItem({
    title: 'Align element to right',
    // @ts-ignore
    run: setAlignment('set-align-right'),
    enable(state) { return true },
    select: (state) => { return setAlignment('set-align-right')(state) },
    icon: createCustomIcon('align1.svg', 20)
})

const addCommentMenuItem = (ydoc: Y.Doc, addCommentSubject: Subject<any>, sectionId: string) => {
    let commentsMap = ydoc.getMap('comments')
    return new MenuItem({
        title: 'Add an annotation',
        // @ts-ignore
        run: createComment(commentsMap, addCommentSubject, sectionId),
        enable(state: EditorState) {
            /* let {from,to,empty} = state.selection ;
            let text = state.doc.textBetween(from,to)
            if(!empty&&from!==to){
                addCommentSubject.next({type:'commentAllownes',sectionId,allow:true,text})
            }else{
                addCommentSubject.next({type:'commentAllownes',sectionId,allow:false,text})
            } */
            return isCommentAllowed(state)
        },
        icon: addCommentIcon
    });
}

const getLinkMenuItem = new MenuItem({
    title: 'Get link',
    // @ts-ignore
    run: getLinkMenuItemRun,
    enable(state) { return true },
    icon: createCustomIcon('link.svg', 19)
})



const functionItem = new MenuItem({
    title: 'Function',
    // @ts-ignore
    run: getLinkMenuItemRun,
    enable(state) { return true },
    icon: createCustomIcon('symbols.svg', 20)
})

const highLightMenuItem = new MenuItem({
    title: 'HighLight text',
    // @ts-ignore
    run: getLinkMenuItemRun,
    enable(state) { return true },
    icon: createCustomIcon('highlight.svg')
})

function insertPB(state: EditorState, dispatch: (p: Transaction) => void, view: EditorView, event: Event){
  let pbnode = state.schema.nodes.page_break
  let selectionEnd = state.selection.to;

  let pbinsertplace = 0;
  state.doc.forEach((node,offset,i)=>{
    if(selectionEnd>pbinsertplace){
      pbinsertplace=offset+node.nodeSize;
    }
  })
  let text = state.schema.text('Page Break')
  let pageBreak = pbnode.create({contenteditableNode:false},text)
  if(state.doc.nodeAt(pbinsertplace)?.type.name == 'page_break'){
    dispatch(state.tr.replaceWith(pbinsertplace,pbinsertplace+state.doc.nodeAt(pbinsertplace)?.nodeSize!+1,Fragment.empty))
  }else{
    dispatch(state.tr.insert(pbinsertplace,pageBreak))
  }
}

function canInsertPB(state:EditorState){
  return true;
}

const insertPageBreak = new MenuItem({
  title: 'Insert page break after this block node.',
  run:insertPB,
  enable:canInsertPB,
  icon: createCustomIcon('pagebreak.svg',20,20,0,3)
})

const footnoteMenuItem = new MenuItem({
    title: 'Add Footnote',
    // @ts-ignore
    run: getLinkMenuItemRun,
    enable(state) { return true },
    icon: createCustomIcon('insert.svg', 20)
})

const spellCheckMenuItem = new MenuItem({
    title: 'Turn off/on spellcheck',
    // @ts-ignore
    run: getLinkMenuItemRun,
    enable(state) { return true },
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
        let r = toggleMark(noneditableMark)(state,dispatch)
        /* let text = schema.text('dwq', [noneditableMark.create()])
        let newTr = state.tr.replaceSelectionWith(text)
        view.dispatch(newTr); */
        return true&&r;
    } catch (e) {
        console.error(e);
    }
}

export let undoItemPM = new MenuItem({
  title: "Undo last change",
  run: undoLocalHistory,
  enable: state => undoLocalHistory(state),
  icon: undoIcon
})

// :: MenuItem
// Menu item for the `redo` command.
export let redoItemPM = new MenuItem({
  title: "Redo last undone change",
  run: redoLocalHistory,
  enable: state => redoLocalHistory(state),
  icon: redoIcon
})

const logNodesMenuItem = new MenuItem({
    title: 'Log Nodes', label: 'LogDocNode',
    // @ts-ignore
    run: logNodesItemRun,
    enable(state) { return true },
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
    'toggleEm': toggleEm,
    'toggleCode': toggleCode,
    'insertImage': insertImageItem,
    'wrapBulletList': wrapBulletList,
    'wrapOrderedList': wrapOrderedList,
    'wrapBlockQuote': wrapBlockQuote,
    'makeParagraph': makeParagraph,
    'makeCodeBlock': makeCodeBlock,
    'headings': headings,
    'insertPageBreak':insertPageBreak,
    'insertHorizontalRule': insertHorizontalRule,
    /* 'undoItem': undoYJS,
    'redoItem': redoYJS, */
    'undoItem': undoItemPM,
    'redoItem': redoItemPM,
    'undoItemPM': undoItemPM,
    'redoItemPM': redoItemPM,
    'toggleSuperscriptItem': toggleSuperscriptItem,
    'toggleSubscriptItem': toggleSubscriptItem,
    'insertLink': insertLinkItem,
    'setAlignLeft': setAlignLeft,
    'setAlignCenter': setAlignCenter,
    'setAlignRight': setAlignRight,
    'insertVideoItem': insertVideoItem,
    'addCommentMenuItem': addCommentMenuItem,
    'selectParentNodeItem': selectParentNodeItemPM,
    'tableMenu': tableMenu,
    'alignMenu': [setAlignLeft, setAlignCenter, setAlignRight],
    'addAnchorTagMenuItem': addAnchorTagItem,
    'insertSpecialSymbol': insertSpecialSymbolItem,
    'getLinkMenuItem': getLinkMenuItem,
    'starMenuItem': functionItem,
    'highLightMenuItem': highLightMenuItem,
    'footnoteMenuItem': footnoteMenuItem,
    'spellCheckMenuItem': spellCheckMenuItem,
    'toggleUnderline': toggleUnderline,
    'logNodesMenuItem': logNodesMenuItem,
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
