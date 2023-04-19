import {HttpClient} from '@angular/common/http';
import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {ServiceShare} from '@app/editor/services/service-share.service';
import {Observable} from 'rxjs';
import {debounceTime, distinctUntilChanged, filter, startWith, tap, map} from 'rxjs/operators';
import {CslService} from '../lib-service/csl.service';
import {RefsApiService} from '../lib-service/refs-api.service';
import {uuidv4} from 'lib0/random';
import { APP_CONFIG, AppConfig } from '@core/services/app-config';

@Component({
  selector: 'app-citate-reference-dialog',
  templateUrl: './citate-reference-dialog.component.html',
  styleUrls: ['./citate-reference-dialog.component.scss']
})
export class CitateReferenceDialogComponent implements AfterViewInit {
  loading = false;
  selected: any
  citating = true;
  displayedColumns = ['title']
  searchData: any
  references: any
  styles: any
  referencesControl = new FormControl(null);
  searchReferencesControl = new FormControl('');
  @ViewChild('searchInput') searchInput?: ElementRef;

  myControl = new FormControl('');
  options: string[] = ['One', 'Two', 'Three'];
  filteredOptions: Observable<any[]>;

  constructor(
    private serviceShare: ServiceShare,
    private cslService: CslService,
    private refsAPI: RefsApiService,
    public dialogRef: MatDialogRef<CitateReferenceDialogComponent>,
    private changeDetectorRef: ChangeDetectorRef,
    private http: HttpClient,
    @Inject(MAT_DIALOG_DATA) public data: any,
    @Inject(APP_CONFIG) private config: AppConfig,
  ) {
  }

  lastSelect: 'external' | 'localRef' | 'none' = 'none';
  externalSelection: any

  select(row: any, lastSelect) {
    this.lastSelect = lastSelect;
    this.externalSelection = row;
  }

  ngAfterViewInit(): void {
    this.refsAPI.getReferences().subscribe((refs: any) => {
      this.references = refs.data;
      this.citating = false;
      this.changeDetectorRef.detectChanges()
    })
    /*fromEvent(this.searchInput!.nativeElement, 'keyup')
      .pipe(
        filter(Boolean),
        debounceTime(700),
        distinctUntilChanged(),
        tap((text) => {
        })
      )
      .subscribe((data) => {
        this.searchExternalRefs(this.searchInput!.nativeElement.value)
      });*/
  }

  mapRef(ref: any) {
    let maped: any = {};
    let formIOData: any = {}
    if (ref.authors && ref.authors instanceof Array && ref.authors.length > 0) {
      if (!maped['author']) {
        maped['author'] = []
        formIOData['authors'] = []
      }
      ref.authors.forEach((author: string[] | null | null[]) => {
        if (author && (author[0] || author[1])) {
          maped['author'].push({"family": author[0] ? author[0] : '', "given": author[1] ? author[1] : ''})
          formIOData['authors'].push({
            "first": author[0] ? author[0] : '',
            "last": author[1] ? author[1] : '',
            "name": "",
            "role": "author",
            "type": "person"
          })
        }
      })
    }
    if (ref.firstauthor && ref.firstauthor instanceof Array && ref.firstauthor.length > 0) {
      if (!maped['author']) {
        maped['author'] = []
        formIOData['authors'] = []
      }
      ref.firstauthor.forEach((author: string[] | null | null[]) => {
        if (author && (author[0] || author[1])) {
          maped['author'].push({"family": author[0] ? author[0] : '', "given": author[1] ? author[1] : ''})
          formIOData['authors'].push({
            "first": author[0] ? author[0] : '',
            "last": author[1] ? author[1] : '',
            "name": "",
            "role": "author",
            "type": "person"
          })
        }
      })
    }
    if (ref.doi) {
      maped['DOI'] = ref.doi
      formIOData['DOI'] = ref.doi
    }
    if (ref.href) {
      maped['URL'] = ref.href
      formIOData['URL'] = ref.href
    }
    if (ref.title) {
      maped['title'] = ref.title
      formIOData['title'] = ref.title
    }
    if (ref.year) {
      let val = `${ref.year}`;
      let dateParts = val.split('-')
      formIOData['issued'] = val
      if (dateParts.length == 1) {
        dateParts.push('1')
        dateParts.push('1')
      }
      if (dateParts.length == 2) {
        dateParts.push('1')
      }
      maped['issued'] = {
        "date-parts": [
          dateParts
        ]
      }
    }
    if (ref.publicationDate) {
      let val = `${ref.publicationDate}`
      let dateParts = val.split('-')
      formIOData['issued'] = val
      if (dateParts.length == 1) {
        dateParts.push('1')
        dateParts.push('1')
      }
      if (dateParts.length == 2) {
        dateParts.push('1')
      }
      maped['issued'] = {
        "date-parts": [
          dateParts
        ]
      }
    }
    if (ref.issue) {
      maped['issue'] = ref.issue
      formIOData['issue'] = ref.issue
    }
    if (ref.volume) {
      maped['volume'] = ref.volume
      formIOData['volume'] = ref.volume
    }
    if (ref.publishedIn) {
      maped['city'] = ref.publishedIn
      formIOData['city'] = ref.publishedIn
    }
    if (ref.abstract) {
      maped['abstract'] = ref.abstract
      formIOData['abstract'] = ref.abstract
    }
    if (ref.spage && ref.epage) {
      maped['page'] = ref.spage + '-' + ref.epage
      formIOData['page'] = ref.spage + '-' + ref.epage
    }
    if (ref.type) {
      maped['type'] = ref.type.replace(' ', '-').toLocaleLowerCase()
    } else {
      maped['type'] = 'article-journal'
    }
    if (ref.id) {
      if (ref.id instanceof String) {
        maped['id'] = ref.id
      } else if (typeof ref.id == 'object') {
        maped['id'] = Object.values(ref.id).join(':SePaRaToR:')
      } else {
        maped['id'] = ref.doi ? ref.doi : uuidv4()
      }
    } else {
      maped['id'] = ref.doi ? ref.doi : uuidv4()
    }

    return {ref: maped, formIOData}
  }

  searchExternalRefs(searchText: string) {
    this.searchData = undefined;
    this.loading = true;
    this.changeDetectorRef.detectChanges()
    let url = '/find'
    /* if(environment.production||true){
      url = 'https://refindit.org/find'
    } */
    //let exREFApi = 'https://api.refindit.org/find'
    this.http.get(this.config.externalRefsApi, {
      responseType: 'text',

      params: {
        search: 'simple',
        text: searchText,
        db: ["crossref", "datacite"]
      }
    }).subscribe((data1) => {
      let parsedJson = JSON.parse(data1);
      if (parsedJson.length > 0) {
        this.searchData = parsedJson;
        this.loading = false;
        this.changeDetectorRef.detectChanges()
      }
      return
      let stringArray = data1.split('][').map((val, i) => {
        let newVal = val;
        if (!newVal.startsWith('[')) {
          newVal = '[' + newVal;
        }
        if (!newVal.endsWith(']')) {
          newVal = newVal + ']';
        }
        return newVal
      })
      let data: any[] = [];
      stringArray.forEach((str: string) => {
        data.push(...JSON.parse(str))
      })

      //map data in csl lib format
      let mapedReferences: any[] = []
      data.forEach((ref) => {
        let mapedRef = this.mapRef(ref)
        mapedReferences.push(mapedRef)
      })
      if (mapedReferences.length > 0) {
        this.searchData = mapedReferences;
        this.loading = false;
        this.changeDetectorRef.detectChanges()
      }
    })
  }

  cancel() {
    this.dialogRef.close(undefined)
  }

  addReference() {
    if (this.lastSelect == 'external') {
      this.citating = true;
      this.changeDetectorRef.detectChanges()
      let styleName = 'demo-style'
      let externalRef = this.externalSelection.ref
      if (!externalRef.id) {
        externalRef.id = uuidv4()
      }
      let citation = this.cslService.genereteCitationStr(styleName, externalRef)
      this.refsAPI.getReferenceTypes().subscribe((refTypes: any) => {
        this.refsAPI.getStyles().subscribe((refStyles: any) => {
          let typeName = this.externalSelection.ref.type ? this.externalSelection.ref.type.split("-").join(" ").toLocaleUpperCase() : ''
          let type = this.externalSelection.ref.type
          let styleName = "demo-style";
          let typeIndex: any
          let styleIndex: any
          if (refTypes.data.find((ref: any) => {
            return (ref.name == typeName || ref.type == type)
          })) {
            typeIndex = refTypes.data.findIndex((ref: any) => {
              return (ref.name == typeName || ref.type == type)
            });
          } else {
            typeIndex = 0
          }
          if (refStyles.data.find((style: any) => {
            return style.name == styleName
          })) {
            styleIndex = refStyles.data.findIndex((style: any) => {
              return style.name == styleName
            });
          }
          let ref: any = {
            refData: {
              basicCitation: citation,
              formioData: this.externalSelection.formIOData,
              last_modified: Date.now(),
              refType: 'external',
              referenceData: this.externalSelection.ref
            },
            refStyle: {},
            refType: {
              type: type ? type : '',
              name: typeName,
              last_modified: (typeof typeIndex == 'number') ? refTypes.data[typeIndex].last_modified : refTypes.data[0] ? refTypes.data[0].last_modified : Date.now(),
            },
          }
          if (this.serviceShare.YdocService.articleData.layout.citation_style) {
            let style = this.serviceShare.YdocService.articleData.layout.citation_style
            ref.refStyle = {
              "name": style.name,
              "label": style.title,
              "style": style.style_content,
              "last_modified": (new Date(style.style_updated).getTime())
            }
          } else {
            ref.refStyle = {
              "name": "harvard-cite-them-right",
              "label": "Harvard Cite Them Right",
              "style": "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<style xmlns=\"http://purl.org/net/xbiblio/csl\" class=\"in-text\" version=\"1.0\" demote-non-dropping-particle=\"sort-only\" default-locale=\"en-GB\">\n<info>\n\n    <title>Cite Them Right 11th edition - Harvard</title>\n    <id>http://www.zotero.org/styles/harvard-cite-them-right</id>\n    <link href=\"http://www.zotero.org/styles/harvard-cite-them-right\" rel=\"self\"/>\n    <link href=\"http://www.zotero.org/styles/harvard-cite-them-right-10th-edition\" rel=\"template\"/>\n    <link href=\"http://www.citethemrightonline.com/\" rel=\"documentation\"/>\n    <author>\n      <name>Patrick O'Brien</name>\n    </author>\n    <category citation-format=\"author-date\"/>\n    <category field=\"generic-base\"/>\n    <summary>Harvard according to Cite Them Right, 11th edition.</summary>\n    <updated>2021-09-01T07:43:59+00:00</updated>\n    <rights license=\"http://creativecommons.org/licenses/by-sa/3.0/\">This work is licensed under a Creative Commons Attribution-ShareAlike 3.0 License</rights>\n  </info>\n  <locale xml:lang=\"en-GB\">\n    <terms>\n      <term name=\"editor\" form=\"short\">\n        <single>ed.</single>\n        <multiple>eds</multiple>\n      </term>\n      <term name=\"editortranslator\" form=\"verb\">edited and translated by</term>\n      <term name=\"edition\" form=\"short\">edn.</term>\n    </terms>\n  </locale>\n  <macro name=\"editor\">\n    <choose>\n      <if type=\"chapter paper-conference\" match=\"any\">\n        <names variable=\"container-author\" delimiter=\", \" suffix=\", \">\n          <name and=\"text\" initialize-with=\". \" delimiter=\", \" sort-separator=\", \" name-as-sort-order=\"all\"/>\n        </names>\n        <choose>\n          <if variable=\"container-author\" match=\"none\">\n            <names variable=\"editor translator\" delimiter=\", \">\n              <name and=\"text\" initialize-with=\".\" name-as-sort-order=\"all\"/>\n              <label form=\"short\" prefix=\" (\" suffix=\")\"/>\n            </names>\n          </if>\n        </choose>\n      </if>\n    </choose>\n  </macro>\n  <macro name=\"secondary-contributors\">\n    <choose>\n      <if type=\"chapter paper-conference\" match=\"none\">\n        <names variable=\"editor translator\" delimiter=\". \">\n          <label form=\"verb\" text-case=\"capitalize-first\" suffix=\" \"/>\n          <name and=\"text\" initialize-with=\".\"/>\n        </names>\n      </if>\n      <else-if variable=\"container-author\" match=\"any\">\n        <names variable=\"editor translator\" delimiter=\". \">\n          <label form=\"verb\" text-case=\"capitalize-first\" suffix=\" \"/>\n          <name and=\"text\" initialize-with=\". \" delimiter=\", \"/>\n        </names>\n      </else-if>\n    </choose>\n  </macro>\n  <macro name=\"author\">\n    <names variable=\"author\">\n      <name and=\"text\" delimiter-precedes-last=\"never\" initialize-with=\".\" name-as-sort-order=\"all\"/>\n      <label form=\"short\" prefix=\" (\" suffix=\")\"/>\n      <et-al font-style=\"italic\"/>\n      <substitute>\n        <names variable=\"editor\"/>\n        <names variable=\"translator\"/>\n        <choose>\n          <if type=\"article-newspaper article-magazine\" match=\"any\">\n            <text variable=\"container-title\" text-case=\"title\" font-style=\"italic\"/>\n          </if>\n          <else>\n            <text macro=\"title\"/>\n          </else>\n        </choose>\n      </substitute>\n    </names>\n  </macro>\n  <macro name=\"author-short\">\n    <names variable=\"author\">\n      <name form=\"short\" and=\"text\" delimiter=\", \" delimiter-precedes-last=\"never\" initialize-with=\". \"/>\n      <et-al font-style=\"italic\"/>\n      <substitute>\n        <names variable=\"editor\"/>\n        <names variable=\"translator\"/>\n        <choose>\n          <if type=\"article-newspaper article-magazine\" match=\"any\">\n            <text variable=\"container-title\" text-case=\"title\" font-style=\"italic\"/>\n          </if>\n          <else>\n            <text macro=\"title\"/>\n          </else>\n        </choose>\n      </substitute>\n    </names>\n  </macro>\n  <macro name=\"access\">\n    <choose>\n      <if variable=\"DOI\">\n        <text variable=\"DOI\" prefix=\"doi:\"/>\n      </if>\n      <else-if variable=\"URL\">\n        <text term=\"available at\" suffix=\": \" text-case=\"capitalize-first\"/>\n        <text variable=\"URL\"/>\n        <group prefix=\" (\" delimiter=\": \" suffix=\")\">\n          <text term=\"accessed\" text-case=\"capitalize-first\"/>\n          <date form=\"text\" variable=\"accessed\">\n            <date-part name=\"day\"/>\n            <date-part name=\"month\"/>\n            <date-part name=\"year\"/>\n          </date>\n        </group>\n      </else-if>\n    </choose>\n  </macro>\n  <macro name=\"number-volumes\">\n    <choose>\n      <if variable=\"volume\" match=\"none\">\n        <group delimiter=\" \" prefix=\"(\" suffix=\")\">\n          <text variable=\"number-of-volumes\"/>\n          <label variable=\"volume\" form=\"short\" strip-periods=\"true\"/>\n        </group>\n      </if>\n    </choose>\n  </macro>\n  <macro name=\"title\">\n    <choose>\n      <if type=\"bill book legal_case legislation motion_picture report song thesis webpage graphic\" match=\"any\">\n        <group delimiter=\". \">\n          <group delimiter=\" \">\n            <group delimiter=\" \">\n              <text variable=\"title\" font-style=\"italic\"/>\n              <text variable=\"medium\" prefix=\"[\" suffix=\"]\"/>\n            </group>\n            <text macro=\"number-volumes\"/>\n          </group>\n          <text macro=\"edition\"/>\n        </group>\n      </if>\n      <else>\n        <text variable=\"title\" form=\"long\" quotes=\"true\"/>\n      </else>\n    </choose>\n  </macro>\n  <macro name=\"publisher\">\n    <choose>\n      <if type=\"thesis\">\n        <group delimiter=\". \">\n          <text variable=\"genre\"/>\n          <text variable=\"publisher\"/>\n        </group>\n      </if>\n      <else-if type=\"report\">\n        <group delimiter=\". \">\n          <group delimiter=\" \">\n            <text variable=\"genre\"/>\n            <text variable=\"number\"/>\n          </group>\n          <group delimiter=\": \">\n            <text variable=\"publisher-place\"/>\n            <text variable=\"publisher\"/>\n          </group>\n        </group>\n      </else-if>\n      <else-if type=\"article-journal article-newspaper article-magazine\" match=\"none\">\n        <group delimiter=\" \">\n          <group delimiter=\", \">\n            <choose>\n              <if type=\"speech\" variable=\"event\" match=\"any\">\n                <text variable=\"event\" font-style=\"italic\"/>\n              </if>\n            </choose>\n            <group delimiter=\": \">\n              <text variable=\"publisher-place\"/>\n              <text variable=\"publisher\"/>\n            </group>\n          </group>\n          <group prefix=\"(\" suffix=\")\" delimiter=\", \">\n            <text variable=\"collection-title\"/>\n            <text variable=\"collection-number\"/>\n          </group>\n        </group>\n      </else-if>\n    </choose>\n  </macro>\n  <macro name=\"year-date\">\n    <choose>\n      <if variable=\"issued\">\n        <date variable=\"issued\">\n          <date-part name=\"year\"/>\n        </date>\n        <text variable=\"year-suffix\"/>\n      </if>\n      <else>\n        <text term=\"no date\"/>\n        <text variable=\"year-suffix\" prefix=\" \"/>\n      </else>\n    </choose>\n  </macro>\n  <macro name=\"locator\">\n    <choose>\n      <if type=\"article-journal\">\n        <text variable=\"volume\"/>\n        <text variable=\"issue\" prefix=\"(\" suffix=\")\"/>\n      </if>\n    </choose>\n  </macro>\n  <macro name=\"published-date\">\n    <choose>\n      <if type=\"article-newspaper article-magazine post-weblog speech\" match=\"any\">\n        <date variable=\"issued\">\n          <date-part name=\"day\" suffix=\" \"/>\n          <date-part name=\"month\" form=\"long\"/>\n        </date>\n      </if>\n    </choose>\n  </macro>\n  <macro name=\"pages\">\n    <choose>\n      <if type=\"chapter paper-conference article-journal article article-magazine article-newspaper book review review-book report\" match=\"any\">\n        <group delimiter=\" \">\n          <label variable=\"page\" form=\"short\"/>\n          <text variable=\"page\"/>\n        </group>\n      </if>\n    </choose>\n  </macro>\n  <macro name=\"container-title\">\n    <choose>\n      <if variable=\"container-title\">\n        <group delimiter=\". \">\n          <group delimiter=\" \">\n            <text variable=\"container-title\" font-style=\"italic\"/>\n            <choose>\n              <if type=\"article article-journal\" match=\"any\">\n                <choose>\n                  <if match=\"none\" variable=\"page volume\">\n                    <text value=\"Preprint\" prefix=\"[\" suffix=\"]\"/>\n                  </if>\n                </choose>\n              </if>\n            </choose>\n          </group>\n          <text macro=\"edition\"/>\n        </group>\n      </if>\n    </choose>\n  </macro>\n  <macro name=\"edition\">\n    <choose>\n      <if is-numeric=\"edition\">\n        <group delimiter=\" \">\n          <number variable=\"edition\" form=\"ordinal\"/>\n          <text term=\"edition\" form=\"short\" strip-periods=\"true\"/>\n        </group>\n      </if>\n      <else>\n        <text variable=\"edition\"/>\n      </else>\n    </choose>\n  </macro>\n  <macro name=\"container-prefix\">\n    <choose>\n      <if type=\"chapter paper-conference\" match=\"any\">\n        <text term=\"in\"/>\n      </if>\n    </choose>\n  </macro>\n  <citation et-al-min=\"4\" et-al-use-first=\"1\" disambiguate-add-year-suffix=\"true\" disambiguate-add-names=\"true\" disambiguate-add-givenname=\"true\" collapse=\"year\">\n    <sort>\n      <key macro=\"year-date\"/>\n    </sort>\n    <layout prefix=\"(\" suffix=\")\" delimiter=\"; \">\n      <group delimiter=\", \">\n        <group delimiter=\", \">\n          <text macro=\"author-short\"/>\n          <text macro=\"year-date\"/>\n        </group>\n        <group>\n          <label variable=\"locator\" form=\"short\" suffix=\" \"/>\n          <text variable=\"locator\"/>\n        </group>\n      </group>\n    </layout>\n  </citation>\n  <bibliography and=\"text\" et-al-min=\"4\" et-al-use-first=\"1\">\n    <sort>\n      <key macro=\"author\"/>\n      <key macro=\"year-date\"/>\n      <key variable=\"title\"/>\n    </sort>\n    <layout suffix=\".\">\n      <group delimiter=\". \">\n        <group delimiter=\" \">\n          <text macro=\"author\"/>\n          <text macro=\"year-date\" prefix=\"(\" suffix=\")\"/>\n          <group delimiter=\", \">\n            <text macro=\"title\"/>\n            <group delimiter=\" \">\n              <text macro=\"container-prefix\"/>\n              <text macro=\"editor\"/>\n              <text macro=\"container-title\"/>\n            </group>\n          </group>\n        </group>\n        <text macro=\"secondary-contributors\"/>\n        <text macro=\"publisher\"/>\n      </group>\n      <group delimiter=\", \" prefix=\", \">\n        <text macro=\"locator\"/>\n        <text macro=\"published-date\"/>\n        <text macro=\"pages\"/>\n      </group>\n      <text macro=\"access\" prefix=\". \"/>\n    </layout>\n  </bibliography>\n</style>",
              "last_modified": 1649665699315
            }
          }
          this.refsAPI.createReference(ref, this.externalSelection.formIOData, refTypes.data[typeIndex]).subscribe((refs:any) => {
            this.citating = false;
            this.changeDetectorRef.detectChanges()
            this.dialogRef.close({
              ref: refs.data[0],
              refInstance: 'local',
              //externalSelect:this.selected,
              citation,

            })
          })
        })
      })
    } else if (this.lastSelect == 'localRef') {
      let localRef = this.externalSelection;
      let citation = this.cslService.genereteCitationStr(localRef.refStyle.name, localRef.refData.referenceData)
      this.dialogRef.close({
        refInstance: 'local',
        ref: this.externalSelection,
        // ref: this.referencesControl.value,
        //externalSelect:this.selected,
        citation
      })
    }
  }

  ngOnInit() {
    this.filteredOptions = this.searchReferencesControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );
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

  lastFilter = null;

  private _filter(value: string): string[] {
    if (value !== null && typeof value === 'object') {
      return this.lastFilter;
    }
    if (!this.references || !value || typeof value === 'object') {
      this.lastFilter = null;
      return [];
    }
    const filterValue = value.toLowerCase();
    this.lastFilter = this.references.filter(option => {
      return option.refData.referenceData.title?.toLowerCase().includes(filterValue) ||
        (option.refData.formioData.authors[0] ? (option.refData.formioData.authors[0]?.first?.toLowerCase()?.includes(filterValue) || option.refData.formioData.authors[0]?.last?.toLowerCase()?.includes(filterValue) || option.refData.formioData.authors[0]?.given?.toLowerCase()?.includes(filterValue) || false) : false) ||
        option.refData.referenceData?.type.toLowerCase().includes(filterValue);
    });
    return this.lastFilter;
  }

  getReference(option) {
  }

  displayFn(option: any): string {
    if (option) {
      return option?.ref?.title || option?.refData?.referenceData?.title + ' | ' +
        (option?.refData?.formioData?.authors[0] ? (option?.refData?.formioData?.authors[0]?.first || option?.refData?.formioData?.authors[0]?.last || option?.refData?.formioData?.authors[0]?.given) : 'no name') + ' | ' +
        option.refData.referenceData.type;
    }
    return '';
  }
}
