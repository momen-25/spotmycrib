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

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/themeteorchef_jquery-validation/packages/themeteorchef_jquery-validation.js                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/themeteorchef:jquery-validation/lib/jquery-validation/src/core.js                                       //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
$.extend($.fn, {                                                                                                    // 1
	// http://jqueryvalidation.org/validate/                                                                           // 2
	validate: function( options ) {                                                                                    // 3
                                                                                                                    // 4
		// if nothing is selected, return nothing; can't chain anyway                                                     // 5
		if ( !this.length ) {                                                                                             // 6
			if ( options && options.debug && window.console ) {                                                              // 7
				console.warn( "Nothing selected, can't validate, returning nothing." );                                         // 8
			}                                                                                                                // 9
			return;                                                                                                          // 10
		}                                                                                                                 // 11
                                                                                                                    // 12
		// check if a validator for this form was already created                                                         // 13
		var validator = $.data( this[ 0 ], "validator" );                                                                 // 14
		if ( validator ) {                                                                                                // 15
			return validator;                                                                                                // 16
		}                                                                                                                 // 17
                                                                                                                    // 18
		// Add novalidate tag if HTML5.                                                                                   // 19
		this.attr( "novalidate", "novalidate" );                                                                          // 20
                                                                                                                    // 21
		validator = new $.validator( options, this[ 0 ] );                                                                // 22
		$.data( this[ 0 ], "validator", validator );                                                                      // 23
                                                                                                                    // 24
		if ( validator.settings.onsubmit ) {                                                                              // 25
                                                                                                                    // 26
			this.on( "click.validate", ":submit", function( event ) {                                                        // 27
				if ( validator.settings.submitHandler ) {                                                                       // 28
					validator.submitButton = event.target;                                                                         // 29
				}                                                                                                               // 30
                                                                                                                    // 31
				// allow suppressing validation by adding a cancel class to the submit button                                   // 32
				if ( $( this ).hasClass( "cancel" ) ) {                                                                         // 33
					validator.cancelSubmit = true;                                                                                 // 34
				}                                                                                                               // 35
                                                                                                                    // 36
				// allow suppressing validation by adding the html5 formnovalidate attribute to the submit button               // 37
				if ( $( this ).attr( "formnovalidate" ) !== undefined ) {                                                       // 38
					validator.cancelSubmit = true;                                                                                 // 39
				}                                                                                                               // 40
			});                                                                                                              // 41
                                                                                                                    // 42
			// validate the form on submit                                                                                   // 43
			this.on( "submit.validate", function( event ) {                                                                  // 44
				if ( validator.settings.debug ) {                                                                               // 45
					// prevent form submit to be able to see console output                                                        // 46
					event.preventDefault();                                                                                        // 47
				}                                                                                                               // 48
				function handle() {                                                                                             // 49
					var hidden, result;                                                                                            // 50
					if ( validator.settings.submitHandler ) {                                                                      // 51
						if ( validator.submitButton ) {                                                                               // 52
							// insert a hidden input as a replacement for the missing submit button                                      // 53
							hidden = $( "<input type='hidden'/>" )                                                                       // 54
								.attr( "name", validator.submitButton.name )                                                                // 55
								.val( $( validator.submitButton ).val() )                                                                   // 56
								.appendTo( validator.currentForm );                                                                         // 57
						}                                                                                                             // 58
						result = validator.settings.submitHandler.call( validator, validator.currentForm, event );                    // 59
						if ( validator.submitButton ) {                                                                               // 60
							// and clean up afterwards; thanks to no-block-scope, hidden can be referenced                               // 61
							hidden.remove();                                                                                             // 62
						}                                                                                                             // 63
						if ( result !== undefined ) {                                                                                 // 64
							return result;                                                                                               // 65
						}                                                                                                             // 66
						return false;                                                                                                 // 67
					}                                                                                                              // 68
					return true;                                                                                                   // 69
				}                                                                                                               // 70
                                                                                                                    // 71
				// prevent submit for invalid forms or custom submit handlers                                                   // 72
				if ( validator.cancelSubmit ) {                                                                                 // 73
					validator.cancelSubmit = false;                                                                                // 74
					return handle();                                                                                               // 75
				}                                                                                                               // 76
				if ( validator.form() ) {                                                                                       // 77
					if ( validator.pendingRequest ) {                                                                              // 78
						validator.formSubmitted = true;                                                                               // 79
						return false;                                                                                                 // 80
					}                                                                                                              // 81
					return handle();                                                                                               // 82
				} else {                                                                                                        // 83
					validator.focusInvalid();                                                                                      // 84
					return false;                                                                                                  // 85
				}                                                                                                               // 86
			});                                                                                                              // 87
		}                                                                                                                 // 88
                                                                                                                    // 89
		return validator;                                                                                                 // 90
	},                                                                                                                 // 91
	// http://jqueryvalidation.org/valid/                                                                              // 92
	valid: function() {                                                                                                // 93
		var valid, validator, errorList;                                                                                  // 94
                                                                                                                    // 95
		if ( $( this[ 0 ] ).is( "form" ) ) {                                                                              // 96
			valid = this.validate().form();                                                                                  // 97
		} else {                                                                                                          // 98
			errorList = [];                                                                                                  // 99
			valid = true;                                                                                                    // 100
			validator = $( this[ 0 ].form ).validate();                                                                      // 101
			this.each( function() {                                                                                          // 102
				valid = validator.element( this ) && valid;                                                                     // 103
				errorList = errorList.concat( validator.errorList );                                                            // 104
			});                                                                                                              // 105
			validator.errorList = errorList;                                                                                 // 106
		}                                                                                                                 // 107
		return valid;                                                                                                     // 108
	},                                                                                                                 // 109
                                                                                                                    // 110
	// http://jqueryvalidation.org/rules/                                                                              // 111
	rules: function( command, argument ) {                                                                             // 112
		var element = this[ 0 ],                                                                                          // 113
			settings, staticRules, existingRules, data, param, filtered;                                                     // 114
                                                                                                                    // 115
		if ( command ) {                                                                                                  // 116
			settings = $.data( element.form, "validator" ).settings;                                                         // 117
			staticRules = settings.rules;                                                                                    // 118
			existingRules = $.validator.staticRules( element );                                                              // 119
			switch ( command ) {                                                                                             // 120
			case "add":                                                                                                      // 121
				$.extend( existingRules, $.validator.normalizeRule( argument ) );                                               // 122
				// remove messages from rules, but allow them to be set separately                                              // 123
				delete existingRules.messages;                                                                                  // 124
				staticRules[ element.name ] = existingRules;                                                                    // 125
				if ( argument.messages ) {                                                                                      // 126
					settings.messages[ element.name ] = $.extend( settings.messages[ element.name ], argument.messages );          // 127
				}                                                                                                               // 128
				break;                                                                                                          // 129
			case "remove":                                                                                                   // 130
				if ( !argument ) {                                                                                              // 131
					delete staticRules[ element.name ];                                                                            // 132
					return existingRules;                                                                                          // 133
				}                                                                                                               // 134
				filtered = {};                                                                                                  // 135
				$.each( argument.split( /\s/ ), function( index, method ) {                                                     // 136
					filtered[ method ] = existingRules[ method ];                                                                  // 137
					delete existingRules[ method ];                                                                                // 138
					if ( method === "required" ) {                                                                                 // 139
						$( element ).removeAttr( "aria-required" );                                                                   // 140
					}                                                                                                              // 141
				});                                                                                                             // 142
				return filtered;                                                                                                // 143
			}                                                                                                                // 144
		}                                                                                                                 // 145
                                                                                                                    // 146
		data = $.validator.normalizeRules(                                                                                // 147
		$.extend(                                                                                                         // 148
			{},                                                                                                              // 149
			$.validator.classRules( element ),                                                                               // 150
			$.validator.attributeRules( element ),                                                                           // 151
			$.validator.dataRules( element ),                                                                                // 152
			$.validator.staticRules( element )                                                                               // 153
		), element );                                                                                                     // 154
                                                                                                                    // 155
		// make sure required is at front                                                                                 // 156
		if ( data.required ) {                                                                                            // 157
			param = data.required;                                                                                           // 158
			delete data.required;                                                                                            // 159
			data = $.extend( { required: param }, data );                                                                    // 160
			$( element ).attr( "aria-required", "true" );                                                                    // 161
		}                                                                                                                 // 162
                                                                                                                    // 163
		// make sure remote is at back                                                                                    // 164
		if ( data.remote ) {                                                                                              // 165
			param = data.remote;                                                                                             // 166
			delete data.remote;                                                                                              // 167
			data = $.extend( data, { remote: param });                                                                       // 168
		}                                                                                                                 // 169
                                                                                                                    // 170
		return data;                                                                                                      // 171
	}                                                                                                                  // 172
});                                                                                                                 // 173
                                                                                                                    // 174
// Custom selectors                                                                                                 // 175
$.extend( $.expr[ ":" ], {                                                                                          // 176
	// http://jqueryvalidation.org/blank-selector/                                                                     // 177
	blank: function( a ) {                                                                                             // 178
		return !$.trim( "" + $( a ).val() );                                                                              // 179
	},                                                                                                                 // 180
	// http://jqueryvalidation.org/filled-selector/                                                                    // 181
	filled: function( a ) {                                                                                            // 182
		return !!$.trim( "" + $( a ).val() );                                                                             // 183
	},                                                                                                                 // 184
	// http://jqueryvalidation.org/unchecked-selector/                                                                 // 185
	unchecked: function( a ) {                                                                                         // 186
		return !$( a ).prop( "checked" );                                                                                 // 187
	}                                                                                                                  // 188
});                                                                                                                 // 189
                                                                                                                    // 190
// constructor for validator                                                                                        // 191
$.validator = function( options, form ) {                                                                           // 192
	this.settings = $.extend( true, {}, $.validator.defaults, options );                                               // 193
	this.currentForm = form;                                                                                           // 194
	this.init();                                                                                                       // 195
};                                                                                                                  // 196
                                                                                                                    // 197
// http://jqueryvalidation.org/jQuery.validator.format/                                                             // 198
$.validator.format = function( source, params ) {                                                                   // 199
	if ( arguments.length === 1 ) {                                                                                    // 200
		return function() {                                                                                               // 201
			var args = $.makeArray( arguments );                                                                             // 202
			args.unshift( source );                                                                                          // 203
			return $.validator.format.apply( this, args );                                                                   // 204
		};                                                                                                                // 205
	}                                                                                                                  // 206
	if ( arguments.length > 2 && params.constructor !== Array  ) {                                                     // 207
		params = $.makeArray( arguments ).slice( 1 );                                                                     // 208
	}                                                                                                                  // 209
	if ( params.constructor !== Array ) {                                                                              // 210
		params = [ params ];                                                                                              // 211
	}                                                                                                                  // 212
	$.each( params, function( i, n ) {                                                                                 // 213
		source = source.replace( new RegExp( "\\{" + i + "\\}", "g" ), function() {                                       // 214
			return n;                                                                                                        // 215
		});                                                                                                               // 216
	});                                                                                                                // 217
	return source;                                                                                                     // 218
};                                                                                                                  // 219
                                                                                                                    // 220
$.extend( $.validator, {                                                                                            // 221
                                                                                                                    // 222
	defaults: {                                                                                                        // 223
		messages: {},                                                                                                     // 224
		groups: {},                                                                                                       // 225
		rules: {},                                                                                                        // 226
		errorClass: "error",                                                                                              // 227
		validClass: "valid",                                                                                              // 228
		errorElement: "label",                                                                                            // 229
		focusCleanup: false,                                                                                              // 230
		focusInvalid: true,                                                                                               // 231
		errorContainer: $( [] ),                                                                                          // 232
		errorLabelContainer: $( [] ),                                                                                     // 233
		onsubmit: true,                                                                                                   // 234
		ignore: ":hidden",                                                                                                // 235
		ignoreTitle: false,                                                                                               // 236
		onfocusin: function( element ) {                                                                                  // 237
			this.lastActive = element;                                                                                       // 238
                                                                                                                    // 239
			// Hide error label and remove error class on focus if enabled                                                   // 240
			if ( this.settings.focusCleanup ) {                                                                              // 241
				if ( this.settings.unhighlight ) {                                                                              // 242
					this.settings.unhighlight.call( this, element, this.settings.errorClass, this.settings.validClass );           // 243
				}                                                                                                               // 244
				this.hideThese( this.errorsFor( element ) );                                                                    // 245
			}                                                                                                                // 246
		},                                                                                                                // 247
		onfocusout: function( element ) {                                                                                 // 248
			if ( !this.checkable( element ) && ( element.name in this.submitted || !this.optional( element ) ) ) {           // 249
				this.element( element );                                                                                        // 250
			}                                                                                                                // 251
		},                                                                                                                // 252
		onkeyup: function( element, event ) {                                                                             // 253
			// Avoid revalidate the field when pressing one of the following keys                                            // 254
			// Shift       => 16                                                                                             // 255
			// Ctrl        => 17                                                                                             // 256
			// Alt         => 18                                                                                             // 257
			// Caps lock   => 20                                                                                             // 258
			// End         => 35                                                                                             // 259
			// Home        => 36                                                                                             // 260
			// Left arrow  => 37                                                                                             // 261
			// Up arrow    => 38                                                                                             // 262
			// Right arrow => 39                                                                                             // 263
			// Down arrow  => 40                                                                                             // 264
			// Insert      => 45                                                                                             // 265
			// Num lock    => 144                                                                                            // 266
			// AltGr key   => 225                                                                                            // 267
			var excludedKeys = [                                                                                             // 268
				16, 17, 18, 20, 35, 36, 37,                                                                                     // 269
				38, 39, 40, 45, 144, 225                                                                                        // 270
			];                                                                                                               // 271
                                                                                                                    // 272
			if ( event.which === 9 && this.elementValue( element ) === "" || $.inArray( event.keyCode, excludedKeys ) !== -1 ) {
				return;                                                                                                         // 274
			} else if ( element.name in this.submitted || element === this.lastElement ) {                                   // 275
				this.element( element );                                                                                        // 276
			}                                                                                                                // 277
		},                                                                                                                // 278
		onclick: function( element ) {                                                                                    // 279
			// click on selects, radiobuttons and checkboxes                                                                 // 280
			if ( element.name in this.submitted ) {                                                                          // 281
				this.element( element );                                                                                        // 282
                                                                                                                    // 283
			// or option elements, check parent select in that case                                                          // 284
			} else if ( element.parentNode.name in this.submitted ) {                                                        // 285
				this.element( element.parentNode );                                                                             // 286
			}                                                                                                                // 287
		},                                                                                                                // 288
		highlight: function( element, errorClass, validClass ) {                                                          // 289
			if ( element.type === "radio" ) {                                                                                // 290
				this.findByName( element.name ).addClass( errorClass ).removeClass( validClass );                               // 291
			} else {                                                                                                         // 292
				$( element ).addClass( errorClass ).removeClass( validClass );                                                  // 293
			}                                                                                                                // 294
		},                                                                                                                // 295
		unhighlight: function( element, errorClass, validClass ) {                                                        // 296
			if ( element.type === "radio" ) {                                                                                // 297
				this.findByName( element.name ).removeClass( errorClass ).addClass( validClass );                               // 298
			} else {                                                                                                         // 299
				$( element ).removeClass( errorClass ).addClass( validClass );                                                  // 300
			}                                                                                                                // 301
		}                                                                                                                 // 302
	},                                                                                                                 // 303
                                                                                                                    // 304
	// http://jqueryvalidation.org/jQuery.validator.setDefaults/                                                       // 305
	setDefaults: function( settings ) {                                                                                // 306
		$.extend( $.validator.defaults, settings );                                                                       // 307
	},                                                                                                                 // 308
                                                                                                                    // 309
	messages: {                                                                                                        // 310
		required: "This field is required.",                                                                              // 311
		remote: "Please fix this field.",                                                                                 // 312
		email: "Please enter a valid email address.",                                                                     // 313
		url: "Please enter a valid URL.",                                                                                 // 314
		date: "Please enter a valid date.",                                                                               // 315
		dateISO: "Please enter a valid date ( ISO ).",                                                                    // 316
		number: "Please enter a valid number.",                                                                           // 317
		digits: "Please enter only digits.",                                                                              // 318
		creditcard: "Please enter a valid credit card number.",                                                           // 319
		equalTo: "Please enter the same value again.",                                                                    // 320
		maxlength: $.validator.format( "Please enter no more than {0} characters." ),                                     // 321
		minlength: $.validator.format( "Please enter at least {0} characters." ),                                         // 322
		rangelength: $.validator.format( "Please enter a value between {0} and {1} characters long." ),                   // 323
		range: $.validator.format( "Please enter a value between {0} and {1}." ),                                         // 324
		max: $.validator.format( "Please enter a value less than or equal to {0}." ),                                     // 325
		min: $.validator.format( "Please enter a value greater than or equal to {0}." )                                   // 326
	},                                                                                                                 // 327
                                                                                                                    // 328
	autoCreateRanges: false,                                                                                           // 329
                                                                                                                    // 330
	prototype: {                                                                                                       // 331
                                                                                                                    // 332
		init: function() {                                                                                                // 333
			this.labelContainer = $( this.settings.errorLabelContainer );                                                    // 334
			this.errorContext = this.labelContainer.length && this.labelContainer || $( this.currentForm );                  // 335
			this.containers = $( this.settings.errorContainer ).add( this.settings.errorLabelContainer );                    // 336
			this.submitted = {};                                                                                             // 337
			this.valueCache = {};                                                                                            // 338
			this.pendingRequest = 0;                                                                                         // 339
			this.pending = {};                                                                                               // 340
			this.invalid = {};                                                                                               // 341
			this.reset();                                                                                                    // 342
                                                                                                                    // 343
			var groups = ( this.groups = {} ),                                                                               // 344
				rules;                                                                                                          // 345
			$.each( this.settings.groups, function( key, value ) {                                                           // 346
				if ( typeof value === "string" ) {                                                                              // 347
					value = value.split( /\s/ );                                                                                   // 348
				}                                                                                                               // 349
				$.each( value, function( index, name ) {                                                                        // 350
					groups[ name ] = key;                                                                                          // 351
				});                                                                                                             // 352
			});                                                                                                              // 353
			rules = this.settings.rules;                                                                                     // 354
			$.each( rules, function( key, value ) {                                                                          // 355
				rules[ key ] = $.validator.normalizeRule( value );                                                              // 356
			});                                                                                                              // 357
                                                                                                                    // 358
			function delegate( event ) {                                                                                     // 359
				var validator = $.data( this.form, "validator" ),                                                               // 360
					eventType = "on" + event.type.replace( /^validate/, "" ),                                                      // 361
					settings = validator.settings;                                                                                 // 362
				if ( settings[ eventType ] && !$( this ).is( settings.ignore ) ) {                                              // 363
					settings[ eventType ].call( validator, this, event );                                                          // 364
				}                                                                                                               // 365
			}                                                                                                                // 366
                                                                                                                    // 367
			$( this.currentForm )                                                                                            // 368
				.on( "focusin.validate focusout.validate keyup.validate",                                                       // 369
					":text, [type='password'], [type='file'], select, textarea, [type='number'], [type='search'], " +              // 370
					"[type='tel'], [type='url'], [type='email'], [type='datetime'], [type='date'], [type='month'], " +             // 371
					"[type='week'], [type='time'], [type='datetime-local'], [type='range'], [type='color'], " +                    // 372
					"[type='radio'], [type='checkbox']", delegate)                                                                 // 373
				// Support: Chrome, oldIE                                                                                       // 374
				// "select" is provided as event.target when clicking a option                                                  // 375
				.on("click.validate", "select, option, [type='radio'], [type='checkbox']", delegate);                           // 376
                                                                                                                    // 377
			if ( this.settings.invalidHandler ) {                                                                            // 378
				$( this.currentForm ).on( "invalid-form.validate", this.settings.invalidHandler );                              // 379
			}                                                                                                                // 380
                                                                                                                    // 381
			// Add aria-required to any Static/Data/Class required fields before first validation                            // 382
			// Screen readers require this attribute to be present before the initial submission http://www.w3.org/TR/WCAG-TECHS/ARIA2.html
			$( this.currentForm ).find( "[required], [data-rule-required], .required" ).attr( "aria-required", "true" );     // 384
		},                                                                                                                // 385
                                                                                                                    // 386
		// http://jqueryvalidation.org/Validator.form/                                                                    // 387
		form: function() {                                                                                                // 388
			this.checkForm();                                                                                                // 389
			$.extend( this.submitted, this.errorMap );                                                                       // 390
			this.invalid = $.extend({}, this.errorMap );                                                                     // 391
			if ( !this.valid() ) {                                                                                           // 392
				$( this.currentForm ).triggerHandler( "invalid-form", [ this ]);                                                // 393
			}                                                                                                                // 394
			this.showErrors();                                                                                               // 395
			return this.valid();                                                                                             // 396
		},                                                                                                                // 397
                                                                                                                    // 398
		checkForm: function() {                                                                                           // 399
			this.prepareForm();                                                                                              // 400
			for ( var i = 0, elements = ( this.currentElements = this.elements() ); elements[ i ]; i++ ) {                   // 401
				this.check( elements[ i ] );                                                                                    // 402
			}                                                                                                                // 403
			return this.valid();                                                                                             // 404
		},                                                                                                                // 405
                                                                                                                    // 406
		// http://jqueryvalidation.org/Validator.element/                                                                 // 407
		element: function( element ) {                                                                                    // 408
			var cleanElement = this.clean( element ),                                                                        // 409
				checkElement = this.validationTargetFor( cleanElement ),                                                        // 410
				result = true;                                                                                                  // 411
                                                                                                                    // 412
			this.lastElement = checkElement;                                                                                 // 413
                                                                                                                    // 414
			if ( checkElement === undefined ) {                                                                              // 415
				delete this.invalid[ cleanElement.name ];                                                                       // 416
			} else {                                                                                                         // 417
				this.prepareElement( checkElement );                                                                            // 418
				this.currentElements = $( checkElement );                                                                       // 419
                                                                                                                    // 420
				result = this.check( checkElement ) !== false;                                                                  // 421
				if ( result ) {                                                                                                 // 422
					delete this.invalid[ checkElement.name ];                                                                      // 423
				} else {                                                                                                        // 424
					this.invalid[ checkElement.name ] = true;                                                                      // 425
				}                                                                                                               // 426
			}                                                                                                                // 427
			// Add aria-invalid status for screen readers                                                                    // 428
			$( element ).attr( "aria-invalid", !result );                                                                    // 429
                                                                                                                    // 430
			if ( !this.numberOfInvalids() ) {                                                                                // 431
				// Hide error containers on last error                                                                          // 432
				this.toHide = this.toHide.add( this.containers );                                                               // 433
			}                                                                                                                // 434
			this.showErrors();                                                                                               // 435
			return result;                                                                                                   // 436
		},                                                                                                                // 437
                                                                                                                    // 438
		// http://jqueryvalidation.org/Validator.showErrors/                                                              // 439
		showErrors: function( errors ) {                                                                                  // 440
			if ( errors ) {                                                                                                  // 441
				// add items to error list and map                                                                              // 442
				$.extend( this.errorMap, errors );                                                                              // 443
				this.errorList = [];                                                                                            // 444
				for ( var name in errors ) {                                                                                    // 445
					this.errorList.push({                                                                                          // 446
						message: errors[ name ],                                                                                      // 447
						element: this.findByName( name )[ 0 ]                                                                         // 448
					});                                                                                                            // 449
				}                                                                                                               // 450
				// remove items from success list                                                                               // 451
				this.successList = $.grep( this.successList, function( element ) {                                              // 452
					return !( element.name in errors );                                                                            // 453
				});                                                                                                             // 454
			}                                                                                                                // 455
			if ( this.settings.showErrors ) {                                                                                // 456
				this.settings.showErrors.call( this, this.errorMap, this.errorList );                                           // 457
			} else {                                                                                                         // 458
				this.defaultShowErrors();                                                                                       // 459
			}                                                                                                                // 460
		},                                                                                                                // 461
                                                                                                                    // 462
		// http://jqueryvalidation.org/Validator.resetForm/                                                               // 463
		resetForm: function() {                                                                                           // 464
			if ( $.fn.resetForm ) {                                                                                          // 465
				$( this.currentForm ).resetForm();                                                                              // 466
			}                                                                                                                // 467
			this.submitted = {};                                                                                             // 468
			this.lastElement = null;                                                                                         // 469
			this.prepareForm();                                                                                              // 470
			this.hideErrors();                                                                                               // 471
			var i, elements = this.elements()                                                                                // 472
				.removeData( "previousValue" )                                                                                  // 473
				.removeAttr( "aria-invalid" );                                                                                  // 474
                                                                                                                    // 475
			if ( this.settings.unhighlight ) {                                                                               // 476
				for ( i = 0; elements[ i ]; i++ ) {                                                                             // 477
					this.settings.unhighlight.call( this, elements[ i ],                                                           // 478
						this.settings.errorClass, "" );                                                                               // 479
				}                                                                                                               // 480
			} else {                                                                                                         // 481
				elements.removeClass( this.settings.errorClass );                                                               // 482
			}                                                                                                                // 483
		},                                                                                                                // 484
                                                                                                                    // 485
		numberOfInvalids: function() {                                                                                    // 486
			return this.objectLength( this.invalid );                                                                        // 487
		},                                                                                                                // 488
                                                                                                                    // 489
		objectLength: function( obj ) {                                                                                   // 490
			/* jshint unused: false */                                                                                       // 491
			var count = 0,                                                                                                   // 492
				i;                                                                                                              // 493
			for ( i in obj ) {                                                                                               // 494
				count++;                                                                                                        // 495
			}                                                                                                                // 496
			return count;                                                                                                    // 497
		},                                                                                                                // 498
                                                                                                                    // 499
		hideErrors: function() {                                                                                          // 500
			this.hideThese( this.toHide );                                                                                   // 501
		},                                                                                                                // 502
                                                                                                                    // 503
		hideThese: function( errors ) {                                                                                   // 504
			errors.not( this.containers ).text( "" );                                                                        // 505
			this.addWrapper( errors ).hide();                                                                                // 506
		},                                                                                                                // 507
                                                                                                                    // 508
		valid: function() {                                                                                               // 509
			return this.size() === 0;                                                                                        // 510
		},                                                                                                                // 511
                                                                                                                    // 512
		size: function() {                                                                                                // 513
			return this.errorList.length;                                                                                    // 514
		},                                                                                                                // 515
                                                                                                                    // 516
		focusInvalid: function() {                                                                                        // 517
			if ( this.settings.focusInvalid ) {                                                                              // 518
				try {                                                                                                           // 519
					$( this.findLastActive() || this.errorList.length && this.errorList[ 0 ].element || [])                        // 520
					.filter( ":visible" )                                                                                          // 521
					.focus()                                                                                                       // 522
					// manually trigger focusin event; without it, focusin handler isn't called, findLastActive won't have anything to find
					.trigger( "focusin" );                                                                                         // 524
				} catch ( e ) {                                                                                                 // 525
					// ignore IE throwing errors when focusing hidden elements                                                     // 526
				}                                                                                                               // 527
			}                                                                                                                // 528
		},                                                                                                                // 529
                                                                                                                    // 530
		findLastActive: function() {                                                                                      // 531
			var lastActive = this.lastActive;                                                                                // 532
			return lastActive && $.grep( this.errorList, function( n ) {                                                     // 533
				return n.element.name === lastActive.name;                                                                      // 534
			}).length === 1 && lastActive;                                                                                   // 535
		},                                                                                                                // 536
                                                                                                                    // 537
		elements: function() {                                                                                            // 538
			var validator = this,                                                                                            // 539
				rulesCache = {};                                                                                                // 540
                                                                                                                    // 541
			// select all valid inputs inside the form (no submit or reset buttons)                                          // 542
			return $( this.currentForm )                                                                                     // 543
			.find( "input, select, textarea" )                                                                               // 544
			.not( ":submit, :reset, :image, :disabled" )                                                                     // 545
			.not( this.settings.ignore )                                                                                     // 546
			.filter( function() {                                                                                            // 547
				if ( !this.name && validator.settings.debug && window.console ) {                                               // 548
					console.error( "%o has no name assigned", this );                                                              // 549
				}                                                                                                               // 550
                                                                                                                    // 551
				// select only the first element for each name, and only those with rules specified                             // 552
				if ( this.name in rulesCache || !validator.objectLength( $( this ).rules() ) ) {                                // 553
					return false;                                                                                                  // 554
				}                                                                                                               // 555
                                                                                                                    // 556
				rulesCache[ this.name ] = true;                                                                                 // 557
				return true;                                                                                                    // 558
			});                                                                                                              // 559
		},                                                                                                                // 560
                                                                                                                    // 561
		clean: function( selector ) {                                                                                     // 562
			return $( selector )[ 0 ];                                                                                       // 563
		},                                                                                                                // 564
                                                                                                                    // 565
		errors: function() {                                                                                              // 566
			var errorClass = this.settings.errorClass.split( " " ).join( "." );                                              // 567
			return $( this.settings.errorElement + "." + errorClass, this.errorContext );                                    // 568
		},                                                                                                                // 569
                                                                                                                    // 570
		reset: function() {                                                                                               // 571
			this.successList = [];                                                                                           // 572
			this.errorList = [];                                                                                             // 573
			this.errorMap = {};                                                                                              // 574
			this.toShow = $( [] );                                                                                           // 575
			this.toHide = $( [] );                                                                                           // 576
			this.currentElements = $( [] );                                                                                  // 577
		},                                                                                                                // 578
                                                                                                                    // 579
		prepareForm: function() {                                                                                         // 580
			this.reset();                                                                                                    // 581
			this.toHide = this.errors().add( this.containers );                                                              // 582
		},                                                                                                                // 583
                                                                                                                    // 584
		prepareElement: function( element ) {                                                                             // 585
			this.reset();                                                                                                    // 586
			this.toHide = this.errorsFor( element );                                                                         // 587
		},                                                                                                                // 588
                                                                                                                    // 589
		elementValue: function( element ) {                                                                               // 590
			var val,                                                                                                         // 591
				$element = $( element ),                                                                                        // 592
				type = element.type;                                                                                            // 593
                                                                                                                    // 594
			if ( type === "radio" || type === "checkbox" ) {                                                                 // 595
				return this.findByName( element.name ).filter(":checked").val();                                                // 596
			} else if ( type === "number" && typeof element.validity !== "undefined" ) {                                     // 597
				return element.validity.badInput ? false : $element.val();                                                      // 598
			}                                                                                                                // 599
                                                                                                                    // 600
			val = $element.val();                                                                                            // 601
			if ( typeof val === "string" ) {                                                                                 // 602
				return val.replace(/\r/g, "" );                                                                                 // 603
			}                                                                                                                // 604
			return val;                                                                                                      // 605
		},                                                                                                                // 606
                                                                                                                    // 607
		check: function( element ) {                                                                                      // 608
			element = this.validationTargetFor( this.clean( element ) );                                                     // 609
                                                                                                                    // 610
			var rules = $( element ).rules(),                                                                                // 611
				rulesCount = $.map( rules, function( n, i ) {                                                                   // 612
					return i;                                                                                                      // 613
				}).length,                                                                                                      // 614
				dependencyMismatch = false,                                                                                     // 615
				val = this.elementValue( element ),                                                                             // 616
				result, method, rule;                                                                                           // 617
                                                                                                                    // 618
			for ( method in rules ) {                                                                                        // 619
				rule = { method: method, parameters: rules[ method ] };                                                         // 620
				try {                                                                                                           // 621
                                                                                                                    // 622
					result = $.validator.methods[ method ].call( this, val, element, rule.parameters );                            // 623
                                                                                                                    // 624
					// if a method indicates that the field is optional and therefore valid,                                       // 625
					// don't mark it as valid when there are no other rules                                                        // 626
					if ( result === "dependency-mismatch" && rulesCount === 1 ) {                                                  // 627
						dependencyMismatch = true;                                                                                    // 628
						continue;                                                                                                     // 629
					}                                                                                                              // 630
					dependencyMismatch = false;                                                                                    // 631
                                                                                                                    // 632
					if ( result === "pending" ) {                                                                                  // 633
						this.toHide = this.toHide.not( this.errorsFor( element ) );                                                   // 634
						return;                                                                                                       // 635
					}                                                                                                              // 636
                                                                                                                    // 637
					if ( !result ) {                                                                                               // 638
						this.formatAndAdd( element, rule );                                                                           // 639
						return false;                                                                                                 // 640
					}                                                                                                              // 641
				} catch ( e ) {                                                                                                 // 642
					if ( this.settings.debug && window.console ) {                                                                 // 643
						console.log( "Exception occurred when checking element " + element.id + ", check the '" + rule.method + "' method.", e );
					}                                                                                                              // 645
					if ( e instanceof TypeError ) {                                                                                // 646
						e.message += ".  Exception occurred when checking element " + element.id + ", check the '" + rule.method + "' method.";
					}                                                                                                              // 648
                                                                                                                    // 649
					throw e;                                                                                                       // 650
				}                                                                                                               // 651
			}                                                                                                                // 652
			if ( dependencyMismatch ) {                                                                                      // 653
				return;                                                                                                         // 654
			}                                                                                                                // 655
			if ( this.objectLength( rules ) ) {                                                                              // 656
				this.successList.push( element );                                                                               // 657
			}                                                                                                                // 658
			return true;                                                                                                     // 659
		},                                                                                                                // 660
                                                                                                                    // 661
		// return the custom message for the given element and validation method                                          // 662
		// specified in the element's HTML5 data attribute                                                                // 663
		// return the generic message if present and no method specific message is present                                // 664
		customDataMessage: function( element, method ) {                                                                  // 665
			return $( element ).data( "msg" + method.charAt( 0 ).toUpperCase() +                                             // 666
				method.substring( 1 ).toLowerCase() ) || $( element ).data( "msg" );                                            // 667
		},                                                                                                                // 668
                                                                                                                    // 669
		// return the custom message for the given element name and validation method                                     // 670
		customMessage: function( name, method ) {                                                                         // 671
			var m = this.settings.messages[ name ];                                                                          // 672
			return m && ( m.constructor === String ? m : m[ method ]);                                                       // 673
		},                                                                                                                // 674
                                                                                                                    // 675
		// return the first defined argument, allowing empty strings                                                      // 676
		findDefined: function() {                                                                                         // 677
			for ( var i = 0; i < arguments.length; i++) {                                                                    // 678
				if ( arguments[ i ] !== undefined ) {                                                                           // 679
					return arguments[ i ];                                                                                         // 680
				}                                                                                                               // 681
			}                                                                                                                // 682
			return undefined;                                                                                                // 683
		},                                                                                                                // 684
                                                                                                                    // 685
		defaultMessage: function( element, method ) {                                                                     // 686
			return this.findDefined(                                                                                         // 687
				this.customMessage( element.name, method ),                                                                     // 688
				this.customDataMessage( element, method ),                                                                      // 689
				// title is never undefined, so handle empty string as undefined                                                // 690
				!this.settings.ignoreTitle && element.title || undefined,                                                       // 691
				$.validator.messages[ method ],                                                                                 // 692
				"<strong>Warning: No message defined for " + element.name + "</strong>"                                         // 693
			);                                                                                                               // 694
		},                                                                                                                // 695
                                                                                                                    // 696
		formatAndAdd: function( element, rule ) {                                                                         // 697
			var message = this.defaultMessage( element, rule.method ),                                                       // 698
				theregex = /\$?\{(\d+)\}/g;                                                                                     // 699
			if ( typeof message === "function" ) {                                                                           // 700
				message = message.call( this, rule.parameters, element );                                                       // 701
			} else if ( theregex.test( message ) ) {                                                                         // 702
				message = $.validator.format( message.replace( theregex, "{$1}" ), rule.parameters );                           // 703
			}                                                                                                                // 704
			this.errorList.push({                                                                                            // 705
				message: message,                                                                                               // 706
				element: element,                                                                                               // 707
				method: rule.method                                                                                             // 708
			});                                                                                                              // 709
                                                                                                                    // 710
			this.errorMap[ element.name ] = message;                                                                         // 711
			this.submitted[ element.name ] = message;                                                                        // 712
		},                                                                                                                // 713
                                                                                                                    // 714
		addWrapper: function( toToggle ) {                                                                                // 715
			if ( this.settings.wrapper ) {                                                                                   // 716
				toToggle = toToggle.add( toToggle.parent( this.settings.wrapper ) );                                            // 717
			}                                                                                                                // 718
			return toToggle;                                                                                                 // 719
		},                                                                                                                // 720
                                                                                                                    // 721
		defaultShowErrors: function() {                                                                                   // 722
			var i, elements, error;                                                                                          // 723
			for ( i = 0; this.errorList[ i ]; i++ ) {                                                                        // 724
				error = this.errorList[ i ];                                                                                    // 725
				if ( this.settings.highlight ) {                                                                                // 726
					this.settings.highlight.call( this, error.element, this.settings.errorClass, this.settings.validClass );       // 727
				}                                                                                                               // 728
				this.showLabel( error.element, error.message );                                                                 // 729
			}                                                                                                                // 730
			if ( this.errorList.length ) {                                                                                   // 731
				this.toShow = this.toShow.add( this.containers );                                                               // 732
			}                                                                                                                // 733
			if ( this.settings.success ) {                                                                                   // 734
				for ( i = 0; this.successList[ i ]; i++ ) {                                                                     // 735
					this.showLabel( this.successList[ i ] );                                                                       // 736
				}                                                                                                               // 737
			}                                                                                                                // 738
			if ( this.settings.unhighlight ) {                                                                               // 739
				for ( i = 0, elements = this.validElements(); elements[ i ]; i++ ) {                                            // 740
					this.settings.unhighlight.call( this, elements[ i ], this.settings.errorClass, this.settings.validClass );     // 741
				}                                                                                                               // 742
			}                                                                                                                // 743
			this.toHide = this.toHide.not( this.toShow );                                                                    // 744
			this.hideErrors();                                                                                               // 745
			this.addWrapper( this.toShow ).show();                                                                           // 746
		},                                                                                                                // 747
                                                                                                                    // 748
		validElements: function() {                                                                                       // 749
			return this.currentElements.not( this.invalidElements() );                                                       // 750
		},                                                                                                                // 751
                                                                                                                    // 752
		invalidElements: function() {                                                                                     // 753
			return $( this.errorList ).map(function() {                                                                      // 754
				return this.element;                                                                                            // 755
			});                                                                                                              // 756
		},                                                                                                                // 757
                                                                                                                    // 758
		showLabel: function( element, message ) {                                                                         // 759
			var place, group, errorID,                                                                                       // 760
				error = this.errorsFor( element ),                                                                              // 761
				elementID = this.idOrName( element ),                                                                           // 762
				describedBy = $( element ).attr( "aria-describedby" );                                                          // 763
			if ( error.length ) {                                                                                            // 764
				// refresh error/success class                                                                                  // 765
				error.removeClass( this.settings.validClass ).addClass( this.settings.errorClass );                             // 766
				// replace message on existing label                                                                            // 767
				error.html( message );                                                                                          // 768
			} else {                                                                                                         // 769
				// create error element                                                                                         // 770
				error = $( "<" + this.settings.errorElement + ">" )                                                             // 771
					.attr( "id", elementID + "-error" )                                                                            // 772
					.addClass( this.settings.errorClass )                                                                          // 773
					.html( message || "" );                                                                                        // 774
                                                                                                                    // 775
				// Maintain reference to the element to be placed into the DOM                                                  // 776
				place = error;                                                                                                  // 777
				if ( this.settings.wrapper ) {                                                                                  // 778
					// make sure the element is visible, even in IE                                                                // 779
					// actually showing the wrapped element is handled elsewhere                                                   // 780
					place = error.hide().show().wrap( "<" + this.settings.wrapper + "/>" ).parent();                               // 781
				}                                                                                                               // 782
				if ( this.labelContainer.length ) {                                                                             // 783
					this.labelContainer.append( place );                                                                           // 784
				} else if ( this.settings.errorPlacement ) {                                                                    // 785
					this.settings.errorPlacement( place, $( element ) );                                                           // 786
				} else {                                                                                                        // 787
					place.insertAfter( element );                                                                                  // 788
				}                                                                                                               // 789
                                                                                                                    // 790
				// Link error back to the element                                                                               // 791
				if ( error.is( "label" ) ) {                                                                                    // 792
					// If the error is a label, then associate using 'for'                                                         // 793
					error.attr( "for", elementID );                                                                                // 794
				} else if ( error.parents( "label[for='" + elementID + "']" ).length === 0 ) {                                  // 795
					// If the element is not a child of an associated label, then it's necessary                                   // 796
					// to explicitly apply aria-describedby                                                                        // 797
                                                                                                                    // 798
					errorID = error.attr( "id" ).replace( /(:|\.|\[|\]|\$)/g, "\\$1");                                             // 799
					// Respect existing non-error aria-describedby                                                                 // 800
					if ( !describedBy ) {                                                                                          // 801
						describedBy = errorID;                                                                                        // 802
					} else if ( !describedBy.match( new RegExp( "\\b" + errorID + "\\b" ) ) ) {                                    // 803
						// Add to end of list if not already present                                                                  // 804
						describedBy += " " + errorID;                                                                                 // 805
					}                                                                                                              // 806
					$( element ).attr( "aria-describedby", describedBy );                                                          // 807
                                                                                                                    // 808
					// If this element is grouped, then assign to all elements in the same group                                   // 809
					group = this.groups[ element.name ];                                                                           // 810
					if ( group ) {                                                                                                 // 811
						$.each( this.groups, function( name, testgroup ) {                                                            // 812
							if ( testgroup === group ) {                                                                                 // 813
								$( "[name='" + name + "']", this.currentForm )                                                              // 814
									.attr( "aria-describedby", error.attr( "id" ) );                                                           // 815
							}                                                                                                            // 816
						});                                                                                                           // 817
					}                                                                                                              // 818
				}                                                                                                               // 819
			}                                                                                                                // 820
			if ( !message && this.settings.success ) {                                                                       // 821
				error.text( "" );                                                                                               // 822
				if ( typeof this.settings.success === "string" ) {                                                              // 823
					error.addClass( this.settings.success );                                                                       // 824
				} else {                                                                                                        // 825
					this.settings.success( error, element );                                                                       // 826
				}                                                                                                               // 827
			}                                                                                                                // 828
			this.toShow = this.toShow.add( error );                                                                          // 829
		},                                                                                                                // 830
                                                                                                                    // 831
		errorsFor: function( element ) {                                                                                  // 832
			var name = this.idOrName( element ),                                                                             // 833
				describer = $( element ).attr( "aria-describedby" ),                                                            // 834
				selector = "label[for='" + name + "'], label[for='" + name + "'] *";                                            // 835
                                                                                                                    // 836
			// aria-describedby should directly reference the error element                                                  // 837
			if ( describer ) {                                                                                               // 838
				selector = selector + ", #" + describer.replace( /\s+/g, ", #" );                                               // 839
			}                                                                                                                // 840
			return this                                                                                                      // 841
				.errors()                                                                                                       // 842
				.filter( selector );                                                                                            // 843
		},                                                                                                                // 844
                                                                                                                    // 845
		idOrName: function( element ) {                                                                                   // 846
			return this.groups[ element.name ] || ( this.checkable( element ) ? element.name : element.id || element.name ); // 847
		},                                                                                                                // 848
                                                                                                                    // 849
		validationTargetFor: function( element ) {                                                                        // 850
                                                                                                                    // 851
			// If radio/checkbox, validate first element in group instead                                                    // 852
			if ( this.checkable( element ) ) {                                                                               // 853
				element = this.findByName( element.name );                                                                      // 854
			}                                                                                                                // 855
                                                                                                                    // 856
			// Always apply ignore filter                                                                                    // 857
			return $( element ).not( this.settings.ignore )[ 0 ];                                                            // 858
		},                                                                                                                // 859
                                                                                                                    // 860
		checkable: function( element ) {                                                                                  // 861
			return ( /radio|checkbox/i ).test( element.type );                                                               // 862
		},                                                                                                                // 863
                                                                                                                    // 864
		findByName: function( name ) {                                                                                    // 865
			return $( this.currentForm ).find( "[name='" + name + "']" );                                                    // 866
		},                                                                                                                // 867
                                                                                                                    // 868
		getLength: function( value, element ) {                                                                           // 869
			switch ( element.nodeName.toLowerCase() ) {                                                                      // 870
			case "select":                                                                                                   // 871
				return $( "option:selected", element ).length;                                                                  // 872
			case "input":                                                                                                    // 873
				if ( this.checkable( element ) ) {                                                                              // 874
					return this.findByName( element.name ).filter( ":checked" ).length;                                            // 875
				}                                                                                                               // 876
			}                                                                                                                // 877
			return value.length;                                                                                             // 878
		},                                                                                                                // 879
                                                                                                                    // 880
		depend: function( param, element ) {                                                                              // 881
			return this.dependTypes[typeof param] ? this.dependTypes[typeof param]( param, element ) : true;                 // 882
		},                                                                                                                // 883
                                                                                                                    // 884
		dependTypes: {                                                                                                    // 885
			"boolean": function( param ) {                                                                                   // 886
				return param;                                                                                                   // 887
			},                                                                                                               // 888
			"string": function( param, element ) {                                                                           // 889
				return !!$( param, element.form ).length;                                                                       // 890
			},                                                                                                               // 891
			"function": function( param, element ) {                                                                         // 892
				return param( element );                                                                                        // 893
			}                                                                                                                // 894
		},                                                                                                                // 895
                                                                                                                    // 896
		optional: function( element ) {                                                                                   // 897
			var val = this.elementValue( element );                                                                          // 898
			return !$.validator.methods.required.call( this, val, element ) && "dependency-mismatch";                        // 899
		},                                                                                                                // 900
                                                                                                                    // 901
		startRequest: function( element ) {                                                                               // 902
			if ( !this.pending[ element.name ] ) {                                                                           // 903
				this.pendingRequest++;                                                                                          // 904
				this.pending[ element.name ] = true;                                                                            // 905
			}                                                                                                                // 906
		},                                                                                                                // 907
                                                                                                                    // 908
		stopRequest: function( element, valid ) {                                                                         // 909
			this.pendingRequest--;                                                                                           // 910
			// sometimes synchronization fails, make sure pendingRequest is never < 0                                        // 911
			if ( this.pendingRequest < 0 ) {                                                                                 // 912
				this.pendingRequest = 0;                                                                                        // 913
			}                                                                                                                // 914
			delete this.pending[ element.name ];                                                                             // 915
			if ( valid && this.pendingRequest === 0 && this.formSubmitted && this.form() ) {                                 // 916
				$( this.currentForm ).submit();                                                                                 // 917
				this.formSubmitted = false;                                                                                     // 918
			} else if (!valid && this.pendingRequest === 0 && this.formSubmitted ) {                                         // 919
				$( this.currentForm ).triggerHandler( "invalid-form", [ this ]);                                                // 920
				this.formSubmitted = false;                                                                                     // 921
			}                                                                                                                // 922
		},                                                                                                                // 923
                                                                                                                    // 924
		previousValue: function( element ) {                                                                              // 925
			return $.data( element, "previousValue" ) || $.data( element, "previousValue", {                                 // 926
				old: null,                                                                                                      // 927
				valid: true,                                                                                                    // 928
				message: this.defaultMessage( element, "remote" )                                                               // 929
			});                                                                                                              // 930
		},                                                                                                                // 931
                                                                                                                    // 932
		// cleans up all forms and elements, removes validator-specific events                                            // 933
		destroy: function() {                                                                                             // 934
			this.resetForm();                                                                                                // 935
                                                                                                                    // 936
			$( this.currentForm )                                                                                            // 937
				.off( ".validate" )                                                                                             // 938
				.removeData( "validator" );                                                                                     // 939
		}                                                                                                                 // 940
                                                                                                                    // 941
	},                                                                                                                 // 942
                                                                                                                    // 943
	classRuleSettings: {                                                                                               // 944
		required: { required: true },                                                                                     // 945
		email: { email: true },                                                                                           // 946
		url: { url: true },                                                                                               // 947
		date: { date: true },                                                                                             // 948
		dateISO: { dateISO: true },                                                                                       // 949
		number: { number: true },                                                                                         // 950
		digits: { digits: true },                                                                                         // 951
		creditcard: { creditcard: true }                                                                                  // 952
	},                                                                                                                 // 953
                                                                                                                    // 954
	addClassRules: function( className, rules ) {                                                                      // 955
		if ( className.constructor === String ) {                                                                         // 956
			this.classRuleSettings[ className ] = rules;                                                                     // 957
		} else {                                                                                                          // 958
			$.extend( this.classRuleSettings, className );                                                                   // 959
		}                                                                                                                 // 960
	},                                                                                                                 // 961
                                                                                                                    // 962
	classRules: function( element ) {                                                                                  // 963
		var rules = {},                                                                                                   // 964
			classes = $( element ).attr( "class" );                                                                          // 965
                                                                                                                    // 966
		if ( classes ) {                                                                                                  // 967
			$.each( classes.split( " " ), function() {                                                                       // 968
				if ( this in $.validator.classRuleSettings ) {                                                                  // 969
					$.extend( rules, $.validator.classRuleSettings[ this ]);                                                       // 970
				}                                                                                                               // 971
			});                                                                                                              // 972
		}                                                                                                                 // 973
		return rules;                                                                                                     // 974
	},                                                                                                                 // 975
                                                                                                                    // 976
	normalizeAttributeRule: function( rules, type, method, value ) {                                                   // 977
                                                                                                                    // 978
		// convert the value to a number for number inputs, and for text for backwards compability                        // 979
		// allows type="date" and others to be compared as strings                                                        // 980
		if ( /min|max/.test( method ) && ( type === null || /number|range|text/.test( type ) ) ) {                        // 981
			value = Number( value );                                                                                         // 982
                                                                                                                    // 983
			// Support Opera Mini, which returns NaN for undefined minlength                                                 // 984
			if ( isNaN( value ) ) {                                                                                          // 985
				value = undefined;                                                                                              // 986
			}                                                                                                                // 987
		}                                                                                                                 // 988
                                                                                                                    // 989
		if ( value || value === 0 ) {                                                                                     // 990
			rules[ method ] = value;                                                                                         // 991
		} else if ( type === method && type !== "range" ) {                                                               // 992
                                                                                                                    // 993
			// exception: the jquery validate 'range' method                                                                 // 994
			// does not test for the html5 'range' type                                                                      // 995
			rules[ method ] = true;                                                                                          // 996
		}                                                                                                                 // 997
	},                                                                                                                 // 998
                                                                                                                    // 999
	attributeRules: function( element ) {                                                                              // 1000
		var rules = {},                                                                                                   // 1001
			$element = $( element ),                                                                                         // 1002
			type = element.getAttribute( "type" ),                                                                           // 1003
			method, value;                                                                                                   // 1004
                                                                                                                    // 1005
		for ( method in $.validator.methods ) {                                                                           // 1006
                                                                                                                    // 1007
			// support for <input required> in both html5 and older browsers                                                 // 1008
			if ( method === "required" ) {                                                                                   // 1009
				value = element.getAttribute( method );                                                                         // 1010
                                                                                                                    // 1011
				// Some browsers return an empty string for the required attribute                                              // 1012
				// and non-HTML5 browsers might have required="" markup                                                         // 1013
				if ( value === "" ) {                                                                                           // 1014
					value = true;                                                                                                  // 1015
				}                                                                                                               // 1016
                                                                                                                    // 1017
				// force non-HTML5 browsers to return bool                                                                      // 1018
				value = !!value;                                                                                                // 1019
			} else {                                                                                                         // 1020
				value = $element.attr( method );                                                                                // 1021
			}                                                                                                                // 1022
                                                                                                                    // 1023
			this.normalizeAttributeRule( rules, type, method, value );                                                       // 1024
		}                                                                                                                 // 1025
                                                                                                                    // 1026
		// maxlength may be returned as -1, 2147483647 ( IE ) and 524288 ( safari ) for text inputs                       // 1027
		if ( rules.maxlength && /-1|2147483647|524288/.test( rules.maxlength ) ) {                                        // 1028
			delete rules.maxlength;                                                                                          // 1029
		}                                                                                                                 // 1030
                                                                                                                    // 1031
		return rules;                                                                                                     // 1032
	},                                                                                                                 // 1033
                                                                                                                    // 1034
	dataRules: function( element ) {                                                                                   // 1035
		var rules = {},                                                                                                   // 1036
			$element = $( element ),                                                                                         // 1037
			type = element.getAttribute( "type" ),                                                                           // 1038
			method, value;                                                                                                   // 1039
                                                                                                                    // 1040
		for ( method in $.validator.methods ) {                                                                           // 1041
			value = $element.data( "rule" + method.charAt( 0 ).toUpperCase() + method.substring( 1 ).toLowerCase() );        // 1042
			this.normalizeAttributeRule( rules, type, method, value );                                                       // 1043
		}                                                                                                                 // 1044
		return rules;                                                                                                     // 1045
	},                                                                                                                 // 1046
                                                                                                                    // 1047
	staticRules: function( element ) {                                                                                 // 1048
		var rules = {},                                                                                                   // 1049
			validator = $.data( element.form, "validator" );                                                                 // 1050
                                                                                                                    // 1051
		if ( validator.settings.rules ) {                                                                                 // 1052
			rules = $.validator.normalizeRule( validator.settings.rules[ element.name ] ) || {};                             // 1053
		}                                                                                                                 // 1054
		return rules;                                                                                                     // 1055
	},                                                                                                                 // 1056
                                                                                                                    // 1057
	normalizeRules: function( rules, element ) {                                                                       // 1058
		// handle dependency check                                                                                        // 1059
		$.each( rules, function( prop, val ) {                                                                            // 1060
			// ignore rule when param is explicitly false, eg. required:false                                                // 1061
			if ( val === false ) {                                                                                           // 1062
				delete rules[ prop ];                                                                                           // 1063
				return;                                                                                                         // 1064
			}                                                                                                                // 1065
			if ( val.param || val.depends ) {                                                                                // 1066
				var keepRule = true;                                                                                            // 1067
				switch ( typeof val.depends ) {                                                                                 // 1068
				case "string":                                                                                                  // 1069
					keepRule = !!$( val.depends, element.form ).length;                                                            // 1070
					break;                                                                                                         // 1071
				case "function":                                                                                                // 1072
					keepRule = val.depends.call( element, element );                                                               // 1073
					break;                                                                                                         // 1074
				}                                                                                                               // 1075
				if ( keepRule ) {                                                                                               // 1076
					rules[ prop ] = val.param !== undefined ? val.param : true;                                                    // 1077
				} else {                                                                                                        // 1078
					delete rules[ prop ];                                                                                          // 1079
				}                                                                                                               // 1080
			}                                                                                                                // 1081
		});                                                                                                               // 1082
                                                                                                                    // 1083
		// evaluate parameters                                                                                            // 1084
		$.each( rules, function( rule, parameter ) {                                                                      // 1085
			rules[ rule ] = $.isFunction( parameter ) ? parameter( element ) : parameter;                                    // 1086
		});                                                                                                               // 1087
                                                                                                                    // 1088
		// clean number parameters                                                                                        // 1089
		$.each([ "minlength", "maxlength" ], function() {                                                                 // 1090
			if ( rules[ this ] ) {                                                                                           // 1091
				rules[ this ] = Number( rules[ this ] );                                                                        // 1092
			}                                                                                                                // 1093
		});                                                                                                               // 1094
		$.each([ "rangelength", "range" ], function() {                                                                   // 1095
			var parts;                                                                                                       // 1096
			if ( rules[ this ] ) {                                                                                           // 1097
				if ( $.isArray( rules[ this ] ) ) {                                                                             // 1098
					rules[ this ] = [ Number( rules[ this ][ 0 ]), Number( rules[ this ][ 1 ] ) ];                                 // 1099
				} else if ( typeof rules[ this ] === "string" ) {                                                               // 1100
					parts = rules[ this ].replace(/[\[\]]/g, "" ).split( /[\s,]+/ );                                               // 1101
					rules[ this ] = [ Number( parts[ 0 ]), Number( parts[ 1 ] ) ];                                                 // 1102
				}                                                                                                               // 1103
			}                                                                                                                // 1104
		});                                                                                                               // 1105
                                                                                                                    // 1106
		if ( $.validator.autoCreateRanges ) {                                                                             // 1107
			// auto-create ranges                                                                                            // 1108
			if ( rules.min != null && rules.max != null ) {                                                                  // 1109
				rules.range = [ rules.min, rules.max ];                                                                         // 1110
				delete rules.min;                                                                                               // 1111
				delete rules.max;                                                                                               // 1112
			}                                                                                                                // 1113
			if ( rules.minlength != null && rules.maxlength != null ) {                                                      // 1114
				rules.rangelength = [ rules.minlength, rules.maxlength ];                                                       // 1115
				delete rules.minlength;                                                                                         // 1116
				delete rules.maxlength;                                                                                         // 1117
			}                                                                                                                // 1118
		}                                                                                                                 // 1119
                                                                                                                    // 1120
		return rules;                                                                                                     // 1121
	},                                                                                                                 // 1122
                                                                                                                    // 1123
	// Converts a simple string to a {string: true} rule, e.g., "required" to {required:true}                          // 1124
	normalizeRule: function( data ) {                                                                                  // 1125
		if ( typeof data === "string" ) {                                                                                 // 1126
			var transformed = {};                                                                                            // 1127
			$.each( data.split( /\s/ ), function() {                                                                         // 1128
				transformed[ this ] = true;                                                                                     // 1129
			});                                                                                                              // 1130
			data = transformed;                                                                                              // 1131
		}                                                                                                                 // 1132
		return data;                                                                                                      // 1133
	},                                                                                                                 // 1134
                                                                                                                    // 1135
	// http://jqueryvalidation.org/jQuery.validator.addMethod/                                                         // 1136
	addMethod: function( name, method, message ) {                                                                     // 1137
		$.validator.methods[ name ] = method;                                                                             // 1138
		$.validator.messages[ name ] = message !== undefined ? message : $.validator.messages[ name ];                    // 1139
		if ( method.length < 3 ) {                                                                                        // 1140
			$.validator.addClassRules( name, $.validator.normalizeRule( name ) );                                            // 1141
		}                                                                                                                 // 1142
	},                                                                                                                 // 1143
                                                                                                                    // 1144
	methods: {                                                                                                         // 1145
                                                                                                                    // 1146
		// http://jqueryvalidation.org/required-method/                                                                   // 1147
		required: function( value, element, param ) {                                                                     // 1148
			// check if dependency is met                                                                                    // 1149
			if ( !this.depend( param, element ) ) {                                                                          // 1150
				return "dependency-mismatch";                                                                                   // 1151
			}                                                                                                                // 1152
			if ( element.nodeName.toLowerCase() === "select" ) {                                                             // 1153
				// could be an array for select-multiple or a string, both are fine this way                                    // 1154
				var val = $( element ).val();                                                                                   // 1155
				return val && val.length > 0;                                                                                   // 1156
			}                                                                                                                // 1157
			if ( this.checkable( element ) ) {                                                                               // 1158
				return this.getLength( value, element ) > 0;                                                                    // 1159
			}                                                                                                                // 1160
			return value.length > 0;                                                                                         // 1161
		},                                                                                                                // 1162
                                                                                                                    // 1163
		// http://jqueryvalidation.org/email-method/                                                                      // 1164
		email: function( value, element ) {                                                                               // 1165
			// From https://html.spec.whatwg.org/multipage/forms.html#valid-e-mail-address                                   // 1166
			// Retrieved 2014-01-14                                                                                          // 1167
			// If you have a problem with this implementation, report a bug against the above spec                           // 1168
			// Or use custom methods to implement your own email validation                                                  // 1169
			return this.optional( element ) || /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test( value );
		},                                                                                                                // 1171
                                                                                                                    // 1172
		// http://jqueryvalidation.org/url-method/                                                                        // 1173
		url: function( value, element ) {                                                                                 // 1174
                                                                                                                    // 1175
			// Copyright (c) 2010-2013 Diego Perini, MIT licensed                                                            // 1176
			// https://gist.github.com/dperini/729294                                                                        // 1177
			// see also https://mathiasbynens.be/demo/url-regex                                                              // 1178
			// modified to allow protocol-relative URLs                                                                      // 1179
			return this.optional( element ) || /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[/?#]\S*)?$/i.test( value );
		},                                                                                                                // 1181
                                                                                                                    // 1182
		// http://jqueryvalidation.org/date-method/                                                                       // 1183
		date: function( value, element ) {                                                                                // 1184
			return this.optional( element ) || !/Invalid|NaN/.test( new Date( value ).toString() );                          // 1185
		},                                                                                                                // 1186
                                                                                                                    // 1187
		// http://jqueryvalidation.org/dateISO-method/                                                                    // 1188
		dateISO: function( value, element ) {                                                                             // 1189
			return this.optional( element ) || /^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/.test( value ); // 1190
		},                                                                                                                // 1191
                                                                                                                    // 1192
		// http://jqueryvalidation.org/number-method/                                                                     // 1193
		number: function( value, element ) {                                                                              // 1194
			return this.optional( element ) || /^(?:-?\d+|-?\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test( value );                  // 1195
		},                                                                                                                // 1196
                                                                                                                    // 1197
		// http://jqueryvalidation.org/digits-method/                                                                     // 1198
		digits: function( value, element ) {                                                                              // 1199
			return this.optional( element ) || /^\d+$/.test( value );                                                        // 1200
		},                                                                                                                // 1201
                                                                                                                    // 1202
		// http://jqueryvalidation.org/creditcard-method/                                                                 // 1203
		// based on http://en.wikipedia.org/wiki/Luhn_algorithm                                                           // 1204
		creditcard: function( value, element ) {                                                                          // 1205
			if ( this.optional( element ) ) {                                                                                // 1206
				return "dependency-mismatch";                                                                                   // 1207
			}                                                                                                                // 1208
			// accept only spaces, digits and dashes                                                                         // 1209
			if ( /[^0-9 \-]+/.test( value ) ) {                                                                              // 1210
				return false;                                                                                                   // 1211
			}                                                                                                                // 1212
			var nCheck = 0,                                                                                                  // 1213
				nDigit = 0,                                                                                                     // 1214
				bEven = false,                                                                                                  // 1215
				n, cDigit;                                                                                                      // 1216
                                                                                                                    // 1217
			value = value.replace( /\D/g, "" );                                                                              // 1218
                                                                                                                    // 1219
			// Basing min and max length on                                                                                  // 1220
			// http://developer.ean.com/general_info/Valid_Credit_Card_Types                                                 // 1221
			if ( value.length < 13 || value.length > 19 ) {                                                                  // 1222
				return false;                                                                                                   // 1223
			}                                                                                                                // 1224
                                                                                                                    // 1225
			for ( n = value.length - 1; n >= 0; n--) {                                                                       // 1226
				cDigit = value.charAt( n );                                                                                     // 1227
				nDigit = parseInt( cDigit, 10 );                                                                                // 1228
				if ( bEven ) {                                                                                                  // 1229
					if ( ( nDigit *= 2 ) > 9 ) {                                                                                   // 1230
						nDigit -= 9;                                                                                                  // 1231
					}                                                                                                              // 1232
				}                                                                                                               // 1233
				nCheck += nDigit;                                                                                               // 1234
				bEven = !bEven;                                                                                                 // 1235
			}                                                                                                                // 1236
                                                                                                                    // 1237
			return ( nCheck % 10 ) === 0;                                                                                    // 1238
		},                                                                                                                // 1239
                                                                                                                    // 1240
		// http://jqueryvalidation.org/minlength-method/                                                                  // 1241
		minlength: function( value, element, param ) {                                                                    // 1242
			var length = $.isArray( value ) ? value.length : this.getLength( value, element );                               // 1243
			return this.optional( element ) || length >= param;                                                              // 1244
		},                                                                                                                // 1245
                                                                                                                    // 1246
		// http://jqueryvalidation.org/maxlength-method/                                                                  // 1247
		maxlength: function( value, element, param ) {                                                                    // 1248
			var length = $.isArray( value ) ? value.length : this.getLength( value, element );                               // 1249
			return this.optional( element ) || length <= param;                                                              // 1250
		},                                                                                                                // 1251
                                                                                                                    // 1252
		// http://jqueryvalidation.org/rangelength-method/                                                                // 1253
		rangelength: function( value, element, param ) {                                                                  // 1254
			var length = $.isArray( value ) ? value.length : this.getLength( value, element );                               // 1255
			return this.optional( element ) || ( length >= param[ 0 ] && length <= param[ 1 ] );                             // 1256
		},                                                                                                                // 1257
                                                                                                                    // 1258
		// http://jqueryvalidation.org/min-method/                                                                        // 1259
		min: function( value, element, param ) {                                                                          // 1260
			return this.optional( element ) || value >= param;                                                               // 1261
		},                                                                                                                // 1262
                                                                                                                    // 1263
		// http://jqueryvalidation.org/max-method/                                                                        // 1264
		max: function( value, element, param ) {                                                                          // 1265
			return this.optional( element ) || value <= param;                                                               // 1266
		},                                                                                                                // 1267
                                                                                                                    // 1268
		// http://jqueryvalidation.org/range-method/                                                                      // 1269
		range: function( value, element, param ) {                                                                        // 1270
			return this.optional( element ) || ( value >= param[ 0 ] && value <= param[ 1 ] );                               // 1271
		},                                                                                                                // 1272
                                                                                                                    // 1273
		// http://jqueryvalidation.org/equalTo-method/                                                                    // 1274
		equalTo: function( value, element, param ) {                                                                      // 1275
			// bind to the blur event of the target in order to revalidate whenever the target field is updated              // 1276
			// TODO find a way to bind the event just once, avoiding the unbind-rebind overhead                              // 1277
			var target = $( param );                                                                                         // 1278
			if ( this.settings.onfocusout ) {                                                                                // 1279
				target.off( ".validate-equalTo" ).on( "blur.validate-equalTo", function() {                                     // 1280
					$( element ).valid();                                                                                          // 1281
				});                                                                                                             // 1282
			}                                                                                                                // 1283
			return value === target.val();                                                                                   // 1284
		},                                                                                                                // 1285
                                                                                                                    // 1286
		// http://jqueryvalidation.org/remote-method/                                                                     // 1287
		remote: function( value, element, param ) {                                                                       // 1288
			if ( this.optional( element ) ) {                                                                                // 1289
				return "dependency-mismatch";                                                                                   // 1290
			}                                                                                                                // 1291
                                                                                                                    // 1292
			var previous = this.previousValue( element ),                                                                    // 1293
				validator, data;                                                                                                // 1294
                                                                                                                    // 1295
			if (!this.settings.messages[ element.name ] ) {                                                                  // 1296
				this.settings.messages[ element.name ] = {};                                                                    // 1297
			}                                                                                                                // 1298
			previous.originalMessage = this.settings.messages[ element.name ].remote;                                        // 1299
			this.settings.messages[ element.name ].remote = previous.message;                                                // 1300
                                                                                                                    // 1301
			param = typeof param === "string" && { url: param } || param;                                                    // 1302
                                                                                                                    // 1303
			if ( previous.old === value ) {                                                                                  // 1304
				return previous.valid;                                                                                          // 1305
			}                                                                                                                // 1306
                                                                                                                    // 1307
			previous.old = value;                                                                                            // 1308
			validator = this;                                                                                                // 1309
			this.startRequest( element );                                                                                    // 1310
			data = {};                                                                                                       // 1311
			data[ element.name ] = value;                                                                                    // 1312
			$.ajax( $.extend( true, {                                                                                        // 1313
				mode: "abort",                                                                                                  // 1314
				port: "validate" + element.name,                                                                                // 1315
				dataType: "json",                                                                                               // 1316
				data: data,                                                                                                     // 1317
				context: validator.currentForm,                                                                                 // 1318
				success: function( response ) {                                                                                 // 1319
					var valid = response === true || response === "true",                                                          // 1320
						errors, message, submitted;                                                                                   // 1321
                                                                                                                    // 1322
					validator.settings.messages[ element.name ].remote = previous.originalMessage;                                 // 1323
					if ( valid ) {                                                                                                 // 1324
						submitted = validator.formSubmitted;                                                                          // 1325
						validator.prepareElement( element );                                                                          // 1326
						validator.formSubmitted = submitted;                                                                          // 1327
						validator.successList.push( element );                                                                        // 1328
						delete validator.invalid[ element.name ];                                                                     // 1329
						validator.showErrors();                                                                                       // 1330
					} else {                                                                                                       // 1331
						errors = {};                                                                                                  // 1332
						message = response || validator.defaultMessage( element, "remote" );                                          // 1333
						errors[ element.name ] = previous.message = $.isFunction( message ) ? message( value ) : message;             // 1334
						validator.invalid[ element.name ] = true;                                                                     // 1335
						validator.showErrors( errors );                                                                               // 1336
					}                                                                                                              // 1337
					previous.valid = valid;                                                                                        // 1338
					validator.stopRequest( element, valid );                                                                       // 1339
				}                                                                                                               // 1340
			}, param ) );                                                                                                    // 1341
			return "pending";                                                                                                // 1342
		}                                                                                                                 // 1343
	}                                                                                                                  // 1344
                                                                                                                    // 1345
});                                                                                                                 // 1346
                                                                                                                    // 1347
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/themeteorchef:jquery-validation/lib/jquery-validation/src/ajax.js                                       //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
// ajax mode: abort                                                                                                 // 1
// usage: $.ajax({ mode: "abort"[, port: "uniqueport"]});                                                           // 2
// if mode:"abort" is used, the previous request on that port (port can be undefined) is aborted via XMLHttpRequest.abort()
                                                                                                                    // 4
var pendingRequests = {},                                                                                           // 5
	ajax;                                                                                                              // 6
// Use a prefilter if available (1.5+)                                                                              // 7
if ( $.ajaxPrefilter ) {                                                                                            // 8
	$.ajaxPrefilter(function( settings, _, xhr ) {                                                                     // 9
		var port = settings.port;                                                                                         // 10
		if ( settings.mode === "abort" ) {                                                                                // 11
			if ( pendingRequests[port] ) {                                                                                   // 12
				pendingRequests[port].abort();                                                                                  // 13
			}                                                                                                                // 14
			pendingRequests[port] = xhr;                                                                                     // 15
		}                                                                                                                 // 16
	});                                                                                                                // 17
} else {                                                                                                            // 18
	// Proxy ajax                                                                                                      // 19
	ajax = $.ajax;                                                                                                     // 20
	$.ajax = function( settings ) {                                                                                    // 21
		var mode = ( "mode" in settings ? settings : $.ajaxSettings ).mode,                                               // 22
			port = ( "port" in settings ? settings : $.ajaxSettings ).port;                                                  // 23
		if ( mode === "abort" ) {                                                                                         // 24
			if ( pendingRequests[port] ) {                                                                                   // 25
				pendingRequests[port].abort();                                                                                  // 26
			}                                                                                                                // 27
			pendingRequests[port] = ajax.apply(this, arguments);                                                             // 28
			return pendingRequests[port];                                                                                    // 29
		}                                                                                                                 // 30
		return ajax.apply(this, arguments);                                                                               // 31
	};                                                                                                                 // 32
}                                                                                                                   // 33
                                                                                                                    // 34
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/themeteorchef:jquery-validation/lib/jquery-validation/src/additional/pattern.js                         //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
/**                                                                                                                 // 1
* Return true if the field value matches the given format RegExp                                                    // 2
*                                                                                                                   // 3
* @example $.validator.methods.pattern("AR1004",element,/^AR\d{4}$/)                                                // 4
* @result true                                                                                                      // 5
*                                                                                                                   // 6
* @example $.validator.methods.pattern("BR1004",element,/^AR\d{4}$/)                                                // 7
* @result false                                                                                                     // 8
*                                                                                                                   // 9
* @name $.validator.methods.pattern                                                                                 // 10
* @type Boolean                                                                                                     // 11
* @cat Plugins/Validate/Methods                                                                                     // 12
*/                                                                                                                  // 13
$.validator.addMethod("pattern", function(value, element, param) {                                                  // 14
	if (this.optional(element)) {                                                                                      // 15
		return true;                                                                                                      // 16
	}                                                                                                                  // 17
	if (typeof param === "string") {                                                                                   // 18
		param = new RegExp("^(?:" + param + ")$");                                                                        // 19
	}                                                                                                                  // 20
	return param.test(value);                                                                                          // 21
}, "Invalid format.");                                                                                              // 22
                                                                                                                    // 23
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
Package._define("themeteorchef:jquery-validation");

})();
