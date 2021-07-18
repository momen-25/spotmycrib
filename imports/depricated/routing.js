/**
 * Reaction App Router
 * Define general app routing.
 * ReactionCore common/routing.js contains the core routes.
 */

if (Meteor.isClient) {
    Router.plugin('reywood:iron-router-ga');
}

// Search 1000s of houses, apartments & properties for sale and to rent from all leading estate agents
//SpotMyCrib helps you find your dream house in the easiest way possible. You get to set your rent when you apply for the house, apartment or property online with leading estate agents/landlords in Ireland. Experience the safest, transparent and innovative rental process in Ireland.
generalDesc = "Find your dream house in the easiest way possible. Set your rent when you apply for the house, apartment or property online with leading estate agents/landlords in Ireland. Experience the safest, transparent and innovative rental process in Ireland. SpotMyCrib.";

Router.route('/', function () {
    import '../imports/ui/templates/home.js';
    this.layout('homePageLayout');
    clearMeta();
    DocHead.setTitle('SpotMyCrib - Safe and easy rentals');
    DocHead.addMeta({name: "description", content: generalDesc} );
    Meteor.subscribe('Areas');
    Meteor.subscribe('Config');

    this.render('home', {
        // data: function () { return Items.findOne({_id: this.params._id}); }
    });
}, {
    name: 'home'
});
Router.route('/pagenotfound', function () {
    import '../imports/ui/layout/layout.js';

    this.render('headerExtended', {to: 'headerExtended'});
    this.render('footerExtended', {to: 'footerExtended'});

    clearMeta();
    DocHead.setTitle('Page Not Found - SpotMyCrib');
    DocHead.addMeta({name: "description", content: 'Could not find the page your are looking for, it might be removed. Please try again.'} );
    this.render('notFound');
}, {
    name: 'pagenotfound',
});
//https://themeteorchef.com/tutorials/server-side-routes-with-iron-router
// Router.route('/pagenotfoundserver', function () {
//     this.response.statusCode = 404;
//     this.response.end("Page not found." );
// }, {
//     name: 'pagenotfoundServer',
//     where: "server"
// });
Router.route('/joinnow', function () {
    import '../imports/ui/layout/layout.js'

    this.render('headerExtended', {to: 'headerExtended'});
    this.render('footerExtended', {to: 'footerExtended'});

    clearMeta();
    DocHead.setTitle('Join Now | SpotMyCrib');
    var description = 'Login to your account or create an account in SpotMyCrib to apply for a letting, update your references and social profiles.';
    DocHead.addMeta({name: "description", content: description} );

    if (Meteor.userId()) {
        Router.go('home');
    }else {
        if (this.ready()) {
            this.render('loginPageHorizontal');
        } else {
            this.render('loading');
        }
    }
}, {
    name: 'joinnow'
});
Router.route('/joinnow-landlord', function () {
    import '../imports/ui/layout/layout.js'

    this.render('headerExtended', {to: 'headerExtended'});
    this.render('footerExtended', {to: 'footerExtended'});

    clearMeta();
    DocHead.setTitle('Landlord Join Now | SpotMyCrib');
    var description = 'Login to your account or create an account in SpotMyCrib to manage your lettings and advertise your property.';
    DocHead.addMeta({name: "description", content: description} );

    if (Meteor.userId()) {
        Router.go('advertisewithus');
    }else {
        if (this.ready()) {
            this.render('loginPageHorizontal',{data :{isLandlordMode:true}});
        } else {
            this.render('loading');
        }
    }
}, {
    name: 'joinnowlandlord'
});
Router.route('/letting/:key', function () {
    import '../imports/ui/layout/layout.js'

    this.render('headerExtended', {to: 'headerExtended'});
    this.render('footerExtended', {to: 'footerExtended'});

    var key = Router.current().params.key;
    this.wait( Meteor.subscribe("viewLetting",key) );
    this.wait(Meteor.subscribe('Config'));


    if (this.ready()) {
        import '../imports/ui/templates/lettingDetail.js';

        this.layout('coreLayoutExtended');
        this.render('lettingDetail',{
            data : function () {
                // debugger;
                var id = Router.current().params.key;
                let Projects = Collections.Auctions;
                let selector = {
                    "lettingAuctionCode" : id
                };
                var ret = Projects.findOne(selector, {
                    transform: function(data){

                        var globalConfig = Collections.Config.findOne();
                        data.PD = Collections.Properties.findOne(data.propertyId);
                        data.applicationsReceivedCount = Collections.Bids.find({auctionId:data._id}).count();

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

                        if(data.contacts) {//Take the contact of activation not property
                            data.primaryContact = data.contacts[0];
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
                })//.fetch();
                // ret = ret[0];
                clearMeta();
                try {
                    var title = ret.PD.address.address + ', ' + ret.PD.address.area;
                    if (ret.PD.address.city) title += ', ' + ret.PD.address.city;

                    var socialDesc = "Apply for this " + ret.PD.type + ", view its images, details and much more.";
                    DocHead.setTitle('' + titleCase(title) + ' | SpotMyCrib');
                    DocHead.addMeta({
                        name: "description",
                        content: socialDesc
                    });

                    var socialTitle = '';
                    if(ret.PD.bedroomsCount) socialTitle += ret.PD.bedroomsCount+ ' Bed '
                    if(ret.PD.type) socialTitle += ret.PD.type+ ' available at '
                    socialTitle += title
                    socialTitle = '' + titleCase(socialTitle) + ' | SpotMyCrib'
                    DocHead.addMeta({property: "og:title", content: socialTitle});
                    DocHead.addMeta({property: "og:description", content: socialDesc});
                    DocHead.addMeta({property: "og:type", content: "place"});
                    DocHead.addMeta({property: "og:url", content: Router.routes['letting'].url({key: Router.current().params.key})  });
                    DocHead.addMeta({property: "fb:app_id", content: '309356899476430'})

                    try{DocHead.addMeta({property: "og:image", content: ret.PD.gallery[0].url  }); }
                    catch (c){
                        //Putting this here is making FB take the first response from here. & its showing no image if if this meta is later updated. So better put it later after all rendering at a template level. For now lets not keep anywhere.
                        // DocHead.addMeta({name: "og:image", content: 'https://www.spotmycrib.com/images/spot-my-crib-logo.png'  });
                    }


                }catch(err){
                    DocHead.setTitle(' Property not found | SpotMyCrib Admin');
                    DocHead.addMeta({name: "description", content: ""});
                }
                Session.set("propertyData",ret);
                return {data:ret};
            },
        });
    } else {
        this.render('loading');
    }

}, {
    name: 'letting'
});
Router.route('/account/myproperies/:pageno?', function () {
    import '../imports/ui/layout/layout.js'
    this.render('headerExtended', {to: 'headerExtended'});
    this.render('footerExtended', {to: 'footerExtended'});

    clearMeta();
    DocHead.setTitle('My properties | SpotMyCrib Admin');
    DocHead.addMeta({name: "description", content: "View list of your properties, activate them, print their keys, view their applications, etc."} );

    var pageno = Router.current().params.pageno
    var resperpage = 20;
    try{  resperpage = Router.current().params.query.resperpage; }catch(e){}
    this.wait(Meteor.subscribe('Config'));
    // this.wait(Meteor.subscribe('Properties'));
    this.wait(Meteor.subscribe('total-MyProperties'));
    this.wait( Meteor.subscribe("MyProperties",{viewName: 'MyProperties.view',pageno:pageno,resperpage:resperpage}) );
    this.wait(Meteor.subscribe('Auctions'));
    this.wait(Meteor.subscribe('Bids'));
    Meteor.subscribe('Areas');
    Meteor.subscribe('userData');

    if (!Meteor.userId()) {
        // if the user is not logged in, render the Login template
        this.render('loginPageHorizontal');
    }else {
        if (this.ready()) {
            import '../imports/ui/templates/myProperties.js';
            this.layout('coreLayoutExtended');
            this.render('myProperties');
        } else {
            this.render('loading');
        }
    }

}, {
    name: 'account/myProperties'
});
Router.route('/account/editproperty/:id', function () {
    import '../imports/ui/layout/layout.js'

    this.render('headerExtended', {to: 'headerExtended'});
    this.render('footerExtended', {to: 'footerExtended'});

    this.wait(Meteor.subscribe('Config'));
    var id = Router.current().params.id;
    this.wait(Meteor.subscribe('editProperty',id));
    this.wait(Meteor.subscribe('Areas'));//Let it wait in edit prop page
    Meteor.subscribe('userData');

    if (!Meteor.userId()) {
        // if the user is not logged in, render the Login template
        this.render('loginPageHorizontal');
    }else {
        if (this.ready()) {
            import '../imports/ui/templates/editProperty.js';
            this.layout('coreLayoutExtended');
            this.render('editProperty', {
                data: function () {
                    // debugger;
                    var id = Router.current().params.id;
                    var ret = Collections.Properties.find(id, {
                        transform: function (data) {

                            var globalConfig = Collections.Config.findOne();
                            if(data.auctionId)data.auction = Collections.Auctions.findOne(data.auctionId);

                            return data;
                        },
                        limit: 1
                    }).fetch();
                    ret = ret[0];

                    Session.set("propertyData", ret);
                    // return ret;
                    return {propertyData: ret};
                },
            });
            var ret = Session.get("propertyData");

            clearMeta();
            try {
                var title = 'Editing ' + ret.address.address + ', ' + ret.address.area;
                if (ret.address.city) title += ', ' + ret.PD.address.city;

                DocHead.setTitle('' + titleCase(title) + ' | SpotMyCrib Admin');
                DocHead.addMeta({
                    name: "description",
                    content: "Edit property " + ret.type + ", upload its images, details and much more."
                });
            }catch(err){
                DocHead.setTitle(' Property not found | SpotMyCrib Admin');
                DocHead.addMeta({name: "description", content: ""});
            }
            // this.render('editProperty');
        } else {
            this.render('loading');
        }
    }

}, {
    name: 'account/editproperty'
});
Router.route('/account/propertyapplications/:id/:pageno?', function () {
    import '../imports/ui/layout/layout.js'
    this.render('headerExtended', {to: 'headerExtended'});
    this.render('footerExtended', {to: 'footerExtended'});

    // var id = Router.current().params.id;
    // var auctionId = Router.current().params.query.auctionId;
    // this.wait(Meteor.subscribe('propertyApplication',id,auctionId));
    //
    // Meteor.subscribe('userData');

    this.wait(Meteor.subscribe('Config'));
    this.wait(Meteor.subscribe('Properties'));
    this.wait(Meteor.subscribe('Auctions'));
    this.wait(Meteor.subscribe('Bids'));
    // this.wait(Meteor.subscribe('userData'));
    this.wait(Meteor.subscribe('allUserData'));
    Meteor.subscribe('userData');
    // this.wait(Meteor.subscribe('avgOffer'));

    if (!Meteor.userId()) {
        // if the user is not logged in, render the Login template
        this.render('loginPageHorizontal');
    }else {
        if (this.ready()) {
            import '../imports/ui/templates/propertyApplications.js';
            this.layout('coreLayoutExtended');
            this.render('propertyApplications');
        } else {
            this.render('loading');
        }
    }

}, {
    name: 'account/propertyApplications'
});
Router.route('/account/manageproperty/:id/:pageno?', function () {
    import '../imports/ui/layout/layout.js'
    this.render('headerExtended', {to: 'headerExtended'});
    this.render('footerExtended', {to: 'footerExtended'});

    // this.wait(Meteor.subscribe('Config'));
    this.wait(Meteor.subscribe('Auctions'));
    this.wait(Meteor.subscribe('Bids'));
    // this.wait(Meteor.subscribe('userData'));
    this.wait(Meteor.subscribe('allUserData'));
    Meteor.subscribe('userData');

    var id = Router.current().params.id
    this.wait( Meteor.subscribe("Property",{viewName: 'property.view',id:id}) );
    this.wait( Meteor.subscribe("PropertyManage",{viewName: 'propertyManage.view',id:id}) );
    // var lim = Session.get('resultsPerPage');
    // if(!lim) lim = 100;
    this.wait( Meteor.subscribe("ActivityHistory",{limit: 50,id:id})  );
    // this.wait(Meteor.subscribe('PropertyManage'),{viewName: 'propertyManage.view',id:id});
    // this.wait(Meteor.subscribe('ActivityHistory'),{viewName: 'PMactivityHistory.view',id:id});

    if (!Meteor.userId()) {
        // if the user is not logged in, render the Login template
        this.render('loginPageHorizontal');
    }else {
        if (this.ready()) {
            import '../imports/ui/templates/propertyManage.js';
            this.layout('coreLayoutExtended');
            this.render('propertyManage');
        } else {
            this.render('loading');
        }
    }

}, {
    name: 'account/propertyManage'
});
Router.route('/account/profile/', function () {
    import '../imports/ui/layout/layout.js'
    this.render('headerExtended', {to: 'headerExtended'});
    this.render('footerExtended', {to: 'footerExtended'});

    this.wait(Meteor.subscribe('userData'));

    if (!Meteor.userId()) {
        // if the user is not logged in, render the Login template
        this.render('loginPageHorizontal');
        // Router.go('home');
    }else{
        if (this.ready()) {
            var data =  Accounts.user();
            try{
                if(data.profile.isPublic && data.profile.username){
                    Router.go('tenant',{username:data.profile.username})
                }
            }catch(e){
                console.log(e);
            }

            import '../imports/ui/templates/profile.js';
            this.layout('coreLayoutExtended');
            this.render('profile');
        } else {
            this.render('loading');
        }
    }


}, {
    name: 'account/profile'
});
Router.route('/lettingprintview/:key', function () {
    import '../imports/ui/layout/layout.js'
    this.layout('plainLayout');

    this.wait(Meteor.subscribe('Config'));
    this.wait(Meteor.subscribe('Properties'));
    this.wait(Meteor.subscribe('Auctions'));

    if (this.ready()) {
        import '../imports/ui/templates/lettingprintview.js';

        this.layout('plainLayout');
        this.render('lettingprintview',{
            data : function () {
                // debugger;
                var id = Router.current().params.key;
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
    if (ret.PD.address.city) title += ', ' + ret.PD.address.city;

    DocHead.setTitle('' + titleCase(title) + ' | SpotMyCrib.com');
    DocHead.addMeta({name: "description", content: "Print key for " + ret.PD.type + "."});
}catch(err){
    DocHead.setTitle(' Property not found | SpotMyCrib Admin');
    DocHead.addMeta({name: "description", content: ""});
}

                return {data:ret};
            },
        });

    } else {
        this.render('loading');
    }

}, {
    name: 'lettingprintview'
});
Router.route('/estateagent', function () {
    import '../imports/ui/layout/layout.js'
    this.layout('plainLayout');

    if (this.ready()) {
        // import '../imports/ui/templates/lettingprintview.js';
        // import '../public/css/estateagent.css'
        //import scrollify from 'jquery-scrollify'

        clearMeta();
        title = 'Agents/Landlords | SpotMyCrib'
        desc = 'Learn on why you need next generation high tech automated property managment solution. Learn how SpotMyCrib can ease your life with tenant screening, digital leasing, online rent collection and much more. ';
        DocHead.setTitle(title);
        DocHead.addMeta({name: "description", content: desc});
        this.layout('plainLayout');
        this.render('estateagent');

    } else {
        this.render('loading');
    }

}, {
    name: 'estateagent'
});
Router.route('/tenant/:username', function () {
    import '../imports/ui/layout/layout.js'
    this.render('headerExtended', {to: 'headerExtended'});
    this.render('footerExtended', {to: 'footerExtended'});

    this.wait(Meteor.subscribe('userData'));//only if viewing your profile
    this.wait(Meteor.subscribe('userDataUsername',Router.current().params.username));//if viewing your profile and others

    if (this.ready()) {
        import '../imports/ui/templates/tenant.js';
        this.layout('coreLayoutExtended');
        this.render('tenant');
    } else {
        this.render('loading');
    }
}, {
    name: 'tenant'
});
Router.route('/tenants/:pageno?', function () {
    import '../imports/ui/layout/layout.js'
    this.render('headerExtended', {to: 'headerExtended'});
    this.render('footerExtended', {to: 'footerExtended'});

    clearMeta();
    DocHead.setTitle('Tenant database | SpotMyCrib');
    var description = 'View list of interested tenant profiles, their references and social profiles. Invite them to apply for your letting advertisement.';
    DocHead.addMeta({name: "description", content: description} );

    this.wait(Meteor.subscribe('userData'));

    var pageno = Router.current().params.pageno; if(!pageno)pageno=1;
    this.wait( Meteor.subscribe("tenants",pageno) );

    if (this.ready()) {
        import '../imports/ui/templates/tenants.js';
        this.layout('coreLayoutExtended');
        this.render('tenants');
    } else {
        this.render('loading');
    }
}, {
    name: 'tenants'
});
Router.route('/b/:slug/:pageno?', function () {
    import '../imports/ui/layout/layout.js'
    this.render('headerExtended', {to: 'headerExtended'});
    this.render('footerExtended', {to: 'footerExtended'});




    var pageno = Router.current().params.pageno; if(!pageno)pageno=1;
    var resperpage = 20;

    var maxRent = Router.current().params.query.maxRent; if(!maxRent)maxRent="";
    var slug = Router.current().params.slug;
    var query = Router.current().params.query;

    if(!slug || slug.indexOf('-in-')==-1){
        // this.render('notFound');
        var prevRoute = {name: 'home',args:{scrollTo:0} }
        Session.set('prevRoute',prevRoute);
        Router.go('pagenotfound');
        return;
    }


    this.wait( Meteor.subscribe("browseLettings",{viewName: 'browseLettings.view',slug:slug, pageno:pageno,resperpage:resperpage,query:query}) );
    this.wait( Meteor.subscribe("total-houses-for-rent-count",{viewName: 'browseLettings.view',slug:slug, pageno:pageno,resperpage:resperpage,query:query}) );

    Meteor.subscribe('userData'); //This page also works offline
    Meteor.subscribe('Areas')
    Meteor.subscribe('Config'); //this.wait(Meteor.subscribe('Config')); no used in this page.

    if (this.ready()) {
        import '../imports/ui/templates/housesforrent.js';

        clearMeta();
        var title = slug.replace(/[-_]/g,' ')
        var description = "Browse thorught "+title
        DocHead.setTitle('' + titleCase(title) + ' | SpotMyCrib.com');
        DocHead.addMeta({name: "description", content: description});

        this.layout('coreLayoutExtended');
        this.render('housesforrent');
    } else {
        this.render('loading');
    }
}, {
    name: 'b'
});
scrollRequestStarted=false;
Router.route('/advertisewithus/:pageno?', function () {
    import '../imports/ui/layout/layout.js'
    this.render('headerExtended', {to: 'headerExtended'});
    this.render('footerExtended', {to: 'footerExtended'});

    clearMeta();
    var title = "Advertise with us";
    var pageno = parseInt(Router.current().params.pageno); if(!pageno)pageno=1;
    if(pageno==2)title +=' (step 2 of 3)'
    if(pageno==3)title +=' (step 3 of 3)'
    DocHead.setTitle(title+' | SpotMyCrib');
    var description = 'List your property to rent in SpotMyCrib. Let thousands of verified tenants apply for your letting. Choose if you are a landlord, agent or the current tenant looking for a replacement so you can move.';
    DocHead.addMeta({name: "description", content: description} );
    switch(pageno){
        case 1:
            Meteor.subscribe('Areas');
            Meteor.subscribe('Config');
            Meteor.subscribe('userData')//User data is scbscribed automatically
            break;
        case 2:
            this.wait( Meteor.subscribe('userData') )//User data is scbscribed automatically
            break;
        case 3:
            this.wait( Meteor.subscribe('userData') )//User data is scbscribed automatically
            Meteor.subscribe("MyAdvertisements",{viewName: 'MyAdvertisements.view',pageno:1,resperpage:10}) ;
    }


    if (this.ready()) {
        import '../imports/ui/templates/advertisewithus.js';
        this.layout('coreLayoutExtended');
        this.render('advertisewithus');
        if(!scrollRequestStarted) {
            scrollRequestStarted = true; //deplicate route events, so preventing multiple scroll events
            setTimeout(function () {
                scrollTo('#main', -10, 100)
                console.log('called scroll to')
                scrollRequestStarted = false;
            }, 500)
        }
    } else {
        this.render('loading');
    }
}, {
    name: 'advertisewithus'
});
// onBeforeAction: function () {
//     // all properties available in the route function
//     // are also available here such as this.params
//
//     if (!Meteor.userId()) {
//         // if the user is not logged in, render the Login template
//         this.render('Login';
//     } else {
//         // otherwise don't hold up the rest of hooks or our route/action function
//         // from running
//         this.next();
//     }
// }
// Router.onBeforeAction(myAdminHookFunction, {
//     only: ['admin']
//     // or except: ['routeOne', 'routeTwo']
// });



let staticPages = ["about", "team", "faqs", "terms", "privacy", "contactus", "howitworks", "cookiepolicy", "careers", "gdpr" ];
//

/**
 * app router mapping
 */
Router.map(function route() {
  for (let page of staticPages) {
    this.route(page, {
      // controller: defRouteController,
      pageType:'static',
      name: page
    });
  }
  return this.route("notFound", {
    path: "/(.*)"
  });
});

Router.after(function(){
    if(Meteor.isClient){
        if (this.route.options.pageType=='static'){
            var title = '',desc = '';
            switch(this.route.options.name){
                case 'about':
                    title = 'About SpotMyCrib'
                    desc = generalDesc;
                    break;
                case 'terms':
                    title = 'Terms of Service | SpotMyCrib'
                    desc = 'Read our terms and conditions and learn more on how we operate and our values.';
                    break;
                case 'faqs':
                    title = 'FAQs | SpotMyCrib'
                    desc = 'Frequently asked questions by tenants(users) and landlords/estate agents.';
                    break;
                case 'privacy':
                    title = 'Privacy policy | SpotMyCrib'
                    desc = 'Find how we keep your data safe and secure. Read our cookie policy and much more on our privacy policy.';
                    break;
                case 'contactus':
                    title = 'Contact Us | SpotMyCrib'
                    desc = 'Find our contact details and work timings here.';
                    break;
                case 'howitworks':
                    title = 'How it works | SpotMyCrib'
                    desc = 'Find your next dream home fast, easy and simple way.';
                    break;
                case 'careers':
                    title = 'Careers | SpotMyCrib'
                    desc = 'We are hiring! Work in the most innovative online real estate company. ';
                    // import '../static/careers.js';
                    break;
                case 'estateagent':
                    title = 'Agents/Landlords | SpotMyCrib'
                    desc = 'Learn on why you need next generation high tech automated property managment solution. Learn how SpotMyCrib can ease your life with tenant screening, digital leasing, online rent collection and much more. ';
                    // import '../static/careers.js';
                    break;
                case 'gdpr':
                    title = 'Data Protection / EU GDPR | SpotMyCrib'
                    desc = 'An overview of Data Protection and EU GDPR and how we are preparing for it at SpotMyCrib.';
                    break;
                default:
            }
            clearMeta();
            DocHead.setTitle(title);
            DocHead.addMeta({name: "description", content: desc} );
            try{
                jQuery("html,body").animate({scrollTop: 0}, 250);
            }catch(e){
                document.body.scrollTop = document.documentElement.scrollTop = 0;
            }
        }
        var fontsLoaded = Session.get('fontsLoaded');
        if(!fontsLoaded) loadFonts();
    }
});



