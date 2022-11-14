import { genericAttributtesToDom, getGenericAttributes, parseGenericAttributes } from "../../helpers";

const table_citation = {
  group: 'inline',
  inline: true,
  inclusive: false,
  attrs: {
      citated_tables: { default: [] },
      nonexistingtable:{ default:'false' },
      citateid: { default: '' },
      last_time_updated: { default: '' },
      tables_display_view: { default: [] },
      ...getGenericAttributes(),
  },
  parseDOM: [{
      tag: "table-citation", getAttrs(dom: HTMLElement) {
          let attrs = {
              citated_tables: dom.getAttribute('citated_tables')!.split(','),
              citateid: dom.getAttribute('citateid'),
              nonexistingTable: dom.getAttribute('nonexistingtable'),
              last_time_updated: dom.getAttribute('last_time_updated'),
              tables_display_view: dom.getAttribute('tables_display_view')!.split(','),
              ...parseGenericAttributes(dom)
          }
          attrs.contenteditableNode = 'false';
          return attrs
      }
  }],
  toDOM(node: any) {
      node.attrs.contenteditableNode = 'false';
      return ["table-citation", {
          "citated_tables": node.attrs.citated_tables.join(','),
          "citateid": node.attrs.citateid,
          "nonexistingtable": node.attrs.nonexistingtable,
          "last_time_updated": node.attrs.last_time_updated,
          "tables_display_view": node.attrs.tables_display_view.join(','),
          ...genericAttributtesToDom(node)
      }]
  }
};


export default table_citation;
