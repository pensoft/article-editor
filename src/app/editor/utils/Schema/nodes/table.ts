import { Node } from 'prosemirror-model';
import { parseGenericAttributes, getGenericAttributes, genericAttributtesToDom } from '../helpers';

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
        ...parseGenericAttributes(dom),
        tablewidth : dom.getAttribute('tablewidth')
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
        ...genericAttributtesToDom(node),
        tablewidth : node.attrs.tablewidth
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

export function tableNodes(options: any) {
    var extraAttrs = options.cellAttributes || {};
    var cellAttrs: any = {
        colspan: { default: 1 },
        rowspan: { default: 1 },
        colwidth: { default: null },
        ...getGenericAttributes(),
    };
    for (var prop in extraAttrs) {
        cellAttrs[prop] = { default: extraAttrs[prop].default };
    }

    return {
        table: {
            content: "table_row+",
            tableRole: "table",
            isolating: true,
            attrs: {
              ...getGenericAttributes(),
            },
            group: options.tableGroup,
            parseDOM: [{
                tag: "table", getAttrs(dom: HTMLElement) {
                    let attrs:any = {...parseGenericAttributes(dom)}
                    return attrs
                }
            }],
            toDOM(node: Node) {
                let attrs = {...genericAttributtesToDom(node)}
                return ["table", attrs, ["tbody",attrs, 0]]
            }
        },
        table_row: {
            content: "(table_cell | table_header)*",
            tableRole: "row",
            attrs: {
              ...getGenericAttributes(),
              tablewidth:{default:0},
            },
            parseDOM: [{
                tag: "tr", getAttrs(dom: any) {
                    return {
                      ...parseGenericAttributes(dom),
                      tablewidth : dom.getAttribute('tablewidth')
                  }
                }
            }],
            toDOM: function toDOM(node: any) {
                return ["tr", {
                    ...genericAttributtesToDom(node),
                    tablewidth : node.attrs.tablewidth
                  }, 0]
            }
        },
        table_cell: {
            content: options.cellContent,
            attrs: {...cellAttrs,tablewidth:{default:0}},
            tableRole: "cell",
            selectable:false,
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

export const TableNodesBuild = tableNodes({
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
