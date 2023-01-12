import { Plugin, PluginKey } from "prosemirror-state";
import { ServiceShare } from "../services/service-share.service";

let toolTipElsClasses = ['insertion','deletion','comment']

export const toolTipPluginKey = new PluginKey('tool-tip-plugin')

export const getToolTipPlugin = function(serviceShare:ServiceShare){
  let currUserId
  serviceShare.AuthService.getUserInfo().subscribe((userInfo)=>{
    currUserId = userInfo.data.id
  })
  let toolTip = document.createElement('span')
  let toolTipArrow = document.createElement('span');
  return new Plugin({
    key:toolTipPluginKey,
    props:{
      handleDOMEvents:{
        mouseover:(view,event)=>{
          //@ts-ignore
          let elPath = event.path
          if(currUserId&&elPath[0]&&elPath[0] instanceof HTMLSpanElement&&toolTipElsClasses.includes(elPath[0].className)){
            let elWithToolTip = elPath[0] as HTMLSpanElement;
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
            if(Array.from(document.body.childNodes).includes(toolTip)){
              document.body.removeChild(toolTip)
            }
          }
        }
      }
    }
  })
}


