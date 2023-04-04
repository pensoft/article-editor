import { genericAttributtesToDom, getGenericAttributes, parseGenericAttributes } from "../helpers";

export const reference_citation = {
  content: "inline*",
  group: "inline",
  inline:true,
  isolating: true,
  attrs: {
    ...getGenericAttributes(),
    refCitationID:{default:''},
    citedRefsIds:{default:[]},
    nonexistingelement:{ default:'false' },
    citedRefsCiTOs: { default: []},
    citationStyle: { default: '0'}
  },
  parseDOM: [{
    tag: "reference-citation", getAttrs(dom: any) {
      return {
        ...parseGenericAttributes(dom),
        nonexistingelement: dom.getAttribute('nonexistingelement'),
        refCitationID : dom.getAttribute('refCitationID'),
        citedRefsIds : dom.getAttribute('citedRefsIds')?dom.getAttribute('citedRefsIds').split(','):[],
        citedRefsCiTOs: dom.getAttribute('citedRefsCiTOs') ? dom.getAttribute('citedRefsCiTOs').split(',') : [],
        citationStyle: dom.getAttribute('citationStyle')
      }
    },
  }],
  toDOM(node: any) {
    let attributesToDom: any = {
      ...genericAttributtesToDom(node),
      refCitationID:node.attrs.refCitationID,
      "nonexistingelement": node.attrs.nonexistingelement,
      citedRefsIds:node.attrs.citedRefsIds.join(','),
      citedRefsCiTOs: node.attrs.citedRefsCiTOs.join(','),
      citationStyle: node.attrs.citationStyle
    }
    return ["reference-citation", attributesToDom, 0];
  }
}


export const reference_container = {
  content: "block*",
  group: "block",
  attrs: {
    ...getGenericAttributes({contenteditableNode: { default: false }}),
  },
  parseDOM: [{
    tag: "ul.reference-container", getAttrs(dom: any) {
      return {
        ...parseGenericAttributes(dom),
      }
    },
  }],
  toDOM(node: any) {
    let attributesToDom: any = {
      class:'reference-container',
      ...genericAttributtesToDom(node),
    }
    return ["ul", attributesToDom, 0];
  }
}

export const reference_block_container = {
  content: "block*",
  group: "block",
  attrs: {
    ...getGenericAttributes({contenteditableNode: { default: false }}),
  },
  parseDOM: [{
    tag: "li.reference-block-container", getAttrs(dom: any) {
      return {
        ...parseGenericAttributes(dom),
      }
    },
  }],
  toDOM(node: any) {
    let attributesToDom: any = {
      class:'reference-block-container',
      ...genericAttributtesToDom(node),
    }
    return ["li", attributesToDom, 0];
  }
}

export const reference_citation_end = {
  content: "inline*",
  group: "block",
  attrs: {
    ...getGenericAttributes({contenteditableNode: { default: false }}),
    refInstance:{default:'local'},
    refCitationID:{default:''},
    referenceData:{default:''},
    referenceStyle:{default:''},
    referenceType:{default:''},
  },
  parseDOM: [{
    tag: "reference-citation-end", getAttrs(dom: any) {
      let refData = dom.getAttribute('referencedata').split('|!|');
      let refStyle = dom.getAttribute('referencestyle').split('|!|');
      let refType = dom.getAttribute('referencetype').split('|!|');

      let referenceData = {refId:refData[0],last_modified:refData[1]}
      let referenceStyle = {name:refStyle[0],last_modified:refStyle[1]}
      let referenceType = {name:refType[0],last_modified:refType[1]}
      return {
        ...parseGenericAttributes(dom),
        refCitationID : dom.getAttribute('refCitationID'),
        referenceData,
        referenceStyle,
        referenceType,
      }
    },
  }],
  toDOM(node: any) {
    let referenceData = node.attrs.referenceData.refId+'|!|'+node.attrs.referenceData.last_modified
    let referenceStyle = node.attrs.referenceStyle.name+'|!|'+node.attrs.referenceStyle.last_modified
    let referenceType = node.attrs.referenceType.name+'|!|'+node.attrs.referenceType.last_modified
    let attributesToDom: any = {
      ...genericAttributtesToDom(node),
      refCitationID:node.attrs.refCitationID,
      referenceData,
      referenceStyle,
      referenceType
    }
    return ["reference-citation-end", attributesToDom, 0];
  }
}
