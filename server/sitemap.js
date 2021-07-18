/**
 * Created by njanjanam on 23/12/2017.
 */
sitemaps.add('/sitemap.xml', function() {
    // 'page' is reqired
    // 'lastmod', 'changefreq', 'priority' are optional.

    var ret = [
        { page: '/', changefreq: 'daily', priority: 0.9 } ,
        { page: '/advertisewithus', changefreq: 'hourly', priority: 0.9 } ,
        { page: '/estateagent', changefreq: 'hourly', priority: 0.9 } ,
        { page: '/faqs', changefreq: 'daily', priority: 0.9 } ,
        { page: '/about', changefreq: 'monthly', priority: 0.4 } ,
        { page: '/contactus', changefreq: 'daily', priority: 0.4 } ,
        { page: '/careers', changefreq: 'monthly', priority: 0.2 } ,
        { page: '/howitworks', changefreq: 'daily', priority: 0.5 } ,
        { page: '/cookiepolicy', changefreq: 'monthly', priority: 0.2 } ,
        { page: '/terms', changefreq: 'monthly', priority: 0.2 } ,
        { page: '/privacy', changefreq: 'monthly', priority: 0.2 } ,
        { page: '/gdpr', changefreq: 'monthly', priority: 0.2 } ,
        { page: '/b/rent-in-ireland', changefreq: 'hourly', priority: 1 } ,
    ];


    var ele;
    var auctions = Collections.Auctions.find({isArchived:false},{
        transform:function(doc){
            var prop = Collections.Properties.findOne({_id:doc.propertyId})
            doc.slug = prop.slug
            return doc;
        },
        limit:1000,
        sort: {updatedAt: -1}
    }).fetch()
    for(var i=0;i<auctions.length;i++){
        ele = auctions[i];
        if(!ele.lettingAuctionCode)continue;
        if(!ele.slug)continue;
        ret.push({ page: 'rent/'+ele.slug+'/'+ele.lettingAuctionCode,priority: 1 })
        // ret.push({ page: 'letting/'+ele.lettingAuctionCode,priority: 1 })
    }


//lastmod: new Date().getTime(),
    return ret;
});

