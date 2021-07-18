import React from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';
import { mount } from 'react-mounter';

if(Meteor.isClient)Session.set('subscriptionsReady',false);


// Search 1000s of houses, apartments & properties for sale and to rent from all leading estate agents
//SpotMyCrib helps you find your dream house in the easiest way possible. You get to set your rent when you apply for the house, apartment or property online with leading estate agents/landlords in Ireland. Experience the safest, transparent and innovative rental process in Ireland.
generalDesc = "Find your dream house in the easiest way possible. Set your rent when you apply for the house, apartment or property online with leading estate agents/landlords in Ireland. Experience the safest, transparent and innovative rental process in Ireland. SpotMyCrib.";

FlowRouter.route('/', {
    name: "home",
    action() {
        if (Meteor.isClient) BlazeLayout.reset()
        import Home from '../imports/reactui/pages/Home.jsx';
        clearMeta();
        DocHead.setTitle('SpotMyCrib - Safe and easy rentals');
        DocHead.addMeta({name: "description", content: generalDesc} );

        mount(Home, {content: 'test'});
    }
});
FlowRouter.route('/rent/:slug/:key', {
    name: 'rent',
    action(params, queryParams) {
        if (Meteor.isClient) BlazeLayout.reset()

        import LettingDetail from '../imports/reactui/pages/LettingDetail.jsx';
        mount(LettingDetail);

    }
});
FlowRouter.route('/blog/:pageno?', {
    name: 'bloghome',
    action(params, queryParams) {
        if (Meteor.isClient) BlazeLayout.reset()
        import BlogHome from '../imports/reactui/pages/BlogHome.jsx';
        clearMeta();
        DocHead.setTitle('Blog - SpotMyCrib - Property renting tips, management and much more');
        DocHead.addMeta({name: "description", content: "Browse through the latest property news, renting tips, management and much more."} );

        mount(BlogHome);
    }
});
FlowRouter.route('/article/:slug', {
    name: 'blogdetail',
    action(params, queryParams) {
        if (Meteor.isClient) BlazeLayout.reset()
        import BlogDetail from '../imports/reactui/pages/BlogDetail.jsx';
        mount(BlogDetail);
    }
});
FlowRouter.route('/letting/:key', {
    name: 'letting',
    action(params, queryParams) {
        if (Meteor.isClient) BlazeLayout.reset()
        import LettingDetail from '../imports/reactui/pages/LettingDetail.jsx';
        mount(LettingDetail);

    }
});
FlowRouter.route('/advertisewithus/:pageno?', {
    name: "advertisewithus",
    action(params, queryParams) {
        var curStep = parseInt(params.pageno); if(!curStep)curStep=1;

        clearMeta();
        var title = "Advertise with us";
        if(curStep==2)title +=' (step 2 of 3)'
        if(curStep==3)title +=' (step 3 of 3)'
        DocHead.setTitle(title+' | SpotMyCrib');
        var description = 'List your property to rent in SpotMyCrib. Let thousands of verified tenants apply for your letting. Choose if you are a landlord, agent or the current tenant looking for a replacement so you can move.';
        DocHead.addMeta({name: "description", content: description} );

        let curStepComponent = 'AwsStep1';
        switch(curStep){
            case 1://advertiseWithUsFormDelayedRan1st = false;
                curStepComponent = 'AwsStep1';break;
            case 2:curStepComponent =  'AwsStep2';break;
            case 3:curStepComponent =  'AwsStep3';break;
        }
        if (Meteor.isClient) BlazeLayout.reset()
        import AdvertiseWithUs from '../imports/reactui/pages/AdvertiseWithUs.jsx';
        mount(AdvertiseWithUs, {curStepComponent: curStepComponent});
    }
});
FlowRouter.route('/b/:slug/:pageno?', {
    name: "b",
    action(params, queryParams) {
        if (Meteor.isClient) BlazeLayout.reset()

        if(!params.slug || params.slug.indexOf('-in-')==-1){
            var prevRoute = {name: 'home',args:{scrollTo:0} }
            if(Meteor.isClient)Session.set('prevRoute',prevRoute);
            FlowRouter.go('pagenotfound');
            return;
        }

        import HousesForrent from '../imports/reactui/pages/HousesForrent.jsx';
        mount(HousesForrent);
    }
});
FlowRouter.route('/joinnow', {
    name: 'joinnow',
    action () {
        if(Meteor.isServer)return;
        if(Meteor.isClient) {
            import '../imports/ui/layout/layout.js'

            clearMeta();
            DocHead.setTitle('Join Now | SpotMyCrib');
            var description = 'Login to your account or create an account in SpotMyCrib to apply for a letting, update your references and social profiles.';
            DocHead.addMeta({name: "description", content: description} );

            mount(() => (<span></span>));
            BlazeLayout.render('reactLayout', { templateName: 'loginPageHorizontal' });
        }
        // BlazeLayout.render('loading');

    }
});
FlowRouter.route('/joinnow-landlord', {
    name: 'joinnowlandlord',
    action () {
        if(Meteor.isServer)return;
        if(Meteor.isClient) {
            import '../imports/ui/layout/layout.js'
            clearMeta();
            DocHead.setTitle('Landlord Join Now | SpotMyCrib');
            var description = 'Login to your account or create an account in SpotMyCrib to manage your lettings and advertise your property.';
            DocHead.addMeta({name: "description", content: description} );

            mount(() => (<span></span>));
            BlazeLayout.render('reactLayout', { templateName: 'loginPageHorizontal',dataContext :{isLandlordMode:true} });
        }
        // BlazeLayout.render('loading');

    }
});
var accountRoutes = FlowRouter.group({
    prefix: '/account',
    name: 'account',
    triggersEnter: [function(context, redirect) {
        // console.log('running account group triggers');
    }]
});
accountRoutes.route('/myproperies/:pageno?', {
    name: 'account/myProperties',
    action () {
        if(Meteor.isServer)return;
        if(Meteor.isClient) {
            import '../imports/ui/layout/layout.js'
            clearMeta();
            DocHead.setTitle('My properties | SpotMyCrib Admin');
            DocHead.addMeta({name: "description", content: "View list of your properties, activate them, print their keys, view their applications, etc."} );

            import '../imports/ui/templates/myProperties.js';
            mount(() => (<span></span>));
            BlazeLayout.render('reactLayout', { templateName: 'myProperties' });
        }

    }
});
accountRoutes.route('/editproperty/:id', {
    name: 'account/editproperty',
    action () {
        if(Meteor.isServer)return;
        if(Meteor.isClient) {
            import '../imports/ui/layout/layout.js'

            import '../imports/ui/templates/editProperty.js';
            mount(() => (<span></span>));
            BlazeLayout.render('reactLayout', { templateName: 'editProperty' });
        }

    }
});
accountRoutes.route('/propertyapplications/:id/:pageno?', {
    name: 'account/propertyApplications',
    action () {
        if(Meteor.isServer)return;
        if(Meteor.isClient) {
            import '../imports/ui/layout/layout.js'

            import '../imports/ui/templates/propertyApplications.js';
            mount(() => (<span></span>));
            BlazeLayout.render('reactLayout', { templateName: 'propertyApplications' });
        }

    }
});
accountRoutes.route('/manageproperty/:id/:pageno?', {
    name: 'account/propertyManage',
    action () {
        if(Meteor.isServer)return;
        if(Meteor.isClient) {
            import '../imports/ui/layout/layout.js'

            import '../imports/ui/templates/propertyManage.js';
            mount(() => (<span></span>));
            BlazeLayout.render('reactLayout', { templateName: 'propertyManage' });
        }

    }
});
accountRoutes.route('/profile', {
    name: 'account/profile',
    action () {
        if(Meteor.isServer)return;
        if(Meteor.isClient) {
            import '../imports/ui/layout/layout.js'

            import '../imports/ui/templates/profile.js';
            mount(() => (<span></span>));
            BlazeLayout.render('reactLayout', { templateName: 'profile' });
        }

    }
});
FlowRouter.route('/lettingprintview/:key', {
    name: 'lettingprintview',
    action () {
        if(Meteor.isServer)return;
        if(Meteor.isClient) {
            import '../imports/ui/layout/layout.js'

            import '../imports/ui/templates/lettingprintview.js';
            mount(() => (<span></span>));
            BlazeLayout.render('reactPlainLayout', { templateName: 'lettingprintview' });
        }
    }
});
FlowRouter.route('/tenant/:username', {
    name: 'tenant',
    action () {
        if(Meteor.isServer)return;
        if(Meteor.isClient) {
            import '../imports/ui/layout/layout.js'

            import '../imports/ui/templates/tenant.js';
            mount(() => (<span></span>));
            BlazeLayout.render('reactLayout', { templateName: 'tenant' });
        }

    }
});
FlowRouter.route('/tenants/:pageno?', {
    name: 'tenants',
    action () {
        if(Meteor.isServer)return;
        if(Meteor.isClient) {
            import '../imports/ui/layout/layout.js'

            DocHead.setTitle('Tenant database | SpotMyCrib');
            var description = 'View list of interested tenant profiles, their references and social profiles. Invite them to apply for your letting advertisement.';
            DocHead.addMeta({name: "description", content: description} );

            import '../imports/ui/templates/tenants.js';
            mount(() => (<span></span>));
            BlazeLayout.render('reactLayout', { templateName: 'tenants' });
        }

    }
});
FlowRouter.notFound = {
    triggersEnter: [function(context, redirect) {
        redirect('/notFound');
    }],
    action: function() {
        console.log('Route not found')
    }
};
FlowRouter.route('/notFound', {
    name: 'notFound',
    action () {
        if (Meteor.isClient) BlazeLayout.reset()

        clearMeta();
        DocHead.setTitle('Page Not Found | SpotMyCrib');
        DocHead.addMeta({name: "description", content: 'Could not find the page your are looking for, it might be removed. Please try again.'} );

        import NotFound from '../imports/reactui/layout/NotFound.jsx';
        mount(NotFound);
    }
});
FlowRouter.route('/about', {
    name: 'about',
    action () {
        if (Meteor.isClient) BlazeLayout.reset()

        setStaticPageMetaTags('about')
        import About from '../imports/reactui/static/About.jsx';
        mount(About);
    }
});
FlowRouter.route('/careers', {
    name: 'careers',
    action () {
        if (Meteor.isClient) BlazeLayout.reset()

        setStaticPageMetaTags('careers')
        import Careers from '../imports/reactui/static/Careers.jsx';
        mount(Careers);
    }
});
FlowRouter.route('/contactus', {
    name: 'contactus',
    action () {
        if (Meteor.isClient) BlazeLayout.reset()

        setStaticPageMetaTags('contactus')
        import ContactUs from '../imports/reactui/static/ContactUs.jsx';
        mount(ContactUs);
    }
});
FlowRouter.route('/cookiepolicy', {
    name: 'cookiepolicy',
    action () {
        if (Meteor.isClient) BlazeLayout.reset()

        setStaticPageMetaTags('cookiepolicy')
        import CookiePolicy from '../imports/reactui/static/CookiePolicy.jsx';
        mount(CookiePolicy);
    }
});
FlowRouter.route('/faqs', {
    name: 'faqs',
    action () {
        if (Meteor.isClient) BlazeLayout.reset()

        setStaticPageMetaTags('faqs')
        import Faqs from '../imports/reactui/static/Faqs.jsx';
        mount(Faqs);
    }
});
FlowRouter.route('/gdpr', {
    name: 'gdpr',
    action () {
        if (Meteor.isClient) BlazeLayout.reset()

        setStaticPageMetaTags('gdpr')
        import Gdpr from '../imports/reactui/static/Gdpr.jsx';
        mount(Gdpr);
    }
});
FlowRouter.route('/howitworks', {
    name: 'howitworks',
    action () {
        if (Meteor.isClient) BlazeLayout.reset()

        setStaticPageMetaTags('howitworks')
        import HowItWorks from '../imports/reactui/static/HowItWorks.jsx';
        mount(HowItWorks);
    }
});
FlowRouter.route('/privacy', {
    name: 'privacy',
    action () {
        if (Meteor.isClient) BlazeLayout.reset()

        setStaticPageMetaTags('privacy')
        import Privacy from '../imports/reactui/static/Privacy.jsx';
        mount(Privacy);
    }
});
FlowRouter.route('/terms', {
    name: 'terms',
    action () {
        if (Meteor.isClient) BlazeLayout.reset()

        setStaticPageMetaTags('terms')
        import Terms from '../imports/reactui/static/Terms.jsx';
        mount(Terms);
    }
});
FlowRouter.route('/estateagent', {
    name: 'estateagent',
    action () {
        if (Meteor.isClient) BlazeLayout.reset()

        setStaticPageMetaTags('estateagent')
        import EstateAgent from '../imports/reactui/static/EstateAgent.jsx';
        mount(EstateAgent);
    }
});


generalDesc = "Find your dream house in the easiest way possible. Set your rent when you apply for the house, apartment or property online with leading estate agents/landlords in Ireland. Experience the safest, transparent and innovative rental process in Ireland. SpotMyCrib.";
function setStaticPageMetaTags(pageName){
    var title = '',desc = '';
    switch(pageName){
        case 'about':
            title = 'About SpotMyCrib'
            desc = "Know more about SpotMyCrib and what inspires us to build the safest, transparent and innovative rental portal in Ireland. Learn more on how we operate and our values. Experience SpotMyCrib.";
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
        case 'cookiepolicy':
            title = 'Cookie Policy | SpotMyCrib'
            desc = 'An overview of our cookie policy and how we use them to provide you with best user experence.';
            break;
        default:
    }
    clearMeta();
    DocHead.setTitle(title);
    DocHead.addMeta({name: "description", content: desc} );

    ////////////Adding below code only for static
    if(Meteor.isClient) {
        setTimeout(function(){
            try {
                jQuery("html,body").animate({scrollTop: 0}, 250);
            } catch (e) {
                document.body.scrollTop = document.documentElement.scrollTop = 0;
            }
        },2000)
    }
}
// FlowRouter.triggers.enter([function(){
//
// }]);

// FlowRouter.go('account/propertyApplications')
// tesing my properties from anonomoues tab to see if login works and if pubs work fine,
//     also if post login , will it automatically update pubs?
//     use ctrl+m to see the records returned by pubs
//FlowRouter.current().route.getName()  to FlowRouter.current().route.name
//Router to FlowRouter
// 1. all routes conversion
// 2. new react header and footer used in home page needs to work
// 3. react ssr work
// 4. performance tuning for pages that are using ssr
// 5. category pages
//

// FlowRouter.route("/", {
//   subscriptions: function() {
//     var selector = {category: {$ne: "private"}};
//     this.register('posts', Meteor.subscribe('posts', selector));
//   },
//   action: function() {
//     ReactLayout.render(BlogLayout, {
//       content: <PostList />
//     });
//   }
// });


// if(Meteor.isServer) {
//     WebApp.connectHandlers.use('/', function(req, res, next) {
//         if(isValidRoute(req.url))
//             return next();
//
//         res.writeHead(404);
//         res.end(SSR.render('404'));
//     });
//
//     var pathToRegexp = Meteor.npmRequire('path-to-regexp')
//
//     function isValidRoute(requestUrl) {
//         for(var i = 0; i < FlowRouter._routes.length; i++)
//             if(pathToRegexp(FlowRouter._routes[i].path).test(requestUrl))
//                 return true;
//
//         return false;
//     }
// }