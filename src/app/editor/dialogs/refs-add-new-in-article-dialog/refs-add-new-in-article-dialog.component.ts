import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ServiceShare } from '@app/editor/services/service-share.service';
import { RefsApiService } from '@app/layout/pages/library/lib-service/refs-api.service';
import { Observable, Subscriber, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, startWith } from 'rxjs/operators';
import { environment } from '@env';
import { genereteNewReference } from '@app/layout/pages/library/lib-service/refs-funcs';

@Component({
  selector: 'app-refs-add-new-in-article-dialog',
  templateUrl: './refs-add-new-in-article-dialog.component.html',
  styleUrls: ['./refs-add-new-in-article-dialog.component.scss']
})
export class RefsAddNewInArticleDialogComponent implements OnInit {

  searchReferencesControl = new FormControl('');
  loading = false;
  searchData: any
  externalSelection: any
  lastSelect: 'external' | 'localRef' | 'none' = 'none';
  filteredOptions: Observable<any[]>;
  lastFilter = null;

  referenceFormControl = new FormControl(null, [Validators.required]);
  referenceTypesFromBackend
  dataSave: any
  formIOSchema: any = undefined;
  referenceForms: FormGroup = new FormGroup({})
  isModified
  isValid

  constructor(
    private refsAPI: RefsApiService,
    public dialogRef: MatDialogRef<RefsAddNewInArticleDialogComponent>,
    private serviceShare: ServiceShare,
    private changeDetectorRef: ChangeDetectorRef,
    private http: HttpClient,
  ) { }

  ngOnInit(): void {

    this.searchReferencesControl.valueChanges.pipe(
      filter(Boolean),
      debounceTime(700),
      distinctUntilChanged(),
    ).subscribe((value: any) => {
      if (this.externalSelection !== value) {
        this.searchExternalRefs(value);
      }
    });
  }

  generateFormIOJSON(type: any) {
    console.log(type);
    this.formIOSchema = undefined;
    this.changeDetectorRef.detectChanges()

    let newFormIOJSON = JSON.parse(JSON.stringify(type.formIOScheme));
    let oldFormIOData = this.dataSave
    newFormIOJSON.components.forEach((component: any) => {
      let val = oldFormIOData ? oldFormIOData[component.key] : undefined;
      if (val) {
        component.defaultValue = val
      }
    })
    setTimeout(() => {
      newFormIOJSON.components = newFormIOJSON.components.filter((el) => { return el.type != 'button' && el.action != "submit" });
      this.formIOSchema = newFormIOJSON;
      this.changeDetectorRef.detectChanges();
    }, 100)
    return
  }
  loadingRefDataFromBackend = false;
  tabChanged(change: MatTabChangeEvent) {
    if (change.index == 1) {
      this.loadingRefDataFromBackend = true;
      this.refsAPI.getReferenceTypes().subscribe((refTypes: any) => {
        this.refsAPI.getStyles().subscribe((refStyles: any) => {
          this.referenceTypesFromBackend = refTypes.data;
          if (!this.referenceFormControl.value) {
            this.referenceFormControl.setValue(this.referenceTypesFromBackend[0]);
          } else {
            this.referenceFormControl.setValue(this.referenceFormControl.value);

          }

          this.loadingRefDataFromBackend = false;
          this.generateFormIOJSON(this.referenceFormControl.value)
        })
      })
    }
  }

  oldSub?: Subscription
  searchExternalRefs(searchText: string) {
    if (this.oldSub) {
      this.oldSub.unsubscribe()
    }
    this.searchData = undefined;
    this.loading = true;
    this.changeDetectorRef.detectChanges()
    this.oldSub = this.http.get(environment.EXTERNAL_REFS_API, {
      responseType: 'text',

      params: {
        search: 'simple',
        text: searchText,
      }
    }).subscribe((data1) => {
      let parsedJson = JSON.parse(data1);
      if (parsedJson.length > 0) {
        this.searchData = parsedJson;
        this.loading = false;
        this.changeDetectorRef.detectChanges()
      }
    })
  }

  select(row: any, lastSelect) {
    this.lastSelect = lastSelect;
    this.externalSelection = row;
    console.log(this.lastSelect, this.externalSelection);
  }

  displayFn(option: any): string {
    if (option) {
      return option?.ref?.title || option?.refData?.referenceData?.title + ' | ' +
        (option?.refData?.formioData?.authors[0] ? (option?.refData?.formioData?.authors[0]?.first || option?.refData?.formioData?.authors[0]?.last || option?.refData?.formioData?.authors[0]?.given) : 'no name') + ' | ' +
        option.refData.referenceData.type;
    }
    return '';
  }

  onSubmit() {
    let newRef = genereteNewReference(this.referenceFormControl.value, this.dataSave)
    let refObj = { ref: newRef, formIOData: this.dataSave };
    this.getRefWithCitation(refObj)
    console.log(newRef);
  }

  onChange(change: any) {
    if (change instanceof Event) {

    } else {
      this.dataSave = change.data;
      this.isModified = change.isModified
      this.isValid = change.isValid
    }
  }

  addReFindItRef() {
    this.getRefWithCitation(this.externalSelection)
  }

  getRefWithCitation(refInfo: { ref: any, formIOData: any }) {
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
        "style": "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<style xmlns=\"http://purl.org/net/xbiblio/csl\" class=\"in-text\" version=\"1.0\" demote-non-dropping-particle=\"sort-only\" default-locale=\"en-GB\">\n<info>\n\n    <title>Cite Them Right 11th edition - Harvard</title>\n    <id>http://www.zotero.org/styles/harvard-cite-them-right</id>\n    <link href=\"http://www.zotero.org/styles/harvard-cite-them-right\" rel=\"self\"/>\n    <link href=\"http://www.zotero.org/styles/harvard-cite-them-right-10th-edition\" rel=\"template\"/>\n    <link href=\"http://www.citethemrightonline.com/\" rel=\"documentation\"/>\n    <author>\n      <name>Patrick O'Brien</name>\n    </author>\n    <category citation-format=\"author-date\"/>\n    <category field=\"generic-base\"/>\n    <summary>Harvard according to Cite Them Right, 11th edition.</summary>\n    <updated>2021-09-01T07:43:59+00:00</updated>\n    <rights license=\"http://creativecommons.org/licenses/by-sa/3.0/\">This work is licensed under a Creative Commons Attribution-ShareAlike 3.0 License</rights>\n  </info>\n  <locale xml:lang=\"en-GB\">\n    <terms>\n      <term name=\"editor\" form=\"short\">\n        <single>ed.</single>\n        <multiple>eds</multiple>\n      </term>\n      <term name=\"editortranslator\" form=\"verb\">edited and translated by</term>\n      <term name=\"edition\" form=\"short\">edn.</term>\n    </terms>\n  </locale>\n  <macro name=\"editor\">\n    <choose>\n      <if type=\"chapter paper-conference\" match=\"any\">\n        <names variable=\"container-author\" delimiter=\", \" suffix=\", \">\n          <name and=\"text\" initialize-with=\". \" delimiter=\", \" sort-separator=\", \" name-as-sort-order=\"all\"/>\n        </names>\n        <choose>\n          <if variable=\"container-author\" match=\"none\">\n            <names variable=\"editor translator\" delimiter=\", \">\n              <name and=\"text\" initialize-with=\".\" name-as-sort-order=\"all\"/>\n              <label form=\"short\" prefix=\" (\" suffix=\")\"/>\n            </names>\n          </if>\n        </choose>\n      </if>\n    </choose>\n  </macro>\n  <macro name=\"secondary-contributors\">\n    <choose>\n      <if type=\"chapter paper-conference\" match=\"none\">\n        <names variable=\"editor translator\" delimiter=\". \">\n          <label form=\"verb\" text-case=\"capitalize-first\" suffix=\" \"/>\n          <name and=\"text\" initialize-with=\".\"/>\n        </names>\n      </if>\n      <else-if variable=\"container-author\" match=\"any\">\n        <names variable=\"editor translator\" delimiter=\". \">\n          <label form=\"verb\" text-case=\"capitalize-first\" suffix=\" \"/>\n          <name and=\"text\" initialize-with=\". \" delimiter=\", \"/>\n        </names>\n      </else-if>\n    </choose>\n  </macro>\n  <macro name=\"author\">\n    <names variable=\"author\">\n      <name and=\"text\" delimiter-precedes-last=\"never\" initialize-with=\".\" name-as-sort-order=\"all\"/>\n      <label form=\"short\" prefix=\" (\" suffix=\")\"/>\n      <et-al font-style=\"italic\"/>\n      <substitute>\n        <names variable=\"editor\"/>\n        <names variable=\"translator\"/>\n        <choose>\n          <if type=\"article-newspaper article-magazine\" match=\"any\">\n            <text variable=\"container-title\" text-case=\"title\" font-style=\"italic\"/>\n          </if>\n          <else>\n            <text macro=\"title\"/>\n          </else>\n        </choose>\n      </substitute>\n    </names>\n  </macro>\n  <macro name=\"author-short\">\n    <names variable=\"author\">\n      <name form=\"short\" and=\"text\" delimiter=\", \" delimiter-precedes-last=\"never\" initialize-with=\". \"/>\n      <et-al font-style=\"italic\"/>\n      <substitute>\n        <names variable=\"editor\"/>\n        <names variable=\"translator\"/>\n        <choose>\n          <if type=\"article-newspaper article-magazine\" match=\"any\">\n            <text variable=\"container-title\" text-case=\"title\" font-style=\"italic\"/>\n          </if>\n          <else>\n            <text macro=\"title\"/>\n          </else>\n        </choose>\n      </substitute>\n    </names>\n  </macro>\n  <macro name=\"access\">\n    <choose>\n      <if variable=\"DOI\">\n        <text variable=\"DOI\" prefix=\"doi:\"/>\n      </if>\n      <else-if variable=\"URL\">\n        <text term=\"available at\" suffix=\": \" text-case=\"capitalize-first\"/>\n        <text variable=\"URL\"/>\n        <group prefix=\" (\" delimiter=\": \" suffix=\")\">\n          <text term=\"accessed\" text-case=\"capitalize-first\"/>\n          <date form=\"text\" variable=\"accessed\">\n            <date-part name=\"day\"/>\n            <date-part name=\"month\"/>\n            <date-part name=\"year\"/>\n          </date>\n        </group>\n      </else-if>\n    </choose>\n  </macro>\n  <macro name=\"number-volumes\">\n    <choose>\n      <if variable=\"volume\" match=\"none\">\n        <group delimiter=\" \" prefix=\"(\" suffix=\")\">\n          <text variable=\"number-of-volumes\"/>\n          <label variable=\"volume\" form=\"short\" strip-periods=\"true\"/>\n        </group>\n      </if>\n    </choose>\n  </macro>\n  <macro name=\"title\">\n    <choose>\n      <if type=\"bill book legal_case legislation motion_picture report song thesis webpage graphic\" match=\"any\">\n        <group delimiter=\". \">\n          <group delimiter=\" \">\n            <group delimiter=\" \">\n              <text variable=\"title\" font-style=\"italic\"/>\n              <text variable=\"medium\" prefix=\"[\" suffix=\"]\"/>\n            </group>\n            <text macro=\"number-volumes\"/>\n          </group>\n          <text macro=\"edition\"/>\n        </group>\n      </if>\n      <else>\n        <text variable=\"title\" form=\"long\" quotes=\"true\"/>\n      </else>\n    </choose>\n  </macro>\n  <macro name=\"publisher\">\n    <choose>\n      <if type=\"thesis\">\n        <group delimiter=\". \">\n          <text variable=\"genre\"/>\n          <text variable=\"publisher\"/>\n        </group>\n      </if>\n      <else-if type=\"report\">\n        <group delimiter=\". \">\n          <group delimiter=\" \">\n            <text variable=\"genre\"/>\n            <text variable=\"number\"/>\n          </group>\n          <group delimiter=\": \">\n            <text variable=\"publisher-place\"/>\n            <text variable=\"publisher\"/>\n          </group>\n        </group>\n      </else-if>\n      <else-if type=\"article-journal article-newspaper article-magazine\" match=\"none\">\n        <group delimiter=\" \">\n          <group delimiter=\", \">\n            <choose>\n              <if type=\"speech\" variable=\"event\" match=\"any\">\n                <text variable=\"event\" font-style=\"italic\"/>\n              </if>\n            </choose>\n            <group delimiter=\": \">\n              <text variable=\"publisher-place\"/>\n              <text variable=\"publisher\"/>\n            </group>\n          </group>\n          <group prefix=\"(\" suffix=\")\" delimiter=\", \">\n            <text variable=\"collection-title\"/>\n            <text variable=\"collection-number\"/>\n          </group>\n        </group>\n      </else-if>\n    </choose>\n  </macro>\n  <macro name=\"year-date\">\n    <choose>\n      <if variable=\"issued\">\n        <date variable=\"issued\">\n          <date-part name=\"year\"/>\n        </date>\n        <text variable=\"year-suffix\"/>\n      </if>\n      <else>\n        <text term=\"no date\"/>\n        <text variable=\"year-suffix\" prefix=\" \"/>\n      </else>\n    </choose>\n  </macro>\n  <macro name=\"locator\">\n    <choose>\n      <if type=\"article-journal\">\n        <text variable=\"volume\"/>\n        <text variable=\"issue\" prefix=\"(\" suffix=\")\"/>\n      </if>\n    </choose>\n  </macro>\n  <macro name=\"published-date\">\n    <choose>\n      <if type=\"article-newspaper article-magazine post-weblog speech\" match=\"any\">\n        <date variable=\"issued\">\n          <date-part name=\"day\" suffix=\" \"/>\n          <date-part name=\"month\" form=\"long\"/>\n        </date>\n      </if>\n    </choose>\n  </macro>\n  <macro name=\"pages\">\n    <choose>\n      <if type=\"chapter paper-conference article-journal article article-magazine article-newspaper book review review-book report\" match=\"any\">\n        <group delimiter=\" \">\n          <label variable=\"page\" form=\"short\"/>\n          <text variable=\"page\"/>\n        </group>\n      </if>\n    </choose>\n  </macro>\n  <macro name=\"container-title\">\n    <choose>\n      <if variable=\"container-title\">\n        <group delimiter=\". \">\n          <group delimiter=\" \">\n            <text variable=\"container-title\" font-style=\"italic\"/>\n            <choose>\n              <if type=\"article article-journal\" match=\"any\">\n                <choose>\n                  <if match=\"none\" variable=\"page volume\">\n                    <text value=\"Preprint\" prefix=\"[\" suffix=\"]\"/>\n                  </if>\n                </choose>\n              </if>\n            </choose>\n          </group>\n          <text macro=\"edition\"/>\n        </group>\n      </if>\n    </choose>\n  </macro>\n  <macro name=\"edition\">\n    <choose>\n      <if is-numeric=\"edition\">\n        <group delimiter=\" \">\n          <number variable=\"edition\" form=\"ordinal\"/>\n          <text term=\"edition\" form=\"short\" strip-periods=\"true\"/>\n        </group>\n      </if>\n      <else>\n        <text variable=\"edition\"/>\n      </else>\n    </choose>\n  </macro>\n  <macro name=\"container-prefix\">\n    <choose>\n      <if type=\"chapter paper-conference\" match=\"any\">\n        <text term=\"in\"/>\n      </if>\n    </choose>\n  </macro>\n  <citation et-al-min=\"4\" et-al-use-first=\"1\" disambiguate-add-year-suffix=\"true\" disambiguate-add-names=\"true\" disambiguate-add-givenname=\"true\" collapse=\"year\">\n    <sort>\n      <key macro=\"year-date\"/>\n    </sort>\n    <layout prefix=\"(\" suffix=\")\" delimiter=\"; \">\n      <group delimiter=\", \">\n        <group delimiter=\", \">\n          <text macro=\"author-short\"/>\n          <text macro=\"year-date\"/>\n        </group>\n        <group>\n          <label variable=\"locator\" form=\"short\" suffix=\" \"/>\n          <text variable=\"locator\"/>\n        </group>\n      </group>\n    </layout>\n  </citation>\n  <bibliography and=\"text\" et-al-min=\"4\" et-al-use-first=\"1\">\n    <sort>\n      <key macro=\"author\"/>\n      <key macro=\"year-date\"/>\n      <key variable=\"title\"/>\n    </sort>\n    <layout suffix=\".\">\n      <group delimiter=\". \">\n        <group delimiter=\" \">\n          <text macro=\"author\"/>\n          <text macro=\"year-date\" prefix=\"(\" suffix=\")\"/>\n          <group delimiter=\", \">\n            <text macro=\"title\"/>\n            <group delimiter=\" \">\n              <text macro=\"container-prefix\"/>\n              <text macro=\"editor\"/>\n              <text macro=\"container-title\"/>\n            </group>\n          </group>\n        </group>\n        <text macro=\"secondary-contributors\"/>\n        <text macro=\"publisher\"/>\n      </group>\n      <group delimiter=\", \" prefix=\", \">\n        <text macro=\"locator\"/>\n        <text macro=\"published-date\"/>\n        <text macro=\"pages\"/>\n      </group>\n      <text macro=\"access\" prefix=\". \"/>\n    </layout>\n  </bibliography>\n</style>",
        "last_modified": 1649665699315
      }
    }
    let refBasicCitation = this.serviceShare.CslService.getBasicCitation(refInfo.ref, refStyle.style);
    if(!this.referenceFormControl.value){

    }
    let ref = {
      ...refInfo,
      citation:refBasicCitation,
      refType:this.referenceFormControl.value,
      refStyle
    }
    this.dialogRef.close({ref})
  }

  closeDialog(){
    this.dialogRef.close()
  }
}
