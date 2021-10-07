
export interface editorData {
    editorId:string,
    menuType:string,
    editorMeta?:editorMeta
} 

export interface editorMeta{label?:string,placeHolder?:string}


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
    options:string[]
}

export interface titleContent { type: 'content' | 'editorContentType', contentData?: titleContentData ,titleContent:string,key:'title'}
export interface sectionContent { type: 'content' | 'taxonomicCoverageContentType'|'editorContentType', contentData?: sectionContentData,key:'sectionContent' }

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
    sectionContent: sectionContent,
}