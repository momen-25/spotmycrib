import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { withTracker } from 'meteor/react-meteor-data';
import MainLayoutFooter from '../layout/MainLayoutFooter.jsx'
import MainLayoutHeader, {LoginFormHorizontalT}  from '../layout/MainLayoutHeader.jsx'
import {Collections} from "../../api/collections";
if(Meteor.isClient)Session.set('subscriptionsReady',false);

function titleCase(str){
    if(!str)return;
    return str.charAt(0).toUpperCase() + str.toLowerCase().substring(1);
}
// function getAreas(countySelected) {
//     var distinctEntries = _.uniq(Collections.Areas.find({County:countySelected}, {
//         sort: {Area: 1}, fields: {Area: true}
//     }).fetch().map(function(x) {
//         return x.Area;
//     }), true);
//     allareas = []
//     for(var i=0;i< distinctEntries.length;i++){
//         if(!distinctEntries[i])continue;
//         allareas.push({label: titleCase(distinctEntries[i]), value: distinctEntries[i] })
//     }
//     return allareas;
// }
searialisedAdvertiseForm = '';
function saveToLocalStorage(){
    searialisedAdvertiseForm = $('#advertiseWithUsFormCF').serializeArray();
    if (localStorage) {
        // localStorage.searialisedAdvertiseForm=searialisedAdvertiseForm// doesn' work as it saves as string, but we need to store as object
        localStorage.advertisewithusFormData={}
        localStorage.advertisewithusFormData_address = $( "input[name='address.address']" ).val();
        localStorage.advertisewithusFormData_price = $( "input[name='price']" ).val();
        localStorage.advertisewithusFormData_county = $( "select[name='address.county']" ).val();
        localStorage.advertisewithusFormData_area = $( "select[name='address.area']" ).val();
        localStorage.advertisewithusFormData_type = $( "select[name='type']" ).val();
        localStorage.advertisewithusFormData_furnished = $( "select[name='furnished']" ).val();
        localStorage.advertisewithusFormData_baths = $( "input[name='baths']" ).val();
        localStorage.advertisewithusFormData_numBedRoomCount = $( "input[name='numBedRoomCount']" ).val();
    }
}
class AdvertiseWithUs extends Component {

    constructor(props){
        super(props)
        this.components = {
            c1: AwsStep1,
            c2: AwsStep2,
            AwsStep1: AwsStep1,
            AwsStep2: AwsStep2,
            AwsStep3: AwsStep3
        }
    }

    render(){
        const self = this;
        const TagName = this.components[this.props.curStepComponent];

        return (
        <div>
            <MainLayoutHeader />
            <div id="video-div" style={{display: "none"}}>
                <iframe width="560" height="315" src="https://www.youtube.com/embed/L689NIDwFdc?autoplay=1&rel=0" frameBorder="0" allowFullScreen></iframe>
                {/* allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" */}
            </div>
            <section className="mar-top-20 mar-btm-20">
                <div className="container background-white ">
                    <div className="filter-holder mar-top-20 pad-btm-20">
                        <div className="autoFrm">
                            <TagName />
                        </div>
                    </div>
                </div>
            </section>
            <footer className="footer-default"><MainLayoutFooter /></footer>
        </div>
    )
    }
}
export default withTracker(() => {
    if(Meteor.isClient){
        var pageno = FlowRouter.getParam('pageno'); if(!pageno)pageno=1;

        var loginFlowComplete = Session.get('loginFlowComplete')
        if(pageno == 2 && loginFlowComplete){
            FlowRouter.go('advertisewithus',{pageno:3})
            Session.set('loginFlowComplete', undefined);
            if(typeof fbq !== 'undefined')fbq('track', 'Lead');
            if(typeof ga !== 'undefined')ga('send', 'event', 'AdvertiseWithUsPage', 'UserLoginCompleted', 'User login / signup')
        }
    }

    return {}
})(AdvertiseWithUs);
class AwsStep1 extends Component {
    componentDidMount(){
        setTimeout(function(){
            try{
                $.fancybox({
                    'padding': 0,
                    'href':'#video-div'
                })
            }catch(e){}
        },3000)
    }
    render(){
        const self = this;
        return (
        <div>
            <h1>Advertise your property to rent for FREE!</h1><br />
            <p>List your property to rent in SpotMyCrib. Let thousands of verified tenants apply for your letting. Choose if you are a landlord, agent or the current tenant looking for a replacement so you can move. </p><br />
            <p>Enter the details of the property below and click submit.<br /><br /><br /><br /></p>
            <AdvertiseWithUsFormT/>
        </div>
        )
    }
}
class AwsStep2 extends Component {
    constructor(props){
        super(props);
        this.backBtnHandler = this.backBtnHandler.bind(this);
    }
    backBtnHandler(){
        FlowRouter.go('advertisewithus')
    }
    render(){
        const self = this;
        return (
        <div>
            <h1>Advertise your property to rent (step 2 of 3)</h1><br />
            <a href="javascript:void(0)" className="backBtn" onClick={this.backBtnHandler}>&lt;&lt; Back to step 1</a>
            <p>Connect your advert to your account. Login now or sign up with your social account. <br /><br /><br /><br /></p>

            <LoginFormHorizontalT isLandLordMode={true}/>

        </div>
        )
    }
}
class AwsStep3 extends Component {

    constructor(props){
        super(props);
        this.state={
            propertyId:'',
            auctionId:'',
            myPropertyLink:'',
        }
        this.backBtnHandler = this.backBtnHandler.bind(this);
        this.addPropImagesHandler = this.addPropImagesHandler.bind(this);
    }
    backBtnHandler(){
        FlowRouter.go('advertisewithus')
    }
    addPropImagesHandler(){
        if(typeof ga !== 'undefined')ga('send', 'event', 'AdvertiseWithUsPage', 'addPropertyImagesBtnClick', 'AddPropertyImages button clicked.');
        Session.set('OpenImageUploader',true);
        Session.set('fromAdvertiseWithUsPage',true);
        FlowRouter.go('account/editproperty',{id:this.state.propertyId})
    }
    myPropertyLink(){
        var propertyId = this.state.propertyId; if(!propertyId)return '';
        var auctionId = this.state.auctionId; if(!auctionId)return '';
        var prop = Collections.Properties.findOne(propertyId); if(!prop)return '';
        var auction = Collections.Auctions.findOne({_id:auctionId}); if(!auction)return '';

        return FlowRouter.path('rent',{slug:prop.slug,key:auction.lettingAuctionCode})
    }
    componentDidMount(){
        if(Meteor.isClient){
            var user = Meteor.user();
            if(!user){//
                FlowRouter.go('advertisewithus',{pageno:2})
                return;
            }
            if(!searialisedAdvertiseForm){
                FlowRouter.go('advertisewithus')
                return;
            }
            this.addPropertyCallback = function (error, propertyId) {

                if(error){
                    console.log(error)
                    var tmp =  Session.get("showErrorDlg");if(!tmp)tmp=[];
                    var msg = 'An error occurred.';
                    if(error.reason)msg += ' '+error.reason+'.'
                    else if(error.message)msg += ' '+error.message+'.'
                    tmp.push(msg);
                    Session.set("showErrorDlg",tmp)
                    return;
                }
                this.setState({propertyId:propertyId})
                Meteor.subscribe('editProperty',propertyId)//Can also be used for advertisewithus
                this.addAdvertisementFormCallback = function (error, auctionId) {
                    if(error){
                        console.log(error)
                        //    validator.showErrors({
                        //         email: error.reason
                        //     });
                        var tmp =  Session.get("showErrorDlg");if(!tmp)tmp=[];
                        var msg = 'An error occurred.';
                        if(error.reason)msg += ' '+error.reason+'.'
                        else if(error.message)msg += ' '+error.message+'.'
                        tmp.push(msg);
                        Session.set("showErrorDlg",tmp)
                        return;
                    }
                    console.log('addAdvertisement created successfully')
                    console.log(auctionId);
                    var templateInstance = this;
                    this.setState({auctionId:auctionId},function () {
                        var propertyId = templateInstance.state.propertyId; if(!propertyId)return '';
                        var auctionId = templateInstance.state.auctionId; if(!auctionId)return '';
                        var prop = Collections.Properties.findOne({_id:propertyId}); if(!prop)return '';
                        var auction = Collections.Auctions.findOne({_id:auctionId}); if(!auction)return '';

                        var myPropertyLink = FlowRouter.url('rent',{slug:prop.slug,key:auction.lettingAuctionCode})
                        this.setState({myPropertyLink:myPropertyLink})
                    })
                }
                this.addAdvertisementFormCallback = this.addAdvertisementFormCallback.bind(this)
                Meteor.call('addAdvertisement',searialisedAdvertiseForm,propertyId,this.addAdvertisementFormCallback)
            }
            this.addPropertyCallback = this.addPropertyCallback.bind(this);
            Meteor.call('addProperty',searialisedAdvertiseForm,this.addPropertyCallback)
        }



    }
    //todo: this is page is not developed. So finish it.
    render(){
        const self = this;
        return (
        <div>
            <h1>Congratulations! Your property is now live.</h1><br />
            <a href="javascript:void(0)" className="backBtn" onClick={this.backBtnHandler}>&lt;&lt; Back to step 1</a>
            {/*<h2>Add property images. </h2>*/}
            <p style={{margin: '10px 0 10px 0px'}}>Choose add property images button below to add images to your advert to make it clear and attractive. Add description and choose amenities available by choosing edit option below. Choose preview below to view it, use the link from the preview window to share it with others. </p>
            <div className="signin-form cf-1">
                <div className="clearfix">
                    <div className="styled-full-width">
                        <button className="btns blue-btn addPropImages" onClick={self.addPropImagesHandler}>Add property images</button>
                        {self.state.propertyId ? (
                            <a href={FlowRouter.url('account/editproperty', {id:self.state.propertyId})} className="btns transparent-btn mar-left-10">Edit property</a>
                        ) : ""}
                        <a href={self.state.myPropertyLink} target="_blank" className="btns blue-btn mar-left-10">Preview property</a>
                    </div>
                    <div className="w-100" />
                </div>
            </div>
            <h2>Whats next?</h2>
            <p>Visit <a href={FlowRouter.url('account/myProperties')}>my properties</a> from <a href={FlowRouter.url('account/myProperties')}>here</a> or from top menu to see the list of all your properties. Visit <span className="green-text">view applications</span> from my properties to see list of all applications your property receive. .</p>
        </div>
        )
    }
}
class AdvertiseWithUsForm extends Component {
    constructor(props){
        super(props);
        this.state = {
            addPropertyFormSaving : false,
            numBedRoomCount:0,
            numBedRoomCountArr:0,
            counties:props.counties,
            areas:props.areas,
            countySelected:props.countySelected,
            propertyTypes:props.propertyTypes
        };
        this.countySelectedHandler = this.countySelectedHandler.bind(this);
        this.areaSelectedHandler = this.areaSelectedHandler.bind(this);
        this.propertyTypeHandler = this.propertyTypeHandler.bind(this);
    }
    countySelectedHandler(event){
        var countySelected = event.target.value
        this.setState({countySelected:countySelected})

        if( Meteor.isClient )Session.set('countySelected', countySelected);
        // if(countySelected) this.setState({areas:getAreas(countySelected)})

        setTimeout(function(){
            $('.areaSelected').val("")
            saveToLocalStorage();
        },250)
    }

    areaSelectedHandler(event){
        this.setState({areaSelected:event.target.value})
        setTimeout(saveToLocalStorage,250)
    }

    propertyTypeHandler(event){
        this.setState({propertyTypeSelected:event.target.value})
        setTimeout(saveToLocalStorage,250)
    }

    handleSubmit(event){
        event.preventDefault();
        this.setState({addPropertyFormSaving:true})
        var instance = this;
        setTimeout(function(){
            instance.setState({addPropertyFormSaving:false})
        },2000)
        const address = ReactDOM.findDOMNode(this.refs.address).value.trim()
        const price = ReactDOM.findDOMNode(this.refs.price).value.trim()
        const county = ReactDOM.findDOMNode(this.refs.county).value.trim()
    }

    updateNumBedRoomCount(event){
        this.setState({numBedRoomCount:event.target.value})
        var countArr = [];
        for (var i=0; i<event.target.value; i++){
            countArr.push({'index':i+1});
        }
        this.setState({numBedRoomCountArr:countArr})
    }

    componentDidMount(){
        // console.log(this.props)
        var instance = this;
        if(Meteor.isClient) {
            var validator = $('#advertiseWithUsFormCF').validate({
                submitHandler: function (event) {
                    // addPropertyFormSaving.set(true);//Not needed on this form.
                    console.log("You just submitted the 'addPropertyForm' form.");
                    saveToLocalStorage();
                    if (instance.props.user) {
                        FlowRouter.go('advertisewithus', {pageno: 3})
                    }
                    else {
                        FlowRouter.go('advertisewithus', {pageno: 2})
                    }

                }
            });
        }
        setTimeout(function(){
            try {
                jQuery("html,body").animate({scrollTop: 0}, 250);
            } catch (e) {
                document.body.scrollTop = document.documentElement.scrollTop = 0;
            }
            instance.restoreLocalStorageSettings();
        },500)
    }
    componentWillReceiveProps(nextProps) {
        if(nextProps.propertyTypes.length)//update only if it has vals.
            this.setState({propertyTypes:nextProps.propertyTypes})
        if(nextProps.areas.length)//update only if it has vals.
            this.setState({areas:nextProps.areas})

        
    }
    restoreLocalStorageSettings(){
        var county = '';
        if(localStorage) {
            if (localStorage.advertisewithusFormData_county) {
                county=localStorage.advertisewithusFormData_county;
            }else if(localStorage.advertisewithusFormData_county===undefined){//Only for first time users
                county = 'Dublin'
            }
            if (localStorage.advertisewithusFormData_type) {
                this.setState({propertyTypeSelected:localStorage.advertisewithusFormData_type})
            }
        }
        this.setState({countySelected:county})
        if( Meteor.isClient )Session.set('countySelected', county);
        // if(county)this.setState({areas:getAreas(county)})

        if(localStorage)
        if (localStorage.advertisewithusFormData_area) {
            this.setState({areaSelected:localStorage.advertisewithusFormData_area})
        }
    }

    render(){
        const self = this;
        return (
        <form className="signin-form cf-1" id="advertiseWithUsFormCF" onSubmit={this.handleSubmit.bind(this)}>
            <div className="clearfix">
                <div className="styled-input ">
                    <input type="text" name="address.address" id="address.address" required ref="address"/>
                    <label id="address.address-error" className="error" htmlFor="address.address">This field is required.</label>
                    <br />
                    <label>Name and Street *</label>
                    <span />
                </div>
                <div className="styled-input ">
                    <input type="number" name="price" required ref="price" />
                    <label id="address.address-error" className="error" htmlFor="address.address">This field is required.</label>
                    <br />
                    <label>Rent *</label>
                    <span />
                </div>
                <div className="styled-input styled-input-select">
                    <label>County</label>
                    <select autoComplete="on" name="address.county" ref="county" required className="countySelected" onChange={this.countySelectedHandler} value={this.state.countySelected}>
                        <option value={""}>(Select One)</option>
                        {this.state.counties.map(function(c,i){
                            return (
                                <option key={i} value={c.value} >{c.label}</option>
                            )
                        })}
                    </select>
                    <span />
                </div>
                <div className="styled-input styled-input-select">
                    <label>Area *</label>
                    <select autoComplete="on" name="address.area" required className="areaSelected" onChange={this.areaSelectedHandler} value={this.state.areaSelected}>
                        <option value={""}>(Select One)</option>
                        {this.state.areas.map(function(c,i){
                            return (
                                <option key={i} value={c.value} >{c.label}</option>
                            )
                        })}
                    </select>
                    <span />
                </div>
                <div className="styled-input styled-input-select">
                    <label>Property type *</label>
                    <select autoComplete="on" name="type" ref="type" required className="" onChange={this.propertyTypeHandler} value={this.state.propertyTypeSelected}>
                        <option value={""}>(Select One)</option>
                        {this.state.propertyTypes.map(function(c,i){
                            return (
                                <option key={i} value={c.value} >{c.label}</option>
                            )
                        })}
                    </select>
                    <span />
                </div>
                <div className="styled-input styled-input-select">
                    <label>Furnished? *</label>
                    <select name="furnished" required autoComplete="on" ref="furnished">
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                    </select>
                    <span />
                </div>
                <div className="styled-input underline">
                    <input type="number" name="baths" id="baths" required ref="baths"/>
                    <label>Number of bathrooms</label>
                    <span />
                </div>
                <div className="styled-input underline">
                    <input type="number" name="numBedRoomCount" id="numBedRoomCount" required ref="numBedRoomCount" onChange={this.updateNumBedRoomCount.bind(this)} value={self.state.numBedRoomCount}/>
                    <label>Number of bedrooms</label>
                    <span />
                </div>
                { self.state.numBedRoomCountArr ? (
                    <div>
                        <div className="styled-full-width">
                            <label className="sep-label">Ensuite? </label>
                            {this.state.numBedRoomCountArr.map(function (arr,k) {
                                return (
                                    <div key={k} className="styled-input-select styled-input-checkbox max-20">
                                        <div className="checkbox disabled">
                                            <label><input type="checkbox"
                                                          name={"bedrooms."+arr.index+".ensuite"}/>Bedroom {arr.index} Ensuite?</label>
                                        </div>
                                        <label>Bed Type</label>
                                        <select required="" autoComplete="" name={"bedrooms."+arr.index+".bedType"}>
                                            <option value="single">Single</option>
                                            <option value="double">Double</option>
                                            <option value="twin">Twin</option>
                                        </select>
                                        <span></span>
                                    </div>
                                )
                            })}


                        </div>
                        <div className="w-100"></div>
                    </div>
                ) : ""
                }

                <div className="styled-full-width">
                    {self.state.addPropertyFormSaving ? (
                            <button type="button" className="btns transparent-btn">Saving</button>
                        ) : (
                        <button type="submit" className="btns blue-btn addPropertyFormSaveBtn">Save</button>
                        )
                    }
                    <button type="button" className="btns transparent-btn addPropertyFormCancelBtn mar-left-10">Cancel</button>
                </div>


                <div className="w-100" />
            </div>
        </form>
    )}
}
AdvertiseWithUsFormT = withTracker(() => {
    var staticCounties = ["Carlow", "Cavan", "Clare", "Cork", "Donegal", "Dublin", "Galway", "Kerry", "Kildare", "Kilkenny", "Laois", "Leitrim", "Limerick", "Longford", "Louth", "Mayo", "Meath", "Monaghan", "Offaly", "Roscommon", "Sligo", "Tipperary", "Waterford", "Westmeath", "Wexford", "Wicklow"];
    var allareas = [];
    var allcounties = [];
    var countySelected = 'Dublin';

    if( Meteor.isClient )if(Session.get('countySelected'))countySelected = Session.get('countySelected')

    for(var i=0;i< staticCounties.length;i++){
        if(!staticCounties[i])continue;
        allcounties.push({label: staticCounties[i], value: staticCounties[i] })
    }
    var distinctEntries = _.uniq(Collections.Areas.find({}, {//County:countySelected ; Dynamically load areas based on the subscription.
        sort: {Area: 1}, fields: {Area: true}
    }).fetch().map(function(x) {
        return x.Area;
    }), true);
    allareas = []
    for(var i=0;i< distinctEntries.length;i++){
        if(!distinctEntries[i])continue;
        allareas.push({label: titleCase(distinctEntries[i]), value: distinctEntries[i] })
    }

    var Config = Collections.Config.find().fetch();Config = Config[0];
    var propertyTypes = []
    if(Config)
        for(var i=0;i< Config.propertyType.length;i++){
            propertyTypes.push({label: titleCase(Config.propertyType[i].name), value: Config.propertyType[i].value})
        }

    const AreasSub = Meteor.subscribe('Areas','','',countySelected,'','',function(){
        if( ConfigSub.ready()  )Session.set('subscriptionsReady',true);
    });
    const ConfigSub = Meteor.subscribe('Config',function(){
        if(AreasSub.ready() )Session.set('subscriptionsReady',true);
    });
    if(Meteor.isClient)Session.get('subscriptionsReady');
    // Meteor.subscribe('Areas');
    // Meteor.subscribe('Config');
    Meteor.subscribe('userData')
    return {
        user: Meteor.user(),
        counties: allcounties,
        countySelected: countySelected,
        areas: allareas,
        propertyTypes: propertyTypes,
    }
})(AdvertiseWithUsForm);
