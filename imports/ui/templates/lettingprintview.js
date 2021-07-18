/**
 * Created by njanjanam on 19/05/2017.
 */
import './lettingprintview.html';

Template.lettingprintview.onCreated(function() {
    var instance = this;
    instance.isSubsLoaded = new ReactiveVar(false);
    instance.autorun(function(){

        var key = FlowRouter.getParam('key');
        instance.subscribe("viewLetting",key) ;
        instance.subscribe('Config');

        // instance.subscribe('Properties');
        // instance.subscribe('Auctions');

        if(instance.subscriptionsReady()){
            instance.isSubsLoaded.set(true)
        }
    })
})
Template.lettingprintview.helpers({
    isSubsLoaded: function () {
        return Template.instance().subscriptionsReady();
    },
    userLoggedIn: function () {
        if (Meteor.user())return true;
        return false;
    },
    data : function () {
        // debugger;
        var id = FlowRouter.getParam('key');
        let Projects = Collections.Auctions;
        let selector = {
            "lettingAuctionCode" : id
        };
        var ret = Projects.find(selector, {
            transform: function(data){

                var globalConfig = Collections.Config.findOne();
                data.PD = Collections.Properties.findOne(data.propertyId);

                data.PD.bedroomsCount=0
                data.PD.ensuiteCount = 0;
                data.PD.doubleBedCount = 0;
                if(data.PD.bedrooms){
                    data.PD.bedroomsCount = data.PD.bedrooms.length;
                    for (var i = 0; i < data.PD.bedrooms.length; i++) {
                        if (data.PD.bedrooms[i]["ensuite"] ) {
                            data.PD.ensuiteCount++;
                        }
                        if (data.PD.bedrooms[i]["bedType"] == 'double' ) {
                            data.PD.doubleBedCount++;
                        }
                    }
                }


                if(data.PD.contacts) {
                    data.primaryContact = data.PD.contacts[0];
                }else data.primaryContact = {};

                tmp = [];
                if(data.PD.amenities){
                    for ( var i=0; i< data.PD.amenities.length;i++){
                        var src = globalConfig.amenitiesLogos[data.PD.amenities[i]];
                        if(!src)src = globalConfig.amenitiesLogos["default"]
                        tmp.push({name:data.PD.amenities[i], src: src })
                    }
                }
                data.PD.amenitiesWithImgs = tmp;


                return data;
            },
            limit: 1
        }).fetch();
        ret = ret[0];

        clearMeta();
        try {
            var title = 'Print key for ' + ret.PD.address.address + ', ' + ret.PD.address.area;
            if (ret.PD.address.county) title += ', ' + ret.PD.address.county;

            DocHead.setTitle('' + titleCase(title) + ' | SpotMyCrib');
            DocHead.addMeta({name: "description", content: "Print key for " + ret.PD.type + "."});
        }catch(err){
            DocHead.setTitle(' Property not found | SpotMyCrib Admin');
            DocHead.addMeta({name: "description", content: ""});
        }

        return ret;
    }
});
Template.lettingprintview.onRendered(function() {
    // console.log(this)

    setTimeout(function () {
        window.print();
    },1000)
})