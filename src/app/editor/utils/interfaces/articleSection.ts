export interface editorData {
  editorId: string,
  menuType: string,
  editorMeta?: editorMeta,
}

export interface editorMeta {
  label?: string,
  placeHolder?: string,
  prosemirrorJsonTemplate?: any,
  formioJson?: any
}


export interface taxonomicCoverageContentData {
  description: editorData,
  taxaArray: taxa[],   //table rows
}

export interface taxa {
  scietificName: editorData,
  commonName: editorData,
  rank: dropdownData
}

export interface dropdownData {
  options: string[],
  defaulValue?: string
}

export interface titleContent {
  name?: string,
  label: string,
  template: string,
  editable: boolean
}

export interface sectionContent {
  type: 'content' | 'taxonomicCoverageContentType' | 'editorContentType' | 'TaxonTreatmentsMaterial',
  contentData?: sectionContentData,
  key: 'sectionContent'
}

export type titleContentData = editorData | string
export type sectionContentData = editorData | taxonomicCoverageContentData

export interface articleSection {
  initialRender?: string,
  sectionID: string,
  allow_compatibility:boolean
  compatibility_extended:null|any[]
  active: boolean,
  children: articleSection[],
  add: { active: boolean, main: boolean },
  edit: { active: boolean, main: boolean },
  delete: { active: boolean, main: boolean },
  addSubSection?: { active: boolean, main: boolean },
  pivotId:number|undefined,
  menusAndSchemasDefs:{ menus:{[key:string]:any[]},schemas:{[key:string]:{nodes:string[],marks:string[]}}}
  mode: 'documentMode' | 'editMode' | 'noSchemaSectionMode',
  title: titleContent,
  override?: any,
  prosemirrorHTMLNodesTempl?: string,
  formIOSchema?: any,
  sectionIdFromBackend: number,
  defaultFormIOValues?: any,
  type: 'complex' | 'simple' ,
  sectionTypeID: number,
  sectionTypeVersion: number,
  sectionMeta: { main: boolean },
  subsectionValidations?: { [sec_id_backend: number]: { min: number, max: number } },
  compatibility?: { allow: { all: boolean, values: number[] }, deny: { all: boolean, values: number[] } }
  custom?:true,
  customSchema:{isCustom:boolean,schema?:{nodes:string[],marks:string[]}};
  sectionMenusAndSchemasDefsfromJSONByfieldsTags?:{[key:string]:{menu:any,schema:any}},
  jats_tag?: string
  originalSectionTemplate:any,
  level?: number,
  shouldNotShow?: boolean
}

export interface flatArticleSection {
  title: string;
  sectionID: string;
  parentSectionID: string;
  prosemirrorHTMLNodesTempl: string;
}
