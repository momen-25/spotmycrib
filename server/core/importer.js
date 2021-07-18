/**
 * Created by naga on 19/03/2018.
 */

Meteor.methods({
    importPost:function(url){
        if(!url)return {};//Empty url
        var user = Meteor.user()
        if(!user){
            console.log('not logged in');
            return;
        }
        // var cheerio = Meteor.npmRequire('cheerio');
        var cheerio = require('cheerio');

        result = Meteor.http.get(url);
        $ = cheerio.load(result.content);

        var tmp = '';

        return {};//hiding this code
    }
})
