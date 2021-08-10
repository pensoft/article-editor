import { ElementRef } from "@angular/core"
import crel from "crelt"
import { read } from "fs"
import {EditorState, Plugin, Transaction} from "prosemirror-state"
import {Decoration, DecorationSet, EditorView} from "prosemirror-view"
import { YArray, YMap } from "yjs/dist/src/internals"
import { colors } from "./userSpec"

class CommentDecoration {
    public commentsIds: number[]
    constructor(public from:number,public to:number,public decorationID:number,commentId:number ) {
        this.from = from
        this.to = to
        this.decorationID = decorationID
        this.commentsIds = [commentId]
    }

    hasComment(commentID:number):boolean{
        return this.commentsIds.includes(commentID);
    }

    addComment(commentID:number){
        this.commentsIds.push(commentID);
    }
    
}

class Comment {
    constructor(public decorationID:number,public commentID:number,public text:string){
    }
}

function decorate(commentDecoration:CommentDecoration) {
    return Decoration.inline(
        commentDecoration.from, 
        commentDecoration.to, 
        {class: "comment",style:"background-color:lightblue"}, 
        {decId:commentDecoration.decorationID}
    )
}

export interface ycommentsSpec {
    decorationsArray : CommentDecoration[],
    senderId : number,
    comments : Comment[],
}

class CommentState {

    constructor(public ycomments:YMap<ycommentsSpec>,public userID:number) {
    }

    /* findComment(id) {
        let current = this.decos.find()
        for (let i = 0; i < current.length; i++)
            if (current[i].spec.comment.id == id) return current[i]
    } */

    getCommentsBetween(from:number,to:number) :{comments:Comment[],from:number,to:number}[]{
        let data = this.ycomments.get('data')
        let decorationsArray = data?.decorationsArray
        //console.log(data);
        if(decorationsArray == undefined) return []
        let comments = data?.comments || []
        let foundComments : {comments:Comment[],from:number,to:number}[] = [];
        decorationsArray.forEach((value)=>{
            if(value.from<to&&value.from>from||value.to<to&&value.to>from){
                let foundCommnet :{comments:Comment[],from:number,to:number} = {comments:[],from:0,to:0}
                foundCommnet.from = value.from
                foundCommnet.to = value.to
                value.commentsIds.forEach(commID=>{
                    comments.forEach((comment)=>{
                        if(comment.commentID==commID){
                            foundCommnet.comments.push(comment);
                        }
                    })
                })
                foundComments.push(foundCommnet)
            }
        })
        //let commentsData = {comments:commentsAtPosition,from:from,to:to}
        return foundComments
    }

    addNewComment(from:number,to:number,text:string){
        let from1 = from
        let to1 = to
        let newDecoration = true

        let decorationId = randomID()
        let commentId = randomID()

        let newComment = new Comment(decorationId,commentId,text);

        let yCommentsData = this.ycomments.get('data') || {decorationsArray:[],senderId:this.userID,comments:[]}
        yCommentsData.decorationsArray.forEach((commentDecoration,index,array)=>{
            let ready = false
            if(!newDecoration){
                return
            }
            if(commentDecoration.from<=to1&&commentDecoration.from>=from1){
                array[index].from = from1
                newDecoration = false
                if(commentDecoration.to>to1){
                     to1 = array[index].to 
                     ready= true
                }
            }
            if(commentDecoration.to<=to1&&commentDecoration.to>=from1&&!ready){
                array[index].to = to1
                newDecoration = false
                if(commentDecoration.from<from1){
                    from1 = array[index].from
                    ready= true
                }
            }
            if(to1<=commentDecoration.to&&to1>=commentDecoration.from&&!ready){
                to1 = array[index].to 
                newDecoration = false
                if(commentDecoration.from<from1){
                    from1 = array[index].from
                    
                }
            }
            if(!newDecoration){
                newComment.decorationID = commentDecoration.decorationID
                array[index].commentsIds.push(commentId)
                return
            }
        })
        if(newDecoration){
            yCommentsData.decorationsArray.push(new CommentDecoration(from,to,decorationId,commentId));
        }
        yCommentsData.comments.push(newComment)
        this.ycomments.set('data',yCommentsData)
        return yCommentsData.decorationsArray
    }

    deleteComment(comment:Comment){
        let data = this.ycomments.get('data')
        let decorationsArray:CommentDecoration[] = data?.decorationsArray|| []
        let commentsArray:Comment[] = data?.comments||[]
        
        let emptyDecoration = false;
        let decorationIndex :number ;

        decorationsArray.forEach((decoration,index,array)=>{
            if(decoration.decorationID == comment.decorationID){
                let commentIndex = decoration.commentsIds.indexOf(comment.commentID);
                array[index].commentsIds.splice(commentIndex,1);
                if(array[index].commentsIds.length == 0){
                    emptyDecoration = true;
                    decorationIndex = index;
                }
            }
        })

        if(emptyDecoration){
            decorationsArray.splice(decorationIndex!,1);
        }

        let commentIndexInCommentArray :number
        commentsArray.forEach((com,index)=>{
            if(com.commentID == comment.commentID){
                commentIndexInCommentArray = index
            }
        })
        commentsArray.splice(commentIndexInCommentArray!,1)
        this.ycomments.set('data',{decorationsArray,comments:commentsArray,senderId:this.userID})
        return decorationsArray
    }

    moveDecorations(start:number,deleted:number,added:number){
        let data = this.ycomments.get('data')
        if(start == 0){
            return
        }
        data?.decorationsArray.forEach((commDecor,index,array)=>{
            if(commDecor.from>start-1){
                array[index].from -= deleted
                array[index].from += added
            }
            if(commDecor.to>start){
                array[index].to -= deleted
                array[index].to += added
            }
        })

        let newData = {decorationsArray : data?.decorationsArray||[],
            senderId : this.userID,
            comments : data?.comments||[]}
        this.ycomments.set('data',newData)
    }

    editComment(comment:Comment,newText:string):CommentDecoration[]{
        let data = this.ycomments.get('data');
        let comments :Comment[]= data?.comments || []

        comments.forEach((com,id,array)=>{
            if(com.commentID == comment.commentID){
                array[id].text = newText;
            }
        });

        this.ycomments.set('data',{
            decorationsArray : data?.decorationsArray||[],
            senderId : this.userID,
            comments : comments})
        
        return data?.decorationsArray||[];

    }

    apply(tr:Transaction) {
        let action = tr.getMeta(commentPlugin), actionType = action && action.type
        if (!action && !tr.docChanged) return this
        /* if (actionType == "receive") base = base.receive(action, tr.doc)
        
        let decos = base.decos, unsent = base.unsent */
        if(tr.mapping.maps[0] != undefined){
            let changeArray = tr.mapping.maps[0]?.toString().slice(1,tr.mapping.maps[0]?.toString().length-1).split(',')

            
            if(changeArray.length==3){
                this.moveDecorations(+changeArray[0],+changeArray[1],+changeArray[2]);
            }
        }
        decorationSet(tr.doc,this.ycomments.get('data')?.decorationsArray)

        if (actionType == "newComment") {
            /* {
                type: "newComment",
                from: sel.from,
                to: sel.to,
                text:text
            } */
            let CommentsDecorations = this.addNewComment(action.from,action.to,action.text)

            decorationSet(tr.doc,CommentsDecorations)
            
        } else if (actionType == "deleteComment") {
            let comment :Comment = action.comment
            let CommentsDecorations = this.deleteComment(comment)
            
            decorationSet(tr.doc,CommentsDecorations)
        }else if(actionType == "editComment"){
            let newCommentText = prompt("Edit commnent:", action.comment.text)
            let CommentsDecorations = this.editComment(action.comment as Comment,newCommentText!);
            decorationSet(tr.doc,CommentsDecorations)
        }
        
        return new CommentState(this.ycomments,this.userID);
    }

    /* receive({version, events, sent}, doc) {
        let set = this.decos
        for (let i = 0; i < events.length; i++) {
            let event = events[i]
            if (event.type == "delete") {
                let found = this.findComment(event.id)
                if (found) set = set.remove([found])
            } else { // "create"
                if (!this.findComment(event.id))
                    set = set.add(doc, [deco(event.from, event.to, new Comment(event.text, event.id))])
            }
        }
        return new CommentState(version, set, this.unsent.slice(sent))
    }

    unsentEvents() {
        let result = []
        for (let i = 0; i < this.unsent.length; i++) {
            let action = this.unsent[i]
            if (action.type == "newComment") {
                let found = this.findComment(action.comment.id)
                if (found) result.push({
                    type: "create", id: action.comment.id,
                    from: found.from, to: found.to,
                    text: action.comment.text
                })
            } else {
                result.push({type: "delete", id: action.comment.id})
            }
        }
        return result
    } */

    static init(config:any) {
        let ycomments : YMap<ycommentsSpec> =  config.comments.ycommets
        let userID :number = config.comments.userId
        let commentsData = ycomments.get('data');
        let decorations = commentsData?.decorationsArray.map(commentDecoration => {
            return decorate(commentDecoration);
        }) 
        if(decorations != undefined){
            DecorationSet.create(config.doc,decorations)
        }
        return new CommentState(ycomments,userID)
    }
}

function decorationSet(doc:any,commentDecorations?:CommentDecoration[]):DecorationSet{
    let decorations = commentDecorations?.map(commentDecoration => {
        return decorate(commentDecoration);
    }) 
    if(decorations != undefined&&commentDecorations!=undefined){
        return  DecorationSet.create(doc,decorations)
    }else{
        return DecorationSet.empty
    }
}

export const commentPlugin = new Plugin({
    state: {
        init: CommentState.init,
        apply(tr, prev) {
            return prev.apply(tr)
        }
    },
    props: {
        decorations(state) {
            return decorationSet(state.doc,this.getState(state).ycomments.get('data')?.decorationsArray)
        }
    }
})

function randomID() {
    return Math.floor(Math.random() * 0xffffffff)
}

// Command for adding an annotation

export const addAnnotation = function (state:EditorState, dispatch?:(tr:Transaction)=>boolean) {
    let sel = state.selection
    if (sel.empty) return true
    if (dispatch) {
        let text = prompt("Annotation text", "")
        if (text)
            dispatch(state.tr.setMeta(commentPlugin, {
                type: "newComment",
                from: sel.from,
                to: sel.to,
                text:text
            }))
    }
    return true
}

export const annotationIcon = {
    width: 1024, height: 1024,
    path: "M512 219q-116 0-218 39t-161 107-59 145q0 64 40 122t115 100l49 28-15 54q-13 52-40 98 86-36 157-97l24-21 32 3q39 4 74 4 116 0 218-39t161-107 59-145-59-145-161-107-218-39zM1024 512q0 99-68 183t-186 133-257 48q-40 0-82-4-113 100-262 138-28 8-65 12h-2q-8 0-15-6t-9-15v-0q-1-2-0-6t1-5 2-5l3-5t4-4 4-5q4-4 17-19t19-21 17-22 18-29 15-33 14-43q-89-50-141-125t-51-160q0-99 68-183t186-133 257-48 257 48 186 133 68 183z"
}

// Comment UI

export const commentUI = function (dispatch:any,commentsContainer?:ElementRef,ycomments?:YMap<ycommentsSpec>) {
    return new Plugin({
        view: function(){
            return{
                update:(view:EditorView)=> {
                    return commentTooltip(view,dispatch,commentsContainer,ycomments)
                },
                destroy:()=>{

                }
            }
        }
    })
}

function commentTooltip(view:EditorView,dispatch:any,commentsContainer?:ElementRef,ycomments?:YMap<ycommentsSpec>) {
    let elem = document.getElementsByClassName('ProseMirror ProseMirror-example-setup-style').item(0) as HTMLDivElement
    let bodyRec = document.body.getBoundingClientRect()
    if(elem){
        let elemRect = elem.getBoundingClientRect();
        let editorCoordinatesObj = {
            top:elemRect.top ,
            left:elemRect.left ,
            right:elemRect.right ,
            bottom:elemRect.bottom ,
        }
        //console.log(editorCoordinatesObj)
        let coords={left:elemRect.left+10,top:elemRect.top+10}
        let coords2={left:elemRect.right-14,top:elemRect.bottom-4}
        let startOfEditor = view.posAtCoords(coords);
        let endOfEditor = view.posAtCoords(coords2);
        let containerDiv = commentsContainer?.nativeElement as HTMLDivElement
        if(startOfEditor&&endOfEditor){
            if(commentsContainer?.nativeElement) {
                containerDiv.innerHTML = '';
            }
            let comments = commentPlugin.getState(view.state).getCommentsBetween(startOfEditor.pos,endOfEditor.pos)
            if (!comments.length){
                return null
            } 
            comments.forEach((element)=>{
                let commentsDecorationText = view.state.tr.doc.textBetween(element.from,element.to)
                renderComments(element.comments, dispatch, view.state,commentsContainer,commentsDecorationText)
            })
        }
    }
 
    //console.log(edRec);
    /* let comments = commentPlugin.getState(state).commentsAt(sel.from)
    if(commentsContainer?.nativeElement) {
        commentsContainer.nativeElement.innerHTML = ''
    }
    if (!comments.comments.length){
        return null
    } 
    
    let commentsDecorationText = state.tr.doc.textBetween(comments.from,comments.to)
    renderComments(comments.comments, dispatch, state,commentsContainer,commentsDecorationText) */
    //return DecorationSet.create(state.doc, [Decoration.widget(sel.from, renderComments(comments, dispatch, state))])
    return DecorationSet.empty
}

function renderComments(comments:Comment[], dispatch:any, state:EditorState,commentsContainer?:ElementRef,commentsDecorationText?:string) {
    if(commentsContainer?.nativeElement){
        commentsContainer.nativeElement
        .appendChild(crel("div", {class: "decorationComment",style:"border: solid;margin: 5px;border-radius: 5px;padding: 3px;border-color:rgb(102, 102, 102);"},"Target : ",
        crel("div",{class: "commentTarget",style:"background-color:lightblue"},commentsDecorationText+'\r'),"Comments : ",
            crel("ul", {class: "commentList"},
                comments.map(c => renderComment(c, dispatch, state)))))
    }
}

function renderComment(comment:Comment, dispatch:any, state:EditorState) {
    let Deletebtn = crel("button", {class: "commentDelete", title: "Delete annotation"}, "×")
    let editBtn = crel("button", {class: "commentEdit", title: "Edit annotation"}, crel('img',{width:"18" ,height:"18",src:'https://www.mcicon.com/wp-content/uploads/2020/12/Education_Edit_pencil_1-copy-6.jpg'}))
    editBtn.addEventListener('click',()=>{
        dispatch(state.tr.setMeta(commentPlugin, {type: "editComment", comment}))
    })
    Deletebtn.addEventListener("click", () =>{

        //dispatch({plugin:commentPlugin, type: "deleteComment", comment:comment})
        dispatch(state.tr.setMeta(commentPlugin, {type: "deleteComment", comment}))
    }
    )
    return crel("li", {class: "commentText",style:"border: solid;margin: 5px;border-radius: 5px;padding: 3px;border-color:rgb(204, 204, 204);"}, comment.text, editBtn,Deletebtn)
}
