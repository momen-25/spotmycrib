/**
 * Created by njanjanam on 21/03/2018.
 */

Meteor.methods({

});


// https://themeteorchef.com/tutorials/writing-an-api
// Meteor.methods({
//     initApiKey: function( userId ) {
//         check( userId, Match.OneOf( Meteor.userId(), String ) );
//
//         var newKey = Random.hexString( 32 );
//
//         try {
//             var key = APIKeys.insert({
//                 "owner": userId,
//                 "key": newKey
//             });
//             return key;
//         } catch( exception ) {
//             return exception;
//         }
//     },
//     regenerateApiKey: function( userId ){
//         check( userId, Meteor.userId() );
//
//         var newKey = Random.hexString( 32 );
//
//         try {
//             var keyId = APIKeys.update( { "owner": userId }, {
//                 $set: {
//                     "key": newKey
//                 }
//             });
//             return keyId;
//         } catch(exception) {
//             return exception;
//         }
//     }
// });

// Meteor.publish( 'APIKey', function(){//APIKeys collection need to be defined. https://themeteorchef.com/tutorials/writing-an-api
//     var user = this.userId;
//     var data = APIKeys.find( { "owner": user }, {fields: { "key": 1 } } );
//
//     if ( data ) {
//         return data;
//     }
//
//     return this.ready();
// });
// Accounts.createUser({email: user.email, password: user.password}, function( error ){
//     if(error){
//         Bert.alert(error.reason, 'danger');
//     } else {
//         var userId = Meteor.userId();
//         Bert.alert('Welcome!', 'success');
//         Meteor.call( "initApiKey", userId );
//     }
// });