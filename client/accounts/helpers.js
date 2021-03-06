window.LoginFormSharedHelpers = {
    showForm:function(){
      return Template.instance().showForm.get();
  },
  isLoading:function(){
      return Template.instance().isLoading.get();
  },
  loginFailedError:function () {
      return Template.instance().loginFailedError.get();
  },

  messages: function () {
    // console.log(Template.instance().formMessages.get())
    return Template.instance().formMessages.get();
  },

  hasError(error) {
    // True here means the field is valid
    // We're checking if theres some other message to display
    if (error !== true && typeof error !== "undefined") {
      return "has-error has-feedback";
    }

    return false;
  },

  formErrors() {
    return Template.instance().formErrors.get();
  },

  uniqueId: function () {
    // return Template.instance().uniqueId;
    return 1;
  },

  services() {
    let serviceHelper = new ReactionServiceHelper();
    return serviceHelper.services();
  },

  shouldShowSeperator() {
    let serviceHelper = new ReactionServiceHelper();
    let services = serviceHelper.services();
    let enabledServices = _.where(services, {
      enabled: true
    });

    return !!Package["accounts-password"] && enabledServices.length > 0;
  },

  hasPasswordService() {
    return !!Package["accounts-password"];
  }
};



