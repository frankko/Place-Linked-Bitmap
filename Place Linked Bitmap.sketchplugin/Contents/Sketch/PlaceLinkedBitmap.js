var PlaceLinkedBitmap = {
  "addFillToShapeLayer": function(context,layer,url) {
    var doc = context.document;

    var filePath = url.toString();
    filePath = filePath.replace("file:///","/");
    filePath = this.util.decodeString(filePath);

    var newImage = [[NSImage alloc] initWithContentsOfFile:filePath];

    var fill = layer.style().fills().firstObject();
    [fill setPatternImage:newImage];
//    [fill setImage:newImage];
    [fill setFillType:4];
    [fill setPatternFillType:1];
    return layer;
  },
  "findAllTaggedLayers": function(context,layers) {
    var command = context.command;
    var foundLayers = [];

    for (var i = 0; i < [layers count]; i++) {
      var layer = layers[i];
      if ([command valueForKey:"originalURL" onLayer:layer]) {
        foundLayers.push(layer);
      }
    }
    return foundLayers;
  },
  "findBitmapTaggedLayers": function(context,layers) {
    var command = context.command;
    var foundLayers = [];

    for (var i = 0; i < [layers count]; i++) {
      var layer = layers[i];
      if ([command valueForKey:"originalURL" onLayer:layer] && ([layer className] == "MSBitmapLayer")) {
        foundLayers.push(layer);
      }
    }
    return foundLayers;
  },
  "findFillTaggedLayers": function(context,layers) {
    var command = context.command;
    var foundLayers = [];

    for (var i = 0; i < [layers count]; i++) {
      var layer = layers[i];
      if ([command valueForKey:"originalURL" onLayer:layer] && ([layer className] == "MSShapeGroup")) {
        foundLayers.push(layer);
      }
    }
    return foundLayers;
  },
  "getFilenameFromLocalURL": function(tmpFilePath) {
    filePath = tmpFilePath.toString();
    filePath = filePath.replace("file:///","");
    var filename = filePath.split('/').pop();

    return filename;
  },
  "getDirFromLocalURL": function(tmpFilePath,addProtocol) {
    filePath = tmpFilePath.toString();
    filePath = filePath.replace("file:///","");
    var filePathParts = filePath.split('/');
    filePathParts.pop();

    var newFilePath = '/' + filePathParts.join('/') + '/';

    if (addProtocol) {
      newFilePath = 'file://' + newFilePath;
    }

    return newFilePath;
  },
  "getRelativeDir": function(fileURL,tmpDocDir) {
    var fileName = this.getFilenameFromLocalURL(fileURL,false).toString();
    var fileDir = this.getDirFromLocalURL(fileURL,true).toString();
    var docDir = tmpDocDir.toString();

    var newPath = fileDir;

    if (newPath.indexOf(docDir) != -1) {
      newPath = newPath.replace(docDir,'./');
    }

    var newURL = newPath + fileName;
    return newURL;
  },
  "expandRelativePath": function(tmpFileURL,tmpDocDir) {
    var docDir = tmpDocDir.toString();
    var fileURL = tmpFileURL.toString();

    if (fileURL.indexOf('./') != -1) {
       fileURL = fileURL.replace('./',docDir);
    }

    return fileURL;
  },
  "makeBitmapLayer": function(container,name,url) {
    var layer = [MSBitmapLayer bitmapLayerWithImageFromPath:url];

    if (layer == nil) { 
    } else {
      [container addLayers:[layer]];
      layer.name = name;
    }

    return layer;  
  },
  "makeLayerName": function(filePath,docPath) {
    var filename = this.getFilenameFromLocalURL(filePath);
    return PLB_layer_prefix + this.util.decodeString(filename);
  },
  "openPanel": function(filePath,message,prompt,title) {
    var openPanel = [NSOpenPanel openPanel];
    [openPanel setMessage:message];
    [openPanel setPrompt:prompt];
    [openPanel setTitle:title];
    [openPanel setCanCreateDirectories:false];
    [openPanel setCanChooseFiles:true];
    [openPanel setCanChooseDirectories:false];
    [openPanel setAllowsMultipleSelection:false];
    [openPanel setShowsHiddenFiles:false];
    [openPanel setExtensionHidden:false];
    [openPanel setDirectoryURL:[NSURL fileURLWithPath:filePath]]];
    [[NSApplication sharedApplication] activateIgnoringOtherApps:true];
    var openPanelButtonPressed = [openPanel runModal];
    if (openPanelButtonPressed == NSFileHandlingPanelOKButton) {
      selectedFile = [openPanel URL];
      return selectedFile;
    } else {
      return false;
    }
  },
  "openPanelMultiple": function(filePath,message,prompt,title) {
    var openPanel = [NSOpenPanel openPanel];
    [openPanel setMessage:message];
    [openPanel setPrompt:prompt];
    [openPanel setTitle:title];
    [openPanel setCanCreateDirectories:false];
    [openPanel setCanChooseFiles:true];
    [openPanel setCanChooseDirectories:false];
    [openPanel setAllowsMultipleSelection:true];
    [openPanel setShowsHiddenFiles:false];
    [openPanel setExtensionHidden:false];
    [openPanel setDirectoryURL:[NSURL fileURLWithPath:filePath]]];
    [[NSApplication sharedApplication] activateIgnoringOtherApps:true];
    var openPanelButtonPressed = [openPanel runModal];
    if (openPanelButtonPressed == NSFileHandlingPanelOKButton) {
      selectedFile = [openPanel URLs];
      return selectedFile;
    } else {
      return false;
    }
  },
  "updateBitmapLayer": function(context,layer,url) {
    var doc = context.document;
    var imageCollection = [[[doc documentData] assets] imageCollection];

    var filePath = url.toString();
    filePath = filePath.replace("file:///","/");
    filePath = this.util.decodeString(filePath);

    var newImage = [[NSImage alloc] initWithContentsOfFile:filePath];
    var replaceAction = [[doc actionsController] actionWithID:"MSReplaceImageAction"];
    [replaceAction applyImage:newImage tolayer:layer];
  },
  "updateShapeLayer": function(context,layer,url) {
    var doc = context.document;
    var imageCollection = [[[doc documentData] assets] imageCollection];

    var filePath = url.toString();
    filePath = filePath.replace("file:///","/");
    filePath = this.util.decodeString(filePath);

    var newImage = [[NSImage alloc] initWithContentsOfFile:filePath];

    var fill = layer.style().fills().firstObject();
    [fill setPatternImage:newImage];
//    [fill setImage:newImage];
    [fill setFillType:4];
    [fill setPatternFillType:1];
  },
  "util": {
    "encodeString": function(tempString) {
      var inputNSString = [[NSString alloc] initWithString:tempString];
      var encodedNSString = [inputNSString stringByAddingPercentEscapesUsingEncoding:NSUTF8StringEncoding];
      return encodedNSString.toString();
    },
    "decodeString": function(tempString) {
      var inputNSString = [[NSString alloc] initWithString:tempString];
      var decodedNSString = [inputNSString stringByReplacingPercentEscapesUsingEncoding:NSUTF8StringEncoding];
      return decodedNSString.toString();
    },
    "displayAlert": function(title,text) {
      var app = [NSApplication sharedApplication];
      [app displayDialog:text withTitle:title];
    },
    "displayPrompt": function(doc,text,initialValue) {
      var capturedInput = [doc askForUserInput:text initialValue:initialValue];
      return capturedInput;
    },
    "displayMessage": function(doc,text) {
      [doc showMessage:text];
    },
    "dumpObj": function(obj) {
      log("#####################################################################################")
      log("## Dumping object " + obj )
      log("## obj class is: " + [obj className])
      log("#####################################################################################")

      log("obj.properties:")
      log([obj class].mocha().properties())
      log("obj.propertiesWithAncestors:")
      log([obj class].mocha().propertiesWithAncestors())

      log("obj.classMethods:")
      log([obj class].mocha().classMethods())
      log("obj.classMethodsWithAncestors:")
      log([obj class].mocha().classMethodsWithAncestors())

      log("obj.instanceMethods:")
      log([obj class].mocha().instanceMethods())
      log("obj.instanceMethodsWithAncestors:")
      log([obj class].mocha().instanceMethodsWithAncestors())

      log("obj.protocols:")
      log([obj class].mocha().protocols())
      log("obj.protocolsWithAncestors:")
      log([obj class].mocha().protocolsWithAncestors())

      log("obj.treeAsDictionary():")
      log(obj.treeAsDictionary())
    },
    "reloadInspector": function(doc) {
      [doc reloadInspector];
    },
    "sendAction": function(context,commandToPerform) {
      var doc = context.document;
      try {
        [NSApp sendAction:commandToPerform to:nil from:doc];
      } catch(e) {
        log(e);
      }
    }
  }
};