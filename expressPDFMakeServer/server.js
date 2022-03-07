const express = require('express')
const bodyParser = require('body-parser');
const app = express();
const pdfmake = require('../pdfmake/build/pdfmake');
const vfs = require("../pdfmake/build/vfs_fonts.js").vfs;
pdfMake.vfs = vfs;

/* pdfMake.fonts = {ß
  Roboto: {
    normal: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf',
    bold: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf',ß
    italics: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Italic.ttf',
    bolditalics: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-MediumItalic.ttf'
  },
} */

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

app.all("/*", function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  next();
});

app.get('/buildPdf', (req, res) => {
  res.send({ text: 'Hello  QWEQWE Worlddsssdasd!' })
})

app.post('/buildPdf', async(req, res) => {
  let pdfJsonStruct = req.body.pdfJsonStruct;
  let threeImgOnRowWidth = pdfJsonStruct.threeImgOnRowWidth
  let fourImgOnRowWidth = pdfJsonStruct.fourImgOnRowWidth
  let singleimgOnRowWidth = pdfJsonStruct.singleimgOnRowWidth
  pdfJsonStruct.orderNodes = (node, nodeFunc) => {
    try {

      let nodeInfo = node.nodeInfo;
      if (nodeInfo.table && nodeInfo.table.props && nodeInfo.table.props.type == 'figure' && node.pageBreak == 'before') {
        let structuredNodes = nodeFunc.getContent();
        let nodesBefore = nodeFunc.detAllNodesBefore();
        let nodesAfter = nodeFunc.getAllNodesAfter();

        if (nodesBefore.length > 0) {
          let lastNodeBefore = nodesBefore[nodesBefore.length - 1];
          let availableHeightAfterLastNode = lastNodeBefore.props.availableHeight;

          // try move text from uder the figure

          let filledSpace = 0;
          let counter = 0;
          let movedIndexes = []
          let cannotMove = false
          while (counter < nodesAfter.length && !cannotMove) {
            let nAfter = nodesAfter[counter]
            if (nAfter.props.height < availableHeightAfterLastNode - filledSpace + 10 && node && !nAfter.table) {
              filledSpace += nAfter.props.height
              movedIndexes.push(1 + nodesBefore.length + counter);
            } else if (nAfter.table) {

            } else {
              cannotMove = true
            }
            counter++
          }
          movedIndexes.sort((a, b) => b - a);

          let editData = { moveFrom: movedIndexes, moveTo: nodesBefore.length };

          if (movedIndexes.length > 0 && availableHeightAfterLastNode - filledSpace < 200) {
            let nodesToMove = editData.moveFrom;
            let indexToMoveAt = editData.moveTo

            let movingNodes = []
            nodesToMove.forEach((indx) => {
              movingNodes.unshift(...structuredNodes.splice(indx, 1));
            })

            movingNodes.forEach((node) => {
              node.pageOrderCalculated = true;
            })

            structuredNodes.splice(indexToMoveAt, 0, ...movingNodes);
            //

            //retrun true so we contonue to the nex node
            return true;
          }

          // try move figure above the text before it


          let freeSpaceBefore = availableHeightAfterLastNode;

          counter = nodesBefore.length - 1;
          movedIndexes = []
          cannotMove = false
          while (counter > -1 && !cannotMove && node.props.height < 550) {
            let nBefore = nodesBefore[counter]
            if (nBefore.props.height + freeSpaceBefore < node.props.height && !nBefore.table && nBefore.nodeInfo.pageNumbers.length == 1 && nBefore.nodeInfo.pageNumbers[0] == node.nodeInfo.pageNumbers[0] - 1) {
              freeSpaceBefore += nBefore.props.height
              movedIndexes.push(counter);
            } else {
              cannotMove = true
            }
            counter--
          } /**/

          if (movedIndexes.length > 0 && cannotMove) {
            let moveNodeFrom = nodesBefore.length;
            let moveTo = Math.min(...movedIndexes);

            let movingNode = structuredNodes.splice(moveNodeFrom, 1, );
            movingNode.pageBreak = undefined;
            structuredNodes.splice(moveTo, 0, ...movingNode);
            return true
          }

          // try scale the images and then the above operations again


          let loopTableAndChangeWidth = (nodeToChange, newWidth) => {
            if (nodeToChange.table) {
              nodeToChange.table.body.forEach((row) => {
                row.forEach((element) => {
                  if (element.image && element.width) {
                    element.width = newWidth;
                  }
                });
              })
            }
          }

          if (node.scaleTry == 2) {
            /* if (node.finishedScaling) {
              return true
            } else {
              node.finishedScaling = true;
              node.pageOrderCalculated = false;
              loopTableAndChangeWidth(node, singleimgOnRowWidth)
            } */
            return true
          } else {
            if (!node.scaleTry) {
              node.scaleTry = 1
            } else {
              node.scaleTry = 2
            }
            if (node.scaleTry == 1) {
              node.pageOrderCalculated = false;
              loopTableAndChangeWidth(node, threeImgOnRowWidth)

            } else {
              node.pageOrderCalculated = false;
              loopTableAndChangeWidth(node, fourImgOnRowWidth)


            }
          }
        }
      }
      return false;
    } catch (e) {
      console.error(e)
    }
  }
  pdfJsonStruct.pageBreakBefore = (nodeInfo, nodeFunc) => {
    if (nodeInfo.table && nodeInfo.table.props && nodeInfo.table.props.type == 'figure') {
      if (nodeInfo.pageNumbers.length == 2) {
        return true
      }
    }
    return false;
  }
  let dataURL = await pdfmake.createPdf(pdfJsonStruct).getDataUrl();
  res.send(dataURL)
})

app.listen(3000, () => {})
