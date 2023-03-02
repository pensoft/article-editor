import { Plugin, PluginKey } from "prosemirror-state";
import { ServiceShare } from "../services/service-share.service";
import { createCustomIcon } from "./menu/common-methods";



export const refEditPluginKey = new PluginKey('ref-edit-plugin')

export const getRefsEditPlugin = function (serviceShare: ServiceShare) {
  let refElsTags = ['reference-citation-end', 'button']
  let buttonClass='update-data-reference-button'
  let importantClasses = ['reference-block-container',buttonClass]
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

  let removeEdit = (event) => {
    let target = getTargetElement(event)
    if(Array.from(document.body.childNodes).includes(button)){
      button.removeEventListener('click', editReference)
      document.body.removeChild(button)
    }
  }

  let editorContainer = Array.from(document.getElementsByClassName('editor-container'))[0]
  editorContainer.addEventListener('scroll', (event) => {
    removeEdit(event)
  })
  editorContainer.addEventListener('mouseleave', (event:MouseEvent) => {
    let target = event.relatedTarget as HTMLElement
      if(
        target&&
        (target.classList && target.classList.contains('mat-drawer-content')||target.classList.contains('reference-block-container'))||(target&&target.id == "app-article-element")/* ||target.className == "update-data-reference-button" */){
        removeEdit(event)
      }
  })



  return new Plugin({
    key: refEditPluginKey,
    props: {
      handleDOMEvents: {
        mouseleave:(view,event)=>{
          let target = event.relatedTarget as HTMLElement
          if(target.classList.contains('reference-block-container')||target.id == "app-article-element"/* ||target.className == "update-data-reference-button" */){
            removeEdit(event)
          }
        },
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
            button.className = buttonClass;
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
            top: ${position.top-3}px;
            left: ${position.left - 9}px;
            display: block;
            width:40px;
            height:27px;
            `)

            document.body.appendChild(button)
          } else if(targetElement && importantClasses.includes(targetElement.className)){

          } else {
            removeEdit(event)
          }
        }
      }
    }
  })
}


