import { HttpBackend, HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ServiceShare } from '@app/editor/services/service-share.service';
import { YdocService } from '@app/editor/services/ydoc.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { genereteNewReference } from './refs-funcs';
import { APP_CONFIG, AppConfig } from '@core/services/app-config';


@Injectable({
  providedIn: 'root'
})
export class RefsApiService {

  _httpBackend:HttpClient

  constructor(
    private _http: HttpClient,
    private serviceShare: ServiceShare,
    private ydocService: YdocService,
    private HttpBackend: HttpBackend,
    @Inject(APP_CONFIG) private config: AppConfig,
    ) {
    this._httpBackend =   new HttpClient(this.HttpBackend)
    serviceShare.shareSelf('RefsApiService',this)
  }

  mapRefItems(refItemsFromBackend: any) {
    let refs: any[] = [];
    let ydocRefs = this.serviceShare.YdocService.referenceCitationsMap?JSON.parse(JSON.stringify(this.serviceShare.YdocService.referenceCitationsMap?.get('localRefs'))):{};
    if(!this.serviceShare.YdocService.articleData){
      return refs
    }
    refItemsFromBackend.data.forEach((refFromBackend: any) => {
      let ref = ydocRefs[refFromBackend.id]||refFromBackend
      let newRef: any = {};
      newRef.user = refFromBackend.user
      let formGroup = this.serviceShare.FormBuilderService.buildFormGroupFromSchema(new FormGroup({}),refFromBackend.reference_definition.schema)
      let oldData = JSON.parse(JSON.stringify(ref.data))
      formGroup.patchValue(ref.data)
      ref.data = formGroup.value
      let newData = JSON.parse(JSON.stringify(ref.data))
      Object.keys(oldData).forEach((key)=>{
        if(newData[key]){
          ref.data[key] = oldData[key];
        }
      })
      newRef.refType = {
        formIOSchema: ref.reference_definition.schema,
        label: ref.reference_definition.title,
        name: ref.reference_definition.type,
        type: ref.reference_definition.type,
        refTypeId: ref.reference_definition.id,
        /* last_modified:Date.now(), */
        last_modified: ref.reference_definition.updated_at ? new Date(ref.reference_definition.updated_at).getTime() : (new Date("Thu Jan 01 1970 02:00:01 GMT+0200 (Eastern European Standard Time)")).getTime()
      }
      if (this.serviceShare.YdocService.articleData.layout.citation_style) {
        let style = this.serviceShare.YdocService.articleData.layout.citation_style
        newRef.refStyle = {
          "name": style.name,
          "label": style.title,
          "style": style.style_content,
          "last_modified": (new Date(style.style_updated).getTime())
        }
      } else {
        newRef.refStyle = {
          "name": "harvard-cite-them-right",
          "label": "Harvard Cite Them Right",
          "style": "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<style xmlns=\"http://purl.org/net/xbiblio/csl\" class=\"in-text\" version=\"1.0\" demote-non-dropping-particle=\"sort-only\" default-locale=\"en-GB\">\n<info>\n\n    <title>Cite Them Right 11th edition - Harvard</title>\n    <id>http://www.zotero.org/styles/harvard-cite-them-right</id>\n    <link href=\"http://www.zotero.org/styles/harvard-cite-them-right\" rel=\"self\"/>\n    <link href=\"http://www.zotero.org/styles/harvard-cite-them-right-10th-edition\" rel=\"template\"/>\n    <link href=\"http://www.citethemrightonline.com/\" rel=\"documentation\"/>\n    <author>\n      <name>Patrick O'Brien</name>\n    </author>\n    <category citation-format=\"author-date\"/>\n    <category field=\"generic-base\"/>\n    <summary>Harvard according to Cite Them Right, 11th edition.</summary>\n    <updated>2021-09-01T07:43:59+00:00</updated>\n    <rights license=\"http://creativecommons.org/licenses/by-sa/3.0/\">This work is licensed under a Creative Commons Attribution-ShareAlike 3.0 License</rights>\n  </info>\n  <locale xml:lang=\"en-GB\">\n    <terms>\n      <term name=\"editor\" form=\"short\">\n        <single>ed.</single>\n        <multiple>eds</multiple>\n      </term>\n      <term name=\"editortranslator\" form=\"verb\">edited and translated by</term>\n      <term name=\"edition\" form=\"short\">edn.</term>\n    </terms>\n  </locale>\n  <macro name=\"editor\">\n    <choose>\n      <if type=\"chapter paper-conference\" match=\"any\">\n        <names variable=\"container-author\" delimiter=\", \" suffix=\", \">\n          <name and=\"text\" initialize-with=\". \" delimiter=\", \" sort-separator=\", \" name-as-sort-order=\"all\"/>\n        </names>\n        <choose>\n          <if variable=\"container-author\" match=\"none\">\n            <names variable=\"editor translator\" delimiter=\", \">\n              <name and=\"text\" initialize-with=\".\" name-as-sort-order=\"all\"/>\n              <label form=\"short\" prefix=\" (\" suffix=\")\"/>\n            </names>\n          </if>\n        </choose>\n      </if>\n    </choose>\n  </macro>\n  <macro name=\"secondary-contributors\">\n    <choose>\n      <if type=\"chapter paper-conference\" match=\"none\">\n        <names variable=\"editor translator\" delimiter=\". \">\n          <label form=\"verb\" text-case=\"capitalize-first\" suffix=\" \"/>\n          <name and=\"text\" initialize-with=\".\"/>\n        </names>\n      </if>\n      <else-if variable=\"container-author\" match=\"any\">\n        <names variable=\"editor translator\" delimiter=\". \">\n          <label form=\"verb\" text-case=\"capitalize-first\" suffix=\" \"/>\n          <name and=\"text\" initialize-with=\". \" delimiter=\", \"/>\n        </names>\n      </else-if>\n    </choose>\n  </macro>\n  <macro name=\"author\">\n    <names variable=\"author\">\n      <name and=\"text\" delimiter-precedes-last=\"never\" initialize-with=\".\" name-as-sort-order=\"all\"/>\n      <label form=\"short\" prefix=\" (\" suffix=\")\"/>\n      <et-al font-style=\"italic\"/>\n      <substitute>\n        <names variable=\"editor\"/>\n        <names variable=\"translator\"/>\n        <choose>\n          <if type=\"article-newspaper article-magazine\" match=\"any\">\n            <text variable=\"container-title\" text-case=\"title\" font-style=\"italic\"/>\n          </if>\n          <else>\n            <text macro=\"title\"/>\n          </else>\n        </choose>\n      </substitute>\n    </names>\n  </macro>\n  <macro name=\"author-short\">\n    <names variable=\"author\">\n      <name form=\"short\" and=\"text\" delimiter=\", \" delimiter-precedes-last=\"never\" initialize-with=\". \"/>\n      <et-al font-style=\"italic\"/>\n      <substitute>\n        <names variable=\"editor\"/>\n        <names variable=\"translator\"/>\n        <choose>\n          <if type=\"article-newspaper article-magazine\" match=\"any\">\n            <text variable=\"container-title\" text-case=\"title\" font-style=\"italic\"/>\n          </if>\n          <else>\n            <text macro=\"title\"/>\n          </else>\n        </choose>\n      </substitute>\n    </names>\n  </macro>\n  <macro name=\"access\">\n    <choose>\n      <if variable=\"DOI\">\n        <text variable=\"DOI\" prefix=\"doi:\"/>\n      </if>\n      <else-if variable=\"URL\">\n        <text term=\"available at\" suffix=\": \" text-case=\"capitalize-first\"/>\n        <text variable=\"URL\"/>\n        <group prefix=\" (\" delimiter=\": \" suffix=\")\">\n          <text term=\"accessed\" text-case=\"capitalize-first\"/>\n          <date form=\"text\" variable=\"accessed\">\n            <date-part name=\"day\"/>\n            <date-part name=\"month\"/>\n            <date-part name=\"year\"/>\n          </date>\n        </group>\n      </else-if>\n    </choose>\n  </macro>\n  <macro name=\"number-volumes\">\n    <choose>\n      <if variable=\"volume\" match=\"none\">\n        <group delimiter=\" \" prefix=\"(\" suffix=\")\">\n          <text variable=\"number-of-volumes\"/>\n          <label variable=\"volume\" form=\"short\" strip-periods=\"true\"/>\n        </group>\n      </if>\n    </choose>\n  </macro>\n  <macro name=\"title\">\n    <choose>\n      <if type=\"bill book legal_case legislation motion_picture report song thesis webpage graphic\" match=\"any\">\n        <group delimiter=\". \">\n          <group delimiter=\" \">\n            <group delimiter=\" \">\n              <text variable=\"title\" font-style=\"italic\"/>\n              <text variable=\"medium\" prefix=\"[\" suffix=\"]\"/>\n            </group>\n            <text macro=\"number-volumes\"/>\n          </group>\n          <text macro=\"edition\"/>\n        </group>\n      </if>\n      <else>\n        <text variable=\"title\" form=\"long\" quotes=\"true\"/>\n      </else>\n    </choose>\n  </macro>\n  <macro name=\"publisher\">\n    <choose>\n      <if type=\"thesis\">\n        <group delimiter=\". \">\n          <text variable=\"genre\"/>\n          <text variable=\"publisher\"/>\n        </group>\n      </if>\n      <else-if type=\"report\">\n        <group delimiter=\". \">\n          <group delimiter=\" \">\n            <text variable=\"genre\"/>\n            <text variable=\"number\"/>\n          </group>\n          <group delimiter=\": \">\n            <text variable=\"publisher-place\"/>\n            <text variable=\"publisher\"/>\n          </group>\n        </group>\n      </else-if>\n      <else-if type=\"article-journal article-newspaper article-magazine\" match=\"none\">\n        <group delimiter=\" \">\n          <group delimiter=\", \">\n            <choose>\n              <if type=\"speech\" variable=\"event\" match=\"any\">\n                <text variable=\"event\" font-style=\"italic\"/>\n              </if>\n            </choose>\n            <group delimiter=\": \">\n              <text variable=\"publisher-place\"/>\n              <text variable=\"publisher\"/>\n            </group>\n          </group>\n          <group prefix=\"(\" suffix=\")\" delimiter=\", \">\n            <text variable=\"collection-title\"/>\n            <text variable=\"collection-number\"/>\n          </group>\n        </group>\n      </else-if>\n    </choose>\n  </macro>\n  <macro name=\"year-date\">\n    <choose>\n      <if variable=\"issued\">\n        <date variable=\"issued\">\n          <date-part name=\"year\"/>\n        </date>\n        <text variable=\"year-suffix\"/>\n      </if>\n      <else>\n        <text term=\"no date\"/>\n        <text variable=\"year-suffix\" prefix=\" \"/>\n      </else>\n    </choose>\n  </macro>\n  <macro name=\"locator\">\n    <choose>\n      <if type=\"article-journal\">\n        <text variable=\"volume\"/>\n        <text variable=\"issue\" prefix=\"(\" suffix=\")\"/>\n      </if>\n    </choose>\n  </macro>\n  <macro name=\"published-date\">\n    <choose>\n      <if type=\"article-newspaper article-magazine post-weblog speech\" match=\"any\">\n        <date variable=\"issued\">\n          <date-part name=\"day\" suffix=\" \"/>\n          <date-part name=\"month\" form=\"long\"/>\n        </date>\n      </if>\n    </choose>\n  </macro>\n  <macro name=\"pages\">\n    <choose>\n      <if type=\"chapter paper-conference article-journal article article-magazine article-newspaper book review review-book report\" match=\"any\">\n        <group delimiter=\" \">\n          <label variable=\"page\" form=\"short\"/>\n          <text variable=\"page\"/>\n        </group>\n      </if>\n    </choose>\n  </macro>\n  <macro name=\"container-title\">\n    <choose>\n      <if variable=\"container-title\">\n        <group delimiter=\". \">\n          <group delimiter=\" \">\n            <text variable=\"container-title\" font-style=\"italic\"/>\n            <choose>\n              <if type=\"article article-journal\" match=\"any\">\n                <choose>\n                  <if match=\"none\" variable=\"page volume\">\n                    <text value=\"Preprint\" prefix=\"[\" suffix=\"]\"/>\n                  </if>\n                </choose>\n              </if>\n            </choose>\n          </group>\n          <text macro=\"edition\"/>\n        </group>\n      </if>\n    </choose>\n  </macro>\n  <macro name=\"edition\">\n    <choose>\n      <if is-numeric=\"edition\">\n        <group delimiter=\" \">\n          <number variable=\"edition\" form=\"ordinal\"/>\n          <text term=\"edition\" form=\"short\" strip-periods=\"true\"/>\n        </group>\n      </if>\n      <else>\n        <text variable=\"edition\"/>\n      </else>\n    </choose>\n  </macro>\n  <macro name=\"container-prefix\">\n    <choose>\n      <if type=\"chapter paper-conference\" match=\"any\">\n        <text term=\"in\"/>\n      </if>\n    </choose>\n  </macro>\n  <citation et-al-min=\"4\" et-al-use-first=\"1\" disambiguate-add-year-suffix=\"true\" disambiguate-add-names=\"true\" disambiguate-add-givenname=\"true\" collapse=\"year\">\n    <sort>\n      <key macro=\"year-date\"/>\n    </sort>\n    <layout prefix=\"(\" suffix=\")\" delimiter=\"; \">\n      <group delimiter=\", \">\n        <group delimiter=\", \">\n          <text macro=\"author-short\"/>\n          <text macro=\"year-date\"/>\n        </group>\n        <group>\n          <label variable=\"locator\" form=\"short\" suffix=\" \"/>\n          <text variable=\"locator\"/>\n        </group>\n      </group>\n    </layout>\n  </citation>\n  <bibliography and=\"text\" et-al-min=\"4\" et-al-use-first=\"1\">\n    <sort>\n      <key macro=\"author\"/>\n      <key macro=\"year-date\"/>\n      <key variable=\"title\"/>\n    </sort>\n    <layout suffix=\".\">\n      <group delimiter=\". \">\n        <group delimiter=\" \">\n          <text macro=\"author\"/>\n          <text macro=\"year-date\" prefix=\"(\" suffix=\")\"/>\n          <group delimiter=\", \">\n            <text macro=\"title\"/>\n            <group delimiter=\" \">\n              <text macro=\"container-prefix\"/>\n              <text macro=\"editor\"/>\n              <text macro=\"container-title\"/>\n            </group>\n          </group>\n        </group>\n        <text macro=\"secondary-contributors\"/>\n        <text macro=\"publisher\"/>\n      </group>\n      <group delimiter=\", \" prefix=\", \">\n        <text macro=\"locator\"/>\n        <text macro=\"published-date\"/>\n        <text macro=\"pages\"/>\n      </group>\n      <text macro=\"access\" prefix=\". \"/>\n    </layout>\n  </bibliography>\n</style>",
          "last_modified": 1649665699315
        }
      }
      let refFormated = genereteNewReference(newRef.refType, {id: ref.id, ...ref.data})
      let basicCitation = this.serviceShare.CslService.getBasicCitation(refFormated, newRef.refStyle.style)
      newRef.refData = {
        last_modified: (new Date(ref.updated_at).getTime()),
        formioData: ref.data,
        basicCitation,
        referenceData: refFormated
      }
      // let refGlobalDataUUID1 = newRef.refData.referenceData.id
      let refGlobalDataUUID2 = 'ref'+newRef.refData.referenceData.id
      newRef.globaldatauuid = refGlobalDataUUID2
      newRef.isOwner = function(reqSub:string){
        return this.user.id==reqSub
      }
      this.serviceShare.addDataToGlobalObj(refGlobalDataUUID2,newRef)
      // this.serviceShare.CasbinGlobalObjectsService.addItemToGlobalContainer('ReferenceItem',refGlobalDataUUID1,newRef);
      refs.push(newRef);
    })
    return refs
  }

  mapRefTypes(refTypesFromBackend: any) {
    let mapedTypes: any[] = []
    refTypesFromBackend.data.forEach((type: any) => {
      let refType = {
        refTypeId: type.id,
        formIOScheme: type.schema,
        label: type.title,
        name: type.type,
        type: type.type,
        // last_modified:Date.now()
        last_modified: type.updated_at ? new Date(type.updated_at).getTime() : (new Date("Thu Jan 01 1970 02:00:01 GMT+0200 (Eastern European Standard Time)")).getTime()
      }
      mapedTypes.push(refType)
    })
    return mapedTypes
  }

  getReferenceBackend(id:number){
    let obs = this._httpBackend.get(`${this.config.apiUrl}/references/items/`+id).pipe(map((data: any) => {
      [data.data].forEach(item => {
        if (item.issued && item.issued.hasOwnProperty('date-parts')) {
          item.issued = item.issued['date-parts'].join('-');
        }
      })
      let refs = this.mapRefItems({data:[data.data]})
      return refs[0]
    }))
    return obs;
  }

  getReferenceById(id:number,fromcasbin?:true){
    let obs = this._http.get(`${this.config.apiUrl}/references/items/${id}`,fromcasbin?{headers:{
      "sendFromCasbin":"true"
    }}:{}).pipe(map((data: any) => {
      [data.data].forEach(item => {
        if (item.issued && item.issued.hasOwnProperty('date-parts')) {
          item.issued = item.issued['date-parts'].join('-');
        }
      })
      let refs = this.mapRefItems({data:[data.data]})
      return refs[0]
    }))
    return obs;
  }

  getReferences() {
    let obs = this._http.get(`${this.config.apiUrl}/references/items`,{params:{page:1,pageSize:100}}).pipe(map((data: any) => {
      data.data.forEach(item => {
        if (item.issued && item.issued.hasOwnProperty('date-parts')) {
          item.issued = item.issued['date-parts'].join('-');
        }
      })
      let refs = this.mapRefItems(data)
      return {data: refs}
    }))
    // this._http.get('https://something/references').pipe(map((data) => {
    //   return data
    // }));
    obs.subscribe((refsRes: any) => {
      this.serviceShare.ReferencePluginService?.setRefs(refsRes.data);
    })
    return obs;
  }

  getReferenceTypes() {
    return this._http.get(`${this.config.apiUrl}/references/definitions`).pipe(map((data) => {
      return {data: this.mapRefTypes(data)}
    }))
    // return this._http.get('https://something/references/types').pipe(map((data) => {
    //   return data
    // }));
  }

  getStyles() {
    /* this._http.get(API_URL+'/references/styles').subscribe((data)=>{
    }) */
    // TODO: Mincho, please check this! Are we need it?
    return this._http.get('https://something/references/styles1').pipe(map((data) => {
      return data
    }));
    ;
  }

  createReference(ref: any, formIOData?: any, refType?: any) {

    if (formIOData && refType) {
      return this._http.post(`${this.config.apiUrl}/references/items`, {
        "title": formIOData.title,
        data: formIOData,
        reference_definition_id: refType.refTypeId
      }).pipe(map((data: any) => {
        return {data: this.mapRefItems({data: [data.data]})}
      }))
    }
    console.error('Nothing passed')
  }

  editReference(ref: any, global: boolean, formIOData: any, refType: any,useOldTime?:true) {
    let ydocRefs = this.serviceShare.YdocService.referenceCitationsMap?.get('localRefs');
    if (global) {
      if(ydocRefs[ref.refData.referenceData.id]){
        ydocRefs[ref.refData.referenceData.id] = undefined
        this.serviceShare.YdocService.referenceCitationsMap?.set('localRefs',ydocRefs);
      }
      return this._http.put(`${this.config.apiUrl}/references/items/` + ref.refData.referenceData.id, {
        "title": formIOData.title,
        data: formIOData,
        reference_definition_id: refType.refTypeId
      }).pipe(map((data: any) => {
        return {data: this.mapRefItems({data: [data.data]})}
      }));
    } else {
      let observable = new Observable(subscriber => {
        this._http.get(`${this.config.apiUrl}/references/definitions/${refType.refTypeId}`).subscribe((refDefData:any)=>{
          let def = refDefData.data

          let localRef = {
            "updated_at": useOldTime?ref.refData.last_modified:Date.now(),
            "id": ref.refData.referenceData.id,
            "title": formIOData.title,
            "data": formIOData,
            "reference_definition_id": refType.refTypeId,
            "reference_definition": def,
          }
          ydocRefs[ref.refData.referenceData.id] = localRef;
          this.serviceShare.YdocService.referenceCitationsMap?.set('localRefs',ydocRefs);
          subscriber.next({message:'localRefAdded',data:this.mapRefItems({data: [localRef]})});
        })
      });
      return observable
    }
  }

  deleteReference(ref: any) {
    let ydocRefs = this.serviceShare.YdocService.referenceCitationsMap?.get('localRefs');
    if(ydocRefs[ref.refData.referenceData.id]){
      ydocRefs[ref.refData.referenceData.id] = undefined
      this.serviceShare.YdocService.referenceCitationsMap?.set('localRefs',ydocRefs);
    }
    return this._http.delete(`${this.config.apiUrl}/references/items/${ref.refData.referenceData.id}`)
  }
};
