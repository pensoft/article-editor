let allNodes = [
  "doc",                                // must
  "form_field",                         // must
  "inline_block_container",
  "paragraph",                          // must
  "form_field_inline",
  "form_field_inline_view",
  "reference_citation",               /* ref citation in editors  */
  "reference_citation_end",           // only in end editor
  "reference_container",              // only in end editor
  "reference_block_container",        // only in end editor
  "table",                          /* normal table nodes but has to be adde if tables are added  */
  "table_row",
  "table_cell",
  "table_header",                   /* normal table nodes but has to be adde if tables are added  */
  "image",                            /* should be added if figures are added  */
  "video",                            /* should be added if figures are added  */
  "block_figure",                    /* figures  */
  "figure_components_container",
  "figure_component",
  "figures_nodes_container",
  "figure_descriptions_container",
  "figure_component_description",
  "figure_description",              /* figures  */
  "tables_nodes_container",           /* tables  */
  "block_table",
  "table_header_container",
  "table_footer_container",
  "table_description",
  "table_content",
  "table_container",                  /* tables  */
  "text",                                // must
  "blockquote",
  "horizontal_rule",
  "heading",
  "code_block",
  "hard_break",
  "page_break",
  "spacer",
  "math_inline",
  "math_display",
  "list_item",
  "bullet_list",
  "ordered_list"
]
let allMarks = [
  "math_select",
  "subscript",
  "superscript",
  "comment",
  "format_change",    // must
  "insertion",        // must
  "deletion",         // must
  "delFromPopup",     // must
  "insFromPopup",     // must
  "table_citation",   /* tables */
  "citation",         /* figures */
  "link",
  "em",
  "strong",
  "code",
  "invalid",          // must
  "anchorTag",
  "underline",
  "ychange"           // must
]

let importantNodes = [
  "doc",                                // must
  "form_field",                         // must
  "paragraph",                          // must
  "text",                               // must
  "form_field_inline",                  // meybe  must
  "form_field_inline_view",             // meybe must
]

let importantMarks = [
  "ychange",          // must
  "invalid",          // must
  "format_change",    // must
  "insertion",        // must
  "deletion",         // must
  "delFromPopup",     // must
  "insFromPopup",     // must
]

let nodesThatCanBeAdded = [
  'citable-tables',
  'citable-figures',
  'tables',
  'image',
  'video',
  'inline_block_container',
  'reference_citation',
  "blockquote",
  "horizontal_rule",
  "heading",
  "code_block",
  "hard_break",
  "page_break",
  "math_inline",
  "math_display",
  "bullet_list",
  "ordered_list",
]

let marksThatCanBeAdded = [
  "subscript",
  "superscript",
  "comment",
  "link",
  "em",
  "strong",
  "code",
  "anchorTag",
  "underline",
]

let nodesConnections:{[key:string]:{nodes?:string[],marks?:string[]}} = {
  'citable-tables': {
    nodes: [
      "tables_nodes_container",
      "block_table",
      "table_header_container",
      "table_footer_container",
      "table_description",
      "table_content",
      "table_container",
      "table",
      "table_row",
      "table_cell",
      "table_header",
      "spacer",
      "heading",
    ], marks: [
      'table_citation'
    ]
  },
  'citable-figures': {
    nodes: [
      "spacer",
      "block_figure",                    /* figures  */
      "figure_components_container",
      "figure_component",
      "figures_nodes_container",
      "figure_descriptions_container",
      "figure_component_description",
      "figure_description",              /* figures  */
      'heading',
      'image',
      'video',
    ], marks: [
      'citation',
      'code'
    ]
  },
  'tables': {
    nodes: [
      "table",                          /* normal table nodes but has to be adde if tables are added  */
      "table_row",
      "table_cell",
      "table_header",                   /* normal table nodes but has to be adde if tables are added  */
    ]
  }, // all table nodes
  'image': { nodes: ['image'] },
  'video': { nodes: ['video'] },
  'inline_block_container': { nodes: ['inline_block_container'] },
  'reference-citation': { nodes: ['reference_citation'] },
  "blockquote": { nodes: ['blockquote'] },
  "horizontal_rule": { nodes: ['horizontal_rule'] },
  "headings": { nodes: ['heading'] },
  "code_block": { nodes: ['code_block'] },
  "hard_break": { nodes: ['hard_break'] },
  "page_break": { nodes: ['page_break'] },
  "math_inline": { nodes: ['math_inline'], marks: ["math_select"] },
  "math_display": { nodes: ['math_display'], marks: ["math_select"] },
  "bullet_list": { nodes: ['bullet_list', 'list_item'] },
  "ordered_list": { nodes: ['ordered_list', 'list_item'] },
}

let marksConnections = {
  "subscript": { marks: ["subscript"] },
  "superscript": { marks: ["superscript"] },
  "comment": { nodes: [], marks: ["comment"] },
  /* "table_citation":{nodes:[
    "tables_nodes_container",
    "block_table",
    "table_header_container",
    "table_footer_container",
    "table_description",
    "table_content",
    "table_container",
    "table",
    "table_row",
    "table_cell",
    "table_header",
    "spacer",
    "heading",
  ],marks:[
    'table_citation'
  ]},
  "citation":{nodes:[
    "spacer",
    "block_figure",
    "figure_components_container",
    "figure_component",
    "figures_nodes_container",
    "figure_descriptions_container",
    "figure_component_description",
    "figure_description",
    'heading',
    'image',
    'video',
  ],marks:[
    'citation',
    'code'
  ]}, */
  "link": { marks: ["link"] },
  "em": { marks: ["em"] },
  "strong": { marks: ["strong"] },
  "code": { marks: ["code"] },
  "anchorTag": { marks: ["anchorTag"] },
  "underline": { marks: ["underline"] },
}

let sectionMenuAndScemaMapping = {
  'Section with Schema1':{
    menu:'OnlyMarksAndHeadingsMenu',  // OnlyMarksAndHeadingsMenu (menu by key - from article layout)
    schema:'OnlyMarksAndHeadingsSchema'
  },
  'Section with Schema2':{
    menu:'OnlyCitableElementsAndCommentsMenu',  // OnlyCitableElementsAndCommentsMenu (menu by key - from article layout)
    schema:'OnlyCitableElementsAndCommentsSchema'
  },
  'Section with Schema3':{
    menu:[                                    // menu 1 by elements  (from html nodes)
      ['alignMenu'],
      ['undoItem', 'redoItem'],
      ['insertLink'],
      ['tableMenu','wrapBlockQuote'],
      ['addMathInlineMenuItem', 'addMathBlockMenuItem']
    ],
    schema:{                                  // schema 1 by elements (from html nodes)
      nodes:[
        'tables',
        'blockquote',
        'math_inline',
        'math_display'
      ],marks:[
        'link'
      ]
    }
  },
  'Section with Schema4':{
    menu:[                                   // menu 2 by elements (from html nodes)
      ['toggleStrong', 'toggleEm', 'toggleUnderline'],
      ['toggleSubscriptItem', 'toggleSuperscriptItem'],
      ['undoItem', 'redoItem', 'insertVideoItem'],
      ['logNodesMenuItem', 'insertFigure','insertTable', 'insertPageBreak', 'headings'],
      ['citateReference','tableMenu']
    ],
    schema:{                                 // schema 2 by elements (from html nodes)
      nodes:[
        'video',
        'citable-figures',
        'headings',
        'page_break',
        'tables',
        'reference-citation',
        'citable-tables',
      ],marks:[
        'strong',
        'em',
        'underline',
        'subscript',
        'superscript',
      ]
    }
  },
}

let checkNodeMarkCon = (schemaDev,nodeConn)=>{
  nodeConn.nodes?nodeConn.nodes.forEach((node)=>{
    if(!schemaDev.nodes.includes(node)){
      schemaDev.nodes.push(node)
    }
  }):undefined
  nodeConn?.marks?nodeConn.marks.forEach((mark)=>{
    if(!schemaDev.marks.includes(mark)){
      schemaDev.marks.push(mark)
    }
  }):undefined
}

export let mapSchemaDef = (def:{nodes?:string[],marks?:string[]})=>{
  let mappedSchema:{nodes:string[],marks:string[]} = {nodes:[],marks:[]};
  mappedSchema.nodes.push(...importantNodes);
  mappedSchema.marks.push(...importantMarks);
  def.nodes.forEach((nodedef)=>{
    let conns = nodesConnections[nodedef];
    checkNodeMarkCon(mappedSchema,conns)
  })
  def.marks.forEach((markdef)=>{
    let conns = marksConnections[markdef];
    checkNodeMarkCon(mappedSchema,conns)
  })
  return mappedSchema;
}

export let parseSecFormIOJSONMenuAndSchemaDefs = (formIOJSON:any)=>{
  let sectionMenusAndSchemaDefsFromJSON = {
    menus:{},
    schemas:{}
  }
  let sectionMenusAndSchemasDefsfromJSONByfieldsTags = {}
  let sectionMenuDefsCount = 0;
  let sectionSchemaDefsCount = 0

  let checkComponent = (component:any)=>{
    sectionMenusAndSchemasDefsfromJSONByfieldsTags[component.key] = {}
    if(component.properties){
      if(component.properties.menuType && component.properties.menuType.includes('[')){
        let menuDefStrRaw = component.properties.menuType
        let menuDefStr = menuDefStrRaw.replaceAll("'",'"');
        let menutype
        if(menuDefStr.includes('[')){
          let menutypeObjJson = '{"menuType":'+menuDefStr+'}';
          menutype = JSON.parse(menutypeObjJson);
        }
        if(menutype.menuType instanceof Array){
          let customSectiomMenuDefKey = 'customSectionJSONMenuType'+sectionMenuDefsCount;
          sectionMenusAndSchemaDefsFromJSON.menus[customSectiomMenuDefKey] = menutype.menuType;
          component.properties.menuType = customSectiomMenuDefKey
          sectionMenuDefsCount++
        }
      }
      if(component.properties.menuType&&component.properties.menuType.length>0){
        sectionMenusAndSchemasDefsfromJSONByfieldsTags[component.key].menu = component.properties.menuType;
      }
      if(component.properties.schemaType && component.properties.schemaType.includes('{')){
        let schemaDefStrRaw = component.properties.schemaType
        let schemaDefStr = schemaDefStrRaw.replaceAll("'",'"');
        let schematype
        if(schemaDefStr.includes('{')){
          let schematypeObjJson = '{"schemaType":'+schemaDefStr+'}';
          schematype = JSON.parse(schematypeObjJson);
        }
        if(typeof schematype.schemaType == 'object'){
          let customSectiomSchemaDefKey = 'customSectionJSONSchemaType'+sectionSchemaDefsCount;
          sectionMenusAndSchemaDefsFromJSON.schemas[customSectiomSchemaDefKey] = mapSchemaDef(schematype.schemaType);
          component.properties.schemaType = customSectiomSchemaDefKey
          sectionSchemaDefsCount++
        }
      }
      if(component.properties.schemaType&&component.properties.schemaType.length>0){
        sectionMenusAndSchemasDefsfromJSONByfieldsTags[component.key].schema = component.properties.schemaType;
      }
    }
  }
  let updateDefaultValue = (component: any)=> {
    let type = component.type
    if (type == 'datagrid') {
      checkComponent(component)
    } else if (component.type == 'columns') {
      for(let i = 0 ; i < component.columns.length;i++){
        let col = component.columns[i]
        for(let j = 0 ; j < col.components.length;j++){
          let comp = col.components[j]
          checkComponent(comp)
        }
      }
      checkComponent(component)
    } else if (type == "select") {
      checkComponent(component)
    } else if (type == "container") {
      checkComponent(component)
    } else if(type == "radio"){
      checkComponent(component)
    }else if (type == 'panel') {
      component.components.forEach((subcomp: any) => {
        updateDefaultValue(subcomp)
      })
    } else if (type == 'table') {
      for(let i = 0 ; i < component.rows.length;i++){
        let row = component.rows[i];
        for(let j = 0 ; j < row.length;j++){
          let cell = row[j]
          for(let k = 0 ; k < cell.components.length;k++){
            let cellSubComp = cell.components[k]
            updateDefaultValue(cellSubComp)

          }
        }
      }
    } else {
      checkComponent(component)
    }

  }
  for (let index = 0; index < formIOJSON.components.length; index++) {
    let component: any = formIOJSON.components[index];
    updateDefaultValue(component)
  }
  return {sectionMenusAndSchemaDefsFromJSON,formIOJSON,sectionMenusAndSchemasDefsfromJSONByfieldsTags}
}

export let parseSecHTMLMenuAndSchemaDefs = (html:string)=>{
  let newHTML = html
  let menuStringRegex = /menuType="(.*?)"/gm
  let schemaStringRegex = /schemaType="(.*?)"/gm
  let menuTypesStrings = []
  let schemaTypesStrings = []
  let lastMenuResult
  let lastScehmaResult

  let sectionMenusAndSchemaHTMLDefs = {
    menus:{},
    schemas:{},
  }
  do {
    lastMenuResult = menuStringRegex.exec(html);
    if (lastMenuResult) {
      menuTypesStrings.push(lastMenuResult);
    }
  } while (lastMenuResult);
  do {
    lastScehmaResult = schemaStringRegex.exec(html);
    if (lastScehmaResult) {
      schemaTypesStrings.push(lastScehmaResult);
    }
  } while (lastScehmaResult);
  let sectionMenuDefsCount = 0;
  menuTypesStrings.forEach((result)=>{
    let menuTypeStr = result[1].replaceAll("'",'"');
    let menutype
    if(menuTypeStr.includes('[')){
      let menutypeObjJson = '{"menuType":'+menuTypeStr+'}';
      menutype = JSON.parse(menutypeObjJson);
    }else{
      menutype = menuTypeStr
    }
    if(menutype.menuType instanceof Array){
      let customSectiomMenuDefKey = 'customSectionHTMLMenuType'+sectionMenuDefsCount;
      sectionMenusAndSchemaHTMLDefs.menus[customSectiomMenuDefKey] = menutype.menuType;
      newHTML = newHTML.replace(result[1],customSectiomMenuDefKey);
      sectionMenuDefsCount++
    }
  })
  let sectionSchemaDefsCount = 0
  schemaTypesStrings.forEach((result)=>{
    let schemaTypeStr = result[1].replaceAll("'",'"');
    let schematype
    if(schemaTypeStr.includes('[')){
      let schematypeObjJson = '{"schemaType":'+schemaTypeStr+'}';
      schematype = JSON.parse(schematypeObjJson);
    }else{
      schematype = schemaTypeStr
    }
    if(typeof schematype.schemaType == 'object'){
      let customSectiomSchemaDefKey = 'customSectionHTMLSchemaType'+sectionSchemaDefsCount;
      sectionMenusAndSchemaHTMLDefs.schemas[customSectiomSchemaDefKey] = mapSchemaDef(schematype.schemaType);
      newHTML = newHTML.replace(result[1],customSectiomSchemaDefKey);
      sectionSchemaDefsCount++
    }
  })
  return {sectionMenusAndSchemaHTMLDefs,sectionTemplate:newHTML}
}

// for every prosemirror schema important marks and nodes should added even if not in description

export let layoutMenuAndSchemaSettings = { // layout menu and schema definitions
  menus:{
    'OnlyMarksAndHeadingsMenu':[
      ['headings','alignMenu'],
      ['toggleStrong', 'toggleEm', 'toggleUnderline','toggleCode','toggleSubscriptItem', 'toggleSuperscriptItem'],
    ],
    'OnlyCitableElementsAndCommentsMenu':[
      ['insertFigure','insertTable','citateReference']
    ]
  },
  schemas:{
    'OnlyMarksAndHeadingsSchema':{                          // OnlyMarksAndHeadingsSchema (schema by key - from article layout)
      nodes:[
        "headings",
      ],marks:[
        "em",
        "strong",
        "code",
        "underline",
        "subscript",
        "superscript",
        "comment"
      ]
    },
    'OnlyCitableElementsAndCommentsSchema':{                                    // OnlyCitableElementsAndCommentsSchema (schema by key - from article layout)
      nodes:[
        'citable-figures',
        'citable-tables',
        'reference-citation'
      ],marks:[
        "comment"
      ]
    }
  }
}

