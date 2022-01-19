
export interface editorData {
    editorId:string,
    menuType:string,
    editorMeta?:editorMeta,
}

export interface editorMeta{
    label?:string,
    placeHolder?:string,
    prosemirrorJsonTemplate?:any,
    formioJson?:any
}


export interface taxonomicCoverageContentData {
    description:editorData,
    taxaArray:taxa[],   //table rows
}

export interface taxa {
    scietificName:editorData,
    commonName:editorData,
    rank:dropdownData
}

export interface dropdownData{
    options:string[],
    defaulValue?:string
}

export interface titleContent {  name?: string ,label:string,template:string,editable:boolean}
export interface sectionContent { type: 'content' | 'taxonomicCoverageContentType'|'editorContentType'|'TaxonTreatmentsMaterial', contentData?: sectionContentData,key:'sectionContent' }

export type titleContentData = editorData|string
export type sectionContentData = editorData|taxonomicCoverageContentData
export interface articleSection {
    sectionID: string,
    active: boolean,
    children: articleSection[],
    add: { bool: boolean, main: boolean },
    edit: { bool: boolean, main: boolean },
    delete: { bool: boolean, main: boolean },
    mode:'documentMode'|'editMode',
    title:titleContent,
    prosemirrorHTMLNodesTempl?:string,
    formIOSchema?:any,
    defaultFormIOValues?:any,
    type:'complex'|'simple',
    sectionTypeID:number,
    sectionMeta:{main:boolean}
}
