import { Injectable } from '@angular/core';
import { ServiceShare } from '@app/editor/services/service-share.service';
import { basicJournalArticleData, jsonSchemaForCSL, possibleReferenceTypes, exampleCitation, lang as langData, reference, formioAuthorsDataGrid, formIOTextFieldTemplate  } from '../data/data';

//@ts-ignore
import { CSL } from '../data/citeproc.js'
import { uuidv4 } from 'lib0/random';
import { basicStyle, styles } from '../data/styles';
@Injectable({
  providedIn: 'root'
})
export class CslService {
  references: any;
  currentRef: any;

  getRefsArray(){
    this.references = this.serviceShare.YdocService!.referenceCitationsMap!.get('references');
    console.log(this.references);
    console.log(Object.values(this.references));
    return Object.values(this.references)
  }
  citeprocSys = {

    // Given a language tag in RFC-4646 form, this method retrieves the
    // locale definition file.  This method must return a valid *serialized*
    // CSL locale. (In other words, an blob of XML as an unparsed string.  The
    // processor will fail on a native XML object or buffer).
    retrieveLocale: (lang: any) => {
      /* xhr.open('GET', 'locales-' + lang + '.xml', false);
      xhr.send(null); */
      return langData;
    },

    // Given an identifier, this retrieves one citation item.  This method
    // must return a valid CSL-JSON object.
    retrieveItem: (id: any) => {
      return this.currentRef;
    }
  };
  citeproc: any
  constructor(private serviceShare:ServiceShare) {
    this.serviceShare.shareSelf('CslService',CslService)
    this.citeproc = new CSL.Engine(this.citeprocSys, /* pensoftStyle */basicStyle);
    //var citationStrings = this.citeproc.processCitationCluster(exampleCitation[0], exampleCitation[1], [])[1];
    this.serviceShare.YdocService!.ydocStateObservable.subscribe((event) => {
      if (event == 'docIsBuild') {
        this.references = this.serviceShare.YdocService!.referenceCitationsMap!.get('references');
      }
    });

  }

  genereteCitationStr(style:string,ref:any){
    this.currentRef = ref.referenceData;
    this.citeproc = new CSL.Engine(this.citeprocSys, styles[style]/* basicStyle */);
    this.citeproc.updateItems([ref.referenceData.id]);
    let newCitationId = uuidv4()
    let citationData :any= this.generateCitation([ {
      "citationID": newCitationId,
      "citationItems": [{ "id": ref.referenceData.id }],
      "properties": { "noteIndex": 1 }
    },[],[]]);
    let bibliography = this.citeproc.makeBibliography();
    citationData.bibliography = bibliography;
    return citationData;
  }

  deleteCitation(id:string){
    this.references = this.serviceShare.YdocService!.referenceCitationsMap!.get('references');
    delete this.references[id]
    this.serviceShare.YdocService!.referenceCitationsMap!.set('references',this.references)
  }

  addReference(ref:any){
    let newRefObj:any = {};
    this.currentRef = ref;
    let newCitationId = uuidv4()
    this.citeproc = new CSL.Engine(this.citeprocSys, /* pensoftStyle */basicStyle);
    this.citeproc.updateItems([ref.id]);
    let citationData = this.generateCitation([ {
      "citationID": newCitationId,
      "citationItems": [{ "id": ref.id }],
      "properties": { "noteIndex": 1 }
    },[],[]]);
    let bibliography = this.citeproc.makeBibliography();
    newRefObj.basicCitation = {
      data:citationData,
      citatId:newCitationId,
      style:'basicStyle'
    }
    console.log(bibliography[1][0]);
    newRefObj.basicCitation.bobliography = bibliography[1][0];
    newRefObj.referenceData = ref;

    this.references = this.serviceShare.YdocService!.referenceCitationsMap!.get('references');
    this.references[ref.id] = newRefObj;
    this.serviceShare.YdocService!.referenceCitationsMap!.set('references',this.references)
  }
  /*
  [{
    "citationID": "SXDNEKR5AD",
    "citationItems": [{ "id": "2kntpabvm2" }],
    "properties": { "noteIndex": 1 }
  },[],[]]
  */
  generateCitation(citationObj:any[]){
    let html = this.citeproc.previewCitationCluster(citationObj[0], citationObj[1], [],'html');
    let text = this.citeproc.previewCitationCluster(citationObj[0], citationObj[1], [],'text');
    let rtx = this.citeproc.previewCitationCluster(citationObj[0], citationObj[1], [],'rtf');
    return {html,text,rtx}
  }
}
