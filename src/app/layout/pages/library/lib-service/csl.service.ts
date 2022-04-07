import { Injectable } from '@angular/core';
import { ServiceShare } from '@app/editor/services/service-share.service';
import { basicJournalArticleData, jsonSchemaForCSL, possibleReferenceTypes, exampleCitation, pensoftStyle, lang as langData, reference, formioAuthorsDataGrid, formIOTextFieldTemplate, basicStyle } from '../data/data';

//@ts-ignore
import { CSL } from '../data/citeproc.js'
@Injectable({
  providedIn: 'root'
})
export class CslService {
  references: any

  getRefsArray(){
    this.references = this.serviceShare.YdocService!.referenceCitationsMap!.get('references');
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
      return this.references[id];
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
  addReference(ref:any){
    this.references = this.serviceShare.YdocService!.referenceCitationsMap!.get('references');
    this.references[ref.id] = ref;
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
