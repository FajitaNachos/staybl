$(document).ready(function(){
var markers = [];
function initialize() {
  google.maps.visualRefresh = true;

  var geocoder = new google.maps.Geocoder();
  var address = getURLParam("place");
  var mapOptions = {
    zoom: 13,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
  addMarker(address);
  
  var input = document.getElementById('map-search-box');
  var options = {
    types: ['geocode'],
  };

  var mapSearch = new google.maps.places.Autocomplete(input, options);
  
  mapSearch.bindTo('bounds', map);

  google.maps.event.addListener(mapSearch, 'place_changed', function() {
    removeMarkers();
    var searchParam = document.getElementById('map-search-box').value;
    window.history.pushState("http://www.staybl.com/", "Staybl | "+searchParam, "/search?utf8=✓&place="+searchParam);
   
    input.className = '';
    var place = mapSearch.getPlace();
    if (!place.geometry) {
      // Inform the user that the place was not found and return.
      input.className = 'notfound';
      return;
    }

    addMarker(searchParam);
  });
}

function getURLParam(name) {
  return decodeURIComponent((new RegExp("[?|&]" + name + "=([^&;]+?)(&|##|;|$)").exec(location.search) || [null, ""])[1].replace(/\+/g, "%20")) || null;
};

// Used to detect initial (useless) popstate.
// If history.state exists, assume browser isn't going to fire initial popstate.
var popped = ('state' in window.history && window.history.state !== null), initialURL = location.href;

$(window).bind('popstate', function (event) {
  // Ignore inital popstate that some browsers fire on page load
  var initialPop = !popped && location.href == initialURL
  popped = true
  if (initialPop) return;
  var poppedAddress = getURLParam("place");
  removeMarkers();
  addMarker(poppedAddress);
  // showMailOverview(); // exmaple function to display all email since the user has click Back.
});

function addMarker(address){
  geocoder = new google.maps.Geocoder();
  geocoder.geocode({address: address}, function(results, status) {
          var location = results[0].geometry.location;

          var marker = new google.maps.Marker({
            position: location,
            map: map
          });

          markers.push(marker);
          map.panTo(location);
    });
  };

  function removeMarkers(){
    for (var i = 0; i < markers.length; i++) {
     markers[i].setMap(null);
    }
  };

initialize();
});

