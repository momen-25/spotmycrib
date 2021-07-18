/**
 * Created by srikanth681 on 29/02/16.
 */
function cleanText(str){
    if(!str)return str;
    str = str.toString().trim();
    str = str.replace('http://blog.spotmycrib.com','http://www.spotmycrib.ie/blog');
    str = str.replace('www.spotmycrib.com','www.spotmycrib.ie');
    str = str.replace(/(^,)|(,$)/g, "") //",liger, unicorn, snipe," will remove first and last comma
    return str
}
function titleCase(str) {
  if(!str)return;
  return str.charAt(0).toUpperCase() + str.toLowerCase().substring(1);
}
function decodeHTMLEntities(text) {
    var entities = [
        ['amp', '&'],
        ['apos', '\''],
        ['#x27', '\''],
        ['#x2F', '/'],
        ['#39', '\''],
        ['#47', '/'],
        ['lt', '<'],
        ['gt', '>'],
        ['nbsp', ' '], ['raquo', ''],
        ['quot', '"']
    ];

    if(text)
    for (var i = 0, max = entities.length; i < max; ++i)
        text = text.replace(new RegExp('&'+entities[i][0]+';', 'g'), entities[i][1]);

    return text;
}
function stripHTML(str){
    return str.replace(/<\/?[^>]+(>|$)/g, "");
}
function numDifferentiation(val) {
    if(val >= 1000000000) val = (val/1000000000).toFixed(2) + ' Billion';
    else if(val >= 1000000) val = (val/1000000).toFixed(2) + ' Million';
    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}
function chunkify(a, n, balanced) {

  if (n < 2)
      return [a];

  if(!Array.isArray(a))return [];

  var len = a.length,
      out = [],
      i = 0,
      size;

  if (len % n === 0) {
      size = Math.floor(len / n);
      while (i < len) {
          out.push(a.slice(i, i += size));
      }
  }

  else if (balanced) {
      while (i < len) {
          size = Math.ceil((len - i) / n--);
          out.push(a.slice(i, i += size));
      }
  }

  else {

      n--;
      size = Math.floor(len / n);
      if (len % size === 0)
          size--;
      while (i < size * n) {
          out.push(a.slice(i, i += size));
      }
      out.push(a.slice(size * n));

  }

  return out;
}
function chunkifyObj(a, n, balanced){
  let ret = chunkify(a, n, balanced);
  if(ret.length > 1){
    let newRet = [], tmp;
    // New Format is
    // [
    //   {props: [prop1, prop2, prop3]},
    //   {props: [prop1, prop2, prop3]}
    // ]
    for(let i=0;i<ret.length;i++){
      console.log(ret[i]);
      tmp = {};
      tmp = {props: ret[i] };
      newRet.push(tmp);
    }
    ret = newRet;
  }
  return ret;
}
// todo: 
// Create indexes for emailEnquiries and emailRequests
var emailProcessors = {
  emailEnquiryReceived : function(){
    /*
    Assumptions and requirements
    - There can be only emailRequest / user / property
    - There can be multiple emailRequests / user but diff properties
    - There should be only one email send for 1 user - by this method - with a max cut of of 4 props per email
    - One email can contain props belonging to multiple agents - there is no agent specific grouping - to reduce the number of testing scenarios and the logic simple.
    */
    let list = Collections.EmailRequests.find({isArchived:false, requestType: "emailEnquiryReceived"},{
      transform: function(data){
        data.property = Collections.Properties.findOne({_id:data.propertyId});
        data.property.address.address = cleanText(data.property.address.address)
        data.property.address.area = cleanText(data.property.address.area)
        data.property.address.county = cleanText(data.property.address.county)
          let altText = '';
          data.property.sliderImages = []
          if(data.property.gallery){
              for(var i=0;i<data.property.gallery.length;i++){
                  altText = 'Photo '+(i+1)+' of '+titleCase(data.property.address.address)
                  if (data.property.address.area) altText +=', '+titleCase(data.property.address.area)
                  if (data.property.address.county) altText +=', '+titleCase(data.property.address.county)

                  data.property.sliderImages.push({url:data.property.gallery[i].url,altText:altText})
              }
          }
          data.property.desktopHideClassName = "desktop_hide";
          if(data.property.sliderImages.length==0)data.property.desktopHideClassName = "";

        data.emailEnquiry = Collections.EmailEnquiries.findOne({_id:data.emailEnquiryId});
        data.propertyImage = null;
        if(data.property.gallery){
          if(data.property.gallery[0])data.property.propertyImage = data.property.gallery[0]
        }

        data.property.bedsCount = data.property.bedrooms.length;
        data.auction = Collections.Auctions.findOne({_id:data.property.auctionId});
        if(data.auction)//// Added to handle recoreds with no actions, we can directly archive this records. 
        data.auction.rentFormated = numDifferentiation(data.auction.price);
        //ToDo: What if property is deactivated in the meanwhile and property.auctionId is empty, then this will throw an error.

        if(data.property)
            data.agent = Meteor.users.findOne({_id:data.property.createdByAgent});
        else console.log('no property found for: '+data.propertyId)
        return data;
      },
      sort:{createdAt:-1}
    }).fetch();
    if(list.length==0)return;
    console.log('total requests found: '+list.length)
    if(!list.length) return true;
    let userEmailList = [], maxPropertiesPerEmail = 4, i, j, k, a, req = {}, listOfInvalidReqsToArchive = [], listOfReqsToArchive = [], listOfReqsToArchiveTmp = [], user={}, emailReq = {}, tmp = {}, userFirstName='', agentName ='', address='', subject = '', globalConfig = Collections.Config.findOne();
    for(i=0;i<list.length;i++){
      req = list[i];
      listOfReqsToArchiveTmp = []
      try{
        if(!req.auction || !req.agent){
          //Auction not found. 
          console.log('Auction or Agent not found for propId: '+req.property._id)
          listOfInvalidReqsToArchive.push(req._id);
          continue;
        }
        console.log('Auction found for propId: '+req.property._id)
        if(listOfReqsToArchive.indexOf(req._id)!=-1){// already processed
          //duplicate request ; this user already has a fully composed object in emailReqList;
          continue;
        }
        //Now compose a new object that has a list of all emailRequests by this user for all properties
        emailReq.userEmail = req.userEmail;
        emailReq.fullname = req.fullname;
        emailReq.property = req.property;
        emailReq.auction = req.auction;
        emailReq.agent = req.agent;
        ///////Easiest way - but too many DB queries
        // emailReq.emailRequests = Collections.EmailRequests.find({isArchived:false, status:"new",requestType: "emailEnquiryReceived", userEmail: req.userEmail},{sort:{createdAt:-1}}).fetch();
        ///////Efficient way 
        emailReq.emailRequests = []
        emailReq.landlordNames = []
        emailReq.propertyKeys = []

        k=0;//This represents the number of sub child props per email.
        for(j=0;j<list.length;j++){
          tmp = list[j];
          if(k >= maxPropertiesPerEmail) break;
          if(tmp.userEmail == emailReq.userEmail){//of same user, so add it to the list
            if(k==0){tmp.isFirstProperty=true}else tmp.isFirstProperty=false
            emailReq.emailRequests.push(tmp);
            k++;// increment this only of child is added via - emailReq.emailRequests.push

            listOfReqsToArchiveTmp.push(tmp._id);
            emailReq.landlordNames.push(tmp.agent.profile.name)
            emailReq.propertyKeys.push(tmp.auction.lettingAuctionCode)
          }else{continue;}
        }
        // emailReqList.push(emailReq);
        /// END OF loop; now emailReqList is a processed version of "list" ; it has a list of users and sub list of all their emailRequests of type emailEnquiryReceived
        if(!emailReq.emailRequests.length) {// it should be at least 1
          console.log('No sub requests found. completely ignore this user request');//Code should never come here, its only kept as precaution
          continue;
        }
        ///////////////////////////MAIL CODE - 
        address = titleCase(emailReq.property.address.address);
        if (emailReq.property.address.area) address +=', '+titleCase(emailReq.property.address.area)
        if (emailReq.property.address.county) address +=', '+titleCase(emailReq.property.address.county)
        subject = 'Your enquiry for '+address;
        a = emailReq.landlordNames;
        a = a.filter( onlyUnique );//Only unique
        agentNames = [a.slice(0, -1).join(', '), a.slice(-1)[0]].join(a.length < 2 ? '' : ' and ')
        userFirstName = emailReq.fullname;
        if(userFirstName){
          userFirstName = titleCase(userFirstName.split(' ')[0]);
        }

        user = {
            "profile":{
                name:emailReq.fullname,
                email:emailReq.userEmail,
                userFirstName:userFirstName
            }
        }
        var mailData     = {
            template    : 'emailEnquiryReceived',
            subject     : subject,
            mailTo      : emailReq.userEmail,
            replyTo      : emailReq.agent.profile.email,//He just placed the application, don't reveal the email yet, agent needs to start the communication first.
            //mailTo: 'srikanth681@gmail.com',
            homepage    : Meteor.absoluteUrl(),
            firstProperty: emailReq.property,
            firstAuction: emailReq.auction,
            emailEnquiries     : emailReq.emailRequests,
            enquiryCount     : emailReq.emailRequests.length,
            isSingleEnquiry     : emailReq.emailRequests.length > 1 ? false : true,
            propertyKeys     : emailReq.propertyKeys.join('-'),
            // propertyUrl:FlowRouter.url('rent', { slug: emailReq.property.slug, key: emailReq.auction.lettingAuctionCode }),
            user        : user,//Email requests only exists for users who doesn't exist in SMC. if the user exists, then a bid is placed.
            agentNames        : agentNames
        };
        Meteor.call('sendNotificationEmail', mailData,true);
        listOfReqsToArchive = listOfReqsToArchive.concat(listOfReqsToArchiveTmp)//At the end because everything should be successful, i.e without going into cache block for it to be archived.
      }catch(e){
        console.log('In catch of emailEnquiryReceived email processor')
        console.log(e);
      }
  }
    if(listOfReqsToArchive.length){
      Collections.EmailRequests.update({_id : {$in:listOfReqsToArchive} },{$set: {isArchived:true,status:"completed"} }, {multi:true});
    }
    console.log('total requests completed: '+listOfReqsToArchive.length)
    if(listOfInvalidReqsToArchive.length){
      Collections.EmailRequests.update({_id : {$in:listOfInvalidReqsToArchive} },{$set: {isArchived:true,status:"invalid"} }, {multi:true});
      console.log('total invalid requests archived: '+listOfInvalidReqsToArchive.length)
    }

  },
  dailyPropAlerts : function(){
    /*
    Assumptions and requirements
    - There should be only one email send for 1 user - by this method - with a max cut of of 20 props per email
    - One email can contain props belonging to multiple agents - there is no agent specific grouping - to reduce the number of testing scenarios and the logic simple.
    - There is County wise grouping to make it simple to navigate and scroll
    */
    let maxPropertiesPerEmail = 20, today = new Date(), yesterday = new Date();
    today.setHours(11,59,59,999);
    yesterday.setDate(today.getDate() - 1);
    yesterday.setHours(12,0,0,0);
    // , "createdAt": { $lte: today, $gte: yesterday }
    let list = Collections.Auctions.find({isArchived:false },{
      transform: function(data){
        data.property = Collections.Properties.findOne({_id:data.propertyId});
        data.property.address.address = cleanText(data.property.address.address)
        data.property.address.area = cleanText(data.property.address.area)
        data.property.address.county = cleanText(data.property.address.county)
        data.property.bedsCount = data.property.bedrooms.length;
        data.rentFormated = numDifferentiation(data.property.rentMonthly);
        // data.user = Meteor.users.findOne({_id:data.userId});//this userId is same as the createdByAgent

        if(data.property)
            data.agent = Meteor.users.findOne({_id:data.property.createdByAgent});
        else console.log('no property found for: '+data.propertyId)
        return data;
      },
      sort:{createdAt:-1},
      limit:maxPropertiesPerEmail
    }).fetch();
    console.log('total requests found: '+list.length)
    // if(!list.length) return true;

    let i=0, j, k, req = {}, uniqueCounties = [],tmp = {}, tmp2=[], propertyData = [], propTitle, propBedNBath//, tmpPropData = {}
    
    // {
    //   userFirstName:"Adam",
    //   counties : [
    //             {
    //               countyName: 'Dublin',
    //               propLines: [
    //                 {
    //                   props : [
    //                     {propTitle : "",propType:"House",propBedNBath:"3 Beds, 2 Baths",propRent:"1,750" },
    //                     {propAddress},
    //                     {propAddress},
    //                   ]
    //                 }
    //               ]
    //             }
    //           ]
    // }
    // propertyData.userFirstName = '';
    // propertyData.numOfProps=list.length;
    // propertyData.counties = [];

    /// Create a list of all unique counties
    for(j=0;j<list.length;j++){
      tmp = list[j].property.address.county;
      if(uniqueCounties.indexOf(tmp)== -1)uniqueCounties.push(tmp)//push if its not already found.
    }
    // propertyData.countiesList = uniqueCounties;
    
    /// Create a list of all props group by county
    tmp = '';
    for(k=0;k<uniqueCounties.length;k++){
      tmp = uniqueCounties[k];
      tmp2 = [];
      for(j=0;j<list.length;j++){
        propTitle = '',bedsCount=0;
        if(list[j].property.address.county != tmp)continue;

        propTitle = titleCase(list[j].property.address.address);
        if (list[j].property.address.area) propTitle +=', '+titleCase(list[j].property.address.area)
        if (list[j].property.address.county) propTitle +=', '+titleCase(list[j].property.address.county)
        console.log(propTitle);
        console.log(list[j].property.address.address);
        console.log(list[j].property.address);
        propBedNBath = []
        if(bedsCount) propBedNBath.push(bedsCount+' Beds');
        if(list[j].property.baths) propBedNBath.push(list[j].property.baths+' Baths');
        propBedNBath = propBedNBath.join(', ')

        tmp2.push( {
          propTitle: propTitle,
          propType: titleCase(list[j].property.type),
          propBedNBath: propBedNBath,
          propRent: list[j].rentFormated,
          propLink: FlowRouter.url('rent', { slug: list[j].property.slug, key: list[j].lettingAuctionCode }),
        });
      }
      propertyData.push({countyName: tmp, propLinesDesktop:chunkifyObj(tmp2,3,true), propLinesMobile:chunkifyObj(tmp2,2,true) })
      // break;//Temporary measure
    }
    console.log('Showing final array')
    console.log(propertyData);
    // return;
    // END

    /// Get list of all users who needs email and send them those


    // TODO: 
    // remove the additional anchor tag on the template for propTitle 
    // Add campaign information to all links
    // Use MailGun template instead of PropertyAlerts.html

    // let user = {name: }
    // userFirstName = user.name;
    // if(userFirstName){
    //   userFirstName = titleCase(userFirstName.split(' ')[0]);
    // }
    let countyGroupInfo = '';
    // They are grouped into Dublin, Galway, Limrick, Cork and Others.
    if(uniqueCounties.length > 4) countyGroupInfo = uniqueCounties.slice(0, 3).join(', ')+' and others';
    if(uniqueCounties.length >= 2 && uniqueCounties.length <= 4) countyGroupInfo = uniqueCounties.slice(0, -1).join(', ')+' and '+uniqueCounties.slice(-1);
    // No need for a logic if there is only 1 
    countyGroupInfo = 'They are grouped into '+countyGroupInfo+'.';
    if(uniqueCounties.length <= 1)countyGroupInfo = '';
    console.log(uniqueCounties)
    console.log('They are grouped into '+countyGroupInfo+'.')

    var mailData     = {
      template    : 'propertyalerts',
      subject     : 'Daily Property Alerts',
      mailTo: 'srikanth681@gmail.com',
      data:{
        countyGroupInfo     : countyGroupInfo,
        propertyData     : propertyData
      },
      "X-Mailgun-Variables" :{}
    };
    console.log("Final maildata");
    console.log(mailData);
    // return;
    Meteor.call('sendNotificationEmailWithTemplate', mailData);
    


    // console.log('total requests completed: '+listOfReqsToArchive.length)

  },
    reminderUploadReferences : function(){
      /*
      Assumptions and requirements
      - There can be only emailRequest / user / property
      - There can be multiple emailRequests / user but diff properties
      - There should be only one email send for 1 user - by this method - with a max cut of of 4 props per email
      - One email can contain props belonging to multiple agents - there is no agent specific grouping - to reduce the number of testing scenarios and the logic simple.
      */
      let today = new Date();
          today.setHours(0,0,0,0);
      let list = Collections.EmailRequests.find({isArchived:false, requestType: "reminderUploadReferences", "createdAt": { $lte: today } },{
        transform: function(data){
          data.property = Collections.Properties.findOne({_id:data.propertyId});
          data.property.address.address = cleanText(data.property.address.address)
          data.property.address.area = cleanText(data.property.address.area)
          data.property.address.county = cleanText(data.property.address.county)
          data.auction = Collections.Auctions.findOne({_id:data.property.auctionId});
          // data.auction.rentFormated = numDifferentiation(data.auction.price);
          data.user = Meteor.users.findOne({_id:data.userId});

          if(data.property)
              data.agent = Meteor.users.findOne({_id:data.property.createdByAgent});
          else console.log('no property found for: '+data.propertyId)
          return data;
        },
        sort:{createdAt:-1}
      }).fetch();
      if(list.length==0)return;
      console.log('total requests found: '+list.length)
      if(!list.length) return true;
      let userEmailList = [], maxPropertiesPerEmail = 50, i, j, k, a, req = {}, listOfReqsToArchive = [], listOfReqsToArchiveTmp = [], user={}, emailReq = {}, tmp = {}, userFirstName='', agentName ='', address='', subject = '', missingReferences = [], globalConfig = Collections.Config.findOne();
      for(i=0;i<list.length;i++){
        req = list[i];
        listOfReqsToArchiveTmp = []
        try{

          if(listOfReqsToArchive.indexOf(req._id)!=-1){// already processed
            //duplicate request ; this user already has a fully composed object in emailReqList;
            continue;
          }
          //Now compose a new object that has a list of all emailRequests by this user for all properties
          emailReq.user = req.user;
          emailReq.property = req.property;
          // emailReq.auction = req.auction;
          emailReq.agent = req.agent;
          ///////Easiest way - but too many DB queries
          // emailReq.emailRequests = Collections.EmailRequests.find({isArchived:false, status:"new",requestType: "reminderUploadReferences", userEmail: req.userEmail},{sort:{createdAt:-1}}).fetch();
          ///////Efficient way
          emailReq.emailRequests = []

          k=0;//This represents the number of sub child props per email.
          for(j=0;j<list.length;j++){
            tmp = list[j];
            if(k >= maxPropertiesPerEmail) break;
            if(tmp.user.email == emailReq.user.email){//of same user, so add it to the list
              emailReq.emailRequests.push(tmp);
              k++;// increment this only of child is added via - emailReq.emailRequests.push

              listOfReqsToArchiveTmp.push(tmp._id);
            }else{continue;}
          }
          // emailReqList.push(emailReq);
          /// END OF loop; now emailReqList is a processed version of "list" ; it has a list of users and sub list of all their emailRequests of type reminderUploadReferences
          if(!emailReq.emailRequests.length) {// it should be at least 1
            console.log('No sub requests found. completely ignore this user request');//Code should never come here, its only kept as precaution
            continue;
          }
          ///////////////////////////MAIL CODE -
          address = titleCase(emailReq.property.address.address);
          if (emailReq.property.address.area) address +=', '+titleCase(emailReq.property.address.area)
          if (emailReq.property.address.county) address +=', '+titleCase(emailReq.property.address.county)
          subject = 'Your enquiry for '+address;

          userFirstName = emailReq.user.name;
          if(userFirstName){
            userFirstName = titleCase(userFirstName.split(' ')[0]);
          }

          missingReferences = [];
          if(emailReq.user)
            if(emailReq.user.profile)
                if(emailReq.user.profile.references) {
                    // if (!user.profile.references.hasResume) refListArr.push("Resume");//Why do you need it?
                    if (!emailReq.user.profile.references.hasLandlordRef) missingReferences.push("Landlord reference");
                    if (!emailReq.user.profile.references.employerName) missingReferences.push("Employer name");
                    if (!emailReq.user.profile.references.hasWorkRef) missingReferences.push("Work reference");
                    if (!emailReq.user.profile.references.hasFinancialRef) missingReferences.push("Financial reference");
                    if (!emailReq.user.profile.references.hasGovtID) missingReferences.push("Government ID");
                    if (!emailReq.user.profile.references.hasPassport) missingReferences.push("Passport");
                    if (!emailReq.user.profile.references.hasPPS) missingReferences.push("PPS");
                    try{
                        if(emailReq.user.profile.references.hasResume && emailReq.user.profile.references.hasLandlordRef && emailReq.user.profile.references.hasGovtID && emailReq.user.profile.references.hasWorkRef )hasAllReqReferences = true;
                    }catch(e){console.log(e)}
                }

          var mailData     = {
              template    : 'reminderUploadReferences',
              subject     : subject,
              mailTo      : emailReq.user.email,
              replyTo      : emailReq.agent.profile.email,//He just placed the application, don't reveal the email yet, agent needs to start the communication first.
              //mailTo: 'srikanth681@gmail.com',
              homepage    : Meteor.absoluteUrl(),
              firstPropAddress     : address,
              missingReferences     : missingReferences,
              bidCount     : emailReq.emailRequests.length,
              isSingleEnquiry     : emailReq.emailRequests.length > 1 ? false : true,
              propertyUrl:FlowRouter.url('rent', { slug: emailReq.property.slug, key: emailReq.auction.lettingAuctionCode }),
              user        : emailReq.user,//Email requests only exists for users who doesn't exist in SMC. if the user exists, then a bid is placed.

          };
          Meteor.call('sendNotificationEmail', mailData,true);
          listOfReqsToArchive = listOfReqsToArchive.concat(listOfReqsToArchiveTmp)//At the end because everything should be successful, i.e without going into cache block for it to be archived.
        }catch(e){
          console.log('In catch of reminderUploadReferences email processor')
          console.log(e);
        }
      }
      Collections.EmailRequests.update({_id : {$in:listOfReqsToArchive} },{$set: {isArchived:true,status:"completed"} }, {multi:true});
      console.log('total requests completed: '+listOfReqsToArchive.length)

    },
}
export default emailProcessors;

importBlogs = function(){
    let url = 'http://blog.spotmycrib.com/wp-json/wp/v2/posts?status=publish&orderby=modified&per_page=10';
    // let url = 'https://public-api.wordpress.com/rest/v1.1/sites/spotmycribblog.wordpress.com/posts/?status=publish&orderby=modified&per_page=10';
    // https://developer.wordpress.com/docs/api/1.1/get/sites/%24site/posts/
    try{result = Meteor.http.get(url);}catch(c){
        console.log('Failed to fetch blogs. In cache.'); return;
    }
    let blog = {}, isUpdating = false, insertedListLinks = [], updatedListLink = []
    let newBlog = {}, newBlogRelated = {}
    let fromDB = {}  , date1 =0 , date2 = 0, insertNewCount = 0, updateCount=0, tmp='';
    if(result.statusCode !=200){console.log('Failed to fetch blogs. Status code: '+result.statusCode); return;}
    result = JSON.parse(result.content);
    for(let i=0;i<result.length;i++){
        blog = result[i];
        fromDB = {}
        fromDB = Collections.Blogs.findOne({wpId:blog.id});
        if(fromDB){//Blog exists in DB.
            if(fromDB.isArchived) continue;//Skip this blog.
            if(fromDB.modified == blog.modified) continue;//Skip this blog.
            // else there is a mismatch ; overwrite the DB with imported blog.
            updateCount++;
            console.log('Updating blog: '+blog.title.rendered)
            isUpdating = true;
        }else{//Blog doesn'' exist ; insert new
            insertNewCount++;
            console.log('Inserting blog: '+blog.title.rendered)
        }

        //////////// LOGIC TO GATHER REQUIRED FIELDS START
        let imgHTML = '', srcImg = '', content = cleanText(blog.content.rendered);

        try {
            tmp = content.split('src="')
            if (tmp.length > 1) {
                console.log('Image found');
                srcImage = tmp[1].split('?resize=')[0];
                imgHTML = '<img class="img-responsive" src="' + srcImage + '"/><p>';
                tmp = content.split('/>')[1];
                if(tmp)content = imgHTML + tmp;
            }
        }catch(e){
            console.log('Failed to extract image');
            content = cleanText(blog.content.rendered);//Reset
        }

        newBlog['wpId'] = blog.id;
        newBlog['created'] = blog.date;
        newBlog['modified'] = blog.modified;
        newBlog['slug'] = blog.slug;
        newBlog['link'] = blog.link;
        newBlog['title'] = cleanText(blog.title.rendered);
        newBlog['metaTitle'] = stripHTML(decodeHTMLEntities(newBlog['title']));
        newBlog['content'] = content;
        newBlog['excerpt'] = cleanText(blog.excerpt.rendered);

        let metaDesc = decodeHTMLEntities(newBlog['excerpt']);
        metaDesc = stripHTML(metaDesc);
        metaDesc = metaDesc.replace('Read More','');

        newBlog['metaDesc'] = metaDesc;
        newBlog['sticky'] = blog.sticky;
        newBlog['categories'] = blog.categories;
        newBlog['image'] = blog.jetpack_featured_media_url;
        newBlog['related'] = []
        newBlog['isArchived'] = false

        for(let j=0;j<blog['jetpack-related-posts'].length;j++){
            newBlogRelated = {}
            newBlogRelated['wpId'] = blog['jetpack-related-posts'][j].id;
            newBlogRelated['link'] = blog['jetpack-related-posts'][j].url;
            // tmp = blog['jetpack-related-posts'][j].url.split('/');
            newBlogRelated['slug'] = blog['jetpack-related-posts'][j].url.split('/')[3];
            newBlogRelated['title'] = blog['jetpack-related-posts'][j].title;
            newBlogRelated['date'] = blog['jetpack-related-posts'][j].date;
            newBlogRelated['excerpt'] = cleanText(blog['jetpack-related-posts'][j].excerpt);
            newBlogRelated['context'] = blog['jetpack-related-posts'][j].context;
            newBlogRelated['image'] = blog['jetpack-related-posts'][j].img;
            newBlog.related.push(newBlogRelated)
        }
        //////////// LOGIC TO GATHER REQUIRED FIELDS END
        if(isUpdating){
            Collections.Blogs.update({_id:fromDB._id},newBlog);
            updatedListLink.push('<a href="http://spotmycrib.ie/blog/'+newBlog.slug+'/" >'+newBlog.title+'</a>')
        }else{
            Collections.Blogs.insert(newBlog);
            insertedListLinks.push('<a href="http://spotmycrib.ie/blog/'+newBlog.slug+'/" >'+newBlog.title+'</a>')
        }


    }

    if(updateCount>0 || insertNewCount>0){
        var sub = 'Blogs Imported'
        var desc = `
Inserted Count: `+insertNewCount+`<br/>
Updated Count: `+updateCount+`<br/>
Inserted List: `+insertedListLinks.join('<br/>')+`<br/>
Updated List: `+updatedListLink.join('<br/>')+`<br/>
`
        Meteor.call('notifyAdmin', sub, desc);
    }else{
        console.log('No blogs inserted or updated. ');
    }

}



deactivateProps = function(){

  let date2daysbefore = new Date(new Date().setDate(new Date().getDate()-2));
  let props = Collections.Properties.find(
      {
        'importData.url':{$gt:''},
        'auctionId':{$gt:''},//Only get props that have an active auction. 
        'importData.lastCheckedDate':{$lt:date2daysbefore}  
      }, // Query for Studio 3T { 'importData.lastCheckedDate':{$lt: ISODate("2019-04-07T11:49:11.546+0000") }, 'importData.url':{$gt:''}, 'auctionId':{$gt:''} }
      {fields:{importData:1,auctionId:1} }   
    ).fetch();
    let url = '',updateCount=0,propsToDeactivate = [],propsCheckedIds = [];
    
    console.log('deactivateProps len: '+props.length)
    // console.log(props.length);
    for(let i=0;i<props.length;i++){
      url = props[i].importData.url;
      // url = 'https://www.spotmycrib.com/';
      //console.log('Working on: '+url)
      // Meteor.http.FollowRedirects = false; // useless as its not working
      // Meteor.http.followAllRedirects = false; // useless as its not working
      const request = require('request');

      try{result = Meteor.http.get(url);}catch(c){
        console.log('Failed to get prop url: '); continue;
      }
      propsCheckedIds.push(props[i]._id) //if the url check on the above line worked then do this
      //if(result.statusCode !=200 ){
      if(result.content.indexOf('- Daft.ie</title>')!=-1){//Only search page has a title ending with "- Daft.ie</title>"
        console.log('prop to deactivate: '+url); 
        propsToDeactivate.push(props[i]._id)
        //Meteor.call('deactivateAuction',props[i].auctionId)
        updateCount++;
      }
    }
    if(propsToDeactivate.length) Meteor.call('deactivateAuctionMulti',propsToDeactivate)
    if(propsCheckedIds.length) Collections.Properties.update({_id:{$in:propsCheckedIds}},{$set:{'importData.lastCheckedDate':new Date()}},{multi:true})
    
    if(updateCount==0){
        console.log('No props deactivated. ');
    }

}
/*
// date1 = New Date(fromDB.modified)
            // date2 = New Date(blog.modified)
            // if(date1 > date2){
            //     blog is updated
            // }else
{
    "id": 275,
    "date": "2018-02-06T02:25:37",
    "date_gmt": "2018-02-06T02:25:37",
    "guid": {
      "rendered": "http://blog.spotmycrib.com/?p=275"
    },
    "modified": "2018-11-24T13:16:30",
    "modified_gmt": "2018-11-24T13:16:30",
    "slug": "irish-renting-will-higher-result-tech-establishments-docklands",
    "status": "publish",
    "type": "post",
    "link": "http://blog.spotmycrib.com/irish-renting-will-higher-result-tech-establishments-docklands/",
    "title": {
      "rendered": "Irish renting will be higher as a result of tech establishments in Docklands"
    },
    "content": {
      "rendered": "<p><img data-attachment-id=\"276\" data-permalink=\"http://blog.spotmycrib.com/irish-renting-will-higher-result-tech-establishments-docklands/irish-renting/\" data-orig-file=\"https://i0.wp.com/blog.spotmycrib.com/wp-content/uploads/2018/02/irish-renting.jpeg?fit=622%2C350\" data-orig-size=\"622,350\" data-comments-opened=\"1\" data-image-meta=\"{&quot;aperture&quot;:&quot;0&quot;,&quot;credit&quot;:&quot;&quot;,&quot;camera&quot;:&quot;&quot;,&quot;caption&quot;:&quot;&quot;,&quot;created_timestamp&quot;:&quot;0&quot;,&quot;copyright&quot;:&quot;&quot;,&quot;focal_length&quot;:&quot;0&quot;,&quot;iso&quot;:&quot;0&quot;,&quot;shutter_speed&quot;:&quot;0&quot;,&quot;title&quot;:&quot;&quot;,&quot;orientation&quot;:&quot;0&quot;}\" data-image-title=\"irish renting\" data-image-description=\"&lt;p&gt;irish renting&lt;/p&gt;\n\" data-medium-file=\"https://i0.wp.com/blog.spotmycrib.com/wp-content/uploads/2018/02/irish-renting.jpeg?fit=300%2C169\" data-large-file=\"https://i0.wp.com/blog.spotmycrib.com/wp-content/uploads/2018/02/irish-renting.jpeg?fit=622%2C350\" class=\"aligncenter size-full wp-image-276\" src=\"https://i0.wp.com/blog.spotmycrib.com/wp-content/uploads/2018/02/irish-renting.jpeg?resize=622%2C350\" alt=\"irish renting\" width=\"622\" height=\"350\" srcset=\"https://i0.wp.com/blog.spotmycrib.com/wp-content/uploads/2018/02/irish-renting.jpeg?w=622 622w, https://i0.wp.com/blog.spotmycrib.com/wp-content/uploads/2018/02/irish-renting.jpeg?resize=300%2C169 300w\" sizes=\"(max-width: 622px) 100vw, 622px\" data-recalc-dims=\"1\" /></p>\n<p>Dockland is one of the vibrant places for enterprises in the city of Dublin. The place is known to be the home to most of tech workers who pay around €2,226 per month for a two bed room property. As compared to Irish renting, the rent in Silicon Docks is higher for its establishments. Where the average rent is €1,473 in Dublin, the average capped rent in this place is €1,988. Basically tech workers buy <a href=\"http://www.spotmycrib.com\">properties</a> in this place and the landlords are Irish. They prefer to buy two bed room apartments and for rent tech workers prefer to share this two bedroom property. Due to rising demand for the rental property, rent increased by 10.8 per cent in 2017. The dwellers in the Dock area are mostly Europeans. Where around 63 per cent are Europeans, 22 per cent are non-Europeans.</p>\n<p>The rental sector and buying of houses in this area are mostly acquired by European and British nationals working with a number of international companies engaged in technical sector.  The estate agents report that 92 per cent of tenants are non- Irish tech workers. The Irish renting witnesses an increase due to the dwelling of non-Irish tech population. The engagement of tech professionals in <a href=\"http://www.spotmycrib.com\">large companies</a> such as Google, facebook, LinkedIn and Twitter is one of the reasons for rising the Irish renting. The tech professionals prefer living nearer to their office and they offer higher price for eliminating traveling.</p>\n<p>The data from the Docklands Residential Report for the year 2018 says that the Irish renting has been decreasing and non-Irish tenants are increasing. Within three years, the population of Irish tenants has been diminished from 35 per cent to 15 per cent. This is another reason why the Irish renting is soaring in this area. Most of the tech workers are German, French, Spanish and Scandinavians. These people who have been working in the tech companies for more than five years have bought houses in this area. They prefer to buy two bed room houses in this area. So, the price of the two bed apartments has also increased from €355,000 to €400,000 in a year.</p>\n<p>In Dublin 2, the price has increased by 12 per cent in 2017 where in Dublin 4, the price of properties has increased by 7 per cent. Dublin 4 is also mostly referred by the tech workers. More price hike is expected towards the end of 2018 due to the buying of houses in these areas. Again, Irish landlords are getting more interested to buy property in these areas due to higher return on investment. They will be getting higher rent in Dublin 2 and Dublin 4 regions. For getting a higher Irish renting, the landlords are purchasing houses in these regions.</p>\n<p>One of the increasing Irish renting is the establishment of enterprises and coming of large companies. One cannot avoid establishing the larger establishments so the Irish renting. As far as the tech world will be active in the docklands, the Irish renting will be higher. Visit <a href=\"http://www.spotmycrib.com\">www.spotmycrib.com</a> and know more about Irish renting.</p>\n<p>&nbsp;</p>\n",
      "protected": false
    },
    "excerpt": {
      "rendered": "<p>Dockland is one of the vibrant places for enterprises in the city of Dublin. The place is known to be the home to most of tech workers who pay around €2,226 per month for a two bed room property. As compared to Irish renting, the rent in Silicon Docks is higher for its establishments. Where… <span class=\"read-more\"><a href=\"http://blog.spotmycrib.com/irish-renting-will-higher-result-tech-establishments-docklands/\">Read More &raquo;</a></span></p>\n",
      "protected": false
    },
    "author": 2,
    "featured_media": 276,
    "comment_status": "open",
    "ping_status": "open",
    "sticky": false,
    "template": "",
    "format": "standard",
    "meta": [],
    "categories": [
      1
    ],
    "tags": [],
    "jetpack_featured_media_url": "https://i0.wp.com/blog.spotmycrib.com/wp-content/uploads/2018/02/irish-renting.jpeg?fit=622%2C350",
    "jetpack-related-posts": [
      {
        "id": 243,
        "url": "http://blog.spotmycrib.com/price-property-rent-dublin-increase-25-percent-2018/",
        "url_meta": {
          "origin": 275,
          "position": 0
        },
        "title": "The price of property to rent in Dublin is going to increase by 25 percent by the end of 2018",
        "date": "January 26, 2018",
        "format": false,
        "excerpt": "According to The Irish Times, the rent is going to increase further in the year 2018.  While the government is planning to bring down the price of property to rent in Dublin, the assessment shows a different figure. The economic factors which are not under the control of government are…",
        "rel": "nofollow",
        "context": "In \"General\"",
        "img": {
          "src": "https://i2.wp.com/blog.spotmycrib.com/wp-content/uploads/2018/01/prioperty-to-rent-in-dublin.jpeg?fit=466%2C350&resize=350%2C200",
          "width": 350,
          "height": 200
        },
        "classes": []
      },
      {
        "id": 285,
        "url": "http://blog.spotmycrib.com/rental-cap-able-control-housing-market-crisis/",
        "url_meta": {
          "origin": 275,
          "position": 1
        },
        "title": "Is Rental Cap Able to Control the Housing Market Crisis?",
        "date": "February 19, 2018",
        "format": false,
        "excerpt": "Rental cap introduced by the Irish government is becoming an issue for the rental sector. The government issued the rental cap for capturing the price hike. The increasing rent of the properties in Dublin and cork region forced the government to set rental caps. The landlords were barred from increasing…",
        "rel": "nofollow",
        "context": "In \"General\"",
        "img": {
          "src": "https://i2.wp.com/blog.spotmycrib.com/wp-content/uploads/2018/02/rental-capp-in-rent-pressure-zone.jpeg?fit=523%2C350&resize=350%2C200",
          "width": 350,
          "height": 200
        },
        "classes": []
      },
      {
        "id": 174,
        "url": "http://blog.spotmycrib.com/building-more-houses-rent-dublin-affecting-rent/",
        "url_meta": {
          "origin": 275,
          "position": 2
        },
        "title": "Is Building More Houses for rent in Dublin is affecting rent?",
        "date": "January 2, 2018",
        "format": false,
        "excerpt": "Most of us may think that building more houses for rent in Dublin and nearby areas can mitigate the issues related to the housing crisis. It is impossible to predict that to what extent it can reduce the rental crisis. There has been a lot of discussion on this issue…",
        "rel": "nofollow",
        "context": "In \"General\"",
        "img": {
          "src": "https://i0.wp.com/blog.spotmycrib.com/wp-content/uploads/2018/01/rent-in-Dublin.jpeg?fit=525%2C350&resize=350%2C200",
          "width": 350,
          "height": 200
        },
        "classes": []
      }
    ],
    "_links": {
      "self": [
        {
          "href": "http://blog.spotmycrib.com/wp-json/wp/v2/posts/275"
        }
      ],
      "collection": [
        {
          "href": "http://blog.spotmycrib.com/wp-json/wp/v2/posts"
        }
      ],
      "about": [
        {
          "href": "http://blog.spotmycrib.com/wp-json/wp/v2/types/post"
        }
      ],
      "author": [
        {
          "embeddable": true,
          "href": "http://blog.spotmycrib.com/wp-json/wp/v2/users/2"
        }
      ],
      "replies": [
        {
          "embeddable": true,
          "href": "http://blog.spotmycrib.com/wp-json/wp/v2/comments?post=275"
        }
      ],
      "version-history": [
        {
          "count": 2,
          "href": "http://blog.spotmycrib.com/wp-json/wp/v2/posts/275/revisions"
        }
      ],
      "predecessor-version": [
        {
          "id": 308,
          "href": "http://blog.spotmycrib.com/wp-json/wp/v2/posts/275/revisions/308"
        }
      ],
      "wp:featuredmedia": [
        {
          "embeddable": true,
          "href": "http://blog.spotmycrib.com/wp-json/wp/v2/media/276"
        }
      ],
      "wp:attachment": [
        {
          "href": "http://blog.spotmycrib.com/wp-json/wp/v2/media?parent=275"
        }
      ],
      "wp:term": [
        {
          "taxonomy": "category",
          "embeddable": true,
          "href": "http://blog.spotmycrib.com/wp-json/wp/v2/categories?post=275"
        },
        {
          "taxonomy": "post_tag",
          "embeddable": true,
          "href": "http://blog.spotmycrib.com/wp-json/wp/v2/tags?post=275"
        }
      ],
      "curies": [
        {
          "name": "wp",
          "href": "https://api.w.org/{rel}",
          "templated": true
        }
      ]
    }
  },






sendAuctionWonMails = function(){
  //To be executed at 12:00 am, mid night, once the day is closed.

  today = new Date();
  yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  var start = yesterday
  // start.setHours(0,0,0,0);
  start = start.setHours(0,0,0,0);
  start = new Date(start)
  var end = yesterday
  end.setHours(23,59,59,999);

  // debugger;
  // var AuctionDocuments = ReactionCore.Collections.Auctions.find({endDate:{$gte: start, $lte: end}},{
  //   transform: function(doc){
  //     if(doc.highestBid)
  //       doc.highestBidUser = Meteor.users.findOne({_id:doc.highestBid});
  //     if(doc.secondHighestBidUser)
  //       doc.secondHighestBidUser = Meteor.users.findOne({_id:doc.secondHighestBid});
  //
  //     return doc;
  //   }
  // }).fetch();

  var globalConfig = ReactionCore.Collections.Config.findOne();

  //fetch list to whom highest bid email is to be send
  var AuctionDocuments = ReactionCore.Collections.Auctions.find({
      "endDate": {$lte: end},
      $or      : [
        {"highestBid": {$ne: ""}, "isHighestBidWonEmailSent": false},
        {"secondHighestBid": {$ne: ""}, "isSecondHighestBidWonEmailSent": false}]
    },
    {
    transform: function(doc){
      if (doc.highestBid && !doc.isHighestBidWonEmailSent)
        doc.highestBidUser = Meteor.users.findOne({_id:doc.highestBid});
      if (doc.secondHighestBid && !doc.isSecondHighestBidWonEmailSent)
        doc.secondHighestBidUser = Meteor.users.findOne({_id:doc.secondHighestBid});

      return doc;
    }
  }).fetch();

  for (var i = 0; i < AuctionDocuments.length; i++) {
    var auction                   = AuctionDocuments[i]
    var endDate = new Date(auction.endDate);
    var firstHigestBidderEndDate = new Date(endDate.setDate(endDate.getDate() + 2));
    var secondHigestBidderEndDate = new Date(endDate.setDate(endDate.getDate() + 4));

    if (auction.highestBidUser && !auction.isHighestBidWonEmailSent) {
      var mailDataHighestBidUser = {
        template: 'userWonBid',
        subject: "Congratulation! You have placed the winning bid.",
        mailTo: auction.highestBidUser.emails[0].address,
        //mailTo: 'srikanth681@gmail.com',
        homepage: Meteor.absoluteUrl(),
        auction: auction,
        user:auction.highestBidUser,
        endDate: endDate.toDateString(),
        firstHigestBidderEndDate: firstHigestBidderEndDate.toDateString(),
        secondHigestBidderEndDate: secondHigestBidderEndDate.toDateString(),
        conf: globalConfig
      }
      Meteor.call('sendNotificationEmail',mailDataHighestBidUser)
      var smsText = 'Hi ' + auction.highestBidUser.profile.username + '. Congratulations! You bid is the highest. Login to ibidmyhome.com and confirm your unit!';
      Meteor.call('sendSMS',[auction.highestBidUser.profile.mobile[0], smsText]);

      //update email sent flag
      ReactionCore.Collections.Auctions.update({_id: auction._id},
        {$set: {isHighestBidWonEmailSent: true}});
    }
    if (auction.secondHighestBidUser && !auction.isSecondHighestBidWonEmailSent) {
      var mailDataSecondHighestBidUser = {
        template: 'userAnnouncedAsSecondHigest',
        subject: "Congratulations! You have placed the 2nd highest bid.",
        mailTo: auction.secondHighestBidUser.emails[0].address,
        //mailTo: 'srikanth681@gmail.com',
        homepage: Meteor.absoluteUrl(),
        auction: auction,
        user:auction.secondHighestBidUser,
        endDate: endDate.toDateString(),
        firstHigestBidderEndDate: firstHigestBidderEndDate.toDateString(),
        secondHigestBidderEndDate: secondHigestBidderEndDate.toDateString(),
        conf: globalConfig
      }
      Meteor.call('sendNotificationEmail',mailDataSecondHighestBidUser)
      var smsText = 'Hi '+auction.secondHighestBidUser.profile.username+'. You have placed the 2nd highest bid. You have a chance to buy it. Login to follow the post-auction procedure closely.';
      Meteor.call('sendSMS',[auction.secondHighestBidUser.profile.mobile[0], smsText]);

      //update email sent flag
      ReactionCore.Collections.Auctions.update({_id: auction._id},
        {$set: {isSecondHighestBidWonEmailSent: true}});
    }
  }

  return true;
}
notYetARegisteredBidder = function(){
  var today = new Date()
  var start = new Date(today.getYear() , today.getMonth() , today.getDate() , today.getHours() , today.getMinutes(), 0, 0);
  var end = new Date(today.getYear() , today.getMonth() , today.getDate() , today.getHours() , today.getMinutes(), 59, 999);

  // var data = Meteor.users.find({
  //   "profile.isRegisteredBidder":false,
  //   createdAt:{$gte: start, $lte: end}
  // }).fetch();
  var data = Meteor.users.find({
    "profile.hasSignedUpButNotPaidRegistrationAmount": true,
    "profile.isRegistrationPaymentReminderSent"      : false
  }).fetch();

  var globalConfig = ReactionCore.Collections.Config.findOne();

  for(var i=0;i<data.length;i++) {
    var user = data[i]

    var mailData = {
      template: 'notYetARegisteredBidder',
      subject : "Created account but not paid Rs 499",
      //mailTo: 'srikanth681@gmail.com',
      mailTo  : user.emails[0].address,
      homepage: Meteor.absoluteUrl(),
      user    : user,
      conf    : globalConfig
    }
    Meteor.call('sendNotificationEmail', mailData)
    ///////////////////////////MAIL CODE END  - SMS CODE START ////

    var smsText = 'Hi ' + user.profile.username + '. Now that you have signed in, select an apartment and proceed to bid by paying an auction amount of Rs.499';
    Meteor.call('sendSMS', [user.profile.mobile[0], smsText]);

    ///////////////////////////SMS END  - SMS CODE START ////

    //update email remidner flags
    Meteor.users.update({"_id": user._id}, {
      $set: {
        "profile.isRegistrationPaymentReminderSent": true
      }
    });
  }
}
notYetBidOnProperty = function(){
  // debugger;
  var auctionDocuments = ReactionCore.Collections.Auctions.find({
      propertyConfirmationNotificationNeededForBidders: {$exists: true, $ne: []},
    },
    {
      transform: function (doc) {
        doc.userDocuments = Meteor.users.find({
            _id: {$in: doc.propertyConfirmationNotificationNeededForBidders}
          }
        ).fetch();

        return doc;
      }
    }).fetch();

  var globalConfig = ReactionCore.Collections.Config.findOne();

  //loop on all auctionDocuments
  for (var i = 0; i < auctionDocuments.length; i++) {
    //loop on all users in auctionDocuments.userDocuments
    for (var j = 0; j < auctionDocuments[i].userDocuments.length; j++) {
      var user = auctionDocuments[i].userDocuments[j];

      var mailData = {
        template: 'notYetBidOnProperty',
        subject : "We have observed that you are yet to place the bid on ibidmyhome.com.",
        //mailTo: 'srikanth681@gmail.com',
        mailTo  : user.emails[0].address,
        homepage: Meteor.absoluteUrl(),
        user    : user,
        conf    : globalConfig
      }
      Meteor.call('sendNotificationEmail', mailData)
      ///////////////////////////MAIL CODE END  - SMS CODE START ////

      var smsText = 'Hi ' + user.profile.username + '. You are now a registered bidder, but have not placed your bid. Avail the apartment by outbidding current highest bid.';
      Meteor.call('sendSMS', [user.profile.mobile[0], smsText]);

      ///////////////////////////SMS END  - SMS CODE START ////

      //update email reminder flags
      ReactionCore.Collections.Auctions.update({_id: auctionDocuments[i]._id},
        {
          $pull: {
            propertyConfirmationNotificationNeededForBidders: user._id
          }
        });
    }
  }

};
processRefunds = function(){
  //To be executed at 12:00 am, mid night, once the auction winner is diclared, auction is closed 5 days ago.
  today = new Date();
  yesterday = new Date($today);
  yesterday.setDate(today.getDate() - 5);
  var start = yesterday
  start = start.setHours(0,0,0,0);
  start = new Date(start)
  var end = yesterday
  end.setHours(23,59,59,999);

  //isAuctionConfirmed: true
  var data = ReactionCore.Collections.Auctions.find({endDate:{$gte: start, $lte: end}},{}).fetch();

  for(var i=0;i<data.length;i++){
    var auction = data[i]
    var user;
    for (var i=0;i<auction.registeredBidders.length;i++){
      userId = auction.registeredBidders[i]

      if(auction.highestBid == userId && !auction.highestBidWithdrawed){continue;}
      if(auction.highestBidWithdrawed && auction.secondHighestBid){continue;}
      //if(auction.auctionConfirmedUser  == userId ){continue;}

      var payment = ReactionCore.Collections.Payments.findOne({_id:userId, auctionId:auction._id });
      Meteor.call('requestRefund',[payment._id,'Bidder registration amount refunded as unit is confirmed to another user.'])
    }


    //var mailDataHighestBidUser = {
    //  template: 'userWonBid',
    //  subject: "Congratulation! You have placed the winning bid.",
    //  mailTo: auction.highestBidUser.emails[0].address,
    //  //mailTo: 'srikanth681@gmail.com',
    //  homepage: Meteor.absoluteUrl(),
    //  data: auction,
    //  conf: globalConfig
    //}
    //var mailDataSecondHighestBidUser = {
    //  template: 'userAnnouncedAsSecondHigest',
    //  subject: "Congratulations! You have placed the 2nd highest bid.",
    //  mailTo: auction.highestBidUser.emails[0].address,
    //  //mailTo: 'srikanth681@gmail.com',
    //  homepage: Meteor.absoluteUrl(),
    //  data: auction,
    //  conf: globalConfig
    //}
    //Meteor.call('sendNotificationEmail',mailDataHighestBidUser)
    //Meteor.call('sendNotificationEmail',mailDataSecondHighestBidUser)

  }

  return true;
}

 transform: function(doc){
 doc.registeredBidUsers = []
 if(doc.registeredBidders){
 for (var i=0;i<doc.registeredBidders.length;i++){
 if(doc.highestBid == doc.registeredBidders[i] && !doc.highestBidWithdrawed){continue;}
 if(doc.highestBidWithdrawed && doc.secondHighestBid){continue;}
 //if(doc.auctionConfirmedUser  == doc.registeredBidders[i] ){continue;}
 var user = Meteor.users.findOne({_id:doc.registeredBidders[i] });
 doc.registeredBidUsers.push(user);
 }
 }
 return doc;
 }



 var user;
 for (var i=0;i<auction.registeredBidUsers.length;i++){
 user = auction.registeredBidUsers[i]
 var payment = ReactionCore.Collections.Payments.findOne({_id:user._id, auctionId:auction._id });
 Meteor.call('requestRefund',[payment._id,'Bidder registration amount refunded as unit is confirmed to another user.'])
 }

 */
function getUserProfileScore (user) {
    let score = 0;

    if(user.profile.mobile){score += 15;}
    if(!user.services)user.services={}
    if(user.services.facebook){score += 15;}
    // if(user.services.google){score += 10;}
    if(user.services.twitter){score += 10;}
    if(user.services.linkedin){score += 15;}
    if(user.profile.references.hasPassport){score += 10;}
    if(user.profile.references.employerName){score += 3;}
    if(user.profile.references.employerTakeHome){score += 2;}
    if(user.profile.references.hasWorkRef){score += 10;}
    if(user.profile.references.hasLandlordRef){score += 10;}
    if(user.profile.references.hasPPS){score += 3;}
    // if(user.profile.references.hasFinancialRef){score += 0;}
    if(user.profile.references.hasGovtID){score += 4;}
    if(user.profile.references.hasResume){score += 3;}

    if(score>100)score = 100;
    return score;
}