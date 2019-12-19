let widgets = [];
figma.showUI(__html__);
figma.ui.resize(800, 2000);
let backgroundColorRedGamma = 0;
let backgroundColorGreenGamma = 0;
let backgroundColorBlueGamma = 0;
let backgroundColorOpacity = 0;
let maxHeight = 0;
let maxWidth = 0;
let assets = [];
for (let node of figma.currentPage["children"]) {
    if (node.name == "Background") {
        maxHeight = node.height;
        maxWidth = node.width;
    }
}
function groupHandler(groupObject, maxHeight, maxWidth, leftPositionSubtractor = 0, topPositionSubtractor = 0) {
    let widgetName = groupObject["name"];
    let positionLeftCoef = groupObject["x"] / maxWidth;
    let positionTopCoef = groupObject["y"] / maxHeight;
    let containerHeightCoef = groupObject["height"] / maxHeight;
    let containerWidthCoef = groupObject["width"] / maxWidth;
    let widgets = [];
    for (let node of groupObject["children"]) {
        if (node.locked == false) {
            if (node.type == "RECTANGLE") {
                widgets.push(containerHandler(node, maxHeight, maxWidth, positionLeftCoef, positionTopCoef));
            }
            else if (node.type == "TEXT") {
                widgets.push(textHandler(node, maxHeight, maxWidth, positionLeftCoef, positionTopCoef));
            }
            else if (node.type == "ELLIPSE") {
                widgets.push(ellipseHandler(node, maxHeight, maxWidth, positionLeftCoef, positionTopCoef));
            }
            else if (node.type == "GROUP") {
                widgets.push(groupHandler(node, maxHeight, maxWidth, positionLeftCoef, positionTopCoef));
            }
        }
    }
    let flutterGroupObject = `
        /*  <<------------ ${widgetName}  ------------>>*/
        Positioned(
                top: constraints.maxHeight * ${positionTopCoef -
        topPositionSubtractor},
                left: constraints.maxWidth * ${positionLeftCoef -
        leftPositionSubtractor},
                child: Container(
                        height: constraints.maxHeight * ${containerHeightCoef},
                        width: constraints.maxWidth *${containerWidthCoef},
                        child: Stack(
                          children: <Widget>[
                            ${widgets}
                          ]
                        ),      
                    ),
                 )
      /*  <<---------------------------------------->>*/
    `;
    return flutterGroupObject;
}
function containerHandler(containerObject, maxHeight, maxWidth, leftPositionSubtractor = 0, topPositionSubtractor = 0) {
    console.log(containerObject["exportSettings"]);
    let widgetName = containerObject["name"];
    let positionLeftCoef = containerObject["x"] / maxWidth;
    let positionTopCoef = containerObject["y"] / maxHeight;
    let containerHeightCoef = containerObject["height"] / maxHeight;
    let containerWidthCoef = containerObject["width"] / maxWidth;
    let redGamma;
    let greenGama;
    let blueGama;
    let colorOpacity;
    let imageObject = "";
    let imageAsset = "";
    if (containerObject["fills"]["0"]["type"] == "SOLID") {
        redGamma = Math.round(containerObject["fills"]["0"]["color"]["r"] * 255);
        greenGama = Math.round(containerObject["fills"]["0"]["color"]["g"] * 255);
        blueGama = Math.round(containerObject["fills"]["0"]["color"]["b"] * 255);
        colorOpacity = containerObject["fills"]["0"]["opacity"].toFixed(2);
    }
    if (containerObject["fills"]["0"]["type"] == "IMAGE") {
        redGamma = 0;
        greenGama = 0;
        blueGama = 0;
        colorOpacity = 0.0;
        imageObject = `
      image: DecorationImage(
            image: AssetImage("assets/images/${widgetName}.png"),
            fit: BoxFit.fill),
    `;
        imageAsset = `
      - assets/images/${widgetName}.png
    `;
        assets.push(imageAsset);
    }
    let bottomLeftBorderRadiusCoef = containerObject["bottomLeftRadius"] / maxHeight;
    let bottomRightBorderRadiusCoef = containerObject["bottomRightRadius"] / maxHeight;
    let topLeftBorderRadiusCoef = containerObject["topLeftRadius"] / maxHeight;
    let topRightBorderRadiusCoef = containerObject["topRightRadius"] / maxHeight;
    let borderObject = "";
    let shadowObject = "";
    if (containerObject["strokes"].length > 0) {
        let borderWidthCoef = containerObject["strokeWeight"] / maxHeight;
        let borderColorRedGamma = Math.round(containerObject["strokes"]["0"]["color"]["r"] * 255);
        let borderColorGreenGamma = Math.round(containerObject["strokes"]["0"]["color"]["g"] * 255);
        let borderColorBlueGamma = Math.round(containerObject["strokes"]["0"]["color"]["b"] * 255);
        let borderColorOpacity = containerObject["strokes"]["0"]["opacity"].toFixed(2);
        borderObject = `
                                border: Border.all(
                                    width: constraints.maxHeight*${borderWidthCoef},
                                    color: Color.fromRGBO(${borderColorRedGamma}, ${borderColorGreenGamma}, ${borderColorBlueGamma}, ${borderColorOpacity}),
                                ),
        `;
    }
    if (containerObject.effects.length > 0 &&
        containerObject["fills"]["0"]["type"] == "SOLID") {
        let shadowOpacity = containerObject["effects"]["0"]["color"]["a"].toFixed(2);
        let shadowColorRedGamma = Math.round(containerObject["effects"]["0"]["color"]["r"] * 255);
        let shadowColorGreenGamma = Math.round(containerObject["effects"]["0"]["color"]["g"] * 255);
        let shadowColorBlueGamma = Math.round(containerObject["effects"]["0"]["color"]["b"] * 255);
        let shadowHorizontalOffsetCoef = containerObject["effects"]["0"]["offset"]["x"] / maxWidth;
        let shadowVerticalOffsetCoef = containerObject["effects"]["0"]["offset"]["y"] / maxHeight;
        let shadowBlurRadiusCoef = containerObject["effects"]["0"]["radius"] / maxHeight;
        shadowObject = `
                                boxShadow: [
                                    BoxShadow(
                                        color: Color.fromRGBO( ${shadowColorRedGamma}, ${shadowColorGreenGamma}, ${shadowColorBlueGamma},${shadowOpacity}),
                                        blurRadius: constraints.maxHeight*${shadowBlurRadiusCoef},
                                        offset: Offset(
                                            constraints.maxWidth*${shadowHorizontalOffsetCoef},
                                            constraints.maxHeight*${shadowVerticalOffsetCoef},
                                        ),
                                    )
                                ],

    `;
    }
    let flutterContainerObject = `
        /*  <<------------ ${widgetName}  ------------>>*/
        Positioned(
                top: constraints.maxHeight * ${positionTopCoef -
        topPositionSubtractor},
                left: constraints.maxWidth * ${positionLeftCoef -
        leftPositionSubtractor},
                child: Container(
                        height: constraints.maxHeight * ${containerHeightCoef},
                        width: constraints.maxWidth * ${containerWidthCoef},
                        decoration: BoxDecoration(
                                color: Color.fromRGBO(${redGamma}, ${greenGama}, ${blueGama}, ${colorOpacity}),
                                borderRadius: BorderRadius.only(
                                    topLeft: Radius.circular(constraints.maxHeight*${topLeftBorderRadiusCoef}),
                                    topRight: Radius.circular(constraints.maxHeight*${topRightBorderRadiusCoef}),
                                    bottomLeft: Radius.circular(constraints.maxHeight*${bottomLeftBorderRadiusCoef}),
                                    bottomRight: Radius.circular(constraints.maxHeight*${bottomRightBorderRadiusCoef}),
                                ),
                                ${imageObject}
                                ${borderObject}
                                ${shadowObject}
                  ),
                ),
              )
      /*  <<---------------------------------------->>*/
    `;
    return flutterContainerObject;
}
function textHandler(textObject, maxHeight, maxWidth, leftPositionSubtractor = 0, topPositionSubtractor = 0) {
    let widgetName = textObject["name"];
    let textString = textObject["characters"];
    let textPositionLeftCoef = textObject["x"] / maxWidth;
    let textPositionTopCoef = textObject["y"] / maxHeight;
    let fontSizeCoef = textObject["fontSize"] / maxHeight;
    let fontColorRedGamma = Math.round(textObject["fills"]["0"]["color"]["r"] * 255);
    let fontColorGreenGamma = Math.round(textObject["fills"]["0"]["color"]["g"] * 255);
    let fontColorBlueGamma = Math.round(textObject["fills"]["0"]["color"]["b"] * 255);
    let fontColorOpacity = textObject["fills"]["0"]["opacity"].toFixed(2);
    let textContainerHeightCoef = textObject["height"] / maxHeight;
    let textContainerWidthCoef = textObject["width"] / maxWidth;
    let textAlign;
    switch (textObject["textAlignHorizontal"]) {
        case "CENTER":
            textAlign = "TextAlign.center";
            break;
        case "LEFT":
            textAlign = "TextAlign.left";
            break;
        case "RIGHT":
            textAlign = "TextAlign.right";
            break;
    }
    let flutterTextObject = `

    /*  <<------------ ${widgetName}  ------------>>*/
    Positioned(
                top: constraints.maxHeight * ${textPositionTopCoef -
        topPositionSubtractor},
                left: constraints.maxWidth * ${textPositionLeftCoef -
        leftPositionSubtractor},
                child: Container(
                    height: constraints.maxHeight * ${textContainerHeightCoef},
                    width: (constraints.maxWidth * ${textContainerWidthCoef})*1.1,
                    child: Text("${textString}",
                        textAlign:${textAlign},
                       
                        style: TextStyle( 
                            decoration: TextDecoration.none,
                            fontWeight: FontWeight.normal,
                            color: Color.fromRGBO(${fontColorRedGamma}, ${fontColorGreenGamma}, ${fontColorBlueGamma}, ${fontColorOpacity}),
                            fontSize: constraints.maxHeight * ${fontSizeCoef})),
                  ),
              )
  /*  <<---------------------------------------->>*/
  `;
    return flutterTextObject;
}
function ellipseHandler(ellipseObject, maxHeight, maxWidth, leftPositionSubtractor = 0, topPositionSubtractor = 0) {
    let widgetName = ellipseObject["name"];
    let positionLeftCoef = ellipseObject["x"] / maxWidth;
    let positionTopCoef = ellipseObject["y"] / maxHeight;
    let containerHeightCoef = ellipseObject["height"] / maxHeight;
    let containerWidthCoef = ellipseObject["width"] / maxWidth;
    let redGamma = 196;
    let greenGama = 196;
    let blueGama = 196;
    let colorOpacity = 1.0;
    let borderObject = "";
    let shadowObject = "";
    let imageObject = "";
    let imageAsset = "";
    if (ellipseObject["fills"]["0"]["type"] == "SOLID") {
        redGamma = Math.round(ellipseObject["fills"]["0"]["color"]["r"] * 255);
        greenGama = Math.round(ellipseObject["fills"]["0"]["color"]["g"] * 255);
        blueGama = Math.round(ellipseObject["fills"]["0"]["color"]["b"] * 255);
        colorOpacity = ellipseObject["fills"]["0"]["opacity"].toFixed(2);
    }
    if (ellipseObject["fills"]["0"]["type"] == "IMAGE") {
        imageObject = `
      image: DecorationImage(
            image: AssetImage("assets/images/${widgetName}.png"),
            fit: BoxFit.fill),
    `;
        imageAsset = `
      - assets/images/${widgetName}.png
    `;
        assets.push(imageAsset);
    }
    if (ellipseObject["strokes"].length > 0) {
        let borderWidthCoef = ellipseObject["strokeWeight"] / maxHeight;
        let borderColorRedGamma = Math.round(ellipseObject["strokes"]["0"]["color"]["r"] * 255);
        let borderColorGreenGamma = Math.round(ellipseObject["strokes"]["0"]["color"]["g"] * 255);
        let borderColorBlueGamma = Math.round(ellipseObject["strokes"]["0"]["color"]["b"] * 255);
        let borderColorOpacity = ellipseObject["strokes"]["0"]["opacity"].toFixed(2);
        borderObject = `
                                border: Border.all(
                                    width: constraints.maxHeight*${borderWidthCoef},
                                    color: Color.fromRGBO(${borderColorRedGamma}, ${borderColorGreenGamma}, ${borderColorBlueGamma}, ${borderColorOpacity}),
                                ),
        `;
    }
    if (ellipseObject.effects.length > 0) {
        let shadowOpacity = ellipseObject["effects"]["0"]["color"]["a"].toFixed(2);
        let shadowColorRedGamma = Math.round(ellipseObject["effects"]["0"]["color"]["r"] * 255);
        let shadowColorGreenGamma = Math.round(ellipseObject["effects"]["0"]["color"]["g"] * 255);
        let shadowColorBlueGamma = Math.round(ellipseObject["effects"]["0"]["color"]["b"] * 255);
        let shadowHorizontalOffsetCoef = ellipseObject["effects"]["0"]["offset"]["x"] / maxWidth;
        let shadowVerticalOffsetCoef = ellipseObject["effects"]["0"]["offset"]["y"] / maxHeight;
        let shadowBlurRadiusCoef = ellipseObject["effects"]["0"]["radius"] / maxHeight;
        shadowObject = `
                                boxShadow: [
                                    BoxShadow(
                                        color: Color.fromRGBO( ${shadowColorRedGamma}, ${shadowColorGreenGamma}, ${shadowColorBlueGamma},${shadowOpacity}),
                                        blurRadius: constraints.maxHeight*${shadowBlurRadiusCoef},
                                        offset: Offset(
                                            constraints.maxWidth*${shadowHorizontalOffsetCoef},
                                            constraints.maxHeight*${shadowVerticalOffsetCoef},
                                        ),
                                    )
                                ],
    `;
    }
    let flutterEllipseObject = `
        /*  <<------------ ${widgetName}  ------------>>*/
        Positioned(
                top: constraints.maxHeight * ${positionTopCoef -
        topPositionSubtractor},
                left: constraints.maxWidth * ${positionLeftCoef -
        leftPositionSubtractor},
                child: Container(
                        height: constraints.maxHeight * ${containerHeightCoef},
                        width: constraints.maxWidth * ${containerWidthCoef},
                        decoration: BoxDecoration(
                                color: Color.fromRGBO(${redGamma}, ${greenGama}, ${blueGama}, ${colorOpacity}),
                                shape: BoxShape.circle,
                                ${imageObject}
                                ${borderObject}
                                ${shadowObject}
                  ),
                ),
              )
      /*  <<---------------------------------------->>*/
    `;
    return flutterEllipseObject;
}
for (let node of figma.currentPage["children"]) {
    if (node.locked == false) {
        if (node.type == "RECTANGLE") {
            widgets.push(containerHandler(node, maxHeight, maxWidth));
        }
        else if (node.type == "TEXT") {
            widgets.push(textHandler(node, maxHeight, maxWidth));
        }
        else if (node.type == "ELLIPSE") {
            widgets.push(ellipseHandler(node, maxHeight, maxWidth));
        }
        else if (node.type == "GROUP") {
            widgets.push(groupHandler(node, maxHeight, maxWidth));
        }
    }
    else {
        backgroundColorRedGamma = Math.round(node["fills"]["0"]["color"]["r"] * 255);
        backgroundColorGreenGamma = Math.round(node["fills"]["0"]["color"]["g"] * 255);
        backgroundColorBlueGamma = Math.round(node["fills"]["0"]["color"]["b"] * 255);
        backgroundColorOpacity = node["fills"]["0"]["opacity"].toFixed(2);
    }
}
let statefullWidgetPage = `
import 'package:flutter/material.dart';

class FlugmaWidget extends StatefulWidget {
  @override
  _FlugmaWidgetState createState() => _FlugmaWidgetState();
}

class _FlugmaWidgetState extends State<FlugmaWidget> {
  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(builder: (context, constraints) {
      return Container(
        height: constraints.maxHeight,
        width: constraints.maxWidth,
        color: Color.fromRGBO(${backgroundColorRedGamma}, ${backgroundColorGreenGamma}, ${backgroundColorBlueGamma}, ${backgroundColorOpacity}),
        child: Stack(
          children: <Widget>[
            ${widgets}
          ],
        ),
      );
    });
  }
}

`;
let assetsToAdd = `
    name: bene
    description: A new Flutter project.
    version: 1.0.0+1

    environment:
      sdk: ">=2.1.0 <3.0.0"

    dependencies:
      flutter:
        sdk: flutter

      cupertino_icons: ^0.1.2
    
    dev_dependencies:
      flutter_test:
        sdk: flutter

    flutter:
      uses-material-design: true
      assets:
        ${assets}
    
`;
console.log(figma.currentPage.selection["0"]);
figma.ui.postMessage({ widget: statefullWidgetPage, assets: assetsToAdd });
