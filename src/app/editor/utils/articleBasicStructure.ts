import { uuidv4 } from "lib0/random";
import { articleSection, editorData, editorMeta } from "./interfaces/articleSection";

export function editorFactory(data?:editorMeta):editorData{
  return { editorId: uuidv4(), menuType: 'fullMenu',editorMeta:data}
}

export const articleBasicStructure : articleSection[] = [
    {
      title: { type: 'content', contentData: 'Title2' ,titleContent:'Title2',key:'title'},
      sectionContent: { type: 'editorContentType', contentData: editorFactory(),key:'sectionContent' },
      sectionID: uuidv4(),
      active: true,
      edit: { bool: true, main: true },
      add: { bool: true, main: false },
      delete: { bool: true, main: false },
      mode:'documentMode',
      children: [
        {
          title: { type: 'editorContentType', contentData: editorFactory() ,titleContent:'Title2',key:'title'},
          sectionContent: { type: 'editorContentType', contentData: editorFactory({placeHolder:'examplePlaceHolder',label:'exampleLabel'}),key:'sectionContent' },
          sectionID: uuidv4(),
          active: true,mode:'documentMode',
          edit: { bool: true, main: true },
          add: { bool: true, main: false },
          delete: { bool: true, main: false },
          children: [],
        }
      ],
    },{
      title: { type: 'content', contentData: 'Taxonomic coverage' ,titleContent:'Taxonomic coverage',key:'title'},mode:'documentMode',
      sectionContent: { type: 'taxonomicCoverageContentType',key:'sectionContent',
      contentData:
        {
          description:editorFactory({placeHolder:'Description...',label:'Description'}),
          taxaArray:[
            {
              scietificName:editorFactory({placeHolder:'ScietificName...',label:'Scietific name'}),
              commonName:editorFactory({placeHolder:'CommonName...',label:'Common name'}),
              rank:{options:['kingdom','genus','genus2']}
            },{
              scietificName:editorFactory({placeHolder:'ScietificName...',label:'Scietific name'}),
              commonName:editorFactory({placeHolder:'CommonName...',label:'Common name'}),
              rank:{options:['kingdom','genus','genus2dwdwwd']}
            },{
              scietificName:editorFactory({placeHolder:'ScietificName...',label:'Scietific name'}),
              commonName:editorFactory({placeHolder:'CommonName...',label:'Common name'}),
              rank:{options:['kingdom','genus','genus2']}
            },{
              scietificName:editorFactory({placeHolder:'ScietificName...',label:'Scietific name'}),
              commonName:editorFactory({placeHolder:'CommonName...',label:'Common name'}),
              rank:{options:['kingdom','genus','genus2']}
            }
          ]
          
        } 
      },
      sectionID: uuidv4(),
      edit: { bool: true, main: true },
      add: { bool: true, main: false },
      delete: { bool: true, main: false },
      active: true,
      children:[] 
    }];