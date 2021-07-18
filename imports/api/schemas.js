/**
 * Created by njanjanam on 14/04/2017.
 */
import SimpleSchema from "simpl-schema";
// SimpleSchema.extendOptions(['autoform']);

const defaultValue = value => function autoValue() {
    //https://github.com/aldeed/meteor-autoform/issues/1582
    if (!this.isUpdate && !this.isUpsert && !this.isSet) {
        return value;
    }
};
function titleCase(str){
    if(!str)return;
    return str.charAt(0).toUpperCase() + str.toLowerCase().substring(1);
}

Schema = {};
Meteor.isClient && Template.registerHelper('Schema', Schema);

Schema.Auctions = new SimpleSchema({
    "isArchived":{
        type: Boolean,
        autoValue: defaultValue(false),
        autoform: {
            type:"hidden"
        }
    },
    "status":{
        type: String,
        autoValue: defaultValue('new'),//new, processing, completed, invalid, cancelled
        autoform: {
            type:"hidden"
        }
    },
    "reason":{
        type: String,
        autoValue: defaultValue(''),//cancellation reason if any
        autoform: {
            type:"hidden"
        }
    },
    "userEmail":{
        type: String,
        autoValue: defaultValue(''),//to connect to an exising user
        required:true,
        autoform: {
            type:"hidden"
        }
    },
    "requestType":{
        type: String,
        autoValue: defaultValue(''),
        autoform: {
            type:"hidden"
        }
    },
    "propertyId":{},
    "scheduledDate" : {
        type: Date,
        label: "When to trigger this",
        autoform: {
            type:"hidden"
        }
    },
    "frequency":{
        type: Number,
        autoValue: defaultValue(15),// 15, 30(30mns), 1440(24hours), 10080 (week)//in minutes
        autoform: {
            type:"hidden"
        }
    },
})

Schema.Auctions = new SimpleSchema({
    "isArchived":{
        type: Boolean,
        autoValue: defaultValue(false),
        autoform: {
            type:"hidden"
        }
    },
    "chosenBids":{
        type: Array,
        optional: true,
        autoform: {
            type:"hidden"
        }
    },
    'chosenBids.$': {
        type: Object
    },
    'chosenBids.$.bidId': {
        type: String
    },
    'chosenBids.$.chosenOn': {
        type: Date
    },
    "propertyId" : {
        type: String,
        label: "Property ID",
        autoform: {
            type:"hidden"
        }
    },
    "price" : {
        type: Number,
        label: "Price",
        // min: 0,
        // max: 100000, //100K euros is the maximum rent , what if currencies change in future
        optional:false
    },
    "auctionBidProfit" : {
        type: Number,
        label: "Profit",
        optional:true,
        autoValue: defaultValue(0),
        autoform: {
            type:"hidden"
        }
    },
    "currency" : {
        type: String,
        label: "Currency",
        autoValue: defaultValue('EUR'),
        autoform: {
            type:"hidden"
        }
    },
    "startDate" : {
        type: Date,
        label: "Activation date",
        autoValue:function(){
            if (!this.isUpdate && !this.isUpsert && !this.isSet) {//Only if insert
                return new Date();
            }
        },
        optional: true,
        autoform: {
            type:"hidden"
        }
    },
    "endDate" : {
        type: Date,
        label: "Activation expires date",
        optional: true,
        autoform: {
            type:"hidden"
        }
    },
    "readyFrom" : {
        type: Date,
        label: "Ready to move in from",
        // defaultValue:function(){return moment().add(1, 'day')},
        autoValue:defaultValue(new Date(moment().add(2, 'days').startOf('day'))),
        // min:new Date(moment().startOf('day')),//Its causing probs in edit page
        max:function(){return moment().add(6, 'months').endOf('month');},
        optional: true,
        autoform: {
            afFieldInput: {
                type: "bootstrap-datepicker",
                datePickerOptions: {
                    autoclose: true
                },
            }
        }
    },
    "lease" : {
        type: String,
        allowedValues: ['1 month', '2 months', '3 months', '4 months', '5  months', '6 months', '7 months', '8 months', '9 months', '10 months', '11 months', '1 year', 'More than a year'],
        label: "Available Till",
        // defaultValue: 'More than a year',
        autoValue: defaultValue('More than a year'),
        autoform: {
        options: ['1 month', '2 months', '3 months', '4 months', '5  months', '6 months', '7 months', '8 months', '9 months', '10 months', '11 months', '1 year', 'More than a year'].map(function(str){return {label: str.charAt(0).toUpperCase() + str.slice(1), value: str};})
        }
    },
    "rentType" : {
        type: String,
        label: "Rent Type",
        allowedValues: ['weekly', 'monthly', 'other'],
        // defaultValue: 'monthly',
        autoValue: defaultValue('monthly'),
        autoform: {
            options: [
                {label: "Weekly", value: "weekly"},
                {label: "Monthly", value: "monthly"},
                {label: "Other", value: "other"}
            ]
        }
    },
    "lettingAuctionCode" : {
        type: String,
        label: "Auction code",
        optional:true,
        autoValue: function () {
            if (this.isInsert || this.isUpsert) {
                import TokenGen from 'token-gen';
                var auctionCode = TokenGen();
                var key = auctionCode.toString();
                var auc = Collections.Auctions.findOne({"lettingAuctionCode" : key})
                while(auc){// it should be undefined, else loop
                    auctionCode = TokenGen();
                    key = auctionCode.toString();
                    auc = Collections.Auctions.findOne({"lettingAuctionCode" : key})
                }
                return key;
            }
        },
        autoform: {
            type:"hidden"
        }
    },
    "views" : {
        type: Number,
        label: "Total views",
        autoValue: defaultValue(0),
        autoform: {
            type:"hidden"
        }
    },
    "bids" : {
        type: Number,
        label: "Total Bids",
        autoValue: defaultValue(0),
        autoform: {
            type:"hidden"
        }
    },
    contacts: {
        type: Array,
        label: "Contact person for this advert",
        optional: true
    },
    'contacts.$': {
        type: Object
    },
    'contacts.$.name': {
        type: String
    },
    'contacts.$.phone': {
        type: String,
        optional: true,
        autoValue: defaultValue('')
    },
    'contacts.$.email': {
        type: String,
        optional: true,
        autoValue: defaultValue('')
    },
    createdByAgent: {
        type: String,
        optional: true,//This shouldn't be optional, but if there is an error or bug, we won' be able to identfy it
        autoform: {
            type:"hidden"
        }
    },
    createdAt: {
        type: Date,
        autoform: {
            type:"hidden"
        },
        autoValue: function() {
            if (this.isInsert) {
                return new Date();
            } else if (this.isUpsert) {
                return {$setOnInsert: new Date()};
            } else {
                this.unset();  // Prevent user from supplying their own value
            }
        }
    },
    updatedAt: {
        type: Date,
        autoform: {
            type:"hidden"
        },
        autoValue: function() {
            if (this.isUpdate || this.isInsert) {
                return new Date();
            }
        },
        // denyInsert: true,
        optional: true
    }
});

Schema.Bids = new SimpleSchema({
    "auctionCode" : {
        type: String,
        label: "Auction code",
        optional:true,
        autoform: {
            type:"hidden"
        }
    },
    "auctionId" : {
        type: String,
        label: "Auction ID",
        autoform: {
            type:"hidden"
        }
    },
    "userId": {
        type: String,
        optional: true,
        autoform: {
            type:"hidden"
        }
    },
    "yourBid" : {
        type: Number,
        label: "Price",
        // min: 0,
        // max: 100000, //100K euros is the maximum rent , what if currencies change in future
        optional:false
    },
    "bidMessage" : {
        type: String,
        label: "Message",
        autoValue: defaultValue(''),
        optional:false
    },
    "isArchived":{
        type: Boolean,
        autoValue: defaultValue(false),
        autoform: {
            type:"hidden"
        }
    },
    "chosen":{
        type: Boolean,
        autoValue: defaultValue(false),
        autoform: {
            type:"hidden"
        }
    },
    invitedDate: {
        type: Date,
        autoform: {
            type:"hidden"
        },
        optional:true
    },
    createdAt: {
        type: Date,
        autoform: {
            type:"hidden"
        },
        autoValue: function() {
            if (this.isInsert) {
                return new Date();
            } else if (this.isUpsert) {
                return {$setOnInsert: new Date()};
            } else {
                this.unset();  // Prevent user from supplying their own value
            }
        }
    },
    updatedAt: {
        type: Date,
        autoform: {
            type:"hidden"
        },
        autoValue: function() {
            if (this.isUpdate || this.isInsert) {//I want this too update for both insert and update.
                return new Date();
            }
        },
        // denyInsert: true,
        optional: true
    }
});

// Schema.lettingDetials = new SimpleSchema({});



Schema.Properties = new SimpleSchema({
    "isArchived":{
        type: Boolean,
        autoValue: defaultValue(false),
        autoform: {
            type:"hidden"
        }
    },
    "auctionHistory" : {
        type: Array,
        optional:true,
        autoform: {
            type:"hidden"
        },
        autoValue: function() {
            this.unset();  // Prevent user from supplying their own value
        }
    },
    'auctionHistory.$': {
        type: Object,
        optional:true
    },
    'auctionHistory.$.auctionId': {
        type: String,
        optional:true
    },
    'auctionHistory.$.deactivatedOn': {
        type: Date,
        optional:true
    },
    "auctionId" : {
        type: String,
        optional:true,
        label: "Auction ID",
        autoform: {
            type:"hidden"
        }
    },
    "address" : {
        type : Object,
        label: "Address of the property",
    },
    "address.address" : {
        label: "Street & Name",
        type: String
    },
    "address.county" : {
        type: String,
        label: "County",
        autoform: {
            options: function() {
                return [{label: "Dublin", value: "dublin"}];

                // var Config = Collections.Config.findOne();
                // var ret = []
                // for(var i=0;i< Config.countyInfo.length;i++){
                //     ret.push({label: titleCase(Config.countyInfo[i].county), value: Config.countyInfo[i].county})
                // }
                // return ret;

            }
        }
    },
    "address.area" : {
        type: String,
        label: "Area",
        autoform: {
            options: function() {
                var county = AutoForm.getFieldValue('county');
                var Config = Collections.Config.findOne();
                var ret = []
                for(var i=0;i< Config.countyInfo.length;i++){
                    ret.push({label: titleCase(Config.countyInfo[i].area), value: Config.countyInfo[i].area})
                }
                return ret;
                // return Debts.find({clientId: client},{sort: {name: 1}}).map(function(debt){return {label: debt.name, value: debt._id};});
                // return [{label: "Dundrum", value: "dundrum"}];
            }
            // options: function (){return[{label:"2013",value:2013},{label:"2014",value:2014},{label:"2015",value:2015}]}

        }
    },
    "address.country" : {
        type: String,
        label: "Country",
        // defaultValue: 'Ireland',
        autoValue: defaultValue('Ireland'),
        autoform: {
            type:"hidden"
        }
    },
    "address.geoCodeLat" : {
        type: String,
        optional: true,
        autoform: {
            type:"hidden"
        }
    },
    "address.geoCodeLong" : {
        type: String,
        optional: true,
        autoform: {
            type:"hidden"
        }
    },
    "type" :{
        type: String,
        label: "Property Type",
        allowedValues: ['apartment', 'house', 'flat', 'commercial', 'parkingspace'],
        autoValue: defaultValue('apartment'),
        autoform: {
            options: [
                {label: "Apartment", value: "apartment"},
                {label: "House", value: "house"},
                {label: "Flat", value: "flat"},
                {label: "Commercial", value: "commercial"},
                {label: "Parking Space", value: "parkingspace"}
            ]
        }
    },
    // "beds" : {
    //     type: Number,
    //     label: "Number of Beds",
    //     min: 0,
    //     max: 1000,
    //     optional:false
    // },
    "baths" : {
        type: Number,
        label: "Number of Baths",
        min: 0,
        max: 1000,
        optional:false
    },
    "furnished" : {
        type: Boolean,
        label: "Furnished?",
        autoform: {
            type:"boolean-select",
            options: [
                {label: "Yes", value: true},
                {label: "No", value: false}
            ]
        },
        optional:false
    },
    "bedrooms" : {
        type: Array,
        label: "Bedrooms",
        optional: true
    },
    "bedrooms.$" : {
        type: Object,
        autoform: {
            afFieldInput: {
                options: function () {
                    //return options object
                }
            }
        }
    },
    "bedrooms.$.bedType": {
        type: String,
        label: "Bed Type",
        allowedValues: ['single', 'double', 'twin'],
        autoValue: defaultValue('double'),
        autoform: {
            options: [
                {label: "Single", value: "single"},
                {label: "Double", value: "double"},
                {label: "Twin", value: "twin"}
            ]
        }
    },
    "bedrooms.$.ensuite": {
        type: Boolean,
        label: "Ensuite?",
        autoform: {
            type:"boolean-select",
            options: [
                {label: "Yes", value: true},
                {label: "No", value: false}
            ]
        }
    },
    contacts: {
        type: Array,
        label: "Contact details of the property owner if any",
        optional: true
    },
    'contacts.$': {
        type: Object,
        optional: true
    },
    'contacts.$.name': {
        type: String,
        optional: true
    },
    'contacts.$.phone': {
        type: String,
        optional: true
    },
    'contacts.$.email': {
        type: String,
        optional: true
    },
    "about" : {
        type: String,
        optional: true,
        max: 15000,
        autoform: {
            rows: 10,
            // afFieldInput: {
            //     type: 'froala'
            // }
        }
    },
    "amenities" : {
        type: Array,
        label: "Amenities",
        optional: true,
        autoform: {
            type:"select-multiple",
            allowedValues: ["Parking", "Club House", "Swimming Pool", "Mini Theater", "Gym", "Meditation Hall", "Cable Television", "Dishwasher", "Garden / Patio / Balcony", "Internet", "Serviced Property", "Washing Machine", "Central Heating", "Dryer", "House Alarm", "Microwave", "Pets Allowed", "Smoking", "Wheelchair Access"],
            options: function () { return ["Parking", "Club House", "Swimming Pool", "Mini Theater", "Gym", "Meditation Hall", "Cable Television", "Dishwasher", "Garden / Patio / Balcony", "Internet", "Serviced Property", "Washing Machine", "Central Heating", "Dryer", "House Alarm", "Microwave", "Pets Allowed", "Smoking", "Wheelchair Access"].map(function(str){return {label: str.charAt(0).toUpperCase() + str.slice(1), value: str};})},
            multiple: true
        }
    },
    "amenities.$" : {
        type: String,
        optional: true
    },
    "BER" : {
        type: Array,
        label: "BER",
        optional: true,
        autoform: {
            type:"select-multiple",
            allowedValues: ["A1", "A2", "A3", "B1", "B2", "B3", "C1", "C2", "C3", "D1", "D2", "E1", "E2", "F", "G", "SI No. 666 of 2006 (exempt)", "A1A2", "A1A3", "A1B1", "A1B2", "A1B3", "A1C1", "A1C2", "A1C3", "A1D1", "A1D2", "A1E1", "A1E2", "A1F", "A1G", "A2A3", "A2B1", "A2B2", "A2B3", "A2C1", "A2C2", "A2C3", "A2D1", "A2D2", "A2E1", "A2E2", "A2F", "A2G", "A3B1", "A3B2", "A3B3", "A3C1", "A3C2", "A3D1", "A3D2", "A3E1", "A3E2", "A3F", "A3G", "B1B2", "B1B3", "B1C1", "B1C2", "B1C3", "B1D1", "B1D2", "B1E1", "B1E2", "B1F", "B1G", "B2B3", "B2C1", "B2C2", "B2C3", "B2D1", "B2D2", "B2E1", "B2E2", "B2F", "B2G", "B3C1", "B3C2", "B3C3", "B3D1", "B3D2", "B3E1", "B3E2", "B3F", "B3G", "C1C2", "C1C3", "C1D1", "C1D2", "C1E1", "C1E2", "C1F", "C1G", "C2C3", "C2D1", "C2D2", "C2E1", "C2E2", "C2F", "C2G", "C3D1", "C3D2", "C3E1", "C3E2", "C3F", "C3G", "D1D2", "D1E1", "D1E2", "D1F", "D1G", "D2E1", "D2E2", "D2F", "D2G", "E1E2", "E1F", "E1G", "E2F", "E2G", "FG"],
            options: function () { return ["A1", "A2", "A3", "B1", "B2", "B3", "C1", "C2", "C3", "D1", "D2", "E1", "E2", "F", "G", "SI No. 666 of 2006 (exempt)", "A1A2", "A1A3", "A1B1", "A1B2", "A1B3", "A1C1", "A1C2", "A1C3", "A1D1", "A1D2", "A1E1", "A1E2", "A1F", "A1G", "A2A3", "A2B1", "A2B2", "A2B3", "A2C1", "A2C2", "A2C3", "A2D1", "A2D2", "A2E1", "A2E2", "A2F", "A2G", "A3B1", "A3B2", "A3B3", "A3C1", "A3C2", "A3D1", "A3D2", "A3E1", "A3E2", "A3F", "A3G", "B1B2", "B1B3", "B1C1", "B1C2", "B1C3", "B1D1", "B1D2", "B1E1", "B1E2", "B1F", "B1G", "B2B3", "B2C1", "B2C2", "B2C3", "B2D1", "B2D2", "B2E1", "B2E2", "B2F", "B2G", "B3C1", "B3C2", "B3C3", "B3D1", "B3D2", "B3E1", "B3E2", "B3F", "B3G", "C1C2", "C1C3", "C1D1", "C1D2", "C1E1", "C1E2", "C1F", "C1G", "C2C3", "C2D1", "C2D2", "C2E1", "C2E2", "C2F", "C2G", "C3D1", "C3D2", "C3E1", "C3E2", "C3F", "C3G", "D1D2", "D1E1", "D1E2", "D1F", "D1G", "D2E1", "D2E2", "D2F", "D2G", "E1E2", "E1F", "E1G", "E2F", "E2G", "FG"].map(function(str){return {label: str.charAt(0).toUpperCase() + str.slice(1), value: str};})},
            multiple: true
        }
    },
    "BER.$" : {
        type: String,
        optional: true
    },
    // "amenities" : {
    //     type: Array,
    //     optional: true
    // },
    // "amenities.$" : {
    //     type: String,
    //     allowedValues: ["Parking", "Club House", "Swimming Pool", "Mini Theater", "Gym", "Meditation Hall", "Cable Television", "Dishwasher", "Garden / Patio / Balcony", "Internet", "Serviced Property", "Washing Machine", "Central Heating", "Dryer", "House Alarm", "Microwave", "Pets Allowed", "Smoking", "Wheelchair Access"],
    //     label: "Amenity Name",
    // },
    "gallery" : {
        type: Array,
        label: "Choose file",
        optional: true,
        autoform: {
            type:"hidden"
        },
        // autoValue: function() {
        //     if (this.isUpdate) {
        //         this.unset();  // Prevent user from supplying their own value
        //     }
        // }
    },
    "gallery.$": {
        type: Object,
        autoform: {
            type:"hidden"
        },
        // autoValue: function() {
        //     if (this.isUpdate) {
        //         this.unset();  // Prevent user from supplying their own value
        //     }
        // }
    },
    "gallery.$.name" : {
        type: String,
        autoform: {
            type:"hidden"
        }
    },
    "gallery.$.relative_url" : {
        type: String,
        required:false,
        autoform: {
            type:"hidden"
        }
    },
    "gallery.$.url" : {
        type: String,
        autoform: {
            type:"hidden"
        }
    },
    "gallery.$.handle" : {
        type: String,
        required:false,
        autoform: {
            type:"hidden"
        }
    },
    "gallery.$.mimetype" : {
        type: String,
        required:false,
        autoform: {
            type:"hidden"
        }
    },
    "gallery.$.originalFile" : {
        type: String,
        required:false,
        autoform: {
            type:"hidden"
        }
    },
    "gallery.$.originalPath" : {
        type: String,
        required:false,
        autoform: {
            type:"hidden"
        }
    },
    "gallery.$.size" : {
        type: String,
        required:false,
        autoform: {
            type:"hidden"
        }
    },
    "gallery.$.source" : {
        type: String,
        required:false,
        autoform: {
            type:"hidden"
        }
    },
    "gallery.$.status" : {
        type: String,
        required:false,
        autoform: {
            type:"hidden"
        }
    },
    "gallery.$.uploadId" : {
        type: String,
        required:false,
        autoform: {
            type:"hidden"
        }
    },
    "createdByAgent": {
        type: String,
        optional: true,//This shouldn't be optional, but if there is an error or bug, we won' be able to identfy it
        autoform: {
            type:"hidden"
        }
    },
    createdAt: {
        type: Date,
        autoform: {
            type:"hidden"
        },
        autoValue: function() {
            if (this.isInsert) {
                return new Date();
            } else if (this.isUpsert) {
                return {$setOnInsert: new Date()};
            } else {
                this.unset();  // Prevent user from supplying their own value
            }
        }
    },
    updatedAt: {
        type: Date,
        autoform: {
            type:"hidden"
        },
        autoValue: function() {
            if (this.isUpdate || this.isInsert) {
                return new Date();
            }
        },
        // denyInsert: true,
        optional: true
    }

}, { tracker: Tracker });






export {Schema};
