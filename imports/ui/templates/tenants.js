import "./pagination.html";
import "./tenants.html";

Template.tenants.onCreated(function(){

    var instance = this;
    instance.isSubsLoaded = new ReactiveVar(false);
    instance.autorun(function(){

        instance.subscribe('userData');
        var pageno = FlowRouter.getParam('pageno'); if(!pageno)pageno=1;
        instance.subscribe("tenants",pageno) ;

        if(instance.subscriptionsReady()){
            instance.isSubsLoaded.set(true)
        }
    })

})
Template.tenants.helpers({
    isSubsLoaded:function(){
        return Template.instance().subscriptionsReady();
    },
    userLoggedIn:function(){
        if(Meteor.user())return true;
        return false;
    },
    dataFull:function(){
        var pageno = FlowRouter.getParam('pageno'); if(!pageno)pageno=1;
        var totalResultsCount = Meteor.users.find().count();

        /////PAGINATION
        var resultsPerPage = 10;
        var currentPageNo = FlowRouter.getParam('pageno');
        if(!currentPageNo){currentPageNo = 1}
        var urlBase = 'tenants/';

        return {
            totalResultsCount:totalResultsCount,
            results: Meteor.users.find(),
            pagination: getPaginationData(totalResultsCount,currentPageNo,urlBase,resultsPerPage)
        }
    }
})
Template.tenantList.helpers({
    userFirstName:function(){
        try{
            var tmp = this.user.profile.name.split(' ');
            return tmp[0];
        }catch(e){}
    }
})
Template.tenantList.events({
    'click .inviteToApply':function(event, template){
        ga('send', 'event', 'tenantsPage', 'inviteToApplyBtnClicked', 'Invite To Apply Btn Clicked');
        var user = Meteor.user();
        if(!user){//Login is needed.
            Session.set('showForgotForm',false)
            Session.set('showSignupForm',false)
            Session.set('showLoginSignupFancyBoxDialog',true)
            Session.set('showLoginDialog',true)
            return ;
        }
        Session.set('inviteToApplyData',{user:this.user})
        $.fancybox({
            'padding': 0,
            'href': '#inviteToApplyDlg',
            // afterShow:function () {}
        });
    }
})
inviteInProgress='';
Template.inviteToApply.onCreated(function () {
    this.inviteInProgress = new ReactiveVar( false );
    inviteInProgress = this.inviteInProgress;
    Meteor.subscribe('inviteToApply.MyActiveAdvertisements')
})
Template.inviteToApply.helpers({
    data:function(){
      return Session.get('inviteToApplyData');
    },
    myAdvertisements:function(){
        var select = {
            "isArchived":false,
            "createdByAgent":Meteor.userId()
        };
        var totalResultsCount = Collections.Auctions.find(select).count();
        return {
            totalResultsCount:totalResultsCount,
            results: Collections.Auctions.find(select)
        }
    },
    userFirstName:function(){
        var data = Session.get('inviteToApplyData');
        try{
            var tmp = data.user.profile.name.split(' ');
            return tmp[0];
        }catch(e){}
    },
    inviteInProgress:function () {
        // console.log('h 1 ')
        // console.log(Template.instance().inviteInProgress.get())
        inviteInProgress = Template.instance().inviteInProgress ;
        return Template.instance().inviteInProgress.get() ;
    },
})
Template.inviteToApply.events({
    'click .advertiseMyProperty':function(){
        closePopupEvent();
        FlowRouter.go('account/myProperties');
    },
    'click .confirmInviteBtn':function () {
        var selectedAdvertisements = [];
        $.each($(".selectedAdvertisements option:selected"), function(){
            selectedAdvertisements.push($(this).val());
        });
        if(!selectedAdvertisements.length){
            alert('Please choose at least 1 advertisement to proceed');return;
        }

        var data = Session.get('inviteToApplyData');
        inviteInProgress.set(true) ;
        Meteor.call('sendInviteToApplyEmail',[selectedAdvertisements,data.user._id],function(error, result){
            inviteInProgress.set(false) ;
            if(error){
                console.log(error);
                var tmp =  Session.get("showErrorDlg");if(!tmp)tmp=[];
                tmp.push("Failed applying. Please try again, try checking your internet connectivity. Contact us if needed.");
                Session.set("showErrorDlg",tmp)
                return;
            }
            if(result.status=='Success'){
                console.log("Success");
                closePopupEvent()
            }
        });

    },
    'click .closePopupBtn':function () {
        closePopupEvent()
    }
})
function titleCase(str){
    if(!str)return;
    return str.charAt(0).toUpperCase() + str.toLowerCase().substring(1);
}
function getPaginationData(totalResultsCount,currentPageNo,urlBase, resultsPerPage){
    var pages = [], prevPage = {}, nextPage={};
    var pgMin = currentPageNo-4, pgMax = currentPageNo+ 5, maxPages = Math.ceil(totalResultsCount/resultsPerPage)
    if(pgMin<1)pgMin =1;
    if(pgMax<1)pgMax =1;
    if(maxPages<1)maxPages =1;
    if(pgMin>maxPages)currentPageNo =maxPages;
    var tmp={};
    for (var i=pgMin; i<=maxPages;i++){
        var href = urlBase+i+"/";
        tmp = {
            "href": href,
            "text": i
        }
        if(i== currentPageNo) {
            tmp['href'] = 'javascript:void(0);';
            tmp['current'] = true;
        }
        pages.push(tmp)
    }
    // if(pgMin==maxPages){//Above loop won't work if only 1 page result
    //     pages.push({
    //         "href": 'javascript:void(0);',
    //         "text": 1
    //     })
    // }
    var prevPageNo = currentPageNo- 1, nextPageNo=currentPageNo+ 1;
    if(prevPageNo<1){
        prevPage['href'] = 'javascript:void(0)';
        prevPage['text'] = 'Previous';
        prevPage['disabled'] = 'disabled';
    }else{
        prevPage['href'] = urlBase+prevPageNo+"/";
        prevPage['text'] = 'Previous';
    }
    if(nextPageNo>maxPages)nextPageNo =maxPages;
    if(nextPageNo == currentPageNo){
        nextPage['href'] = 'javascript:void(0)';
        nextPage['text'] = 'Next';
        nextPage['disabled'] = 'disabled';
    }else{
        nextPage['href'] = urlBase+nextPageNo+"/";
        nextPage['text'] = 'Next';
    }
    return {
        "prevPage":prevPage,
        "pages":pages,
        "nextPage": nextPage
    }
}
function closePopupEvent() {
    console.log('closePopupEvent');
    if($)
        if($.fancybox)
            $.fancybox.close();
}