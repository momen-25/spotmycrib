import "./collections.js";
import {check} from "meteor/check";
// import TokenGen from 'token-gen';

Meteor.methods({
    addProperty: function(data) {
        console.log("common method addProperty called")

        const userId = Meteor.userId();
        console.log(userId)

        if (!userId) {
            throw new Meteor.Error('not-authorized');
        }

        var doc = {
            "address" : {
                "address" : getA(data,'address.address'),
                "county" : getA(data,'address.county'),
                "area" : getA(data,'address.area'),
                "country" : "Ireland"
            },
            "type" : getA(data,'type'),
            "baths" : parseInt(getA(data,'baths')),
            "furnished" : getA(data,'furnished')=="true" ? true : false,
            "contacts" : [
                {
                    "name" : getA(data,'contacts.0.name'),
                    "phone" : getA(data,'contacts.0.phone'),
                    "email" : getA(data,'contacts.0.email')
                }
            ],
            "about" : getA(data,'about'),
            "amenities" : getA(data,'amenities'),
            "createdByAgent":userId,
            "isArchived":false,
            "createdAt":new Date(),
            "updatedAt":new Date()
        }
        var slug = '';
        if(doc.type)slug = doc.type
        if(doc.address.address)slug += '-'+doc.address.address
        if(doc.address.area)slug += '-'+doc.address.area
        if(doc.address.county)slug += '-'+doc.address.county

        doc.slug = slugify(slug);
        // {name: "bedrooms.0.ensuite", value: "on"}
        // 8
        // :
        // {name: "bedrooms.0.bedType", value: "single"}
        // "bedrooms" : [
        //     {
        //         "bedType" : "double",
        //         "ensuite" : true
        //     },
        //     {
        //         "bedType" : "single",
        //         "ensuite" : false
        //     }
        // ],

        var isImported = getA(data,'isImported')
        if(isImported=='true'){
            doc['isImported']=true;
            let url = getA(data,'url')
            if(url){
                doc.importData = {'url':url,'lastCheckedDate':new Date()}
            }
        }

        var numBedRoomCount = getA(data,'numBedRoomCount')
        if( numBedRoomCount ){
            var bedrooms = [];
            for(var i=0; i<numBedRoomCount; i++){
                var bne = "bedrooms."+i+".ensuite"
                var bnt = "bedrooms."+i+".bedType"
                var tmp = {}

                if(getA(data,bne)) tmp.ensuite = true;
                else tmp.ensuite = false;
                tmp.bedType = getA(data,bnt);

                bedrooms.push(tmp)
            }
            doc['bedrooms'] = bedrooms;
            doc['bedCount'] = bedrooms.length;
        }else {
            doc['bedrooms'] = [];
            doc['bedCount'] = '1';//default 1
        }

        var docId = Collections.Properties.insert(doc);
        //, {validationContext: 'create'}, function(err, res) {
    //     if (err) {
    //         throw new Meteor.Error(400, Collections.Properties.simpleSchema().namedContext('create').invalidKeys());
    //     }
    //     return res;
    // });
        Meteor.call('addManageProperty',docId);//Don't show meteor error as users can also enable this later.
        return docId;
    }
})
Array.prototype.pushUnique = function (item){
    if(this.indexOf(item) == -1) {
        //if(jQuery.inArray(item, this) == -1) {
        this.push(item);
        return true;
    }
    return false;
}
function getA(arr,find){
    if(!Array.isArray(arr))return;
    var eles = [];
    for(var i=0;i<arr.length;i++){
        if(arr[i]['name']==find)eles.push(arr[i]['value'])
    }
    if(find=='amenities')return eles;
    if(eles.lenght>1)return eles;
    if(eles.lenght==0)return false;
    return eles[0];
}
function slugify (text) {
    if(!text)return '';
    const a = 'àáäâèéëêìíïîòóöôùúüûñçßÿœæŕśńṕẃǵǹḿǘẍźḧ·/_,:;'
    const b = 'aaaaeeeeiiiioooouuuuncsyoarsnpwgnmuxzh------'
    const p = new RegExp(a.split('').join('|'), 'g')

    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(p, c =>
            b.charAt(a.indexOf(c)))     // Replace special chars
        .replace(/&/g, '-and-')         // Replace & with 'and'
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '')             // Trim - from end of text
}