if(Package['jns:flow-router-ssr']) {
  var FlowRouter = Package['jns:flow-router-ssr'].FlowRouter;
  // remove added tags when changing routes
  FlowRouter.triggers.enter(function() {
    Meteor.startup(DocHead.removeDocHeadAddedTags);
  });
}
