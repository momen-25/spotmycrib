SsrContext = {};
Package['jns:flow-router-ssr'] = {
  FlowRouter: {
    ssrContext: {
      get: function() {
        return SsrContext;
      }
    }
  }
};