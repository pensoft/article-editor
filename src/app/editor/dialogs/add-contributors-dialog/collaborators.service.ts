import { Injectable } from '@angular/core';
import { editorContainer } from '@app/editor/services/prosemirror-editors.service';
import { ServiceShare } from '@app/editor/services/service-share.service';
import { schema } from '@app/editor/utils/Schema';
import { Subscription } from 'rxjs';
import { authorListData } from './add-contributors-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class CollaboratorsService {

  affiliationsSymbolMapping = ["‡", "§", "|", "¶", "#", "¤", "«", "»", "˄", "˅", "¦", "ˀ", "ˁ", "₵", "ℓ", "₰", "₱", "₳", "₴", "₣", "₮", "₦", "₭", "₲", "‽", "₩", "₸"]

  collaboratorstSubs: Subscription
  collaborators
  authorsList
  headEditorContainer?:editorContainer

  constructor(
    private serviceShare:ServiceShare,
  ) {
    this.serviceShare.shareSelf('CollaboratorsService',this)
  }

  getAffiliationKey(affiliation){
    return affiliation.affiliation + affiliation.city + affiliation.country;
  }

  renderMetaNodeInHeadEditor(collaborators:any[],authors:authorListData[]){

    let authorsAndSymbols:{collaborator:any,affiliationSymbols:string[]}[] = []
    let affiliationsFound:{key:string,displayTxt:string,symbol:string}[] = [];

    authors.forEach((author)=>{
      let prop
      let val
      if(author.authorId){
        prop = 'id';
        val = author.authorId;
      }else{
        prop = 'email';
        val = author.authorEmail;
      }

      let collaborator = collaborators.find((user)=>user[prop] == val);
      if(collaborator){
        let userAffiliationSymbols = []
        if(collaborator.affiliations){
          collaborator.affiliations.forEach((affiliation)=>{
            let affilKey = this.getAffiliationKey(affiliation);
            let affilSymbol
            if(!affiliationsFound.some(x=>x.key == affilKey)){
              affilSymbol = this.affiliationsSymbolMapping[affiliationsFound.length]
              affiliationsFound.push({key:affilKey,displayTxt:`${affilSymbol} ${affiliation.affiliation}, ${affiliation.city}, ${affiliation.country}`,symbol:affilSymbol})
            }else{
              affilSymbol = affiliationsFound.find(x=>x.key == affilKey).symbol
            }
            userAffiliationSymbols.push(affilSymbol);
          })
        }
        authorsAndSymbols.push({collaborator,affiliationSymbols:userAffiliationSymbols});
      }else{
        console.error('No callaborator with '+prop+" "+val);
      }
    })

    let pmNode = this.getPmNode(authorsAndSymbols,affiliationsFound);

    let view = this.headEditorContainer.editorView;
    let endOfOldDoc = view.state.doc.content.size;
    view.dispatch(view.state.tr.replaceWith(0,endOfOldDoc,pmNode))
  }

  getPmNode(authorsAndSymbols,affiliationsFound){
    let coAuthors = authorsAndSymbols.filter(x=>x.collaborator.role == 'Co-author');
    let ns = schema.nodes
    let doc = ns.doc.create({},[
      ns.paragraph.create({},authorsAndSymbols.reduce((prev,curr,index)=>{
        let userNodes = []
        userNodes.push(schema.text(curr.collaborator.name))
        curr.affiliationSymbols.length>0?userNodes.push(schema.text(curr.affiliationSymbols.join(','),[schema.mark('superscript')])):undefined
        if(index>0){
          prev.push(schema.text(', '),...userNodes)
        }else{
          prev.push(...userNodes)
        }
        return prev
      },[])),
      ...affiliationsFound.reduce((prev,curr)=>{
        let par = ns.paragraph.create({},schema.text(curr.displayTxt));
        prev.push(par)
        return prev
      },[]),
      ns.inline_block_container.create({},[
        ns.form_field.create({},[
          ns.paragraph.create({},[
            schema.text('Corresponding author: '),...coAuthors.reduce((prev,curr,index)=>{
              let nameText = schema.text(curr.collaborator.name+' ');
              let email = schema.text("("+curr.collaborator.email+")",[schema.mark('link',{href:'mailto: '+curr.collaborator.email})]);
              if(index>0){
                prev.push(schema.text(', '),nameText,email)
              }else{
                prev.push(nameText,email)
              }
              return prev
            },[])
          ]),
          ns.paragraph.create({},[
            schema.text('© '),...authorsAndSymbols.reduce((prev,curr,index)=>{
              let nameText = schema.text(curr.collaborator.name);
              if(index>0){
                prev.push(schema.text(', '),nameText)
              }else{
                prev.push(nameText)
              }
              return prev
            },[])
          ]),
          ns.paragraph.create({},[
            schema.text('Citation:')
          ])
        ]),
        ns.form_field.create({},[
          ns.paragraph.create({},[
            ns.image.create({src:'./assets/img/open_access_icon_colour.svg'})
          ]),
        ])
      ])
    ])
    return doc
  }

  renderHeadEditor = (htmlEl:any)=>{
    this.headEditorContainer = this.serviceShare.ProsemirrorEditorsService.renderDocumentHeadEditor(htmlEl);
    this.collaboratorstSubs = this.serviceShare.YdocService.collaboratorsSubject.subscribe((data) => {
      this.setCollaboratorsData(data)
    });
    this.setCollaboratorsData(this.serviceShare.YdocService.collaborators.get('collaborators'))
  }

  setCollaboratorsData(collaboratorsData: any) {
    setTimeout(() => {
      this.collaborators = collaboratorsData.collaborators
      this.authorsList = this.serviceShare.YdocService.collaborators.get('authorsList');
      this.renderArticleMetaNode()
    }, 30)
  }

  renderArticleMetaNode(){
    this.renderMetaNodeInHeadEditor(this.collaborators,this.authorsList);
  }

  ngOnDestroy(): void {
    if (this.collaboratorstSubs) {
      this.collaboratorstSubs.unsubscribe()
    }
  }
}
