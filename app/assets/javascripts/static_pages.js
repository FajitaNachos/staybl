$(document).ready(function(){

  var input = document.getElementById("place");

  var options = {
    types: ["(cities)"]
  };

  var autocomplete = new google.maps.places.Autocomplete(input, options);

  google.maps.event.addListener(autocomplete, "place_changed", function() {
    $('#home-search').submit();
  });

});


