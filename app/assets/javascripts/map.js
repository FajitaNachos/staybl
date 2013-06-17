$(document).ready(function(){
  //Only load this javascript if user is on the map page
  if(document.getElementById('map-canvas')){

    // Set up an empty array to hold all of our markers
    var markers = [];
    var polygons = {};
    var currentPolygons = {};
    var infoWindow;


    // Used to detect initial (useless) popstate.
    // If history.state exists, assume browser isn't going to fire initial popstate.
    var popped = ('state' in window.history && window.history.state !== null), initialURL = location.href;

    $(window).bind('popstate', function (event) {
      
      // Ignore inital popstate that some browsers fire on page load
      var initialPop = !popped && location.href == initialURL
      popped = true

      if (initialPop) return;

      removeMarkers();
      var poppedAddress = getURLParam("place");
      
      addMarker(poppedAddress);
      
    });

    // initialize the Google Map
    function initialize() {

      // turns on the new google maps
      google.maps.visualRefresh = true;

      // Geocode the address tha the user
      // searched for from the home page
      var geocoder = new google.maps.Geocoder();

      // retrieve and parse the name of the place from the URL
      var address = getURLParam("place");

      var mapOptions = {
        zoom: 13,
        panControl: false,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: true,
        mapTypeControlOptions: {
          style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
        },
        zoomControl: true,
        zoomControlOptions: {
          style: google.maps.ZoomControlStyle.SMALL
        }
      };

      var polyOptions = {
          strokeWeight: 0,
          fillOpacity: 0.45,
          editable: false
      };

      map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
      
      // Add a marker and center the map on the new marker. 
      addMarker(address);
      
      var overlayDetails = document.createElement('div');
      overlayDetails.id = 'overlay-details';

      var overlayName = document.createElement('div');
      overlayName.id = 'overlay-name';


      var overlayDesc = document.createElement('div');
      overlayDesc.id = 'overlay-desc';

      overlayDetails.appendChild(overlayName);
      overlayDetails.appendChild(overlayDesc);

      infoWindow = new google.maps.InfoWindow({
          content: overlayDetails
      });

      google.maps.event.addListener(infoWindow, 'domready', function() {
        document.getElementById('overlay-name').innerHTML = ' '; 
        document.getElementById('overlay-desc').innerHTML = ' ';
      });

      var input = document.getElementById('map-search-box');

      // Fills the search box with the current address the user searched for
      document.getElementById('map-search-box').value = address;

      // Set options for the places autocomplete. 
      var autoOptions = {
        types: ['geocode'],
      };

       google.maps.event.addListener(map, 'bounds_changed', function() {
          var bounds = map.getBounds();
          var ne = bounds.getNorthEast();
          var sw = bounds.getSouthWest();
          var yMaxLat = ne.lat();
          var xMaxLng = ne.lng();
          var yMinLat = sw.lat();
          var xMinLng = sw.lng();

          var bounds = 'POLYGON(('+yMinLat+' '+xMinLng+', '+yMaxLat+ ' '+xMinLng+', '+yMaxLat+' '+xMaxLng+', '+yMinLat + ' '+xMinLng+'))';
          
          getOverlays(bounds);

      });

      var mapSearch = new google.maps.places.Autocomplete(input, autoOptions);
      
      // Bias the autocomplete results to the map window
      mapSearch.bindTo('bounds', map);

      // This is a listener for whenever a user selects an option from the autocomplete
      google.maps.event.addListener(mapSearch, 'place_changed', function() {
        removeMarkers();

        var searchParam = document.getElementById('map-search-box').value;

        // use push state to chane the URL so it can be book marked/shared
        window.history.pushState("http://www.staybl.com/", "Staybl | "+searchParam, "map?place="+searchParam);
       
        // Add a new marker and center the map on it
        addMarker(searchParam);
      });

     
  }

    

    //function to retrieve the params from the URL.
    function getURLParam(name) {
      return decodeURIComponent((new RegExp("[?|&]" + name + "=([^&;]+?)(&|##|;|$)").exec(location.search) || [null, ""])[1].replace(/\+/g, "%20")) || null;
    };


    // function to geocode an address and add a market to the map
    function addMarker(address){
      geocoder = new google.maps.Geocoder();
      if(address){
        geocoder.geocode({address: address}, function(results, status) {
          var location = results[0].geometry.location;

          var marker = new google.maps.Marker({
            position: location,
            map: map
          });

          markers.push(marker);
          map.panTo(location);
        });
      }
      else{
          geocoder.geocode({address: 'San Francisco'}, function(results, status) {
          var location = results[0].geometry.location;

          var marker = new google.maps.Marker({
            position: location,
            map: map
          });

          markers.push(marker);
          map.panTo(location);
          
          });
        }
      };

      // remove all markers in markers array
      function removeMarkers(){
        for (var i = 0; i < markers.length; i++) {
         markers[i].setMap(null);
        }
      };

       function getOverlays(bounds){

      $.getJSON("overlays/fetch.json?bounds="+bounds, function(data) {
            var currentPolygons={};
            for (var i=0;i<data.length;i++){
                currentPolygons[data[i].id] = true;
                var myPolygon = getPolygon(data[i].id);
                if(!myPolygon){
                  setPolygon(data[i]);
                }   
              
              }
              cleanPolygons(currentPolygons);
              
              
          });
    };

    function getPolygon(id){
      return polygons[id];
    };

    function setPolygon(data){
      var coordinates = data.coordinates.slice(10, -2).split(',');
                  var polygonPath = new Array();
                  for(var j=0; j<coordinates.length;j++){
                    var point = coordinates[j].trim().split(' ');
                    var gPoint = new google.maps.LatLng(parseFloat(point[0]), parseFloat(point[1]));
                    polygonPath.push(gPoint);
                  } 
                  var polygonId = data.id;
                  var polygon = new google.maps.Polygon({
                      paths: polygonPath,
                      strokeColor: data.color,
                      strokeOpacity: 0.5,
                      strokeWeight: 0,
                      fillColor: data.color,
                      fillOpacity: 0.5,
                      id:polygonId,
                      name: data.name,
                      shortDesc: data.short_desc,
                      map: map 
                    }); 

                  polygons[polygonId] = polygon;
                  google.maps.event.addListener(polygon, 'mouseover', function(e){
                    infoWindow.setPosition(e.latLng);
                    infoWindow.open(map);
                  });
                  google.maps.event.addListener(polygon, 'mouseout', function(e){
                   
                  });

    };

    function cleanPolygons(currentPolys){
      for (var i in polygons){
        var contains = currentPolys[i];
        
        if(!contains){
          polygons[i].setMap(null);
          delete polygons[i];
        }
      }
    }

    function getCurrentPolygon(id){
      return currentPolygons[id];
    }

    //initialize the map
    initialize();
    }

});

