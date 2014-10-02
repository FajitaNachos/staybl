$(document).ready(function(){

// the global var params is a hacky workaround to make sure that the google Autocomplete
// search completes before the form is submitted when a user uses the return key to
// submit the form 

var params = false;
var pac_input = document.getElementById('home-search');
 
if (pac_input) {
  // Set options for the autocomplete
  var options = {
    types: ["(cities)"]
  };
     
  var autocomplete = new google.maps.places.Autocomplete(pac, options);

  //Submit the form when a user selects an option from the autocomplete list
    google.maps.event.addListener(autocomplete, "place_changed", function() {
      var autoPlace = autocomplete.getPlace();

      if(autoPlace.address_components){
        var data = parsePlaceData(autoPlace);

        $('#state').val(data.state);
        $('#city').val(data.city)
        $("#home-search").submit();
      }

      else{
        $('#search').trigger('click');
      }
    });

     $('#home-search').on("submit", function(event){
        if(params == false){
          event.preventDefault();
          google.maps.event.trigger(autocomplete, 'place_changed');
        }
      });

    $('#search').on('click', function(){
      
      var searchTerm = $('#pac').val();

      getPlace(searchTerm);

      return false;
    });

    function parsePlaceData(place){
    
      var components = place.address_components;
      var placeData = {};
      for (var i =0; i<components.length;i++){
        for(var j=0;j<components[i].types.length;j++){
          if (components[i].types[j] == "administrative_area_level_1"){
            placeData.state = components[i].short_name;
          }
          else if(components[i].types[j]== "locality"){
            placeData.city = components[i].long_name;
          }
        }
      }
      return placeData;
    }

    function getPlace(searchVal) {
     
      var autocompleteOptions =  {
        input: searchVal,
        length: searchVal.length,
        types: ["(cities)"]
      };

      var autocompleteService = new google.maps.places.AutocompleteService();

      autocompleteService.getPlacePredictions(autocompleteOptions, handleAutocompletePrediction);
 
    }

    function handleAutocompletePrediction(data) {

        var place;
        var firstResult = data[0];
        var description = firstResult.description;
        var placeId = firstResult.place_id;

        $('#pac').val(description);

        var geocoder = new google.maps.Geocoder();
        var geocoderRequest = { address: description };

        geocoder.geocode(geocoderRequest, function(results, status){

          place = results[0];

          var data = parsePlaceData(place); 

          params = true;

          $('#state').val(data.state);
          $('#city').val(data.city)
          $("#home-search").submit();
        });

        
    }

  }
});