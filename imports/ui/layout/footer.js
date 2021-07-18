/*
 * This is an example of a customized template.
 * This footer replaces the "layoutFooter" template defined in the reactioncommerce:core package.
 * https://github.com/reactioncommerce/reaction-core/blob/master/client/templates/layout/footer/footer.html
 */
import { Template } from 'meteor/templating';
import './footer.html';

Template.footerExtended.helpers({
    RouteB:function (slug) {
        return FlowRouter.url('b',{slug:slug});
    }
  // customSocialSettings: function() {
  //   return {
  //     placement: 'footer',
  //     faClass: 'square',
  //     faSize: 'fa-3x',
  //     appsOrder: ['facebook', 'twitter', 'pinterest', 'googleplus']
  //   };
  // }
});

// Template.footerExtended.replaces("layoutFooter");
// Template.footerExtended.onRendered(function(){
//  $("#video1").click(function () {
//     $.fancybox({
//       'padding': 0,
//       'href': '#video-div1',
//     });
//   });
//  });
