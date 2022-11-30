import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { data } from './exampleData';
import { getYdocData } from './getYdocData';
//@ts-ignore
//import * as pdfMake from 'pdfmake'
//@ts-ignore
import pdfMake from "pdfmake/build/pdfmake.js";
//@ts-ignore
import vfs from "pdfmake/build/vfs_fonts.js";
import { YdocService } from '@app/editor/services/ydoc.service';
import { articleSection } from '@app/editor/utils/interfaces/articleSection';
import html2canvas from 'html2canvas'
import { Subject } from 'rxjs';
import { FormControl, Validators } from '@angular/forms';
import { ProsemirrorEditorsService } from '@app/editor/services/prosemirror-editors.service';
import { EditorState } from 'prosemirror-state';
import { EditorView as EditorViewCM, EditorState as EditorStateCM } from '@codemirror/basic-setup'
import { basicSetup } from '@codemirror/basic-setup';
import { javascript } from '@codemirror/lang-javascript';
import { EditorView } from 'prosemirror-view';

import { ServiceShare } from '@app/editor/services/service-share.service';
import { uuidv4 } from 'lib0/random';
import { environment } from '@env';
pdfMake.vfs = vfs;

pdfMake.fonts = {
  Roboto: {
    normal: 'Roboto-Regular.ttf',
    bold: 'Roboto-Medium.ttf',
    italics: 'Roboto-Italic.ttf',
    bolditalics: 'Roboto-MediumItalic.ttf'
  },
  CodeFont: {
    normal: 'SourceCodePro-Regular.ttf',
    bold: 'SourceCodePro-Medium.ttf',
    italics: 'SourceCodePro-Italic.ttf',
    bolditalics: 'SourceCodePro-MediumItalic.ttf'
  }
}

let pageSizeDimensions = { // in milimeters
  'A0': { width: 841, height: 1188 },
  'A1': { width: 594, height: 841 },
  'A2': { width: 420, height: 594 },
  'A3': { width: 297, height: 420 },
  'A4': { width: 210, height: 297 },
  'A5': { width: 148, height: 210 },
}

export var pageDimensionsInPT = {
  '4A0': [4767.87, 6740.79],
  '2A0': [3370.39, 4767.87],
  A0: [2383.94, 3370.39],
  A1: [1683.78, 2383.94],
  A2: [1190.55, 1683.78],
  A3: [841.89, 1190.55],
  A4: [595.28, 841.89],
  A5: [419.53, 595.28],
  A6: [297.64, 419.53],
  A7: [209.76, 297.64],
  A8: [147.40, 209.76],
  A9: [104.88, 147.40],
  A10: [73.70, 104.88],
  B0: [2834.65, 4008.19],
  B1: [2004.09, 2834.65],
  B2: [1417.32, 2004.09],
  B3: [1000.63, 1417.32],
  B4: [708.66, 1000.63],
  B5: [498.90, 708.66],
  B6: [354.33, 498.90],
  B7: [249.45, 354.33],
  B8: [175.75, 249.45],
  B9: [124.72, 175.75],
  B10: [87.87, 124.72],
  C0: [2599.37, 3676.54],
  C1: [1836.85, 2599.37],
  C2: [1298.27, 1836.85],
  C3: [918.43, 1298.27],
  C4: [649.13, 918.43],
  C5: [459.21, 649.13],
  C6: [323.15, 459.21],
  C7: [229.61, 323.15],
  C8: [161.57, 229.61],
  C9: [113.39, 161.57],
  C10: [79.37, 113.39],
  RA0: [2437.80, 3458.27],
  RA1: [1729.13, 2437.80],
  RA2: [1218.90, 1729.13],
  RA3: [864.57, 1218.90],
  RA4: [609.45, 864.57],
  SRA0: [2551.18, 3628.35],
  SRA1: [1814.17, 2551.18],
  SRA2: [1275.59, 1814.17],
  SRA3: [907.09, 1275.59],
  SRA4: [637.80, 907.09],
  EXECUTIVE: [521.86, 756.00],
  FOLIO: [612.00, 936.00],
  LEGAL: [612.00, 1008.00],
  LETTER: [612.00, 792.00],
  TABLOID: [792.00, 1224.00]
};
export function isNumeric(str: any) {
  if (typeof str != "string") return false // we only process strings!
  //@ts-ignore
  return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
    !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}

function mmToPx(mm: number) {
  return mm * 3.7795275591;
}

function pxToPt(px: number) {
  return px * 0.75;
}

function ptToPx(pt: number) {
  return pt / 0.75;
}

function componentToHex(c: number) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r: number, g: number, b: number, f?: number) {
  if (r == 0 && g == 0 && b == 0) {
    return undefined
  }
  let val = "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
  return val
}

@Component({
  selector: 'app-edit-before-export',
  templateUrl: './edit-before-export.component.html',
  styleUrls: ['./edit-before-export.component.scss']
})
export class EditBeforeExportComponent implements AfterViewInit {

  elementOuterHtml?: string[]
  elements: Element[] = []
  sectionsContainers: string[][] = []
  importantLeafNodes: string[] = [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p',
    'table',
    'br',
    'img',
    'block-figure',
    'ol',
    'ul',
    'math-display',
    'page-break',
    'form-field-inline-view',
    'form-field-inline',
  ];

  @ViewChild('elementsContainer', { read: ElementRef }) elementsContainer?: ElementRef;
  @ViewChild('spinnerEl', { read: ElementRef }) spinnerEl?: ElementRef;
  @ViewChild('headerPMEditor', { read: ElementRef }) headerPMEditor?: ElementRef;
  @ViewChild('footerPMEditor', { read: ElementRef }) footerPMEditor?: ElementRef;

  pageSize: 'A0' | 'A1' | 'A2' | 'A3' | 'A4' | 'A5' = 'A4';
  data: any
  readyRendering = new Subject<any>();
  pageMarg = [72, 72, 72, 72];

  margTopControl = new FormControl(this.pageMarg[0])
  margRightControl = new FormControl(this.pageMarg[1])
  margBottomControl = new FormControl(this.pageMarg[2])
  margLeftControl = new FormControl(this.pageMarg[3])

  headerPmContainer?: {
    editorID: string;
    containerDiv: HTMLDivElement;
    editorState: EditorState;
    editorView: EditorView;
    dispatchTransaction: any;
  }

  footerPmContainer?: {
    editorID: string;
    containerDiv: HTMLDivElement;
    editorState: EditorState;
    editorView: EditorView;
    dispatchTransaction: any;
  }


  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: { selected: 'pdf' | 'rtf' | 'msWord' | 'jatsXml' },
    private changeDetectorRef: ChangeDetectorRef,
    public dialogRef: MatDialogRef<EditBeforeExportComponent>,
    private http: HttpClient,
    private serviceShare: ServiceShare,
    private ydocService: YdocService,
    private prosemirrorEditorsService: ProsemirrorEditorsService
  ) {
    this.data = data;
  }
  codemirrorJsonEditor?: EditorViewCM
  @ViewChild('codemirrorJson', { read: ElementRef }) codemirrorJson?: ElementRef;
  fillElementsArray() {
    this.elements = []
    let loopChildren = (element: HTMLElement) => {
      if (element instanceof HTMLElement && element.tagName) {
        let elTag = element.tagName.toLocaleLowerCase();
        if (this.importantLeafNodes.includes(elTag)) {
          this.elements.push(element)
        } else if (element.childNodes.length > 0) {
          element.childNodes.forEach((child) => {
            loopChildren(child as HTMLElement);
          })
        }
      }
    }
    loopChildren(this.elementsContainer?.nativeElement)
  }

  renderCodeMirrorEditor() {
    let settings = this.ydocService.printMap!.get('pdfPrintSettings');

    settings = this.pdfSettingsSave;
    this.ydocService.printMap!.set('pdfPrintSettings',settings);
    if(Object.keys(settings).length == 0 ){
    }else{
      this.pdfSettingsSave = settings
    }
    let pdfPrintSettings = settings ? settings : (
      this.ydocService.articleData &&
      this.ydocService.articleData.layout &&
      this.ydocService.articleData.layout.settings &&
      this.ydocService.articleData.layout.settings.print_settings
    ) ? this.ydocService.articleData.layout.settings.print_settings : {};
    if (!settings) {
      this.ydocService.printMap!.set('pdfPrintSettings', pdfPrintSettings);
    }
    this.codemirrorJsonEditor = new EditorViewCM({
      state: EditorStateCM.create({
        doc:
          `${JSON.stringify(pdfPrintSettings, null, "\t")}`,
        extensions: [basicSetup, javascript()],
      }),

      parent: this.codemirrorJson?.nativeElement,
      /* dispatch:()=>{

      }, */
    })
  }
  renderProsemirrorEditors() {
    let header = this.headerPMEditor?.nativeElement
    this.headerPmContainer = this.prosemirrorEditorsService.renderSeparatedEditorWithNoSync(header, 'pm-pdf-menu-container', 'Header should be displayed here.')
    let footer = this.footerPMEditor?.nativeElement
    this.footerPmContainer = this.prosemirrorEditorsService.renderSeparatedEditorWithNoSync(footer, 'pm-pdf-menu-container', 'Footer should be displayed here.')
  }

  async ngAfterViewInit() {
    this.renderCodeMirrorEditor()
    this.elementOuterHtml = []
    this.renderProsemirrorEditors()
  }

  tablepadding = 6;

  // [left, top, right, bottom]

  basicFont = 11

  pdfSettingsSave: any = {
    "nodes": {
      "h1": { "marginTop": 10, "marginBottom": 40, "fontSize": this.basicFont+4 },
      "h2": { "marginTop": 5, "marginBottom": 30, "fontSize": this.basicFont+2 },
      "h3": { "marginTop": 5, "marginBottom": 25, "fontSize": this.basicFont+1 },
      "h4": { "marginTop": 5, "marginBottom": 20, "fontSize": this.basicFont },
      "h5": { "marginTop": 4, "marginBottom": 15, "fontSize": this.basicFont-1 },
      "h6": { "marginTop": 3, "marginBottom": 10, "fontSize": this.basicFont-2 },
      "p": { "marginTop": 2, "marginBottom": 8, "fontSize": this.basicFont },
      "table": { "marginTop": 5, "marginBottom": 10 },
      "block-figure": { "marginTop": 10, "marginBottom": 40 },
      "ol": { "marginTop": 5, "marginBottom": 10, "fontSize": this.basicFont },
      "ul": { "marginTop": 5, "marginBottom": 10, "fontSize": this.basicFont },
      "math-display": { "marginTop": 10, "marginBottom": 10 },
      "form-field": { "marginTop": 5, "marginBottom": 10, "fontSize": this.basicFont },
      "br": { "marginTop": 2, "marginBottom": 2 },
      "form-field-inline": { "marginTop": 2, "marginBottom": 2, "fontSize": this.basicFont }
    },
    "maxFiguresImagesDownscale": "80%",
    "maxMathDownscale": "80%",
    "pageMargins": {
      "marginTop": 72,
      "marginRight": 72,
      "marginBottom": 72,
      "marginLeft": 72
    },
    "pageFormat": {
      "A2": false,
      "A3": false,
      "A4": true,
      "A5": false
    },
    "minParagraphLinesAtEndOfPage": 1,
    "header": { "marginTop": 20, "marginBottom": 15, "fontSize": this.basicFont-4 },
    "footer": { "marginTop": 15, "marginBottom": 15, "fontSize": this.basicFont-4 }
  }

  closePdfPrintDialog() {
    this.dialogRef.close()
  }
  intervalID: any
  deg = 0
  resumeSpinner() {
    (this.spinnerEl!.nativeElement as HTMLImageElement).style.display = 'flex'
    this.intervalID = setInterval(() => {
      this.deg = this.deg + 30;
      if (this.deg == -360) {
        this.deg = 0;
      }
      (this.spinnerEl!.nativeElement.firstChild as HTMLImageElement).style.webkitTransform = 'rotate(' + this.deg + 'deg)';
      //@ts-ignore
      (this.spinnerEl!.nativeElement.firstChild as HTMLImageElement).style.mozTransform = 'rotate(' + this.deg + 'deg)';
      //@ts-ignore
      (this.spinnerEl!.nativeElement.firstChild as HTMLImageElement).style.msTransform = 'rotate(' + this.deg + 'deg)';
      //@ts-ignore
      (this.spinnerEl!.nativeElement.firstChild as HTMLImageElement).style.oTransform = 'rotate(' + this.deg + 'deg)';
      //@ts-ignore
      (this.spinnerEl!.nativeElement.firstChild as HTMLImageElement).style.transform = 'rotate(' + this.deg + 'deg)';
    }, 100)
  }

  stopSpinner = () => {
    if (this.intervalID) {
      (this.spinnerEl!.nativeElement as HTMLImageElement).style.display = 'none'

      clearInterval(this.intervalID);
      this.intervalID = undefined
    }
  }

  mathObj: any = {};

  fillSettings() {
    let oldSettings = JSON.parse(JSON.stringify(this.pdfSettingsSave));
    let settings: any
    let buildNodeSettings = (settingsFromUser: any) => {
      let nodeSettings: any;
      nodeSettings = JSON.parse(JSON.stringify(settingsFromUser.nodes));
      return nodeSettings;
    }
    let buildPdfSettings = (settingsFromUser: any) => {
      let pdfSettings: any = {};
      pdfSettings.maxFiguresImagesDownscale = settingsFromUser.maxFiguresImagesDownscale;
      pdfSettings.maxMathDownscale = settingsFromUser.maxMathDownscale;
      pdfSettings.minParagraphLinesAtEndOfPage = settingsFromUser.minParagraphLinesAtEndOfPage;
      pdfSettings.header = settingsFromUser.header;
      pdfSettings.footer = settingsFromUser.footer;
      pdfSettings.pageMargins = settingsFromUser.pageMargins;
      Object.keys(settingsFromUser.pageFormat).forEach((format) => {
        if (settingsFromUser.pageFormat[format]) {
          pdfSettings.pageFormat = format;
        }
      })
      return pdfSettings;
    }
    let buildSettings = (settingsFromUser: any) => {
      let settings: any = {};
      //nodes settings
      let nodesSettings = buildNodeSettings(settingsFromUser);
      //other pdf settings
      let pdfSettings = buildPdfSettings(settingsFromUser);
      settings.nodes = nodesSettings;
      settings.pdf = pdfSettings;
      return settings
    }
    try {
      let data = JSON.parse(this.codemirrorJsonEditor!.state.doc.sliceString(0, this.codemirrorJsonEditor!.state.doc.length))
      //this.pdfSettingsSave = data

      settings = buildSettings(data);
      this.ydocService.printMap!.set('pdfPrintSettings', data);
    } catch (e) {
      console.error(e);
      //this.pdfSettingsSave = oldSettings
      settings = buildSettings(oldSettings);
    }
    return settings
  }

  renderPdf(){
    let headerPmNodesJson = this.headerPmContainer.editorView.state.doc.toJSON();
    let footerPmNodesJson = this.footerPmContainer.editorView.state.doc.toJSON();
    let pdfSettings: any = this.fillSettings()
    let articleId = this.ydocService.articleData.uuid;
    //https://ps-article-storage.dev.scalewest.com/api/article/dfc43b3b-4700-4234-b398-bd9bec17db0d
    let articleData = getYdocData(this.ydocService.ydoc);
    //let articleData:any = {};
    articleData.pdfSettings = pdfSettings;
    articleData.headerPmNodesJson = headerPmNodesJson;
    articleData.footerPmNodesJson = footerPmNodesJson;
    /* this.http.post('/proxy123/asd',articleData).subscribe((data)=>{
      this.serviceShare.NotificationsService.newNotificationEvent({
        event:'A new pdf has been rendered. Click for view.',date:Date.now(),eventId:uuidv4(),
      })
    }) */
    /* this.http.post(environment.print_pdf+'/'+articleId+'/pdf/export',articleData).subscribe((data)=>{
      console.log('pdf',data);
    }) */
    /* this.http.post('https://ps-api.dev.scalewest.com/api/articles/items/'+articleId+'/pdf/export',articleData).subscribe((data)=>{
      console.log('pdf',data);
    }) */
    /* http://127.0.0.1:3003 */
    this.http.post('http://127.0.0.1:3003/article/pdf',articleData).subscribe((data)=>{
      console.log('pdf',data);
    })
    /* this.http.post('http://127.0.0.1:3003/article/create',articleData).subscribe((data)=>{
      this.serviceShare.NotificationsService.newNotificationEvent({
        event:'A new pdf has been rendered. Click for view.',date:Date.now(),eventId:uuidv4(),
      })
    }) */
    /* 'proxy/api/article/' */
    /* this.http.post('http://localhost:8080/api/article/'+articleId,{headerPmNodesJson,footerPmNodesJson,pdfSettings}).subscribe((articleData:any)=>{
    }) */

    /* this.http.post('http://localhost:3030/print/pdf/'+articleId,{headerPmNodesJson,footerPmNodesJson,pdfSettings}).subscribe((data:any)=>{
      let downloadlonk = data.downloadlink;
      this.serviceShare.NotificationsService.newNotificationEvent({
        event:'A new pdf has been rendered. Click for view.',date:Date.now(),eventId:uuidv4(),
        downloadlonk
      })
    }) */
    this.dialogRef.close()
  }


}
