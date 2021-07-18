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
var $ = Package.jquery.$;
var jQuery = Package.jquery.jQuery;

(function(){

///////////////////////////////////////////////////////////////////////
//                                                                   //
// packages/ctjp_meteor-intl-tel-input/packages/ctjp_meteor-intl-tel //
//                                                                   //
///////////////////////////////////////////////////////////////////////
                                                                     //
(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/ctjp:meteor-intl-tel-input/lib/intl-tel-input/build/js/intlTelInput.js                                     //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
/*                                                                                                                    // 1
International Telephone Input v3.7.1                                                                                  // 2
https://github.com/Bluefieldscom/intl-tel-input.git                                                                   // 3
*/                                                                                                                    // 4
// wrap in UMD - see https://github.com/umdjs/umd/blob/master/jqueryPlugin.js                                         // 5
(function(factory) {                                                                                                  // 6
    if (typeof define === "function" && define.amd) {                                                                 // 7
        define([ "jquery" ], function($) {                                                                            // 8
            factory($, window, document);                                                                             // 9
        });                                                                                                           // 10
    } else {                                                                                                          // 11
        factory(jQuery, window, document);                                                                            // 12
    }                                                                                                                 // 13
})(function($, window, document, undefined) {                                                                         // 14
    "use strict";                                                                                                     // 15
    var pluginName = "intlTelInput", id = 1, // give each instance it's own id for namespaced event handling          // 16
    defaults = {                                                                                                      // 17
        // automatically format the number according to the selected country                                          // 18
        autoFormat: true,                                                                                             // 19
        // if there is just a dial code in the input: remove it on blur, and re-add it on focus                       // 20
        autoHideDialCode: true,                                                                                       // 21
        // default country                                                                                            // 22
        defaultCountry: "",                                                                                           // 23
        // token for ipinfo - required for https or over 1000 daily page views support                                // 24
        ipinfoToken: "",                                                                                              // 25
        // don't insert international dial codes                                                                      // 26
        nationalMode: false,                                                                                          // 27
        // number type to use for placeholders                                                                        // 28
        numberType: "MOBILE",                                                                                         // 29
        // display only these countries                                                                               // 30
        onlyCountries: [],                                                                                            // 31
        // the countries at the top of the list. defaults to united states and united kingdom                         // 32
        preferredCountries: [ "us", "gb" ],                                                                           // 33
        // make the dropdown the same width as the input                                                              // 34
        responsiveDropdown: false,                                                                                    // 35
        // specify the path to the libphonenumber script to enable validation/formatting                              // 36
        utilsScript: ""                                                                                               // 37
    }, keys = {                                                                                                       // 38
        UP: 38,                                                                                                       // 39
        DOWN: 40,                                                                                                     // 40
        ENTER: 13,                                                                                                    // 41
        ESC: 27,                                                                                                      // 42
        PLUS: 43,                                                                                                     // 43
        A: 65,                                                                                                        // 44
        Z: 90,                                                                                                        // 45
        ZERO: 48,                                                                                                     // 46
        NINE: 57,                                                                                                     // 47
        SPACE: 32,                                                                                                    // 48
        BSPACE: 8,                                                                                                    // 49
        DEL: 46,                                                                                                      // 50
        CTRL: 17,                                                                                                     // 51
        CMD1: 91,                                                                                                     // 52
        // Chrome                                                                                                     // 53
        CMD2: 224                                                                                                     // 54
    }, windowLoaded = false;                                                                                          // 55
    // keep track of if the window.load event has fired as impossible to check after the fact                         // 56
    $(window).load(function() {                                                                                       // 57
        windowLoaded = true;                                                                                          // 58
    });                                                                                                               // 59
    function Plugin(element, options) {                                                                               // 60
        this.element = element;                                                                                       // 61
        this.options = $.extend({}, defaults, options);                                                               // 62
        this._defaults = defaults;                                                                                    // 63
        // event namespace                                                                                            // 64
        this.ns = "." + pluginName + id++;                                                                            // 65
        // Chrome, FF, Safari, IE9+                                                                                   // 66
        this.isGoodBrowser = Boolean(element.setSelectionRange);                                                      // 67
        this.hadInitialPlaceholder = Boolean($(element).attr("placeholder"));                                         // 68
        this._name = pluginName;                                                                                      // 69
        this.init();                                                                                                  // 70
    }                                                                                                                 // 71
    Plugin.prototype = {                                                                                              // 72
        init: function() {                                                                                            // 73
            var that = this;                                                                                          // 74
            // if defaultCountry is set to "auto", we must do a lookup first                                          // 75
            if (this.options.defaultCountry == "auto") {                                                              // 76
                // reset this in case lookup fails                                                                    // 77
                this.options.defaultCountry = "";                                                                     // 78
                var ipinfoURL = "//ipinfo.io";                                                                        // 79
                if (this.options.ipinfoToken) {                                                                       // 80
                    ipinfoURL += "?token=" + this.options.ipinfoToken;                                                // 81
                }                                                                                                     // 82
                $.get(ipinfoURL, function(response) {                                                                 // 83
                    if (response && response.country) {                                                               // 84
                        that.options.defaultCountry = response.country.toLowerCase();                                 // 85
                    }                                                                                                 // 86
                }, "jsonp").always(function() {                                                                       // 87
                    that._ready();                                                                                    // 88
                });                                                                                                   // 89
            } else {                                                                                                  // 90
                this._ready();                                                                                        // 91
            }                                                                                                         // 92
        },                                                                                                            // 93
        _ready: function() {                                                                                          // 94
            // if in nationalMode, disable options relating to dial codes                                             // 95
            if (this.options.nationalMode) {                                                                          // 96
                this.options.autoHideDialCode = false;                                                                // 97
            }                                                                                                         // 98
            // IE Mobile doesn't support the keypress event (see issue 68) which makes autoFormat impossible          // 99
            if (navigator.userAgent.match(/IEMobile/i)) {                                                             // 100
                this.options.autoFormat = false;                                                                      // 101
            }                                                                                                         // 102
            // auto enable responsiveDropdown mode on small screens (dropdown is currently set to 430px in CSS)       // 103
            if (window.innerWidth < 500) {                                                                            // 104
                this.options.responsiveDropdown = true;                                                               // 105
            }                                                                                                         // 106
            // process all the data: onlyCountries, preferredCountries etc                                            // 107
            this._processCountryData();                                                                               // 108
            // generate the markup                                                                                    // 109
            this._generateMarkup();                                                                                   // 110
            // set the initial state of the input value and the selected flag                                         // 111
            this._setInitialState();                                                                                  // 112
            // start all of the event listeners: autoHideDialCode, input keydown, selectedFlag click                  // 113
            this._initListeners();                                                                                    // 114
        },                                                                                                            // 115
        /********************                                                                                         // 116
   *  PRIVATE METHODS                                                                                                 // 117
   ********************/                                                                                              // 118
        // prepare all of the country data, including onlyCountries and preferredCountries options                    // 119
        _processCountryData: function() {                                                                             // 120
            // set the instances country data objects                                                                 // 121
            this._setInstanceCountryData();                                                                           // 122
            // set the preferredCountries property                                                                    // 123
            this._setPreferredCountries();                                                                            // 124
        },                                                                                                            // 125
        // add a country code to this.countryCodes                                                                    // 126
        _addCountryCode: function(iso2, dialCode, priority) {                                                         // 127
            if (!(dialCode in this.countryCodes)) {                                                                   // 128
                this.countryCodes[dialCode] = [];                                                                     // 129
            }                                                                                                         // 130
            var index = priority || 0;                                                                                // 131
            this.countryCodes[dialCode][index] = iso2;                                                                // 132
        },                                                                                                            // 133
        // process onlyCountries array if present, and generate the countryCodes map                                  // 134
        _setInstanceCountryData: function() {                                                                         // 135
            var i;                                                                                                    // 136
            // process onlyCountries option                                                                           // 137
            if (this.options.onlyCountries.length) {                                                                  // 138
                this.countries = [];                                                                                  // 139
                for (i = 0; i < allCountries.length; i++) {                                                           // 140
                    if ($.inArray(allCountries[i].iso2, this.options.onlyCountries) != -1) {                          // 141
                        this.countries.push(allCountries[i]);                                                         // 142
                    }                                                                                                 // 143
                }                                                                                                     // 144
            } else {                                                                                                  // 145
                this.countries = allCountries;                                                                        // 146
            }                                                                                                         // 147
            // generate countryCodes map                                                                              // 148
            this.countryCodes = {};                                                                                   // 149
            for (i = 0; i < this.countries.length; i++) {                                                             // 150
                var c = this.countries[i];                                                                            // 151
                this._addCountryCode(c.iso2, c.dialCode, c.priority);                                                 // 152
                // area codes                                                                                         // 153
                if (c.areaCodes) {                                                                                    // 154
                    for (var j = 0; j < c.areaCodes.length; j++) {                                                    // 155
                        // full dial code is country code + dial code                                                 // 156
                        this._addCountryCode(c.iso2, c.dialCode + c.areaCodes[j]);                                    // 157
                    }                                                                                                 // 158
                }                                                                                                     // 159
            }                                                                                                         // 160
        },                                                                                                            // 161
        // process preferred countries - iterate through the preferences,                                             // 162
        // fetching the country data for each one                                                                     // 163
        _setPreferredCountries: function() {                                                                          // 164
            this.preferredCountries = [];                                                                             // 165
            for (var i = 0; i < this.options.preferredCountries.length; i++) {                                        // 166
                var countryCode = this.options.preferredCountries[i], countryData = this._getCountryData(countryCode, false, true);
                if (countryData) {                                                                                    // 168
                    this.preferredCountries.push(countryData);                                                        // 169
                }                                                                                                     // 170
            }                                                                                                         // 171
        },                                                                                                            // 172
        // generate all of the markup for the plugin: the selected flag overlay, and the dropdown                     // 173
        _generateMarkup: function() {                                                                                 // 174
            // telephone input                                                                                        // 175
            this.telInput = $(this.element);                                                                          // 176
            // containers (mostly for positioning)                                                                    // 177
            this.telInput.wrap($("<div>", {                                                                           // 178
                "class": "intl-tel-input"                                                                             // 179
            }));                                                                                                      // 180
            var flagsContainer = $("<div>", {                                                                         // 181
                "class": "flag-dropdown"                                                                              // 182
            }).insertAfter(this.telInput);                                                                            // 183
            // currently selected flag (displayed to left of input)                                                   // 184
            var selectedFlag = $("<div>", {                                                                           // 185
                "class": "selected-flag"                                                                              // 186
            }).appendTo(flagsContainer);                                                                              // 187
            this.selectedFlagInner = $("<div>", {                                                                     // 188
                "class": "flag"                                                                                       // 189
            }).appendTo(selectedFlag);                                                                                // 190
            // CSS triangle                                                                                           // 191
            $("<div>", {                                                                                              // 192
                "class": "arrow"                                                                                      // 193
            }).appendTo(this.selectedFlagInner);                                                                      // 194
            // country list contains: preferred countries, then divider, then all countries                           // 195
            this.countryList = $("<ul>", {                                                                            // 196
                "class": "country-list v-hide"                                                                        // 197
            }).appendTo(flagsContainer);                                                                              // 198
            if (this.preferredCountries.length) {                                                                     // 199
                this._appendListItems(this.preferredCountries, "preferred");                                          // 200
                $("<li>", {                                                                                           // 201
                    "class": "divider"                                                                                // 202
                }).appendTo(this.countryList);                                                                        // 203
            }                                                                                                         // 204
            this._appendListItems(this.countries, "");                                                                // 205
            // now we can grab the dropdown height, and hide it properly                                              // 206
            this.dropdownHeight = this.countryList.outerHeight();                                                     // 207
            this.countryList.removeClass("v-hide").addClass("hide");                                                  // 208
            // and set the width                                                                                      // 209
            if (this.options.responsiveDropdown) {                                                                    // 210
                this.countryList.outerWidth(this.telInput.outerWidth());                                              // 211
            }                                                                                                         // 212
            // this is useful in lots of places                                                                       // 213
            this.countryListItems = this.countryList.children(".country");                                            // 214
        },                                                                                                            // 215
        // add a country <li> to the countryList <ul> container                                                       // 216
        _appendListItems: function(countries, className) {                                                            // 217
            // we create so many DOM elements, I decided it was faster to build a temp string                         // 218
            // and then add everything to the DOM in one go at the end                                                // 219
            var tmp = "";                                                                                             // 220
            // for each country                                                                                       // 221
            for (var i = 0; i < countries.length; i++) {                                                              // 222
                var c = countries[i];                                                                                 // 223
                // open the list item                                                                                 // 224
                tmp += "<li class='country " + className + "' data-dial-code='" + c.dialCode + "' data-country-code='" + c.iso2 + "'>";
                // add the flag                                                                                       // 226
                tmp += "<div class='flag " + c.iso2 + "'></div>";                                                     // 227
                // and the country name and dial code                                                                 // 228
                tmp += "<span class='country-name'>" + c.name + "</span>";                                            // 229
                tmp += "<span class='dial-code'>+" + c.dialCode + "</span>";                                          // 230
                // close the list item                                                                                // 231
                tmp += "</li>";                                                                                       // 232
            }                                                                                                         // 233
            this.countryList.append(tmp);                                                                             // 234
        },                                                                                                            // 235
        // set the initial state of the input value and the selected flag                                             // 236
        _setInitialState: function() {                                                                                // 237
            var val = this.telInput.val();                                                                            // 238
            // if there is a number, and it's valid, we can go ahead and set the flag, else fall back to default      // 239
            if (this._getDialCode(val)) {                                                                             // 240
                this._updateFlagFromNumber(val);                                                                      // 241
            } else {                                                                                                  // 242
                var defaultCountry;                                                                                   // 243
                // check the defaultCountry option, else fall back to the first in the list                           // 244
                if (this.options.defaultCountry) {                                                                    // 245
                    defaultCountry = this._getCountryData(this.options.defaultCountry, false, false);                 // 246
                } else {                                                                                              // 247
                    defaultCountry = this.preferredCountries.length ? this.preferredCountries[0] : this.countries[0]; // 248
                }                                                                                                     // 249
                this._selectFlag(defaultCountry.iso2);                                                                // 250
                // if empty, insert the default dial code (this function will check !nationalMode and !autoHideDialCode)
                if (!val) {                                                                                           // 252
                    this._updateDialCode(defaultCountry.dialCode, false);                                             // 253
                }                                                                                                     // 254
            }                                                                                                         // 255
            // format                                                                                                 // 256
            if (val) {                                                                                                // 257
                // this wont be run after _updateDialCode as that's only called if no val                             // 258
                this._updateVal(val, false);                                                                          // 259
            }                                                                                                         // 260
        },                                                                                                            // 261
        // initialise the main event listeners: input keyup, and click selected flag                                  // 262
        _initListeners: function() {                                                                                  // 263
            var that = this;                                                                                          // 264
            this._initKeyListeners();                                                                                 // 265
            // autoFormat prevents the change event from firing, so we need to check for changes between focus and blur in order to manually trigger it
            if (this.options.autoHideDialCode || this.options.autoFormat) {                                           // 267
                this._initFocusListeners();                                                                           // 268
            }                                                                                                         // 269
            // hack for input nested inside label: clicking the selected-flag to open the dropdown would then automatically trigger a 2nd click on the input which would close it again
            var label = this.telInput.closest("label");                                                               // 271
            if (label.length) {                                                                                       // 272
                label.on("click" + this.ns, function(e) {                                                             // 273
                    // if the dropdown is closed, then focus the input, else ignore the click                         // 274
                    if (that.countryList.hasClass("hide")) {                                                          // 275
                        that.telInput.focus();                                                                        // 276
                    } else {                                                                                          // 277
                        e.preventDefault();                                                                           // 278
                    }                                                                                                 // 279
                });                                                                                                   // 280
            }                                                                                                         // 281
            // toggle country dropdown on click                                                                       // 282
            var selectedFlag = this.selectedFlagInner.parent();                                                       // 283
            selectedFlag.on("click" + this.ns, function(e) {                                                          // 284
                // only intercept this event if we're opening the dropdown                                            // 285
                // else let it bubble up to the top ("click-off-to-close" listener)                                   // 286
                // we cannot just stopPropagation as it may be needed to close another instance                       // 287
                if (that.countryList.hasClass("hide") && !that.telInput.prop("disabled")) {                           // 288
                    that._showDropdown();                                                                             // 289
                }                                                                                                     // 290
            });                                                                                                       // 291
            // if the user has specified the path to the utils script, fetch it on window.load                        // 292
            if (this.options.utilsScript) {                                                                           // 293
                // if the plugin is being initialised after the window.load event has already been fired              // 294
                if (windowLoaded) {                                                                                   // 295
                    this.loadUtils();                                                                                 // 296
                } else {                                                                                              // 297
                    // wait until the load event so we don't block any other requests e.g. the flags image            // 298
                    $(window).load(function() {                                                                       // 299
                        that.loadUtils();                                                                             // 300
                    });                                                                                               // 301
                }                                                                                                     // 302
            }                                                                                                         // 303
        },                                                                                                            // 304
        _initKeyListeners: function() {                                                                               // 305
            var that = this;                                                                                          // 306
            if (this.options.autoFormat) {                                                                            // 307
                // format number and update flag on keypress                                                          // 308
                // use keypress event as we want to ignore all input except for a select few keys,                    // 309
                // but we dont want to ignore the navigation keys like the arrows etc.                                // 310
                // NOTE: no point in refactoring this to only bind these listeners on focus/blur because then you would need to have those 2 listeners running the whole time anyway...
                this.telInput.on("keypress" + this.ns, function(e) {                                                  // 312
                    // 32 is space, and after that it's all chars (not meta/nav keys)                                 // 313
                    // this fix is needed for Firefox, which triggers keypress event for some meta/nav keys           // 314
                    // Update: also ignore if this is a metaKey e.g. FF and Safari trigger keypress on the v of Ctrl+v
                    // Update: also check that we have utils before we do any autoFormat stuff                        // 316
                    if (e.which >= keys.SPACE && !e.metaKey && window.intlTelInputUtils) {                            // 317
                        e.preventDefault();                                                                           // 318
                        // allowed keys are just numeric keys and plus                                                // 319
                        // we must allow plus for the case where the user does select-all and then hits plus to start typing a new number. we could refine this logic to first check that the selection contains a plus, but that wont work in old browsers, and I think it's overkill anyway
                        var isAllowedKey = e.which >= keys.ZERO && e.which <= keys.NINE || e.which == keys.PLUS, input = that.telInput[0], noSelection = that.isGoodBrowser && input.selectionStart == input.selectionEnd, max = that.telInput.attr("maxlength"), // assumes that if max exists, it is >0
                        isBelowMax = max ? that.telInput.val().length < max : true;                                   // 322
                        // first: ensure we dont go over maxlength. we must do this here to prevent adding digits in the middle of the number
                        // still reformat even if not an allowed key as they could by typing a formatting char, but ignore if there's a selection as doesn't make sense to replace selection with illegal char and then immediately remove it
                        if (isBelowMax && (isAllowedKey || noSelection)) {                                            // 325
                            var newChar = isAllowedKey ? String.fromCharCode(e.which) : null;                         // 326
                            that._handleInputKey(newChar, true);                                                      // 327
                        }                                                                                             // 328
                        if (!isAllowedKey) {                                                                          // 329
                            that.telInput.trigger("invalidkey");                                                      // 330
                        }                                                                                             // 331
                    }                                                                                                 // 332
                });                                                                                                   // 333
            }                                                                                                         // 334
            // handle keyup event                                                                                     // 335
            // for autoFormat: we use keyup to catch delete events after the fact                                     // 336
            this.telInput.on("keyup" + this.ns, function(e) {                                                         // 337
                // the "enter" key event from selecting a dropdown item is triggered here on the input, because the document.keydown handler that initially handles that event triggers a focus on the input, and so the keyup for that same key event gets triggered here. weird, but just make sure we dont bother doing any re-formatting in this case (we've already done preventDefault in the keydown handler, so it wont actually submit the form or anything).
                if (e.which == keys.ENTER) {} else if (that.options.autoFormat && window.intlTelInputUtils) {         // 339
                    var isCtrl = e.which == keys.CTRL || e.which == keys.CMD1 || e.which == keys.CMD2, input = that.telInput[0], // noSelection defaults to false for bad browsers, else would be reformatting on all ctrl keys e.g. select-all/copy
                    noSelection = that.isGoodBrowser && input.selectionStart == input.selectionEnd, // cursorAtEnd defaults to false for bad browsers else they would never get a reformat on delete
                    cursorAtEnd = that.isGoodBrowser && input.selectionStart == that.telInput.val().length;           // 342
                    // if delete in the middle: reformat with no suffix (no need to reformat if delete at end)        // 343
                    // if backspace: reformat with no suffix (need to reformat if at end to remove any lingering suffix - this is a feature)
                    // if ctrl and no selection (i.e. could have just been a paste): reformat (if cursorAtEnd: add suffix)
                    if (e.which == keys.DEL && !cursorAtEnd || e.which == keys.BSPACE || isCtrl && noSelection) {     // 346
                        // important to remember never to add suffix on any delete key as can fuck up in ie8 so you can never delete a formatting char at the end
                        that._handleInputKey(null, isCtrl && cursorAtEnd);                                            // 348
                    }                                                                                                 // 349
                    // prevent deleting the plus (if not in nationalMode)                                             // 350
                    if (!that.options.nationalMode) {                                                                 // 351
                        var val = that.telInput.val();                                                                // 352
                        if (val.substr(0, 1) != "+") {                                                                // 353
                            // newCursorPos is current pos + 1 to account for the plus we are about to add            // 354
                            var newCursorPos = that.isGoodBrowser ? input.selectionStart + 1 : 0;                     // 355
                            that.telInput.val("+" + val);                                                             // 356
                            if (that.isGoodBrowser) {                                                                 // 357
                                input.setSelectionRange(newCursorPos, newCursorPos);                                  // 358
                            }                                                                                         // 359
                        }                                                                                             // 360
                    }                                                                                                 // 361
                } else {                                                                                              // 362
                    // if no autoFormat, just update flag                                                             // 363
                    that._updateFlagFromNumber(that.telInput.val());                                                  // 364
                }                                                                                                     // 365
            });                                                                                                       // 366
        },                                                                                                            // 367
        // when autoFormat is enabled: handle various key events on the input: the 2 main situations are 1) adding a new number character, which will replace any selection, reformat, and try to preserve the cursor position. and 2) reformatting on backspace, or paste event
        _handleInputKey: function(newNumericChar, addSuffix) {                                                        // 369
            var val = this.telInput.val(), newCursor = null, cursorAtEnd = false, // raw DOM element                  // 370
            input = this.telInput[0];                                                                                 // 371
            if (this.isGoodBrowser) {                                                                                 // 372
                var selectionEnd = input.selectionEnd, originalLen = val.length;                                      // 373
                cursorAtEnd = selectionEnd == originalLen;                                                            // 374
                // if handling a new number character: insert it in the right place and calculate the new cursor position
                if (newNumericChar) {                                                                                 // 376
                    // replace any selection they may have made with the new char                                     // 377
                    val = val.substr(0, input.selectionStart) + newNumericChar + val.substring(selectionEnd, originalLen);
                    // if the cursor was not at the end then calculate it's new pos                                   // 379
                    if (!cursorAtEnd) {                                                                               // 380
                        newCursor = selectionEnd + (val.length - originalLen);                                        // 381
                    }                                                                                                 // 382
                } else {                                                                                              // 383
                    // here we're not handling a new char, we're just doing a re-format, but we still need to maintain the cursor position
                    newCursor = input.selectionStart;                                                                 // 385
                }                                                                                                     // 386
            } else if (newNumericChar) {                                                                              // 387
                val += newNumericChar;                                                                                // 388
            }                                                                                                         // 389
            // update the number and flag                                                                             // 390
            this.setNumber(val, addSuffix);                                                                           // 391
            // update the cursor position                                                                             // 392
            if (this.isGoodBrowser) {                                                                                 // 393
                // if it was at the end, keep it there                                                                // 394
                if (cursorAtEnd) {                                                                                    // 395
                    newCursor = this.telInput.val().length;                                                           // 396
                }                                                                                                     // 397
                input.setSelectionRange(newCursor, newCursor);                                                        // 398
            }                                                                                                         // 399
        },                                                                                                            // 400
        // listen for focus and blur                                                                                  // 401
        _initFocusListeners: function() {                                                                             // 402
            var that = this;                                                                                          // 403
            if (this.options.autoHideDialCode) {                                                                      // 404
                // mousedown decides where the cursor goes, so if we're focusing we must preventDefault as we'll be inserting the dial code, and we want the cursor to be at the end no matter where they click
                this.telInput.on("mousedown" + this.ns, function(e) {                                                 // 406
                    if (!that.telInput.is(":focus") && !that.telInput.val()) {                                        // 407
                        e.preventDefault();                                                                           // 408
                        // but this also cancels the focus, so we must trigger that manually                          // 409
                        that.telInput.focus();                                                                        // 410
                    }                                                                                                 // 411
                });                                                                                                   // 412
            }                                                                                                         // 413
            this.telInput.on("focus" + this.ns, function() {                                                          // 414
                var value = that.telInput.val();                                                                      // 415
                // save this to compare on blur                                                                       // 416
                that.telInput.data("focusVal", value);                                                                // 417
                if (that.options.autoHideDialCode) {                                                                  // 418
                    // on focus: if empty, insert the dial code for the currently selected flag                       // 419
                    if (!value) {                                                                                     // 420
                        that._updateVal("+" + that.selectedCountryData.dialCode, true);                               // 421
                        // after auto-inserting a dial code, if the first key they hit is '+' then assume they are entering a new number, so remove the dial code. use keypress instead of keydown because keydown gets triggered for the shift key (required to hit the + key), and instead of keyup because that shows the new '+' before removing the old one
                        that.telInput.one("keypress.plus" + that.ns, function(e) {                                    // 423
                            if (e.which == keys.PLUS) {                                                               // 424
                                // if autoFormat is enabled, this key event will have already have been handled by another keypress listener (hence we need to add the "+"). if disabled, it will be handled after this by a keyup listener (hence no need to add the "+").
                                var newVal = that.options.autoFormat && window.intlTelInputUtils ? "+" : "";          // 426
                                that.telInput.val(newVal);                                                            // 427
                            }                                                                                         // 428
                        });                                                                                           // 429
                        // after tabbing in, make sure the cursor is at the end we must use setTimeout to get outside of the focus handler as it seems the selection happens after that
                        setTimeout(function() {                                                                       // 431
                            var input = that.telInput[0];                                                             // 432
                            if (that.isGoodBrowser) {                                                                 // 433
                                var len = that.telInput.val().length;                                                 // 434
                                input.setSelectionRange(len, len);                                                    // 435
                            }                                                                                         // 436
                        });                                                                                           // 437
                    }                                                                                                 // 438
                }                                                                                                     // 439
            });                                                                                                       // 440
            this.telInput.on("blur" + this.ns, function() {                                                           // 441
                if (that.options.autoHideDialCode) {                                                                  // 442
                    // on blur: if just a dial code then remove it                                                    // 443
                    var value = that.telInput.val(), startsPlus = value.substr(0, 1) == "+";                          // 444
                    if (startsPlus) {                                                                                 // 445
                        var numeric = that._getNumeric(value);                                                        // 446
                        // if just a plus, or if just a dial code                                                     // 447
                        if (!numeric || that.selectedCountryData.dialCode == numeric) {                               // 448
                            that.telInput.val("");                                                                    // 449
                        }                                                                                             // 450
                    }                                                                                                 // 451
                    // remove the keypress listener we added on focus                                                 // 452
                    that.telInput.off("keypress.plus" + that.ns);                                                     // 453
                }                                                                                                     // 454
                // if autoFormat, we must manually trigger change event if value has changed                          // 455
                if (that.options.autoFormat && window.intlTelInputUtils && that.telInput.val() != that.telInput.data("focusVal")) {
                    that.telInput.trigger("change");                                                                  // 457
                }                                                                                                     // 458
            });                                                                                                       // 459
        },                                                                                                            // 460
        // extract the numeric digits from the given string                                                           // 461
        _getNumeric: function(s) {                                                                                    // 462
            return s.replace(/\D/g, "");                                                                              // 463
        },                                                                                                            // 464
        // show the dropdown                                                                                          // 465
        _showDropdown: function() {                                                                                   // 466
            this._setDropdownPosition();                                                                              // 467
            // update highlighting and scroll to active list item                                                     // 468
            var activeListItem = this.countryList.children(".active");                                                // 469
            this._highlightListItem(activeListItem);                                                                  // 470
            // show it                                                                                                // 471
            this.countryList.removeClass("hide");                                                                     // 472
            this._scrollTo(activeListItem);                                                                           // 473
            // bind all the dropdown-related listeners: mouseover, click, click-off, keydown                          // 474
            this._bindDropdownListeners();                                                                            // 475
            // update the arrow                                                                                       // 476
            this.selectedFlagInner.children(".arrow").addClass("up");                                                 // 477
        },                                                                                                            // 478
        // decide where to position dropdown (depends on position within viewport, and scroll)                        // 479
        _setDropdownPosition: function() {                                                                            // 480
            var inputTop = this.telInput.offset().top, windowTop = $(window).scrollTop(), // dropdownFitsBelow = (dropdownBottom < windowBottom)
            dropdownFitsBelow = inputTop + this.telInput.outerHeight() + this.dropdownHeight < windowTop + $(window).height(), dropdownFitsAbove = inputTop - this.dropdownHeight > windowTop;
            // dropdownHeight - 1 for border                                                                          // 483
            var cssTop = !dropdownFitsBelow && dropdownFitsAbove ? "-" + (this.dropdownHeight - 1) + "px" : "";       // 484
            this.countryList.css("top", cssTop);                                                                      // 485
        },                                                                                                            // 486
        // we only bind dropdown listeners when the dropdown is open                                                  // 487
        _bindDropdownListeners: function() {                                                                          // 488
            var that = this;                                                                                          // 489
            // when mouse over a list item, just highlight that one                                                   // 490
            // we add the class "highlight", so if they hit "enter" we know which one to select                       // 491
            this.countryList.on("mouseover" + this.ns, ".country", function(e) {                                      // 492
                that._highlightListItem($(this));                                                                     // 493
            });                                                                                                       // 494
            // listen for country selection                                                                           // 495
            this.countryList.on("click" + this.ns, ".country", function(e) {                                          // 496
                that._selectListItem($(this));                                                                        // 497
            });                                                                                                       // 498
            // click off to close                                                                                     // 499
            // (except when this initial opening click is bubbling up)                                                // 500
            // we cannot just stopPropagation as it may be needed to close another instance                           // 501
            var isOpening = true;                                                                                     // 502
            $("html").on("click" + this.ns, function(e) {                                                             // 503
                if (!isOpening) {                                                                                     // 504
                    that._closeDropdown();                                                                            // 505
                }                                                                                                     // 506
                isOpening = false;                                                                                    // 507
            });                                                                                                       // 508
            // listen for up/down scrolling, enter to select, or letters to jump to country name.                     // 509
            // use keydown as keypress doesn't fire for non-char keys and we want to catch if they                    // 510
            // just hit down and hold it to scroll down (no keyup event).                                             // 511
            // listen on the document because that's where key events are triggered if no input has focus             // 512
            var query = "", queryTimer = null;                                                                        // 513
            $(document).on("keydown" + this.ns, function(e) {                                                         // 514
                // prevent down key from scrolling the whole page,                                                    // 515
                // and enter key from submitting a form etc                                                           // 516
                e.preventDefault();                                                                                   // 517
                if (e.which == keys.UP || e.which == keys.DOWN) {                                                     // 518
                    // up and down to navigate                                                                        // 519
                    that._handleUpDownKey(e.which);                                                                   // 520
                } else if (e.which == keys.ENTER) {                                                                   // 521
                    // enter to select                                                                                // 522
                    that._handleEnterKey();                                                                           // 523
                } else if (e.which == keys.ESC) {                                                                     // 524
                    // esc to close                                                                                   // 525
                    that._closeDropdown();                                                                            // 526
                } else if (e.which >= keys.A && e.which <= keys.Z || e.which == keys.SPACE) {                         // 527
                    // upper case letters (note: keyup/keydown only return upper case letters)                        // 528
                    // jump to countries that start with the query string                                             // 529
                    if (queryTimer) {                                                                                 // 530
                        clearTimeout(queryTimer);                                                                     // 531
                    }                                                                                                 // 532
                    query += String.fromCharCode(e.which);                                                            // 533
                    that._searchForCountry(query);                                                                    // 534
                    // if the timer hits 1 second, reset the query                                                    // 535
                    queryTimer = setTimeout(function() {                                                              // 536
                        query = "";                                                                                   // 537
                    }, 1e3);                                                                                          // 538
                }                                                                                                     // 539
            });                                                                                                       // 540
        },                                                                                                            // 541
        // highlight the next/prev item in the list (and ensure it is visible)                                        // 542
        _handleUpDownKey: function(key) {                                                                             // 543
            var current = this.countryList.children(".highlight").first();                                            // 544
            var next = key == keys.UP ? current.prev() : current.next();                                              // 545
            if (next.length) {                                                                                        // 546
                // skip the divider                                                                                   // 547
                if (next.hasClass("divider")) {                                                                       // 548
                    next = key == keys.UP ? next.prev() : next.next();                                                // 549
                }                                                                                                     // 550
                this._highlightListItem(next);                                                                        // 551
                this._scrollTo(next);                                                                                 // 552
            }                                                                                                         // 553
        },                                                                                                            // 554
        // select the currently highlighted item                                                                      // 555
        _handleEnterKey: function() {                                                                                 // 556
            var currentCountry = this.countryList.children(".highlight").first();                                     // 557
            if (currentCountry.length) {                                                                              // 558
                this._selectListItem(currentCountry);                                                                 // 559
            }                                                                                                         // 560
        },                                                                                                            // 561
        // find the first list item whose name starts with the query string                                           // 562
        _searchForCountry: function(query) {                                                                          // 563
            for (var i = 0; i < this.countries.length; i++) {                                                         // 564
                if (this._startsWith(this.countries[i].name, query)) {                                                // 565
                    var listItem = this.countryList.children("[data-country-code=" + this.countries[i].iso2 + "]").not(".preferred");
                    // update highlighting and scroll                                                                 // 567
                    this._highlightListItem(listItem);                                                                // 568
                    this._scrollTo(listItem, true);                                                                   // 569
                    break;                                                                                            // 570
                }                                                                                                     // 571
            }                                                                                                         // 572
        },                                                                                                            // 573
        // check if (uppercase) string a starts with string b                                                         // 574
        _startsWith: function(a, b) {                                                                                 // 575
            return a.substr(0, b.length).toUpperCase() == b;                                                          // 576
        },                                                                                                            // 577
        // update the input's value to the given val                                                                  // 578
        // if autoFormat=true, format it first according to the country-specific formatting rules                     // 579
        _updateVal: function(val, addSuffix) {                                                                        // 580
            var formatted;                                                                                            // 581
            if (this.options.autoFormat && window.intlTelInputUtils) {                                                // 582
                formatted = intlTelInputUtils.formatNumber(val, this.selectedCountryData.iso2, addSuffix);            // 583
                // ensure we dont go over maxlength. we must do this here to truncate any formatting suffix, and also handle paste events
                var max = this.telInput.attr("maxlength");                                                            // 585
                if (max && formatted.length > max) {                                                                  // 586
                    formatted = formatted.substr(0, max);                                                             // 587
                }                                                                                                     // 588
            } else {                                                                                                  // 589
                // no autoFormat, so just insert the original value                                                   // 590
                formatted = val;                                                                                      // 591
            }                                                                                                         // 592
            this.telInput.val(formatted);                                                                             // 593
        },                                                                                                            // 594
        // check if need to select a new flag based on the given number                                               // 595
        _updateFlagFromNumber: function(number) {                                                                     // 596
            // if we're in nationalMode and we're on US/Canada, make sure the number starts with a +1 so _getDialCode will be able to extract the area code
            // update: if we dont yet have selectedCountryData, but we're here (trying to update the flag from the number), that means we're initialising the plugin with a number that already has a dial code, so fine to ignore this bit
            if (this.options.nationalMode && this.selectedCountryData && this.selectedCountryData.dialCode == "1" && number.substr(0, 1) != "+") {
                number = "+1" + number;                                                                               // 600
            }                                                                                                         // 601
            // try and extract valid dial code from input                                                             // 602
            var dialCode = this._getDialCode(number);                                                                 // 603
            if (dialCode) {                                                                                           // 604
                // check if one of the matching countries is already selected                                         // 605
                var countryCodes = this.countryCodes[this._getNumeric(dialCode)], alreadySelected = false;            // 606
                if (this.selectedCountryData) {                                                                       // 607
                    for (var i = 0; i < countryCodes.length; i++) {                                                   // 608
                        if (countryCodes[i] == this.selectedCountryData.iso2) {                                       // 609
                            alreadySelected = true;                                                                   // 610
                        }                                                                                             // 611
                    }                                                                                                 // 612
                }                                                                                                     // 613
                // if a matching country is not already selected (or this is an unknown NANP area code): choose the first in the list
                if (!alreadySelected || this._isUnknownNanp(number, dialCode)) {                                      // 615
                    // if using onlyCountries option, countryCodes[0] may be empty, so we must find the first non-empty index
                    for (var j = 0; j < countryCodes.length; j++) {                                                   // 617
                        if (countryCodes[j]) {                                                                        // 618
                            this._selectFlag(countryCodes[j]);                                                        // 619
                            break;                                                                                    // 620
                        }                                                                                             // 621
                    }                                                                                                 // 622
                }                                                                                                     // 623
            }                                                                                                         // 624
        },                                                                                                            // 625
        // check if the given number contains an unknown area code from the North American Numbering Plan i.e. the only dialCode that could be extracted was +1 but the actual number's length is >=4
        _isUnknownNanp: function(number, dialCode) {                                                                  // 627
            return dialCode == "+1" && this._getNumeric(number).length >= 4;                                          // 628
        },                                                                                                            // 629
        // remove highlighting from other list items and highlight the given item                                     // 630
        _highlightListItem: function(listItem) {                                                                      // 631
            this.countryListItems.removeClass("highlight");                                                           // 632
            listItem.addClass("highlight");                                                                           // 633
        },                                                                                                            // 634
        // find the country data for the given country code                                                           // 635
        // the ignoreOnlyCountriesOption is only used during init() while parsing the onlyCountries array             // 636
        _getCountryData: function(countryCode, ignoreOnlyCountriesOption, allowFail) {                                // 637
            var countryList = ignoreOnlyCountriesOption ? allCountries : this.countries;                              // 638
            for (var i = 0; i < countryList.length; i++) {                                                            // 639
                if (countryList[i].iso2 == countryCode) {                                                             // 640
                    return countryList[i];                                                                            // 641
                }                                                                                                     // 642
            }                                                                                                         // 643
            if (allowFail) {                                                                                          // 644
                return null;                                                                                          // 645
            } else {                                                                                                  // 646
                throw new Error("No country data for '" + countryCode + "'");                                         // 647
            }                                                                                                         // 648
        },                                                                                                            // 649
        // select the given flag, update the placeholder and the active list item                                     // 650
        _selectFlag: function(countryCode) {                                                                          // 651
            // do this first as it will throw an error and stop if countryCode is invalid                             // 652
            this.selectedCountryData = this._getCountryData(countryCode, false, false);                               // 653
            this.selectedFlagInner.attr("class", "flag " + countryCode);                                              // 654
            // update the selected country's title attribute                                                          // 655
            var title = this.selectedCountryData.name + ": +" + this.selectedCountryData.dialCode;                    // 656
            this.selectedFlagInner.parent().attr("title", title);                                                     // 657
            // and the input's placeholder                                                                            // 658
            this._updatePlaceholder();                                                                                // 659
            // update the active list item                                                                            // 660
            var listItem = this.countryListItems.children(".flag." + countryCode).first().parent();                   // 661
            this.countryListItems.removeClass("active");                                                              // 662
            listItem.addClass("active");                                                                              // 663
        },                                                                                                            // 664
        // update the input placeholder to an example number from the currently selected country                      // 665
        _updatePlaceholder: function() {                                                                              // 666
            if (window.intlTelInputUtils && !this.hadInitialPlaceholder) {                                            // 667
                var iso2 = this.selectedCountryData.iso2, numberType = intlTelInputUtils.numberType[this.options.numberType || "FIXED_LINE"], placeholder = intlTelInputUtils.getExampleNumber(iso2, this.options.nationalMode, numberType);
                this.telInput.attr("placeholder", placeholder);                                                       // 669
            }                                                                                                         // 670
        },                                                                                                            // 671
        // called when the user selects a list item from the dropdown                                                 // 672
        _selectListItem: function(listItem) {                                                                         // 673
            // update selected flag and active list item                                                              // 674
            var countryCode = listItem.attr("data-country-code");                                                     // 675
            this._selectFlag(countryCode);                                                                            // 676
            this._closeDropdown();                                                                                    // 677
            this._updateDialCode(listItem.attr("data-dial-code"), true);                                              // 678
            // always fire the change event as even if nationalMode=true (and we haven't updated the input val), the system as a whole has still changed - see country-sync example. think of it as making a selection from a select element.
            this.telInput.trigger("change");                                                                          // 680
            // focus the input                                                                                        // 681
            this.telInput.focus();                                                                                    // 682
        },                                                                                                            // 683
        // close the dropdown and unbind any listeners                                                                // 684
        _closeDropdown: function() {                                                                                  // 685
            this.countryList.addClass("hide");                                                                        // 686
            // update the arrow                                                                                       // 687
            this.selectedFlagInner.children(".arrow").removeClass("up");                                              // 688
            // unbind key events                                                                                      // 689
            $(document).off(this.ns);                                                                                 // 690
            // unbind click-off-to-close                                                                              // 691
            $("html").off(this.ns);                                                                                   // 692
            // unbind hover and click listeners                                                                       // 693
            this.countryList.off(this.ns);                                                                            // 694
        },                                                                                                            // 695
        // check if an element is visible within it's container, else scroll until it is                              // 696
        _scrollTo: function(element, middle) {                                                                        // 697
            var container = this.countryList, containerHeight = container.height(), containerTop = container.offset().top, containerBottom = containerTop + containerHeight, elementHeight = element.outerHeight(), elementTop = element.offset().top, elementBottom = elementTop + elementHeight, newScrollTop = elementTop - containerTop + container.scrollTop(), middleOffset = containerHeight / 2 - elementHeight / 2;
            if (elementTop < containerTop) {                                                                          // 699
                // scroll up                                                                                          // 700
                if (middle) {                                                                                         // 701
                    newScrollTop -= middleOffset;                                                                     // 702
                }                                                                                                     // 703
                container.scrollTop(newScrollTop);                                                                    // 704
            } else if (elementBottom > containerBottom) {                                                             // 705
                // scroll down                                                                                        // 706
                if (middle) {                                                                                         // 707
                    newScrollTop += middleOffset;                                                                     // 708
                }                                                                                                     // 709
                var heightDifference = containerHeight - elementHeight;                                               // 710
                container.scrollTop(newScrollTop - heightDifference);                                                 // 711
            }                                                                                                         // 712
        },                                                                                                            // 713
        // replace any existing dial code with the new one (if not in nationalMode)                                   // 714
        // also we need to know if we're focusing for a couple of reasons e.g. if so, we want to add any formatting suffix, also if the input is empty and we're not in nationalMode, then we want to insert the dial code
        _updateDialCode: function(newDialCode, focusing) {                                                            // 716
            var inputVal = this.telInput.val(), newNumber;                                                            // 717
            // save having to pass this every time                                                                    // 718
            newDialCode = "+" + newDialCode;                                                                          // 719
            if (this.options.nationalMode && inputVal.substr(0, 1) != "+") {                                          // 720
                // if nationalMode, we just want to re-format                                                         // 721
                newNumber = inputVal;                                                                                 // 722
            } else if (inputVal) {                                                                                    // 723
                // if the previous number contained a valid dial code, replace it                                     // 724
                // (if more than just a plus character)                                                               // 725
                var prevDialCode = this._getDialCode(inputVal);                                                       // 726
                if (prevDialCode.length > 1) {                                                                        // 727
                    newNumber = inputVal.replace(prevDialCode, newDialCode);                                          // 728
                } else {                                                                                              // 729
                    // if the previous number didn't contain a dial code, we should persist it                        // 730
                    var existingNumber = inputVal.substr(0, 1) != "+" ? $.trim(inputVal) : "";                        // 731
                    newNumber = newDialCode + existingNumber;                                                         // 732
                }                                                                                                     // 733
            } else {                                                                                                  // 734
                newNumber = !this.options.autoHideDialCode || focusing ? newDialCode : "";                            // 735
            }                                                                                                         // 736
            this._updateVal(newNumber, focusing);                                                                     // 737
        },                                                                                                            // 738
        // try and extract a valid international dial code from a full telephone number                               // 739
        // Note: returns the raw string inc plus character and any whitespace/dots etc                                // 740
        _getDialCode: function(number) {                                                                              // 741
            var dialCode = "";                                                                                        // 742
            // only interested in international numbers (starting with a plus)                                        // 743
            if (number.charAt(0) == "+") {                                                                            // 744
                var numericChars = "";                                                                                // 745
                // iterate over chars                                                                                 // 746
                for (var i = 0; i < number.length; i++) {                                                             // 747
                    var c = number.charAt(i);                                                                         // 748
                    // if char is number                                                                              // 749
                    if ($.isNumeric(c)) {                                                                             // 750
                        numericChars += c;                                                                            // 751
                        // if current numericChars make a valid dial code                                             // 752
                        if (this.countryCodes[numericChars]) {                                                        // 753
                            // store the actual raw string (useful for matching later)                                // 754
                            dialCode = number.substr(0, i + 1);                                                       // 755
                        }                                                                                             // 756
                        // longest dial code is 4 chars                                                               // 757
                        if (numericChars.length == 4) {                                                               // 758
                            break;                                                                                    // 759
                        }                                                                                             // 760
                    }                                                                                                 // 761
                }                                                                                                     // 762
            }                                                                                                         // 763
            return dialCode;                                                                                          // 764
        },                                                                                                            // 765
        /********************                                                                                         // 766
   *  PUBLIC METHODS                                                                                                  // 767
   ********************/                                                                                              // 768
        // remove plugin                                                                                              // 769
        destroy: function() {                                                                                         // 770
            // make sure the dropdown is closed (and unbind listeners)                                                // 771
            this._closeDropdown();                                                                                    // 772
            // key events, and focus/blur events if autoHideDialCode=true                                             // 773
            this.telInput.off(this.ns);                                                                               // 774
            // click event to open dropdown                                                                           // 775
            this.selectedFlagInner.parent().off(this.ns);                                                             // 776
            // label click hack                                                                                       // 777
            this.telInput.closest("label").off(this.ns);                                                              // 778
            // remove markup                                                                                          // 779
            var container = this.telInput.parent();                                                                   // 780
            container.before(this.telInput).remove();                                                                 // 781
        },                                                                                                            // 782
        // format the number to E164                                                                                  // 783
        getCleanNumber: function() {                                                                                  // 784
            if (window.intlTelInputUtils) {                                                                           // 785
                return intlTelInputUtils.formatNumberE164(this.telInput.val(), this.selectedCountryData.iso2);        // 786
            }                                                                                                         // 787
            return "";                                                                                                // 788
        },                                                                                                            // 789
        // get the type of the entered number e.g. landline/mobile                                                    // 790
        getNumberType: function() {                                                                                   // 791
            if (window.intlTelInputUtils) {                                                                           // 792
                return intlTelInputUtils.getNumberType(this.telInput.val(), this.selectedCountryData.iso2);           // 793
            }                                                                                                         // 794
            return -99;                                                                                               // 795
        },                                                                                                            // 796
        // get the country data for the currently selected flag                                                       // 797
        getSelectedCountryData: function() {                                                                          // 798
            // if this is undefined, the plugin will return it's instance instead, so in that case an empty object makes more sense
            return this.selectedCountryData || {};                                                                    // 800
        },                                                                                                            // 801
        // get the validation error                                                                                   // 802
        getValidationError: function() {                                                                              // 803
            if (window.intlTelInputUtils) {                                                                           // 804
                return intlTelInputUtils.getValidationError(this.telInput.val(), this.selectedCountryData.iso2);      // 805
            }                                                                                                         // 806
            return -99;                                                                                               // 807
        },                                                                                                            // 808
        // validate the input val - assumes the global function isValidNumber (from utilsScript)                      // 809
        isValidNumber: function() {                                                                                   // 810
            var val = $.trim(this.telInput.val()), countryCode = this.options.nationalMode ? this.selectedCountryData.iso2 : "", // libphonenumber allows alpha chars, but in order to allow that, we'd need a method to retrieve the processed number, with letters replaced with numbers
            containsAlpha = /[a-zA-Z]/.test(val);                                                                     // 812
            if (!containsAlpha && window.intlTelInputUtils) {                                                         // 813
                return intlTelInputUtils.isValidNumber(val, countryCode);                                             // 814
            }                                                                                                         // 815
            return false;                                                                                             // 816
        },                                                                                                            // 817
        // load the utils script                                                                                      // 818
        loadUtils: function(path) {                                                                                   // 819
            var utilsScript = path || this.options.utilsScript;                                                       // 820
            if (!$.fn[pluginName].loadedUtilsScript && utilsScript) {                                                 // 821
                // don't do this twice! (dont just check if the global intlTelInputUtils exists as if init plugin multiple times in quick succession, it may not have finished loading yet)
                $.fn[pluginName].loadedUtilsScript = true;                                                            // 823
                // dont use $.getScript as it prevents caching                                                        // 824
                $.ajax({                                                                                              // 825
                    url: utilsScript,                                                                                 // 826
                    success: function() {                                                                             // 827
                        // tell all instances the utils are ready                                                     // 828
                        $(".intl-tel-input input").intlTelInput("utilsLoaded");                                       // 829
                    },                                                                                                // 830
                    dataType: "script",                                                                               // 831
                    cache: true                                                                                       // 832
                });                                                                                                   // 833
            }                                                                                                         // 834
        },                                                                                                            // 835
        // update the selected flag, and update the input val accordingly                                             // 836
        selectCountry: function(countryCode) {                                                                        // 837
            // check if already selected                                                                              // 838
            if (!this.selectedFlagInner.hasClass(countryCode)) {                                                      // 839
                this._selectFlag(countryCode);                                                                        // 840
                this._updateDialCode(this.selectedCountryData.dialCode, false);                                       // 841
            }                                                                                                         // 842
        },                                                                                                            // 843
        // set the input value and update the flag                                                                    // 844
        setNumber: function(number, addSuffix) {                                                                      // 845
            // ensure starts with plus                                                                                // 846
            if (!this.options.nationalMode && number.substr(0, 1) != "+") {                                           // 847
                number = "+" + number;                                                                                // 848
            }                                                                                                         // 849
            // we must update the flag first, which updates this.selectedCountryData, which is used later for formatting the number before displaying it
            this._updateFlagFromNumber(number);                                                                       // 851
            this._updateVal(number, addSuffix);                                                                       // 852
        },                                                                                                            // 853
        // this is called when the utils are ready                                                                    // 854
        utilsLoaded: function() {                                                                                     // 855
            // if autoFormat is enabled and there's an initial value in the input, then format it                     // 856
            if (this.options.autoFormat && this.telInput.val()) {                                                     // 857
                this._updateVal(this.telInput.val());                                                                 // 858
            }                                                                                                         // 859
            this._updatePlaceholder();                                                                                // 860
        }                                                                                                             // 861
    };                                                                                                                // 862
    // adapted to allow public functions                                                                              // 863
    // using https://github.com/jquery-boilerplate/jquery-boilerplate/wiki/Extending-jQuery-Boilerplate               // 864
    $.fn[pluginName] = function(options) {                                                                            // 865
        var args = arguments;                                                                                         // 866
        // Is the first parameter an object (options), or was omitted,                                                // 867
        // instantiate a new instance of the plugin.                                                                  // 868
        if (options === undefined || typeof options === "object") {                                                   // 869
            return this.each(function() {                                                                             // 870
                if (!$.data(this, "plugin_" + pluginName)) {                                                          // 871
                    $.data(this, "plugin_" + pluginName, new Plugin(this, options));                                  // 872
                }                                                                                                     // 873
            });                                                                                                       // 874
        } else if (typeof options === "string" && options[0] !== "_" && options !== "init") {                         // 875
            // If the first parameter is a string and it doesn't start                                                // 876
            // with an underscore or "contains" the `init`-function,                                                  // 877
            // treat this as a call to a public method.                                                               // 878
            // Cache the method call to make it possible to return a value                                            // 879
            var returns;                                                                                              // 880
            this.each(function() {                                                                                    // 881
                var instance = $.data(this, "plugin_" + pluginName);                                                  // 882
                // Tests that there's already a plugin-instance                                                       // 883
                // and checks that the requested public method exists                                                 // 884
                if (instance instanceof Plugin && typeof instance[options] === "function") {                          // 885
                    // Call the method of our plugin instance,                                                        // 886
                    // and pass it the supplied arguments.                                                            // 887
                    returns = instance[options].apply(instance, Array.prototype.slice.call(args, 1));                 // 888
                }                                                                                                     // 889
                // Allow instances to be destroyed via the 'destroy' method                                           // 890
                if (options === "destroy") {                                                                          // 891
                    $.data(this, "plugin_" + pluginName, null);                                                       // 892
                }                                                                                                     // 893
            });                                                                                                       // 894
            // If the earlier cached method gives a value back return the value,                                      // 895
            // otherwise return this to preserve chainability.                                                        // 896
            return returns !== undefined ? returns : this;                                                            // 897
        }                                                                                                             // 898
    };                                                                                                                // 899
    /********************                                                                                             // 900
 *  STATIC METHODS                                                                                                    // 901
 ********************/                                                                                                // 902
    // get the country data object                                                                                    // 903
    $.fn[pluginName].getCountryData = function() {                                                                    // 904
        return allCountries;                                                                                          // 905
    };                                                                                                                // 906
    // set the country data object                                                                                    // 907
    $.fn[pluginName].setCountryData = function(obj) {                                                                 // 908
        allCountries = obj;                                                                                           // 909
    };                                                                                                                // 910
    // Tell JSHint to ignore this warning: "character may get silently deleted by one or more browsers"               // 911
    // jshint -W100                                                                                                   // 912
    // Array of country objects for the flag dropdown.                                                                // 913
    // Each contains a name, country code (ISO 3166-1 alpha-2) and dial code.                                         // 914
    // Originally from https://github.com/mledoze/countries                                                           // 915
    // then modified using the following JavaScript (NOW OUT OF DATE):                                                // 916
    /*                                                                                                                // 917
var result = [];                                                                                                      // 918
_.each(countries, function(c) {                                                                                       // 919
  // ignore countries without a dial code                                                                             // 920
  if (c.callingCode[0].length) {                                                                                      // 921
    result.push({                                                                                                     // 922
      // var locals contains country names with localised versions in brackets                                        // 923
      n: _.findWhere(locals, {                                                                                        // 924
        countryCode: c.cca2                                                                                           // 925
      }).name,                                                                                                        // 926
      i: c.cca2.toLowerCase(),                                                                                        // 927
      d: c.callingCode[0]                                                                                             // 928
    });                                                                                                               // 929
  }                                                                                                                   // 930
});                                                                                                                   // 931
JSON.stringify(result);                                                                                               // 932
*/                                                                                                                    // 933
    // then with a couple of manual re-arrangements to be alphabetical                                                // 934
    // then changed Kazakhstan from +76 to +7                                                                         // 935
    // and Vatican City from +379 to +39 (see issue 50)                                                               // 936
    // and Caribean Netherlands from +5997 to +599                                                                    // 937
    // and Curacao from +5999 to +599                                                                                 // 938
    // Removed: Åland Islands, Christmas Island, Cocos Islands, Guernsey, Isle of Man, Jersey, Kosovo, Mayotte, Pitcairn Islands, South Georgia, Svalbard, Western Sahara
    // Update: converted objects to arrays to save bytes!                                                             // 940
    // Update: added "priority" for countries with the same dialCode as others                                        // 941
    // Update: added array of area codes for countries with the same dialCode as others                               // 942
    // So each country array has the following information:                                                           // 943
    // [                                                                                                              // 944
    //    Country name,                                                                                               // 945
    //    iso2 code,                                                                                                  // 946
    //    International dial code,                                                                                    // 947
    //    Order (if >1 country with same dial code),                                                                  // 948
    //    Area codes (if >1 country with same dial code)                                                              // 949
    // ]                                                                                                              // 950
    var allCountries = [ [ "Afghanistan (‫افغانستان‬‎)", "af", "93" ], [ "Albania (Shqipëri)", "al", "355" ], [ "Algeria (‫الجزائر‬‎)", "dz", "213" ], [ "American Samoa", "as", "1684" ], [ "Andorra", "ad", "376" ], [ "Angola", "ao", "244" ], [ "Anguilla", "ai", "1264" ], [ "Antigua and Barbuda", "ag", "1268" ], [ "Argentina", "ar", "54" ], [ "Armenia (Հայաստան)", "am", "374" ], [ "Aruba", "aw", "297" ], [ "Australia", "au", "61" ], [ "Austria (Österreich)", "at", "43" ], [ "Azerbaijan (Azərbaycan)", "az", "994" ], [ "Bahamas", "bs", "1242" ], [ "Bahrain (‫البحرين‬‎)", "bh", "973" ], [ "Bangladesh (বাংলাদেশ)", "bd", "880" ], [ "Barbados", "bb", "1246" ], [ "Belarus (Беларусь)", "by", "375" ], [ "Belgium (België)", "be", "32" ], [ "Belize", "bz", "501" ], [ "Benin (Bénin)", "bj", "229" ], [ "Bermuda", "bm", "1441" ], [ "Bhutan (འབྲུག)", "bt", "975" ], [ "Bolivia", "bo", "591" ], [ "Bosnia and Herzegovina (Босна и Херцеговина)", "ba", "387" ], [ "Botswana", "bw", "267" ], [ "Brazil (Brasil)", "br", "55" ], [ "British Indian Ocean Territory", "io", "246" ], [ "British Virgin Islands", "vg", "1284" ], [ "Brunei", "bn", "673" ], [ "Bulgaria (България)", "bg", "359" ], [ "Burkina Faso", "bf", "226" ], [ "Burundi (Uburundi)", "bi", "257" ], [ "Cambodia (កម្ពុជា)", "kh", "855" ], [ "Cameroon (Cameroun)", "cm", "237" ], [ "Canada", "ca", "1", 1, [ "204", "236", "249", "250", "289", "306", "343", "365", "387", "403", "416", "418", "431", "437", "438", "450", "506", "514", "519", "548", "579", "581", "587", "604", "613", "639", "647", "672", "705", "709", "742", "778", "780", "782", "807", "819", "825", "867", "873", "902", "905" ] ], [ "Cape Verde (Kabu Verdi)", "cv", "238" ], [ "Caribbean Netherlands", "bq", "599", 1 ], [ "Cayman Islands", "ky", "1345" ], [ "Central African Republic (République centrafricaine)", "cf", "236" ], [ "Chad (Tchad)", "td", "235" ], [ "Chile", "cl", "56" ], [ "China (中国)", "cn", "86" ], [ "Colombia", "co", "57" ], [ "Comoros (‫جزر القمر‬‎)", "km", "269" ], [ "Congo (DRC) (Jamhuri ya Kidemokrasia ya Kongo)", "cd", "243" ], [ "Congo (Republic) (Congo-Brazzaville)", "cg", "242" ], [ "Cook Islands", "ck", "682" ], [ "Costa Rica", "cr", "506" ], [ "Côte d’Ivoire", "ci", "225" ], [ "Croatia (Hrvatska)", "hr", "385" ], [ "Cuba", "cu", "53" ], [ "Curaçao", "cw", "599", 0 ], [ "Cyprus (Κύπρος)", "cy", "357" ], [ "Czech Republic (Česká republika)", "cz", "420" ], [ "Denmark (Danmark)", "dk", "45" ], [ "Djibouti", "dj", "253" ], [ "Dominica", "dm", "1767" ], [ "Dominican Republic (República Dominicana)", "do", "1", 2, [ "809", "829", "849" ] ], [ "Ecuador", "ec", "593" ], [ "Egypt (‫مصر‬‎)", "eg", "20" ], [ "El Salvador", "sv", "503" ], [ "Equatorial Guinea (Guinea Ecuatorial)", "gq", "240" ], [ "Eritrea", "er", "291" ], [ "Estonia (Eesti)", "ee", "372" ], [ "Ethiopia", "et", "251" ], [ "Falkland Islands (Islas Malvinas)", "fk", "500" ], [ "Faroe Islands (Føroyar)", "fo", "298" ], [ "Fiji", "fj", "679" ], [ "Finland (Suomi)", "fi", "358" ], [ "France", "fr", "33" ], [ "French Guiana (Guyane française)", "gf", "594" ], [ "French Polynesia (Polynésie française)", "pf", "689" ], [ "Gabon", "ga", "241" ], [ "Gambia", "gm", "220" ], [ "Georgia (საქართველო)", "ge", "995" ], [ "Germany (Deutschland)", "de", "49" ], [ "Ghana (Gaana)", "gh", "233" ], [ "Gibraltar", "gi", "350" ], [ "Greece (Ελλάδα)", "gr", "30" ], [ "Greenland (Kalaallit Nunaat)", "gl", "299" ], [ "Grenada", "gd", "1473" ], [ "Guadeloupe", "gp", "590", 0 ], [ "Guam", "gu", "1671" ], [ "Guatemala", "gt", "502" ], [ "Guinea (Guinée)", "gn", "224" ], [ "Guinea-Bissau (Guiné Bissau)", "gw", "245" ], [ "Guyana", "gy", "592" ], [ "Haiti", "ht", "509" ], [ "Honduras", "hn", "504" ], [ "Hong Kong (香港)", "hk", "852" ], [ "Hungary (Magyarország)", "hu", "36" ], [ "Iceland (Ísland)", "is", "354" ], [ "India (भारत)", "in", "91" ], [ "Indonesia", "id", "62" ], [ "Iran (‫ایران‬‎)", "ir", "98" ], [ "Iraq (‫العراق‬‎)", "iq", "964" ], [ "Ireland", "ie", "353" ], [ "Israel (‫ישראל‬‎)", "il", "972" ], [ "Italy (Italia)", "it", "39", 0 ], [ "Jamaica", "jm", "1876" ], [ "Japan (日本)", "jp", "81" ], [ "Jordan (‫الأردن‬‎)", "jo", "962" ], [ "Kazakhstan (Казахстан)", "kz", "7", 1 ], [ "Kenya", "ke", "254" ], [ "Kiribati", "ki", "686" ], [ "Kuwait (‫الكويت‬‎)", "kw", "965" ], [ "Kyrgyzstan (Кыргызстан)", "kg", "996" ], [ "Laos (ລາວ)", "la", "856" ], [ "Latvia (Latvija)", "lv", "371" ], [ "Lebanon (‫لبنان‬‎)", "lb", "961" ], [ "Lesotho", "ls", "266" ], [ "Liberia", "lr", "231" ], [ "Libya (‫ليبيا‬‎)", "ly", "218" ], [ "Liechtenstein", "li", "423" ], [ "Lithuania (Lietuva)", "lt", "370" ], [ "Luxembourg", "lu", "352" ], [ "Macau (澳門)", "mo", "853" ], [ "Macedonia (FYROM) (Македонија)", "mk", "389" ], [ "Madagascar (Madagasikara)", "mg", "261" ], [ "Malawi", "mw", "265" ], [ "Malaysia", "my", "60" ], [ "Maldives", "mv", "960" ], [ "Mali", "ml", "223" ], [ "Malta", "mt", "356" ], [ "Marshall Islands", "mh", "692" ], [ "Martinique", "mq", "596" ], [ "Mauritania (‫موريتانيا‬‎)", "mr", "222" ], [ "Mauritius (Moris)", "mu", "230" ], [ "Mexico (México)", "mx", "52" ], [ "Micronesia", "fm", "691" ], [ "Moldova (Republica Moldova)", "md", "373" ], [ "Monaco", "mc", "377" ], [ "Mongolia (Монгол)", "mn", "976" ], [ "Montenegro (Crna Gora)", "me", "382" ], [ "Montserrat", "ms", "1664" ], [ "Morocco (‫المغرب‬‎)", "ma", "212" ], [ "Mozambique (Moçambique)", "mz", "258" ], [ "Myanmar (Burma) (မြန်မာ)", "mm", "95" ], [ "Namibia (Namibië)", "na", "264" ], [ "Nauru", "nr", "674" ], [ "Nepal (नेपाल)", "np", "977" ], [ "Netherlands (Nederland)", "nl", "31" ], [ "New Caledonia (Nouvelle-Calédonie)", "nc", "687" ], [ "New Zealand", "nz", "64" ], [ "Nicaragua", "ni", "505" ], [ "Niger (Nijar)", "ne", "227" ], [ "Nigeria", "ng", "234" ], [ "Niue", "nu", "683" ], [ "Norfolk Island", "nf", "672" ], [ "North Korea (조선 민주주의 인민 공화국)", "kp", "850" ], [ "Northern Mariana Islands", "mp", "1670" ], [ "Norway (Norge)", "no", "47" ], [ "Oman (‫عُمان‬‎)", "om", "968" ], [ "Pakistan (‫پاکستان‬‎)", "pk", "92" ], [ "Palau", "pw", "680" ], [ "Palestine (‫فلسطين‬‎)", "ps", "970" ], [ "Panama (Panamá)", "pa", "507" ], [ "Papua New Guinea", "pg", "675" ], [ "Paraguay", "py", "595" ], [ "Peru (Perú)", "pe", "51" ], [ "Philippines", "ph", "63" ], [ "Poland (Polska)", "pl", "48" ], [ "Portugal", "pt", "351" ], [ "Puerto Rico", "pr", "1", 3, [ "787", "939" ] ], [ "Qatar (‫قطر‬‎)", "qa", "974" ], [ "Réunion (La Réunion)", "re", "262" ], [ "Romania (România)", "ro", "40" ], [ "Russia (Россия)", "ru", "7", 0 ], [ "Rwanda", "rw", "250" ], [ "Saint Barthélemy (Saint-Barthélemy)", "bl", "590", 1 ], [ "Saint Helena", "sh", "290" ], [ "Saint Kitts and Nevis", "kn", "1869" ], [ "Saint Lucia", "lc", "1758" ], [ "Saint Martin (Saint-Martin (partie française))", "mf", "590", 2 ], [ "Saint Pierre and Miquelon (Saint-Pierre-et-Miquelon)", "pm", "508" ], [ "Saint Vincent and the Grenadines", "vc", "1784" ], [ "Samoa", "ws", "685" ], [ "San Marino", "sm", "378" ], [ "São Tomé and Príncipe (São Tomé e Príncipe)", "st", "239" ], [ "Saudi Arabia (‫المملكة العربية السعودية‬‎)", "sa", "966" ], [ "Senegal (Sénégal)", "sn", "221" ], [ "Serbia (Србија)", "rs", "381" ], [ "Seychelles", "sc", "248" ], [ "Sierra Leone", "sl", "232" ], [ "Singapore", "sg", "65" ], [ "Sint Maarten", "sx", "1721" ], [ "Slovakia (Slovensko)", "sk", "421" ], [ "Slovenia (Slovenija)", "si", "386" ], [ "Solomon Islands", "sb", "677" ], [ "Somalia (Soomaaliya)", "so", "252" ], [ "South Africa", "za", "27" ], [ "South Korea (대한민국)", "kr", "82" ], [ "South Sudan (‫جنوب السودان‬‎)", "ss", "211" ], [ "Spain (España)", "es", "34" ], [ "Sri Lanka (ශ්‍රී ලංකාව)", "lk", "94" ], [ "Sudan (‫السودان‬‎)", "sd", "249" ], [ "Suriname", "sr", "597" ], [ "Swaziland", "sz", "268" ], [ "Sweden (Sverige)", "se", "46" ], [ "Switzerland (Schweiz)", "ch", "41" ], [ "Syria (‫سوريا‬‎)", "sy", "963" ], [ "Taiwan (台灣)", "tw", "886" ], [ "Tajikistan", "tj", "992" ], [ "Tanzania", "tz", "255" ], [ "Thailand (ไทย)", "th", "66" ], [ "Timor-Leste", "tl", "670" ], [ "Togo", "tg", "228" ], [ "Tokelau", "tk", "690" ], [ "Tonga", "to", "676" ], [ "Trinidad and Tobago", "tt", "1868" ], [ "Tunisia (‫تونس‬‎)", "tn", "216" ], [ "Turkey (Türkiye)", "tr", "90" ], [ "Turkmenistan", "tm", "993" ], [ "Turks and Caicos Islands", "tc", "1649" ], [ "Tuvalu", "tv", "688" ], [ "U.S. Virgin Islands", "vi", "1340" ], [ "Uganda", "ug", "256" ], [ "Ukraine (Україна)", "ua", "380" ], [ "United Arab Emirates (‫الإمارات العربية المتحدة‬‎)", "ae", "971" ], [ "United Kingdom", "gb", "44" ], [ "United States", "us", "1", 0 ], [ "Uruguay", "uy", "598" ], [ "Uzbekistan (Oʻzbekiston)", "uz", "998" ], [ "Vanuatu", "vu", "678" ], [ "Vatican City (Città del Vaticano)", "va", "39", 1 ], [ "Venezuela", "ve", "58" ], [ "Vietnam (Việt Nam)", "vn", "84" ], [ "Wallis and Futuna", "wf", "681" ], [ "Yemen (‫اليمن‬‎)", "ye", "967" ], [ "Zambia", "zm", "260" ], [ "Zimbabwe", "zw", "263" ] ];
    // loop over all of the countries above                                                                           // 952
    for (var i = 0; i < allCountries.length; i++) {                                                                   // 953
        var c = allCountries[i];                                                                                      // 954
        allCountries[i] = {                                                                                           // 955
            name: c[0],                                                                                               // 956
            iso2: c[1],                                                                                               // 957
            dialCode: c[2],                                                                                           // 958
            priority: c[3] || 0,                                                                                      // 959
            areaCodes: c[4] || null                                                                                   // 960
        };                                                                                                            // 961
    }                                                                                                                 // 962
});                                                                                                                    // 963
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);

///////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
Package._define("ctjp:meteor-intl-tel-input");

})();
