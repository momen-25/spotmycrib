import "./pagination.html";
import './housesforrent.html'
// countySelected = '';

Template.housesforrent.onCreated(function(){
    this.countySelected = new ReactiveVar( false );
    this.areaSelected = new ReactiveVar( false );
    this.propertyTypeSelected = new ReactiveVar( false );
    // countySelected = this.countySelected;

    var data = getSlugData();
    if(data.area)this.areaSelected.set(data.area);
    if(data.county)this.countySelected.set(data.county);

})
Template.housesforrent.helpers({
    dataFull:function(){
        var pageno = Router.current().params.pageno; if(!pageno)pageno=1;
        var totalResultsCount = Counts.get("total-houses-for-rent-count");

        /////PAGINATION
        var resultsPerPage = 20;
        var currentPageNo = Router.current().params.pageno;
        if(!currentPageNo || currentPageNo<1){currentPageNo = 1}
        var urlBase = []
        // var urlBase = 'b/'+'houses-for-rent/';
        var fullUrl = Router.current().url, tmp='';
        // urlBase = urlBase.split('b/');
        // urlBase = urlBase[1];
        fullUrl = fullUrl.split('?');

        // tmp = urlBase[0].split('/');
        tmp = Router.current().params.slug
        tmp = 'b/'+tmp+'/';
        // tmp = 'b/'+tmp[0]+'/';

        urlBase.push(tmp)
        urlBase.push(fullUrl[1])
        // urlBase = tmp+urlBase[1]
        // 'b/'+Router.current().params.slug+'/'

        return {
            totalResultsCount:totalResultsCount,
            results: Collections.Auctions.find({},{sort:{createdAt:-1}}),
            pagination: getPaginationData(totalResultsCount,currentPageNo,urlBase,resultsPerPage)
        }
    },
    totalCount:function(){
        return Counts.get("total-houses-for-rent-count");
    },
    propertyTypeSelected:function(){
        var propertyTypeSelected = Template.instance().propertyTypeSelected.get();
        if(propertyTypeSelected!=false){
            if(propertyTypeSelected=='student')return 'Student Accommodation';
            if(propertyTypeSelected=='holidayhomes')return 'Holiday Homes';
            return titleCaseAllWords(propertyTypeSelected);
        }
        else{
            var data = getSlugData();
            if(data.propertyType=='student')return 'Student Accommodation';
            if(data.propertyType=='holidayhomes')return 'Holiday Homes';
            return titleCaseAllWords(data.propertyType);
        }
    },
    countySelected:function(){
        var countySelected = Template.instance().countySelected.get();
        if(countySelected!=false){
            return countySelected;
        }
        else{
            var data = getSlugData();
            return data.county;
        }
    },
    areaSelected:function(){
        var areaSelected = Template.instance().areaSelected.get();
        if(areaSelected!=false)return areaSelected;
        else{
            var data = getSlugData();
            return data.area;
        }
    },
    isEqualSelect:function (a,b) {
        if(a==b)return 'selected';
        return '';
    },
    counties:function(){
        // return [{label: "Dublin", value: "dublin"}];//Both capital
        var distinctEntries = _.uniq(Collections.Areas.find({}, {
            sort: {County: 1}, fields: {County: true}
        }).fetch().map(function(x) {
            return x.County;
        }), true);
        var ret = []
        for(var i=0;i< distinctEntries.length;i++){
            if(!distinctEntries[i])continue;
            ret.push({label: titleCase(distinctEntries[i]), value: distinctEntries[i] })
        }
        return ret;
    },
    areas:function(){
        var countySelected = Template.instance().countySelected.get();
        if(!countySelected){
            return [];
        }

        var distinctEntries = _.uniq(Collections.Areas.find({County:countySelected}, {
            sort: {Area: 1}, fields: {Area: true}
        }).fetch().map(function(x) {
            return x.Area;
        }), true);
        var ret = []
        for(var i=0;i< distinctEntries.length;i++){
            if(!distinctEntries[i])continue;
            ret.push({label: titleCase(distinctEntries[i]), value: distinctEntries[i] })
        }
        return ret;
    },
})
Template.housesforrent.events({
    "click .clearFilters":function(event, template){
        Router.go('b',{slug:'rent-in-ireland'})
    },
    "change .countyDropdown":function(event, template){
        console.log('countyDropdown clicked')
        // var val = $(event.target).attr('value');
        var val = event.target.value;
        console.log(val);

        var countyChanged = false;
        if(val!=Template.instance().countySelected.get())countyChanged=true;//reset area if county changes

        Template.instance().countySelected.set(val);
        if(countyChanged)Template.instance().areaSelected.set("");

        var data = getSlugData();
        data.county = val;
        if(countyChanged)data.area='';//Reset area

        var slug = generateSlug(data);
        Router.go('b',{slug:slug[0]},{query: slug[1]})
    },
    "change .areaDropdown":function(event, template){
        console.log('areaDropdown clicked')
        // var val = $(event.target).attr('value');
        var val = event.target.value;
        console.log(val);

        Template.instance().areaSelected.set(val);
        var data = getSlugData();
        data.area = val;
        var slug = generateSlug(data);
        Router.go('b',{slug:slug[0]},{query: slug[1]})
    }
})
// Template.housesforrent.onRendered(function(){
//
// })

Template.housesforrentGrid.helpers({
    projectDetails:function () {
        var pro = Collections.Properties.find({_id:this.propertyId}).fetch()
        return pro[0];
    },
    projectBanner:function () {
        var pro = Collections.Properties.find({_id:this.propertyId}).fetch()
        try{ if(pro[0].gallery[0].url)return pro[0].gallery[0].url;}catch(e){}
        return false;
    }
})
Template.housesforrentGrid.events({
    // 'img resize':function(event,template){
    //     debugger;
    //     var wid = parseInt(event.target.width);
    //     event.target.height = wid*0.7;
    // }
})
fixImageSize = function(){
    var avgW=0;
    $('.image-holder img').each(function(){

        if(!avgW)avgW = $(this).width();
        else {
            avgW += $(this).width();
            avgW =  avgW / 2;
        }
    })
    $('.image-holder img').width('100%');
    $('.image-holder img').height(avgW*0.7);
}
Template.housesforrent.onRendered(function(){
    // $(this).find('img').attr('height' , $(this).find('img').attr('weight')*0.7 )
    try{
        jQuery("html,body").animate({scrollTop: 0}, 250);
    }catch(e){
        document.body.scrollTop = document.documentElement.scrollTop = 0;
    }
    setTimeout(fixImageSize,250)
    setTimeout(fixImageSize,500)
    setTimeout(fixImageSize,1000)
    setTimeout(saveToLocalStorage,250)
})
$(window).resize(fixImageSize);
// Template.housesforrentGrid.events({})

function getPaginationData(totalResultsCount,currentPageNo,urlBase, resultsPerPage){
  var pages = [], prevPage = {}, nextPage={};
  var pgMin = currentPageNo-4, pgMax = currentPageNo+ 5, maxPages = Math.ceil(totalResultsCount/resultsPerPage);
  if(pgMin<1)pgMin =1;
  if(pgMax<1)pgMax =1;
  if(maxPages<1)maxPages =1;
  if(pgMin>maxPages)currentPageNo =maxPages;
  var urlRoute = '', urlQuery = ''
    if(Array.isArray(urlBase)){
        urlRoute = urlBase[0];
        urlQuery = urlBase[1];
        if(!urlQuery)urlQuery = '';
    }else{
        urlRoute = urlBase;
    }

    var tmp={};
    for (var i=pgMin; i<=maxPages;i++){
        var href = urlRoute+i+"/?"+urlQuery;
        tmp = {
            "href": href,
            "text": i
        }
        if(i== currentPageNo) {
            tmp['href'] = 'javascript:void(0);';
            tmp['current'] = true;
        }
        pages.push(tmp)
    }
  //   for (var i=pgMin; i<=maxPages;i++){
  //   var href = urlRoute+i+"/?"+urlQuery;
  //   if(i== currentPageNo) href = 'javascript:void(0);';
  //   pages.push({
  //     "href": href,
  //     "text": i
  //   })
  // }
  var prevPageNo = currentPageNo- 1, nextPageNo=currentPageNo+ 1;
    if(prevPageNo<1){
        prevPage['href'] = 'javascript:void(0)';
        prevPage['text'] = 'Previous';
        prevPage['disabled'] = 'disabled';
    }else{
        prevPage['href'] = urlRoute+prevPageNo+"/?"+urlQuery;
        prevPage['text'] = 'Previous';
    }
    if(nextPageNo>maxPages)nextPageNo =maxPages;
    if(nextPageNo == currentPageNo){
        nextPage['href'] = 'javascript:void(0)';
        nextPage['text'] = 'Next';
        nextPage['disabled'] = 'disabled';
    }else{
        nextPage['href'] = urlRoute+nextPageNo+"/?"+urlQuery;
        nextPage['text'] = 'Next';
    }
  return {
    "prevPage":prevPage,
    "pages":pages,
    "nextPage": nextPage
  }
}
function updateRoute(){
  //console.log("In updateRoute")
  Router.query.clear();

  var baseURL = Router.current().originalUrl.split('?')[0];
  var route = baseURL;
  //debugger;

  var curCity = Session.get('curCity');
  if(curCity && curCity!='All')
    route = updateQueryStringParameter(route, 'city', curCity)


  var curBuilder = Session.get('curBuilder');
  if(curBuilder && curBuilder!='All')
    route = updateQueryStringParameter(route, 'builder', curBuilder)

  //console.log("New Route"+route);
  Router.go(route);


}
function updateQueryStringParameter(uri, key, value) {
  var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
  var separator = uri.indexOf('?') !== -1 ? "&" : "?";
  if (uri.match(re)) {
    return uri.replace(re, '$1' + key + "=" + value + '$2');
  }
  else {
    return uri + separator + key + "=" + value;
  }
}
function getSlugData(){
    var propertyType = "";
    var county = "";
    var area = "";
    var maxRent = "";
    var minRent = "";
    var country = "";

    var range = [{cur:"eur",min:400,max:10000}]
    var selectedCur = range[0];

    minRent = Router.current().params.query.minRent; if(!minRent)minRent=selectedCur.min;
    maxRent = Router.current().params.query.maxRent; if(!maxRent)maxRent=selectedCur.max;
    var slug = Router.current().params.slug;
    if(!slug){
        return {
            country:country,
            county:county,
            area:area,
            maxRent:maxRent,
            propertyType:propertyType,
        };
    }
    if(slug.indexOf('-for-')!=-1){
        propertyType = slug.split('-for-')[0];
        propertyType = propertyType.split('-').join(' ');
    }
    if(slug.indexOf('-in-')!=-1) {
        var tmp = slug.split('-in-')[1].split('-')
        switch (tmp.length) {
            case 3:
                country = tmp[2];
                county = tmp[1];
                area = tmp[0];
                break;
            case 2:
                country = tmp[1];
                county = tmp[0];
                break;
            case 1:
                country = tmp[0];
                break;
        }
        if (propertyType) propertyType = propertyType.replace(/_/g, ' ')
        if (county) county = titleCaseAllWords(county.replace(/_/g, ' '))
        if (country) country = titleCaseAllWords(country.replace(/_/g, ' '))
        if (area) area = titleCaseAllWords(area.replace(/_/g, ' '))
    }

    return {
        country:country,
        county:county,
        area:area,
        maxRent:maxRent,
        propertyType:propertyType,
    }
}
function generateSlug(curURL){
    var propertyType = curURL.propertyType;
    var county = curURL.county
    var area = curURL.area
    var maxRent = curURL.maxRent
    var country = curURL.country;
    // const territory = target.territory.value;

    var slug='';
    var query='';

    if(propertyType)propertyType = propertyType.replace(/\s+/g, '_')
    if(county)county = county.replace(/\s+/g, '_')
    if(area)area = area.replace(/\s+/g, '_')
    if(country)country = country.replace(/\s+/g, '_')

    if(propertyType)slug=propertyType+"-for-"
    slug+="rent"
    // if(areaSelected||countySelected||country)
    slug+="-in-"

    if(!county)area = '';

    if(area)slug+=area
    if(area && county)slug+="-"
    if(county)slug+=county

    if(country)slug+="-"+country

    var range = [{cur:"eur",min:400,max:10000}]
    var selectedCur = range[0];
    if(maxRent && maxRent!=selectedCur.max)query = "maxRent="+maxRent;

    // apartment-for-rent-in-dundrum-dublin-ireland
    // apartment-for-rent-in-donnybroke-london-uk
    // rent/apartment/dundrum/dublin
    // rent/apartment/donnybroke/london/england/uk/
    return [
        slugify(slug),
        query
    ]
}
function titleCase(str){
    if(!str)return;
    return str.charAt(0).toUpperCase() + str.toLowerCase().substring(1);
}
function titleCaseAllWords(str){
    if(!str)return;
    return str.split(' ').map(function(str){
        return str.charAt(0).toUpperCase() + str.toLowerCase().substring(1);
    }).join(' ')
    // var words = str.split(' ')
    // for(var i=0;i<words.length;i++){
    //
    // }
    // return str.charAt(0).toUpperCase() + str.toLowerCase().substring(1);
}
function slugify (text) {
    if(!text)return '';
    const a = 'àáäâèéëêìíïîòóöôùúüûñçßÿœæŕśńṕẃǵǹḿǘẍźḧ·/,:;'
    const b = 'aaaaeeeeiiiioooouuuuncsyoarsnpwgnmuxzh------'
    const p = new RegExp(a.split('').join('|'), 'g')

    return text.toString().toLowerCase()
        .replace(/\s+/g, '')           // Replace spaces with ""
        .replace(p, c =>
            b.charAt(a.indexOf(c)))     // Replace special chars
        .replace(/&/g, '-and-')         // Replace & with ''
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single ''
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '')             // Trim - from end of text
}
function saveToLocalStorage(){
    if (localStorage) {
        // if($( ".countySelected" ).val().toString().trim()) //It needs to work even all options are reset, i.e its empty.
        localStorage.homePageMainFormData_county = $( ".countySelected" ).val();
        // if($( ".areaSelected" ).val().toString().trim())//it needs to reset to empty
        localStorage.homePageMainFormData_area = $( ".areaSelected" ).val();
        var tmp = $( "input:radio[name=propertyType]:checked" ).val();
        if(tmp)localStorage.homePageMainFormData_propertyType = tmp
        tmp = $('.maxRent').val()
        if(tmp)localStorage.homePageMainFormData_maxRent = $('.maxRent').val();
    }
}