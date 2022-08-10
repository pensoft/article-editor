import { ServiceShare } from "@app/editor/services/service-share.service";
import { bigJatsFile } from "./jatsFile";
import { saveAs } from 'file-saver';
import { create } from 'xmlbuilder2';
import { D } from "@angular/cdk/keycodes";
import { Node } from "prosemirror-model";
import { XMLBuilder } from "xmlbuilder2/lib/interfaces";
import { articleSection } from "@app/editor/utils/interfaces/articleSection";
import { EditorView } from "prosemirror-view";
import { schema } from "@app/editor/utils/Schema";

export function exportAsJatsXML(serviceShare: ServiceShare) {

  let figObj = serviceShare.YdocService.figuresMap.get('ArticleFigures')
  let figCount = 0
  Object.keys(figObj).forEach((figId)=>{
    let val = figObj[figId];
    if(val){
      figCount ++
    }
  })
  let refObj = serviceShare.YdocService.referenceCitationsMap?.get('referencesInEditor')
  let refCount = 0
  Object.keys(refObj).forEach((refId)=>{
    let val = refObj[refId];
    if(val){
      refCount ++
    }
  })
  let tableCount = countTablesInArticle(serviceShare)

  let lang = { 'xml:lang': "en" }
  let article = create({ version: '1.0', encoding: "UTF-8",standalone:false }).dtd({
    name:"article",
    pubID:"-//TaxPub//DTD Taxonomic Treatment Publishing DTD v1.0 20180101//EN",
    sysID:"./JATS-Publishing-1-1-MathML3-DTD/tax-treatment-NS0-v1.dtd"})
    .ele('article', {
    'xmlns:mml': "http://www.w3.org/1998/Math/MathML",
    'xmlns:xlink': "http://www.w3.org/1999/xlink",
    'xmlns:xsi': "http://www.w3.org/2001/XMLSchema-instance",
    'xmlns:tp': "http://www.plazi.org/taxpub",
    'article-type': 'research-article',// should probably come from the article layout
    'dtd-version': "1.0",
    ...lang,
  })
  /**/let front = article.ele('front')
  /*     */let journal_meta = front.ele('journal-meta');
  /*          */let journalidPublisherId = journal_meta.ele('journal-id', { "journal-id-type": "publisher-id" }).txt('1') // should probably come from the article layout
  /*          */let journalidIndex = journal_meta.ele('journal-id', { "journal-id-type": "index" }).txt('urn:lsid:arphahub.com:pub:F9B2E808-C883-5F47-B276-6D62129E4FF4') // should probably come from the article layout
  /*          */let journalidAggregator = journal_meta.ele('journal-id', { "journal-id-type": "aggregatorid" }).txt('urn:lsid:zoobank.org:pub:245B00E9-BFE5-4B4F-B76E-15C30BA74C02') // should probably come from the article layout
  /*          */let journal_title_group = journal_meta.ele('journal-title-group')
  /*               */let journal_title = journal_title_group.ele('journal-title',lang).txt('Biodiversity Data Journal')// should probably come from the article layout
  /*               */let abbrev_journal_title = journal_title_group.ele('abbrev-journal-title',lang).txt('BDJ')// should probably come from the article layout
  /*          */let issnppub = journal_meta.ele('issn',{'pub-type':'ppub'}).txt('1314-2836');// should probably come from the article layout
  /*          */let issnepub = journal_meta.ele('issn',{'pub-type':'epub'}).txt('1314-2828');// should probably come from the article layout
  /*          */let publisher = journal_meta.ele('publisher');
  /*               */let publisherName = publisher.ele('publisher-name').txt('Pensoft Publishers');
  /*     */let article_meta = front.ele('article-meta');
  /*          */let articleidDoi = article_meta.ele('article-id', { "pub-id-type": "doi" }).txt('10.3897/BDJ.4.e7720') // should probably come from the article layout
  /*          */let articleidpublisherid = article_meta.ele('article-id', { "pub-id-type": "publisher-id" }).txt('7720') // should probably come from the article layout
  /*          */let articleidmanuscript = article_meta.ele('article-id', { "pub-id-type": "manuscript" }).txt('4912') // should probably come from the article layout
  /*          */let articleCategories = article_meta.ele('article-categories')
  /*              */let subjGroupHeading = articleCategories.ele('subj-group',{'subj-group-type':"heading"})
  /*                  */let subjectHeading = subjGroupHeading.ele('subject').txt('Taxonomic Paper')// should probably come from the article layout
  /*              */let subjGroupTaxonCl = articleCategories.ele('subj-group',{'subj-group-type':"Taxon classification"})
  /*                  */let subjectTaxonCl = subjGroupTaxonCl.ele('subject').txt('Core Eudicots: Asterids')// should probably come from the article layout
  /*              */let subjGroupSubjectCl = articleCategories.ele('subj-group',{'subj-group-type':"Subject classification"})
  /*                  */let subjectSubjectCl1 = subjGroupSubjectCl.ele('subject').txt('Taxonomy')// should probably come from the article layout
  /*                  */let subjectSubjectCl2 = subjGroupSubjectCl.ele('subject').txt('Species Inventories')// should probably come from the article layout
  /*                  */let subjectSubjectCl3 = subjGroupSubjectCl.ele('subject').txt('Nomenclature')// should probably come from the article layout
  /*                  */let subjectSubjectCl4 = subjGroupSubjectCl.ele('subject').txt('Identification Key(s)')// should probably come from the article layout
  /*                  */let subjectSubjectCl5 = subjGroupSubjectCl.ele('subject').txt('Floristics & Distribution')// should probably come from the article layout
  /*                  */let subjectSubjectCl6 = subjGroupSubjectCl.ele('subject').txt('Biogeography')// should probably come from the article layout
  /*              */let subjGroupGeographicalCl = articleCategories.ele('subj-group',{'subj-group-type':"Geographical classification"})
  /*                  */let subjectGeographicalCl = subjGroupGeographicalCl.ele('subject').txt('Central America and the Caribbean')// should probably come from the article layout
  /*          */let titleGroup = article_meta.ele('title-group')
  /*              */let articleTitle = titleGroup.ele('article-title').txt(serviceShare.YdocService.articleData?serviceShare.YdocService.articleData.name:'Untitled')
  /*          */let contribGroup = article_meta.ele('contrib-group',{"content-type":"authors"})
  /*              */let contrib = contribGroup.ele('contrib',{"contrib-type":"author","corresp":"yes","xlink:type":"simple"}) // should probably come from the backend
  /*                  */let name = contrib.ele('name',{"name-style":"western"})
  /*                      */let surname = name.ele('surname').txt('Gottschling')
  /*                      */let givenNames = name.ele('given-names').txt('Marc')
  /*                  */let email = contrib.ele('email',{"xlink:type":"simple"}).txt('gottschling@bio.lmu.de')
  /*                  */let xref = contrib.ele('xref',{"ref-type":"aff","rid":"A3"}).txt('3')
  /*          */let aff = article_meta.ele('aff',{"id":"A1"}) // should probably come from the backend and is maybe linked with contributors
  /*              */let label = aff.ele('label').txt('1');
  /*              */let addrLineVer = aff.ele('addr-line',{"content-type":"verbatim"}).txt('NIRDBS/Stejarul Research Centre for Biological Sciences, Piatra Neamţ, Romania');
  /*              */let institution = aff.ele('institution',{"xlink:type":"simple"}).txt('NIRDBS/Stejarul Research Centre for Biological Sciences');
  /*              */let addrLineCity = aff.ele('addr-line',{"content-type":"city"}).txt('Piatra Neamţ');
  /*              */let country = aff.ele('country').txt('Romania');
  /*          */let authorNotes = article_meta.ele('author-notes') // should probably come from the backend
  /*              */let fnCor = authorNotes.ele('fn',{"fn-type":"corresp"})
  /*                  */let pfnCor = fnCor.ele('p').txt('Corresponding author: Marc Gottschling (')
  /*                      */let emailpfnCor = pfnCor.ele('email',{"xlink:type":"simple"}).txt('gottschling@bio.lmu.de')
  /*                      */pfnCor.txt(').')
  /*              */let fnEditedBy = authorNotes.ele('fn',{"fn-type":"edited-by"})
  /*                  */let pfnEditedBy = fnEditedBy.ele('p').txt('Academic editor: Dimitrios Koureas')
  /*          */let pubDateCollection = article_meta.ele('pub-date',{"pub-type":"collection"})// should probably come from the backend
  /*              */let yearpubDateCollection = pubDateCollection.ele('year').txt('2016')
  /*          */let pubDateEpub = article_meta.ele('pub-date',{"pub-type":"epub"})// should probably come from the backend
  /*              */let daypubDateEpub = pubDateEpub.ele('day').txt('08')
  /*              */let monthpubDateEpub = pubDateEpub.ele('month').txt('06')
  /*              */let yearpubDateEpub = pubDateEpub.ele('year').txt('2016')
  /*          */let volume = article_meta.ele('volume').txt('4')
  /*          */let elocationId = article_meta.ele('elocation-id').txt('e7720')
  /*          */let uriArpha = article_meta.ele('uri',{"content-type":"arpha" ,"xlink:href":"http://openbiodiv.net/FFB11146-FFED-FFDF-FF9C-C8652A49F76B"}).txt('FFB11146-FFED-FFDF-FF9C-C8652A49F76B')
  /*          */let uriZenedo = article_meta.ele('uri',{"content-type":"zenodo_dep_id" ,"xlink:href":"https://zenodo.org/record/121629"}).txt('121629')
  /*          */let history = article_meta.ele('history')
  /*              */let yearreceived = history.ele('date',{"date-type":"received"})// should probably come from the backend
  /*                  */let dayyearreceived = yearreceived.ele('day').txt('07')
  /*                  */let monthyearreceived = yearreceived.ele('month').txt('01')
  /*                  */let yearyearreceived = yearreceived.ele('year').txt('2016')
  /*              */let yearaccepted = history.ele('date',{"date-type":"accepted"})// should probably come from the backend
  /*                  */let dayyearaccepted = yearaccepted.ele('day').txt('07')
  /*                  */let monthyearaccepted = yearaccepted.ele('month').txt('01')
  /*                  */let yearyyearaccepted = yearaccepted.ele('year').txt('2016')
  /*          */let permissions = article_meta.ele('permissions')// should probably come from the backend
  /*              */let copyrightStatement = permissions.ele('copyright-statement').txt('Ramona-Elena Irimia, Marc Gottschling')
  /*              */let license = permissions.ele('license',{"license-type":"creative-commons-attribution","xlink:href":"http://creativecommons.org/licenses/by/4.0/","xlink:type":"simple"})
  /*                  */let licenseP = license.ele('license-p').txt('This is an open access article distributed under the terms of the Creative Commons Attribution License (CC BY 4.0), which permits unrestricted use, distribution, and reproduction in any medium, provided the original author and source are credited.')
  /*          */let abstract = article_meta.ele('abstract')
  /*              */let abstractLabel = abstract.ele('label').txt('Abstract')
  /*              */let abstractContent = abstract.ele('sec').txt('Abstract content') // should come fron the editor as a section
  /*          */let kwdGroup = article_meta.ele('kwd-group')
  /*              */let kwdGroupLabel = kwdGroup.ele('label').txt('Keywords');
  /*              */let kwdGroupKwd1 = kwdGroup.ele('kwd').txt('keyword1'); // sgould come from the editor as a section or from meta data
  /*          */let fundingGroup = article_meta.ele('funding-group')
  /*              */let fundingStatement = fundingGroup.ele('funding-statement').txt('Funding information'); // meta data for the article
  /*          */let counts = article_meta.ele('counts'); // number of refs,figs,tables in the article
  /*              */let countsFig = counts.ele('fig-count').txt(figCount+'');
  /*              */let countsTable = counts.ele('table-count').txt(tableCount+'');
  /*              */let countsRef = counts.ele('ref-count').txt(refCount+"");
  /**/let body = article.ele('body')
  // create all article sections
  serviceShare.TreeService.articleSectionsStructure.forEach((sec)=>{
    let secId = sec.sectionID;
    let secview = serviceShare.ProsemirrorEditorsService.editorContainers[secId].editorView;
    parseSection(secview,body,serviceShare,sec);
  })
  /**/let back = article.ele('back')
  /**/let floatsGroup = article.ele('floats-group')

  let xmlString = article.end({ prettyPrint: true })
  //xmlString = '<!DOCTYPE article PUBLIC "-//NLM//DTD JATS (Z39.96) Journal Publishing DTD v3.0 20151215//EN" "JATS-journalpublishing1.dtd">\n'+xmlString
  var blob = new Blob([xmlString], {type: "text/xml"});
  let xmlUrl = URL.createObjectURL(blob);
  window.open(xmlUrl)
  //saveAs(blob, "save.xml");
}

function parseSection(view:EditorView,container:XMLBuilder,serviceShare:ServiceShare,section:articleSection){
  if(section.title.name != 'Taxon' && section.title.name != '[MM] Materials' && section.title.name != 'Material'){ // not a custum section
    let secXml = container.ele('sec',{"sec-type":section.title.name});
    console.log(view.state.toJSON().doc);
    parseNode(view.state.toJSON().doc,secXml,false,'--')
    if(section.type=='complex'&&section.children&&section.children.length>0){
      section.children.forEach((child)=>{
        let chId = child.sectionID;
        let view = serviceShare.ProsemirrorEditorsService.editorContainers[chId].editorView;
        parseSection(view,secXml,serviceShare,child);
      })
    }
  }else{
    console.log('section is custum');
  }
}

function processPmNodeAsXML(node:any,xmlPar:XMLBuilder,before:string){
  let newParNode:XMLBuilder
  let shouldSkipNextBlockElements = false;
  if(node.type == 'heading'){
    newParNode = xmlPar.ele('title')
    shouldSkipNextBlockElements = true;
  }else if(node.type == 'text'&&(!node.marks||node.marks.length==0)){
    xmlPar.txt(node.text);
    return;
  }else if(node.type == 'text'&&node.marks&&node.marks.length>0){
    processPmMarkAsXML(node,xmlPar,before)
    return;
  }else if(node.type == "reference_citation"){
    newParNode = xmlPar.ele('xref',{"ref_type":"bibr","rid":node.attrs.actualRefId})
  }else if(node.type == "paragraph"){
    newParNode = xmlPar.ele('p')
  }else if(node.type == 'math_inline'){
    newParNode = xmlPar.ele('inline-formula').ele('tex-math')
  }else if(node.type == 'math_display'){
    newParNode = xmlPar.ele('disp-formula').ele('tex-math')
  }else if(node.type == 'ordered_list'){
    newParNode =xmlPar.ele('list',{"list-type":"ordered"})
  }else if(node.type == 'bullet_list'){
    newParNode =xmlPar.ele('list',{"list-type":"simple"})
  }else if(node.type == 'list_item'){
    newParNode =xmlPar.ele('list-item')
  }else if(node.type == 'table'){
    newParNode =xmlPar.ele('table-wrap').ele('table',{"rules":"all","frame":"box","cellpadding":"5"}).ele("tbody");
  }else if(node.type == 'table_row'){
    newParNode = xmlPar.ele('tr');
  }else if(node.type == 'table_cell'){
    newParNode = xmlPar.ele('th');
  }else if(node.type == 'blockquote'){
    newParNode = xmlPar.ele('disp-quote')
  }else if(node.type == 'horizontal_rule'){
    xmlPar.ele('hr')
    return;
  }else if(node.type == 'code'){
    newParNode = xmlPar.ele('code');
  }else if(node.type == 'hard_break'){
    newParNode = xmlPar.ele('break');
    return
  }else if(node.type == 'image'){
    xmlPar.ele('inline-graphic',{
      "xlink:href":node.attrs.src,
      "orientation":"portrait",
      "xlink:type":"simple",
    });
    return
  }else if(node.type == "video"){
    xmlPar.ele('media',{
      "mimetype":"video",
      "xlink:href":'node.attrs.src',
      "orientation":"portrait",
      "xlink:type":"simple",
    });
    return
  }else{
    if(node.content&&node.content.length>0){
      node.content.forEach((ch)=>{
        parseNode(ch,xmlPar,false,before+"|--")
      })
    }
    return;
  }
  if(node.content&&node.content.length>0){
    node.content.forEach((ch)=>{
      parseNode(ch,newParNode,shouldSkipNextBlockElements,before+"|--")
    })
  }
}

function processPmMarkAsXML(node:any,xmlPar:XMLBuilder,before:string){
  let xmlParent = xmlPar
  node.marks.forEach((mark,i:number)=>{
    if(mark.type == 'citation'){
      let citatedFigs = mark.attrs.citated_figures.map((fig:string)=>fig.split('|')[0]);
      citatedFigs.forEach((fig)=>{
        xmlParent = xmlParent.ele('xref',{"ref_type":"fig","rid":fig});
      })
    }else if(mark.type == 'em'){
      xmlParent = xmlParent.ele('italic');
    }else if(mark.type == "strong"){
      xmlParent = xmlParent.ele('bold');
    }else if(mark.type == "underline"){
      xmlParent = xmlParent.ele('underline');
    }else if(mark.type == "subscript"){
      xmlParent = xmlParent.ele('sub');
    }else if(mark.type == "superscript"){
      xmlParent = xmlParent.ele('sup');
    }else if(mark.type == 'link'){
      let linkHref = mark.attrs.href;
      xmlParent = xmlParent.ele('ext-link',{"xlink:href":linkHref,"ext-link-type":'uri',"xlink:type":"simple"});
    }
    if(i == node.marks.length-1){
      xmlParent.txt(node.text);
    }
  })
}

let nodesToSkip = ['form_field','inline_block_container'];
let nodesNotToLoop = ['figures_nodes_container'];
let nodesThatShouldNotBeSkipped = [
  'ordered_list',
  'list_item','table',
  'bullet_list',
  'blockquote',
  "math_display",
  "horizontal_rule",
  "code_block",
  "hard_break",
]

function isBlockNode (name:string){
  if(schema.nodes[name]&&schema.nodes[name].isBlock){
    return true;
  }
  return false;
}
function parseNode(node:any,xmlPar:XMLBuilder,shouldSkipBlockElements:boolean,before:string){
  console.log(before+node.type);
  if(nodesToSkip.includes(node.type)||(shouldSkipBlockElements&&isBlockNode(node.type)&&!nodesNotToLoop.includes(node.type)&&!nodesThatShouldNotBeSkipped.includes(node.type))){ // nodes that should be skipped and looped through their children
    if(node.content&&node.content.length>0){
      node.content.forEach((ch)=>{
        parseNode(ch,xmlPar,shouldSkipBlockElements,before)
      })
    }
  }else if(nodesNotToLoop.includes(node.type)){ // nodes that should not be looped nor their children
  }else{
    processPmNodeAsXML(node,xmlPar,before)
  }
}

function countTablesInArticle(serviceShare: ServiceShare){
  let tableCount = 0
  Object.keys(serviceShare.ProsemirrorEditorsService.editorContainers).forEach((sectionId)=>{
    let doc = serviceShare.ProsemirrorEditorsService.editorContainers[sectionId].editorView.state.doc;
    let size = doc.content.size-1;
    doc.nodesBetween(0,size,(node,pos)=>{
      if(node.type.name == 'table'){
        tableCount++;
      }
    })
  })
  return tableCount
}
