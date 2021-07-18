import "./layout.html";
import "./header.js";
import "./footer.js";
if(Meteor.isClient){



    Meteor.startup(function () {
        Blaze._allowJavascriptUrls();
    })
}