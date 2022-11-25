let nodesInWhichCitationsShouldBeIgnored = ['block_table', 'block_figure']
import { E } from "@angular/cdk/keycodes";
import { citationsPMNodeNames } from "@app/editor/services/citable-elements.service";
import { ServiceShare } from "@app/editor/services/service-share.service";
import { Node } from "prosemirror-model";

export function getCitationIfAny(node:Node){
  return node.marks.filter((mark) => { return citationsPMNodeNames.includes(mark.type.name) });
}

export function citationShouldBeIgnored(citationPosPath: any[]) {
  let citationShouldBeIgnored = false;

  for (let i = citationPosPath.length - 3; i >= 0; i -= 3) {
    let parrEl = citationPosPath[i] as Node;
    let parrType = parrEl.type.name;
    if (nodesInWhichCitationsShouldBeIgnored.includes(parrType)) {
      citationShouldBeIgnored = true;
    }
  }
  return citationShouldBeIgnored;
}

export function getElementWithLargestNumberInCitationWithNestedElement(
  displayedElementeViews: string[],
  figuresOrderArr: string[],
  tablesOrderArr: string[],
  searchingFor: 'figure' | 'table',
  serviceShare: ServiceShare,
  citatType: string,
  displayedType: 'figure' | 'table',
  figureViewsDisplayed: boolean[],
  tableViewsDisplayed: boolean[],
): number {
  let citationTypeWeAreSearchingFor: string
  let citedElementsObj = { tables: [], figures: [] };

  if (searchingFor == 'figure') {
    citationTypeWeAreSearchingFor = 'citation';
  } else if (searchingFor == 'table') {
    citationTypeWeAreSearchingFor = 'table_citation';
  }
  if (displayedType == 'figure') {
    citedElementsObj.figures.push(...displayedElementeViews);
  } else if (displayedType == 'table') {
    citedElementsObj.tables.push(...displayedElementeViews);
  }
  let figuresMap = serviceShare.YdocService.figuresMap
  let tablesMap = serviceShare.YdocService.tablesMap

  let figuresData = figuresMap.get('ArticleFigures');
  let tablesData = tablesMap.get('ArticleTables');

  citedElementsObj;

  displayedElementeViews.forEach((viewId) => {
    getAllCitedElements(citatType, viewId, figuresData, tablesData, figuresOrderArr, tablesOrderArr, citedElementsObj, figureViewsDisplayed, tableViewsDisplayed);
  })
  let highestTableIndex = -1;
  citedElementsObj.tables.forEach((tblId) => {
    let tblsIndex = tablesOrderArr.indexOf(tblId);
    if (highestTableIndex < tblsIndex) {
      highestTableIndex = tblsIndex
    }
  })
  let highestFigureIndex = -1;
  citedElementsObj.figures.forEach((figId) => {
    let figIndex = figuresOrderArr.indexOf(figId);
    if (highestFigureIndex < figIndex) {
      highestFigureIndex = figIndex
    }
  })

  if (searchingFor == 'figure') {
    return highestFigureIndex;
  } else if (searchingFor == 'table') {
    return highestTableIndex;
  }
  return -1
}
const tableHtmlCitationRegex = /<table-citation.+?(?=<\/table-citation>)<\/table-citation>/gm;
const figureHtmlCitationRegex = /<citation.+?(?=<\/citation>)<\/citation>/gm;

const citedTableIdRegex = /citated_tables=".+?"/gm
const citedFigureIdRegex = /citated_figures=".+?"/sm

export function getAllCitedElements(
  citationType: string,
  elementId: string,
  figuresData: any,
  tablesData: any,
  figuresNumbers: string[],
  tablesNumbers: string[],
  citedElsObj: {
    tables: string[], figures: string[],

  },
  figureViewsDisplayed: boolean[],
  tableViewsDisplayed: boolean[],) {

  let allcitatsInElement = { tables: [], figures: [] };
  let htmlStringsToCheck = [];
  let tableCitatsStrings: RegExpMatchArray[] = []
  let figureCitatsStrings: RegExpMatchArray[] = []
  if (citationType == 'citation') {
    let figureData = figuresData[elementId];
    if (figureData) {
      figureData.components.forEach((comp) => {
        htmlStringsToCheck.push(comp.description);
      })
      htmlStringsToCheck.push(figureData.description)
    }
  } else if (citationType == 'table_citation') {
    let tableData = tablesData[elementId];
    if (tableData) {
      htmlStringsToCheck.push(tableData.components)
      htmlStringsToCheck.push(tableData.description)
    }
  }
  htmlStringsToCheck.forEach((str: string) => {
    let figuresString = str.match(figureHtmlCitationRegex);
    figuresString ? figureCitatsStrings.push(figuresString) : undefined;
    let tablesString = str.match(tableHtmlCitationRegex);
    tablesString ? tableCitatsStrings.push(tablesString) : undefined
  })

  let citedTablesIds: string[] = []
  let citedFiguresIds: string[] = []

  tableCitatsStrings.forEach((regMatch) => {
    regMatch.forEach((tableCitatStr) => {
      let citatIdMatch = tableCitatStr.match(citedTableIdRegex);
      let tableid = citatIdMatch[0].split('"')[1];
      if (!citedTablesIds.includes(tableid)) {
        citedTablesIds.push(tableid)
      }
    })
  })
  figureCitatsStrings.forEach((regMatch) => {
    regMatch.forEach((figCitatStr) => {
      let citatIdMatch = figCitatStr.match(citedFigureIdRegex);
      let figureid = citatIdMatch[0].split('"')[1].split('|')[0];
      if (!citedFiguresIds.includes(figureid)) {
        citedFiguresIds.push(figureid)
      }
    })
  })
  let newTableIds: string[] = []
  let newFigureIds: string[] = []
  citedTablesIds.forEach((tableId) => {
    if (!citedElsObj.tables.includes(tableId)) {
      citedElsObj.tables.push(tableId);
      newTableIds.push(tableId);
    };
  })
  citedFiguresIds.forEach((figId) => {
    if (!citedElsObj.figures.includes(figId)) {
      citedElsObj.figures.push(figId);
      newFigureIds.push(figId);
    };
  })
  let highestTableIndex = -1;
  newTableIds.forEach((tblId) => {
    let tblsIndex = tablesNumbers.indexOf(tblId);
    if (highestTableIndex < tblsIndex) {
      highestTableIndex = tblsIndex
    }
  })
  let tblsToLoop = [];
  for(let i = 0; i <=highestTableIndex;i++ ){
    if(!tableViewsDisplayed[i]){
      tblsToLoop.push(tablesNumbers[i]);
    }
  }

  if (tblsToLoop.length > 0) {
    tblsToLoop.forEach((tblId) => {
      getAllCitedElements('table_citation', tblId, figuresData, tablesData, figuresNumbers, tablesNumbers, citedElsObj, figureViewsDisplayed, tableViewsDisplayed);
    })
  }

  let highestFigureIndex = -1;
  newFigureIds.forEach((figId) => {
    let figIndex = figuresNumbers.indexOf(figId);
    if (highestFigureIndex < figIndex) {
      highestFigureIndex = figIndex
    }
  })
  let figsToLoop = [];
  for(let i = 0; i <=highestFigureIndex;i++ ){
    if(!figureViewsDisplayed[i]){
      figsToLoop.push(figuresNumbers[i]);
    }
  }

  if (figsToLoop.length > 0) {
    figsToLoop.forEach((figId) => {
      getAllCitedElements('citation', figId, figuresData, tablesData, figuresNumbers, tablesNumbers, citedElsObj, figureViewsDisplayed, tableViewsDisplayed);
    })
  }
}

export function getCitationsInElement(elementType: string, figuresData: any, tablesData: any, elementId: string) {

}

export function checkElementContent() {

}
