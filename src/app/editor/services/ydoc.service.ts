import { Inject, Injectable } from '@angular/core';
//@ts-ignore
import * as Y from 'yjs'
import { Transaction as YTransaction } from 'yjs'
import { IndexeddbPersistence } from 'y-indexeddb';
import * as awarenessProtocol from 'y-protocols/awareness.js';
import { HttpClient } from '@angular/common/http';
import { fromEvent, Subject } from 'rxjs';
import { delay } from 'rxjs/operators';
import { WebsocketProvider } from 'y-websocket'
import { ydocData } from '../utils/interfaces/ydocData';
import { YMap, YMapEvent, YText } from 'yjs/dist/src/internals';
import { articleSection, editorData, taxonomicCoverageContentData } from '../utils/interfaces/articleSection';
import { ServiceShare } from './service-share.service';
import { ArticlesService } from '@app/core/services/articles.service';
import {
  mapSchemaDef,
  parseSecFormIOJSONMenuAndSchemaDefs,
  parseSecHTMLMenuAndSchemaDefs
} from '../utils/fieldsMenusAndScemasFns';
import { APP_CONFIG, AppConfig } from '@core/services/app-config';

export interface mainSectionValidations{[pivot_id:string]:{min:number,max:number}}

@Injectable({
  providedIn: 'root'
})
export class YdocService {
  ydocStateObservable: Subject<any> = new Subject<any>();

  editorIsBuild = false;

  ydoc = new Y.Doc();

  //provider?: OriginalWebRtc;
  provider?: WebsocketProvider;
  roomName = 'webrtc-test3'
  providerIndexedDb?: IndexeddbPersistence
  constructor(
    private http: HttpClient,
    private serviceShare: ServiceShare,
    private articleService: ArticlesService,
    @Inject(APP_CONFIG) private config: AppConfig
  ) {
    this.serviceShare.shareSelf('YdocService', this)
  }
  articleTitle?: YText;
  articleStructureFromBackend: any
  articleStructure?: YMap<any>
  articleData: any;
  sectionFormGroupsStructures?: YMap<any>
  comments?: YMap<any>
  creatingANewArticle = false
  figuresMap?: YMap<any>
  citableElementsMap?: YMap<any>
  tablesMap?: YMap<any>
  supplementaryFilesMap?: YMap<any>
  endNotesMap?: YMap<any>
  trackChangesMetadata?: YMap<any>
  usersDataMap?: YMap<any>
  mathMap?: YMap<any>
  referenceCitationsMap?: YMap<any>;
  printMap?: YMap<any>
  customSectionProps?: YMap<any>
  collaborators?: YMap<any>
  PMMenusAndSchemasDefsMap?: YMap<any>
  TaxonsMap?: YMap<any>
  userInfo: any
  getCommentsMap(): YMap<any> {
    return this.comments!
  }

  getYDoc() {
    return this.ydoc
  }

  findSectionById(sectionId: string) {
    let articleSectionsStructure: articleSection[] = this.articleStructure?.get('articleSectionsStructure')

  }

  updateSection(sectionData: articleSection) {
    let articleSectionsStructure: articleSection[] = this.articleStructure?.get('articleSectionsStructure')
    let nodeRef: any
    let findF = (list?: articleSection[]) => {
      list?.forEach((node) => {
        if (node.sectionID !== undefined && node.sectionID == sectionData.sectionID) {
          nodeRef = node
        } else if (node.children) {
          findF(node.children)
        }
      })
    }
    findF(articleSectionsStructure);


    let articleSectionsStructureFlat: articleSection[] = []
    let makeFlat = (structure: articleSection[]) => {
      structure.forEach((section) => {
        if (section.active) {
          articleSectionsStructureFlat.push(section)
        }
        if (section.children.length > 0) {
          makeFlat(section.children)
        }
      })
    }
    makeFlat(articleSectionsStructure)
    this.articleStructure?.set('articleSectionsStructure', articleSectionsStructure);
    this.articleStructure?.set('articleSectionsStructureFlat', articleSectionsStructureFlat);
  }

  applySectionChange(value: { contentData: editorData | string | editorData | taxonomicCoverageContentData, sectionData: articleSection, type: string }) {
    let articleSectionsStructure: articleSection[] = this.articleStructure?.get('articleSectionsStructure')
    let nodeRef: any
    let findF = (list?: articleSection[]) => {
      list?.forEach((node) => {
        if (node.sectionID !== undefined && node.sectionID == value.sectionData.sectionID) {
          nodeRef = node
        } else if (node.children) {
          findF(node.children)
        }
      })
    }
    findF(articleSectionsStructure);

    nodeRef![value.type].contentData = value.contentData

    let articleSectionsStructureFlat: articleSection[] = []
    let makeFlat = (structure: articleSection[]) => {
      structure.forEach((section) => {
        if (section.active) {
          articleSectionsStructureFlat.push(section)
        }
        if (section.children.length > 0) {
          makeFlat(section.children)
        }
      })
    }
    makeFlat(articleSectionsStructure)
    this.articleStructure?.set('articleSectionsStructure', articleSectionsStructure);
    this.articleStructure?.set('articleSectionsStructureFlat', articleSectionsStructureFlat);
  }

  saveSectionMenusAndSchemasDefs(sectionStructure: articleSection[]) {
    let menusAndSchemasDefs = this.PMMenusAndSchemasDefsMap?.get('menusAndSchemasDefs');
    let loopSection = (section: articleSection, fn: any) => {
      if (section.children && section.children.length > 0) {
        section.children.forEach((child) => {
          loopSection(child, fn);
        })
      }
      fn(section)
    }
    sectionStructure.forEach(section => loopSection(section, (section: articleSection) => {
      if (
        section.menusAndSchemasDefs &&
        (section.menusAndSchemasDefs.menus || section.menusAndSchemasDefs.schemas) &&
        (Object.keys(section.menusAndSchemasDefs.menus).length > 0 || Object.keys(section.menusAndSchemasDefs.schemas).length > 0)
      ) {
        menusAndSchemasDefs[section.sectionID] = section.menusAndSchemasDefs;
      }
    }))
    this.PMMenusAndSchemasDefsMap?.set('menusAndSchemasDefs', menusAndSchemasDefs);
  }

  getData(): ydocData {
    let articleSectionsStructure: articleSection[] = this.articleStructure?.get('articleSectionsStructure')
    let articleSectionsStructureFlat: articleSection[] = this.articleStructure?.get('articleSectionsStructureFlat');
    let citatsObj = this.figuresMap!.get('articleCitatsObj');
    let tableCitatsObj = this.tablesMap!.get('tableCitatsObj');
    try {

      if (articleSectionsStructure == undefined) {
        citatsObj = {}
        tableCitatsObj = {}
        articleSectionsStructureFlat = []

        articleSectionsStructure = this.articleStructureFromBackend || []

        let makeFlat = (structure: articleSection[]) => {
          structure.forEach((section) => {
            if (section.active) {
              articleSectionsStructureFlat.push(section)
            }
            if (section.children.length > 0) {
              makeFlat(section.children)
            }
          })
        }
        makeFlat(articleSectionsStructure)
        this.saveSectionMenusAndSchemasDefs(articleSectionsStructure)
        this.articleStructure?.set('articleSectionsStructure', articleSectionsStructure);
        this.articleStructure?.set('articleSectionsStructureFlat', articleSectionsStructureFlat);

      }
      if (!citatsObj) {
        citatsObj = {}
        articleSectionsStructureFlat.forEach((section) => {
          citatsObj[section.sectionID] = {} // citats obj [key:string](citateID):{citatedFigures:[](citated figures-Ids),posiition:number(citatePosition)}

        })
        this.figuresMap!.set('articleCitatsObj', citatsObj);
      }
      if (!tableCitatsObj) {
        tableCitatsObj = {}
        articleSectionsStructureFlat.forEach((section) => {
          tableCitatsObj[section.sectionID] = {} // citats obj [key:string](citateID):{citatedFigures:[](citated figures-Ids),posiition:number(citatePosition)}

        })
        this.tablesMap!.set('tableCitatsObj', tableCitatsObj);
      }
    } catch (e) {
      console.error(e);
    }

    return {
      ydoc: this.ydoc,
      provider: this.provider,
      userInfo: this.userInfo,
      providerIndexedDb: this.providerIndexedDb!,
      articleSectionsStructure: articleSectionsStructure,
    }

  }

  turnOnOffPreviewModeEditorFn: () => void

  buildLayoutMenusAndSchemasDefs(defs: { menus: {}, schemas: {} }) {
    let layoutMapedDefs = { menus: {}, schemas: {} };
    if (defs && (defs.menus || defs.schemas)) {
      if (defs.menus) {
        Object.keys(defs.menus).forEach((menuKey) => {
          layoutMapedDefs.menus[menuKey] = defs.menus[menuKey]
        })
      }
      if (defs.schemas) {
        Object.keys(defs.schemas).forEach((schemaKey) => {
          layoutMapedDefs.schemas[schemaKey] = mapSchemaDef(defs.schemas[schemaKey])
        })
      }
    }
    return { layoutDefinitions: layoutMapedDefs }
  }

  buildEditor() {
    this.sectionFormGroupsStructures = this.ydoc.getMap('sectionFormGroupsStructures');
    this.citableElementsMap = this.ydoc.getMap('citableElementsMap');

    this.figuresMap = this.ydoc.getMap('ArticleFiguresMap');
    this.tablesMap = this.ydoc.getMap('ArticleTablesMap');
    this.supplementaryFilesMap = this.ydoc.getMap('supplementaryFilesMap');
    this.endNotesMap = this.ydoc.getMap('endNotesMap');


    let figuresNumbers = this.figuresMap!.get('ArticleFiguresNumbers');
    let figuresTemplates = this.figuresMap!.get('figuresTemplates');
    let figures = this.figuresMap!.get('ArticleFigures');

    let tablesNumbers = this.tablesMap!.get('ArticleTablesNumbers');
    let tablesTemplates = this.tablesMap!.get('tablesTemplates');
    let tablesInitialTemplate = this.tablesMap!.get('tablesInitialTemplate');
    let tablesInitialFormIOJson = this.tablesMap!.get('tablesInitialFormIOJson');
    let tables = this.tablesMap!.get('ArticleTables');

    let supplementaryFiles = this.supplementaryFilesMap.get('supplementaryFiles');
    let supplementaryFilesTemplates = this.supplementaryFilesMap.get('supplementaryFilesTemplates');
    let supplementaryFilesInitialTemplate = this.supplementaryFilesMap!.get('supplementaryFilesInitialTemplate');
    let supplementaryFilesInitialFormIOJson = this.supplementaryFilesMap!.get('supplementaryFilesInitialFormIOJson');
    let supplementaryFilesNumbers = this.supplementaryFilesMap.get('supplementaryFilesNumbers');
    let citedSupplementaryFiles = this.supplementaryFilesMap.get('citedSupplementaryFiles');

    let endNotes = this.endNotesMap.get('endNotes');
    let endNotesNumbers = this.endNotesMap.get('endNotesNumbers');
    let endNotesInitialTemplate = this.endNotesMap!.get('endNotesInitialTemplate');
    let endNotesInitialFormIOJson = this.endNotesMap!.get('endNotesInitialFormIOJson');
    let endNotesTemplates = this.endNotesMap.get('endNotesTemplates');
    let endNotesCitations = this.endNotesMap.get('endNotesCitations');

    this.usersDataMap = this.ydoc.getMap('userDataMap')
    this.mathMap = this.ydoc.getMap('mathDataURLMap');
    this.printMap = this.ydoc.getMap('print');
    this.customSectionProps = this.ydoc.getMap('customSectionProps');
    let pdfSettings = this.printMap.get('pdfPrintSettings')
    let mathObj = this.mathMap.get('dataURLObj')
    let usersColors = this.usersDataMap.get('usersColors');
    this.referenceCitationsMap = this.ydoc.getMap('referenceCitationsMap');
    let references = this.referenceCitationsMap?.get('references')
    let referencesInEditor = this.referenceCitationsMap?.get('referencesInEditor')
    let externalRefs = this.referenceCitationsMap?.get('externalRefs');
    let localRefs = this.referenceCitationsMap?.get('localRefs');
    let refsAddedToArticle = this.referenceCitationsMap?.get('refsAddedToArticle');
    let citedRefsInArticle = this.referenceCitationsMap.get('citedRefsInArticle')

    let customPropsObj = this.customSectionProps?.get('customPropsObj');
    let elementsCitations = this.citableElementsMap?.get('elementsCitations');

    this.PMMenusAndSchemasDefsMap = this.ydoc.getMap('PMMenusAndSchemasDefsMap');
    let menusAndSchemasDefs = this.PMMenusAndSchemasDefsMap?.get('menusAndSchemasDefs');

    this.TaxonsMap = this.ydoc.getMap('TaxonsMap');
    let taxonsDataObj = this.TaxonsMap.get('taxonsDataObj');

    if(!taxonsDataObj){
      this.TaxonsMap.set('taxonsDataObj',{});
    }

    let citableElementMenusAndSchemaDefs:any = {}
    let allCitableElementsMenus = {}
    let allCitableElementsSchemas = {}
    let allCitableElementsDefsByTags = {}
    if (this.citableElementsSchemasSection) {
      let tablesInitialTemplateRegex = /<ng-template #Tables>([\s\S]+?(?=<\/ng-template>))<\/ng-template>/gm;
      let supplementaryFilesInitialTemplateRegex = /<ng-template #SupplementaryMaterials>([\s\S]+?(?=<\/ng-template>))<\/ng-template>/gm;
      let endNotesInitialTemplateRegex = /<ng-template #Footnotes>([\s\S]+?(?=<\/ng-template>))<\/ng-template>/gm;

      let citableElementsSchemasHtmlTemplate = this.citableElementsSchemasSection.template;

      let tablesSchemaResult = tablesInitialTemplateRegex.exec(citableElementsSchemasHtmlTemplate);
      let supplementaryFilesSchemaResult = supplementaryFilesInitialTemplateRegex.exec(citableElementsSchemasHtmlTemplate);
      let endNotesSchemaResult = endNotesInitialTemplateRegex.exec(citableElementsSchemasHtmlTemplate);

      let formIOSchemas = this.citableElementsSchemasSection.schema.override.categories

      let tablesFormIoJson = formIOSchemas.Tables
      let supplementaryFilesFormIoJson = formIOSchemas.SupplementaryMaterials
      let endNotesFormIoJson = formIOSchemas.Footnotes

      // extract citable element menutypes and allowed tags defs

      let parseCitableElementFormIODefs = (formIOJSON:any,labels:{menusL:string,tagsL:string},defsLable:string) =>{
        let result = parseSecFormIOJSONMenuAndSchemaDefs(formIOJSON,labels)
        citableElementMenusAndSchemaDefs[defsLable] = {
          sectionMenusAndSchemaDefsFromJSON:result.sectionMenusAndSchemaDefsFromJSON,
          sectionMenusAndSchemasDefsfromJSONByfieldsTags:result.sectionMenusAndSchemasDefsfromJSONByfieldsTags
        }
        Object.assign(allCitableElementsMenus, result.sectionMenusAndSchemaDefsFromJSON.menus);
        Object.assign(allCitableElementsSchemas, result.sectionMenusAndSchemaDefsFromJSON.schemas);
        Object.assign(allCitableElementsDefsByTags,result.sectionMenusAndSchemasDefsfromJSONByfieldsTags)
        return result
      }

      let parseCitableElementHTMLDefs = (html:string,labels:{menusL:string,tagsL:string},defsLable:string) =>{
        let result = parseSecHTMLMenuAndSchemaDefs(html,labels)
        citableElementMenusAndSchemaDefs[defsLable] = {
          sectionMenusAndSchemaHTMLDefs:result.sectionMenusAndSchemaHTMLDefs,
        }
        Object.assign(allCitableElementsMenus, result.sectionMenusAndSchemaHTMLDefs.menus);
        Object.assign(allCitableElementsSchemas, result.sectionMenusAndSchemaHTMLDefs.schemas);
        return result
      }

      if (tablesSchemaResult && !tablesInitialTemplate) {
        let result = parseCitableElementHTMLDefs(tablesSchemaResult[1],{menusL:"customTableHTMLMenuType",tagsL:"customTableHTMLAllowedTags"},"tablesHTMLDefs");
        this.tablesMap!.set('tablesInitialTemplate', result.sectionTemplate);

      }

      if (tablesFormIoJson && !tablesInitialFormIOJson) {
        let result = parseCitableElementFormIODefs(tablesFormIoJson,{menusL:"customTableJSONMenuType",tagsL:'customTableJSONAllowedTags'},'tablesFormIODefs');
        this.tablesMap!.set('tablesInitialFormIOJson', result.formIOJSON);
      }

      if (supplementaryFilesSchemaResult && !supplementaryFilesInitialTemplate) {
        let result = parseCitableElementHTMLDefs(supplementaryFilesSchemaResult[1],{menusL:"customSupplementaryFilesHTMLMenuType",tagsL:"customSupplementaryFilesHTMLAllowedTags"},"supplementaryFilesHTMLDefs");
        this.supplementaryFilesMap!.set('supplementaryFilesInitialTemplate', result.sectionTemplate);
      }

      if (supplementaryFilesFormIoJson && !supplementaryFilesInitialFormIOJson) {
        let result = parseCitableElementFormIODefs(supplementaryFilesFormIoJson,{menusL:"customSupplementaryFilesJSONMenuType",tagsL:'customSupplementaryFilesJSONAllowedTags'},'supplementaryFilesFormIODefs');
        this.supplementaryFilesMap!.set('supplementaryFilesInitialFormIOJson', result.formIOJSON);
      }

      if (endNotesSchemaResult && !endNotesInitialTemplate) {
        let result = parseCitableElementHTMLDefs(endNotesSchemaResult[1],{menusL:"customEndNotesHTMLMenuType",tagsL:"customEndNotesHTMLAllowedTags"},"endNotesHTMLDefs");
        this.endNotesMap!.set('endNotesInitialTemplate', result.sectionTemplate);
      }

      if (endNotesFormIoJson && !endNotesInitialFormIOJson) {
        let result = parseCitableElementFormIODefs(endNotesFormIoJson,{menusL:"customEndNotesJSONMenuType",tagsL:'customEndNotesJSONAllowedTags'},'endNotesFormIODefs');
        this.endNotesMap!.set('endNotesInitialFormIOJson', result.formIOJSON);
      }
    }

    citableElementMenusAndSchemaDefs.allCitableElementsMenus = allCitableElementsMenus
    citableElementMenusAndSchemaDefs.allCitableElementsSchemas = allCitableElementsSchemas
    citableElementMenusAndSchemaDefs.allCitableElementsDefsByTags = allCitableElementsDefsByTags
    citableElementMenusAndSchemaDefs.allCitableElementFieldsKeys = Object.keys(allCitableElementsDefsByTags);
    if (!endNotesTemplates) {
      this.endNotesMap.set('endNotesTemplates', {})
    }
    if(!endNotesCitations) {
      this.endNotesMap.set('endNotesCitations', {});
    }
    if (!supplementaryFilesTemplates) {
      this.supplementaryFilesMap.set('supplementaryFilesTemplates', {})
    }
    if (!endNotes) {
      this.endNotesMap.set('endNotes', {})
    }
    if (!endNotesNumbers) {
      this.endNotesMap?.set('endNotesNumbers', [])
    }
    if (!refsAddedToArticle) {
      this.referenceCitationsMap.set('refsAddedToArticle', {})
    }
    if (!supplementaryFiles) {
      this.supplementaryFilesMap.set('supplementaryFiles', {})
    }
    if (!supplementaryFilesNumbers) {
      this.supplementaryFilesMap?.set('supplementaryFilesNumbers', [])
    }
    if(!citedSupplementaryFiles) {
      this.supplementaryFilesMap?.set('citedSupplementaryFiles', {});
    }
    if (!menusAndSchemasDefs) {
      let layoutMenusAndAllowedTagsSettings: any = { menus: {}, schemas: {} }
      if (this.articleData.layout.settings) {
        let settings = this.articleData.layout.settings
        if (settings.allowed_tags && Object.values(settings.allowed_tags).length > 0) {
          layoutMenusAndAllowedTagsSettings.schemas = settings.allowed_tags;
        }
        if (settings.menus && Object.values(settings.menus).length > 0) {
          layoutMenusAndAllowedTagsSettings.menus = settings.menus;
        }
      }
      this.PMMenusAndSchemasDefsMap.set('menusAndSchemasDefs', {citableElementMenusAndSchemaDefs,...this.buildLayoutMenusAndSchemasDefs(layoutMenusAndAllowedTagsSettings)})
    }
    if (!elementsCitations) {
      this.citableElementsMap.set('elementsCitations', {})
    }
    if (!customPropsObj) {
      this.customSectionProps?.set('customPropsObj', {})
    }
    if (!localRefs) {
      this.referenceCitationsMap?.set('localRefs', {})
    }
    if (!externalRefs) {
      this.referenceCitationsMap?.set('externalRefs', {})
    }
    if (!references) {
      this.referenceCitationsMap?.set('references', {})
    }
    if (!referencesInEditor) {
      this.referenceCitationsMap?.set('referencesInEditor', {})
    }
    if (!citedRefsInArticle) {
      this.referenceCitationsMap.set('citedRefsInArticle', {})
    }
    if (!usersColors) {
      this.usersDataMap.set('usersColors', {});
    }
    this.setUserColor(this.userInfo);
    this.provider?.awareness.setLocalStateField('userInfo', this.userInfo);

    if (!pdfSettings) {
      let pdfPrintSettings = (
        this.articleData &&
        this.articleData.layout &&
        this.articleData.layout.settings &&
        this.articleData.layout.settings.print_settings
      ) ? this.articleData.layout.settings.print_settings : {}
      this.printMap.set('pdfPrintSettings', pdfPrintSettings)
    }
    if (!figures) {
      this.figuresMap!.set('ArticleFigures', {})
    }
    if (!figuresTemplates) {
      this.figuresMap!.set('figuresTemplates', {})
    }
    if (!figuresNumbers) {
      this.figuresMap!.set('ArticleFiguresNumbers', []);
    }
    if (!tables) {
      this.tablesMap!.set('ArticleTables', {})
    }
    if (!tablesTemplates) {
      this.tablesMap!.set('tablesTemplates', {})
    }
    if (!tablesNumbers) {
      this.tablesMap!.set('ArticleTablesNumbers', []);
    }
    if (!mathObj) {
      this.mathMap!.set('dataURLObj', {});
    }

    this.articleStructure = this.ydoc.getMap('articleStructure');
    this.trackChangesMetadata = this.ydoc.getMap('trackChangesMetadata');
    let trackChangesData = this.trackChangesMetadata?.get('trackChangesMetadata')
    if (!trackChangesData) {
      this.trackChangesMetadata?.set('trackChangesMetadata', { trackTransactions: false });
    }
    this.comments = this.ydoc.getMap('comments');
    this.collaborators = this.ydoc.getMap('articleCollaborators');
    this.collaborators.observe(this.observeCollaboratorsFunc);
    this.checkIfUserIsInArticle()
    if (this.shouldSetTheOwnerForTheNewArticle) {
      this.setArticleOwnerInfo()
    }
    this.ydocStateObservable.next('docIsBuild');
    this.getData()
    this.editorIsBuild = true;
  }

  curUserAccess: string
  currUserRoleSubject = new Subject()
  checkIfUserIsInArticle() {
    let userinfo = this.userInfo.data;
    let currUserEmail = userinfo.email;
    if (this.shouldSetTheOwnerForTheNewArticle) {
      this.setArticleOwnerInfo()
    }
    let collaborators = this.collaborators.get('collaborators').collaborators as any[]

    let userInArticle = collaborators.find((user) => user.email == currUserEmail)
    this.serviceShare.EnforcerService.enforceAsync('is-admin', 'admin-can-do-anything').subscribe((admin) => {
      if (admin) {
        userInArticle = { access: 'Owner', email: 'mincho@scalewest.com' };
      }
      if (!userInArticle) {
        this.serviceShare.openNotAddedToEditorDialog()
      } else {
        if (this.curUserAccess && this.curUserAccess != userInArticle.access) {
          this.serviceShare.openNotifyUserAccessChangeDialog(this.curUserAccess, userInArticle.access)
        }
        this.curUserAccess = userInArticle.access;
        this.userInfo.data.access = this.curUserAccess;
        this.currUserRoleSubject.next(userInArticle);
      }
    })
  }

  collaboratorsSubject = new Subject()
  observeCollaboratorsFunc = (event: YMapEvent<any>, transaction: YTransaction) => {
    let collaboratorsData = this.collaborators.get('collaborators')
    if (collaboratorsData) {
      this.checkIfUserIsInArticle()
    }
    this.collaboratorsSubject.next(collaboratorsData)
  }

  citableElementsSchemasSection
  saveCitableElementsSchemas(citableElementsSchemasSection: any) {
    this.citableElementsSchemasSection = citableElementsSchemasSection
  }

  hasFigures = false
  hasReferences = false
  hasTable = false
  hasSupplementaryMaterials = false
  hasFootnotes = false
  saveArticleData(data) {
    let sections = {
      schema: {
        sections: [],
        override: {
          categories: {}
        }
      },
      template: ""
    }

    let artilceFiguresSchemas = data.layout.template.sections.find(x => x.name == "Figures")
    if (artilceFiguresSchemas) {
      data.layout.template.sections = data.layout.template.sections.filter(x => x.name !== "Figures");
      this.hasFigures = true
    }

    if (data.layout.template.sections.find(x => x.name == "References")) {
      data.layout.template.sections = data.layout.template.sections.filter(x => x.name !== "References");
      this.hasReferences = true
    }

    let artilceTablesSchemas = data.layout.template.sections.find(x => x.name == "Tables");
    if (artilceTablesSchemas) {
      sections.schema.sections.push("Tables")
      sections.schema.override.categories['Tables'] = artilceTablesSchemas.schema.override.categories.Tables
      sections.template += artilceTablesSchemas.template
      data.layout.template.sections = data.layout.template.sections.filter(x => x.name !== "Tables");
      this.hasTable= true
    }

    let artilceSupplementaryMaterialsSchemas = data.layout.template.sections.find(x => x.name == "SupplementaryMaterials");
    if (artilceSupplementaryMaterialsSchemas) {
      sections.schema.sections.push("SupplementaryMaterials")
      sections.schema.override.categories['SupplementaryMaterials'] = artilceSupplementaryMaterialsSchemas.schema.override.categories.SupplementaryMaterials
      sections.template += artilceSupplementaryMaterialsSchemas.template
      data.layout.template.sections = data.layout.template.sections.filter(x => x.name !== "SupplementaryMaterials");
      this.hasSupplementaryMaterials = true
    }

    let artilceFootnotesSchemas = data.layout.template.sections.find(x => x.name == "Footnotes");
    if (artilceFootnotesSchemas) {
      sections.schema.sections.push("Footnotes")
      sections.schema.override.categories['Footnotes'] = artilceFootnotesSchemas.schema.override.categories.Footnotes
      sections.template += artilceFootnotesSchemas.template
      data.layout.template.sections = data.layout.template.sections.filter(x => x.name !== "Footnotes");
      this.hasFootnotes = true
    }

    this.saveCitableElementsSchemas(sections);

    let mainSectionValidations:mainSectionValidations = {}
    let fnc = (sec)=>{
      if(sec.pivot_id){
        if(sec.settings && sec.settings.main_section){
          if(!sec.settings.max_instances){sec.settings.max_instances = 9999};
          mainSectionValidations[sec.pivot_id] = {min:sec.settings.min_instances,max:sec.settings.max_instances}
        }
      }
    }
    this.articleTitle = this.ydoc.getText("articleName");

    data.layout.template.sections.forEach(fnc)
    data.mainSectionValidations = mainSectionValidations
    this.articleData = data;
  }

  setArticleData(articleData: any,newarticle?:boolean) {
    this.saveArticleData(articleData)
    //this.articleData.layout.citation_style.style_updated = Date.now()
    if(newarticle){
      this.creatingANewArticle = true;

    }
    this.checkLastTimeUpdated();
  }

  checkLastTimeUpdated() {
    if (new Date(this.articleData.updated_at).toDateString() !== new Date().toDateString()) {
      this.articleService.updateArticleUpdatedAt(this.articleData).subscribe((res) => {
      });
    }
  }

  resetYdoc() {

    this.editorIsBuild = false;
    this.curUserAccess = undefined
    this.ydoc = new Y.Doc();

    if (this.provider) {
      this.provider.awareness.destroy();
      this.provider.destroy();
    }
    this.provider = undefined;
    this.roomName = 'webrtc-test3';
    if (this.providerIndexedDb) {
      this.providerIndexedDb.destroy();
    }
    this.providerIndexedDb = undefined;

    //this.articleStructureFromBackend = undefined;
    this.articleStructure = undefined;
    this.articleData = undefined;
    this.sectionFormGroupsStructures = undefined;
    this.comments = undefined;
    this.PMMenusAndSchemasDefsMap = undefined
    this.citableElementsSchemasSection = undefined
    this.figuresMap = undefined;
    this.tablesMap = undefined;
    this.trackChangesMetadata = undefined;
    this.userInfo = undefined;
    this.creatingANewArticle = false;
    this.mathMap = undefined;
    this.referenceCitationsMap = undefined;
    this.printMap = undefined;
    this.customSectionProps = undefined;
    if (this.collaborators) {
      this.collaborators.unobserve(this.observeCollaboratorsFunc);
    }
    this.collaborators = undefined;
  }

  setUserColor(userInfo: any) {
    let usersColors = this.usersDataMap!.get('usersColors');
    let userId = userInfo.data.id;
    if (!usersColors[userId]) {
      const red = Math.floor(((256*4)/5)+(Math.random() * 256/5));
      const green = Math.floor(((256*4)/5)+(Math.random() * 256/5));
      const blue = Math.floor(((256*4)/5)+(Math.random() * 256/5));
      let userColor = "rgb(" + red + ", " + green + ", " + blue + ")";
      let userContrastColor =  (red * 0.299 + green * 0.587 + blue * 0.114) >= 128
                ? '#000000'
                : '#FFFFFF';
      let userColors = {
        userColor,userContrastColor
      }
      usersColors[userId] = userColors;
    }
    this.usersDataMap!.set('usersColors', usersColors);

    this.userInfo.color = usersColors[userId];
  }

  init(roomName: string, userInfo: any, articleData: any) {
    if (!this.articleData) {
      this.saveArticleData(articleData)
    }
    this.roomName = roomName
    this.userInfo = userInfo;
    //@ts-ignore
    window.indexedDB.databases().then((value: any[]) => {
      value.forEach((db: { name: string, version: number }) => {
        if (db.name !== this.roomName) {
          //@ts-ignore
          window.indexedDB.deleteDatabase(db.name);
        }
      })
    })
    this.providerIndexedDb = new IndexeddbPersistence(this.roomName, this.ydoc);
    let buildApp = () => {
      this.provider = new WebsocketProvider(`wss://${this.config.websocketHost}:${this.config.websocketPort}`, this.roomName, this.ydoc, {
        connect: true,
        params: {},
        WebSocketPolyfill: WebSocket,
        awareness: new awarenessProtocol.Awareness(this.ydoc),
      })
      /* this.provider = new WebsocketProvider(`ws://localhost:9182`, this.roomName, this.ydoc, {
        connect: true,
        params: {},
        WebSocketPolyfill: WebSocket,
        awareness: new awarenessProtocol.Awareness(this.ydoc),
      } )*/
      this.provider.on('connection-close', function (WSClosedEvent: any) {
        console.log("---", WSClosedEvent, (new Date()).getTime());
      });
      this.provider.on('connection-error', function (WSErrorEvent: any) {
        console.log("---", WSErrorEvent, (new Date()).getTime());
      });
      this.provider.on('synced', (isSynced: boolean) => {
        let oldSize = this.ydoc.share.size;
        let sameSizeCount = 0;
        let checkSyncStatus = setInterval(() => {
          let newSize = this.ydoc.share.size
          if(oldSize == newSize){
            sameSizeCount++;
          }else{
            sameSizeCount = 0;
          }
          oldSize = newSize
          if ((sameSizeCount>2&&oldSize>0) || this.creatingANewArticle) {
            setTimeout(() => {
              this.buildEditor();
              this.creatingANewArticle = false;
            }, 1000)
            clearInterval(checkSyncStatus)
          }
        }, 500)
      })
      /* this.provider = new WebrtcProvider(this.roomName, this.ydoc, {
        signaling: ['ws://dev.scalewest.com:4444','ws://localhost:4444',  'wss://y-webrtc-signaling-eu.herokuapp.com' , 'wss://signaling.yjs.dev'  ,'wss://y-webrtc-signaling-us.herokuapp.com'],
        password: null,
        awareness: new awarenessProtocol.Awareness(this.ydoc),
        maxConns: 20 + Math.floor(random.rand() * 15),
        filterBcConns: false,
        peerOpts: {},
      }); */

      /*this.provider?.on('onChange', (docArray: any) => {
        let params = new HttpParams({
          fromObject: {
            document: docArray,
            articleId: roomName
          }
        });


         sendUpdateToServiceWorker(params.toString());
        this.http.post('/products', params).subscribe(() => {
        });
      });*/

      let sendUpdateToServiceWorker = (update: string) => {
        if (navigator.onLine) {
          return;
        }
        var msg = {
          'update': update
        }
        navigator?.serviceWorker?.controller?.postMessage(msg)
      }

      if (!navigator.onLine) {
        //this.buildEditorsOffline();
        this.buildEditor();
      } else {
        return
        // Building the editor without backend for now just for developer purpose
        let buildeditor = false
        //this.buildEditor();
        //return
        let onSubevent = fromEvent(this.provider!, 'connected').subscribe(() => {
          fromEvent(this.provider!, 'synced').pipe(delay(500)).subscribe((data: any) => {
            if (!buildeditor) {
              //let synced = this.provider?.room?.synced
              buildeditor = true
              if (data.synced) {
                this.buildEditor();
              } else {
                renderDoc(data)
              }
            }
          })
          setTimeout(() => {
            if (!buildeditor) {
              buildeditor = true
              this.buildEditor();
            }
          }, 1500)
          /*
            // render only from backednt
            this.http.get('/products/' + roomName).subscribe((data) => {
            renderDoc(data);
            })


            // race render from backend on indexdb
            */
        })

        /* this.provider?.on('signalingConnected',()=>{
        }) */
      }


    }
    if (this.providerIndexedDb.synced) {
      buildApp()
    } else {
      this.providerIndexedDb.on('synced', () => {
        buildApp()
      })
    }
    let renderDoc = (data: any) => {

      let currentState1: any;
      try {
        const documents = data.map((item: any) => {
          if (typeof item.document == 'string') {
            return Uint8Array.from(item.document.split(','))
          } else {
            return null
          }
        }).filter((item: any) => item)
        documents.forEach((doc: any) => {
          Y.applyUpdate(this.ydoc, doc);
        })
      } catch (e) {
        console.error(e);
      }

      this.buildEditor();
    }
  }

  shouldSetTheOwnerForTheNewArticle = false
  ownerInfo: any
  newArticleId: string = ''

  newArticleIsCreated(user: any, articleId: string) {
    this.shouldSetTheOwnerForTheNewArticle = true
    this.ownerInfo = user
    this.newArticleId = articleId
  }

  setArticleOwnerInfo() {
    this.shouldSetTheOwnerForTheNewArticle = false
    if (this.roomName == this.newArticleId) {
      this.collaborators.set('collaborators', { collaborators: [{ ...this.ownerInfo.data, access: 'Owner',role:"Author",affiliations:[]  }],affiliations:[] });
      this.collaborators.set('authorsList', [{authorId:this.ownerInfo.data.id,authorEmail:this.ownerInfo.data.email}]);
    }
    this.ownerInfo = undefined
    this.newArticleId = ''
  }


}

