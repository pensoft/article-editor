import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ServiceShare } from '@app/editor/services/service-share.service';
import { RefsApiService } from '@app/layout/pages/library/lib-service/refs-api.service';
import { Observable, Subscriber, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, startWith } from 'rxjs/operators';
import { environment } from '@env';
import { genereteNewReference } from '@app/layout/pages/library/lib-service/refs-funcs';
import { harvardStyle } from '@app/layout/pages/library/lib-service/csl.service';
import { CiToTypes } from '@app/layout/pages/library/lib-service/editors-refs-manager.service';
import { MatOption } from '@angular/material/core';
import { uuidv4 } from 'lib0/random';
import { mapRef1 } from '@app/editor/utils/references/refsFunctions';
import { ReferenceEditComponent } from '@app/layout/pages/library/reference-edit/reference-edit.component';


@Component({
  selector: 'app-refs-add-new-in-article-dialog',
  templateUrl: './refs-add-new-in-article-dialog.component.html',
  styleUrls: ['./refs-add-new-in-article-dialog.component.scss']
})
export class RefsAddNewInArticleDialogComponent implements OnInit, OnDestroy {

  searchReferencesControl = new FormControl('');
  loading = false;
  searchData: any
  externalSelection: any
  lastSelect: 'external' | 'localRef' | 'none' = 'none';
  filteredOptions: Observable<any[]>;
  lastFilter = null;

  referenceFormControl = new FormControl(null, [Validators.required]);
  citoFormControl = new FormControl(null, [Validators.required]);
  referenceTypesFromBackend
  CiToTypes = CiToTypes
  dataSave: any
  formIOSchema: any = undefined;
  referenceForms: FormGroup = new FormGroup({})
  isModified
  isValid

  constructor(
    private refsAPI: RefsApiService,
    public dialogRef: MatDialogRef<RefsAddNewInArticleDialogComponent>,
    public dialog: MatDialog,
    private serviceShare: ServiceShare,
    private changeDetectorRef: ChangeDetectorRef,
    private http: HttpClient,
  ) { }

  ngOnInit(): void {
    this.loadingRefDataFromBackend = true;
    this.refsAPI.getReferenceTypes().subscribe((refTypes: any) => {
      this.refsAPI.getStyles().subscribe((refStyles: any) => {
        this.referenceTypesFromBackend = refTypes.data;
        if (!this.referenceFormControl.value) {
          this.referenceFormControl.setValue(this.referenceTypesFromBackend[0]);
        } else {
          this.referenceFormControl.setValue(this.referenceFormControl.value);
        }
        if (!this.citoFormControl.value) {
          this.citoFormControl.setValue(null);
        } else {
          this.citoFormControl.setValue(this.citoFormControl.value);
        }
        this.loadingRefDataFromBackend = false;
      })
    })
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
  tabIndex = 0;
  tabChanged(change: MatTabChangeEvent) {
    this.tabIndex = change.index
    if (change.index == 1) {
      this.generateFormIOJSON(this.referenceFormControl.value)
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
    this.getRefWithCitation([row],'refindit')
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
    this.getRefWithCitation([refObj],'manual')
  }

  onChange(change: any) {
    if (change instanceof Event) {

    } else {
      this.dataSave = change.data;
      this.isModified = change.isModified
      this.isValid = change.isValid
    }
  }

  getRefWithCitation(refInfo: { ref: any, formIOData: any }[],source:'file'|'manual'|'refindit') {
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
    let refsToAdd = []
    refInfo.forEach((refIns)=>{
      if(!refIns.ref.type){
        refIns.ref.type = "article-journal"
      }
      let refMappedType = this.referenceTypesFromBackend.find(x=>x.type == refIns.ref.type);
      let refBasicCitation: any = this.serviceShare.CslService.getBasicCitation(refIns.ref, refStyle.style);
      let container = document.createElement('div');
      container.innerHTML = refBasicCitation.bibliography;
      refBasicCitation.textContent = container.textContent;
      let ref = {
        ...refIns,
        citation: refBasicCitation,
        ref_last_modified: Date.now(),
        refType: refMappedType,
        refCiTO: (source == 'file'||source == 'refindit')?null:this.citoFormControl.value,
        refStyle
      }
      refsToAdd.push({ref})
    })
    if(source == 'refindit'){
      this.editRefinditRefBeforeSubmit(refsToAdd[0].ref,(refdata:any)=>{
        if(refdata){
          this.dialogRef.close(refdata)
        }else{
          this.searchReferencesControl.setValue('');
        }
      })
    }else{
      this.dialogRef.close(refsToAdd)
    }
  }

  editRefinditRefBeforeSubmit(ref,callback:any){
    if(!ref.ref.id){
      ref.ref.id = uuidv4()
    }
    this.loadingRefDataFromBackend = true;
    this.refsAPI.getReferenceTypes().subscribe((refTypes: any) => {
      this.refsAPI.getStyles().subscribe((refStyles: any) => {
        let referenceStyles = refStyles.data
        let referenceTypesFromBackend = refTypes.data;
        let oldData = { refData: { formioData: ref.formIOData }, refType: ref.refType, refStyle: ref.refStyle,refCiTO:ref.refCiTO }
        this.loadingRefDataFromBackend = false;

        const dialogRef = this.dialog.open(ReferenceEditComponent, {
          data: { referenceTypesFromBackend, oldData, referenceStyles },
          panelClass: ['edit-reference-panel', 'editor-dialog-container'],
          //width: '100%',
          // height: '90%',
          // maxWidth: '100%'
        });

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
            refObj.ref.id = ref.ref.id
            let refBasicCitation:any = this.serviceShare.CslService.getBasicCitation(refObj.ref, refStyle.style);
            let container = document.createElement('div');
            container.innerHTML = refBasicCitation.bibliography;
            refBasicCitation.textContent = container.textContent;
            let refInstance = {
              ...refObj,
              citation: refBasicCitation,
              refType: result.referenceScheme,
              ref_last_modified:Date.now(),
              refCiTO:result.refCiTO,
              refStyle
            }
            callback([{ref:refInstance}])
          }else{
            callback()
          }
        })
      })
    })
  }

  getToolTipForRef(option) {
    return '<div data-html="true">' + JSON.stringify(option.formIOData, null, 4) + '</div>';
  }

  updatePos(event: MouseEvent) {
    let toolTips = Array.from(document.body.getElementsByClassName('option-tooltip-refs-autocomplete'))
    let div: HTMLDivElement
    if (toolTips.length > 0) {
      div = toolTips[0] as HTMLDivElement
    }
    if (div) {
      div.style.left = event.clientX + 60 + 'px'
      div.style.top = event.clientY + 'px'
    }
  }

  showTooltip(event: MouseEvent, option) {
    let toolTips = Array.from(document.body.getElementsByClassName('option-tooltip-refs-autocomplete'))
    let div: HTMLDivElement
    if (toolTips.length > 0) {
      div = toolTips[0] as HTMLDivElement
    } else {
      div = document.createElement('div')
      div.className = 'option-tooltip-refs-autocomplete';
      let arrowDiv = document.createElement('div')
      let arrowContainerDiv = document.createElement('div')
      arrowContainerDiv.className = 'arrow-div-container-option-tooltip-refs-autocomplete';
      arrowContainerDiv.append(arrowDiv)
      let tooltipContent = document.createElement('div')
      arrowDiv.className = 'arrow-div-option-tooltip-refs-autocomplete';
      tooltipContent.className = 'content-option-tooltip-refs-autocomplete';
      div.append(arrowContainerDiv, tooltipContent)
      document.body.appendChild(div)
    }

    div.getElementsByClassName('content-option-tooltip-refs-autocomplete')[0].innerHTML = this.getToolTipForRef(option)
    div.style.left = event.clientX + 60 + 'px'
    div.style.top = event.clientY + 'px'
    if (div.style.display != 'block') {
      div.style.display = 'block'
    }
  }

  hideTooltip() {
    let toolTips = Array.from(document.body.getElementsByClassName('option-tooltip-refs-autocomplete'))
    let div: HTMLDivElement
    if (toolTips.length > 0) {
      div = toolTips[0] as HTMLDivElement
    }
    if (div && div.style.display != 'none') {
      div.style.display = 'none'
    }
  }

  ngOnDestroy(): void {
    let toolTips = Array.from(document.body.getElementsByClassName('option-tooltip-refs-autocomplete'))
    let div: HTMLDivElement
    if (div) {
      document.body.removeChild(div);
    }
  }

  closeDialog() {
    this.dialogRef.close()
  }

  file: File
  onfileInputChange(event) {
    this.file = event.target.files[0];
  }

  // OnClick of button Upload
  onFileUpload() {
    try{
      this.loading = !this.loading;
      this.file.text().then((fileContent) => {
        let parser = new DOMParser();
        let xmlDoc = parser.parseFromString(fileContent, "text/xml");
        let mods = this.pathInXml(xmlDoc, ['modsCollection', 0, 'mods'])
        if (mods.length == 0) {
          console.error('there are no refs in xml.')
        } else {
          let mapedRefs = mods.map(el => {
            let refEl = el
            let authorsEls = this.pathInXml(refEl, ['name']);
            let authors = authorsEls.map(authorEl => {
              let authorRole = this.pathInXml(authorEl, ['role', 0, 'roleterm', 0, '_']);
              let authorFamilyName = this.pathInXml(authorEl, ['namepart', ['type', 'family'], '_']);
              let authorGivenName = this.pathInXml(authorEl, ['namepart', ['type', 'given'], '_']);
              return {
                role: authorRole,
                family: authorFamilyName,
                given: authorGivenName
              }
            }).filter(author => (author.role == 'aut' || author.role == 'Author')).map(x=>[x.given,x.family]);
            let refTypes = {
              'book': 'book',
              'booksection': 'book chapter',
              'conferencepaper': 'conference proceedings',
              'journalarticle': 'journal article',
              'section': 'journal article',
              'thesis': 'thesis'
            };

            var doi = this.pathInXml(refEl, ['identifier', 0, ['type', 'doi'], '_']);

            var part = this.pathInXml(refEl, ['relateditem', 0, ['type', 'host'], 'part', 0]);

            var date1 = this.pathInXml(refEl, ['relateditem', 0, ['type', 'host'], 'origininfo', 0, 'dateissued', 0]);

            var date2 = this.pathInXml(refEl, ['relateditem', 0, ['type', 'host'], 'origininfo', 0, 'datecreated', 0]);

            var date3 = this.pathInXml(refEl, ['origininfo', 0, 'datecreated', 0]);

            var date4 = this.pathInXml(refEl, ['relateditem', 0, ['type', 'host'], 'origininfo', 0, 'copyrightdate', 0]);

            var date5 = this.pathInXml(refEl, ['origininfo', 0, 'copyrightdate', 0]);

            var date6 = this.pathInXml(part, ['date', 0]);

            var year = /([0-9]{4})/.exec(date1 || date2 || date3 || date4 || date5 || date6);

            var href = this.pathInXml(refEl, ['location', 0, 'url', 0, '_']);

            var note = this.pathInXml(refEl, ['note', 0]);

            return {

              authors: authors,

              doi: doi ? doi.replace('doi: ', '') : doi,

              href: href,

              id:uuidv4(),

              title: this.pathInXml(refEl, ['titleinfo', 0, 'title', 0]),

              translated: undefined,

              year: year !== null ? year[1] : undefined,//Year, regular expression numbers only

              publishedIn: this.pathInXml(refEl, ['relateditem', 0, ['type', 'host'], 'titleinfo', 0, 'title', 0]),

              publisher: this.pathInXml(refEl, ['origininfo', 0, 'publisher', 0]),

              city: this.pathInXml(refEl, ['origininfo', 0, 'place', 0, 'placeterm', 0, ['type', 'text'], '_']),

              language: this.pathInXml(refEl, ['language', 0, 'languageterm', 0, ['type', 'text'], '_']),

              edition: this.pathInXml(refEl, ['origininfo', 0, 'edition', 0]),

              volume: this.pathInXml(part, ['detail', 0, ['type', 'volume'], 'number', 0]),

              issue: this.pathInXml(part, ['detail', 1, ['type', 'issue'], 'number', 0]),

              spage: this.pathInXml(part, ['extent', 0, ['unit', 'pages'], 'start', 0]),

              epage: this.pathInXml(part, ['extent', 0, ['unit', 'pages'], 'end', 0]),

              numpages: undefined,

              editors: undefined,

              type: refTypes[this.pathInXml(refEl, ['genre', ['authority', 'local'], '_'])?.toLowerCase()] || refTypes['section'],

              firstauthor: authors[0] || [],

              isbn: this.pathInXml(refEl, ['relateditem', 0, ['type', 'host'], 'identifier', 0, ['type', 'isbn'], '_']),

              note: note

            };
          })
          let refsToLocalType = mapedRefs.map(mapRef1);
          this.getRefWithCitation(refsToLocalType,'file')
        }
      })
    }catch(e){
      console.error('could not parse xml file');
    }
  }

  pathInXml(xmlEl: any, args: any[]) {
    let getInnerItem = (xmlEl: any, pathArgs: any[]) => {
      let currArg = pathArgs.shift();
      let newTarget

      if (xmlEl == undefined) return xmlEl
      if (currArg == '_') {
        return xmlEl.textContent
      } else if (typeof currArg == 'string') {
        let children = Array.from(xmlEl.childNodes)
        newTarget = children.filter((x: HTMLElement) => x.tagName.toLowerCase() == currArg.toLowerCase());
        if (newTarget.length == 0) {
          //console.error('No els with name '+currArg,'Children are ',xmlEl.childNodes)
          return undefined
        }
      } else if (typeof currArg == 'number') {
        newTarget = xmlEl[currArg];
        if (!newTarget) {
          //console.error('No el on index '+currArg)
          return xmlEl
        }
      } else if (currArg instanceof Array && xmlEl instanceof Array) {
        let attr = currArg[0];
        let val = currArg[1];
        let elWithAttr = xmlEl.find(el => el.getAttribute(attr) == val)
        if (elWithAttr) {
          newTarget = elWithAttr;
        } else {
          //console.error('in xmlEl ',xmlEl,'there is no el with ',currArg)
          return undefined
        }
      } else if (currArg instanceof Array) {
        let attr = currArg[0];
        let val = currArg[1];
        if (xmlEl.getAttribute(attr) == val) {
          newTarget = xmlEl;
        } else {
          //console.error('xmlEl ',xmlEl,'has no ',currArg)
          return undefined
        }
      } else if (currArg == undefined) {
        return xmlEl
      }
      return getInnerItem(newTarget, pathArgs)
    }
    let result = getInnerItem(xmlEl, args)
    if (result && result.firstChild && result.firstChild.nodeName && result.firstChild.nodeName == '#text') {
      result = result.textContent
    }
    return result
  }
}
