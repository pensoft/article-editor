import {ServiceShare} from "@app/editor/services/service-share.service";
import { CiToTypes } from "@app/layout/pages/library/lib-service/editors-refs-manager.service";
import {saveAs} from 'file-saver';
import {create} from 'xmlbuilder2';
import {DOMParser } from "prosemirror-model";
import {XMLBuilder} from "xmlbuilder2/lib/interfaces";
import {articleSection} from "@app/editor/utils/interfaces/articleSection";
import {EditorView} from "prosemirror-view";
import {schema} from "@app/editor/utils/Schema";
import { uuidv4 } from "lib0/random";
import moment from "moment";
import { APP_CONFIG } from '@core/services/app-config';
import { inject } from "@angular/core";

let figIdsG: any;
let refIdsG: any;
let tableIdsG: any;
let supplFilesIdsG: any;
let endNotesIdsG: any;

interface IOptions {
  refObj: any;
  articleMeta: XMLBuilder;
  titleGroup: XMLBuilder;
  notes: XMLBuilder;
  back: XMLBuilder;
  body: XMLBuilder;
  kwdGroup: XMLBuilder;
  abstractContainer: XMLBuilder;
  fundingGroup: XMLBuilder;
  keywordGroup?: boolean;
  keywordLabel?: boolean;
}

export function exportAsJatsXML(serviceShare: ServiceShare) {
  serviceShare.ProsemirrorEditorsService.spinSpinner();
  const config = inject(APP_CONFIG);

  let figObj = serviceShare.YdocService.figuresMap.get('ArticleFigures')
  let figIds: { [key: string]: string } = {}
  let figCount = 0
  Object.keys(figObj).forEach((figId, i) => {
    let val = figObj[figId];
    figIds[figId] = 'F' + i
    if (val) {
      figCount++
    }
  })
  figIdsG = figIds
  let refObj = serviceShare.YdocService.referenceCitationsMap?.get('referencesInEditor')
  let refIds: { [key: string]: string } = {}
  let refCount = 0
  Object.keys(refObj).forEach((refId, i) => {
    let val = refObj[refId];
    refIds[refId] = 'R' + i
    if (val) {
      refCount++
    }
  })
  refIdsG = refIds

  let tablesObj = serviceShare.YdocService.tablesMap?.get('ArticleTables')
  let tableIds: { [key: string]: string } = {}
  let tableCount = 0
  Object.keys(tablesObj).forEach((tableId, i) => {
    let val = tablesObj[tableId];
    tableIds[tableId] = 'T' + i
    if (val) {
      tableCount++
    }
  })
  tableIdsG = tableIds

  let suppleFilesObj = serviceShare.YdocService.supplementaryFilesMap.get('supplementaryFiles');
  let supplFilesIds:{ [key: string]: string } = {}
  let supplFilesCount = 0
  Object.keys(suppleFilesObj).forEach((supplFileId, i) => {
    let val = suppleFilesObj[supplFileId];
    supplFilesIds[supplFileId] = 'S' + i
    if (val) {
      supplFilesCount++
    }
  })
  supplFilesIdsG = supplFilesIds

  let endNotesObj = serviceShare.YdocService.endNotesMap.get('endNotes');
  let endNotesIds:{ [key: string]: string } = {}
  let endNotesCount = 0
  Object.keys(endNotesObj).forEach((endNoteId, i) => {
    let val = endNotesObj[endNoteId];
    endNotesIds[endNoteId] = 'E' + i
    if (val) {
      endNotesCount++
    }
  })
  endNotesIdsG = endNotesIds

  let lang = {'xml:lang': "en"}
  let article = create({version: '1.0', encoding: "UTF-8", standalone: false}).dtd({
    name: "article",
    pubID: "-//TaxPub//DTD Taxonomic Treatment Publishing DTD v1.0 20230203//EN",
    sysID: "./nlm/tax-treatment-NS0-v1.dtd"
  })
    .ele('article', {
      'xmlns:mml': "http://www.w3.org/1998/Math/MathML",
      'xmlns:xlink': "http://www.w3.org/1999/xlink",
      'xmlns:xsi': "http://www.w3.org/2001/XMLSchema-instance",
      'xmlns:tp': "http://www.plazi.org/taxpub",
      'article-type': 'research-article',// should probably come from the article layout
      'dtd-version': "3.0",
      ...lang,
    })
  /**/
  let front = article.ele('front')
  /*     */
  let journal_meta = front.ele('journal-meta');
  /*          */
  let journalidPublisherId = journal_meta.ele('journal-id', {"journal-id-type": "publisher-id"}).txt('1') // should probably come from the article layout
  /*          */
  let journalidIndex = journal_meta.ele('journal-id', {"journal-id-type": "index"}).txt('urn:lsid:arphahub.com:pub:F9B2E808-C883-5F47-B276-6D62129E4FF4') // should probably come from the article layout
  /*          */
  let journalidAggregator = journal_meta.ele('journal-id', {"journal-id-type": "aggregator"}).txt('urn:lsid:zoobank.org:pub:245B00E9-BFE5-4B4F-B76E-15C30BA74C02') // should probably come from the article layout
  /*          */
  let journal_title_group = journal_meta.ele('journal-title-group')
  /*               */
  let journal_title = journal_title_group.ele('journal-title', lang).txt('Biodiversity Data Journal')// should probably come from the article layout
  /*               */
  let abbrev_journal_title = journal_title_group.ele('abbrev-journal-title', lang).txt('BDJ')// should probably come from the article layout
  /*          */
  let issnppub = journal_meta.ele('issn', {'pub-type': 'ppub'}).txt('1314-2836');// should probably come from the article layout
  /*          */
  let issnepub = journal_meta.ele('issn', {'pub-type': 'epub'}).txt('1314-2828');// should probably come from the article layout
  /*          */
  let publisher = journal_meta.ele('publisher');
  /*               */
  let publisherName = publisher.ele('publisher-name').txt('Pensoft Publishers');
  /*     */
  let article_meta = front.ele('article-meta');
  /*          */
  let articleidDoi = article_meta.ele('article-id', {"pub-id-type": "doi"}).txt('10.3897/BDJ.4.e7720') // should probably come from the article layout
  /*          */
  let articleidpublisherid = article_meta.ele('article-id', {"pub-id-type": "publisher-id"}).txt('7720') // should probably come from the article layout
  /*          */
  let articleidmanuscript = article_meta.ele('article-id', {"pub-id-type": "manuscript"}).txt('4912') // should probably come from the article layout
  /*          */
  let articleCategories = article_meta.ele('article-categories')
  /*              */
  let subjGroupHeading = articleCategories.ele('subj-group', {'subj-group-type': "heading"})
  /*                  */
  let subjectHeading = subjGroupHeading.ele('subject').txt('Taxonomic Paper')// should probably come from the article layout
  /*              */
  let subjGroupTaxonCl = articleCategories.ele('subj-group', {'subj-group-type': "Taxon classification"})
  /*                  */
  let subjectTaxonCl = subjGroupTaxonCl.ele('subject').txt('Core Eudicots: Asterids')// should probably come from the article layout
  /*              */
  let subjGroupSubjectCl = articleCategories.ele('subj-group', {'subj-group-type': "Subject classification"})
  /*                  */
  let subjectSubjectCl1 = subjGroupSubjectCl.ele('subject').txt('Taxonomy')// should probably come from the article layout
  /*                  */
  let subjectSubjectCl2 = subjGroupSubjectCl.ele('subject').txt('Species Inventories')// should probably come from the article layout
  /*                  */
  let subjectSubjectCl3 = subjGroupSubjectCl.ele('subject').txt('Nomenclature')// should probably come from the article layout
  /*                  */
  let subjectSubjectCl4 = subjGroupSubjectCl.ele('subject').txt('Identification Key(s)')// should probably come from the article layout
  /*                  */
  let subjectSubjectCl5 = subjGroupSubjectCl.ele('subject').txt('Floristics & Distribution')// should probably come from the article layout
  /*                  */
  let subjectSubjectCl6 = subjGroupSubjectCl.ele('subject').txt('Biogeography')// should probably come from the article layout
  /*              */
  let subjGroupGeographicalCl = articleCategories.ele('subj-group', {'subj-group-type': "Geographical classification"})
  /*                  */
  let subjectGeographicalCl = subjGroupGeographicalCl.ele('subject').txt('Central America and the Caribbean')// should probably come from the article layout
  /*          */
  let titleGroup = article_meta.ele('title-group')
    /*          */

  let contribGroup = article_meta.ele('contrib-group', {"content-type": "authors"})

  let collaborators = serviceShare.YdocService.collaborators.get('collaborators').collaborators
  let authors = serviceShare.YdocService.collaborators.get('authorsList');

  let authorsAndSymbols:{collaborator:any,affiliationSymbols:string[]}[] = []
  let affiliationsFound:{key:string,displayTxt:string,symbol:string,rid?:string,affiliation:any}[] = [];

  serviceShare.CollaboratorsService.fillAffiliationsData(authors,collaborators,affiliationsFound,authorsAndSymbols)

  affiliationsFound.forEach((aff,index)=>{
    aff.rid = 'A'+(index+1);
    authorsAndSymbols.forEach((user)=>{
      if(user.collaborator.affiliations && user.collaborator.affiliations.length>0){
        user.collaborator.affiliations.forEach((aff1)=>{
          if(aff1.affiliation == aff.affiliation.affiliation&& aff1.city == aff.affiliation.city&& aff1.country== aff.affiliation.country){
            aff1.rid = aff.rid
            aff1.symbol = aff.symbol
          }
        })
      }
    })
  })

  authorsAndSymbols.forEach((author)=>{
    let user = author.collaborator
    /*              */
    let contrib = contribGroup.ele('contrib', {"contrib-type": user.role.toLowerCase(), "corresp": user.role == 'Co-author'?'yes':'no',/*  "xlink:type": "simple" */}) // should probably come from the backend
    /*                  */
    let nameArr = user.name.split(' ');
    let name = contrib.ele('name', {"name-style": "western"})
    /*                      */
    let surname = name.ele('surname').txt(nameArr[nameArr.length-1]);
    /*                      */
    let givenNames = name.ele('given-names').txt(nameArr[0])
    /*                  */
    let email = contrib.ele('email', {"xlink:type": "simple"}).txt(user.email)

    if(user.affiliations&&user.affiliations.length>0){
      user.affiliations.forEach(aff=>{
        let rid = aff.rid;
        let xref = contrib.ele('xref', { "ref-type": "aff", "rid": rid }).txt(aff.symbol);
      })
    }
  })

  collaborators.forEach((author)=>{
    if(author.role != 'Co-author' && author.role != 'Author'){
      let user = author
      /*              */
      let contrib = contribGroup.ele('contrib', {"contrib-type": user.role.toLowerCase(), "corresp": user.role == 'Co-author'?'yes':'no',/*  "xlink:type": "simple" */}) // should probably come from the backend
      /*                  */
      let nameArr = user.name.split(' ');
      let name = contrib.ele('name', {"name-style": "western"})
      /*                      */
      let surname = name.ele('surname').txt(nameArr[nameArr.length-1]);
      /*                      */
      let givenNames = name.ele('given-names').txt(nameArr[0])
      /*                  */
      let email = contrib.ele('email', {"xlink:type": "simple"}).txt(user.email)
    }
  })

  affiliationsFound.forEach((affiliation)=>{
    let aff = article_meta.ele('aff', {"id": affiliation.rid}) // should probably come from the backend and is maybe linked with contributors
    /*              */
    let label = aff.ele('label').txt(affiliation.symbol);
    /*              */
    let addrLineVer = aff.ele('addr-line', {"content-type": "verbatim"}).txt([affiliation.affiliation.affiliation,affiliation.affiliation.city,affiliation.affiliation.country].join(', '));
    /*              */
    let institution = aff.ele('institution', {"xlink:type": "simple"}).txt(affiliation.affiliation.affiliation);
    /*              */
    let addrLineCity = aff.ele('addr-line', {"content-type": "city"}).txt(affiliation.affiliation.city);
    /*              */
    let country = aff.ele('country', {'country': 'RO'}).txt(affiliation.affiliation.country);
  })
  let authorNotes = article_meta.ele('author-notes') // should probably come from the backend
  /*              */
  let fnCor = authorNotes.ele('fn', {"fn-type": "corresp"})
  /*                  */
  let pfnCor = fnCor.ele('p').txt('Corresponding author: Marc Gottschling (')
  /*                      */
  let emailpfnCor = pfnCor.ele('email', {"xlink:type": "simple"}).txt('gottschling@bio.lmu.de')
  /*                      */
  pfnCor.txt(').')
  /*              */
  let fnEditedBy = authorNotes.ele('fn', {"fn-type": "edited-by"})
  /*                  */
  let pfnEditedBy = fnEditedBy.ele('p').txt('Academic editor: Dimitrios Koureas')
  /*          */
  let pubDateCollection = article_meta.ele('pub-date', {"pub-type": "collection"})// should probably come from the backend
  /*              */
  let yearpubDateCollection = pubDateCollection.ele('year').txt('2016')
  /*          */
  let pubDateEpub = article_meta.ele('pub-date', {"pub-type": "epub"})// should probably come from the backend
  /*              */
  let daypubDateEpub = pubDateEpub.ele('day').txt('08')
  /*              */
  let monthpubDateEpub = pubDateEpub.ele('month').txt('06')
  /*              */
  let yearpubDateEpub = pubDateEpub.ele('year').txt('2016')
  /*          */
  let volume = article_meta.ele('volume').txt('4')

  let volumeId = article_meta.ele('volume-id').txt('4')
  /*          */
  let elocationId = article_meta.ele('elocation-id').txt('e7720')
  /*          */
  let uriArpha = article_meta.ele('uri', {
    "content-type": "arpha",
    "xlink:href": "http://openbiodiv.net/FFB11146-FFED-FFDF-FF9C-C8652A49F76B"
  }).txt('FFB11146-FFED-FFDF-FF9C-C8652A49F76B')
  /*          */
  let uriZenedo = article_meta.ele('uri', {
    "content-type": "zenodo_dep_id",
    "xlink:href": "https://zenodo.org/record/121629"
  }).txt('121629')
  /*          */
  let history = article_meta.ele('history')
  /*              */
  let yearreceived = history.ele('date', {"date-type": "received"})// should probably come from the backend
  /*                  */
  let dayyearreceived = yearreceived.ele('day').txt('07')
  /*                  */
  let monthyearreceived = yearreceived.ele('month').txt('01')
  /*                  */
  let yearyearreceived = yearreceived.ele('year').txt('2016')
  /*              */
  let yearaccepted = history.ele('date', {"date-type": "accepted"})// should probably come from the backend
  /*                  */
  let dayyearaccepted = yearaccepted.ele('day').txt('07')
  /*                  */
  let monthyearaccepted = yearaccepted.ele('month').txt('01')
  /*                  */
  let yearyyearaccepted = yearaccepted.ele('year').txt('2016')
  /*          */
  let permissions = article_meta.ele('permissions')// should probably come from the backend
  /*              */
  let copyrightStatement = permissions.ele('copyright-statement').txt('Ramona-Elena Irimia, Marc Gottschling')
  /*              */
  let license = permissions.ele('license', {
    "license-type": "creative-commons-attribution",
    "xlink:href": "http://creativecommons.org/licenses/by/4.0/",
    "xlink:type": "simple"
  })
  /*                  */
  let licenseP = license.ele('license-p').txt('This is an open access article distributed under the terms of the Creative Commons Attribution License (CC BY 4.0), which permits unrestricted use, distribution, and reproduction in any medium, provided the original author and source are credited.')
  /*          */

  const abstractContainer = article_meta.ele('abstract');
  const kwdGroup = article_meta.ele('kwd-group');
  const fundingGroup = article_meta.ele("funding-group");


  /**/
  let body = article.ele("body")
  let notes = front.ele('notes')
  let back = article.ele('back')


const options: IOptions = { refObj, articleMeta: article_meta, titleGroup, notes, back, body, abstractContainer, kwdGroup, fundingGroup }
  // create all article sections
serviceShare.TreeService.articleSectionsStructure.forEach((sec) => {
    let secId = sec.sectionID;
    let container = serviceShare.ProsemirrorEditorsService.editorContainers[secId]
    let secview = container?.editorView;

    parseSection(secview, body, serviceShare, sec, options)
})

let counts = article_meta.ele('counts'); // number of refs,figs,tables in the article
  /*              */
let countsFig = counts.ele('fig-count', {"count": "" + figCount})
  /*              */
let countsTable = counts.ele('table-count', {"count": "" + tableCount})
  /*              */
let countsRef = counts.ele('ref-count', {"count": "" + refCount})



/*          */

// let fundingGroup = article_meta.ele('funding-group')
/*              */
// let fundingStatement = fundingGroup.ele('funding-statement').txt('Funding information'); // meta data for the article
/*          */

  /**/
  /*    */
  let refsList = back.ele('ref-list');
  /*        */
  let refsListTitle = refsList.ele('title').txt('References');

  // loop and build refs as xml
  Object.keys(refObj).forEach((refActualId) => {
    let actualRef = refObj[refActualId]
    let refData = actualRef.ref
    let refType = refData.type;
    let ref = refsList.ele('ref', {id: refIdsG[refActualId]})
    /**/
    let elementCitation = ref.ele('element-citation', {"publication-type": refType, "xlink:type": "simple"});
    if (refData.author && refData.author.length > 0) {
      let personGroupAuthor = elementCitation.ele('person-group', {"person-group-type": "author"})
      refData.author.forEach((author) => {
        let name = personGroupAuthor.ele('name', {"name-style": "western"});
        name.ele('surname').txt(author.family);
        name.ele('given-names').txt(author.given);
      })
    }
    if (refData.contributor && refData.contributor.length > 0) {
      let personGroupContributor = elementCitation.ele('person-group', {"person-group-type": "guest-editor"})
      refData.contributor.forEach((contributor) => {
        let name = personGroupContributor.ele('name', {"name-style": "western"});
        name.ele('surname').txt(contributor.family);
        name.ele('given-names').txt(contributor.given);
      })
    }
    if (refData.editor && refData.editor.length > 0) {
      let personGroupEditor = elementCitation.ele('person-group', {"person-group-type": "editor"})
      refData.editor.forEach((editor) => {
        let name = personGroupEditor.ele('name', {"name-style": "western"});
        name.ele('surname').txt(editor.family);
        name.ele('given-names').txt(editor.given);
      })
    }
    if (refData.issued && refData.issued['date-parts'] && refData.issued['date-parts'][0]) {
      let dateEl = elementCitation.ele('date-in-citation');
      if (refData.issued['date-parts'][0][0]) {
        dateEl.ele('year').txt(refData.issued['date-parts'][0][0] + '')
      }
      if (refData.issued['date-parts'][0][1]) {
        dateEl.ele('month').txt(refData.issued['date-parts'][0][1] + '')
      }
      if (refData.issued['date-parts'][0][2]) {
        dateEl.ele('day').txt(refData.issued['date-parts'][0][2] + '')
      }
    }
    if (refData.title) {
      elementCitation.ele('article-title').txt(refData.title)
    }
    if (refData.volume) {
      elementCitation.ele('volume').txt(refData.volume + '')
    }
    if (refData.issue) {
      elementCitation.ele('issue').txt(refData.issue + '')
    }
    if (refData.URL) {
      elementCitation.ele('ext-link', {'xlink:href': refData.URL,"ext-link-type":"uri"}).txt(refData.URL + '')
    }
    if (refData.page) {
      elementCitation.ele('page-range').txt(refData.page + '')
    }
    if (refData['container-title']) {
      elementCitation.ele('chapter-title').txt(refData['container-title'] + '')
    }
    if (refData.city) {
      elementCitation.ele('publisher-loc').txt(refData.city + '')
    }
    if (refData.publisher) {
      elementCitation.ele('publisher-name').txt(refData.publisher + '')
    }
    if (refData.ISBN) {
      elementCitation.ele('isbn').txt(refData.ISBN + '')
    }
    if (refData['translated-title']) {
      elementCitation.ele('trans-title').txt(refData['translated-title'] + '')
    }
    if (refType == 'paper-conference') {
      if (refData['event-date']) {
        elementCitation.ele('conf-date').txt(refData['event-date'] + '')
      }
      if (refData['event-place']) {
        elementCitation.ele('conf-loc').txt(refData['event-place'] + '')
      }
      if (refData['event-title']) {
        elementCitation.ele('conf-name').txt(refData['event-title'] + '')
      }

    }
    if (refData['journal-volume']) {
      elementCitation.ele('volume-series').txt(refData['journal-volume'] + '')
    }
    if (refData.institution) {
      elementCitation.ele('institution').txt(refData.institution + '')
    }
    if (refData.version) {
      elementCitation.ele('named-content', {'content-type': 'version'}).txt(refData.version + '')
    }
  })
  /**/
  let floatsGroup
  if(
    Object.values(figObj).filter(x=>x).length>0||
    Object.values(tablesObj).filter(x=>x).length>0||
    Object.values(suppleFilesObj).filter(x=>x).length>0
    ){
    floatsGroup = article.ele('floats-group') // figs & citable-tables & supplementary files
  }
  let domPMParser = DOMParser.fromSchema(schema);

  if(Object.values(endNotesObj).filter(x=>x).length>0){
    let footNotesGroup = back.ele('fn-group');
    footNotesGroup.ele('label').txt('Foot Notes.');
    Object.keys(endNotesObj).forEach((endNoteId)=>{
      let endNote = endNotesObj[endNoteId]
      let footNotexmlId = endNotesIdsG[endNoteId]
      if(!endNote) return;

      let footNoteXML = footNotesGroup.ele('fn',{id:footNotexmlId});
      footNoteXML.ele('label').txt('Foot Note '+(endNote.end_note_number+1)+'.');

      let footNoteContentXML = footNoteXML.ele('p')
      let dom = document.createElement('div');
      dom.innerHTML = endNote.end_note;
      let fnContentJSON = domPMParser.parse(dom).toJSON();
      parseNode(fnContentJSON, footNoteContentXML, true, '--', 1,{skipTableWrap:true, ...options});
    })
  }

  Object.keys(figObj).forEach((figid) => {
    let fig = figObj[figid];
    let figXML = floatsGroup.ele('fig-group', {id: figIdsG[figid], position: "float", orientation: "portrait"})
    let dom = document.createElement('div');
    dom.innerHTML = fig.description;
    let figDescNodes = domPMParser.parse(dom).toJSON();

    let figCaption = figXML.ele('caption');
    figCaption.ele('title').txt("Figure " + ((fig.figureNumber + 1) + '.'));

    parseNode(figDescNodes, figCaption, false, '--', 0, options);
    fig.components.forEach((figComp, i) => {
      let figCompXML = figXML.ele('fig', {position: "float", orientation: "portrait"});
      let figCompXMLCaption = figCompXML.ele('caption');
      let figCompXMLLabel = figCompXMLCaption.ele('title').txt("Figure " + (fig.figureNumber + 1) + String.fromCharCode(97 + i) + ".");

      let figCompType = figComp.componentType
      let figCompDesc = figComp.description
      let figCompUrl = figComp.url

      let domOfCompDesc = document.createElement('div');
      domOfCompDesc.innerHTML = figCompDesc;
      let figCompDescNodes = domPMParser.parse(domOfCompDesc).toJSON();
      parseNode(figCompDescNodes, figCompXMLCaption, false, '--', 0, options);

      if (figCompType == "image") {
        let figCompGraphic = figCompXML.ele('graphic', {
          "xlink:href": figCompUrl,
          "orientation": "portrait",
          "xlink:type": "simple",
        })
      } else if (figCompType == 'video') {
        let figCompMedia = figCompXML.ele('media', {
          "mimetype": "video",
          "xlink:href": figCompUrl,
          "orientation": "portrait",
          "xlink:type": "simple",
        })
      }
    })
  })

  Object.keys(tablesObj).forEach((tblid)=>{
    let tableData = tablesObj[tblid];
    let tableXmlId = tableIdsG[tblid];
    let tableXML = floatsGroup.ele('table-wrap', {id: tableXmlId, position: "float", orientation: "portrait"});

    let tableNumber = tableData.tableNumber + 1;
    tableXML.ele('label').txt(`Table ${tableNumber}.`);

    let dom = document.createElement('div');
    dom.innerHTML = tableData.header;
    let tableHeadingNodes = domPMParser.parse(dom).toJSON();

    let captionEle = tableXML.ele('caption')
    parseNode(tableHeadingNodes, captionEle, false, '--', 0, options);

    let dom1 = document.createElement('div');
    dom1.innerHTML = tableData.content;
    let tableContentNodes = domPMParser.parse(dom1).toJSON();
    parseNode(tableContentNodes, tableXML, false, '--', 0,{skipTableWrap:true, ...options});

    let dom2 = document.createElement('div');
    dom2.innerHTML = tableData.footer;
    let tableFooterNodes = domPMParser.parse(dom2).toJSON();
    let footerElement = tableXML.ele('table-wrap-foot');
    parseNode(tableFooterNodes, footerElement, false, '--', 0, options);
  })

  Object.keys(suppleFilesObj).forEach((supplFileId)=>{
    let supplFileData = suppleFilesObj[supplFileId];
    let supplFileXmlId = supplFilesIdsG[supplFileId];
    let supplFileXML = floatsGroup.ele('supplementary-material',{
      id:supplFileXmlId,
      orientation:"portrait",
      position:"float",
      'mimetype':supplFileData.data_type
    });
    let labelEl = supplFileXML.ele('label').txt('Supplementary material '+(supplFileData.supplementary_file_number+1));
    let caption = supplFileXML.ele('caption')
    supplFileXML.ele('ext-link', {"xlink:href": supplFileData.url, "ext-link-type": 'uri', "xlink:type": "simple"});
    let dom = document.createElement('div');
    dom.innerHTML = supplFileData.brief_description;
    let supplFileDescNodes = domPMParser.parse(dom).toJSON();
    caption.ele('title').txt(supplFileData.title)
    parseNode(supplFileDescNodes, caption, false, '--', 1,{skipTableWrap:true, ...options});

    let authorAttrb = supplFileXML.ele('attrib',{
      'specific-use':"authors"
    }).txt(supplFileData.authors);
  })

  let xmlString = article.end({prettyPrint: true})
  var blob = new Blob([xmlString], {type: "text/xml"});
  /* let xmlUrl = URL.createObjectURL(blob);
  window.open(xmlUrl) */
  const file = new File([xmlString], "foo.xml", {
    type: "text/xml",
  });
  var formdata = new FormData();
  formdata.append("file", file);
  formdata.append("file222", "qwaeqwe");

  const formData = new FormData();
  formData.append("file", file);//https://ps-jats.dev.scalewest.com/validate/xml

  serviceShare.httpClient.post(`${config.validateJats}/validate/xml`, formData).subscribe((data:{valid:boolean,errors:any[]}) => {
    serviceShare.ProsemirrorEditorsService.stopSpinner()
    if(data.valid){
      serviceShare.openSnackBar('Valid JATS xml has been generated.','Save JATS xml',()=>{
        saveAs(blob, "save.xml");
      },5);

    }else{
      serviceShare.openSnackBar('The generated JATS xml is not valid. You can view errors in notifications','Save JATS xml',()=>{
        saveAs(blob, "save.xml");
      },5);
      let date = Date.now()
      serviceShare.NotificationsService.addLocalNotification({
        date,
        event: 'JATS errors',
        status: 'FAILED',
        eventId: uuidv4(),
        new: true,
        link: 'open jats render errors',
        metaData: ['Status - Failed', `Document - ${serviceShare.YdocService.articleData.name}`, 'Type - JATS Export', moment(date).format('MMM DD, YYYY, hh:mm:ss A')]
      })
    }

  })
}

function customNodesParser(sec: articleSection, secview: EditorView, serviceShare,options: IOptions ) {
      if(secview) {
        switch (sec.title.name) {
        case '[AM] Title':{
          let element = sec.jats_tag ? options.titleGroup.ele(sec.jats_tag) : options.titleGroup.ele('article-title')
          parseNode(secview.state.toJSON().doc, element, false, '--', 0,{articleTitle: true, ...options})
          break
        }
        case '[AM] Keywords':{
          parseNode(secview.state.toJSON().doc, options.kwdGroup, false, '--', 0,{keywordGroup: true, ...options})
        }
        break
        case '[AM] Funding program':
        case '[AM] Grant title':
        case '[AM] Hosting institution':
        case '[AM] Ethics and security':
        case '[AM] Conflicts of interest':{

          let element = sec.jats_tag ? options.notes.ele(sec.jats_tag, {"sec-type": sec.title.name}) : options.notes.ele('sec', {"sec-type": sec.title.name})
          parseNode(secview.state.toJSON().doc, element, false, '--', 0, options)
          break
        }
        case '[AM] Abstract':{
          parseNode(secview.state.toJSON().doc, options.abstractContainer, false, '--', 0,{abstract: true, ...options})
          break
        }
        case '[AM] Author contributions':{
          const element = sec.jats_tag ? options.back.ele(sec.jats_tag, {"sec-type": sec.title.name}) : options.back.ele('sec', {"sec-type": sec.title.name})
          parseNode(secview.state.toJSON().doc, element, false, '--', 0, options)
          break
        }
        default:
          parseSection(secview, options.body, serviceShare, sec, options);
          break;
        }
   } else if (sec.title.name == "[AM] Funder") {
    const data = serviceShare.YdocService.customSectionProps.get("customPropsObj")[sec.sectionID];

    if(data?.data) {
      const arr = data.data.split(',');

      arr.forEach((f) => {
        if(f.trim().length > 0) {
          const awardGroup = options.fundingGroup.ele("award-group");
          const fundingSource = awardGroup.ele("funding-source");
          fundingSource.ele("named-content", {"content-type": "funder_name"}).txt(f.trim());
        }
      })
    }
  }

}


function parseMaterial(material: articleSection, matList: XMLBuilder, serviceShare: ServiceShare) {
  let matData = material.defaultFormIOValues;
  let matP = matList.ele('p')
  Object.keys(matData).forEach((key, i) => {
    if (key != 'typeHeading') {
      if (i != 0) {
        matP.txt('; ');
      }
      matP.txt(key + ': ');
      if ((matData[key] as string).startsWith('https:') || (matData[key] as string).startsWith('http:')) {
        matP.ele('named-content', {'content-type': "dwc:" + key, 'xlink:type': "simple"}).ele('ext-link', {
          'ext-link-type': "uri",
          'xlink:href': matData[key],
          'xlink:type': "simple"
        }).txt(matData[key])
      } else {
        matP.ele('named-content', {'content-type': "dwc:" + key, 'xlink:type': "simple"}).txt(matData[key])
      }
    }
  })
}

function parseTaxon(taxview: EditorView | undefined, container: XMLBuilder, serviceShare: ServiceShare, section: articleSection,options:any) {
  let xmlTaxon = container.ele('tp:taxon-treatment');
  if(!section.children)return;
  if(section.children.length == 0)return;
  let taxNomencl = section.children.find((sec) => sec.title.name == '[MM] Nomenclature');
  if(!taxNomencl)return;
  let editorContainer = serviceShare.ProsemirrorEditorsService.editorContainers[taxNomencl.sectionID]
  if(!editorContainer)return;
  let nomencData = editorContainer.editorView.state.toJSON().doc
  let nomenclatureEl = xmlTaxon.ele('tp:nomenclature')
  nomenclatureEl.ele('label').txt('Nomenclature');
  let name = nomencData.content.find((el) => el.type == "form_field" && el.attrs.formControlName == 'name');
  if (name) {
    let nameEl = nomenclatureEl.ele('tp:taxon-name')
    name.content.forEach((ch, i) => {
      parseNode(ch, nameEl, true, '', i, options)
    })
  }
  let authority = nomencData.content.find((el) => el.type == "form_field" && el.attrs.formControlName == "authority");
  if (authority) {
    let El = nomenclatureEl.ele('tp:taxon-authority')
    authority.content.forEach((ch, i) => {
      parseNode(ch, El, true, '', i, options)
    })
  }
  let status = nomencData.content.find((el) => el.type == "form_field" && el.attrs.formControlName == "status");
  if (status) {
    let El = nomenclatureEl.ele('tp:taxon-status')
    status.content.forEach((ch, i) => {
      parseNode(ch, El, true, '', i, options)
    })
  }
  let identifier = nomencData.content.find((el) => el.type == "form_field" && el.attrs.formControlName == "identifier");
  if (identifier) {
    let El = nomenclatureEl.ele('tp:taxon-identifier')
    identifier.content.forEach((ch, i) => {
      parseNode(ch, El, true, '', i, options)
    })
  }
  let link = nomencData.content.find((el) => el.type == "form_field" && el.attrs.formControlName == "link");
  if (link) {
    let El = nomenclatureEl.ele('xref')
    link.content.forEach((ch, i) => {
      parseNode(ch, El, true, '', i, options)
    })
  }
  let genus = nomencData.content.find((el) => el.type == "form_field" && el.attrs.formControlName == 'genus');
  if (genus) {
    let El = nomenclatureEl.ele('tp:type-genus').ele('tp:taxon-name')
    genus.content.forEach((ch, i) => {
      parseNode(ch, El, true, '', i, options)
    })
  }
  /* let species = nomencData.content.find((el)=>el.type == "form_field"&&el.attrs.formControlName == 'species');
  if(species){
    let El = nomenclatureEl.ele('tp:type-species').ele('tp:taxon-name')
    species.content.forEach((ch,i)=>{
      parseNode(ch,El,true,'',i)
    })
  } */
  let location = nomencData.content.find((el) => el.type == "form_field" && el.attrs.formControlName == 'location');
  if (location) {
    let El = nomenclatureEl.ele('tp:taxon-type-location')
    location.content.forEach((ch, i) => {
      parseNode(ch, El, true, '', i, options)
    })
  }
  let taxExtLinks = section.children.find((sec) => sec.title.name == '[MM] External Links');
  let taxExtLinksEl = xmlTaxon.ele('tp:treatment-sec', {"sec-type": taxExtLinks.title.name})
  let viewExtLinks = serviceShare.ProsemirrorEditorsService.editorContainers[taxExtLinks.sectionID] ? serviceShare.ProsemirrorEditorsService.editorContainers[taxExtLinks.sectionID].editorView : undefined;
  viewExtLinks ? parseNode(viewExtLinks.state.toJSON().doc, taxExtLinksEl, false, '--', 0, options) : undefined;
  let taxMaterials = section.children.find((sec) => sec.title.name == '[MM] Materials');
  let taxMatSection = xmlTaxon.ele('tp:treatment-sec', {"sec-type": taxMaterials.title.name})
  let materailsTitle = taxMatSection.ele('title').txt('Materials');
  let matList = taxMatSection.ele('list');
  if (taxMaterials.type == 'complex' && taxMaterials.children && taxMaterials.children.length > 0) {
    taxMaterials.children.forEach((matChild) => {
      let matListItem = matList.ele('list-item')
      parseMaterial(matChild, matListItem, serviceShare)
    })
  }
  let taxSections = section.children.find((sec) => sec.title.name == '[MM] Treatment sections');
  if (taxSections.children && taxSections.children.length > 0) {
    taxSections.children.forEach((treatmentSubSec) => {
      let chId = treatmentSubSec.sectionID;
      let view = serviceShare.ProsemirrorEditorsService.editorContainers[chId] ? serviceShare.ProsemirrorEditorsService.editorContainers[chId].editorView : undefined;
      let taxonSection = xmlTaxon.ele('tp:treatment-sec', {"sec-type": treatmentSubSec.title.name})
      view ? parseNode(view.state.toJSON().doc, taxonSection, false, '--', 0, options) : undefined;
      if (treatmentSubSec.type == 'complex' && treatmentSubSec.children && treatmentSubSec.children.length > 0) {
        treatmentSubSec.children.forEach((subsec) => {
          let chId = subsec.sectionID;
          let view = serviceShare.ProsemirrorEditorsService.editorContainers[chId] ? serviceShare.ProsemirrorEditorsService.editorContainers[chId].editorView : undefined;
          let taxonSection = xmlTaxon.ele('tp:treatment-sec', {"sec-type": subsec.title.name})
          view ? parseNode(view.state.toJSON().doc, taxonSection, false, '--', 0, options) : undefined;
          if (subsec.type == 'complex' && subsec.children && subsec.children.length > 0) {
            subsec.children.forEach((subsecchild) => {
              let chId = subsecchild.sectionID;
              let view = serviceShare.ProsemirrorEditorsService.editorContainers[chId] ? serviceShare.ProsemirrorEditorsService.editorContainers[chId].editorView : undefined;
              parseSection(view, taxonSection, serviceShare, subsecchild,options);
            })
          }
        })
      }
    })
  }
  /* section.children.forEach((child) => {
    let chId = child.sectionID
    let view = serviceShare.ProsemirrorEditorsService.editorContainers[chId] ? serviceShare.ProsemirrorEditorsService.editorContainers[chId].editorView : undefined;
    if (child.title.name == '[MM] Nomenclature') {
      let taxonNomenclature = xmlTaxon.ele('tp:nomenclature')
      view ? parseNode(view.state.toJSON().doc, taxonNomenclature, false, '--', 0) : undefined;
    } else if (child.title.name == '[MM] External Links' || child.title.name == '[MM] Materials') {
      let taxonSection = xmlTaxon.ele('tp:treatment-sec', { "sec-type": child.title.name })
      if (child.title.name == '[MM] External Links') {
        view ? parseNode(view.state.toJSON().doc, taxonSection, false, '--', 0) : undefined;
      } else {
        let materailsTitle = taxonSection.ele('title').txt('Materials');
        let matList = taxonSection.ele('list');
        if (child.type == 'complex' && child.children && child.children.length > 0) {
          child.children.forEach((matChild) => {
            let matListItem = matList.ele('list-item')
            let chId = matChild.sectionID;
            parseMaterial(matChild, matListItem, serviceShare)
          })
        }
      }
    } else if (child.title.name == '[MM] Treatment sections') {
      if (child.children && child.children.length > 0) {
        child.children.forEach((treatmentSubSec) => {
          let chId = treatmentSubSec.sectionID;
          let view = serviceShare.ProsemirrorEditorsService.editorContainers[chId] ? serviceShare.ProsemirrorEditorsService.editorContainers[chId].editorView : undefined;
          let taxonSection = xmlTaxon.ele('tp:treatment-sec', { "sec-type": treatmentSubSec.title.name })
          view ? parseNode(view.state.toJSON().doc, taxonSection, false, '--', 0) : undefined;
          if (treatmentSubSec.type == 'complex' && treatmentSubSec.children && treatmentSubSec.children.length > 0) {
            treatmentSubSec.children.forEach((subsec) => {
              let chId = subsec.sectionID;
              let view = serviceShare.ProsemirrorEditorsService.editorContainers[chId] ? serviceShare.ProsemirrorEditorsService.editorContainers[chId].editorView : undefined;
              let taxonSection = xmlTaxon.ele('tp:treatment-sec', { "sec-type": subsec.title.name })
              view ? parseNode(view.state.toJSON().doc, taxonSection, false, '--', 0) : undefined;
              if (subsec.type == 'complex' && subsec.children && subsec.children.length > 0) {
                subsec.children.forEach((subsecchild) => {
                  let chId = subsecchild.sectionID;
                  let view = serviceShare.ProsemirrorEditorsService.editorContainers[chId] ? serviceShare.ProsemirrorEditorsService.editorContainers[chId].editorView : undefined;
                  parseSection(view, taxonSection, serviceShare, subsecchild);
                })
              }
            })
          }
        })
      }
    }
  }) */
}

function parseSection(view: EditorView | undefined, container: XMLBuilder, serviceShare: ServiceShare, section: articleSection,options:any) {
  if (section.title.name != 'Taxon' && section.title.name != '[MM] Materials' && section.title.name != 'Material' && section.title.name != 'Taxon' && section.title.name != '[MM] Taxon treatments' && !section.title.name.startsWith('[AM]')) { // not a custum section
    let secXml = container.ele('sec', {"sec-type": section.title.name});
    let title = secXml.ele('title').txt(section.title.label.length > 0 ? section.title.label : section.title.name)
    view ? parseNode(view.state.toJSON().doc, secXml, false, '--', 0,options) : undefined;
    if (section.type == 'complex' && section.children && section.children.length > 0) {
      section.children.forEach((child, i) => {
        let chId = child.sectionID;
        let view = serviceShare.ProsemirrorEditorsService.editorContainers[chId] ? serviceShare.ProsemirrorEditorsService.editorContainers[chId].editorView : undefined;

        if(section.children.length - 1 == i && secXml.first().node.nodeName == "title" && secXml.last().node.nodeName == "title") {
          secXml.remove();
        }
         parseSection(view, secXml, serviceShare, child,options);
      })
    }
    if (secXml.some((node, i) => {
      return node.node.nodeName == 'title' && i == 1
    })) {
      title.remove();
    } else {
    }
  } else if (section.title.name.startsWith('[AM]')) {
    customNodesParser(section,  view, serviceShare, options);
  } else if (section.title.name == '[MM] Taxon treatments') {
    // render taxons section
    let secXml = container.ele('sec', {"sec-type": 'Taxon treatments'});
    view ? parseNode(view.state.toJSON().doc, secXml, false, '--', 0,options) : undefined;
    if (section.type == 'complex' && section.children && section.children.length > 0) {
      section.children.forEach((child) => {
        let chId = child.sectionID;
        let view = serviceShare.ProsemirrorEditorsService.editorContainers[chId] ? serviceShare.ProsemirrorEditorsService.editorContainers[chId].editorView : undefined;
        parseTaxon(view, secXml, serviceShare, child,options);
      })
    }
  } else {
    if (section.type == 'complex' && section.children && section.children.length > 0) {
      let secXml = container.ele('sec', {"sec-type": section.title.name});
      section.children.forEach((child) => {
        let chId = child.sectionID;
        let view = serviceShare.ProsemirrorEditorsService.editorContainers[chId] ? serviceShare.ProsemirrorEditorsService.editorContainers[chId].editorView : undefined;
        parseSection(view, secXml, serviceShare, child,options);
      })
    }
  }
}

let mathCount = 1;

let processPmNodeAsXML  = function(node: any, xmlPar: XMLBuilder, before: string, index: number,options:any) {
  let newParNode: XMLBuilder
  let shouldSkipNextBlockElements = false;
  let shouldContinueRendering = true
  if (node.type == 'heading') {
    if (index == 0 && options.articleTitle) {
      xmlPar.txt(node.content[0].content[0].text);
      return;
    }
    if (index == 0 && (options?.keywordGroup || options.abstract)) {
      newParNode = xmlPar.ele('label')
      options.keywordLabel = true
    } else if (index == 0) {
      newParNode = xmlPar.ele('title')
    } else if (options.articleTitle) {
      newParNode = xmlPar
    } else {
        newParNode = xmlPar.ele('p')
    }
    shouldSkipNextBlockElements = true;
  } else if (node.type == 'text' && (!node.marks || node.marks.length == 0)) {

    if (options?.keywordGroup && !options?.keywordLabel) {
      const keywords = node.text.split(/[,\s]/).map(keyword => keyword.trim());
      keywords.forEach(keyword => keyword ? xmlPar.ele('kwd').txt(keyword) : undefined)
      return
    }
    delete options?.keywordLabel
    xmlPar.txt(node.text);
    return;
  } else if (node.type == 'text' && node.marks && node.marks.length > 0) {

      processPmMarkAsXML(node, xmlPar, before, options)

    return;
  } else if (node.type == "reference_citation" && node.attrs.nonexistingelement == false) {
    let citedRefs = node.attrs.citedRefsIds as string[]
    let citedRefsCiTOs = node.attrs.citedRefsCiTOs as string[];
    citedRefs.forEach((x, i)=>{
      if (x === 'pointing-to-deleted-ref') {
        return
      }
      let actualRef = options.refObj[x];
      let rid = refIdsG[x];
      let refTxt = actualRef.citation.data[+node.attrs.citationStyle].text;
      let xrefAttr = {
        "ref-type": "bibr",
        "rid": rid
      }
      let CiTO = CiToTypes.find(type => type.label == citedRefsCiTOs[i] && type.label !== "None");
      if(CiTO){
        let CiTOlink = CiTO.link
        xrefAttr['custom-type'] = CiTOlink
      }
      let xmlref = xmlPar.ele('xref', xrefAttr)
      xmlref.txt(refTxt);
    })
    shouldContinueRendering  = false;
  } else if (node.type == "paragraph") {
    if (options?.keywordGroup) {
      newParNode = xmlPar
    } else {
        newParNode = xmlPar.ele('p')
    }
  } else if (node.type == 'math_inline') {
    newParNode = xmlPar.ele('inline-formula')
    mathCount++
  } else if (node.type == 'math_display') {
    newParNode = xmlPar.ele('disp-formula').ele('tex-math', {id: "M" + mathCount}).txt(`\\begin{document}$$${node.content[0].text}$$\\end{document}`)
    mathCount++
    return
  } else if (node.type == 'ordered_list') {
    newParNode = xmlPar.ele('list', {"list-type": "order"})
  } else if (node.type == 'bullet_list') {
    newParNode = xmlPar.ele('list', {"list-type": "simple"})
  } else if (node.type == 'list_item') {
    newParNode = xmlPar.ele('list-item')
  } else if (node.type == 'table') {
    if(options&&options.skipTableWrap){
      newParNode = xmlPar.ele('table', {
        "rules": "all",
        "frame": "box",
        "cellpadding": "5"
      }).ele("tbody");
    }else{
      newParNode = xmlPar.ele('table-wrap').ele('table', {
        "rules": "all",
        "frame": "box",
        "cellpadding": "5"
      }).ele("tbody");
    }
  } else if (node.type == 'table_row') {
    newParNode = xmlPar.ele('tr');
  } else if (node.type == 'table_cell') {
    newParNode = xmlPar.ele('th');
    shouldSkipNextBlockElements = true;
  } else if (node.type == 'blockquote') {
    newParNode = xmlPar.ele('disp-quote')
  } else if (node.type == 'horizontal_rule') {
    xmlPar.ele('hr')
    return;
  } else if (node.type == 'code') {
    newParNode = xmlPar.ele('code');
  }/*  else if (node.type == 'hard_break') {
    newParNode = xmlPar.ele('break');
    return
  } */ else if (node.type == 'image') {
    xmlPar.ele('inline-graphic', {
      "xlink:href": node.attrs.src,
      /* "orientation": "portrait", */
      "xlink:type": "simple",
    });
    return
  } else if (node.type == "video") {
    xmlPar.ele('media', {
      "mimetype": "video",
      "xlink:href": node.attrs.src,
      "orientation": "portrait",
      "xlink:type": "simple",
    });
    return
  } else {
    if (node.content && node.content.length > 0) {
      node.content.forEach((ch:any, indx:number) => {
        parseNode(ch, xmlPar, false, before + "|--", indx,options)
      })
    }
    return;
  }
  if (node.content && node.content.length > 0 && shouldContinueRendering) {
    node.content.forEach((ch:any, indx:number) => {
      parseNode(ch, newParNode, shouldSkipNextBlockElements, before + "|--", indx,options)
    })
  }
}

let processPmMarkAsXML = (node: any, xmlPar: XMLBuilder, before: string, options: IOptions) => {
  let xmlParent = xmlPar
  if((node.marks as any[]).some((mark)=>
    ["citation","table_citation","supplementary_file_citation","end_note_citation"].includes(mark.type)&&
    (mark.attrs.nonexistingelement == "true"||mark.attrs.nonexistingelement == true)
  )){
    return
  }
  let marksCopy = [...node.marks];
  let idOfTaxonMark = marksCopy.findIndex(x=>x.type == 'taxon');
  if(idOfTaxonMark>-1){
    let taxon = marksCopy.splice(idOfTaxonMark,1)[0];
    marksCopy.push(taxon)
  }
  marksCopy.forEach((mark, i: number) => {
    if (mark.type == 'citation') {
      let citatedFigs = mark.attrs.citated_elements.map((fig: string) => fig.split('|')[0]);
      citatedFigs.forEach((fig, i) => {
        if (i == 0) {
          xmlParent = xmlParent.ele('xref', {"ref-type": "fig", "rid": figIdsG[fig]});
        } else {
          xmlParent = xmlParent.ele('named-content', {"content-type": 'xref'}).ele('xref', {
            "ref-type": "fig",
            "rid": figIdsG[fig]
          });
        }
      })
    } else if (mark.type == 'table_citation') {
      let citatedTbls = mark.attrs.citated_elements.map((table: string) => table.split('|')[0]);
      citatedTbls.forEach((table, i) => {
        if (i == 0) {
          xmlParent = xmlParent.ele('xref', {"ref-type": "table", "rid": tableIdsG[table]});
        } else {
          xmlParent = xmlParent.ele('named-content', {"content-type": 'xref'}).ele('xref', {
            "ref-type": "table",
            "rid": tableIdsG[table]
          });
        }
      })
    } else if (mark.type == 'supplementary_file_citation'){
      let citatedSupplFiles = mark.attrs.citated_elements.map((table: string) => table.split('|')[0]);
      citatedSupplFiles.forEach((supplFile, i) => {
        if (i == 0) {
          xmlParent = xmlParent.ele('xref', {"ref-type": "supplementary-material", "rid": supplFilesIdsG[supplFile]});
        } else {
          xmlParent = xmlParent.ele('named-content', {"content-type": 'xref'}).ele('xref', {
            "ref-type": "supplementary-material",
            "rid": supplFilesIdsG[supplFile]
          });
        }
      })
    } else if (mark.type == 'end_note_citation'){
      let citatedEndNotes = mark.attrs.citated_elements.map((table: string) => table.split('|')[0]);
      citatedEndNotes.forEach((endNote, i) => {
        if (i == 0) {
          xmlParent = xmlParent.ele('xref', {"ref-type": "fn", "rid": endNotesIdsG[endNote]});
        } else {
          xmlParent = xmlParent.ele('named-content', {"content-type": 'xref'}).ele('xref', {
            "ref-type": "fn",
            "rid": endNotesIdsG[endNote]
          });
        }
      })
    } else if (mark.type == 'taxon'){
      if(options?.keywordGroup) {
        if(node.text) {
          node.text = node.text.split(',').find(k => k.trim().length > 0).trim();
        }
        xmlParent = xmlParent.ele('kwd').ele("tp:taxon-name");
      } else {
        xmlParent = xmlParent.ele('tp:taxon-name');
      }
    } else if (mark.type == 'em') {
      xmlParent = xmlParent.ele('italic');
    } else if (mark.type == "strong") {
      xmlParent = xmlParent.ele('bold');
    } else if (mark.type == "underline") {
      xmlParent = xmlParent.ele('underline');
    } else if (mark.type == "subscript") {
      xmlParent = xmlParent.ele('sub');
    } else if (mark.type == "superscript" && node.text !== " ") {
      xmlParent = xmlParent.ele('sup');
    } else if (mark.type == 'link') {
      let linkHref = mark.attrs.href;
      xmlParent = xmlParent.ele('ext-link', {"xlink:href": linkHref, "ext-link-type": 'uri', "xlink:type": "simple"});
    }
    //@ts-ignore
    else if (xmlParent.node.localName === 'kwd-group') {
      xmlParent.last().txt(node.text)
      return
    }
    if (i == node.marks.length - 1) {
      xmlParent.txt(node.text);
    }
  })
}

let nodesToSkip = ['form_field', 'inline_block_container', 'form_field_inline_view', 'form_field_inline'];
let nodesNotToLoop = ['figures_nodes_container', 'tables_nodes_container','reference_container'];
let nodesThatShouldNotBeSkipped = [
  'ordered_list',
  'list_item', 'table',
  'bullet_list',
  'blockquote',
  "math_display",
  "horizontal_rule",
  "code_block",
  "hard_break",
]

function isBlockNode(name: string) {
  if (schema.nodes[name] && schema.nodes[name].isBlock) {
    return true;
  }
  return false;
}

let isEmpty = (node:any) => {
  let empty = true;
  let checkNode = (n:any) => {
    if(n.type == 'text'&&n.text&&n.text.length>0){
      empty = false;
    }else if(n.type!='text'&&n.content){
      n.content.forEach((ch)=>{
        checkNode(ch)
      })
    }
  }
  checkNode(node)
  return empty
}

function parseNode(node: any, xmlPar: XMLBuilder, shouldSkipBlockElements: boolean, before: string, index: number,options?:any) {
  // prevent render of empty(with no text content) nested elements
  if(isEmpty(node)){
    return;
  }
  if (nodesToSkip.includes(node.type) || (shouldSkipBlockElements && isBlockNode(node.type) && !nodesNotToLoop.includes(node.type) && !nodesThatShouldNotBeSkipped.includes(node.type))) { // nodes that should be skipped and looped through their children
    if (node.content && node.content.length > 0) {
      node.content.forEach((ch, i) => {
        parseNode(ch, xmlPar, shouldSkipBlockElements, before, index,options)
      })
    }
  } else if (nodesNotToLoop.includes(node.type)) { // nodes that should not be looped nor their children
  } else {
    processPmNodeAsXML(node, xmlPar, before, index,options)
  }
}
