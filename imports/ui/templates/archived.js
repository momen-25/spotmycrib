/**
 * Created by njanjanam on 04/03/2018.
 */
AutoForm.hooks({
    insertAuctionForm: {
        onSuccess:function(formType, result){
            console.log(result);
            $(this.event.currentTarget).parent('form').find('.has-error').removeClass('has-error')
            if(formType=="insert"){

                Session.set('auctionId',result)
                Meteor.call('addAuction', result, (err, res) => {
                    if (err) {
                        console.log(err);
                        var tmp =  Session.get("showErrorDlg");if(!tmp)tmp=[];
                        tmp.push("Error: please check your internet connection, contact us if needed.");
                        Session.set("showErrorDlg",tmp)
                    } else {
                        auctionId = Session.get('auctionId');
                        Session.set('hideAddAuctionForm',true)
                        scrollTo('.property_auction_'+auctionId,-100,700)

                    }
                });

                // debugger;
                // console.log(Template);
                // console.log(Template.parent());
                // console.log(this.template);
                //
                // console.log(this.template.parent());
                // this.template.parent().showAddAuctionForm.set(false);
            }
        },
        onError: function(formType, error) {
            console.log(error);
            for(var i=0;i<error.invalidKeys.length;i++){
                ele_name = error.invalidKeys[i].name;
                $(this.event.currentTarget).find("input[name='"+ele_name+"']").parent().addClass('has-error')
            }
            var tmp =  Session.get("showErrorDlg");if(!tmp)tmp=[];
            tmp.push(error.message);
            Session.set("showErrorDlg",tmp)
            Session.set('hideAddAuctionForm',true)

            if(formType=="insert"){

            }
        },
        formToDoc: function(doc) {
            console.log("formToDoc result");
            doc.createdByAgent = Meteor.userId();
            if(doc.readyFrom<new Date(moment().add(1, 'days').startOf('day')))
                doc.readyFrom= new Date(moment().add(1, 'days').startOf('day'))
            return doc;
        },
    },
    insertPropertiesForm: {
        onSuccess:function(formType, result){
            console.log("insertPropertyForm hook");
            console.log(result);
            if(formType=="insert"){
                var addPropertyImages = Session.get('addPropertyImages');
                updateGalleriesInServer(addPropertyImages, result, function (err, res) {
                    if (err) {
                        console.log(err);
                    } else {
                        Session.set('addPropertyImages',[]);
                        S3.collection.remove({})
                    }
                })
                Session.set('hideAddPropertyForm',true)
            }
        },
        onError: function(formType, error) {
            console.log(error);
            for(var i=0;i<error.invalidKeys.length;i++){
                ele_name = error.invalidKeys[i].name;
                $(this.event.currentTarget).find("input[name='"+ele_name+"']").parent().addClass('has-error')
            }
            var tmp =  Session.get("showErrorDlg");if(!tmp)tmp=[];
            tmp.push(error.message);
            Session.set("showErrorDlg",tmp)
            scrollTo('.has-error',0,500)

            if(formType=="insert"){

            }
        },
        formToDoc: function(doc) {
            doc.createdByAgent = Meteor.userId();
            return doc;
        },
    }
});