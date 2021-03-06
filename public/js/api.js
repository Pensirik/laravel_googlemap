var map = null;
var markers = [];
var circles = [];
var restaurants = [];
var places = [];
var directionsDisplay;
var directionsService;
var currentIndex = 0;
var geocoder; // กำหนดตัวแปรสำหรับ เก็บ Geocoder Object ใช้แปลงชื่อสถานที่เป็นพิกัด

var inputSearch; // กำหนดตัวแปร สำหรับ อ้างอิง input สำหรับพิมพ์ค้นหา
var infowindow;// กำหนดตัวแปร สำหรับใช้แสดง popup สถานที่ ที่ค้นหาเจอ
var autocomplete; // กำหนดตัวแปร สำหรับเก็บค่า การใช้งาน places Autocomplete

var position = {
    lat: 13.8234866,
    lng: 100.5081204
};


var myCurrentLocation;

function initMap() {
    //start at bang sue ,thailand
    directionsDisplay = new google.maps.DirectionsRenderer;
    directionsService = new google.maps.DirectionsService;
    var options = {
        zoom: 14,
        center: position
    };
    map = new google.maps.Map(document.getElementById('map'), options); // สร้างแผนที่และเก็บตัวแปรไว้ในชื่อ map
    directionsDisplay.setMap(map);
    directionsDisplay.setPanel(document.getElementById('direction-panel'));

    /*-------*/
    inputSearch = $("#pac-input")[0]; // เก็บตัวแปร dom object โดยใช้ jQuery
  // เรียกใช้งาน Autocomplete โดยส่งค่าจากข้อมูล input ชื่อ inputSearch
    const autocomplete = new google.maps.places.Autocomplete(inputSearch);
    autocomplete.bindTo('bounds', map); 

    infowindow = new google.maps.InfoWindow();// เก็บ InfoWindow object ไว้ในตัวแปร infowindow
     // เมื่อแผนที่มีการเปลี่ยนสถานที่ จากการค้นหา
    new google.maps.event.addListener(autocomplete, 'place_changed', function() {
        infowindow.close();// เปิด ข้อมูลตัวปักหมุด (infowindow)
        var place = autocomplete.getPlace();// เก็บค่าสถานที่จากการใช้งาน autocomplete ไว้ในตัวแปร place
        if (!place.geometry) {// ถ้าไม่มีข้อมูลสถานที่ 
            return;
        }
        // ถ้ามีข้อมูลสถานที่  และรูปแบบการแสดง  ให้แสดงในแผนที่
        if (place.geometry.viewport) {
            map.fitBounds(place.geometry.viewport);
          
        var pos = {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng()
            };
         searchByType(pos)
        //  var marker = new google.maps.Marker({
        //     position: place.geometry.location,
        //     map: map,
        //     visible :true
        //  });

        }
       
    });

   /*-------*/
    searchByType(null)
    getPlaces();

    map.addListener('zoom_changed', function() {
 
        if(map.zoomDoNotSearch==true)
        {
            map.zoomDoNotSearch = false;
            return false;
        }

        let zoomLevel = map.getZoom();
        let center = map.getCenter();
        let lat = center.lat();
        let lng = center.lng();
        let latLng = {
            lat: lat,
            lng: lng
        };

        let radius = 2000;
        if(zoomLevel == 15) radius = 1;
        else if(zoomLevel == 16) radius = 0.8;
        else if(zoomLevel == 17) radius = 0.6;
        else if(zoomLevel == 18) radius = 0.4;
        else if(zoomLevel <= 14) radius = 2;
        else radius = 0.2;
            
        radius = (radius / 6378.1) * 6378100; //compute kilometer
        clearCircles(null);
        searchByRadius(lat,lng,radius);

    });
}
function searchByRadius(lat,lng,radius)
{
    $.getJSON(`./getbyradius/${lat}/${lng}/${radius}`, function (e) {
        loadMarker(e);
        setRestaurants(e);

        loadInfoToPanel(e);
        loadlist(e,'#searchByRadiusResult');
        loadlist(e,'#searchFoodResult');
    });
}
function getRestaurants() {

    $.getJSON("./getrestaurants/", function (e) {
    
        loadMarker(e);
        loadInfoToPanel(e);
        setRestaurants(e);
    });
}

function loadMarker(e) {
    
    clearMarkers();
    markers = [];

    $.each(e.results, function (i, result) {
        addMarker(result, false, i);
    });
}

function setRestaurants(e) {
    restaurants = [];
    $.each(e.results, function (i, result) {
        restaurants.push(result);
    });
}

function addMarker(e, isOpen = false, index = 0) {
    let marker = new google.maps.Marker({
        position: e.geometry.location,
        map: map
    });

    let address_lat = e.geometry.location.lat;
    let address_lng = e.geometry.location.lng;

    let infoWindow = new google.maps.InfoWindow({
        content: '<div class="infoWindow"><b>' + e.name + '</b><br />' +
            e.formatted_address +
            '<br /><a href="#" onclick="calculateAndDisplayRoute(' + address_lat + ',' + address_lng + ',' + index + ')">Get Direction</a>' +
            '</div>'
    });

    marker.addListener('click', function () {
        infoWindow.open(map, marker);
    })

    markers.push(marker);

    if (isOpen == true) {
        infoWindow.open(map, marker);
    }
}

function clearMarkers() {
    setMapOnAll(null);
    markers = [];
}

function setMapOnAll(map) {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
    }
}

// for menu
$(document).ready(function () {
    $('.dropdown-submenu a.test').on("click", function (e) {
        $(this).next('ul').toggle();
        e.stopPropagation();
        e.preventDefault();
    });
});

// load info to layer
function loadInfoToPanel(e) {
    loadlist(e,'#panelContent');
}

function loadlist(e,id){
    let info = "";
    let index = 0;
    $(id).html("");
    $.each(e.results, function (i, result) {
        
        let address_lat = result.geometry.location.lat;
        let address_lng = result.geometry.location.lng;

        info = info + '<div id="panelContentDetail"><a href="#" onclick="setRestaurantMarker(' + index + ')"><b>' + result.name + "</b></a><br />" + result.formatted_address +"</div>";
        index++;
    });
    $(id).html(info);
}

function setRestaurantMarker(index) {
    let result = restaurants[index];
    setMapOnAll(null);
    addMarker(result, true, index);
}

function calculateAndDisplayRoute(end_lat, end_lng, index) {
    currentIndex = index;
    showPanel("direction-panel");
    setRestaurantMarker(index);

    //Listen for click on map
    var listenerHandle = google.maps.event.addListener(map, 'click', function (event) {
        setRestaurantMarker(index);
        myCurrentLocation = event.latLng;
        let marker = new google.maps.Marker({
            position: myCurrentLocation,
            map: map
        });
        markers.push(marker);

        // show selected latLong
        let msg = `Start Location<br><br><b>Latitude:${myCurrentLocation.lat()} <br />Longitude: ${myCurrentLocation.lng()}</b>`;
        msg = msg + `<br /><br /><a href='#' onclick='calculateAndDisplayRoute(${end_lat}, ${end_lng}, ${index})'>Show direction</a>`;
        geoMessage(msg);
        return false;
    });

    if (myCurrentLocation) {
       
        //var start = { lat: 10.3457599, lng: 123.9132848};
        var start = myCurrentLocation;
        var end = {
            lat: end_lat,
            lng: end_lng
        };
        clearMarkers();
        directionsDisplay.setMap(map);
        directionsService.route({
            origin: start,
            destination: end,
            travelMode: 'DRIVING'
        }, function (response, status) {
            if (status === 'OK') {
                map.zoomDoNotSearch = true;
                directionsDisplay.setDirections(response);
                myCurrentLocation = null;
            } else {
                window.alert('Directions request failed due to ' + status);
            }
        });

        $html = "<b>" + restaurants[index].name + "</b><br />" + restaurants[index].formatted_address;
        $("#direction-restaurant").html($html);

        try {
            google.maps.event.removeListener(listenerHandle);
        } catch (e) {}
  
    } else {
        geoMessage('Please choose a start location. To select, just right click on the map.');
    }
}

function directionBack() {
    showPanel("panelContent");
    directionsDisplay.setMap(null);
    map.zoomDoNotSearch = true;
    map.setZoom(14);
    map.setCenter(position);
    setRestaurantMarker(currentIndex);
}

function showPanel(name) {
    $("#direction-panel").hide();
    $("#panelContent").hide();
    $("#byRadiusContent").hide();
    $("#specificFoodContent").hide();
    
    if (name == 'direction-panel'){
        $("#direction-panel").show();
       
    }else if (name == 'panelContent'){
        $("#panelContent").show();
    }else if (name == 'byRadiusContent'){
        $("#byRadiusContent").show();
    }else if (name == 'specificFoodContent'){
        $("#specificFoodContent").show();
    }   
}

function geoMessage(msg) {
    let html = `<div class="well" id="direction-restaurant">${msg}</div><a href="#" onclick="directionBack()">back</a>`;
    $('#direction-panel').html(html);
    showPanel("direction-panel");
}

function getPlaces() {
    $.getJSON("./getplaces", function (e) {
        $.each(e, function (i, result) {
            places.push(result);
        });
    });
}

function showRadiusPalnel() {
    showPanel('byRadiusContent');
    $('#placesRadius').empty();
    $('#radius').empty();
    $.each(places, function (i, item) {
        $('#placesRadius').append($('<option>', {
            value: item.id,
            text: item.formatted_address
        }));
    });
    for (let x = 1; x <= 5; x++) {
        let areaStr = 'Kilometers';
        if(x==1) areaStr = 'Kilometer';
        $('#radius').append($('<option>', {
            value: x,
            text: `${x} ${areaStr}`
        }));
    }
}


function searchBySpecificFood(me)
{
    let lat = position.lat;
    let lng = position.lng;

    let latLng = {
        lat: lat,
        lng: lng
    };

    map.zoomDoNotSearch = true;
    map.setZoom(14);
    map.setCenter(latLng);

    let keyword = $('#searchFood').val();
    
    clearCircles(null);
    directionsDisplay.setMap(null);

    if(keyword==null || keyword==""){
        alert('Please enter a value.');
    }else{
        me.disabled = true;
        $.getJSON(`./getbyspecific/${lat}/${lng}/?keyword=${keyword}`, function (e) {
            map.zoomDoNotSearch = true;
            if(e==null || e==''|| e.results.length==0){
                alert('No record found.');
            }else{
                loadMarker(e);
                setRestaurants(e);
                
                loadInfoToPanel(e);
                loadlist(e,'#searchByRadiusResult');
                loadlist(e,'#searchFoodResult');
            } 
            me.disabled = false;
        });
    }
}

function searchByType(pos)
{
    let latLng = {
        lat: pos == null ? position.lat:pos.lat,
        lng: pos == null ? position.lng:pos.lng
    }; 

    let typesearch ="restaurant";

    map.zoomDoNotSearch = true;
    map.setZoom(14);
    map.setCenter(latLng);
    
    clearCircles(null);
    directionsDisplay.setMap(null);

    $.getJSON(`./getbytype/${latLng.lat}/${latLng.lng}/${typesearch}`, function (e) {   
        loadMarker(e);
        setRestaurants(e);    
        showPanel('panelContent');

        loadInfoToPanel(e);
        loadlist(e,'#searchByRadiusResult');
        loadlist(e,'#searchFoodResult');
   });
}

function clearCircles(circle)
{
    // clear circle
    for (var i = 0; i < circles.length; i++) {
        circles[i].setMap(circle);
    }
    circles = [];
}

// stats
function showStats(index){

    $("#visit_date").val("");
    $("#stat_specific_food").val("");
    $("#statIndex").val(index);

    var today = new Date();
    var day=today.getDate()>9?today.getDate():"0"+today.getDate(); // format should be "DD" not "D" e.g 09
    var month=(today.getMonth()+1)>9?(today.getMonth()+1):"0"+(today.getMonth()+1);
    var year=today.getFullYear();

    $("#visit_date").attr('max', year + "-" + month + "-" + day);
    $(".ui-dialog-titlebar-close").text('x');

    let name = restaurants[index].name;
    let address = restaurants[index].formatted_address;

    let restaurantInfo = `<b>${name}</b><br><small>${address}</small>`;

    $("#statRestaurantInfo").html(restaurantInfo);

    $( "#statsWindow" ).dialog({
        width: 800,
        height:500    
    });

    $( "#statRestaurantSurvey" ).show();
    $( "#realStatInfo" ).hide();
}

function saveRealStatInfo(){
    
    let index = $("#statIndex").val();
    let vdate = $("#visit_date").val();
    let food = $("#stat_specific_food").val();
    let validatorOK = true;

    let place_id = restaurants[index].place_id;

    if(vdate==null || vdate==""){
        validatorOK = false;
    }else if(food==null || food==""){
        validatorOK = false;
    }

    if(validatorOK == false){
        alert('Please enter a value to all the fields.');
    }else{
        $("#saveStatbutton").disabled = true;

        let urlSaveFood = `./stat/savefood/${place_id}?f=${food}`;
        $.get(urlSaveFood, function (e) {
            let urlSaveVisit = `./stat/savevisit/${place_id}?v=${vdate}`;
            $.get(urlSaveVisit, function (e) {
                $("#saveStatbutton").disabled = false;
                alert('Thank you. You can add more entry as you want or you may proceed or skip the survey.');
            });
        });
    }
}

//load chart
google.charts.load('current', {'packages':['corechart']});
google.charts.setOnLoadCallback(drawChart);



function drawChart(chartDetails,month) {
    var datavis = google.visualization.arrayToDataTable(chartDetails);
    var options = {
      title: 'Visitors for the Month of ' + month,
      curveType: 'function',
      legend: { position: 'top' }
    };
    var chart = new google.visualization.LineChart(document.getElementById('curve_chart'));
    chart.draw(datavis, options);
}
