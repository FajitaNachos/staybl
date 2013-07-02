$(document).ready(function(){
 //only loads this js if we are on the home page
  var place = document.getElementById('name');
  if (place) {

    // Set options for the autocomplete
    var options = {
      types: ["(cities)"]
    };

    var autocomplete = new google.maps.places.Autocomplete(place, options);

    //Submit the form when a user selects an option from the autocomplete list
    google.maps.event.addListener(autocomplete, "place_changed", function() {
      $('#home-search').submit();
    });
  }
});


