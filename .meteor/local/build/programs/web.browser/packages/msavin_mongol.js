//////////////////////////////////////////////////////////////////////////
//                                                                      //
// This is a generated file. You can view the original                  //
// source in your browser if your browser supports source maps.         //
// Source maps are supported by all recent versions of Chrome, Safari,  //
// and Firefox, and by Internet Explorer 11.                            //
//                                                                      //
//////////////////////////////////////////////////////////////////////////


(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var Mongo = Package.mongo.Mongo;
var Template = Package['templating-runtime'].Template;
var Tracker = Package.tracker.Tracker;
var Deps = Package.tracker.Deps;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;
var Blaze = Package.blaze.Blaze;
var UI = Package.blaze.UI;
var Handlebars = Package.blaze.Handlebars;
var Spacebars = Package.spacebars.Spacebars;
var HTML = Package.htmljs.HTML;

/* Package-scope variables */
var CollectionName, DocumentPosition, CurrentCollection, CollectionCount, CurrentDocument, DocumentID, sessionKey, ValidatedCurrentDocument, list, docID, docIndex, currentDoc, newPosition, MongolEditingStatus, current, content, a, b, self, updData, newId, Mongol;

var require = meteorInstall({"node_modules":{"meteor":{"msavin:mongol":{"client":{"main.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/msavin_mongol/client/main.js                                                                               //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  Mongol: () => Mongol
});
let ToyKit;
module.link("meteor/meteortoys:toykit", {
  ToyKit(v) {
    ToyKit = v;
  }

}, 0);
let Mongol;
module.link("../lib/index.js", {
  Mongol(v) {
    Mongol = v;
  }

}, 1);
module.link("./_component");
module.link("./doc_controls");
module.link("./doc_editor");
module.link("./doc_insert");
module.link("./row_account");
module.link("./row_collection");
module.link("./row_header");
module.link("./row_trash");
module.link("./main.html");
module.link("./style/Mongol.css");
Meteor.startup(function () {
  Mongol.detectCollections();
  Mongol.hideMeteor();
  Mongol.hideVelocity();
  Mongol.hideMeteorToys();
});
Template.Mongol.helpers({
  Mongol_collections: function () {
    var config = ToyKit.get("Mongol");
    return config.collections || [];
  },
  active: function () {
    var active = ToyKit.get("Mongol_currentCollection");
    return active && "Mongol_expand";
  }
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"main.html":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/msavin_mongol/client/main.html                                                                  //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.link("./template.main.js", { "*": "*+" });

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"template.main.js":function module(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/msavin_mongol/client/template.main.js                                                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //

Template.__checkName("Mongol");
Template["Mongol"] = new Template("Template.Mongol", (function() {
  var view = this;
  return HTML.DIV({
    id: "Mongol",
    class: function() {
      return [ "MeteorToys MeteorToysReset ", Spacebars.mustache(view.lookup("active")) ];
    },
    oncontextmenu: "Package['msavin:mongol'].Mongol.close(); return false;"
  }, "\t\n\t\t", Spacebars.include(view.lookupTemplate("Mongol_header")), "\n\t\t", Spacebars.include(view.lookupTemplate("Mongol_account")), "\n\t\t", Blaze.Each(function() {
    return Spacebars.call(view.lookup("Mongol_collections"));
  }, function() {
    return [ "\n\t\t\t", Spacebars.include(view.lookupTemplate("Mongol_collection")), "\n\t\t" ];
  }), "\n\t\t", Spacebars.include(view.lookupTemplate("Mongol_trash")), "\n\t");
}));

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"_component":{"component.html":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/msavin_mongol/client/_component/component.html                                                  //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.link("./template.component.js", { "*": "*+" });

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"template.component.js":function module(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/msavin_mongol/client/_component/template.component.js                                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //

Template.__checkName("Mongol_Component");
Template["Mongol_Component"] = new Template("Template.Mongol_Component", (function() {
  var view = this;
  return HTML.DIV({
    class: function() {
      return [ "Mongol_row ", Spacebars.mustache(view.lookup("active")) ];
    },
    id: function() {
      return [ "Mongol_c", Spacebars.mustache(view.lookup("name")) ];
    }
  }, "\n\t\t", Blaze._InOuterTemplateScope(view, function() {
    return Spacebars.include(function() {
      return Spacebars.call(view.templateContentBlock);
    });
  }), "\n\t");
}));

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"component.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/msavin_mongol/client/_component/component.js                                                               //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let ToyKit;
module.link("meteor/meteortoys:toykit", {
  ToyKit(v) {
    ToyKit = v;
  }

}, 0);
let Mongol;
module.link("../../lib/index.js", {
  Mongol(v) {
    Mongol = v;
  }

}, 1);
module.link("./component.html");
var _0x11cc = ['Mongol_row_expand', 'Mongol_Component', 'events', 'which', 'equals', 'Mongol_currentCollection', 'name', 'set', 'Mongol_editMode', 'stopPropagation', 'Mongol_preview', 'helpers'];

(function (_0x245f0c, _0x2c3581) {
  var _0xed7f1 = function (_0x5d989a) {
    while (--_0x5d989a) {
      _0x245f0c['push'](_0x245f0c['shift']());
    }
  };

  _0xed7f1(++_0x2c3581);
})(_0x11cc, 0xd9);

var _0x41d4 = function (_0x566ea9, _0x2da093) {
  _0x566ea9 = _0x566ea9 - 0x0;
  var _0x311832 = _0x11cc[_0x566ea9];
  return _0x311832;
};

Template[_0x41d4('0x0')][_0x41d4('0x1')]({
  'click .Mongol_row': function (_0x359155, _0x54bb65) {
    if (_0x359155[_0x41d4('0x2')] === 0x1) {
      if (ToyKit[_0x41d4('0x3')](_0x41d4('0x4'), this[_0x41d4('0x5')])) {
        ToyKit[_0x41d4('0x6')](_0x41d4('0x4'), null);
      } else {
        ToyKit[_0x41d4('0x6')](_0x41d4('0x4'), this[_0x41d4('0x5')]);
      }

      ToyKit[_0x41d4('0x6')](_0x41d4('0x7'), ![]);
    }
  },
  'click .Mongol_contentView': function (_0x3c399b) {
    _0x3c399b[_0x41d4('0x8')]();
  },
  'mouseover .Mongol_row': function () {
    ToyKit[_0x41d4('0x6')](_0x41d4('0x9'), this[_0x41d4('0x5')]);
  }
});

Template[_0x41d4('0x0')][_0x41d4('0xa')]({
  'active': function () {
    if (ToyKit[_0x41d4('0x3')](_0x41d4('0x4'), this[_0x41d4('0x5')])) {
      return _0x41d4('0xb');
    }
  }
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/msavin_mongol/client/_component/index.js                                                                   //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.link("./component.js");
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"doc_controls":{"docControls.html":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/msavin_mongol/client/doc_controls/docControls.html                                              //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.link("./template.docControls.js", { "*": "*+" });

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"template.docControls.js":function module(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/msavin_mongol/client/doc_controls/template.docControls.js                                                  //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //

Template.__checkName("Mongol_docControls");
Template["Mongol_docControls"] = new Template("Template.Mongol_docControls", (function() {
  var view = this;
  return Blaze.If(function() {
    return Spacebars.call(view.lookup("active"));
  }, function() {
    return [ "\n\t\t", HTML.DIV({
      class: function() {
        return [ "Mongol_docMenu ", Spacebars.mustache(view.lookup("Mongol_docMenu_editing")) ];
      }
    }, "\n\t\t\t", Blaze.If(function() {
      return Spacebars.call(view.lookup("account"));
    }, function() {
      return [ "\n\t\t\t\t", HTML.DIV({
        class: "Mongol_docBar1"
      }, "\n\t\t\t\t\t", Blaze.If(function() {
        return Spacebars.call(view.lookup("editing"));
      }, function() {
        return HTML.Raw('\n\t\t\t\t\t\t<div class="Mongol_edit_title">Update Document</div>\n\t\t\t\t\t\t<div class="MeteorToys_action Mongol_edit_save">Save</div>\n\t\t\t\t\t\t<div class="MeteorToys_action Mongol_edit_cancel">Cancel</div>\n\t\t\t\t\t');
      }, function() {
        return HTML.Raw('\t\n\t\t\t\t\t\t\n                        <!--For some reason, the method in place does not work for this\n                        Commenting out for now-->\n                        <div class="MeteorToys_action Mongol_m_edit Mongol_m_updateAccount">Update</div>\n\t\t\t\t\t\t\n\t\t\t\t\t\t<!-- Currently Read-Only -->\n\t\t\t\t\t\t<div class="MeteorToys_action Mongol_m_signout">Sign Out</div>\n\t\t\t\t\t');
      }), "\n\t\t\t\t"), "\n\t\t\t" ];
    }, function() {
      return [ "\n\t\t\t\t", HTML.DIV({
        class: "Mongol_docBar1"
      }, "\n\t\t\t\t\t", Blaze.If(function() {
        return Spacebars.call(view.lookup("editing"));
      }, function() {
        return HTML.Raw('\n\t\t\t\t\t\t<div class="Mongol_edit_title">Update Document</div>\n\t\t\t\t\t\t<div class="MeteorToys_action Mongol_edit_save">Save</div>\n\t\t\t\t\t\t<div class="MeteorToys_action Mongol_edit_cancel">Cancel</div>\n\t\t\t\t\t');
      }, function() {
        return [ HTML.Raw('\n\t\t\t\t\t\t<div class="MeteorToys_action Mongol_m_edit">Update</div>\n\t\t\t\t\t\t<div class="MeteorToys_action Mongol_m_new">Duplicate</div>\n\t\t\t\t\t\t<div class="MeteorToys_action Mongol_m_delete">Remove</div>\n\t\t\t\t\t\t'), HTML.DIV({
          class: function() {
            return [ "MeteorToys_action ", Spacebars.mustache(view.lookup("disable")), " Mongol_m_right" ];
          }
        }, HTML.Raw("&rsaquo;")), "\n\t\t\t\t\t\t", HTML.DIV({
          class: function() {
            return [ "MeteorToys_action ", Spacebars.mustache(view.lookup("disable")), " Mongol_m_left" ];
          }
        }, HTML.Raw("&lsaquo;")), "\n\t\t\t\t\t" ];
      }), "\n\t\t\t\t"), "\n\t\t\t" ];
    }), "\t\n\t\t"), "\n\t" ];
  }, function() {
    return HTML.Raw('\n\t\t<div class="Mongol_docMenu">\n\t\t\t<div class="Mongol_docBar1">\n\t\t\t\t&nbsp;\n\t\t\t</div>\n\t\t</div>\n\t');
  });
}));

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"docControls.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/msavin_mongol/client/doc_controls/docControls.js                                                           //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let ToyKit;
module.link("meteor/meteortoys:toykit", {
  ToyKit(v) {
    ToyKit = v;
  }

}, 0);
let Mongol;
module.link("../../lib/index.js", {
  Mongol(v) {
    Mongol = v;
  }

}, 1);
module.link("./docControls.html");

// needs to be re-thought
// Strip out functions in case documents have had methods added to them
var _validateDocument = function (doc) {
  var validatedDoc = {};
  return validatedDoc;
  Object.keys(doc).forEach(function (val, key) {
    if (typeof val === "function") {
      return;
    }

    validatedDoc[key] = val;
  }); // _.each(doc, function (val, key) {
  //   if (_.isFunction(val)) {
  //     return;
  //   }
  //   validatedDoc[key] = val;
  // });

  return validatedDoc;
};

Mongol.inlineEditingTimer = null;

Mongol.resetInlineEditingTimer = function () {
  if (Mongol.inlineEditingTimer) {
    Meteor.clearTimeout(Mongol.inlineEditingTimer);
  }

  ToyKit.set('Mongol_noInlineEditing', true);
  Mongol.inlineEditingTimer = Meteor.setTimeout(function () {
    ToyKit.set('Mongol_noInlineEditing', false);
  }, 300);
};

Template.Mongol_docControls.events({
  'click .Mongol_m_new': function () {
    CollectionName = ToyKit.get("Mongol_currentCollection"), DocumentPosition = ToyKit.get("Mongol_" + String(this)), CurrentCollection = ToyKit.collection.get(CollectionName).find({}, {
      transform: null
    }).fetch(), CollectionCount = ToyKit.collection.get(CollectionName).find().count(), CurrentDocument = CurrentCollection[DocumentPosition], DocumentID = CurrentDocument._id, sessionKey = "Mongol_" + String(this), ValidatedCurrentDocument = _validateDocument(CurrentDocument);
    Meteor.call("Mongol_duplicate", CollectionName, DocumentID, function (error, result) {
      if (!error) {
        if (Mongol.Collection(CollectionName).findOne(result)) {
          // Get position of new document
          list = Mongol.Collection(CollectionName).find({}, {
            transform: null
          }).fetch(), docID = result, currentDoc;
          docIndex = list.map(function (obj, index) {
            if (obj._id === docID) {
              currentDoc = index;
            }
          });
          ToyKit.set(sessionKey, Number(currentDoc));
        }
      } else {
        Mongol.error("duplicate");
      }
    });
  },
  'click .Mongol_m_edit': function () {
    ToyKit.set("Mongol_editMode", true);
  },
  'click .Mongol_m_delete': function () {
    var CollectionName = ToyKit.get("Mongol_currentCollection"),
        sessionKey = "Mongol_" + String(this);
    DocumentPosition = ToyKit.get(sessionKey), CurrentCollection = Mongol.Collection(CollectionName).find({}, {
      transform: null
    }).fetch(), CollectionCount = Mongol.Collection(CollectionName).find().count();
    var CurrentDocument = CurrentCollection[DocumentPosition],
        DocumentID = CurrentDocument._id;
    Meteor.call('Mongol_remove', CollectionName, DocumentID, function (error, result) {
      if (!error) {
        // Log the action
        if (ToyKit.shouldLog()) {
          console.log("Removed " + DocumentID + " from " + CollectionName + ". Back-up below:");
          console.log(CurrentDocument);
        } // Adjust the position


        if (DocumentPosition >= CollectionCount - 1) {
          newPosition = DocumentPosition - 1;
          ToyKit.set(sessionKey, newPosition);
        }

        if (ToyKit.get(sessionKey) === -1) {
          ToyKit.set(sessionKey, 0);
        }
      } else {
        Mongol.error("remove");
      }
    });
  },
  'click .Mongol_m_right': function (e, t) {
    // Disable inline editing for 0.3s for quick flick to next doc
    Mongol.resetInlineEditingTimer();
    var sessionKey = "Mongol_" + String(this);
    var CurrentDocument = ToyKit.get(sessionKey);
    var collectionName = String(this);
    var collectionVar = Mongol.Collection(collectionName);
    var collectionCount = collectionVar.find().count() - 1;

    if (CurrentDocument > collectionCount) {
      ToyKit.set(sessionKey, 0);
      return;
    }

    if (collectionCount === CurrentDocument) {
      // Go back to document 1 
      ToyKit.set(sessionKey, 0);
    } else {
      // Go to next document
      var MongolDocNumber = ToyKit.get(sessionKey) + 1;
      ToyKit.set(sessionKey, MongolDocNumber);
    }
  },
  'click .Mongol_m_left': function (e, t) {
    // Disable inline editing for 0.3s for quick flick to next doc
    Mongol.resetInlineEditingTimer();
    sessionKey = "Mongol_" + String(this);
    var CurrentDocument = ToyKit.get(sessionKey);
    var collectionName = String(this);
    var collectionVar = Mongol.Collection(collectionName);
    var collectionCount = collectionVar.find().count() - 1;

    if (CurrentDocument > collectionCount) {
      ToyKit.set(sessionKey, collectionCount);
      return;
    }

    if (ToyKit.get(sessionKey) === 0) {
      ToyKit.set(sessionKey, collectionCount);
    } else {
      var MongolDocNumber = ToyKit.get(sessionKey) - 1;
      ToyKit.set(sessionKey, MongolDocNumber);
    }
  },
  'click .Mongol_edit_save': function () {
    // Get current document to get its current state
    // We need to send this to the server so we know which fields are up for change
    // when applying the diffing algorithm
    var collectionName = ToyKit.equals("Mongol_currentCollection", "account_618") ? "users" : String(this);

    if (ToyKit.equals("Mongol_currentCollection", "account_618")) {
      var newData = Mongol.getDocumentUpdate("account_618");
      var newObject = Mongol.parse(newData);
      var oldObject = Meteor.user();
    } else {
      var sessionKey = "Mongol_" + collectionName;
      DocumentPosition = ToyKit.get(sessionKey), CurrentCollection = Mongol.Collection(collectionName).find({}, {
        transform: null
      }).fetch();
      var newData = Mongol.getDocumentUpdate(collectionName);
      var newObject = Mongol.parse(newData);
      var oldObject = CurrentCollection[DocumentPosition];
    }

    if (newObject) {
      Meteor.call("Mongol_update", collectionName, newObject, _validateDocument(oldObject), function (error, result) {
        if (!error) {
          ToyKit.set('Mongol_editMode', null);
        } else {
          Mongol.error('update');
        }
      });
    }
  },
  'click .Mongol_edit_cancel': function () {
    ToyKit.set('Mongol_editMode', null);
  },
  'click .Mongol_m_signout': function () {
    Meteor.logout();
    ToyKit.set("Mongol_currentCollection", null);
  }
});
Template.Mongol_docControls.helpers({
  disable: function () {
    var sessionKey = "Mongol_" + String(this);
    var CurrentDocument = ToyKit.get(sessionKey);
    var collectionName = String(this);
    var collectionVar = Mongol.Collection(collectionName);
    var collectionCount = collectionVar.find().count();

    if (CurrentDocument >= 1) {
      return;
    }

    if (collectionCount === 1) {
      return "MeteorToys_disabled";
    }
  },
  editing: function () {
    var editing = ToyKit.get('Mongol_editMode');
    return editing;
  },
  editing_class: function () {
    var edit = ToyKit.get('Mongol_editMode');

    if (edit) {
      return "Mongol_m_wrapper_expand";
    }
  },
  Mongol_docMenu_editing: function () {
    var editMode = ToyKit.get("Mongol_editMode");

    if (editMode) {
      return "Mongol_docMenu_editing";
    }
  },
  active: function () {
    var current = ToyKit.get("Mongol_currentCollection"); // return true if collection name matches

    if (current === String(this)) {
      return true;
    } // return true if it's a user account


    if (current === "account_618") {
      return true;
    }
  },
  account: function () {
    var currentCollection = ToyKit.get("Mongol_currentCollection");

    if (currentCollection === "account_618") {
      return true;
    } else {
      return false;
    }
  }
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/msavin_mongol/client/doc_controls/index.js                                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.link("./docControls.js");
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"doc_editor":{"docViewer.html":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/msavin_mongol/client/doc_editor/docViewer.html                                                  //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.link("./template.docViewer.js", { "*": "*+" });

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"template.docViewer.js":function module(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/msavin_mongol/client/doc_editor/template.docViewer.js                                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //

Template.__checkName("Mongol_docViewer");
Template["Mongol_docViewer"] = new Template("Template.Mongol_docViewer", (function() {
  var view = this;
  return Blaze.If(function() {
    return Spacebars.call(view.lookup("notEmpty"));
  }, function() {
    return [ "\n    ", Spacebars.include(view.lookupTemplate("Mongol_docControls")), "\n    ", Spacebars.With(function() {
      return Spacebars.call(view.lookup("activeDocument"));
    }, function() {
      return [ "\n      ", Blaze.If(function() {
        return Spacebars.call(view.lookup("editStyle"));
      }, function() {
        return [ "\n        ", HTML.DIV({
          class: function() {
            return [ "Mongol_documentViewer ", Spacebars.mustache(view.lookup("editStyle")) ];
          },
          id: function() {
            return [ "MongolDoc_", Spacebars.mustache(view.lookup("..")) ];
          },
          contenteditable: function() {
            return Spacebars.mustache(view.lookup("editContent"));
          }
        }, "  \n          ", HTML.PRE({
          spellcheck: "false"
        }, Blaze.View("lookup:normalJSON", function() {
          return Spacebars.makeRaw(Spacebars.mustache(view.lookup("normalJSON")));
        })), "\n        "), "\n      " ];
      }, function() {
        return [ "\n        ", HTML.DIV({
          class: function() {
            return [ "Mongol_documentViewer ", Spacebars.mustache(view.lookup("editStyle")) ];
          },
          id: function() {
            return [ "MongolDoc_", Spacebars.mustache(view.lookup("..")) ];
          },
          contenteditable: function() {
            return Spacebars.mustache(view.lookup("editContent"));
          }
        }, "  \n            ", HTML.PRE({
          spellcheck: "false"
        }, Blaze.View("lookup:editableJSON", function() {
          return Spacebars.makeRaw(Spacebars.mustache(view.lookup("editableJSON")));
        })), "\n        "), "\n      " ];
      }), "\n    " ];
    }, function() {
      return [ "\n      ", HTML.DIV({
        class: "Mongol_documentViewer",
        id: function() {
          return [ "MongolDoc_", Spacebars.mustache(view.lookup(".")) ];
        }
      }, HTML.Raw("  \n        <pre>No document found</pre>\n      ")), "\n    " ];
    }), "\n  " ];
  }, function() {
    return [ "\n    ", Spacebars.include(view.lookupTemplate("Mongol_docInsert")), "\n  " ];
  });
}));

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"docViewer.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/msavin_mongol/client/doc_editor/docViewer.js                                                               //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let ToyKit;
module.link("meteor/meteortoys:toykit", {
  ToyKit(v) {
    ToyKit = v;
  }

}, 0);
let Mongol;
module.link("../../lib/index.js", {
  Mongol(v) {
    Mongol = v;
  }

}, 1);
module.link("./docViewer.html");
var _0x55aa = ['get', 'Mongol_editable', 'count', 'Mongol_docViewer', 'helpers', 'collection', 'find', 'fetch', 'stringify', 'colorizeEditable', 'Mongol_editMode', 'true'];

(function (_0x40a809, _0x20bb5f) {
  var _0x460eed = function (_0x4620db) {
    while (--_0x4620db) {
      _0x40a809['push'](_0x40a809['shift']());
    }
  };

  _0x460eed(++_0x20bb5f);
})(_0x55aa, 0xab);

var _0x4802 = function (_0x363989, _0x25b008) {
  _0x363989 = _0x363989 - 0x0;
  var _0x230a1d = _0x55aa[_0x363989];
  return _0x230a1d;
};

Template[_0x4802('0x0')][_0x4802('0x1')]({
  'activeDocument': function () {
    var _0x4ab4ae = String(this);

    var _0xa54ce9 = ToyKit[_0x4802('0x2')]['get'](_0x4ab4ae);

    var _0x37e65c = _0xa54ce9[_0x4802('0x3')]({}, {
      'transform': null
    })[_0x4802('0x4')]();

    var _0x368ab5 = 'Mongol_' + String(this);

    var _0x55e50f = ToyKit['get'](_0x368ab5);

    var _0x1c8501 = _0x37e65c[_0x55e50f];
    return _0x1c8501;
  },
  'editableJSON': function () {
    var _0x1c24a1 = this;

    var _0x20d7b9 = JSON[_0x4802('0x5')](_0x1c24a1, null, 0x2),
        _0x49091f;

    if (!(_0x20d7b9 === undefined)) {
      _0x49091f = ToyKit[_0x4802('0x6')](_0x20d7b9);
    } else {
      _0x49091f = _0x20d7b9;
    }

    return _0x49091f;
  },
  'normalJSON': function () {
    var _0x22ec8a = this,
        _0x1a915f = JSON[_0x4802('0x5')](_0x22ec8a, null, 0x2);

    return _0x1a915f;
  },
  'editContent': function () {
    var _0x13131f = ToyKit['get'](_0x4802('0x7'));

    if (_0x13131f) {
      return _0x4802('0x8');
    }
  },
  'editStyle': function () {
    var _0x40f340 = ToyKit[_0x4802('0x9')](_0x4802('0x7'));

    if (_0x40f340) {
      return _0x4802('0xa');
    }
  },
  'notEmpty': function () {
    var _0x584a18 = String(this);

    var _0x4e3ad7 = ToyKit[_0x4802('0x2')][_0x4802('0x9')](_0x584a18);

    var _0x5482fd = _0x4e3ad7[_0x4802('0x3')]()[_0x4802('0xb')]() || 0x0;

    if (_0x5482fd >= 0x1) {
      return !![];
    }
  }
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/msavin_mongol/client/doc_editor/index.js                                                                   //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.link("./docViewer.js");
module.link("./inline.js");
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"inline.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/msavin_mongol/client/doc_editor/inline.js                                                                  //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let ToyKit;
module.link("meteor/meteortoys:toykit", {
  ToyKit(v) {
    ToyKit = v;
  }

}, 0);
let Mongol;
module.link("../../lib/index.js", {
  Mongol(v) {
    Mongol = v;
  }

}, 1);
var _0x4cee = ['set', 'Mongol_backup', '#MongolDoc_', '#Mongol_c', 'text', 'string', 'exec', 'parse', 'restoreBackup', 'equals', 'account_618', 'users', 'getDocumentUpdate', 'getData', 'user', 'Mongol_', 'Collection', 'find', 'object', 'call', 'Mongol_update', 'error', 'update', '.MeteorToys_inline', 'keydown', 'keyCode', 'preventDefault', 'blur', 'getSelection', 'empty', 'removeAllRanges', 'selection', 'Mongol_docViewer', 'Mongol_editMode', 'updateData', 'removeTextSelection', 'bindHotkeys', 'createBackup', 'stopPropagation', 'keys', 'forEach', 'InlineEditor', 'get', 'Mongol_currentCollection', 'html'];

(function (_0xa3a788, _0x1a6364) {
  var _0x325d0f = function (_0x3e4e66) {
    while (--_0x3e4e66) {
      _0xa3a788['push'](_0xa3a788['shift']());
    }
  };

  _0x325d0f(++_0x1a6364);
})(_0x4cee, 0x1bc);

var _0x4494 = function (_0x2f3e31, _0x3a89c9) {
  _0x2f3e31 = _0x2f3e31 - 0x0;
  var _0x2c6db2 = _0x4cee[_0x2f3e31];
  return _0x2c6db2;
};

MongolEditingStatus = ![];

var _validateDocument = function (_0x50c8ec) {
  var _0x1934bf = {};
  return _0x1934bf;

  Object[_0x4494('0x0')](_0x50c8ec)[_0x4494('0x1')](function (_0x1c78dc, _0x62c612) {
    if (typeof _0x1c78dc === 'function') {
      return;
    }

    _0x1934bf[_0x62c612] = _0x1c78dc;
  });

  return _0x1934bf;
};

Mongol[_0x4494('0x2')] = {
  'createBackup': function () {
    current = ToyKit[_0x4494('0x3')](_0x4494('0x4'));
    content = $('#MongolDoc_' + current)[_0x4494('0x5')]();

    ToyKit[_0x4494('0x6')](_0x4494('0x7'), content);
  },
  'restoreBackup': function () {
    current = ToyKit[_0x4494('0x3')](_0x4494('0x4'));
    content = ToyKit[_0x4494('0x3')](_0x4494('0x7'));
    $(_0x4494('0x8') + current)['html'](content);
  },
  'clearBackup': function () {
    ToyKit[_0x4494('0x6')]('Mongol_backup', null);
  },
  'getData': function () {
    var _0x242008 = ToyKit[_0x4494('0x3')](_0x4494('0x4')),
        _0x1b5358 = $(_0x4494('0x9') + _0x242008 + '\x20pre')[_0x4494('0xa')]();

    var _0x248719 = null;

    try {
      var _0x322a9a = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*))(?:Z|(\+|-)([\d|:]*))?$/;

      var _0x43f253 = function (_0x212edf, _0x57e8b6) {
        if (typeof _0x57e8b6 === _0x4494('0xb')) {
          var _0x4350b2 = _0x322a9a[_0x4494('0xc')](_0x57e8b6);

          if (_0x4350b2) {
            return new Date(_0x57e8b6);
          }
        }

        return _0x57e8b6;
      };

      _0x248719 = ToyKit[_0x4494('0xd')](_0x1b5358, _0x43f253);
    } catch (_0x43308d) {
      Mongol[_0x4494('0x2')][_0x4494('0xe')]();
    }

    return _0x248719;
  },
  'updateData': function () {
    var _0x16d0c5 = ToyKit[_0x4494('0xf')]('Mongol_currentCollection', _0x4494('0x10')) ? _0x4494('0x11') : ToyKit[_0x4494('0x3')](_0x4494('0x4')),
        _0x2109ab,
        _0x28f973,
        _0x4b0105;

    if (ToyKit[_0x4494('0xf')](_0x4494('0x4'), _0x4494('0x10'))) {
      _0x4b0105 = Mongol[_0x4494('0x12')]('account_618');
      _0x28f973 = Mongol[_0x4494('0x2')][_0x4494('0x13')]();
      _0x2109ab = Meteor[_0x4494('0x14')]();
    } else {
      var _0x1dde77 = _0x4494('0x15') + _0x16d0c5;

      DocumentPosition = ToyKit[_0x4494('0x3')](_0x1dde77), CurrentCollection = Mongol[_0x4494('0x16')](_0x16d0c5)[_0x4494('0x17')]({}, {
        'transform': null
      })['fetch']();
      _0x4b0105 = Mongol[_0x4494('0x12')](_0x16d0c5);
      _0x28f973 = Mongol[_0x4494('0x2')][_0x4494('0x13')]();
      _0x2109ab = CurrentCollection[DocumentPosition];
    }

    delete _0x28f973[''];
    delete _0x28f973['\x20'];

    if (typeof _0x28f973 === _0x4494('0x18')) {
      Meteor[_0x4494('0x19')](_0x4494('0x1a'), _0x16d0c5, _0x28f973, _0x2109ab, function (_0x5e15e9, _0x2f22df) {
        if (!_0x5e15e9) {} else {
          Mongol[_0x4494('0x1b')](_0x4494('0x1c'));

          Mongol[_0x4494('0x2')][_0x4494('0xe')]();
        }
      });
    }
  },
  'bindHotkeys': function () {
    $(_0x4494('0x1d'))[_0x4494('0x1e')](function (_0xa3c167) {
      if (_0xa3c167[_0x4494('0x1f')] == 0xa || _0xa3c167['keyCode'] == 0xd) {
        _0xa3c167[_0x4494('0x20')]();

        $('.MeteorToys_inline:focus')[_0x4494('0x21')]();
      }

      if (_0xa3c167[_0x4494('0x1f')] == 0x1b) {
        Mongol[_0x4494('0x2')][_0x4494('0xe')]();

        $('.MeteorToys_inline:focus')[_0x4494('0x21')]();
      }
    });
  },
  'removeTextSelection': function () {
    if (window[_0x4494('0x22')]) {
      if (window[_0x4494('0x22')]()[_0x4494('0x23')]) {
        window['getSelection']()['empty']();
      } else if (window['getSelection']()[_0x4494('0x24')]) {
        window[_0x4494('0x22')]()[_0x4494('0x24')]();
      }
    } else if (document['selection']) {
      document[_0x4494('0x25')][_0x4494('0x23')]();
    }
  }
};

Template[_0x4494('0x26')]['events']({
  'dblclick .Mongol_documentViewer': function () {
    ToyKit['set'](_0x4494('0x27'), !![]);
  },
  'focusout .MeteorToys_inline': function () {
    try {
      a = Mongol[_0x4494('0x2')][_0x4494('0x28')]();
      b = Mongol[_0x4494('0x2')][_0x4494('0x29')]();
    } catch (_0x2eac51) {}
  },
  'focusin .MeteorToys_inline': function () {
    a = Mongol[_0x4494('0x2')][_0x4494('0x2a')]();
    b = Mongol[_0x4494('0x2')][_0x4494('0x2b')]();
  },
  'dblclick .MeteorToys_inline': function (_0x2e212b, _0x25e06f) {
    _0x2e212b[_0x4494('0x2c')]();
  }
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"doc_insert":{"docInsert.html":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/msavin_mongol/client/doc_insert/docInsert.html                                                  //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.link("./template.docInsert.js", { "*": "*+" });

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"template.docInsert.js":function module(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/msavin_mongol/client/doc_insert/template.docInsert.js                                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //

Template.__checkName("Mongol_docInsert");
Template["Mongol_docInsert"] = new Template("Template.Mongol_docInsert", (function() {
  var view = this;
  return [ HTML.Raw('<div class="Mongol_docMenu">\n\t\t<div class="MeteorToys_action Mongol_docMenu_insert" style="float: right">Submit</div>\n\t\t&nbsp;Insert a Document\n\t</div>\n\n\t'), HTML.DIV({
    class: "Mongol_documentViewer ",
    id: function() {
      return [ "Mongol_", Spacebars.mustache(view.lookup(".")), "_newEntry" ];
    },
    tabindex: "-1",
    contenteditable: "true"
  }, HTML.Raw("\t\n<pre>{\n\n}</pre>\n\n\t")) ];
}));

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"docInsert.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/msavin_mongol/client/doc_insert/docInsert.js                                                               //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let ToyKit;
module.link("meteor/meteortoys:toykit", {
  ToyKit(v) {
    ToyKit = v;
  }

}, 0);
let Mongol;
module.link("../../lib/index.js", {
  Mongol(v) {
    Mongol = v;
  }

}, 1);
module.link("./docInsert.html");
Template.Mongol_docInsert.events({
  'click .Mongol_docMenu_insert': function (e, t) {
    var CollectionName = String(this),
        newDataID = "Mongol_" + String(this) + "_newEntry",
        newData = document.getElementById(newDataID).textContent,
        newObject = ToyKit.parse(newData);

    if (newObject) {
      Meteor.call('Mongol_insert', CollectionName, newObject, function (error, result) {
        if (!error) {
          sessionKey = "Mongol_" + CollectionName;
          ToyKit.set(sessionKey, 0);
          alert("Document successfully inserted.");
        } else {
          Mongol.error("insert");
        }
      });
    }
  }
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/msavin_mongol/client/doc_insert/index.js                                                                   //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.link("./docInsert.js");
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"row_account":{"account.html":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/msavin_mongol/client/row_account/account.html                                                   //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.link("./template.account.js", { "*": "*+" });

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"template.account.js":function module(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/msavin_mongol/client/row_account/template.account.js                                                       //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //

Template.__checkName("Mongol_account");
Template["Mongol_account"] = new Template("Template.Mongol_account", (function() {
  var view = this;
  return Blaze._TemplateWith(function() {
    return {
      name: Spacebars.call("account_618")
    };
  }, function() {
    return Spacebars.include(view.lookupTemplate("Mongol_Component"), function() {
      return [ HTML.Raw("\n\n\t\t\t<!-- Display sign in status -->\n\t\t\t"), Blaze.If(function() {
        return Spacebars.call(view.lookup("currentUser"));
      }, function() {
        return HTML.Raw('\n\t\t\t\t<div class="Mongol_account_state MeteorToys-background-green"></div>\n\t\t\t');
      }, function() {
        return HTML.Raw('\n\t\t\t\t<div class="Mongol_account_state MeteorToys-background-red"></div>\n\t\t\t');
      }), HTML.Raw('\n\n\t\t\t<!-- Row Name -->\n\t\t\t<div class="Mongol_icon Mongol_icon_user"></div>\n\t\t\tAccount\n     \n        '), HTML.DIV({
        class: "Mongol_contentView"
      }, HTML.Raw("\n\n\t\t\t<!-- Document Viewer -->\n\t\t\t"), Blaze.If(function() {
        return Spacebars.call(view.lookup("currentUser"));
      }, function() {
        return [ "\n\t\t\t\t", Spacebars.include(view.lookupTemplate("Mongol_accountViewer")), "\n\t\t\t" ];
      }, function() {
        return [ "\n\t\t\t\t", Spacebars.include(view.lookupTemplate("Mongol_accountViewer_notSignedIn")), "\n\t\t\t" ];
      }), "\n\n\t\t"), "\n\n\t" ];
    });
  });
}));

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"account.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/msavin_mongol/client/row_account/account.js                                                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.link("./account.html");
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"accountViewer.html":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/msavin_mongol/client/row_account/accountViewer.html                                             //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.link("./template.accountViewer.js", { "*": "*+" });

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"template.accountViewer.js":function module(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/msavin_mongol/client/row_account/template.accountViewer.js                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //

Template.__checkName("Mongol_accountViewer");
Template["Mongol_accountViewer"] = new Template("Template.Mongol_accountViewer", (function() {
  var view = this;
  return [ Spacebars.include(view.lookupTemplate("Mongol_docControls")), "\n\t", HTML.DIV({
    id: "MongolDoc_account_618",
    class: function() {
      return [ "Mongol_documentViewer ", Spacebars.mustache(view.lookup("editStyle")) ];
    },
    contenteditable: function() {
      return Spacebars.mustache(view.lookup("editContent"));
    }
  }, "\t\n", HTML.PRE(Blaze.View("lookup:accountData", function() {
    return Spacebars.makeRaw(Spacebars.mustache(view.lookup("accountData")));
  })), "\n\t") ];
}));

Template.__checkName("Mongol_accountViewer_notSignedIn");
Template["Mongol_accountViewer_notSignedIn"] = new Template("Template.Mongol_accountViewer_notSignedIn", (function() {
  var view = this;
  return HTML.Raw('<div class="Mongol_docMenu">\n\t\t\t<div class="Mongol_docBar1" style="text-indent: 8px">\n\t\t\t\tNot Signed In\n\t\t\t</div>\n\t\t</div>\n\t<div class="Mongol_documentViewer">\t\n\t\tDownload <a href="https://www.meteorcandy.com/?ref=mongol">Meteor Candy</a> to<br>\n\t\tbrowse your accounts and more.\n\t</div>');
}));

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"accountViewer.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/msavin_mongol/client/row_account/accountViewer.js                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let ToyKit;
module.link("meteor/meteortoys:toykit", {
  ToyKit(v) {
    ToyKit = v;
  }

}, 0);
let Mongol;
module.link("../../lib/index.js", {
  Mongol(v) {
    Mongol = v;
  }

}, 1);
module.link("./accountViewer.html");
Template.Mongol_accountViewer.helpers({
  accountData: function () {
    var docCurrent = Meteor.user();
    var json_output = JSON.stringify(docCurrent, null, 2);

    if (ToyKit.get("Mongol_editMode")) {
      return json_output;
    } else {
      return ToyKit.colorizeEditable(json_output);
    }
  },
  editContent: function () {
    return ToyKit.get("Mongol_editMode") && "true";
  },
  editStyle: function () {
    return ToyKit.get("Mongol_editMode") && "Mongol_editable";
  }
});
Template.Mongol_accountViewer.events({
  'dblclick .Mongol_documentViewer': function () {
    ToyKit.set("Mongol_editMode", true);
  },
  'dblclick .MeteorToys_inline': function (e, t) {
    e.stopPropagation();
  },
  'focusout .MeteorToys_inline': function () {
    Mongol_InlineEditor.updateData();
    Mongol_InlineEditor.removeTextSelection(); // console.log("focusedout");
  },
  'focusin .MeteorToys_inline': function () {
    Mongol_InlineEditor.bindHotkeys();
    Mongol_InlineEditor.createBackup();
  }
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/msavin_mongol/client/row_account/index.js                                                                  //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.link("./accountViewer.js");
module.link("./account.js");
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"row_collection":{"collection.html":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/msavin_mongol/client/row_collection/collection.html                                             //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.link("./template.collection.js", { "*": "*+" });

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"template.collection.js":function module(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/msavin_mongol/client/row_collection/template.collection.js                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //

Template.__checkName("Mongol_collection");
Template["Mongol_collection"] = new Template("Template.Mongol_collection", (function() {
  var view = this;
  return Blaze._TemplateWith(function() {
    return {
      name: Spacebars.call(view.lookup("."))
    };
  }, function() {
    return Spacebars.include(view.lookupTemplate("Mongol_Component"), function() {
      return [ HTML.Raw("\n\n\t\t<!-- Collection Count -->\n\t\t"), HTML.DIV({
        class: "Mongol_counter"
      }, "\n\t\t\t", Blaze.If(function() {
        return Spacebars.call(view.lookup("collectionCount"));
      }, function() {
        return [ "\n\t\t\t", HTML.SPAN({
          class: "MongolHide"
        }, Blaze.View("lookup:currentPosition", function() {
          return Spacebars.mustache(view.lookup("currentPosition"));
        }), "/") ];
      }), Blaze.View("lookup:collectionCount", function() {
        return Spacebars.mustache(view.lookup("collectionCount"));
      }), "\n\t\t"), HTML.Raw("\n\n\t\t<!-- Collection Name -->\n\t\t"), HTML.DIV({
        class: "Mongol_row_name"
      }, HTML.Raw('<div class="Mongol_icon Mongol_icon_collection"></div>'), Blaze.View("lookup:.", function() {
        return Spacebars.mustache(view.lookup("."));
      }), Blaze.If(function() {
        return Spacebars.call(view.lookup("xf"));
      }, function() {
        return Blaze.View("lookup:xf", function() {
          return Spacebars.mustache(view.lookup("xf"));
        });
      })), HTML.Raw("\n    \t    \n\t\t<!-- Document Viewer -->\n\t\t"), HTML.DIV({
        class: "Mongol_contentView"
      }, "\n\t\t\t", Spacebars.include(view.lookupTemplate("Mongol_docViewer")), "\n\t\t"), "\n\t\t\n\t" ];
    });
  });
}));

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"collection.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/msavin_mongol/client/row_collection/collection.js                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let ToyKit;
module.link("meteor/meteortoys:toykit", {
  ToyKit(v) {
    ToyKit = v;
  }

}, 0);
let Mongol;
module.link("../../lib/index.js", {
  Mongol(v) {
    Mongol = v;
  }

}, 1);
module.link("./collection.html");
Template.Mongol_collection.onCreated(function () {
  var collectionName = this.data;
  var collection = ToyKit.collection.get(collectionName);
  var query = collection.find();
  this.changes = query.observeChanges({
    added: function () {// console.log("doc added")
    },
    removed: function () {// console.log("doc removed")
    },
    changed: function () {// console.log("doc changed")
    }
  });
});
Template.Mongol_collection.onDestroyed(function () {
  this.changes.stop();
});
Template.Mongol_collection.events({
  'click': function () {
    var targetCollection = String(this);
    var sessionKey = String("Mongol_" + targetCollection);
    ToyKit.setDefault(sessionKey, 0);
  }
});
Template.Mongol_collection.helpers({
  collectionCount: function () {
    var collectionName = String(this);
    var collectionVar = ToyKit.collection.get(collectionName);
    var count = collectionVar.find().count() || 0;
    return count;
  },
  currentPosition: function () {
    var targetCollection = String(this);
    var sessionKey = "Mongol_" + targetCollection;
    var current = ToyKit.get(sessionKey);
    var count = current + 1;
    return count;
  }
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/msavin_mongol/client/row_collection/index.js                                                               //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.link("./collection.js");
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"row_header":{"header.html":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/msavin_mongol/client/row_header/header.html                                                     //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.link("./template.header.js", { "*": "*+" });

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"template.header.js":function module(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/msavin_mongol/client/row_header/template.header.js                                                         //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //

Template.__checkName("Mongol_header");
Template["Mongol_header"] = new Template("Template.Mongol_header", (function() {
  var view = this;
  return Blaze._TemplateWith(function() {
    return {
      name: Spacebars.call("cmongol_618")
    };
  }, function() {
    return Spacebars.include(view.lookupTemplate("Mongol_Component"), function() {
      return [ HTML.Raw("\n    <strong>Mongol</strong><br>\n    "), HTML.DIV({
        class: "Mongol_contentView"
      }, HTML.Raw('\n      <!--  -->\n      <div class="Mongol_docMenu" style="text-indent: 8px">\n        Reset a Collection\n      </div>\n      '), HTML.DIV({
        class: "Mongol_documentViewer ",
        style: "padding-top: 0px"
      }, HTML.Raw('\n        <!-- <div class="MeteorToys_row Mongol_Impersonation MeteorToys_row_hoverable" style="margin-top: 0px">\n          Reset All Collections\n        </div> -->\n        <div class="MeteorToys_row Mongol_All MeteorToys_row_hoverable" style="margin-top: 0px; line-height: 20px">\n          All Collections + localStorage\n        </div>\n        <div class="MeteorToys_row Mongol_MeteorToys MeteorToys_row_hoverable" style="margin-top: 0px; line-height: 20px">\n          Meteor Toys\n        </div>\n        <div class="MeteorToys_row Mongol_Impersonation MeteorToys_row_hoverable" style="margin-top: 0px; line-height: 20px">\n          Authenticate Toy\n        </div>\n        '), Blaze.Each(function() {
        return Spacebars.call(view.lookup("collection"));
      }, function() {
        return [ "\n          ", Blaze.If(function() {
          return Spacebars.call(view.lookup("."));
        }, function() {
          return [ "\n            ", HTML.DIV({
            class: "MeteorToys_row MeteorToys_row_reset MeteorToys_row_hoverable",
            style: "margin-top: 0px; line-height: 20px"
          }, "\n              ", Blaze.View("lookup:.", function() {
            return Spacebars.mustache(view.lookup("."));
          }), " \n            "), "\n          " ];
        }), "\n        " ];
      }), "\n      "), "\n    "), "\n  " ];
    });
  });
}));

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"header.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/msavin_mongol/client/row_header/header.js                                                                  //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let ToyKit;
module.link("meteor/meteortoys:toykit", {
  ToyKit(v) {
    ToyKit = v;
  }

}, 0);
let Mongol;
module.link("../../lib/index.js", {
  Mongol(v) {
    Mongol = v;
  }

}, 1);
module.link("./header.html");
Template.Mongol_header.helpers({
  collection: function () {
    return [];
  }
});
Template.Mongol_header.events({
  'click .MeteorToys_row_reset': function () {
    self = String(this);

    if (confirm('This will permanently remove all the documents in ' + self + '.')) {
      Meteor.call('Mongol_resetCollection', self, function (e, r) {
        if (e) {
          alert("Sorry, there was an error removing " + self + '.');
        }
      });
    }
  },
  'click .MeteorToys_row_reset_all': function () {
    if (confirm('This will permanently remove all the documents in your collections.')) {
      Meteor.call('Mongol_resetCollections', self, function (e, r) {
        if (e) {
          alert("Sorry, there was an error removing your collections.");
        }
      });
    }
  },
  'click .Mongol_Impersonation': function () {
    self = "MeteorToys.Impersonate";

    if (confirm('This will reset your Authentication recents list')) {
      Meteor.call('Mongol_resetCollection', self, function (e, r) {
        if (e) {
          alert("Sorry, there was an error removing " + self + '.');
        }
      });
    }
  },
  'click .Mongol_MeteorToys': function () {
    if (confirm('This will reset all your Meteor Toys data.')) {
      Meteor.call('Mongol_resetMeteorToys', self, function (e, r) {// if (e) {
        // alert("Sorry, there was an error removing " + self + '.')
        // }
      });
    }
  },
  'click .Mongol_All': function () {
    if (confirm('This will reset all your Meteor collections and localStorage.')) {
      Meteor.call('Mongol_resetAll', function (e, r) {
        if (e) {
          alert("Sorry, there was an error removing " + self + '.');
        }

        if (r) {
          MeteorToys.clear();
          window.location.reload();
        }
      });
    }
  }
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/msavin_mongol/client/row_header/index.js                                                                   //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.link("./header.js");
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"row_trash":{"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/msavin_mongol/client/row_trash/index.js                                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.link("./main.js");
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"main.html":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/msavin_mongol/client/row_trash/main.html                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.link("./template.main.js", { "*": "*+" });

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"template.main.js":function module(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/msavin_mongol/client/row_trash/template.main.js                                                            //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //

Template.__checkName("Mongol_trash");
Template["Mongol_trash"] = new Template("Template.Mongol_trash", (function() {
  var view = this;
  return Blaze._TemplateWith(function() {
    return {
      name: Spacebars.call("trash")
    };
  }, function() {
    return Spacebars.include(view.lookupTemplate("Mongol_Component"), function() {
      return [ "\n\t  \n\t\t", HTML.DIV({
        class: "Mongol_counter"
      }, "\n\t\t\t", Blaze.If(function() {
        return Spacebars.call(view.lookup("collectionCount"));
      }, function() {
        return [ "\n\t\t\t\t", HTML.SPAN({
          class: "MongolHide"
        }, Blaze.View("lookup:currentPosition", function() {
          return Spacebars.mustache(view.lookup("currentPosition"));
        }), "/") ];
      }), Blaze.View("lookup:collectionCount", function() {
        return Spacebars.mustache(view.lookup("collectionCount"));
      }), "\n\t\t"), HTML.Raw('\n\n\t\t<div class="Mongol_row_name"><div class="Mongol_icon Mongol_icon_trash"></div>Trash</div>\n\n\t\t'), Blaze.If(function() {
        return Spacebars.call(view.lookup("collectionCount"));
      }, function() {
        return [ "\n\t\t\t", Spacebars.include(view.lookupTemplate("Mongol_trash_viewer")), "\n\t\t" ];
      }, function() {
        return [ "\n\t\t\t", Spacebars.include(view.lookupTemplate("Mongol_trash_empty")), "\n\t\t" ];
      }), "\n\n\t" ];
    });
  });
}));

Template.__checkName("Mongol_trash_menu");
Template["Mongol_trash_menu"] = new Template("Template.Mongol_trash_menu", (function() {
  var view = this;
  return HTML.DIV({
    class: "Mongol_docMenu"
  }, HTML.Raw('\n\t\t<div class="Mongol_m_edit MeteorToys_action">Restore</div>\n\t\t'), HTML.DIV({
    class: function() {
      return [ Spacebars.mustache(view.lookup("disable_right")), " Mongol_m_right MeteorToys_action" ];
    }
  }, HTML.Raw("&rsaquo;")), "\n\t\t", HTML.DIV({
    class: function() {
      return [ Spacebars.mustache(view.lookup("disable_left")), " Mongol_m_left MeteorToys_action" ];
    }
  }, HTML.Raw("&lsaquo;")), "\n\t");
}));

Template.__checkName("Mongol_trash_viewer");
Template["Mongol_trash_viewer"] = new Template("Template.Mongol_trash_viewer", (function() {
  var view = this;
  return HTML.DIV({
    class: "Mongol_contentView"
  }, "\n\t\t", Spacebars.include(view.lookupTemplate("Mongol_trash_menu")), "\n\t    ", HTML.DIV({
    class: "Mongol_documentViewer"
  }, "\n", HTML.PRE("From ", Blaze.View("lookup:collectionName", function() {
    return Spacebars.mustache(view.lookup("collectionName"));
  }), " ", Blaze.View("lookup:currentDocument", function() {
    return Spacebars.makeRaw(Spacebars.mustache(view.lookup("currentDocument")));
  })), "\n\t    "), "\n\t");
}));

Template.__checkName("Mongol_trash_empty");
Template["Mongol_trash_empty"] = new Template("Template.Mongol_trash_empty", (function() {
  var view = this;
  return HTML.Raw('<div class="Mongol_contentView">\n\t\t<div class="Mongol_docMenu" style="text-indent: 8px">Empty</div>\n\t\t<div class="Mongol_documentViewer">\n<pre>When you remove documents,\nthey will appear here.</pre></div>\n\t</div>');
}));

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"main.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/msavin_mongol/client/row_trash/main.js                                                                     //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let ToyKit;
module.link("meteor/meteortoys:toykit", {
  ToyKit(v) {
    ToyKit = v;
  }

}, 0);
let Mongol;
module.link("../../lib/index.js", {
  Mongol(v) {
    Mongol = v;
  }

}, 1);
module.link("./main.html");
Template.Mongol_trash.events({
  'click': function () {
    if (!ToyKit.get("Mongol_Trash_Count")) {
      ToyKit.set("Mongol_Trash_Count", 0);
    }
  }
});
Template.Mongol_trash.helpers({
  collectionCount: function () {
    var collectionName = "MeteorToys.Mongol";
    var collectionVar = Mongol.Collection(collectionName);
    return collectionVar && collectionVar.find().count() || 0;
  },
  currentPosition: function () {
    var sessionKey = "Mongol_Trash_Count";
    var current = ToyKit.get(sessionKey);
    var count = current + 1;
    return count;
  }
});
Template.Mongol_trash_viewer.helpers({
  currentDocument: function () {
    var collectionName = "MeteorToys.Mongol",
        docNumber = ToyKit.get("Mongol_Trash_Count"),
        doc = ToyKit.collection.get("MeteorToys.Mongol").find().fetch()[docNumber];

    if (doc) {
      delete doc['Mongol_origin'];
      delete doc['Mongol_date'];
      var stringDoc = JSON.stringify(doc, undefined, 2);
      var content = ToyKit.colorize(stringDoc);
      return content;
    }
  },
  collectionName: function () {
    var collectionName = "MeteorToys.Mongol",
        docNumber = ToyKit.get("Mongol_Trash_Count"),
        doc = Package["msavin:mongol"].Mongol.Collection("MeteorToys.Mongol").find().fetch()[docNumber];

    if (doc) {
      return doc.Mongol_origin;
    }
  }
});
Template.Mongol_trash_menu.events({
  'click .Mongol_m_edit': function () {
    var collectionName = "MeteorToys.Mongol",
        docNumber = ToyKit.get("Mongol_Trash_Count"),
        doc = ToyKit.collection.get("MeteorToys.Mongol").find().fetch()[docNumber];
    var targetCollection = String(doc.Mongol_origin);
    var docID = String(doc._id);
    delete doc['Mongol_origin'];
    delete doc['Mongol_date'];
    Meteor.call("Mongol_insert", targetCollection, doc, function (e, r) {
      if (e) {
        alert("There was an error restoring your document.");
      }
    });
    Meteor.call("Mongol_remove", "MeteorToys.Mongol", docID, true, function (e, r) {
      if (e) {
        alert("There was an error removing document from trash,");
      }
    }); // Set the position

    var sessionKey = "Mongol_Trash_Count";
    var CurrentDocument = ToyKit.get(sessionKey);
    var collectionVar = Package["msavin:mongol"].Mongol.Collection("MeteorToys.Mongol");
    var collectionCount = collectionVar.find().count() - 1;

    if (collectionCount === CurrentDocument) {
      var button = document.getElementsByClassName("Mongol_m_left");
      button[0].click();
    }
  },
  'click .Mongol_m_right': function () {
    // Set the key
    var sessionKey = "Mongol_Trash_Count"; // Grab the key

    var CurrentDocument = ToyKit.get(sessionKey);
    var collectionVar = Package["msavin:mongol"].Mongol.Collection("MeteorToys.Mongol");
    var collectionCount = collectionVar.find().count() - 1;

    if (CurrentDocument > collectionCount) {
      ToyKit.set(sessionKey, 0);
      return;
    }

    if (collectionCount === CurrentDocument) {
      // Go back to document 1 
      ToyKit.set(sessionKey, 0);
    } else {
      // Go to next document
      var MongolDocNumber = ToyKit.get(sessionKey) + 1;
      ToyKit.set(sessionKey, MongolDocNumber);
    }
  },
  'click .Mongol_m_left': function () {
    var sessionKey = "Mongol_Trash_Count";
    var CurrentDocument = ToyKit.get(sessionKey);
    var collectionVar = Package["msavin:mongol"].Mongol.Collection("MeteorToys.Mongol");
    var collectionCount = collectionVar.find().count() - 1;

    if (CurrentDocument > collectionCount) {
      ToyKit.set(sessionKey, collectionCount);
      return;
    }

    if (ToyKit.get(sessionKey) === 0) {
      ToyKit.set(sessionKey, collectionCount);
    } else {
      var MongolDocNumber = ToyKit.get(sessionKey) - 1;
      ToyKit.set(sessionKey, MongolDocNumber);
    }
  }
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"style":{"Mongol.css":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/msavin_mongol/client/style/Mongol.css                                                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.exports = require("meteor/modules").addStyles(
  "#Mongol {\n  left: 0;\n  bottom: 0;\n  width: 100%;\n  max-width: 148px;\n  max-height: 100%;\n  overflow: auto;\n  font-size: 14px;\n  box-sizing: border-box; }\n\n#Mongol * {\n  outline: none;\n  box-sizing: border-box; }\n\n#Mongol div {\n  box-sizing: border-box !important;\n  line-height: 28px; }\n\n#Mongol strong {\n  font-weight: bold; }\n\n#Mongol ::-webkit-scrollbar {\n  display: none; }\n\n#Mongol.Mongol_expand {\n  width: 100% !important;\n  max-width: 372px !important; }\n\n.Mongol_expand {\n  z-index: 2147483645 !important; }\n\n/* Row */\n.Mongol_row {\n  padding: 0 7px;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  height: 28px;\n  position: relative;\n  -webkit-transition: all 0.25s;\n  -moz-transition: all 0.25s;\n  -ms-transition: all 0.25s;\n  -o-transition: all 0.25s;\n  transition: all 0.25s;\n  margin-bottom: 1px; }\n\n.Mongol_row_name {\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  overflow: hidden;\n  padding-right: 7px;\n  line-height: 28px;\n  z-index: 9999999999999;\n  position: relative; }\n\n.Mongol_row:last-child {\n  margin-bottom: 0px; }\n\n.Mongol_row:hover {\n  cursor: pointer; }\n\n.MongolHide {\n  max-width: 0px;\n  opacity: 0; }\n\n.Mongol_row_expand {\n  height: 420px;\n  height: 520px;\n  cursor: default !important; }\n\n.Mongol_row_expand .MongolHide {\n  opacity: 1;\n  max-width: auto;\n  overflow: auto; }\n\n.Mongol_row_expand .Mongol_Controls {\n  width: 20px;\n  line-height: 19px;\n  font-size: 22px;\n  height: 20px;\n  border-radius: 50px;\n  background: #fff;\n  /*color: #000 */\n  opacity: 0.2; }\n\n.Mongol_row_expand .Mongol_Controls:hover {\n  cursor: pointer;\n  opacity: 0.6; }\n\n.Mongol_row_expand .Mongol_plus {\n  font-size: 16px;\n  line-height: 19px; }\n\n.Mongol_counter {\n  float: right; }\n\n/* Row > Editing */\n.Mongol_editable {\n  cursor: auto; }\n\n.Mongol_editable span {\n  color: inherit !important; }\n\n.Mongol_contentView {\n  border-radius: 5px;\n  -webkit-transition: all 0.25s !important;\n  -moz-transition: all 0.25s !important;\n  -ms-transition: all 0.25s !important;\n  -o-transition: all 0.25s !important;\n  transition: all 0.25s !important; }\n\n.sMongol_row:active .Mongol_contentView {\n  -webkit-transition: all 0.25s !important;\n  -moz-transition: all 0.25s !important;\n  -ms-transition: all 0.25s !important;\n  -o-transition: all 0.25s !important;\n  transition: all 0.25s !important; }\n\n.MeteorToys_row_remove {\n  float: right; }\n\n.MeteorToys_row_remove:hover {\n  color: #ED8294; }\n\n/* Document Viewer */\n.Mongol_documentViewer {\n  height: 423px;\n  height: 458px;\n  padding: 0 7px;\n  padding-top: 5px;\n  line-height: 20px !important;\n  overflow: auto;\n  border-radius: 0 0 5px 5px;\n  z-index: 9999999998;\n  overflow: scroll;\n  -webkit-transition: all 0.25s !important;\n  -moz-transition: all 0.25s !important;\n  -ms-transition: all 0.25s !important;\n  -o-transition: all 0.25s !important;\n  transition: all 0.25s !important;\n  color: inherit; }\n\n.Mongol_documentViewer_buttons {\n  position: absolute;\n  bottom: 0;\n  right: 0;\n  border-collapse: collapse; }\n\n.Mongol_documentViewer_buttons div {\n  float: right;\n  line-height: 18px;\n  right: 0;\n  margin-right: 5px;\n  margin-top: 5px;\n  padding: 0 4px;\n  padding-top: 2px;\n  border-radius: 3px;\n  font-size: 10px; }\n\n/* Document Menu */\n.Mongol_docMenu {\n  line-height: 28px;\n  height: 28px;\n  border-radius: 5px 5px 0 0;\n  /*color: rgba(255, 255, 255, 0.6) */\n  padding-bottom: 1px;\n  position: relative;\n  /*background: rgba() */\n  /*background-image: url(\"data:image/pngbase64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAAECAAAAACBhLHlAAAAD0lEQVR4AWM0YwAhXRACAAVnAMsAW/K6AAAAAElFTkSuQmCC\") */\n  background: rgba(0, 0, 0, 0.2);\n  background-size: 1px 2px;\n  background-position: 0 -1px;\n  overflow: hidden; }\n\n.Mongol_docMenu .Mongol_docBar1, .Mongol_docMenu .Mongol_docBar2 {\n  position: absolute;\n  top: 0;\n  height: 28px;\n  width: 100%;\n  -webkit-transition: all 0.2s;\n  -moz-transition: all 0.2s;\n  -ms-transition: all 0.2s;\n  -o-transition: all 0.2s;\n  transition: all 0.2s; }\n\n.Mongol_m_left, .Mongol_m_right, .Mongol_m_new, .Mongol_m_edit, .Mongol_m_delete, .Mongol_docMenu_insert {\n  float: left;\n  border-left: 1px solid rgba(0, 0, 0, 0.4);\n  padding: 0 7px; }\n\n.Mongol_m_edit {\n  border-left: 0px solid transparent; }\n\n.Mongol_m_delete {\n  border-right: 1px solid rgba(0, 0, 0, 0.4); }\n\n.Mongol_edit_save, .Mongol_edit_cancel {\n  border-left: 1px solid rgba(0, 0, 0, 0.4);\n  padding: 0 7px;\n  float: right; }\n\n.Mongol_edit_title {\n  float: left;\n  padding-left: 7px; }\n\n.Mongol_m_edit {\n  margin-left: 0px; }\n\n.Mongol_m_left, .Mongol_m_right {\n  float: right !important;\n  font-size: 20px;\n  font-weight: bold;\n  padding: 0 7px !important;\n  border-right: 0px solid transparent;\n  border-left: 1px solid rgba(0, 0, 0, 0.4); }\n\n.Mongol_m_signout, .Mongol_m_signin {\n  border-left: 1px solid rgba(0, 0, 0, 0.4);\n  float: right;\n  padding: 0 7px; }\n\n.Mongol_m_updateAccount {\n  border-right: 1px solid rgba(0, 0, 0, 0.4); }\n\n.Mongol_edit_save:hover, .Mongol_edit_cancel:hover, .Mongol_docMenu_insert:hover, .Mongol_m_signout:hover, .Mongol_m_signin:hover, .Mongol_m_left:hover, .Mongol_m_right:hover, .Mongol_m_new:hover, .Mongol_m_edit:hover, .Mongol_m_delete:hover {\n  /*color: #2CA6E2 */\n  -webkit-transition: all 0.2s;\n  -moz-transition: all 0.2s;\n  -ms-transition: all 0.2s;\n  -o-transition: all 0.2s;\n  transition: all 0.2s;\n  cursor: pointer; }\n\n.Mongol_m_disabled {\n  /*color: rgba(0, 0, 0, 0.4) !important */\n  cursor: default !important;\n  background: transparent !important; \n  pointer-events: none;\n  }\n\n/* Account State Badget */\n.Mongol_account_state {\n  float: right;\n  height: 8px;\n  width: 8px;\n  border-radius: 10px;\n  margin-top: 10px; }\n\n.Mongol_icon {\n  height: 12px;\n  margin: 8px;\n  margin-top: 8px;\n  margin-left: 0px;\n  margin-right: 7px;\n  width: 8px;\n  float: left;\n  background-size: cover;\n  transition: 0.25s; }\n\n.Mongol_icon_user {\n  background-image: url(\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAcCAQAAAApD0ySAAAAvUlEQVR4Aa3TtUIEMRhF4f9l0AZ7UFzamRLp0A53lzrtNLicNXZx4kHvbb/YJCNmGGOGw9fOMCahkFOharVC5qIpylS9lpkw0SDVSCv0aXZMNdojzS4S7EKzywS71KxIsEIzlWDqe0c41mw1wVY1O/q/D/L9Iywl2JLoUImgiphhAQIIFsQOZwF2Jn7SC2p27bCrMFMOUyG0E3i5WyZopp2cUvCkGc00v6AeFrhL/At3zNIpECW6CNXv9H/ZEwS199pi6TzLAAAAAElFTkSuQmCC\"); }\n\n.Mongol_icon_collection {\n  background-image: url(\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAYCAYAAADzoH0MAAAAlklEQVQ4y2NgQAK/fv3SAuJmID4CxG+A+D8Uv4GKgeS0GNABUFAIiJciaSCEQWqFYJpFgfgOCZphGKRHFGTAIjI0w/AikAE/KDDgB1UMoNgLlAUiNaJRAohNSE1IID0gvSDGCiD+BsTFQMzJQACA1EDVgvSsQI+FV0A8BYgDgVgJiAWgWAkqNgWqZjQaR6Nx2EUjpcU6AE0eCbgDO7vlAAAAAElFTkSuQmCC\"); }\n\n.Mongol_icon_trash {\n  background-image: url(\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAYCAQAAABZqbWHAAAAbElEQVQoz6WSSw6AIAxEy+j9Twd1rUfwsyNWI4l1ISWh0x19zGQCoFdZdPQU1BD+bn3d2g5jsKftILtYWkGTacCg5AMiiL0R50xHdb2FBYMYPbg8VuoHYgHYG1HtcXd4gGoP1i+X+oCoADsiLntwZFl5amk9AAAAAElFTkSuQmCC\"); }\n\n.Mongol_icon_local {\n  background-image: url(\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAYCAQAAABZqbWHAAAAtUlEQVR4Ae3QtUElQBQAwD3cnRx3d3qgCCzHOviVYCkxOVIEkuHuzuAuDQA34T7f8ESFiGlbbtzYMi2iIryQZdyNa+cO7dp35My1G+OyHsK55nFsQpcSiWIV6TXpCPNyg1E3FuWHTxRacWMkOEd5+IZWl86fEhq+Tehw6SwYxbI6UR+C0dqtPY3INe/GmWlDaqRK16bfrDM35uW+nAmXTh07cery7cz3HzVj+/NH/aIz/5957w77RZ0qbROaJQAAAABJRU5ErkJggg==\"); }\n\n.Mongol_icon_support {\n  background-image: url(\"../public/Mongol_icon_support.png\"); }\n\n.Mongol_pubsub_button {\n  float: right;\n  border-left: 1px solid rgba(0, 0, 0, 0.36);\n  padding: 0 8px;\n  text-indent: 0px; }\n\n.Mongol_pubsub_button:hover {\n  cursor: pointer; }\n\n.Mongol_pubsub_row {\n  border-bottom: 1px solid rgba(0, 0, 0, 0.36);\n  padding: 0 !important;\n  line-height: 14px !important;\n  margin: 0px !important;\n  position: relative;\n  padding-bottom: 5px !important;\n  font-size: 14px !important; }\n  .Mongol_pubsub_row .MeteorToys_pubsub_row_toggle {\n    float: right; }\n\n.Mongol_pubsub_row_name {\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap; }\n\n.Mongol_pubsub_row_toggle {\n  float: right;\n  font-size: 28px !important;\n  line-height: 44px !important;\n  margin: -4px 0px !important;\n  margin-right: -8px !important;\n  padding: 0 8px !important;\n  padding-top: 8px !important;\n  font-weight: normal; }\n\n.Mongol_pubsub_row_toggle:hover {\n  cursor: pointer; }\n\n.Mongol_buy {\n  display: inline-block;\n  text-decoration: none;\n  border: 0px solid transparent; }\n  .Mongol_buy a {\n    text-decoration: none;\n    border: 0px solid transparent; }\n  .Mongol_buy:active {\n    box-shadow: inset 0 0 0 30px rgba(0, 0, 0, 0.2); }\n\n/*# sourceMappingURL=Mongol.css.map */\n"
);

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}},"lib":{"common.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/msavin_mongol/lib/common.js                                                                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  Mongol: () => Mongol
});
let ToyKit;
module.link("meteor/meteortoys:toykit", {
  ToyKit(v) {
    ToyKit = v;
  }

}, 0);
// Create object and reserve name across the package
var Mongol = {};
module.runSetters(Mongol = {
  'getDocumentUpdate': function (data) {
    var elementID = 'MongolDoc_' + data,
        newData = false;
    updData = document.getElementById(elementID);

    if (updData) {
      newData = updData.textContent;
    }

    return newData;
  },
  'error': function (data) {
    switch (data) {
      case "json.parse":
        alert("There is an error with your JSON syntax.\n\nNote: keys and string values need double quotes.");
        break;

      case "duplicate":
        alert("Strange, there was an error duplicating your document.");
        break;

      case "remove":
        alert("Strange, there was an error removing your document.");
        break;

      case "insert":
        alert("Strange, there was an error inserting your document.");
        break;

      case "update":
        alert("There was an error updating your document. Please review your changes and try again.");
        break;

      default:
        return "Unknown Error";
        break;
    }
  },
  'parse': function (data) {
    return ToyKit.parse(data);
    var newObject = null;

    try {
      var reISO = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*))(?:Z|(\+|-)([\d|:]*))?$/;

      var dateParser = function (key, value) {
        if (typeof value === "string") {
          var a = reISO.exec(value);

          if (a) {
            return new Date(value);
          }
        }

        return value;
      };

      newObject = JSON.parse(data, dateParser);
    } catch (error) {
      Mongol.error("json.parse");
    }

    return newObject;
  },
  'detectCollections': function () {
    var collections = ToyKit.collection.getList();
    var defaults = {
      'collections': collections
    };
    ToyKit.set("Mongol", defaults);
  },
  'hideCollection': function (collectionName) {
    var config = ToyKit.get("Mongol");
    var collections = config.collections;
    config.collections = collections.filter(function (item) {
      return item !== collectionName;
    });
    ToyKit.set("Mongol", config);
  },
  'showCollection': function (collectionName) {
    // In case a collection does not get detected, like a local one
    var MongolConfig = ToyKit.get("Mongol"),
        collections = MongolConfig.collections;
    collections.push(collectionName);
    ToyKit.set("Mongol", MongolConfig);
  },
  'hideVelocity': function () {
    this.hideCollection('velocityTestFiles');
    this.hideCollection('velocityFixtureFiles');
    this.hideCollection('velocityTestReports');
    this.hideCollection('velocityAggregateReports');
    this.hideCollection('velocityLogs');
    this.hideCollection('velocityMirrors');
    this.hideCollection('velocityOptions');
  },
  'hideMeteorToys': function () {
    this.hideCollection("MeteorToys.Impersonate");
    this.hideCollection("MeteorToys.JetSetter");
    this.hideCollection("MeteorToys.Mongol");
    this.hideCollection("MeteorToys.AutoPub");
    this.hideCollection("MeteorToys.Email");
    this.hideCollection("MeteorToys.Result");
    this.hideCollection("MeteorToys.Throttle");
  },
  'hideMeteor': function () {
    this.hideCollection("meteor_accounts_loginServiceConfiguration");
    this.hideCollection("meteor_autoupdate_clientVersions");
  },
  'Collection': function (collectionName) {
    return ToyKit.collection.get(collectionName);
  },
  'insertDoc': function (MongolCollection, documentData) {
    check(MongolCollection, Match.Any);
    check(documentData, Match.Any);

    if (!!Package['aldeed:simple-schema'] && !!Package['aldeed:collection2'] && typeof MongolCollection.simpleSchema === "function" && MongolCollection._c2) {
      // This is to nullify the effects of SimpleSchema/Collection2
      newId = MongolCollection.insert(documentData, {
        filter: false,
        autoConvert: false,
        removeEmptyStrings: false,
        validate: false
      });
    } else {
      newId = MongolCollection.insert(documentData);
    }

    return newId;
  }
});

Mongol.close = function () {
  if (ToyKit.get("Mongol_currentCollection")) {
    ToyKit.set("Mongol_currentCollection", null);
    ToyKit.set("Mongol_editMode", false);
  } else {
    ToyKit.close();
  }
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/msavin_mongol/lib/index.js                                                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  Mongol: () => Mongol
});
let Mongol;
module.link("./common.js", {
  Mongol(v) {
    Mongol = v;
  }

}, 0);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}}},{
  "extensions": [
    ".js",
    ".json",
    ".html",
    ".css"
  ]
});

var exports = require("/node_modules/meteor/msavin:mongol/client/main.js");

/* Exports */
Package._define("msavin:mongol", exports, {
  Mongol: Mongol
});

})();
