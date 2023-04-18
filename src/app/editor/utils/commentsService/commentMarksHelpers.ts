import { editorContainersObj } from "@app/editor/services/prosemirror-editors.service";
import { EditorView } from "prosemirror-view";

export function checkAllEditorsIfMarkOfCommentExists(edContainers:editorContainersObj,commentId:string):boolean{
  let exists = false
  Object.keys(edContainers).forEach((sectionid)=>{
    let view = edContainers[sectionid].editorView;
    if(checkEditorIfMarkOfCommentExists(view,commentId)){
      exists = true
    }
  })
  return exists
}

export function checkEditorIfMarkOfCommentExists(view:EditorView,commentId):boolean{
  let doc = view.state.doc;
  let docend = doc.content.size;
  let exists = false;
  doc.nodesBetween(0,docend,(node,pos,parent,i)=>{
    if(node.marks.filter((mark)=>mark.type.name == 'comment').length>0){
      exists = true
    }
  })
  return exists
}

export interface userDataInComment {
  created_at: string
  email: string
  email_verified_at: string
  id: String
  name: string
  userColor:string
  userContrastColor:string
  updated_at: string
}

export interface ydocComment {
  comment: string
  date: number
  id: string
  userData: userDataInComment
}

export interface commentYdocSave { commentReplies: ydocComment[], initialComment: ydocComment }
export interface ydocCommentsObj { [key: string]: commentYdocSave }

export interface commentData {
  pmDocStartPos: number,
  pmDocEndPos: number,
  domTop: number,
  commentTxt: string,
  section: string,
  commentAttrs: any,
  commentMarkId: string,
  selected: boolean,
}