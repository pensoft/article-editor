//@ts-ignore
import {commentMark, trackChangesMarks} from './trackChanges/wax-prosemirror-schema'
//@ts-ignore
import crel from 'crel';
import {MarkSpec, Node, NodeSpec, NodeType, Schema} from 'prosemirror-model';
import {marks as basicmarks, nodes as basicnodes} from 'prosemirror-schema-basic';

const olDOM = ["ol", 0], ulDOM = ["ul", 0], liDOM = ["li", 0]

// :: NodeSpec
// An ordered list [node spec](#model.NodeSpec). Has a single
// attribute, `order`, which determines the number at which the list
// starts counting, and defaults to 1. Represented as an `<ol>`
// element.

// :: NodeSpec
// A bullet list node spec, represented in the DOM as `<ul>`.

// :: NodeSpec
// A list item (`<li>`) spec.
function getCellAttrs(dom: any, extraAttrs: any) {
  var widthAttr = dom.getAttribute("data-colwidth");
  var widths = widthAttr && /^\d+(,\d+)*$/.test(widthAttr) ? widthAttr.split(",").map(function (s: any) {
    return Number(s);
  }) : null;
  var colspan = Number(dom.getAttribute("colspan") || 1);
  var result: any = {
    colspan: colspan,
    rowspan: Number(dom.getAttribute("rowspan") || 1),
    colwidth: widths && widths.length == colspan ? widths : null,
    formControlName: dom.getAttribute('formControlName'),
    formArrayName: dom.getAttribute('formArrayName'),
    formGroupName: dom.getAttribute('formGroupName'),
    controlPath: dom.getAttribute('controlPath'),
    'ng-reflect-name': dom.getAttribute('ng-reflect-name'),
  };
  for (var prop in extraAttrs) {
    var getter = extraAttrs[prop].getFromDOM;
    var value = getter && getter(dom);
    if (value != null) {
      result[prop] = value;
    }
  }
  return result
}

function setCellAttrs(node: any, extraAttrs: any) {
  var attrs: any = {
    'formControlName': node.attrs.formControlName,
    'formArrayName': node.attrs.formArrayName,
    'formGroupName': node.attrs.formGroupName,
    'controlPath': node.attrs.controlPath,
    'ng-reflect-name': node.attrs['ng-reflect-name'],
  };
  if (node.attrs.colspan != 1) {
    attrs.colspan = node.attrs.colspan;
  }
  if (node.attrs.rowspan != 1) {
    attrs.rowspan = node.attrs.rowspan;
  }
  if (node.attrs.colwidth) {
    attrs["data-colwidth"] = node.attrs.colwidth.join(",");
  }
  for (var prop in extraAttrs) {
    var setter = extraAttrs[prop].setDOMAttr;
    if (setter) {
      setter(node.attrs[prop], attrs);
    }
  }
  return attrs
}

function tableNodes(options: any) {
  var extraAttrs = options.cellAttributes || {};
  var cellAttrs: any = {
    colspan: {default: 1},
    rowspan: {default: 1},
    colwidth: {default: null},
    formControlName: {default: ''},
    formArrayName: {default: ''},
    formGroupName: {default: ''},
    controlPath: {default: ''},
    'ng-reflect-name': {default: ''},
  };
  for (var prop in extraAttrs) {
    cellAttrs[prop] = {default: extraAttrs[prop].default};
  }

  return {
    table: {
      content: "table_row+",
      tableRole: "table",
      isolating: true,
      attrs: {
        formControlName: {default: ''},
        formArrayName: {default: ''},
        formGroupName: {default: ''},
        controlPath: {default: ''},
        'ng-reflect-name': {default: ''},
      },
      group: options.tableGroup,
      parseDOM: [{
        tag: "table", getAttrs(dom: any) {
          return {
            formControlName: dom.getAttribute('formControlName'),
            formArrayName: dom.getAttribute('formArrayName'),
            formGroupName: dom.getAttribute('formGroupName'),
            controlPath: dom.getAttribute('controlPath'),
            'ng-reflect-name': dom.getAttribute('ng-reflect-name'),
          }
        }
      }],
      toDOM: function toDOM(node: any) {
        return ["table", {
          'formControlName': node.attrs.formControlName,
          'formArrayName': node.attrs.formArrayName,
          'formGroupName': node.attrs.formGroupName,
          'controlPath': node.attrs.controlPath,
          'ng-reflect-name': node.attrs['ng-reflect-name'],
        }, ["tbody", 0]]
      }
    },
    table_row: {
      content: "(table_cell | table_header)*",
      tableRole: "row",
      attrs: {
        formControlName: {default: ''},
        formArrayName: {default: ''},
        formGroupName: {default: ''},
        controlPath: {default: ''},
        'ng-reflect-name': {default: ''},
      },
      parseDOM: [{
        tag: "tr", getAttrs(dom: any) {
          return {
            formControlName: dom.getAttribute('formControlName'),
            formArrayName: dom.getAttribute('formArrayName'),
            formGroupName: dom.getAttribute('formGroupName'),
            controlPath: dom.getAttribute('controlPath'),
            'ng-reflect-name': dom.getAttribute('ng-reflect-name'),

          }
        }
      }],
      toDOM: function toDOM(node: any) {
        return ["tr", {
          'formControlName': node.attrs.formControlName,
          'formArrayName': node.attrs.formArrayName,
          'formGroupName': node.attrs.formGroupName,
          'controlPath': node.attrs.controlPath,
          'ng-reflect-name': node.attrs['ng-reflect-name'],
        }, 0]
      }
    },
    table_cell: {
      content: options.cellContent,
      attrs: cellAttrs,
      tableRole: "cell",
      isolating: true,
      parseDOM: [{
        tag: "td", getAttrs: function (dom: any) {
          return getCellAttrs(dom, extraAttrs);
        }
      }],
      toDOM: function toDOM(node: any) {
        return ["td", setCellAttrs(node, extraAttrs), 0]
      }
    },
    table_header: {
      content: options.cellContent,
      attrs: cellAttrs,
      tableRole: "header_cell",
      isolating: true,
      parseDOM: [{
        tag: "th", getAttrs: function (dom: any) {
          return getCellAttrs(dom, extraAttrs);
        }
      }],
      toDOM: function toDOM(node: any) {
        return ["th", setCellAttrs(node, extraAttrs), 0]
      }
    }
  }
}

const nodes: NodeSpec = {
  doc: {
    content: "block+"
  },

  paragraph: {
    content: "inline*",
    group: "block",
    attrs: {
      align: {default: 'set-align-left'},
      formControlName: {default: ''},
      formArrayName: {default: ''},
      formGroupName: {default: ''},
      controlPath: {default: ''},
    },
    parseDOM: [{
      tag: "p", getAttrs(dom: any) {
        let classArray = dom.getAttribute('class')
        return {
          align: classArray,
          formControlName: dom.getAttribute('formControlName'),
          formArrayName: dom.getAttribute('formArrayName'),
          formGroupName: dom.getAttribute('formGroupName'),
          controlPath: dom.getAttribute('controlPath'),
        }
      },
    }],
    toDOM(node: any) {
      return ["p", {
        class: node.attrs.align,
        'formControlName': node.attrs.formControlName,
        'formArrayName': node.attrs.formArrayName,
        'formGroupName': node.attrs.formGroupName,
        'controlPath': node.attrs.controlPath,
      }, 0];
    }
  },
  inline_text: {
    group: 'inline',
    content: "inline*",
    inline: true,
    attrs: {
      formControlName: {default: ''},
      formArrayName: {default: ''},
      formGroupName: {default: ''},
      controlPath: {default: ''},
      style: {default: ''}
    },
    parseDOM: [{
      tag: "inline-text", getAttrs(dom: any) {
        return {
          formControlName: dom.getAttribute('formControlName'),
          formArrayName: dom.getAttribute('formArrayName'),
          formGroupName: dom.getAttribute('formGroupName'),
          controlPath: dom.getAttribute('controlPath'),
          style: dom.getAttribute('style'),
        }
      },
    }],
    toDOM(node: any) {
      return ["inline-text", {
        'formControlName': node.attrs.formControlName,
        'formArrayName': node.attrs.formArrayName,
        'formGroupName': node.attrs.formGroupName,
        'controlPath': node.attrs.controlPath,
        'style': node.attrs.style,
      }, 0];
    }
  },
  inline_span: {
    group: 'inline',
    content: "inline*",
    inline: true,
    attrs: {
      formControlName: {default: ''},
      formArrayName: {default: ''},
      formGroupName: {default: ''},
      controlPath: {default: ''},
      style: {default: ''},
      contenteditable: {default: 'true'},
      tagName: {default: 'inline-span'}
    },
    parseDOM: (function () {
      return ['inline-span', 'h2'].map((tagName: string) => {
        return {
          tag: tagName,
          getAttrs: (dom: any) => {
            return {
              formControlName: dom.getAttribute('formControlName'),
              formArrayName: dom.getAttribute('formArrayName'),
              formGroupName: dom.getAttribute('formGroupName'),
              controlPath: dom.getAttribute('controlPath'),
              style: dom.getAttribute('style'),
              contenteditable: dom.getAttribute('contenteditable'),
              tagName: dom.tagName
            };
          }
        }
      });
    })(),
    toDOM(node: any) {
      return [node.attrs.tagName, {
        'formControlName': node.attrs.formControlName,
        'formArrayName': node.attrs.formArrayName,
        'formGroupName': node.attrs.formGroupName,
        'controlPath': node.attrs.controlPath,
        'style': node.attrs.style,
        'contenteditable': node.attrs.contenteditable
      }, 0];
    }
  },
  input_container: {
    group: 'block',
    content: "(input_label | input_placeholder)+",
    isolating: true,
    selectable: false,
    dragable: false,
    attrs: {
      inputId: {
        default: ''
      }
    },
    draggable: false,
    toDOM(node: Node) {
      //let el = crel('text-input',{'style':'border:1px solid black'})
      //let textNode = schema.text('PlaceHolder');

      return ['input_container1', {'data-input-id': node.attrs.inputId}, 0]
    },
    parseDom: [{
      tag: "input-container1", getAttrs(dom: any) {
        return {inputId: dom.dataset.inputId}
      }
    }]
  },
  input_label: {
    group: 'block',
    selectable: true,
    dragable: false,
    isolating: true,
    atom: true,
    attrs: {
      text: {
        default: 'defaultLabel'
      }
    },
    toDOM(node: Node) {
      return ['input_label', {'style': "color:gray"}, node.attrs.text]
    },
    parseDom: [{
      tag: "input_label", getAttrs(dom: any) {
        console.log('dom', dom);
        return {text: dom.textContent}
      }
    }]
  },
  input_placeholder: {
    content: "text*",
    isolating: true,
    selectable: false,
    dragable: false,
    toDOM(node: Node) {
      //let el = crel('text-input',{'style':'border:1px solid black'})
      //let textNode = schema.text('PlaceHolder');

      return ['input_placeholder', {'style': 'border:1px solid black;margin-left:3px;margin-right:3px'}, 0]
    },
    parseDom: [{
      tag: "input_placeholder"
    }]
  },
  inputContainer: {
    group: 'inline',
    content: "inline*",
    inline: true,
    selectable: true,
    dragable: false,
    attrs: {
      inputId: {
        default: ''
      }
    },
    draggable: false,
    toDOM(node: Node) {
      //let el = crel('text-input',{'style':'border:1px solid black'})
      //let textNode = schema.text('PlaceHolder');

      return ['input-container', {'data-input-id': node.attrs.inputId}, 0]
    },
    parseDom: [{
      tag: "input-container", getAttrs(dom: any) {
        return {inputId: dom.dataset.inputId}
      }
    }]
  },
  textInputLabel: {
    group: 'inline',
    inline: true,
    selectable: false,
    dragable: false,
    atom: true,
    attrs: {
      text: {
        default: 'defaultLabel'
      }
    },
    toDOM(node: Node) {
      return crel('span', {'style': "color:gray"}, node.attrs.text)
    },
    parseDom: [{
      tag: "span", getAttrs(dom: any) {
        console.log('dom', dom);
        return {text: dom.textContent}
      }
    }]
  },

  textInput: {
    group: 'inline',
    content: "text*",
    isolating: true,
    selectable: false,
    dragable: false,
    inline: true,
    toDOM(node: Node) {
      //let el = crel('text-input',{'style':'border:1px solid black'})
      //let textNode = schema.text('PlaceHolder');

      return ['text-input', {'style': 'border:1px solid black;margin-left:3px;margin-right:3px'}, 0]
    },
    parseDom: [{
      tag: "text-input"
    }]
  },

  video: {
    inline: true,
    attrs: {
      src: {default: 'https://www.youtube.com/watch?v=TgbqBx4NthI&list=RDMMTgbqBx4NthI&start_radio=1&ab_channel=CHMusicChannel'}
    },
    group: "inline",
    draggable: true,
    parseDOM: [{
      tag: "iframe", getAttrs(dom: any) {
        return {
          src: dom.getAttribute('src'),
        }
      }
    }],
    toDOM(node: any) {
      let {src} = node.attrs;
      return ["iframe", {controls: '', width: 200, height: 180, src}]
    }
  },

  math_inline: {               // important!
    group: "inline math",
    content: "text*",        // important!
    inline: true,            // important!
    atom: true,              // important!
    toDOM: () => ["math-inline", {class: "math-node"}, 0],
    parseDOM: [{
      tag: "math-inline"   // important!
    }]
  },
  math_display: {              // important!
    group: "block math",
    content: "text*",        // important!
    atom: true,              // important!
    code: true,              // important!
    toDOM: () => {
      return ["math-display", {class: "math-node"}, 0]
    },
    parseDOM: [{
      tag: "math-display"  // important!
    }]
  },
  text: {
    group: "inline"
  },
  blockquote: basicnodes.blockquote,
  code_block: basicnodes.code_block,
  hard_break: basicnodes.hard_break,
  heading: basicnodes.heading,
  horizontal_rule: basicnodes.horizontal_rule,
  image: basicnodes.image,
  ordered_list: {
    content: "list_item+",
    group: 'block',
    attrs: {order: {default: 1}},
    parseDOM: [{
      tag: "ol", getAttrs(dom: any) {
        return {order: dom.hasAttribute("start") ? +dom.getAttribute("start") : 1}
      }
    }],
    toDOM(node: any) {
      return node.attrs.order == 1 ? olDOM : ["ol", {start: node.attrs.order}, 0]
    }
  },
  bullet_list: {
    group: 'block',
    content: "list_item+",
    parseDOM: [{tag: "ul"}],
    toDOM() {
      return ulDOM
    }
  },
  list_item: {
    content: "paragraph block*",
    parseDOM: [{tag: "li"}],
    toDOM() {
      return liDOM
    },
    defining: true
  },
  ...tableNodes({
    tableGroup: "block",
    cellContent: "block+",
    cellAttributes: {
      background: {
        default: null,
        //@ts-ignore
        getFromDOM(dom) {
          return dom.style.backgroundColor || null
        },
        setDOMAttr(value: any, attrs: any) {
          if (value) attrs.style = (attrs.style || "") + `background-color: ${value};`
        }
      }
    }
  })
  //...trackChangesNodes,

}


const marks: MarkSpec = {
  math_select: {
    toDOM() {
      return ["math-select", 0]
    },
    parseDOM: [{tag: "math-select"}]
  },
  subscript: {
    toDOM() {
      return ["sub", 0]
    },
    parseDOM: [{tag: "sub"}]
  },
  superscript: {
    toDOM() {
      return ["sup", 0]
    },
    parseDOM: [{tag: "sup"}]
  },
  comment: commentMark,
  ...trackChangesMarks,
  ...basicmarks,
  invalid: {
    attrs: {
      class: {default: 'invalid'},
    },
    parseDOM: [
      {
        tag: 'span',
        getAttrs(dom: any) {
          return {
            class: dom.getAttribute('class'),
          }
        },
      },
    ],
    toDOM(node: any) {
      return [
        'span',
        {
          class: node.attrs.class,
        },
      ];
    },
  },
  anchorTag: {
    attrs: {
      class: {default: 'anchor_tag'},
      id: {},
    },
    inclusive: false,
    parseDOM: [{
      tag: "span", getAttrs(dom: any) {
        return {id: dom.getAttribute("id"), class: dom.getAttribute('class')}
      }
    }],
    toDOM(node: any) {
      return ["span", {id: node.attrs.id, class: node.attrs.class}, 0]
    }
  },
  underline: {
    parseDOM: [{tag: 'u'}, {style: 'text-decoration=underline'}],
    toDOM() {
      return ['u', 0]
    },
  },

}

export {nodes, marks}
export const schema = new Schema({nodes, marks});

export function inputConstructor(id: string, label: string, placeholder: string) {
  let textInputLabelNode = schema.nodes.textInputLabel as NodeType
  let textInputNode = schema.nodes.textInput as NodeType
  let inputContainer = schema.nodes.inputContainer as NodeType
  let node = inputContainer.create({inputId: id}, [textInputLabelNode.create({text: label}), textInputNode.create({}, [schema.text(placeholder)]), textInputLabelNode.create({text: ';  '})])
  return node;
}

export function inputConstructor1(id: string, label: string, placeholder: string) {
  let input_label = schema.nodes.input_label as NodeType
  let input_placeholder = schema.nodes.input_placeholder as NodeType
  let input_container = schema.nodes.input_container as NodeType
  let node = input_container.create({inputId: id}, [input_label.create({text: label}), input_placeholder.create({}, [schema.text(placeholder)]), input_label.create({text: ';  '})])
  return node;
}
