var palceTypes = new Array('restaurant', 'shopping_mall', 'school', 'hospital', 'gym', 'park', 'bus_station', 'train_station', 'subway_station','airport');
var palceNames = new Array('Restaurant', 'Shopping Mall', 'Schools', 'Health Care', 'Wellness', 'Parks', 'Bus Station', 'Railway Station', 'Metro Station','Airport');
var selPlcTyps = new Array();

var lt = "13.067122";
var lng = "77.656877";
var map = "";
var marker1 = "";
var place_type = "";
var mapOptions = "";
var golbalclick = "";
var plc = "";
var icon="";

var directions = new google.maps.DirectionsRenderer({suppressMarkers: true});
var directionsService = new google.maps.DirectionsService();
var directionsDisplay = new google.maps.DirectionsRenderer();
var isTransit = false;

function mapinitialize() {
    // var styles = [
    //     {
    //         stylers: [
    //             {saturation: -100},
    //             {hue: '#EEEBEB'},
    //             {lightness: -4},
    //         ]
    //     },
    //     {
    //         featureType: "poi.business",
    //         elementType: "geometry",
    //         stylers: [
    //             {lightness: 0},
    //             {visibility: "simplified"}
    //         ]
    //     },
    //     {
    //         featureType: "poi.attraction",
    //         elementType: "labels",
    //         stylers: [
    //             {visibility: "on"}
    //         ]
    //     },
    //     {
    //         featureType: "water",
    //         stylers: [
    //             {visibility: "on"},
    //             {color: "#EEEBEB"}
    //         ]
    //     }
    // ];

    // Create a new StyledMapType object, passing it the array of styles,
    // as well as the name to be displayed on the map type control.
    // var styledMap = new google.maps.StyledMapType(styles, {name: "Styled Map"});
    var mapOptions = {
        zoom: 12,
        center: new google.maps.LatLng(13.067122, 77.656877),
        scrollwheel: false,
        // mapTypeControlOptions: {
        //     mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'map_style']
        // },
    }
    console.log(_map_dynamic);
    map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);


    // map.mapTypes.set('map_style', styledMap);
    // map.setMapTypeId('map_style');
}

function initialize() {
    mapinitialize();
    place_type="";
    plc="";
    setMarkers(map);

     var infowindow = new google.maps.InfoWindow({
      content: 'I bid my homes'
    });
      infowindow.open(map,marker1);

     google.maps.event.addListener(marker1, 'click', function() {
           infowindow.open(map,marker1);
    });
    
}

function setMarkers(map) {
    var image1 = {
        url: 'images/map-target-marker.png',
        // This marker is 20 pixels wide by 32 pixels tall.
        size: new google.maps.Size(65, 65),
        // The origin for this image is 0,0.
        origin: new google.maps.Point(0, 0),
        // The anchor for this image is the base of the flagpole at 0,32.
        anchor: new google.maps.Point(40, 90)
    };


    var shape = {
        coords: [1, 1, 1, 20, 18, 20, 18, 1],
        type: 'poly'
    };

    marker1 = new MarkerWithLabel({
        position: new google.maps.LatLng(lt, lng),
        map: map,
        draggable: false,
        raiSEOnDrag: false,
        labelContent: "Emprasa",
        labelAnchor: new google.maps.Point(30, 30),
        labelClass: "map-label", // the CSS class for the label
        labelInBackground: false,
        zIndex: 4,
        icon: image1,
        // shape: shape,
    });   
}


var infoPlcwindow = new google.maps.InfoWindow();
var plc_marker = new Array();

$('.squaredOne').click(function () {
    selPlcTyps=new Array();
    // placeBucket(place_type = $(this).attr('data-type'));
    place_type = $(this).attr('data-type');
    selPlcTyps.push(place_type);   
    console.log(selPlcTyps);
    getPlacesAround();
});


$('.transitmap').click(function () {
    initialize();
    if(isTransit){initialize();isTransit = false;}

    isTransit = true;

     /* close all info windows */
    infoPlcwindow.close();
    /* reset all routes */

    /*empty the selected types array */
    selPlcTyps = new Array();

    $('input[name="check"]:checked').each(function(){ 
      $(this).prop('checked',false);
      $(this).next().removeClass('active');
    });

    $('#from').val('');
    $(".inner").removeClass("left2");
    $(".slide1").removeClass("box-style");
    $(".navigation-hold-right").removeClass('new-pos');
    var place = $(this).data("type");

    plc = place.split(',');

    for (var i = 0; i < plc.length; i++) {
        selPlcTyps = new Array();
        place_type = plc[i];

        selPlcTyps.push(place_type);
        getPlacesAround();
    }

   

    // if (selPlcTyps.length) { 
    //      //getPlacesAround();
    // } else {
    //     setAllMap();
    // }


});


// function placeBucket(val) {
    
// }

function getPlacesAround() {
    
    setAllMap(null);
    console.log(selPlcTyps);
    
    var tatoone = new google.maps.LatLng(lt, lng);

    var request = {location: tatoone, radius: 7000, types: selPlcTyps};

    var service = new google.maps.places.PlacesService(map);

    service.nearbySearch(request, plc_calbck);
}

/* Function call back for the web service */
var marker_icon = '';

function plc_calbck(results, status) {
    console.log(selPlcTyps);
    if (status == google.maps.places.PlacesServiceStatus.OK) {
        plc_marker = new Array();
        for (var i = 0; i < results.length; i++) {
            createMarker(results[i]);
        }
    }
}

//                 /* Function to build markers */
function createMarker(place) {
    console.log(place);

    golbalclick = place.types[0];

    var _typArr = place.types;
    var _tempTyp = '', _dataTypeIndex ='';


    $(_typArr).each(function (p,ple){
        _tempTyp = $.inArray(ple, selPlcTyps);
        _dataTypeIndex = (!_dataTypeIndex && _tempTyp != -1)?_tempTyp:_dataTypeIndex;    

     
    });

    var _icon = _typArr[0];

    if(_typArr[1]=="airport"){
        _icon=place.types[1];
    } 
   
    // marker_icon = "images/map/"+_icon+".png";
    marker_icon = "images/map/map-icon-new.png";
    

    var infoIcon = "";
    // console.log(marker_icon);
    plc_marker.push(new google.maps.Marker({
        map: map,
        position: place.geometry.location,
        icon: marker_icon
    }));

    var icon = place.geometry.location;

    google.maps.event.addListener(plc_marker[(plc_marker.length) - 1], 'click', function (e) {
       
        var lt2 = e.latLng.lat();
        var lng2 = e.latLng.lng();
        var distancelatlong = getDistanceFromLatLonInKm(lt, lng, lt2, lng2);
        calculateRouteicons(lt2, lng2);
        console.log(golbalclick);
        // infoPlcwindow.setContent('<div class="my-gm"><img src="' + infoIcon + '"><h4>' + place.name + '</h4><p>' + place.vicinity + '</p></div>');
        infoPlcwindow.setContent('<div class="my-gm"><h4>' + place.name + '</h4><p>' + place.vicinity + '</p><p>Distance:' + Math.round(distancelatlong) + 'KM</p></div>');
        infoPlcwindow.open(map, this);
    });

    var bounds = new google.maps.LatLngBounds();
    for (i = 0; i < plc_marker.length; i++) {
        bounds.extend(plc_marker[i].getPosition());
    }
    bounds.extend(marker1.getPosition());
    map.fitBounds(bounds);

}

/* Function to destroy the markers */
function setAllMap() {
    for (var i = 0; i < plc_marker.length; i++) {
        plc_marker[i].setVisible(false);
    }
}

function makeMarker(position, title) {
    new google.maps.Marker({
        icon:icon,
        position: position,
        setMap: map,
        title: title
    });
}

function mapvalidate(from) {
    $('.maperror').html('');
    var txt=from;
    var from = $('#'+from).val();
    console.log(from);    

    if (from == "") {
        $('#'+txt).prop('placeholder','Please enter the place');
        $('#'+txt).focus();
        return false;
    } else {
        $('#'+txt).prop('placeholder','*From');
        $('.squaredOne label').removeClass('active');
        calculateRoute(from);
    }
    return false;
}

function calculateRoute(from) {
    mapinitialize();
    isTransit = true;
    var to = '13.067122, 77.656877';
    var directionsRequest = {
        origin: from,
        destination: to,
        travelMode: google.maps.DirectionsTravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC
    };

    directionsService.route(directionsRequest, function (response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(response);
            new google.maps.DirectionsRenderer({
                map: map,
                directions: response
            });
            var leg = response.routes[ 0 ].legs[ 0 ];
            makeMarker(leg.start_location, "Emprasa");
            makeMarker(leg.end_location, from);
        }
        else
            $(".maperror").html("Unable to retrieve your route<br />");
    });
}


// Calculating distance between two places
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1);  // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
            ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180)
}

//Deriving route between source and destination for icon places
function calculateRouteicons(lt2, lng2) {
directionsDisplay.setOptions( { suppressMarkers: true } );

    // directionsDisplay.setMap(null);
    console.log(directionsDisplay);

    var to = '13.067122, 77.656877';
    var from = lt2 + ',' + lng2;
    var directionsRequest = {
        origin: from,
        destination: to,
        travelMode: google.maps.DirectionsTravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC
    };
    directionsDisplay.setMap(null);
    directionsService.route(directionsRequest, function (response, status) {

        if (status == google.maps.DirectionsStatus.OK) {

            directionsDisplay.setMap(map);
            directionsDisplay.setDirections(response);

            var leg = response.routes[ 0 ].legs[ 0 ];
            makeMarker(leg.start_location, "Emprasa");
            makeMarker(leg.end_location, from);
        }
    });
}
google.maps.event.addDomListener(window, 'load', initialize);


// $(from).keypress(function (e) {
//     if (e.keyCode === 13) {
//         mapvalidate('from');
//     }
// });

$(from_pop).keypress(function (e) {
    if (e.keyCode === 13) {
        mapvalidate('from_pop');
    }
});

$('.reset-btn').click(function(){
  //  $('#from').val('');
    $('#from_pop').val('');
   // $('#from').prop('placeholder','*From');
    $('#from_pop').prop('placeholder','*From');
    initialize();
    $('.maperror').hide();  
});

