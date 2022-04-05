import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { data } from './exampleData';
//@ts-ignore
//import * as pdfMake from 'pdfmake'
//@ts-ignore
import pdfMake from "pdfmake/build/pdfmake.js";
//@ts-ignore
import vfs from "pdfmake/build/vfs_fonts.js";
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { YdocService } from '@app/editor/services/ydoc.service';
import { articleSection } from '@app/editor/utils/interfaces/articleSection';
import html2canvas from 'html2canvas'
import { Subject } from 'rxjs';
import { FormControl, Validators } from '@angular/forms';
import { getFontEmbedCSS, toBlob, toCanvas, toJpeg, toPixelData, toPng, toSvg } from 'html-to-image'
//@ts-ignore
import { applyVerticalAlignment, applyVerticalAlignmentv2 } from './alignFunc.js'

import { ProsemirrorEditorsService } from '@app/editor/services/prosemirror-editors.service';
import { EditorState } from 'prosemirror-state';
import { EditorView as EditorViewCM, EditorState as EditorStateCM } from '@codemirror/basic-setup'
import { basicSetup } from '@codemirror/basic-setup';
import { javascript } from '@codemirror/lang-javascript';
import { EditorView } from 'prosemirror-view';
import { image } from '@app/editor/utils/Schema/nodes/figure-nodes';
import { cellAround } from 'prosemirror-tables';
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

  articleSectionsStructure?: articleSection[]
  articleSectionsStructureFlat?: articleSection[]
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

  makeFlat() {
    let articleSectionsStructureFlat: any = []
    let makeFlat = (structure: articleSection[]) => {
      if (structure) {
        structure.forEach((section) => {
          if (section.active) {
            articleSectionsStructureFlat.push(section)
          }
          if (section.children.length > 0) {
            makeFlat(section.children)
          }
        })
      }

    }
    makeFlat(this.articleSectionsStructure!)
    this.articleSectionsStructureFlat = []
    this.articleSectionsStructureFlat = articleSectionsStructureFlat
    return articleSectionsStructureFlat
  }

  renderCodeMirrorEditor() {
    let settings = this.ydocService.printMap!.get('pdfPrintSettings');
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
    this.resumeSpinner()
    let articleElement = document.getElementById('app-article-element') as HTMLElement;
    let prosemirrorEditors = articleElement.getElementsByClassName('ProseMirror-example-setup-style');
    this.articleSectionsStructure = this.ydocService.articleStructure?.get('articleSectionsStructure');
    this.makeFlat()
    this.elementOuterHtml = []
    this.renderProsemirrorEditors()


    let loopChildrenRecursivly = (element: Element, sectionContainer: string[], section?: articleSection) => {
      Array.from(element.children).forEach((elChild) => {
        if (this.importantLeafNodes.includes(elChild.tagName.toLocaleLowerCase())) {
          let contaienrDiv = document.createElement('div');
          contaienrDiv.innerHTML = elChild.outerHTML
          if (section) {
            (contaienrDiv.firstChild as HTMLElement).setAttribute('section-name', section.title.name!);
          }
          sectionContainer.push(contaienrDiv.innerHTML)
          //this.elements.push(contaienrDiv.firstChild as HTMLElement);
        } else {
          loopChildrenRecursivly(elChild, sectionContainer, section)
        }
      })
    }

    Array.from(prosemirrorEditors).forEach((pmEdEl: Element, i) => {
      let sectionHtmlElementsContainer: string[] = []
      if (pmEdEl.children.length > 0) {
        loopChildrenRecursivly(pmEdEl, sectionHtmlElementsContainer, this.articleSectionsStructureFlat![i])
        this.sectionsContainers!.push(sectionHtmlElementsContainer);
      }
    })

    this.changeDetectorRef.detectChanges()
  }

  /* createPdfBinary(docDefinition:any) {
    var pdf = pdfmake.createPdf(docDefinition);
    return pdf.getDataUrl();
  } */
  async getDataUrl(img: HTMLImageElement) {
    //@ts-ignore
    //dataURLString = imageDataURI.encodeFromURL(src)
    img.crossOrigin = "anonymous"
    let canvas = document.createElement('canvas');

    if (!img.complete) {
      await new Promise((resolve, reject) => {
        img.onload = () => {
          resolve('loaded')
        }
      })
    }

    canvas.width = img.getBoundingClientRect().width;
    canvas.height = img.getBoundingClientRect().height;

    var ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0, img.getBoundingClientRect().width, img.getBoundingClientRect().height)

    return Promise.resolve(canvas.toDataURL('image/jpeg'));
  }

  bindHTML(div: HTMLDivElement, html: string) {
    div.innerHTML = html
  }
  tablepadding = 6;

  // [left, top, right, bottom]

  pdfSettingsSave: any = {
    "nodes": {
      "h1": { "marginTop": 10, "marginBottom": 40, "fontSize": "auto" },
      "h2": { "marginTop": 5, "marginBottom": 30, "fontSize": "auto" },
      "h3": { "marginTop": 5, "marginBottom": 25, "fontSize": "auto" },
      "h4": { "marginTop": 5, "marginBottom": 20, "fontSize": "auto" },
      "h5": { "marginTop": 4, "marginBottom": 15, "fontSize": "auto" },
      "h6": { "marginTop": 3, "marginBottom": 10, "fontSize": "auto" },
      "p": { "marginTop": 2, "marginBottom": 8, "fontSize": "auto" },
      "table": { "marginTop": 5, "marginBottom": 10 },
      "block-figure": { "marginTop": 10, "marginBottom": 40 },
      "ol": { "marginTop": 5, "marginBottom": 10, "fontSize": "auto" },
      "ul": { "marginTop": 5, "marginBottom": 10, "fontSize": "auto" },
      "math-display": { "marginTop": 10, "marginBottom": 10 },
      "form-field": { "marginTop": 5, "marginBottom": 10, "fontSize": "auto" },
      "br": { "marginTop": 2, "marginBottom": 2 },
      "form-field-inline": { "marginTop": 2, "marginBottom": 2, "fontSize": "auto" }
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
    "header": { "marginTop": 20, "marginBottom": 15, "fontSize": "auto" },
    "footer": { "marginTop": 15, "marginBottom": 15, "fontSize": "auto" }
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
  refreshContent = async () => {
    this.resumeSpinner()
    this.fillElementsArray()
    this.pageMarg = [];

    let pdfSettings: any = this.fillSettings()
    let margings = pdfSettings.pdf.pageMargins;
    this.pageMarg = [
      +margings.marginTop,
      +margings.marginRight,
      +margings.marginBottom,
      +margings.marginLeft,
    ]
    let elementsContainerElements = (this.elementsContainer?.nativeElement as Element)
    this.pageSize = pdfSettings.pdf.pageFormat;

    //elementsContainerElements.append(...this.elements)

    let fullHeight = elementsContainerElements.clientHeight;
    let pageFullHeight = pageDimensionsInPT[this.pageSize][1] // in pt
    let pageFullWidth = pageDimensionsInPT[this.pageSize][0]  // in pt
    let pageHeight = ptToPx(pageFullHeight) - this.pageMarg[0] - this.pageMarg[2];
    let pageWidth = ptToPx(pageFullWidth) - this.pageMarg[1] - this.pageMarg[3];
    let numberOfHorizontalLines = Math.floor(fullHeight / pageHeight);

    let tablePadding = this.tablepadding;;
    let pageInPoints = pxToPt(pageWidth);
    let pageheightInPoints = pxToPt(pageHeight);
    let singleimgOnRowWidth = pageInPoints - (tablePadding * 2);
    let twoImgOnRowWidth = (pageInPoints * 0.8) - (tablePadding * 2);
    let threeImgOnRowWidth = (pageInPoints * 0.6) - (tablePadding * 2);
    let fourImgOnRowWidth = (pageInPoints * 0.4) - (tablePadding * 2);

    let elementsContainer = document.getElementById('pm-elements-container') as HTMLDivElement;
    elementsContainer.style.width = pageWidth + "px";
    elementsContainer.style.backgroundColor = 'white';

    elementsContainer.style.paddingTop = this.pageMarg[0] + 'px';
    elementsContainer.style.paddingRight = this.pageMarg[1] + 'px';
    elementsContainer.style.paddingBottom = this.pageMarg[2] + 'px';
    elementsContainer.style.paddingLeft = this.pageMarg[3] + 'px';

    let previewContainer = document.getElementsByClassName('preview-container')[0] as HTMLDivElement;
    previewContainer.style.backgroundColor = 'gray';

    elementsContainer.style.margin = '10px auto'

    this.data.pageMargins = [pxToPt(this.pageMarg[0]), pxToPt(this.pageMarg[1]), pxToPt(this.pageMarg[2]), pxToPt(this.pageMarg[3])];

    let ImagesByKeys: { [key: string]: string } = {}

    let generateFigure = async (element: Element, style: any) => {
      let figuresObj = this.ydocService.figuresMap!.get('ArticleFigures');
      let figureID = element.getAttribute('figure_id')!;
      let figureTable: any = {
        color: 'black',
        layout: {
          paddingBottom: function paddingBottom(i: number, node: any) { return 0; },
          hLineWidth: function hLineWidth(i: number) { return 0; },
          vLineWidth: function vLineWidth(i: number) { return 0; },
        },
        table: {
          body: [],
          widths: '*',
          props: { type: 'figure' }
        },
        props: { type: 'figure-container' },
        alingment: 'center',
      }
      let figuresCount = element.firstChild?.childNodes.length!;
      let figuresDescriptions = element.childNodes.item(1)!;

      let figureHeader = figuresDescriptions.childNodes.item(0) as HTMLElement
      let figureDesc = figuresDescriptions.childNodes.item(1) as HTMLElement
      let figureLabel: any = []
      for (let j = 0; j < figureHeader.childNodes.length; j++) {
        figureLabel.push(await generatePDFData(figureHeader.childNodes[j] as HTMLElement, figureTable, { parentWidth: pageWidth, ...style }, element))
      }
      let figureDescription = document.createElement('form-field');
      figureDescription.style.fontSize = ptToPx(10) + 'px'
      element.parentElement?.append(figureDescription)
      let moveNodeInlineChildren = (node: HTMLElement, containerNode: HTMLElement) => {
        let findParagraphChild = (node: HTMLElement, container: HTMLElement) => {
          if (node.tagName == 'P') {
            //@ts-ignore
            if (container.lastChild && container.lastChild.tagName && container.lastChild.tagName == "P") {
              //@ts-ignore
              container.lastChild.append(...Array.from(node.childNodes).map((n) => {
                return (n as HTMLElement).cloneNode(true)
              }));
            } else {
              container.append(document.createElement('p'))
              //@ts-ignore
              container.lastChild.append(...Array.from(node.childNodes).map((n) => {
                return (n as HTMLElement).cloneNode(true)
              }));
            }
          } else if (node.tagName == 'MATH-DISPLAY') {
            container.append(node)
          } else {
            node.childNodes.forEach((ch) => {
              findParagraphChild(ch as HTMLElement, container);
            })
          }
        }
        findParagraphChild(node, containerNode);
      }
      for (let j = 0; j < figureDesc.childNodes.length; j++) {
        let descEl = figureDesc.childNodes[j] as HTMLElement
        moveNodeInlineChildren(descEl, figureDescription);
      }
      let separatorSymbols = ['.', ',', '/', ':', ';', '!', '?']
      let descriptions: any = [];
      let checkNextTextNodeAndSpace = (node: HTMLElement) => {
        if (!(node instanceof Text)) {
          if (node.childNodes && node.childNodes.length > 0) {
            checkNextTextNodeAndSpace(node.childNodes[0] as HTMLElement)
          }
        } else {
          if (!node.textContent?.startsWith(" ")) {
            node.textContent = " " + node.textContent
          }
        }
      }
      for (let i = 0; i < figuresCount; i++) {
        let descText = (figuresDescriptions.childNodes.item(i + 2) as HTMLElement);
        let description: any = [];
        for (let j = 1; j < descText.childNodes.length; j++) {
          let descEl = descText.childNodes[j] as HTMLElement
          if (figuresCount > 1) {
            let separator: any
            let lastSymbol = figureDescription.childNodes[figureDescription.childNodes.length - 1].textContent![figureDescription.childNodes[figureDescription.childNodes.length - 1].textContent!.length - 1];

            if (separatorSymbols.includes(lastSymbol)) {
              //strong.textContent = "&#032;" + String.fromCharCode(65 + i) + "&#032;";
              separator = document.createTextNode(" " + String.fromCharCode(65 + i))
            } else {
              //strong.textContent = "&#032;;&#032;" + String.fromCharCode(65 + i) + "&#032;";
              separator = document.createTextNode("; " + String.fromCharCode(65 + i))
            }
            //strong.style.fontSize = ptToPx(5) + 'px'
            //@ts-ignore
            if (figureDescription.lastChild && figureDescription.lastChild.tagName && figureDescription.lastChild.tagName == "P") {
              //@ts-ignore
              //figureDescription.lastChild.append(document.createTextNode("; " + String.fromCharCode(65 + i) + " "))
              figureDescription.lastChild.append(separator)
            } else {
              figureDescription.append(document.createElement('p'));
              //@ts-ignore
              //figureDescription.lastChild.append(document.createTextNode("; " + String.fromCharCode(65 + i) + " "))
              figureDescription.lastChild.append(document.createTextNode(String.fromCharCode(65 + i)))

            }
            checkNextTextNodeAndSpace(descEl)
          }
          moveNodeInlineChildren(descEl, figureDescription);
        }
      }

      let descriptionPDFNode = await generatePDFData(figureDescription, figureTable, { parentWidth: pageWidth, fontSize: 10, nodetype: 'figure-container', ...style }, element);
      descriptionPDFNode.alignment = 'justify'
      let bottomTable = {
        table: {
          widths: ['*'],
          body: [
            [{
              fillColor: '#fafaf8',
              borderColor: ['#e2e2dc', '#e2e2dc', '#e2e2dc', '#e2e2dc'],
              stack: [{ stack: [...figureLabel]/* , margin: 4 */ }, { stack: [descriptionPDFNode]/* , margin: 4 */ }, ...descriptions]
            }]
          ]
        }
      }
      let imageWidth = singleimgOnRowWidth;

      let imageRectangle = figuresObj[figureID].canvasData.a4Pixels

      let a4Rectangle = pageDimensionsInPT['A4']

      let imageA4Rectangle: number[] = [a4Rectangle[0] - (tablePadding * 2)];

      element.parentElement?.removeChild(figureDescription)

      imageA4Rectangle[1] = (imageRectangle[1] / imageRectangle[0]) * a4Rectangle[0]
      if (imageA4Rectangle[0] > pxToPt(pageWidth)) {
        imageA4Rectangle[0] = pxToPt(pageWidth) - (tablePadding * 2);
        imageA4Rectangle[1] = (imageRectangle[1] / imageRectangle[0]) * imageA4Rectangle[0];
      }

      figuresObj;
      figureID;
      let figImagesData = figuresObj[figureID].canvasData
      let dataURLSObj = this.ydocService!.figuresMap!.get('ArticleFiguresDataURLS');
      let fullTableWidth = imageA4Rectangle[0]
      let fullTableHeight = imageA4Rectangle[0]
      let nCol = figImagesData.nOfColumns;
      let nRows = figImagesData.nOfRows;
      let widthOfCell = fullTableWidth / nCol
      let heightOfCell = fullTableHeight / nRows
      let imagesTable: any = {
        color: 'black',
        layout: {
          paddingBottom: function paddingBottom(i: number, node: any) { return 0; },
          paddingTop: function paddingBottom(i1: number, node: any) {
            applyVerticalAlignment(node, i1, 'center')
            return 0;
          },
          paddingRight: function paddingBottom(i: number, node: any) { return 0; },
          paddingLeft: function paddingBottom(i: number, node: any) { return 0; },
          hLineWidth: function hLineWidth(i: number) { return 0; },
          vLineWidth: function vLineWidth(i: number) { return 0; },
        },
        table: {
          body: [],
          widths: [],
        },
        width: fullTableWidth,
        props: { initProps: {} },
        alingment: 'center',
      }
      let bodyRows = [];
      let widthPercentage = 100 / nCol + '%';
      for (let i = 0; i < nCol; i++) {
        imagesTable.table.widths.push(widthPercentage);
      }
      for (let i = 0; i < figImagesData.figRows.length; i++) {
        let figureRow = figImagesData.figRows[i];
        let tablerow: any = [];
        for (let j = 0; j < nCol; j++) {
          if (figureRow[j]) {
            let cel = figureRow[j].container
            let imageName = cel.url.replace('https://s3-pensoft.s3.eu-west-1.amazonaws.com/public/').split('.')[0]
            if (!ImagesByKeys[imageName]) {
              ImagesByKeys[imageName] = dataURLSObj[cel.url];
            }
            tablerow.push({ image: imageName, fit: [widthOfCell, heightOfCell], alignment: 'center' })
          } else {
            tablerow.push({})
          }
        }
        imagesTable.table.body.push(tablerow);
      }

      let columns = {
        columns: [
          { width: '*', text: '' },
          imagesTable,
          { width: '*', text: '' },
        ],
        props: {}
      }


      figureTable.table.body.push([columns]);

      figureTable.table.body.push([bottomTable])
      return Promise.resolve(figureTable);

    }

    //let math_url_obj = this.ydocService.mathMap?.get('dataURLObj');
    //let math_data_url_obj: any = {math_url_obj}
    let math_data_url_obj: any = this.mathObj;

    let attachStylesToNode = (
      node: any,
      nodeStyles: any,
      parentStyle: any,
      element: Element,
      appendParentStyles: boolean,
      parentElement: Element | undefined,
      provideTag: string) => {
      let tag = element.tagName.toLocaleLowerCase()
      if (provideTag !== '') {
        tag = provideTag
      }
      if (parentStyle && parentStyle.parentWidth) {
        nodeStyles.parentWidth = parentStyle.parentWidth
      }
      if (parentStyle && !parentStyle.parentHasMargin && pdfSettings.nodes[tag]) {
        let nS = pdfSettings.nodes[tag] // node settings
        let margin = [0, nS.marginTop, 0, nS.marginBottom];
        node.margin = margin;
        /* if(nS.fontSize !=='auto'){
          let fontSize = +nS.fontSize;
          nodeStyles.fontSize = fontSize;
        } */
        nodeStyles.parentHasMargin = true;
      }
      if (parentStyle && parentStyle.parentHasMargin) {
        nodeStyles.parentHasMargin = true;
      }
      if (parentStyle && appendParentStyles) {
        Object.keys(parentStyle).forEach((key) => {
          if (!nodeStyles[key] &&
            key !== 'text' &&
            key !== 'stack' &&
            key !== 'table' &&
            key !== 'columns' &&
            key !== 'margin' &&
            key !== 'image'
          ) {
            nodeStyles[key] = parentStyle[key];
          }
        })
      }
      Object.assign(node, nodeStyles);
      let nS = pdfSettings.nodes[tag]
      if (nS && nS.fontSize && nS.fontSize !== 'auto') {
        let fontSize = +nS.fontSize;
        node.fontSize = fontSize;
        nodeStyles.fontSize = fontSize;
      }
      if (parentElement &&/* nS&&nS.fontSize&& */
        pdfSettings.nodes[parentElement?.tagName.toLocaleLowerCase()!] && parentStyle &&
        typeof parentStyle.fontSize == 'number' &&
        typeof node.fontSize == 'number') {
        if (pdfSettings.nodes[parentElement?.tagName.toLocaleLowerCase()!].fontSize !== 'auto') {
          node.fontSize = parentStyle.fontSize;
        }
      }
    }

    let loopNodeChildrenAndRunFunc = async (element: HTMLElement, whenTagEquals: string[] | string, func: (element: HTMLElement) => Promise<any>) => {
      let tag = element.tagName ? element.tagName.toLocaleLowerCase() : undefined;
      if (tag && ((typeof whenTagEquals == "string" && whenTagEquals == tag) || (whenTagEquals instanceof Array && whenTagEquals.includes(tag)))) {
        await func(element)
      }
      if (element.childNodes.length > 0) {
        let ch = Array.from(element.childNodes);
        for (let i = 0; i < ch.length; i++) {
          let child = ch[i];
          await loopNodeChildrenAndRunFunc(child as HTMLElement, whenTagEquals, func);
        }
      }
      return Promise.resolve(true)
    }

    let mainNodes = this.elements;
    let headerCh = Array.from(this.headerPmContainer?.editorView.dom.childNodes!)
    let footerCh = Array.from(this.footerPmContainer?.editorView.dom.childNodes!)
    let generateMath = async (el:HTMLElement) => {
      return loopNodeChildrenAndRunFunc(el, ['math-inline', 'math-display'], async (element: HTMLElement) => {
        return new Promise((resolve, reject) => {
          let mathEl = (element.getElementsByClassName('katex-display')[0] || element.getElementsByClassName('math-render')[0] /* || element */)
          //let width = pxToPt(mathEl.getBoundingClientRect().width);
          let math_id = element.getAttribute('mathid')!
          //math_data_url_obj[math_id] = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKgAAAEuCAYAAAAa1VnFAAAAAXNSR0IArs4c6QAAF1xJREFUeF7tnQm0dtc5x/9NgyZYomJWipTQoC0hUkHbZUpbxNDUGIqIMbQJS7C0hjatpYOxU8xKJFSMiXmKGBcVrUgoWkOpkBShFU3XL+/e9+775n3vd973/T/vvd/9/nutb+W73z3nf/Z59u88e+/nec7J/ZQWCxxiC9zvEPctXYsFdNCA3l/SW0k6qY0F/VmnT2+U9B8Zz6NngXVgcFrh0yQ9yyR4tqTbTVqROSQWWAToAyS9raR/3kIf8Z4/L+ndJf23pEdJ+rcl18XLvoWkt5f0rpIA8oskvWU7/psk/cgW+nyYL3G+pCdIeqCkd5Z0oaRXznWYMcfef7+FG5nSn327MQ/oKZJ+W9LbSfpISf+whZv4IEkvbdf5LUlfIIkpe0p7G0lfIuliSbdIwiAncvtoSY+R9FnNCGdKesOcQb5X0sdL+mpJ1xUba0p/VgIUz/Q7kl4j6dGS/rf4Brr8F0v62vbDt0r6/hWv28//BEl/teK5R+3wR7aZ5PclfeaCm/s9Se/UHmYe6up2rP6sBCgHv4OkOxY8eZU3wmbphySd2y7yiZL+YoULcv5PSLpJ0rNXOO8oHnqpJP48R9J3LbjBt26b0ju3dPPH6s/KgG6p3/e5zDtK+tW2pnyVpMe2denU/ry5pDdb8Zyp2sfTcddI+mBJnyHpDw5BxzfqT1+D4oFYLzxU0q9JevmSGzu9rU3PkPRqSb8u6V8WHPsQSR8u6V2aFuD9zwRjsax4cTvuWklfM+GcHLJrgVOHmYexHG3+AW3Z9meSflfS/y8xHOvWD5WEp/1ZSf/e9gRonSbpU9q//cqcM2Dz+t6SWFr0tl9/+jFcD1bYAP9i4wlH818c0AF9agOUTr+npHMk/etwIU5g8wIwTL2/KelDGoCP62Lt+B46+g1Jt7UNzE9JunwiSd8o6fPbsV/VjDTx1AM/7Esl3dzW8QfRGQb6xxok4/qTzeMz20YS73qJpF+e6yAb5G9onhdQYAGHQcMRPU0Sm9jrJX1qW5Lxb73h2GDn/SS9vv3jsv509th3sMH9I0l/I+nxLVTI5vyz+0E8Wezmzmthm8+VhKHpCI3wzrdLuqDt8AGVzvcN1SdL+vN2LE8R0wo3jxH6z8QnCQtNaYS5floSTxYNz86UX90+TtLXSWKjNcXbz/fnZEl/2h7er6ju7BL9r5TEQz2uPwHvD9u9ER357gVw4ahe2CIAOAggp72kOasXSEKHZdRVkvCeOB9sRntwg3g+krKoP73rMHaZpOe1P/w7a2aWdkR1njJSTDySpwEDE1f8CEn/1JTYsDy37ew5mYwNcdJvbrtBntT/a8cSx+QGeCK4Uab/75H0M5KYsqc2lhD9CQd+vPLdU09e8zhCL4S88DTzjamK5U2fcZhd5iFm1mFAae+/xQjI2NermyN4YoOS3zEmeMaPbSDgTdm4/NxwIs7nO9r44x17A2aOBxZ+T+gRPVj5wcYAx/ZZ8wckfctw/qL+8OvuWeejRTCF57yibXrvNThrDQYfAwMX6xO8aG/A9YHN9RLCea8GJscxbY9r0LPmpmQ6wFNCaGPVRsD5ynbSkxvkq2psejwzAF71PVr4ipgiswdP+HyUAaMSAeGBflLzpJtef5Xz8XB97zCuP1nb8Yd9xp80wfn1aQdp9J7MnC9rDuvDJN3Tkih90wNIfVyBF8i/TNIvtWss6w+/JnsI1M+fyyT2ZQKeGQ+9J+/d3eu47gNg1gY0ngwW2K9tf/o6Y96IwPTlc/+Id7p1FWu3pQUPAZklPMJdK54/9XAGgmA/GwC8PSE2GtmWF7WHhPX0fg07Eb/9UUm/0KZIBnubrXvwZfFPgveM4Y9L+vqhYyypXtF+xjv2DNP7Ntj+tk39HEL8FCjJ+j1s2GgxY5LcIUyIU6It6894PZaL3bacjw7aOEQeiB1AmbL704UXZKpj3UjneuAbt7xox97vlTUjGybikUyBaLC+4KaYYvr0N3XQWL98Tls495ueeu4qx5EOZG0FpGRZgIzGbELqlA3hsRoeiQHjHm9s4S4GaNlO+Vh66/yedS/ZIdaf3AMBctLIvbEjZ2yZmXjomRXY9BBxuaEdxN97n7E9Uznx6b4ZYrpn2t9ZIzYdIGOMAJSNDjbggVjUH67boXy4pB6PZQmCR2WDxhKEpeNL+poKD/V0ST/Zni6eQtw1i+ueeWAT9Y/DDePCEUKQdWJ3z+M08YVtPcG6hvXt1Abo39mmy1UC9lP1x+MwCvcOiH1qZjok8sBssqjxoI5rUOBgU8m0hHfCMxCOYcbZVvvhtncADHbSTMtk2Gh9TQ9E7C/Y9OJ8gI17pZ//OSRK2IfgaQF63DB3L8wUjd1oIzvo4gXZEPOgcK35/vTrcS4b9N76epeair9ua95zO6A9VYjXelCLg/VQT/8d3hARzmET0NeHkM60SHiF1CgbKTwoa1VSlqxjmPanepOemx8NUz3IRBx4IHmiWY+zLser9PXU/PXn16B4LDwO01Kf2rDVNrNafYDxYDzcjBdek8Z98cCxO8ercizT+b2xRkmEGdl3MNZ4VyBhmqUBOss6GuCxXsUp8fCiwT0CNP8FPmYS2NmvP305idfkoYE7nBmNsBMO6u/YnHdA3625bdYBnEAWoq9FiIGyUfi8YZSY/pkOmQL77poiBXb7dJbfs9Zgp8jNzxcsLAOOwD4hL3aD6K/SmJ6IRqziqdHHBkw5wMjgcf8Ep7k3BmFZdVXvG2tV4sN93d3DTTyk2GRbjQeDNTONWY8HvDsF1tlsbgCVNR5AjOvqHpUhpIeTIYyEZxzXn/0++gzBz2h9W4ObJR4/s/lhWbhff/r6njGj8eAAPaEu+GEm+nRJrxurmaAfrwe5PWw0GpcTAYgBW1YcjAYxMYAk07RKQx8j/mXb+d+7SJ7YgILYKaEsprpVWt8MsPsmnMKy5XVtMPGKRCqWeX+WOezemR7Huta+q8VDMF1tq2EHguVcc5H9GF+8If3dr7FDJ+TDDMjmb77hfFhLwgqbZThi5kV3ZONY/eEcbNtDmjhD4us4xz2bpG0ZcNl1ABuPSR0jxlkWIVh0/phIYGOwah0rMU42C4RoWIPzJPdGXz6pbTqIQvDgYTi8LFGFHnLh+L4uYz3LNMsDx3EMck/fHrSd568PEHh+/tsfMGDDDmScxl32gfT9oCvq+02T8gKEnuqaagx2z0xXH7MgyDxVg+MYIHbyTFHzDS9JtoxpCY+AzViDLqtXWOW6B31sr33gvh/RlmsAy+4bSJkdptbmltzLYQC0ZyGYSpje8VD9T79pvCR9xduxXgIWFu9j+rSHREoMdURFKe4gLMjeg1mEXTuwshZnFz51Y1tmnoMGlJ0imSpHW2d6n78u9lhl7evo90FrMEPwwJMFY+23jbqHyfd80IDy5LKo7x7yWG91dnhGD8vfiSSsunsfjcTuFg/MdEa4jCjC/Ls8k43aDmTgCckQ8K9+tWLVvh03xx80oIfBULzXBNzE7pjm2BgRk2MHPiU8xsPF0qPHFPs9oUsIhtDb1J0852yr0v0w2P6YfQigs0wHOWpCMDQq+3l1ZCyGWGRIQi2EpkhUkMMndrhOYwyoEuIBIanB2i+tWSCAzuAkoN7fh2I3T13jmM4bgSEZQBCbVCZhJna787t/dv1Ax26flxAXNUJrVO0QysGDE47q8UB+x24ar0zKkcwKG0LSvgS1q0sPD80DEkBnOWUyGj3r0yu4KNIda0OJHpAOBCoKKNjcLYrXAifemIA1Kd4x38zA8wDgedGiUp2M1fwHJyjKoE94cTz1M1qtA6/OUL7YizsODUhVHQmgsw0Ru9gxLckGqWdRmPKZfnu9bH8dYplXJM+M9yMjRbque2Y2TfyM92XThGckY7Wo4dXJZfe3VMeiDh6aXnFVxcWh0Q2gs0pxsibkoWlMr+SCKX7oBQ9AwYaHdOqUjRM6TP+A3t/3f59WhU696Pe1fP9+IPTCjF6j2UNyJDOOQpJg0kMQQKVeR9k3Sb1wdnwtgnUnBTRUjRM6Ar79Cqj724xMx0DdW1939hfFCEEtq3WluooCnZ6MoCCFqZ/lAdN/r9+dNNDH60EBdPZyHtM2aT+KHz6qxUFJ/fXq+j6+TNNAyjRN/ScblkVhof7OzbIX/rA7v+PbUryxQK5+/ltJFL1Qd9rfhqXelrUn18Mzrxs1OK5YDaCz4cKjUVkPdAAIFFSFL2vk5PFmF7V1IuvYcaOD90Wvrz+PNZVTjwp4bNj6qzEkDMYNEfW3rIPpY6/FPa5gW6ezAXTXary1SeU5IaZ5z7nMtgTpedOAsA9AM7X3KifWsRRbTG14cnLh/e3XRUF73psC5BMmHRtA9+KzSS6eQl6mfqrS2WWfUJuZqU/hqscF0JnFHLl4QlG8j4UHJm75x8nFr4rjfY8PoJIzFz964OTiN+dzre/BGy57qCSSiz9Uw3HfNdch7t5WupZc/FbMvN5FMsUnF78eOVs6K4AmF78l1Na7TABNLn49crZ0VgBNLn5LqK13mQCaXPx65GzprAA6M3Ry8VsCbtXLBNBdiyUXvyo9Wzg+gPqMnFy8z5Y7SgH0vomLdSuF5nPxy16WKxjGoysZQGdj6ygWQWfMxefDDYbnJoB6i0XGIUmxSAA1WCAfbrAYsUokHjQfbqhiy6IbQFMsYgGpSiSAplikii2LbgBNsYgFpCqRAJpikSq2LLoBNMUiFpCqRALozLIpFqkibEPdALprwBSLbAhTxekBdK9V8+GGCso20AygM+M5cvH5cMMGIC47NYB6c/H5cIMZ0gCaXLwZKa9cAE0u3kuUWS2AJhdvRsorF0CTi/cSZVYLoMnFm5HyygXQ5OK9RJnVAmhy8WakvHIBNLl4L1FmtQCaXLwZKa9cAPXZMx9u8NlyRymA+opF8uGGAFpgAV+xCEr5cIN5iOJBvcUi4/Dkww0GWANoikUMGNVJBNAUi9TRZVAOoCkWMWBUJxFAUyxSR5dBOYCmWMSAUZ1EAE2xSB1dBuUAmmIRA0Z1EgE0xSJ1dBmUA2iKRQwY1UkEUF8uPsUiBZwGUF8uPh9uCKAFFvDm4vPhBvMQxYMmF29GyisXQJOL9xJlVgugycWbkfLKBdDk4r1EmdUCaHLxZqS8cgE0uXgvUWa1AJpcvBkpr1wATS7eS5RZLYAmF29GyisXQH32TC7eZ8sdpQDqM2o+3OCzZQBdYssxl76OuTc9f51rHulz4kFnw+v439DMg3KKpKslXSXpuiNNUeHNBVBvNdM4VPmyiAHcAJpqJgNGdRIBNNVMdXQZlANoqpkMGNVJBNBUM9XRZVAOoKlmMmBUJxFAU81UR5dBOYCmmsmAUZ1EAJ3Z9mJJF0q6XtIFki6XdOM+Zj9Z0vmSLpJ0k2br2NuH4y9teudOGLqzJV0i6U7NNmy3tnNulnSZpBvaz1dKOqf1kb+fEC2A7g7z6ZLOkHSLpDsmjv5Jks6TdHcD+lRJd0m6RtJtkq6YqMNhZ0o6S9K17RwC/UA7ttPav92zgu5xfWgA3Tt8m+TSU81U8CgE0JlRHbn4fFkkgBZYwJuLz5dFzEMUD5pcvBkpr1wATS7eS5RZLYAmF29GyisXQJOL9xJlVgugycWbkfLKBdDk4r1EmdUCaHLxZqS8cgF0Zs/k4r1c2dQC6K4pk4u3YeUTCqA+WyYX77PljlIA3WvUTYpF8mWRAFpggZmko1gEnRHwfLjBMFzxoN5ikXFI8uGGAGqwQIpFLEasEokHTbFIFVsW3QCaYhELSFUiATTFIlVsWXQDaIpFLCBViQTQFItUsWXRDaApFrGAVCUSQGeWTbFIFWEb6gbQXQOmWGRDmCpOD6B7rbpJLj7FIgWEBlBfLj4fbgigBRbw5uLz4QbzEMWDJhdvRsorF0CTi/cSZVYLoMnFm5HyygXQ5OK9RJnVAmhy8WakvHIBNLl4L1FmtQCaXLwZKa9cAE0u3kuUWS2AJhdvRsorF0B99kwu3mfLHaUA6isWyYcbAmiBBXzFIijlww3mIYoH9RaLjMOTDzcYYA2gKRYxYFQnEUBTLFJHl0E5gKZYxIBRnUQATbFIHV0G5QCaYhEDRnUSATTFInV0GZQDaIpFDBjVSQTQFIvU0WVQDqApFjFgVCcRQH25+BSLFHAaQH25+Hy4IYAWWMCbi8+HG8xDFA+aXLwZKa9cAE0u3kuUWS2AJhdvRsorF0CTi/cSZVYLoMnFm5HyygXQ5OK9RJnVAmhy8WakvHIBNLl4L1FmtQCaXLwZKa9cAPXZM7l4ny13lAKor1gkH24IoAUW8BWLoJQPN5iHKB7UWywyDk8+3GCANYCmWMSAUZ1EAE2xSB1dBuUAmmIRA0Z1EgE0xSJ1dBmUA2iKRQwY1UkE0BSL1NFlUA6gKRYxYFQnEUBTLFJHl0E5gKZYxIBRnUQA9eXiUyxSwGkA9eXi8+GGAFpgAW8uPh9uMA9RPGhy8WakvHIBNLl4L1FmtQCaXLwZKa9cAE0u3kuUWS2AJhdvRsorF0CTi/cSZVYLoMnFm5HyygXQ5OK9RJnVAmhy8WakvHIB1GfP5OJ9ttxRCqA+o+bDDT5bBtAlthxz6euYe9Pz17nmkT4nHnQ2vA+X9DRJb5R0s2bB+1duOPKnSLpa0lWSrttQ64Q9PYB6q5lGkPJlEcNjFUBTzWTAqE4igKaaqY4ug3IATTWTAaM6iQCaaqY6ugzKATTVTAaM6iQCaKqZ6ugyKAfQVDMZMKqTCKAz214s6UJJ10u6QNLlkm7cx+wnSzpf0kWSbmqB/duH4y9teudOGLqzJV0i6U7NNmy3tnNIGFwm6Yb285WSzml95O8nRAugu8N8uqQzJN0i6Y6Jo3+SpPMk3d2APlXSXZKukXSbpCsm6nDYmZLOknRtO4dAP9CO7bT2b/esoHtcHxpA9w7fJrn0VDMVPAoBdGZURy4+XxYJoAUW8Obi82UR8xDFgyYXb0bKKxdAk4v3EmVWC6DJxZuR8soF0OTivUSZ1QJocvFmpLxyATS5eC9RZrUAmly8GSmvXACd2TO5eC9XNrUAumvK5OJtWPmEAqjPlsnF+2y5oxRA9xp1k2KRfFkkgBZYYCbpKBZBZwQ8H24wDFc8qLdYZBySfLghgBoskGIRixGrROJBUyxSxZZFN4CmWMQCUpVIAE2xSBVbFt0AmmIRC0hVIgE0xSJVbFl0A2iKRSwgVYkE0JllUyxSRdiGugF014ApFtkQporTA+heq26Si0+xSAGhAdSXi8+HGwJogQW8ufh8uME8RPGgycWbkfLKBdDk4r1EmdUCaHLxZqS8cgE0uXgvUWa1AJpcvBkpr1wATS7eS5RZLYAmF29GyisXQJOL9xJlVgugycWbkfLKBVCfPZOL99lyRymA+opF8uGGAFpgAV+xCEr5cIN5iOJBvcUi4/Dkww0GWANoikUMGNVJBNAUi9TRZVAOoCkWMWBUJxFAUyxSR5dBOYCmWMSAUZ1EAE2xSB1dBuUAmmIRA0Z1EgE0xSJ1dBmUA2iKRQwY1UkEUF8uPsUiBZwGUF8uPh9uCKAFFvDm4vPhBvMQxYMmF29GyisXQJOL9xJlVgugycWbkfLKBdDk4r1EmdUCaHLxZqS8cgE0uXgvUWa1AJpcvBkpr1wATS7eS5RZLYAmF29GyisXQH32TC7eZ8sdpQDqKxbJhxsCaIEFfMUiKOXDDeYhigf1FouMw5MPNxhgDaApFjFgVCcRQFMsUkeXQTmApljEgFGdRABNsUgdXQblAJpiEQNGdRIBNMUidXQZlANoikUMGNVJBNAUi9TRZVAOoCkWMWBUJxFAfbn4FIsUcBpAfbn4fLghgBZYwJuLz4cbzEMUD5pcvBkpr1wATS7eS5RZLYAmF29GyisXQJOL9xJlVgugycWbkfLKBdDk4r1EmdUCaHLxZqS8cgE0uXgvUWa1AJpcvBkpr1wA9dkzuXifLXeUAqjPqPlwg8+WAbTAlkiOufiiS5xYsm8C0sfhBAI3YrgAAAAASUVORK5CYII='
          if (!math_data_url_obj[math_id]) {
            toCanvas(mathEl as HTMLElement).then((canvasData: any) => {
              if (canvasData.toDataURL() == 'data:,') {
                html2canvas(mathEl as HTMLElement, { backgroundColor: null }).then((canvasData1) => {
                  math_data_url_obj[math_id] = canvasData1.toDataURL()
                  console.log(canvasData1.toDataURL());
                  resolve(true)
                })
              } else {
                math_data_url_obj[math_id] = canvasData.toDataURL()
                console.log(canvasData.toDataURL());

                resolve(true)
              }
            })
          } else {
            resolve(true)
          }
        })
      })
    }
    for (let i = 0; i < headerCh.length; i++) {
      let el = headerCh[i] as HTMLElement;
      await generateMath(el);
    }
    for (let i = 0; i < footerCh.length; i++) {
      let el = footerCh[i] as HTMLElement;
      await generateMath(el);
    }
    for (let i = 0; i < mainNodes.length; i++) {
      let el = mainNodes[i] as HTMLElement;
      await generateMath(el);
    }

    let generatePDFData = async (element: Element, parentPDFel: any, parentStyle: any, parentElement: Element | undefined) => {
      let defaultView = (element.ownerDocument || document).defaultView
      let tag = element.tagName.toLocaleLowerCase()
      if (
        tag == 'p' || tag == 'h1' || tag == 'h2' || tag == 'h3' || tag == 'h4' || tag == 'h5' ||
        tag == 'h6' || tag == 'span' || tag == 'strong' || tag == 'sub' || tag == 'sup' ||
        tag == 'code' || tag == 'citation' || tag == 'u' || tag == 'em' || tag == 'form-field' ||
        tag == 'form-field-inline' || tag == 'form-field-inline-view'
      ) {
        if (tag == 'span' && element.classList.contains('ProseMirror__placeholder')) {
          return Promise.resolve({})
        }
        let newEl: any = {}
        let textStyles = this.getTextStyles(defaultView!.getComputedStyle(element, null), element as HTMLElement);

        attachStylesToNode(newEl, textStyles, parentStyle, element, true, parentElement, '')

        if (element.childNodes.length == 1 && element.childNodes[0] instanceof Text) {
          newEl.text = element.childNodes[0].textContent;
          //Object.assign(newEl, textStyles)
        } else if ((element.childNodes.length > 1 &&
          (
            tag == 'h1' ||
            tag == 'h2' ||
            tag == 'h3' ||
            tag == 'h4' ||
            tag == 'h5' ||
            tag == 'h6' ||
            tag == 'form-field'
          )) || (element.childNodes.length == 1 && (
            tag == 'h1' ||
            tag == 'h2' ||
            tag == 'h3' ||
            tag == 'h4' ||
            tag == 'h5' ||
            tag == 'h6' ||
            tag == 'form-field'
          ))) {
          let children = element.childNodes;


          for (let i = 0; i < children.length; i++) {
            let node = children[i];
            let n: any
            if (node instanceof Text) {
              n = node.textContent
            } else if (node instanceof Element) {
              n = await generatePDFData(node, newEl, textStyles, element)
            }
            if (!newEl.stack) {
              newEl.stack = [];
            }
            newEl.stack.push(n);
          }

          //Object.assign(newEl, textStyles)
        } else {
          //serch for inline img , math , video or svg node;
          let inlineBreakableNodes = ['img', 'video', 'svg', 'math-inline'];
          let elementHasLBN = false
          let serchNodes = (el: HTMLElement) => {
            if (el.tagName) {
              let eltag = el.tagName.toLocaleLowerCase()
              if (inlineBreakableNodes.includes(eltag)) {
                elementHasLBN = true
              }
            }
            if (el.childNodes.length > 0) {
              el.childNodes.forEach((child) => {
                serchNodes(child as HTMLElement);
              })
            }
          }
          serchNodes(element as HTMLElement);
          if (elementHasLBN) {
            let elementInnerHTML = element.innerHTML;
            let counter = 0;
            let lineWidth = 0;

            let loopAndParseChildren = (element: HTMLElement, main?: boolean) => {
              if (element.tagName && !inlineBreakableNodes.includes(element.tagName.toLocaleLowerCase()) && element.childNodes.length > 0) {
                for (let i = 0; i < element.childNodes.length; i++) {

                  loopAndParseChildren(element.childNodes[i] as HTMLElement);
                }
                if (!main) {
                  let elementChildren = [...Array.from(element.childNodes)];
                  elementChildren.forEach((ch) => { element.removeChild(ch) });
                  let newOuterHTML = ''
                  elementChildren.forEach((ch) => {
                    if (ch instanceof HTMLElement) {
                      element.innerHTML = ch.outerHTML;
                    } else if (ch instanceof Text) {
                      element.innerHTML = ch.textContent!;
                    }
                    newOuterHTML += element.outerHTML
                    element.innerHTML = ''
                  })
                  let container = document.createElement('div');
                  container.innerHTML = newOuterHTML
                  element.replaceWith(...Array.from(container.childNodes))
                }
              } else if (element instanceof Text) {
                let countBefore = 0;
                let shouldStop = false;
                while (element.textContent!.length > 10 && !shouldStop) {
                  let count = element.textContent!.length - 1;
                  countBefore = +count;
                  while (element.textContent!.length - count < 20 && count > 0 && (element.textContent![count] !== " " || count == countBefore)) {
                    count--;
                  }
                  if (count !== 0 && countBefore !== count) {
                    element.splitText(count);
                  }
                  if (countBefore == count || count == 0) {
                    shouldStop = true
                  }
                }
              }
            }
            loopAndParseChildren(element as HTMLElement, true);
            newEl.stack = [];
            let elementFontSize: any = ((element as HTMLElement).style.fontSize && (element as HTMLElement).style.fontSize !== '') ? (element as HTMLElement).style.fontSize :
              (window.getComputedStyle(element).fontSize) ? window.getComputedStyle(element).fontSize : undefined
            if (elementFontSize && elementFontSize.includes('px')) {
              elementFontSize = +elementFontSize.replace('px', '');
            }
            let scaleDown = (newEl.fontSize / pxToPt(elementFontSize));
            (element as HTMLElement).style.fontSize = ptToPx(newEl.fontSize) + 'px';
            let buildLineTables = async (stack: any[], pageWidth: number, element: HTMLElement, parentStyle: any, elementStyle: any) => {
              let alignment = (elementStyle && elementStyle.alignment) ? elementStyle.alignment : (parentStyle && parentStyle.alignment) ? parentStyle.alignment : undefined;
              let fontSize = (elementStyle && elementStyle.fontSize) ? elementStyle.fontSize : (parentStyle && parentStyle.fontSize) ? parentStyle.fontSize : undefined;
              pageWidth = pageWidth;
              let elCount = 0;
              let lineWidth = 0;
              let chN = [...Array.from(element.childNodes).filter((el) => {
                let htmlel = el as HTMLElement
                if (htmlel.tagName == "BR") {
                  return false;
                } else if (htmlel.tagName == "IMG" && htmlel.className == "ProseMirror-separator") {
                  return false;
                }
                return true;
              })];
              let getWidth = (child: HTMLElement) => {
                let measureDiv = document.createElement('div');
                measureDiv.style.display = 'inline';
                child.parentElement?.append(measureDiv);

                if (child instanceof Text) {
                  measureDiv.textContent = child.textContent;
                } else {
                  measureDiv.innerHTML = child.outerHTML;
                }

                let width = measureDiv.getBoundingClientRect().width;
                child.parentElement?.removeChild(measureDiv);
                return width;
              }
              while (elCount < chN.length) {
                let child = chN[elCount] as HTMLElement;
                let childWidth = getWidth(child);
                let table: any = {
                  table: {
                    body: [
                      [],
                    ],
                    widths: '*',
                  },
                  props: {},
                  layout: {
                    paddingLeft: (i: number, node: any) => {
                      if (alignment == 'center') {
                        return fontSize / 8
                      } else if (alignment == 'right') {
                        return fontSize / 8
                      }
                      return 0;
                    },
                    paddingRight: (i: number, nodeQWE: any) => {
                      if (alignment == 'center') {
                        return fontSize / 8
                      } else if (alignment == 'right') {
                        return fontSize / 8
                      }
                      return 0;
                    },
                    paddingTop: (i1: number, node: any) => {
                      applyVerticalAlignmentv2(node, i1,)
                      return 0;
                    },
                    paddingBottom: function paddingBottom(i: number, node: any) { return 0; },
                    hLineWidth: function hLineWidth(i: number) { return 0; },
                    vLineWidth: function vLineWidth(i: number) { return 0; },
                  }
                }
                while (lineWidth + childWidth < pageWidth && elCount < chN.length) {
                  let newElement: any
                  if (child instanceof Text) {
                    newElement = { text: child.textContent };
                  } else {
                    textStyles.calcMargin = false
                    newElement = await generatePDFData(child, table, { scaleDown, ...textStyles }, element);
                  }
                  lineWidth += childWidth;
                  if ((alignment == 'left' || alignment == 'justify') || !alignment) {
                    if (table.table.body[0].length == 0) {
                      newElement.alignment = 'left';
                    } else {
                      newElement.alignment = 'center';
                    }
                  }
                  table.table.body[0].push(newElement);
                  elCount++;
                  if (elCount < chN.length) {
                    child = chN[elCount] as HTMLElement;
                    childWidth = getWidth(child) + 5;
                  }
                }
                if ((alignment == 'left' || alignment == 'justify') || !alignment) {
                  if (table.table.body[0]![table.table.body[0].length - 1]) {
                    table.table.body[0]![table.table.body[0].length - 1].alignment = 'right';
                  }
                }
                let widths: any = []
                let cells: any = []
                let itemStartsWithSpace: any = (item: any) => {
                  if (typeof item.text == 'string' && (item.text.startsWith(' ') || item.text.startsWith(" "))) {
                    return true
                  } else if (item.text instanceof Array) {
                    return itemStartsWithSpace(item.text[0])
                  }
                  return false;
                }
                let itemEndsWithSpace: any = (item: any) => {
                  if (typeof item.text == 'string' && ((item.text as string).endsWith(' ') || item.text.endsWith(" "))) {
                    return true
                  } else if (item.text instanceof Array) {
                    return itemEndsWithSpace(item.text[item.text.length - 1])
                  }
                  return false;
                }
                if ((alignment == 'left' || alignment == 'justify') || !alignment) {
                  if (elCount == chN.length) {
                    table.table.body[0].forEach((cell: any, i: number) => {
                      if (itemStartsWithSpace(cell) && i !== 0) {
                        widths.push(5)
                        widths.push('auto')
                        cells.push({});
                        cells.push(cell);
                        if (itemEndsWithSpace(cell) && i !== table.table.body[0].length - 1) {
                          widths.push(5)
                          cells.push({});
                        }
                      } else {
                        widths.push('auto')
                        cells.push(cell);
                      }
                    })
                  } else {
                    table.table.body[0].forEach((cell: any, i: number) => {
                      if (itemStartsWithSpace(cell) && i !== 0) {
                        widths.push('*')
                        widths.push('auto')
                        cells.push({});
                        cells.push(cell);
                        if (itemEndsWithSpace(cell) && i !== table.table.body[0].length - 1) {
                          widths.push("*")
                          cells.push({});
                        }
                      } else {
                        widths.push('auto')
                        cells.push(cell);
                      }
                    })
                  }
                  table.table.widths = widths;
                  table.table.body[0] = cells;
                  newEl.stack.push(table);
                } else if (alignment == 'center') {
                  table.width = 'auto'
                  table.table.widths = undefined
                  let columns = {
                    columns: [
                      { width: '*', text: '' },
                      table,
                      { width: '*', text: '' },
                    ]
                  }
                  newEl.stack.push(columns);
                } else if (alignment == 'right') {
                  table.width = 'auto'
                  table.table.widths = undefined
                  let columns = {
                    columns: [
                      { width: '*', text: '' },
                      { width: '*', text: '' },
                      table,
                    ]
                  }
                  newEl.stack.push(columns);
                }

                lineWidth = 0;
              }
              return Promise.resolve(stack.length)
            }
            let Num = await buildLineTables(newEl.stack, parentStyle && parentStyle.parentWidth ? parentStyle.parentWidth : pageWidth, element as HTMLElement, parentStyle, textStyles);
            if (!newEl.props) {
              newEl.props = {};
            }
            newEl.props.type = 'paragraphTable';
          } else {
            if (!newEl.text) {
              newEl.text = [];
            }
            let children = element.childNodes;
            for (let i = 0; i < children.length; i++) {
              let node = children[i];
              let n: any
              if (node instanceof Text) {
                n = node.textContent
              } else if (node instanceof Element) {
                n = await generatePDFData(node, newEl, textStyles, element)
              }
              newEl.text.push(n);
            }
          }
          //Object.assign(newEl, textStyles)
        }
        let parentElTag;
        if (parentElement) {
          parentElTag = parentElement.tagName.toLocaleLowerCase();
        }
        if ((
          tag == 'h1' ||
          tag == 'h2' ||
          tag == 'h3' ||
          tag == 'h4' ||
          tag == 'h5' ||
          tag == 'h6' ||
          tag == 'form-field')) {
          if (!newEl.props) {
            newEl.props = {};
          }
          if (!newEl.props.type) {
            newEl.props.type = 'heading';
          }
        }
        if (newEl.background == '#ffd0d0' && newEl.decoration == 'lineThrough') {
          newEl.decoration = undefined;
        }
        if (newEl.background) {
          newEl.background = undefined;
        }
        if (newEl.color) {
          newEl.color = undefined;
        }
        /* if (typeof newEl.text == 'string' && newEl.text.includes('Cited item deleted')) {
          newEl.text = '';
        } */
        if (tag == 'p') {
          if (!newEl.props) {
            newEl.props = {};
          }
          if (!newEl.props.type) {
            newEl.props.type = 'paragraph';
          }
        }
        return Promise.resolve(newEl)
      } else if (tag == 'img') {
        if (element.className = "ProseMirror-separator") {
          return Promise.resolve({});
        }
        let img = element as HTMLImageElement


        let dataURL = await this.getDataUrl(img)
        let node: any = { image: dataURL, width: pxToPt(img.getBoundingClientRect().width) }
        /* if (parentStyle && !parentStyle.parentHasMargin && margingsByTags[tag]) {
          result.margin = margingsByTags[tag]
        } */
        attachStylesToNode(node, {}, parentStyle, element, false, parentElement, '')
        return Promise.resolve(node);
      } else if (tag == 'block-figure') {
        let figureStyling: any = { parentHasMargin: true };
        attachStylesToNode(figureStyling, figureStyling, parentStyle, element, false, parentElement, '');
        let pdfFigure = await generateFigure(element, figureStyling);
        return Promise.resolve(pdfFigure)
      } else if (tag == 'table' || (tag == 'div' && element.className == 'tableWrapper')) {
        let tableElement
        if ((tag == 'div' && element.className == 'tableWrapper')) {
          tableElement = element.firstChild! as HTMLElement
        } else {
          tableElement = element
        }
        let sectionName = tableElement.getAttribute('section-name');
        /* let tableMargin: any = {};
        let tableTag = 'table'

        if (parentStyle && !parentStyle.parentHasMargin && margingsByTags[tableTag]) {
          tableMargin.margin = margingsByTags[tableTag]
          tableMargin.parentHasMargin = true;
        }
        if (parentStyle.parentHasMargin) {
          tableMargin.parentHasMargin = true;
        } */
        if (sectionName == 'Taxonomic coverage') {
          let tabbleCellWidth = '4.16667%'
          let tabbleCellWidthNumber = +tabbleCellWidth.replace('%', '')
          let taxonomicTable: any = {
            color: 'black',
            table: {
              headerRows: 1,
              widths: [],
              body: [],
              props: { type: 'taxonomicTable' }
            },
            layout: {
              paddingBottom: function paddingBottom(i: number, node: any) { return 3; },
            },
            alingment: 'center',
          }
          attachStylesToNode(taxonomicTable, {}, parentStyle, element, false, parentElement, 'table');

          for (let i = 0; i < 24; i++) {
            taxonomicTable.table.widths.push(tabbleCellWidth)
          }
          let tbody = tableElement.getElementsByTagName('tbody').item(0)!;
          let tbodyCh = tbody.childNodes;
          for (let i = 0; i < tbodyCh.length; i++) {
            let el = tbodyCh[i]

            let outerWidth = parentStyle && parentStyle.parentWidth ? parentStyle.parentWidth : pageWidth

            let col1Span = 4
            let stack1: any = []
            let cell1Nodes = el.childNodes.item(0).childNodes
            for (let j = 0; j < cell1Nodes.length; j++) {
              let cellnode = cell1Nodes[j];
              let val = await generatePDFData(cellnode as Element, taxonomicTable, { parentWidth: (col1Span * tabbleCellWidthNumber) * outerWidth / 100 }, tableElement)
              stack1.push(val);
            }
            let col2Span = 10
            let stack2: any = []
            let cell2Nodes = el.childNodes.item(1).childNodes
            for (let j = 0; j < cell2Nodes.length; j++) {
              let cellnode = cell2Nodes[j];
              let val = await generatePDFData(cellnode as Element, taxonomicTable, { parentWidth: (col2Span * tabbleCellWidthNumber) * outerWidth / 100 }, tableElement)
              stack2.push(val);
            }
            let col3Span = 10
            let stack3: any = []
            let cell3Nodes = el.childNodes.item(2).childNodes
            for (let j = 0; j < cell3Nodes.length; j++) {
              let cellnode = cell3Nodes[j];
              let val = await generatePDFData(cellnode as Element, taxonomicTable, { parentWidth: (col3Span * tabbleCellWidthNumber) * outerWidth / 100 }, tableElement)
              stack3.push(val);
            }
            taxonomicTable.table.body.push([
              { stack: stack1, colSpan: col1Span, borderColor: ['#e2e2dc', '#e2e2dc', '#e2e2dc', '#e2e2dc'], }, {}, {}, {},
              { stack: stack2, colSpan: col2Span, borderColor: ['#e2e2dc', '#e2e2dc', '#e2e2dc', '#e2e2dc'], }, {}, {}, {}, {}, {}, {}, {}, {}, {},
              { stack: stack3, colSpan: col3Span, borderColor: ['#e2e2dc', '#e2e2dc', '#e2e2dc', '#e2e2dc'], }, {}, {}, {}, {}, {}, {}, {}, {}, {}])
          }
          return Promise.resolve(taxonomicTable)
        } else {
          let tbody = tableElement.getElementsByTagName('tbody').item(0)!;
          let nOfColums = tbody.childNodes.item(0).childNodes.length;

          let baseTable: any = {
            color: 'black',
            table: {
              headerRows: 1,
              widths: 'auto',
              body: [],
              props: {},
            },
            layout: {
              paddingBottom: function paddingBottom(i: number, node: any) { return 3; },
            },
            alingment: 'center',
          }
          attachStylesToNode(baseTable, {}, parentStyle, element, false, parentElement, 'table');


          let tabbleCellWidthNumber
          if (parentStyle && parentStyle.parentWidth) {
            tabbleCellWidthNumber = ((1 / nOfColums) * parentStyle.parentWidth) - 6;
          } else {
            tabbleCellWidthNumber = ((1 / nOfColums) * pageWidth) - 6;
          }
          let rows = tbody.childNodes;
          for (let i = 0; i < rows.length; i++) {
            let htmlrow = rows[i];
            let row: any = []
            let columns = htmlrow.childNodes;
            for (let j = 0; j < columns.length; j++) {
              let cell = columns[j];
              let stack: any = []
              let cellNodes = cell.childNodes
              for (let k = 0; k < cellNodes.length; k++) {
                let cellnode = cellNodes[k]

                let val = await generatePDFData(cellnode as Element, baseTable, { parentWidth: tabbleCellWidthNumber }, tableElement)
                stack.push(val);
              }
              row.push({ stack, borderColor: ['#e2e2dc', '#e2e2dc', '#e2e2dc', '#e2e2dc'], })
            }
            baseTable.table.body.push(row)
          }
          return Promise.resolve(baseTable)
        }
      } else if (tag == 'ul' || tag == 'ol') {
        let listTemplate: any = {}
        listTemplate[tag] = []
        let elChildren = element.childNodes;
        let listStyles = {}
        /*let listMargin: any = {}
         if (parentStyle && !parentStyle.parentHasMargin && margingsByTags[tag]) {
          listMargin.margin = margingsByTags[tag]
          listMargin.parentHasMargin = true;
        }
        if (parentStyle.parentHasMargin) {
          listMargin.parentHasMargin = true;
        }
        if (listMargin.margin) {
          listTemplate.margin = listMargin.margin;
          listMargin.margin = undefined
        } */
        attachStylesToNode(listTemplate, listStyles, parentStyle, element, false, parentElement, '');
        for (let i = 0; i < elChildren.length; i++) {
          let chnode = elChildren[i];
          let listEl: any = { stack: [] }

          let itemNodes = chnode.childNodes;
          for (let j = 0; j < itemNodes.length; j++) {
            let nodeInItem = itemNodes[j];
            if (nodeInItem.textContent?.trim() !== '') {
              let itemWidth
              if (parentStyle && parentStyle.parentWidth) {
                itemWidth = parentStyle.parentWidth - 50;
              } else {
                itemWidth = pageWidth - 50;
              }
              let pdfFromNode = await generatePDFData(nodeInItem as Element, listTemplate, { parentWidth: itemWidth, ...listStyles }, element);
              listEl.stack.push(pdfFromNode);
            }
          }
          listTemplate[tag].push(listEl);
        }

        return Promise.resolve(listTemplate);
      } else if (tag == 'br') {
        /*let brMargin: any = {}
       if (parentStyle && !parentStyle.parentHasMargin && margingsByTags[tag]) {
         brMargin.margin = margingsByTags[tag]
       } */
        let br: any = { text: ' \n' }
        attachStylesToNode(br, {}, parentStyle, element, true, parentElement, '');
        /* if (brMargin.margin) {
          br.margin = brMargin.margin
        } */
        return Promise.resolve(br)
      } else if (tag == 'a') {
        let link: any = { text: element.textContent, link: element.getAttribute('href'), color: '#1B8AAE', decoration: 'underline' }
        /* let linkMargin: any = {}
        if (parentStyle && !parentStyle.parentHasMargin && margingsByTags[tag]) {
          linkMargin.margin = margingsByTags[tag]
        }
        link.margin = linkMargin.margin; */
        attachStylesToNode(link, {}, parentStyle, element, true, parentElement, '');

        //let linkTemplate = { text: [{ text: element.textContent, color: 'blue' }, { text: element.getAttribute('href'), color: 'lightblue', decoration: 'underline' }] }
        return Promise.resolve(link)
      } else if (tag == 'math-inline' || tag == 'math-display') {
        let width = pxToPt((element.getElementsByClassName('katex-display')[0] || element.getElementsByClassName('math-render')[0] || element).getBoundingClientRect().width);
        let height = pxToPt((element.getElementsByClassName('katex-display')[0] || element.getElementsByClassName('math-render')[0] || element).getBoundingClientRect().height);
        let canvasWidth = width;
        let result: any = { image: math_data_url_obj[element.getAttribute('mathid')!], width: canvasWidth, props: { canvasDims: [width, height] } }
        if (tag == 'math-display') {
          let katexelRect = (element.getElementsByClassName('katex-display')[0] || element.getElementsByClassName('math-render')[0] || element).getBoundingClientRect()
          result.width = pxToPt(katexelRect.width);
          let img = result;

          img.props.canvasDims = [pxToPt(katexelRect.width), pxToPt(katexelRect.height)]
          result = {
            columns: [
              {
                text: '', width: "*"
              },
              {
                width: 'auto',
                stack: [img]
              },
              {
                text: '', width: "*"
              }
            ],
            props: { type: "block-math" }
          }
        }
        if (!math_data_url_obj[element.getAttribute('mathid')!] || 'data:,' == math_data_url_obj[element.getAttribute('mathid')!]) {
          result = {
            columns: [
              {
                text: '', width: "*"
              },
              {
                width: 'auto',
                stack: ['(empty)'], color: 'red'
              },
              {
                text: '', width: "*"
              }
            ],
            props:{

            }
          }
        }
        /*  let blockMathMargin: any = {}
         if (parentStyle && !parentStyle.parentHasMargin && margingsByTags[tag]) {
           blockMathMargin.margin = margingsByTags[tag]
         }
         result.margin = blockMathMargin.margin; */
        attachStylesToNode(result, {}, parentStyle, element, false, parentElement, '');
        if (tag == 'math-inline') {
          let inlineElement = element;
          let blockElement = element.getElementsByClassName('base')[0] as HTMLElement;

          let inlineElRect = inlineElement.getBoundingClientRect()
          let blockElRect = blockElement.getBoundingClientRect()

          let inlineElH = inlineElRect.height;
          let blockElH = blockElRect.height;

          let offsetTopInlineElFromBlockEl = inlineElRect.top - blockElRect.top;
          let offsetBotInlineElFromBlockEl = blockElRect.bottom - inlineElRect.bottom;

          let centeredOffset = (blockElH - inlineElH) / 2;

          let marginTop = centeredOffset - offsetTopInlineElFromBlockEl
          let marginBot = centeredOffset - offsetBotInlineElFromBlockEl

          let elementFontSize: any = (element.parentElement?.style.fontSize && element.parentElement?.style.fontSize !== '') ? element.parentElement?.style.fontSize :
            (window.getComputedStyle(element.parentElement!).fontSize) ? window.getComputedStyle(element.parentElement!).fontSize : undefined
          if (elementFontSize && elementFontSize.includes('px')) {
            elementFontSize = +elementFontSize.replace('px', '');
          }
          let scaleDown = parentStyle.scaleDown/* ||(ptToPx(parentStyle.fontSize) / elementFontSize); */
          result.width = result.width /* * scaleDown */
          result.margin = [0, 0, 0, 0];
          result.props.offsetTop = pxToPt(offsetTopInlineElFromBlockEl) /* * scaleDown */
          result.props.offsetBot = pxToPt(offsetBotInlineElFromBlockEl) /* * scaleDown */
          /* if(elementFontSize){
            result.margin[1] = elementFontSize*0.00
            if(height){
            result.margin[1] = elementFontSize*0.00
            }
          } */

        }
        return Promise.resolve(result);

      } else {
        let stack: any = {
          stack: []
        }
        let ch = Array.from(element.childNodes)

        for (let i = 0; i < ch.length; i++) {
          let pdfCh = await generatePDFData(ch[i] as HTMLElement, parentPDFel, parentStyle, parentElement);
          stack.stack.push(pdfCh)
        }
        return Promise.resolve(stack)
      }
    }

    let margFooter = [pxToPt(this.pageMarg[0]), 15, pxToPt(this.pageMarg[2]), 15];
    let margHeader = [pxToPt(+this.pageMarg[0]), 20, pxToPt(+this.pageMarg[2]), 15];
    if (pdfSettings.pdf.footer) {
      margFooter = [pxToPt(this.pageMarg[0]), pdfSettings.pdf.footer.marginTop, pxToPt(this.pageMarg[2]), pdfSettings.pdf.footer.marginBottom];
    }
    if (pdfSettings.pdf.header) {
      margHeader = [pxToPt(+this.pageMarg[0]), pdfSettings.pdf.header.marginTop, pxToPt(+this.pageMarg[2]), pdfSettings.pdf.header.marginTop];
    }
    let headerStack: any = []
    let footerStack: any = []


    for (let i = 0; i < headerCh.length; i++) {
      headerStack.push(await generatePDFData(headerCh[i] as HTMLElement, {}, { parentHasMargin: true }, undefined))
    }
    for (let i = 0; i < footerCh.length; i++) {
      footerStack.push(await generatePDFData(footerCh[i] as HTMLElement, {}, { parentHasMargin: true }, undefined))
    }

    let footerFontSize = 9;
    let headerFontSize = 9;
    if (pdfSettings.pdf.footer && pdfSettings.pdf.footer.fontSize !== 'auto') {
      footerFontSize = pdfSettings.pdf.footer.fontSize
    }
    if (pdfSettings.pdf.header && pdfSettings.pdf.header.fontSize !== 'auto') {
      headerFontSize = pdfSettings.pdf.header.fontSize
    }
    this.data.footer = function (currentPage: any, pageCount: any) {
      return [{
        margin: margFooter,
        columnGap: 10,
        columns: [
          {
            width: 'auto',
            alignment: 'left',
            text: '',
            fontSize: footerFontSize
          },
          {
            width: '*',
            alignment: 'center',
            stack: footerStack,
            fontSize: footerFontSize
          },
          {
            width: 'auto',
            alignment: 'right',
            text: '',
            fontSize: footerFontSize
          }
        ]
      }]
    }
    this.data.header = function (currentPage: any, pageCount: any, pageSize: any) {
      // you can apply any logic and return any valid pdfmake element
      return [{
        margin: margHeader,
        columnGap: 10,
        columns: [
          {
            width: 'auto',
            alignment: 'left',
            text: currentPage.toString(),
            fontSize: headerFontSize
          },
          {
            width: '*',
            alignment: 'center',
            stack: headerStack,
            fontSize: headerFontSize
          },
          {
            width: 'auto',
            alignment: 'right',
            text: '',
            fontSize: headerFontSize
          }
        ]
      }]
    }

    let val = await new Promise(async (resolve, reject) => {
      let doneSubject = new Subject();
      let cont: any = [];

      let mainNodes = this.elements;
      let pbs = 0 // page breaks
      for (let i = 0; i < mainNodes.length; i++) {
        let el = mainNodes[i] as HTMLElement;
        if (el.tagName.toLocaleLowerCase() == 'page-break') {
          if (cont[i - 1 - pbs]) {
            cont[i - 1 - pbs].pageBreak = 'after';
          }
          pbs++;
        } else {
          let pdfElement = await generatePDFData(el, {}, {}, undefined);
          if (!pdfElement.props) {
            pdfElement.props = {}
          }
          pdfElement.props.main = true;

          cont.push(pdfElement)
        }
        if (i == mainNodes.length - 1) {
          doneSubject.next('done');
        }
      }
      this.data.images = ImagesByKeys
      this.data.content = cont;

      let checkIfHeadingIsLastNodeOnNonLastPage = (node: any, nodesAfterNodeOnSamePage: any) => {
        if (node.positions.length > 1) return false;// more than one line in paragraph / heading
        if (nodesAfterNodeOnSamePage.length > 0) return false;//node is not last node on the page
        if (node.nodeInfo.pages == node.positions[0].pageNumber) return false//node is on the last page
        node.pageBreak = 'before'
        return true;
      }
      let checkNodesBeforeIfHeadingAndMove = (node:any,nodesBefore:any[])=>{
        let c = 0
        let nonHeading = false
        while (nodesBefore[nodesBefore.length-1-c]&&c<1&&!nonHeading) {
          let nodeBefore = nodesBefore[nodesBefore.length-1-c];
          //should probably check inner nodes if its a nested header
          if((nodeBefore.props.type == 'heading'||nodeBefore.props.type == 'paragraph'||nodeBefore.props.type == 'paragraphTable')&&
          nodeBefore.positions.length == 1){
            nodeBefore.pageBreak = 'before'
            node.pageBreak = undefined;
            if(c==1){
              nodesBefore[nodesBefore.length-1].pageBreak = undefined;
            }else if(c == 2){
              nodesBefore[nodesBefore.length-1].pageBreak = undefined;
              nodesBefore[nodesBefore.length-2].pageBreak = undefined;
            }
          }else{
            nonHeading = true;
          }
          c++;
        }
      }
      this.data.orderNodes = (node: any, nodeFunc: any) => {
        let nodeInfo = node.nodeInfo;
        if (nodeInfo.table && nodeInfo.table.props && nodeInfo.table.props.type == 'figure' && node.pageBreak == 'before') {
          let scaling = false;
          if (2 !== node.scaleTry && node.nodeInfo.pageNumbers.length > 1) {
            scaling = true;
            node.pageOrderCalculated = false;
          }
          let structuredNodes = nodeFunc.getContent();
          let nodesBefore = nodeFunc.getAllNodesBefore();
          let nodesAfter = nodeFunc.getAllNodesAfter();
          if (nodesBefore.length > 0) {
            let lastNodeBefore = nodesBefore[nodesBefore.length - 1];
            let availableHeightAfterLastNode = lastNodeBefore.props.availableHeight;

            // check if there is space above for the figure
            if (availableHeightAfterLastNode > node.props.height) {
              node.pageBreak = undefined;
              return true
            }
            // try move text from uder the figure

            let filledSpace = 0;
            let counter = 0;
            let movedIndexes: number[] = []
            let cannotMove = false
            while (counter < nodesAfter.length && !cannotMove) {
              let nAfter = nodesAfter[counter]
              if (nAfter.props.height < availableHeightAfterLastNode - filledSpace && !nAfter.table) {
                filledSpace += nAfter.props.height
                movedIndexes.push(1 + nodesBefore.length + counter);
              } else {
                cannotMove = true
              }
              counter++
            }
            movedIndexes.sort((a, b) => b - a);

            let editData = { moveFrom: movedIndexes, moveTo: nodesBefore.length };

            if (!scaling && movedIndexes.length > 0 && availableHeightAfterLastNode - filledSpace < 200 && lastNodeBefore.props.availableHeight > 200) {
              let nodesToMove = editData.moveFrom;
              let indexToMoveAt = editData.moveTo

              let figureNode = structuredNodes.splice(nodesBefore.length, 1);
              let biggestIndex = Math.max(...movedIndexes);


              node.pageOrderCalculated = false;
              structuredNodes.splice(biggestIndex, 0, figureNode);
              //retrun true so we contonue to the next node
              return true;
            }
            // try move figure above the text before it
            let freeSpaceBefore = availableHeightAfterLastNode;

            counter = nodesBefore.length - 1;
            movedIndexes = []
            cannotMove = false
            let enoughFreeSpace = false
            while (counter > -1 && !cannotMove && node.props.height < 650 && !enoughFreeSpace) {
              let nBefore = nodesBefore[counter]
              if (freeSpaceBefore < node.props.height && !nBefore.table && nBefore.nodeInfo.pageNumbers.length == 1 && nBefore.nodeInfo.pageNumbers[0] == node.nodeInfo.pageNumbers[0] - 1) {
                if (freeSpaceBefore + nBefore.props.height > node.props.height) {
                  enoughFreeSpace = true;
                }
                freeSpaceBefore += nBefore.props.height
                movedIndexes.push(counter);
              } else {
                cannotMove = true
              }
              counter--
            }
            if (!scaling && movedIndexes.length > 0 && enoughFreeSpace) {
              let moveNodeFrom = nodesBefore.length;
              for (let i = 0; i < movedIndexes.length; i++) {
                structuredNodes[movedIndexes[i]].pageOrderCalculated = false;
              }
              let moveTo = Math.min(...movedIndexes);

              let movingNode = structuredNodes.splice(moveNodeFrom, 1);
              movingNode[0].pageBreak = undefined;
              if(movingNode[0].stack&&movingNode[0].stack[0]){
                movingNode[0].stack[0].pageBreak = undefined;
              }

              structuredNodes.splice(moveTo, 0, ...movingNode);
              return true
            }

            // try scale the images and then the above operations again


            let loopTableAndChangeWidth = (nodeToChange: any) => {
              let availableHeightOnLastPage = nodesBefore[nodesBefore.length - 1].props.availableHeight;
              let figureHeight = nodeToChange.props.height;
              let imagesTable = nodeToChange.table.body[0][0].columns[1]
              let descriptionTable = nodeToChange.table.body[1][0]

              let imageTableHeight = imagesTable.props.height;
              let descriptionHeight = figureHeight - imageTableHeight;
              let imageNewHeight = availableHeightOnLastPage - descriptionHeight - 3;

              //let figureImageInitHeight = nodeToChange.table.body[0][0].props.initRect[1];
              //let figureDescriptionHeight = figureHeight - figureImageInitHeight;
              let dawnScalePercent = imageNewHeight / imageTableHeight;

              //let imageNewHeight = availableHeightOnLastPage - figureDescriptionHeight - 3;
              //let dawnScalePercent = imageNewHeight / figureImageInitHeight;
              let scaleFromUserInput = pdfSettings.pdf.maxFiguresImagesDownscale.replace("%", '');
              let scale = 0.8;
              if (isNumeric(scaleFromUserInput)) {
                scale = +scaleFromUserInput / 100
              }
              if (dawnScalePercent >= scale) {
                nodeToChange.pageOrderCalculated = true;
                nodeToChange.pageBreak = 'after';
                for (let r = 0; r < imagesTable.table.body.length; r++) {
                  let row = imagesTable.table.body[r];
                  for (let c = 0; c < row.length; c++) {

                    let cell = row[c];
                    if (cell.fit && cell.fit[1]) {
                      cell.fit[1] = cell.fit[1] * dawnScalePercent;
                    }
                  }
                }
                //imagesTable.table.body
                //nodeToChange.table.body[0][0].fit = [nodeToChange.table.body[0][0].props.initRect[0] * dawnScalePercent, imageNewHeight]
              } else if (pageheightInPoints < figureHeight) {
                nodeToChange.pageOrderCalculated = true;
                nodeToChange.pageBreak = undefined;
              }
            }

            if (availableHeightAfterLastNode < 100) {
              return true
            }

            if (node.scaleTry == 2) {
              //loopTableAndChangeWidth(node, singleimgOnRowWidth)
              return true
            } else {
              node.scaleTry = 2;
              loopTableAndChangeWidth(node)
              return true
              /* if (!node.scaleTry) {
                node.scaleTry = 1
              } else {
                node.scaleTry = 2
              }
              if (node.scaleTry == 1) {
                node.pageOrderCalculated = false;
                loopTableAndChangeWidth(node, twoImgOnRowWidth)
                return true
              } else {
                node.pageOrderCalculated = false;
                loopTableAndChangeWidth(node, threeImgOnRowWidth)
                return true
              } */
            }
          }
        } else if (node.props.type == 'paragraph') {
          let followingNodes = nodeFunc.getFollowingNodesOnPage();
          let nodesBefore = nodeFunc.getAllNodesBefore();

          if (checkIfHeadingIsLastNodeOnNonLastPage(node, followingNodes)) {
            checkNodesBeforeIfHeadingAndMove(node,nodesBefore)
            return true
          }
          let maxLinesOnLastPage = pdfSettings.pdf.minParagraphLinesAtEndOfPage ? pdfSettings.pdf.minParagraphLinesAtEndOfPage : 1
          if (node.text && nodeInfo.pageNumbers.length > 1 && node.positions.length >= maxLinesOnLastPage) {
            let lines: number[] = [];
            nodeInfo.pageNumbers.forEach((page: number, index: number) => {
              lines[index] = 0
              node.positions.forEach((pos: any) => {
                if (pos.pageNumber == page) {
                  lines[index]++;
                }
              })
            })
            if (lines[0] <= maxLinesOnLastPage) {
              node.pageBreak = 'before'
              checkNodesBeforeIfHeadingAndMove(node,nodesBefore)
              return true
            }
          }
        } else if (node.props.type == 'paragraphTable' /* && nodeInfo.pageNumbers.length > 1 */) {
          let maxMathDownscale = pdfSettings.pdf.maxMathDownscale.replace("%", '');
          let scale = 0.8;
          if (isNumeric(maxMathDownscale)) {
            scale = +maxMathDownscale / 100
          }
          let structuredNodes = nodeFunc.getContent();
          let nodesBefore = nodeFunc.getAllNodesBefore();
          let nodesAfter = nodeFunc.getAllNodesAfter();
          let followingNodes = nodeFunc.getFollowingNodesOnPage();

          if (checkIfHeadingIsLastNodeOnNonLastPage(node, followingNodes)) {
            checkNodesBeforeIfHeadingAndMove(node,nodesBefore)
            return true
          }

          let minLinesLeftOnLastPage = +pdfSettings.pdf.minParagraphLinesAtEndOfPage;

          let nodeOrLineOnLastPage: any
          let lineOnNewPage: any

          let hasMathImages = (node: any) => {
            let tableBody: any;
            if (node.table) {
              tableBody = node.table.body
            } else if (node.columns) {
              node.columns.forEach((col: any) => {
                if (col.table) {
                  tableBody = col.table.body
                }
              })
            }
            let hasMathImage = false;
            tableBody[0].forEach((cell: any) => {
              if (cell.image && cell.props && cell.props.canvasDims) {
                hasMathImage = true
              }
            })
            return hasMathImage
          }
          let isBreakingLine = (node: any, i: number, nodeBefore?: any, i1?: number) => {
            let isOnMoreThanOnePage = node.nodeInfo.pageNumbers.length > 1;
            let actualTop = node.nodeInfo.startPosition.top - pxToPt(pdfSettings.pdf.pageMargins.marginTop);
            let nodeH = node.props.height;
            let pageH = node.nodeInfo.startPosition.pageInnerHeight;
            let isBiggerThanLeftSpaceOnPage = pageH < nodeH + actualTop;
            let isBiggerThanLeftSpaceAfterLastNode = false;
            if(nodeBefore&&nodeBefore.props.availableHeight){
              let leftSpace = nodeBefore.props.availableHeight;
              if(leftSpace<nodeH){
                isBiggerThanLeftSpaceAfterLastNode = true
              }
            }
            if(node.fixedParagraphTable){
              return false
            }
            if (isOnMoreThanOnePage&&isBiggerThanLeftSpaceAfterLastNode) {
              return true
            } else {
              if (isBiggerThanLeftSpaceOnPage||isBiggerThanLeftSpaceAfterLastNode) {
                return true;
              }
            }
          }
          let findImageLinesOnNewPages = (node: any) => {
            for (let i = 0; i < node.stack.length; i++) {
              let hasMath = hasMathImages(node.stack[i])
              let isbreaking = isBreakingLine(node.stack[i], i, node.stack[i - 1] || nodesBefore[nodesBefore.length - 1], i - 1)
              if (hasMath &&isbreaking) {
                lineOnNewPage = node.stack[i];
                nodeOrLineOnLastPage = node.stack[i - 1] || nodesBefore[nodesBefore.length - 1];
                return true;
              }
            }
            return false;
          }
          let findImgCellNodes = (lineNode: any) => {
            let imagecells: any[] = []
            let tableBody: any;
            if (lineNode.table) {
              tableBody = lineNode.table.body
            } else if (lineNode.columns) {
              lineNode.columns.forEach((col: any) => {
                if (col.table) {
                  tableBody = col.table.body
                }
              })
            }
            tableBody[0].forEach((cell: any) => {
              if (cell.image && cell.props && cell.props.canvasDims) {
                imagecells.push(cell)
              }
            })
            return imagecells
          }
          if(node.nodeInfo.pageNumbers.length == 1){
            return false;
          }
          let countLinesOnFirtPage = (node:any) => {
            let linesOnFirstPage = 0;
            let firstPage = node.nodeInfo.pageNumbers[0];
            for(let i = 0 ; i < node.stack.length;i++){
              let line = node.stack[i];
              let lineNumber = line.nodeInfo.pageNumbers[0];
              if(lineNumber == firstPage&&line.nodeInfo.pageNumbers.length == 1){
                linesOnFirstPage++;
              }
            }
            return linesOnFirstPage;
          }
          if(node.nodeInfo.pageNumbers.length > 1&&!node.lineLeftOnFirstPageChecked){//move lines if there are more left on last page
            node.lineLeftOnFirstPageChecked = true;
            let linesOnFirstPage = countLinesOnFirtPage(node);
            if(linesOnFirstPage<=minLinesLeftOnLastPage){
              if(node.stack[linesOnFirstPage-1]){
                node.pageBreak = 'before'
                //check 3 nodes before if they are headings and move the on the next page with the paragraph
                checkNodesBeforeIfHeadingAndMove(node,nodesBefore)
              }
            }
            if(linesOnFirstPage>0){
              node.pageOrderCalculated = false;
              return true
            }
          }
          if (typeof node.calculatedTimes !== 'number' || node.calculatedTimes < 2) {
            if (typeof node.calculatedTimes !== 'number') {
              node.calculatedTimes = 0
            } else {
              node.calculatedTimes++
            }
            node.pageOrderCalculated = false;
            return true
          } else if (node.calculatedTimes == 2) {
            if (findImageLinesOnNewPages(node)&&!lineOnNewPage.fixedParagraphTable) {  // fix the breaking lines
              let sp = nodeOrLineOnLastPage.nodeInfo.startPosition
              //let freeSpaceOnLastPage = sp.pageInnerHeight -sp.top+  pxToPt(pdfSettings.pdf.pageMargins.marginTop)-nodeOrLineOnLastPage.props.height;
              let freeSpaceOnLastPage = nodeOrLineOnLastPage.props.availableHeight;
              console.log(lineOnNewPage, nodeOrLineOnLastPage);
              console.log('freeSpaceOnLastPage', freeSpaceOnLastPage);
              let imagesInLine = findImgCellNodes(lineOnNewPage);
              console.log('imagenodes', imagesInLine);
              if (imagesInLine.length > 0) {
                let biggestImage = imagesInLine.reduce((prev, curr, i, arr) => { return prev.props.canvasDims[1] < curr.props.canvasDims[1] ? curr : prev }, { props: { canvasDims: [0, 0] } })
                let bigH = biggestImage._height;
                let cH = biggestImage.props.canvasDims[1];
                let adds = bigH - cH;
                let biggreqSc = (freeSpaceOnLastPage - adds) / cH;
                if (biggreqSc < scale) {
                  lineOnNewPage.pageBreak = 'before'
                  node.calculatedTimes = undefined
                  lineOnNewPage.fixedParagraphTable = true
                  node.pageOrderCalculated = false;
                  return true;
                } else {
                  imagesInLine.forEach((img) => {
                    let imageHeight = img._height;
                    if (imageHeight > freeSpaceOnLastPage) {
                      let canvasHeight = img.props.canvasDims[1];
                      let addedSpace = imageHeight - canvasHeight;
                      let requiredScale = (freeSpaceOnLastPage - addedSpace-10) / canvasHeight;
                      console.log('requiredScale', requiredScale, 'scale', scale, 'oldHeight', canvasHeight, 'newHeight', canvasHeight * requiredScale);
                      img.props.canvasDims[0] = img.props.canvasDims[0] * requiredScale;
                      img.props.canvasDims[1] = img.props.canvasDims[1] * requiredScale;
                      img.props.offsetBot = img.props.offsetBot * requiredScale;
                      img.props.offsetTop = img.props.offsetTop * requiredScale;
                      img.width = img.props.canvasDims[0]
                    }
                  })
                  node.pageOrderCalculated = false;
                  node.calculatedTimes = undefined;
                  lineOnNewPage.fixedParagraphTable = true
                  return true;
                }
              }
            }
          }

        } else if (node.props.type == 'block-math') {
          let maxMathDownscale = pdfSettings.pdf.maxMathDownscale.replace("%", '');
          let scale = 0.8;
          if (isNumeric(maxMathDownscale)) {
            scale = +maxMathDownscale / 100
          }
          let structuredNodes = nodeFunc.getContent();
          let nodesBefore = nodeFunc.getAllNodesBefore();
          let nodesAfter = nodeFunc.getAllNodesAfter();
          let nodeBeforeMath = nodesBefore.length > 0 ? nodesBefore[nodesBefore.length - 1] : undefined;
          if (nodeBeforeMath && nodeBeforeMath.nodeInfo.pageNumbers[nodeBeforeMath.nodeInfo.pageNumbers.length - 1] < node.nodeInfo.pageNumbers[0]) {
            let availableHeightOnPageBeforeMath = nodeBeforeMath.props.availableHeight - 10;
            let imagePdf = node.columns[1].stack[0];
            let imgDims = imagePdf.props.canvasDims;//[width,height]
            let mathWidth = imagePdf.width
            let imageHeight = (imgDims[1] / imgDims[0]) * mathWidth;
            let requiredScalePercent = availableHeightOnPageBeforeMath / imageHeight;
            if (requiredScalePercent > scale && requiredScalePercent < 1) {
              let newWidth = mathWidth * requiredScalePercent
              imagePdf.width = newWidth;
              imagePdf.fit = [newWidth, availableHeightOnPageBeforeMath]
              return true;
            }
          }
        } else if (node.props.type == 'heading') {
          let followingNodes = nodeFunc.getFollowingNodesOnPage();
          if (checkIfHeadingIsLastNodeOnNonLastPage(node, followingNodes)) {
            return true
          }
        }
        return false;
      }
      this.data.pageBreakBefore = (nodeInfo: any, nodeFunc: any) => {
        if (nodeInfo.table && nodeInfo.table.props && nodeInfo.table.props.type == 'figure') {
          if (nodeInfo.pageNumbers.length == 2) {
            return true
          }
        }
        return false;
      }
      this.data.threeImgOnRowWidth = threeImgOnRowWidth;
      this.data.fourImgOnRowWidth = fourImgOnRowWidth;
      this.data.singleimgOnRowWidth = singleimgOnRowWidth;
      this.data.pageSize = this.pageSize;
      /* this.http.post('http://localhost:3000/buildPdf',{pdfJsonStruct:data},{ responseType: 'text' }).subscribe((res)=>{
        (document.getElementById('pdfV') as HTMLIFrameElement).src = res;
      }); */
      pdfMake.createPdf(this.data).getBlob((data: any) => {
        //(document.getElementById('pdfV') as HTMLIFrameElement).src = data;
      }).then((blob: any) => {
        let url = URL.createObjectURL(blob);
        let iframe = document.getElementById('pdfV') as HTMLIFrameElement;
        iframe.addEventListener('load', () => {
          this.stopSpinner()
        })
        iframe.src = url;
        //iframe.style.display = "none"

        resolve(true);
      });
    })
    return Promise.resolve(val)
  }

  getTextStyles(elementStyles: any, element: HTMLElement) {

    //margin: [left, top, right, bottom]


    let tag = element.tagName.toLocaleLowerCase();
    let elementMargin = [+elementStyles.marginLeft.replace('px', ''), +elementStyles.marginTop.replace('px', ''), +elementStyles.marginRight.replace('px', ''), +elementStyles.marginBottom.replace('px', '')];




    var style = elementStyles.getPropertyValue('font-size');
    var align = elementStyles.getPropertyValue('text-aling');
    var fontSize: any = parseFloat(style);
    let sub: any
    let sup: any
    if (element.tagName && (element.tagName == "SUB" || element.tagName == "SUP")) {
      if (element.tagName == "SUB") {
        sub = { offset: '0%' };
      } else if (element.tagName == "SUP") {
        sup = { offset: '0%' };
      }
    }
    let font: any
    if (element.tagName == 'CODE') {
      font = 'CodeFont'
    }
    // now you have a proper float for the font size (yes, it can be a float, not just an integer)

    (element as HTMLElement).style.textAlign
    //@ts-ignore
    //@ts-ignore
    let textStyles: any = {
      fontSize: (sub || sub) ? undefined : pxToPt(fontSize),
      sub,
      font,
      sup,
      //lineHeight: pxToPt(getLineHeight(element)),
      bold:
        elementStyles.font.split(' ')[0] >= 500 ||
        element.tagName == 'STRONG' ||
        element.tagName == 'H1' ||
        element.tagName == 'H2' ||
        element.tagName == 'H3' ||
        element.tagName == 'H4' ||
        element.tagName == 'H5' ||
        element.tagName == 'H6',
      italics: element.tagName == 'EM',
      alignment: element.style.textAlign == 'left' ? 'justify' : element.style.textAlign,
      //@ts-ignore
      color: (elementStyles.color && elementStyles.color.trim() !== "") ? rgbToHex(...elementStyles.color.replace('rgb', '').replace('(', '').replace(')', '').replace('a', '').split(', ').map((el) => +el)) : undefined,
      //@ts-ignore
      background: (elementStyles.backgroundColor && elementStyles.backgroundColor.trim() !== "") ? rgbToHex(...elementStyles.backgroundColor.replace('rgb', '').replace('a', '').replace('(', '').replace(')', '').split(', ').map((el) => +el)) : undefined,
      decoration: elementStyles.textDecorationLine == 'line-through' ? 'lineThrough' : element.tagName == 'U' ? 'underline' : elementStyles.textDecorationLine == 'overline' ? 'overline' : undefined,
      decorationStyle: elementStyles.textDecorationStyle !== 'solid' ? elementStyles.textDecorationStyle : undefined,
      //@ts-ignore
      decorationColor: (elementStyles.textDecorationColor && elementStyles.textDecorationColor.trim() !== '') ? rgbToHex(...elementStyles.textDecorationColor.replace('rgb', '').replace('a', '').replace('(', '').replace(')', '').split(', ').map((el) => +el)) : undefined,
    }
    if (textStyles.background == '#ecb9b9') textStyles.background = undefined;
    let clearedStyles: any = {}

    Object.keys(textStyles).forEach((key) => {
      let val = textStyles[key]
      if (val && `${val}`.trim() !== '') {
        clearedStyles[key] = val
      }
    })
    if (elementStyles.textAlign == 'left' || elementStyles.textAlign == 'right' || elementStyles.textAlign == 'center' || elementStyles.textAlign == 'justify') {
      if (elementStyles.textAlign == 'left') {
        clearedStyles.alignment = 'justify'
      } else {
        clearedStyles.alignment = elementStyles.textAlign;
      }
    }

    let margin = elementMargin.map((el) => {
      if (typeof el == 'number') {
        return pxToPt(el);
      } else {
        return 0;
      }
    })
    if (margin.reduce((p: boolean, m: number) => { return m !== 0 ? false : p }, true)) {
      if (tag == 'p' || tag == 'form-field') {
        margin = [0, 0, 0, 5]
      } else if (tag == 'h1' ||
        tag == 'h2') {
        margin = [0, 0, 0, 15]
      } else if (tag == 'h3' ||
        tag == 'h4' ||
        tag == 'h5' || tag == 'h6') {
        margin = [0, 0, 0, 10]
      }
    }
    //clearedStyles.margin = margin;
    return clearedStyles
  }

  elementToPdfMakeJson(pdfdata: any, element: Element) {
  }

  drop(event: CdkDragDrop<string[]>, sectionIndex: number) {
    moveItemInArray(this.sectionsContainers[sectionIndex], event.previousIndex, event.currentIndex);
  }
}

/*
            if (figuresCount == 1) {
              let imgName = figuresData[0].name;
              let imgDescription = figuresData[0].description;
              let descLabel = figuresData[0].descName


              figuresPdfViews.push([
                { image: imgName, colSpan: 6, fit: [twoImgOnRowWidth, twoImgOnRowWidth] }, {}, {}, {}, {}, {},
                { colSpan: 6, }, {}, {}, {}, {}, {}])
              figuresPdfDescriptions.push([{ text: descLabel, colSpan: 1 }, { text: imgDescription, colSpan: 11 }, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}])

            } else if (figuresCount == 2 || figuresCount == 4) {
              for (let i = 0; i < figuresCount; i += 2) {
                let name1 = figuresData[i].name;
                let desc1 = figuresData[i].description
                let descLabel1 = figuresData[i].descName

                let name2 = figuresData[i + 1].name;
                let desc2 = figuresData[i + 1].description
                let descLabel2 = figuresData[i + 1].descName


                figuresPdfViews.push([
                  { image: name1, colSpan: 6, fit: [twoImgOnRowWidth, twoImgOnRowWidth] }, {}, {}, {}, {}, {},
                  { image: name2, colSpan: 6, fit: [twoImgOnRowWidth, twoImgOnRowWidth] }, {}, {}, {}, {}, {}])
                figuresPdfDescriptions.push([{ text: descLabel1, colSpan: 1 }, { text: desc1, colSpan: 11 }, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}])
                figuresPdfDescriptions.push([{ text: descLabel2, colSpan: 1 }, { text: desc2, colSpan: 11 }, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}])

              }
            } else if (figuresCount == 3 || figuresCount == 5 || figuresCount == 6) {
              if (figuresCount == 3 || figuresCount == 6) {
                for (let i = 0; i < figuresCount; i += 3) {
                  let name1 = figuresData[i].name;
                  let desc1 = figuresData[i].description
                  let descLabel1 = figuresData[i].descName

                  let name2 = figuresData[i + 1].name;
                  let desc2 = figuresData[i + 1].description
                  let descLabel2 = figuresData[i + 1].descName

                  let name3 = figuresData[i + 2].name;
                  let desc3 = figuresData[i + 2].description
                  let descLabel3 = figuresData[i + 2].descName


                  figuresPdfViews.push([
                    { image: name1, colSpan: 4, fit: [threeImgOnRowWidth, threeImgOnRowWidth] }, {}, {}, {},
                    { image: name2, colSpan: 4, fit: [threeImgOnRowWidth, threeImgOnRowWidth] }, {}, {}, {},
                    { image: name3, colSpan: 4, fit: [threeImgOnRowWidth, threeImgOnRowWidth] }, {}, {}, {}
                  ])
                  figuresPdfDescriptions.push([{ text: descLabel1, colSpan: 1 }, { text: desc1, colSpan: 11 }, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}])
                  figuresPdfDescriptions.push([{ text: descLabel2, colSpan: 1 }, { text: desc2, colSpan: 11 }, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}])
                  figuresPdfDescriptions.push([{ text: descLabel3, colSpan: 1 }, { text: desc3, colSpan: 11 }, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}])

                }
              } else {
                let name1 = figuresData[0].name;
                let desc1 = figuresData[0].description
                let descLabel1 = figuresData[0].descName

                let name2 = figuresData[1].name;
                let desc2 = figuresData[1].description
                let descLabel2 = figuresData[1].descName

                let name3 = figuresData[2].name;
                let desc3 = figuresData[2].description
                let descLabel3 = figuresData[2].descName


                figuresPdfViews.push([
                  { image: name1, colSpan: 4, fit: [threeImgOnRowWidth, threeImgOnRowWidth] }, {}, {}, {},
                  { image: name2, colSpan: 4, fit: [threeImgOnRowWidth, threeImgOnRowWidth] }, {}, {}, {},
                  { image: name3, colSpan: 4, fit: [threeImgOnRowWidth, threeImgOnRowWidth] }, {}, {}, {}
                ])
                figuresPdfDescriptions.push([{ text: descLabel1, colSpan: 1 }, { text: desc1, colSpan: 11 }, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}])
                figuresPdfDescriptions.push([{ text: descLabel2, colSpan: 1 }, { text: desc2, colSpan: 11 }, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}])
                figuresPdfDescriptions.push([{ text: descLabel3, colSpan: 1 }, { text: desc3, colSpan: 11 }, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}])

                let name4 = figuresData[3].name;
                let desc4 = figuresData[3].description
                let descLabel4 = figuresData[3].descName

                let name5 = figuresData[4].name;
                let desc5 = figuresData[4].description
                let descLabel5 = figuresData[4].descName

                figuresPdfViews.push([
                  { image: name4, colSpan: 6, fit: [twoImgOnRowWidth, twoImgOnRowWidth] }, {}, {}, {}, {}, {},
                  { image: name5, colSpan: 6, fit: [twoImgOnRowWidth, twoImgOnRowWidth] }, {}, {}, {}, {}, {}
                ])
                figuresPdfDescriptions.push([{ text: descLabel4, colSpan: 1 }, { text: desc4, colSpan: 11 }, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}])
                figuresPdfDescriptions.push([{ text: descLabel5, colSpan: 1 }, { text: desc5, colSpan: 11 }, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}])
              }
            } else if (figuresCount == 7 || figuresCount == 8) {
              if (figuresCount == 8) {
                for (let i = 0; i < figuresCount; i += 4) {
                  let name1 = figuresData[i].name;
                  let desc1 = figuresData[i].description
                  let descLabel1 = figuresData[i].descName

                  let name2 = figuresData[i + 1].name;
                  let desc2 = figuresData[i + 1].description
                  let descLabel2 = figuresData[i + 1].descName

                  let name3 = figuresData[i + 2].name;
                  let desc3 = figuresData[i + 2].description
                  let descLabel3 = figuresData[i + 2].descName

                  let name4 = figuresData[i + 3].name;
                  let desc4 = figuresData[i + 3].description
                  let descLabel4 = figuresData[i + 3].descName


                  figuresPdfViews.push([
                    { image: name1, colSpan: 3, fit: [fourImgOnRowWidth, fourImgOnRowWidth] }, {}, {},
                    { image: name2, colSpan: 3, fit: [fourImgOnRowWidth, fourImgOnRowWidth] }, {}, {},
                    { image: name3, colSpan: 3, fit: [fourImgOnRowWidth, fourImgOnRowWidth] }, {}, {},
                    { image: name4, colSpan: 3, fit: [fourImgOnRowWidth, fourImgOnRowWidth] }, {}, {}
                  ])
                  figuresPdfDescriptions.push([{ text: descLabel1, colSpan: 1 }, { text: desc1, colSpan: 11 }, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}])
                  figuresPdfDescriptions.push([{ text: descLabel2, colSpan: 1 }, { text: desc2, colSpan: 11 }, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}])
                  figuresPdfDescriptions.push([{ text: descLabel3, colSpan: 1 }, { text: desc3, colSpan: 11 }, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}])
                  figuresPdfDescriptions.push([{ text: descLabel4, colSpan: 1 }, { text: desc4, colSpan: 11 }, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}])

                }
              } else {
                let name1 = figuresData[0].name;
                let desc1 = figuresData[0].description
                let descLabel1 = figuresData[0].descName

                let name2 = figuresData[1].name;
                let desc2 = figuresData[1].description
                let descLabel2 = figuresData[1].descName

                let name3 = figuresData[2].name;
                let desc3 = figuresData[2].description
                let descLabel3 = figuresData[2].descName

                let name4 = figuresData[3].name;
                let desc4 = figuresData[3].description
                let descLabel4 = figuresData[3].descName


                figuresPdfViews.push([
                  { image: name1, colSpan: 3, fit: [fourImgOnRowWidth, fourImgOnRowWidth] }, {}, {},
                  { image: name2, colSpan: 3, fit: [fourImgOnRowWidth, fourImgOnRowWidth] }, {}, {},
                  { image: name3, colSpan: 3, fit: [fourImgOnRowWidth, fourImgOnRowWidth] }, {}, {},
                  { image: name4, colSpan: 3, fit: [fourImgOnRowWidth, fourImgOnRowWidth] }, {}, {}
                ])
                figuresPdfDescriptions.push([{ text: descLabel1, colSpan: 1 }, { text: desc1, colSpan: 11 }, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}])
                figuresPdfDescriptions.push([{ text: descLabel2, colSpan: 1 }, { text: desc2, colSpan: 11 }, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}])
                figuresPdfDescriptions.push([{ text: descLabel3, colSpan: 1 }, { text: desc3, colSpan: 11 }, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}])
                figuresPdfDescriptions.push([{ text: descLabel4, colSpan: 1 }, { text: desc4, colSpan: 11 }, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}])

                let name5 = figuresData[4].name;
                let desc5 = figuresData[4].description
                let descLabel5 = figuresData[4].descName

                let name6 = figuresData[5].name;
                let desc6 = figuresData[5].description
                let descLabel6 = figuresData[5].descName

                let name7 = figuresData[6].name;
                let desc7 = figuresData[6].description
                let descLabel7 = figuresData[6].descName

                figuresPdfViews.push([
                  { image: name5, colSpan: 4, fit: [threeImgOnRowWidth, threeImgOnRowWidth] }, {}, {}, {},
                  { image: name6, colSpan: 4, fit: [threeImgOnRowWidth, threeImgOnRowWidth] }, {}, {}, {},
                  { image: name7, colSpan: 4, fit: [threeImgOnRowWidth, threeImgOnRowWidth] }, {}, {}, {}
                ])
                figuresPdfDescriptions.push([{ text: descLabel5, colSpan: 1 }, { text: desc5, colSpan: 11 }, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}])
                figuresPdfDescriptions.push([{ text: descLabel6, colSpan: 1 }, { text: desc6, colSpan: 11 }, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}])
                figuresPdfDescriptions.push([{ text: descLabel7, colSpan: 1 }, { text: desc7, colSpan: 11 }, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}])

              }

            } */
