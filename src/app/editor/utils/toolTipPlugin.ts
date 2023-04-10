import { Plugin, PluginKey } from "prosemirror-state";
import { ServiceShare } from "../services/service-share.service";

let toolTipElsClasses = ['insertion','deletion','comment']

export const toolTipPluginKey = new PluginKey('tool-tip-plugin')

export const getToolTipPlugin = function(serviceShare:ServiceShare){
  let currUserId
  serviceShare.AuthService.currentUser$.subscribe((userInfo)=>{
    currUserId = userInfo.id
  })
  let toolTip = document.createElement('span')
  let toolTipArrow = document.createElement('span');

  let removeToolTip = (view,event)=>{
    let targetElement = getTargetElement(event);

    if(!(targetElement instanceof HTMLSpanElement&&toolTipElsClasses.includes(targetElement.className))){
      if(Array.from(document.body.childNodes).includes(toolTip)){
        document.body.removeChild(toolTip)
      }
    }
  }

  let getTargetElement = (event)=>{
    let targetElement
    if(event.composedPath&&event.composedPath()[0]){
      targetElement = event.composedPath()[0];
    }else if(event.relatedTarget){
      targetElement = event.relatedTarget;
    }else if(event.fromElement){
      targetElement = event.fromElement;
    }
    return targetElement
  }

  return new Plugin({
    key:toolTipPluginKey,
    props:{
      handleDOMEvents:{
        mouseleave:removeToolTip,
        mousemove:removeToolTip,
        wheel:removeToolTip,
        focusout:removeToolTip,
        mouseover:(view,event)=>{
          let targetElement = getTargetElement(event);
          if(targetElement&&targetElement instanceof HTMLSpanElement&&toolTipElsClasses.includes(targetElement.className)){
            let elWithToolTip = targetElement as HTMLSpanElement;
            let userId = elWithToolTip.getAttribute('user')
            let userId2 = elWithToolTip.getAttribute('data-userid')
            let username = elWithToolTip.getAttribute('data-username')
            let userColor = elWithToolTip.getAttribute('usercolor')
            let userContrastColor = elWithToolTip.getAttribute('usercontrastcolor')
            if(currUserId == userId||userId2 == currUserId){
              userColor = '#00B1B2'
              userContrastColor = 'white'
            }
            let rect = elWithToolTip.getBoundingClientRect()
            toolTip.setAttribute('style',`
              color:${userContrastColor};
              background-color:${userColor};
              top: ${rect.top-27}px;
              padding-right: 3px;
              padding-left: 3px;
              border-radius: 4px;
              position: absolute;
              z-index: 2;
            `);
            toolTipArrow.setAttribute('style',`
            width: 0;
            height: 0;
            position: absolute;
            border-left: 7px solid transparent;
            border-right: 7px solid transparent;
            display: block;
            margin-right: calc(50% - 7px);
            margin-left: calc(50% - 7px);
	          border-top: 7px solid ${userColor};
            `)
            toolTip.innerHTML = username;
            document.body.appendChild(toolTip)
            toolTip.appendChild(toolTipArrow)
            toolTip.style.left = event.clientX-toolTip.getBoundingClientRect().width/2 + 'px'
          }else{
            removeToolTip(view,event)
          }
        }
      }
    }
  })
}


