/**
 * Created by srikanth681 on 04/02/16.
 */



//
// Meteor.startup(function () {
//
//
//
// });
// Number.prototype.formatMoney = function(c, d, t){
//   var n = this,
//     c = isNaN(c = Math.abs(c)) ? 2 : c,
//     d = d == undefined ? "." : d,
//     t = t == undefined ? "," : t,
//     s = n < 0 ? "-" : "",
//     i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "",
//     j = (j = i.length) > 3 ? j % 3 : 0;
//   return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
// };

//
// Template.registerHelper("config",function(){
//   return Collections.Config.findOne();
// });
// function numDifferentiation(val) {
//   if(val >= 10000000) val = (val/10000000).toFixed(2) + ' Crores';
//   else if(val >= 100000) val = (val/100000).toFixed(2) + ' Lakhs';
//   else if(val >= 1000) val = (val/1000).toFixed(2) + ' Thousand';
//   return val;
// }
//

