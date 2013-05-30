$(document).ready(function(){
var geocoder, initialize, address, getURLParam;;

function initialize() {
  geocoder = new google.maps.Geocoder();
  google.maps.visualRefresh = true;

  geocoder.geocode({address: address}, function(results, status) {
    var input, map, markers, myOptions, searchBox;
    if (status === google.maps.GeocoderStatus.OK) {
      myOptions = {
        zoom: 12,
        center: results[0].geometry.location,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };
      map = new google.maps.Map(document.getElementById("map-canvas"), myOptions);
       var marker = new google.maps.Marker({
            map: map,
            position: results[0].geometry.location
        });
    }
  
  
  var input = document.getElementById('map-search-box');
  var options = {
    types: ['geocode'],
  };

  var mapSearch = new google.maps.places.Autocomplete(input, options);
  mapSearch.bindTo('bounds', map);
  $(".pac-container").remove().appendTo("#map-autocomplete");
  var infowindow = new google.maps.InfoWindow();

  google.maps.event.addListener(mapSearch, 'place_changed', function() {
    var searchParam = document.getElementById('map-search-box').value;
    window.history.pushState("http://www.staybl.com/", "Staybl | "+searchParam, "/search?utf8=✓&place="+searchParam);
    infowindow.close();
    marker.setVisible(false);
    input.className = '';
    var place = mapSearch.getPlace();
    if (!place.geometry) {
      // Inform the user that the place was not found and return.
      input.className = 'notfound';
      return;
    }

    // If the place has a geometry, then present it on a map.
    if (place.geometry.viewport) {
      map.fitBounds(place.geometry.viewport);
    } else {
      map.setCenter(place.geometry.location);
      map.setZoom(17);  // Why 17? Because it looks good.
    }

    marker.setPosition(place.geometry.location);
    marker.setVisible(true);

    var address = '';
    if (place.address_components) {
      address = [
        (place.address_components[0] && place.address_components[0].short_name || ''),
        (place.address_components[1] && place.address_components[1].short_name || ''),
        (place.address_components[2] && place.address_components[2].short_name || '')
      ].join(' ');
    }

    infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + address);
    infowindow.open(map, marker);

  });
});
}

function getURLParam(name) {
  return decodeURIComponent((new RegExp("[?|&]" + name + "=([^&;]+?)(&|##|;|$)").exec(location.search) || [null, ""])[1].replace(/\+/g, "%20")) || null;
};


address = getURLParam("place");

initialize();
});

