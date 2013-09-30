$(document).ready(function(){
 //only loads this js if we are on the home page
 var params = false;
 var place = document.getElementById('place');
 if (place) {

    // Set options for the autocomplete
    var options = {
      types: ["(cities)"]
    };
    var pac_input = document.getElementById('place');

    (function pacSelectFirst(input) {
        // store the original event binding function
        var _addEventListener = (input.addEventListener) ? input.addEventListener : input.attachEvent;

        function addEventListenerWrapper(type, listener) {
            // Simulate a 'down arrow' keypress on hitting 'return' when no pac suggestion is selected,
            // and then trigger the original listener.
            if (type == "keydown") {
              var orig_listener = listener;
              listener = function(event) {
                var suggestion_selected = $(".pac-item.pac-selected").length > 0;
                if (event.which == 13 && !suggestion_selected) {
                  var simulated_downarrow = $.Event("keydown", {
                    keyCode: 40,
                    which: 40
                  });
                  orig_listener.apply(input, [simulated_downarrow]);
                }

                orig_listener.apply(input, [event]);
              };
            }

            _addEventListener.apply(input, [type, listener]);
          }

          input.addEventListener = addEventListenerWrapper;
          input.attachEvent = addEventListenerWrapper;

        })(pac_input);
        
        var autocomplete = new google.maps.places.Autocomplete(place, options);

    //Submit the form when a user selects an option from the autocomplete list
    google.maps.event.addListener(autocomplete, "place_changed", function() {
      var place = autocomplete.getPlace();
     
      if(place){
        var data = parsePlaceData(place);
        params = true;
        $('#state').val(data.state);
        $('#city').val(data.city)
        $("#home-search").submit();
      }
      
    });

    $('#home-search').on("submit", function(event){
     if(params == false){
      event.preventDefault();
      google.maps.event.trigger(autocomplete, 'place_changed');
    }
  });

    $('#search').on('click', function(){
      var place = $('#place').val();
      var map = $('#map');
      var autocompleteService = new google.maps.places.AutocompleteService();
      
      autocompleteService.getPlacePredictions({
        input: place,
        length: place.length,
        types: ["(cities)"]
      }, function(data){
        var firstResult = data[0];
        var description = firstResult.description;
        var reference = firstResult.reference;
        var request = {
          reference: firstResult.reference
        };
        $('#place').val(description);
        service = new google.maps.places.PlacesService(document.getElementById('city-results'));
        service.getDetails(request, function(place){
          
          var data = parsePlaceData(place); 
          params = true;
          $('#state').val(data.state);
          $('#city').val(data.city)
          $("#home-search").submit();
        });
        
        
      })
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


  }
});