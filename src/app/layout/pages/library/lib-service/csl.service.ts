import { Injectable } from '@angular/core';
import { ServiceShare } from '@app/editor/services/service-share.service';
import { basicJournalArticleData, jsonSchemaForCSL, possibleReferenceTypes, exampleCitation, lang as langData, reference, formioAuthorsDataGrid, formIOTextFieldTemplate } from '../data/data';

//@ts-ignore
import { CSL } from '../data/citeproc.js'
import { uuidv4 } from 'lib0/random';
import { basicStyle, styles1 } from '../data/styles';
import { HttpClient } from '@angular/common/http';
import { RefsApiService } from './refs-api.service';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { Node } from 'prosemirror-model';
import { MatDialog } from '@angular/material/dialog';
import { ReferenceEditComponent } from '../reference-edit/reference-edit.component';
import { genereteNewReference } from './refs-funcs';
import { map } from 'rxjs/operators';
export let harvardStyle = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<style xmlns=\"http://purl.org/net/xbiblio/csl\" class=\"in-text\" version=\"1.0\" demote-non-dropping-particle=\"sort-only\" default-locale=\"en-GB\">\n<info>\n\n    <title>Cite Them Right 11th edition - Harvard</title>\n    <id>http://www.zotero.org/styles/harvard-cite-them-right</id>\n    <link href=\"http://www.zotero.org/styles/harvard-cite-them-right\" rel=\"self\"/>\n    <link href=\"http://www.zotero.org/styles/harvard-cite-them-right-10th-edition\" rel=\"template\"/>\n    <link href=\"http://www.citethemrightonline.com/\" rel=\"documentation\"/>\n    <author>\n      <name>Patrick O'Brien</name>\n    </author>\n    <category citation-format=\"author-date\"/>\n    <category field=\"generic-base\"/>\n    <summary>Harvard according to Cite Them Right, 11th edition.</summary>\n    <updated>2021-09-01T07:43:59+00:00</updated>\n    <rights license=\"http://creativecommons.org/licenses/by-sa/3.0/\">This work is licensed under a Creative Commons Attribution-ShareAlike 3.0 License</rights>\n  </info>\n  <locale xml:lang=\"en-GB\">\n    <terms>\n      <term name=\"editor\" form=\"short\">\n        <single>ed.</single>\n        <multiple>eds</multiple>\n      </term>\n      <term name=\"editortranslator\" form=\"verb\">edited and translated by</term>\n      <term name=\"edition\" form=\"short\">edn.</term>\n    </terms>\n  </locale>\n  <macro name=\"editor\">\n    <choose>\n      <if type=\"chapter paper-conference\" match=\"any\">\n        <names variable=\"container-author\" delimiter=\", \" suffix=\", \">\n          <name and=\"text\" initialize-with=\". \" delimiter=\", \" sort-separator=\", \" name-as-sort-order=\"all\"/>\n        </names>\n        <choose>\n          <if variable=\"container-author\" match=\"none\">\n            <names variable=\"editor translator\" delimiter=\", \">\n              <name and=\"text\" initialize-with=\".\" name-as-sort-order=\"all\"/>\n              <label form=\"short\" prefix=\" (\" suffix=\")\"/>\n            </names>\n          </if>\n        </choose>\n      </if>\n    </choose>\n  </macro>\n  <macro name=\"secondary-contributors\">\n    <choose>\n      <if type=\"chapter paper-conference\" match=\"none\">\n        <names variable=\"editor translator\" delimiter=\". \">\n          <label form=\"verb\" text-case=\"capitalize-first\" suffix=\" \"/>\n          <name and=\"text\" initialize-with=\".\"/>\n        </names>\n      </if>\n      <else-if variable=\"container-author\" match=\"any\">\n        <names variable=\"editor translator\" delimiter=\". \">\n          <label form=\"verb\" text-case=\"capitalize-first\" suffix=\" \"/>\n          <name and=\"text\" initialize-with=\". \" delimiter=\", \"/>\n        </names>\n      </else-if>\n    </choose>\n  </macro>\n  <macro name=\"author\">\n    <names variable=\"author\">\n      <name and=\"text\" delimiter-precedes-last=\"never\" initialize-with=\".\" name-as-sort-order=\"all\"/>\n      <label form=\"short\" prefix=\" (\" suffix=\")\"/>\n      <et-al font-style=\"italic\"/>\n      <substitute>\n        <names variable=\"editor\"/>\n        <names variable=\"translator\"/>\n        <choose>\n          <if type=\"article-newspaper article-magazine\" match=\"any\">\n            <text variable=\"container-title\" text-case=\"title\" font-style=\"italic\"/>\n          </if>\n          <else>\n            <text macro=\"title\"/>\n          </else>\n        </choose>\n      </substitute>\n    </names>\n  </macro>\n  <macro name=\"author-short\">\n    <names variable=\"author\">\n      <name form=\"short\" and=\"text\" delimiter=\", \" delimiter-precedes-last=\"never\" initialize-with=\". \"/>\n      <et-al font-style=\"italic\"/>\n      <substitute>\n        <names variable=\"editor\"/>\n        <names variable=\"translator\"/>\n        <choose>\n          <if type=\"article-newspaper article-magazine\" match=\"any\">\n            <text variable=\"container-title\" text-case=\"title\" font-style=\"italic\"/>\n          </if>\n          <else>\n            <text macro=\"title\"/>\n          </else>\n        </choose>\n      </substitute>\n    </names>\n  </macro>\n  <macro name=\"access\">\n    <choose>\n      <if variable=\"DOI\">\n        <text variable=\"DOI\" prefix=\"doi:\"/>\n      </if>\n      <else-if variable=\"URL\">\n        <text term=\"available at\" suffix=\": \" text-case=\"capitalize-first\"/>\n        <text variable=\"URL\"/>\n        <group prefix=\" (\" delimiter=\": \" suffix=\")\">\n          <text term=\"accessed\" text-case=\"capitalize-first\"/>\n          <date form=\"text\" variable=\"accessed\">\n            <date-part name=\"day\"/>\n            <date-part name=\"month\"/>\n            <date-part name=\"year\"/>\n          </date>\n        </group>\n      </else-if>\n    </choose>\n  </macro>\n  <macro name=\"number-volumes\">\n    <choose>\n      <if variable=\"volume\" match=\"none\">\n        <group delimiter=\" \" prefix=\"(\" suffix=\")\">\n          <text variable=\"number-of-volumes\"/>\n          <label variable=\"volume\" form=\"short\" strip-periods=\"true\"/>\n        </group>\n      </if>\n    </choose>\n  </macro>\n  <macro name=\"title\">\n    <choose>\n      <if type=\"bill book legal_case legislation motion_picture report song thesis webpage graphic\" match=\"any\">\n        <group delimiter=\". \">\n          <group delimiter=\" \">\n            <group delimiter=\" \">\n              <text variable=\"title\" font-style=\"italic\"/>\n              <text variable=\"medium\" prefix=\"[\" suffix=\"]\"/>\n            </group>\n            <text macro=\"number-volumes\"/>\n          </group>\n          <text macro=\"edition\"/>\n        </group>\n      </if>\n      <else>\n        <text variable=\"title\" form=\"long\" quotes=\"true\"/>\n      </else>\n    </choose>\n  </macro>\n  <macro name=\"publisher\">\n    <choose>\n      <if type=\"thesis\">\n        <group delimiter=\". \">\n          <text variable=\"genre\"/>\n          <text variable=\"publisher\"/>\n        </group>\n      </if>\n      <else-if type=\"report\">\n        <group delimiter=\". \">\n          <group delimiter=\" \">\n            <text variable=\"genre\"/>\n            <text variable=\"number\"/>\n          </group>\n          <group delimiter=\": \">\n            <text variable=\"publisher-place\"/>\n            <text variable=\"publisher\"/>\n          </group>\n        </group>\n      </else-if>\n      <else-if type=\"article-journal article-newspaper article-magazine\" match=\"none\">\n        <group delimiter=\" \">\n          <group delimiter=\", \">\n            <choose>\n              <if type=\"speech\" variable=\"event\" match=\"any\">\n                <text variable=\"event\" font-style=\"italic\"/>\n              </if>\n            </choose>\n            <group delimiter=\": \">\n              <text variable=\"publisher-place\"/>\n              <text variable=\"publisher\"/>\n            </group>\n          </group>\n          <group prefix=\"(\" suffix=\")\" delimiter=\", \">\n            <text variable=\"collection-title\"/>\n            <text variable=\"collection-number\"/>\n          </group>\n        </group>\n      </else-if>\n    </choose>\n  </macro>\n  <macro name=\"year-date\">\n    <choose>\n      <if variable=\"issued\">\n        <date variable=\"issued\">\n          <date-part name=\"year\"/>\n        </date>\n        <text variable=\"year-suffix\"/>\n      </if>\n      <else>\n        <text term=\"no date\"/>\n        <text variable=\"year-suffix\" prefix=\" \"/>\n      </else>\n    </choose>\n  </macro>\n  <macro name=\"locator\">\n    <choose>\n      <if type=\"article-journal\">\n        <text variable=\"volume\"/>\n        <text variable=\"issue\" prefix=\"(\" suffix=\")\"/>\n      </if>\n    </choose>\n  </macro>\n  <macro name=\"published-date\">\n    <choose>\n      <if type=\"article-newspaper article-magazine post-weblog speech\" match=\"any\">\n        <date variable=\"issued\">\n          <date-part name=\"day\" suffix=\" \"/>\n          <date-part name=\"month\" form=\"long\"/>\n        </date>\n      </if>\n    </choose>\n  </macro>\n  <macro name=\"pages\">\n    <choose>\n      <if type=\"chapter paper-conference article-journal article article-magazine article-newspaper book review review-book report\" match=\"any\">\n        <group delimiter=\" \">\n          <label variable=\"page\" form=\"short\"/>\n          <text variable=\"page\"/>\n        </group>\n      </if>\n    </choose>\n  </macro>\n  <macro name=\"container-title\">\n    <choose>\n      <if variable=\"container-title\">\n        <group delimiter=\". \">\n          <group delimiter=\" \">\n            <text variable=\"container-title\" font-style=\"italic\"/>\n            <choose>\n              <if type=\"article article-journal\" match=\"any\">\n                <choose>\n                  <if match=\"none\" variable=\"page volume\">\n                    <text value=\"Preprint\" prefix=\"[\" suffix=\"]\"/>\n                  </if>\n                </choose>\n              </if>\n            </choose>\n          </group>\n          <text macro=\"edition\"/>\n        </group>\n      </if>\n    </choose>\n  </macro>\n  <macro name=\"edition\">\n    <choose>\n      <if is-numeric=\"edition\">\n        <group delimiter=\" \">\n          <number variable=\"edition\" form=\"ordinal\"/>\n          <text term=\"edition\" form=\"short\" strip-periods=\"true\"/>\n        </group>\n      </if>\n      <else>\n        <text variable=\"edition\"/>\n      </else>\n    </choose>\n  </macro>\n  <macro name=\"container-prefix\">\n    <choose>\n      <if type=\"chapter paper-conference\" match=\"any\">\n        <text term=\"in\"/>\n      </if>\n    </choose>\n  </macro>\n  <citation et-al-min=\"4\" et-al-use-first=\"1\" disambiguate-add-year-suffix=\"true\" disambiguate-add-names=\"true\" disambiguate-add-givenname=\"true\" collapse=\"year\">\n    <sort>\n      <key macro=\"year-date\"/>\n    </sort>\n    <layout prefix=\"(\" suffix=\")\" delimiter=\"; \">\n      <group delimiter=\", \">\n        <group delimiter=\", \">\n          <text macro=\"author-short\"/>\n          <text macro=\"year-date\"/>\n        </group>\n        <group>\n          <label variable=\"locator\" form=\"short\" suffix=\" \"/>\n          <text variable=\"locator\"/>\n        </group>\n      </group>\n    </layout>\n  </citation>\n  <bibliography and=\"text\" et-al-min=\"4\" et-al-use-first=\"1\">\n    <sort>\n      <key macro=\"author\"/>\n      <key macro=\"year-date\"/>\n      <key variable=\"title\"/>\n    </sort>\n    <layout suffix=\".\">\n      <group delimiter=\". \">\n        <group delimiter=\" \">\n          <text macro=\"author\"/>\n          <text macro=\"year-date\" prefix=\"(\" suffix=\")\"/>\n          <group delimiter=\", \">\n            <text macro=\"title\"/>\n            <group delimiter=\" \">\n              <text macro=\"container-prefix\"/>\n              <text macro=\"editor\"/>\n              <text macro=\"container-title\"/>\n            </group>\n          </group>\n        </group>\n        <text macro=\"secondary-contributors\"/>\n        <text macro=\"publisher\"/>\n      </group>\n      <group delimiter=\", \" prefix=\", \">\n        <text macro=\"locator\"/>\n        <text macro=\"published-date\"/>\n        <text macro=\"pages\"/>\n      </group>\n      <text macro=\"access\" prefix=\". \"/>\n    </layout>\n  </bibliography>\n</style>";
import { YdocService } from "@app/editor/services/ydoc.service";
import { editorContainer, editorContainersObj } from '@app/editor/services/prosemirror-editors.service';

@Injectable({
  providedIn: 'root'
})
export class CslService {
  refsInYdoc: any;
  currentRef: any;

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
      if(this.currentRef) {
        return this.currentRef;
      } else {
        return this.refsInYdoc[id].ref;
      }
    }
  };
  citeproc: any
  constructor(
    private serviceShare: ServiceShare,
    private _http: HttpClient,
    private refsAPI: RefsApiService,
    public dialog: MatDialog,
    private ydocService: YdocService
  ) {
    this.serviceShare.shareSelf('CslService', this)    
    this.citeproc = new CSL.Engine(
      this.citeprocSys, 
      /* pensoftStyle */
      this.serviceShare.YdocService.articleData.layout.citation_style ? 
      this.serviceShare.YdocService.articleData.layout.citation_style.style_content
      :
      harvardStyle
    );
  }

  sortCitations(newRefs: any) {
    let sortedReferences = {};
    this.refsInYdoc = newRefs;
    
    const sortedRefsIds = this.citeproc.updateItems(Object.keys(this.refsInYdoc));

    sortedRefsIds.forEach(id => {
      sortedReferences[id] = this.refsInYdoc[id];
    })

    return sortedReferences
  }

  genereteCitationStr(style: string, referenceData: any) {

    this.citeproc = new CSL.Engine(
      this.citeprocSys, 
      /* pensoftStyle */
      this.serviceShare.YdocService.articleData.layout.citation_style ? 
      this.serviceShare.YdocService.articleData.layout.citation_style.style_content
      :
      harvardStyle
    );
    this.citeproc.updateItems([referenceData.id]);
    
    let newCitationId = uuidv4()
    let citationData: any = this.generateCitation([{
      "citationID": newCitationId,
      "citationItems": [{ "id": referenceData.id }],
      "properties": { "noteIndex": 1 }
    }, [], []]);
    let bibliography = this.citeproc.makeBibliography();
    citationData.htmlBibliography = bibliography[1][0]
    citationData.bibliography = bibliography[1][0];
    let contDiv = document.createElement('div');
    contDiv.innerHTML = citationData.bibliography;
    citationData.bibliography = contDiv.textContent!.endsWith('\n') ? contDiv.textContent!.slice(0, contDiv.textContent!.length - 2) : contDiv.textContent!
    if (!citationData.bibliography.startsWith(" ")) {
      citationData.bibliography = " " + citationData.bibliography
    }
    if (!citationData.bibliography.endsWith(" ")) {
      citationData.bibliography = citationData.bibliography + " "
    }
    return citationData;
  }

  getBasicCitation(ref: any, refStyle: string) {
    let newCitationId = uuidv4()
    this.currentRef = ref;

    this.citeproc = new CSL.Engine(
      this.citeprocSys, 
      /* pensoftStyle */
      this.serviceShare.YdocService.articleData.layout.citation_style ? 
      this.serviceShare.YdocService.articleData.layout.citation_style.style_content
      :
      harvardStyle
    );
    this.citeproc.updateItems([ref.id]);

    let citationData = [
      this.generateCitation([{
      "citationID": newCitationId,
      "citationItems": [{ "id": ref.id }],
      "properties": { "noteIndex": 1, "mode": "author-only" }
    }, [], []]), 
    this.generateCitation([{
      "citationID": newCitationId,
      "citationItems": [{ "id": ref.id }],
      "properties": { "noteIndex": 1, "mode": "composite" }
    }, [], []]),
    this.generateCitation([{
      "citationID": newCitationId,
      "citationItems": [{ "id": ref.id }],
      "properties": { "noteIndex": 1, "mode": "suppress-author" }
    }, [], []])
  ];

    let bibliography = this.citeproc.makeBibliography();
    this.currentRef = undefined;
    return {
      bibliography: bibliography[1][0],
      data: citationData,
      citatId: newCitationId,
      style: 'basicStyle'
    }
  }

  addReference(ref: any, refType: any, refStyle: any, formioSubmission: any, oldRef?: any, globally?: boolean) {
    if (oldRef) {
      return this.refsAPI.editReference(oldRef, globally!, formioSubmission, refType).pipe(map((data) => {
        return data
      }));
    } else {
      return this.refsAPI.createReference({}, formioSubmission, refType).pipe(map((data) => {
        return data
      }));
    }
  }

  generateCitation(citationObj: any[]) {
    let html = " " + this.citeproc.previewCitationCluster(citationObj[0], citationObj[1], [], 'html') + " ";
    let text = " " + this.citeproc.previewCitationCluster(citationObj[0], citationObj[1], [], 'text') + " ";
    let rtx = " " + this.citeproc.previewCitationCluster(citationObj[0], citationObj[1], [], 'rtf') + " ";
    return { html, text, rtx }
  }

  generateNumericStyle = (index: number) => ({ htm: " [" + index + "] ", text: " [" + index + "] ", rtx: " [" + index + "] " });

  generateLabelStyle = (name: string, year: string) => ({ htm: ` [${name}${year}] `, text: ` [${name}${year}] `, rtx: ` [${name}${year}] ` });

    //   “author-date” - e.g. “… (Doe, 1999)”
    // “author” - e.g. “… (Doe)”
    // “numeric” - e.g. “… [1]”
    // “label” - e.g. “… [doe99]”
    // “note” - the citation appears as a footnote or endnote
  

  editReferenceThroughPMEditor(node: Node, sectionId: string) {
    this.serviceShare.ProsemirrorEditorsService.spinSpinner();
    let attrs = JSON.parse(JSON.stringify(node.attrs));
    this.refsAPI.getReferences().subscribe((refsRes: any) => {
      let refsInYdoc = this.serviceShare.YdocService.referenceCitationsMap.get('refsAddedToArticle');
      let ref = refsInYdoc[attrs.referenceData.refId]
      if (ref) {
        this.refsAPI.getReferenceTypes().subscribe((refTypes: any) => {
          this.refsAPI.getStyles().subscribe((refStyles: any) => {
            let referenceStyles = refStyles.data
            let referenceTypesFromBackend = refTypes.data;
            let oldData = { refData: { formioData: ref.formIOData }, refType: ref.refType, refStyle: ref.refStyle,refCiTO:ref.refCiTO }
            const dialogRef = this.dialog.open(ReferenceEditComponent, {
              data: { referenceTypesFromBackend, oldData, referenceStyles },
              panelClass: 'edit-reference-panel',
              width: '960px',
            });
            this.serviceShare.ProsemirrorEditorsService.stopSpinner()
            dialogRef.afterClosed().subscribe((result: any) => {
              if (result) {
                let newRef = genereteNewReference(result.referenceScheme, result.submissionData.data)
                let refObj = { ref: newRef, formIOData: result.submissionData.data };
                let refStyle
                if (
                  this.serviceShare.YdocService.articleData &&
                  this.serviceShare.YdocService.articleData.layout.citation_style) {
                  let style = this.serviceShare.YdocService.articleData.layout.citation_style
                  refStyle = {
                    "name": style.name,
                    "label": style.title,
                    "style": style.style_content,
                    "last_modified": (new Date(style.style_updated).getTime())
                  }
                } else {
                  refStyle = {
                    "name": "harvard-cite-them-right",
                    "label": "Harvard Cite Them Right",
                    "style": harvardStyle,
                    "last_modified": 1649665699315
                  }
                }
                refObj.ref.id = attrs.referenceData.refId
                let refBasicCitation:any = this.serviceShare.CslService.getBasicCitation(refObj.ref, refStyle.style);
                let container = document.createElement('div');
                container.innerHTML = refBasicCitation.bibliography;
                refBasicCitation.textContent = container.textContent;
                let refInstance = {
                  ...refObj,
                  citation: refBasicCitation,
                  refType: result.referenceScheme,
                  ref_last_modified: Date.now(),
                  refCiTO:result.refCiTO,
                  refStyle
                }
                let refId = attrs.referenceData.refId;
                let allRefs = this.ydocService.referenceCitationsMap.get('refsAddedToArticle');
                allRefs[refId] = refInstance
                this.ydocService.referenceCitationsMap.set('refsAddedToArticle',allRefs);
                this.serviceShare.EditorsRefsManagerService.updateRefsInEndEditorAndTheirCitations()
              }
            })
          })
        })
      } else {
        this.serviceShare.ProsemirrorEditorsService.stopSpinner();
        console.error('The reference for this citation does not exist anymore.')
      }
    })
  }
}
