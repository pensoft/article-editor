import { Plugin, PluginKey } from "prosemirror-state";
import { ServiceShare } from "../services/service-share.service";
import { createCustomIcon } from "./menu/common-methods";



export const refEditPluginKey = new PluginKey('ref-edit-plugin')

export const getRefsEditPlugin = function (serviceShare: ServiceShare) {
  let refElsTags = ['reference-citation-end', 'button']
  let buttonNode;
  let currUserId;
  serviceShare.AuthService.getUserInfo().subscribe((userInfo) => {
    currUserId = userInfo.data.id
  })
  let button = document.createElement('button');

  const editReference = () => {
    if (buttonNode) {
      serviceShare.CslService!.editReferenceThroughPMEditor(buttonNode, '');
    }
  }

  let removeEdit = (view,event) => {
    let targetElement = getTargetElement(event);
    if(!(targetElement&&refElsTags.includes(targetElement.localName))){
      if(Array.from(document.body.childNodes).includes(button)){
        button.removeEventListener('click', editReference)
        document.body.removeChild(button)
      }
    }
  }

  let editorContainer = Array.from(document.getElementsByClassName('editor-container'))[0]
  editorContainer.addEventListener('scroll', () => {
    if (Array.from(document.body.childNodes).includes(button)) {
      button.removeEventListener('click', editReference)
      document.body.removeChild(button)
    }
  })

  let getTargetElement = (event) => {
    let targetElement
    if (event.composedPath && event.composedPath()[0]) {
      targetElement = event.composedPath()[0];
    } else if (event.relatedTarget) {
      targetElement = event.relatedTarget;
    } else if (event.fromElement) {
      targetElement = event.fromElement;
    }
    return targetElement
  }

  return new Plugin({
    key: refEditPluginKey,
    props: {
      handleDOMEvents: {
        mouseleave: removeEdit,
        mousemove: removeEdit,
        wheel: removeEdit,
        focusout: removeEdit,
        mouseover: (view, event) => {
          let targetElement = getTargetElement(event);
          if (targetElement && refElsTags.includes(targetElement.localName)) {
            const id = targetElement.getAttribute('referencedata').split('|!|')[0]
            const doc = view.state.doc
            const size = doc.content.size
            let endPositionRef
            doc.nodesBetween(0, size, (node, pos) => {
              if (node.type.name == 'reference_citation_end' && id == node.attrs.referenceData.refId) {
                endPositionRef = pos + node.nodeSize
                buttonNode = node
                button.addEventListener('click', editReference, { once: true })

              }
            })

            let position = view.coordsAtPos(endPositionRef - 1)
            button.className = 'update-data-reference-button';
            button.style.cursor = 'pointer'
            button.title = 'Click this button to edit this reference.'
            let img1 = createCustomIcon('edit2.svg', 12, 12, 1)
            img1.dom.className = 'update-data-reference-img'

            if (!button.childElementCount) {
              button.append(img1.dom)
            }
            button.setAttribute('style', `
            position: absolute;
            z-index: 2;
            top: ${position.top}px;
            left: ${position.left + 10}px;
            display: block;
            `)

            document.body.appendChild(button)
          } else {
            removeEdit(view,event)
          }
        }
      }
    }
  })
}


