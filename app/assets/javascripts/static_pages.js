$(document).ready(function(){
 //only loads this js if we are on the home page
 var params = false;
 var city = document.getElementById('city');
 if (city) {

    // Set options for the autocomplete
    var options = {
      types: ["(cities)"]
    };
    var pac_input = document.getElementById('city');

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
        
        var autocomplete = new google.maps.places.Autocomplete(city, options);

    //Submit the form when a user selects an option from the autocomplete list
    google.maps.event.addListener(autocomplete, "place_changed", function() {
      var city = autocomplete.getPlace();
      console.log(city);
      if(city){
        var data = parseCityData(city);
        params = true;
        $("#home-search").attr("action", "/areas/" + data.state + "/"+ data.name+"/");
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
      var city = $('#city').val();
      var map = $('#map');
      var autocompleteService = new google.maps.places.AutocompleteService();
      
      autocompleteService.getPlacePredictions({
        input: city,
        length: city.length,
        types: ["(cities)"]
      }, function(data){
        var firstResult = data[0];
        var description = firstResult.description;
        var reference = firstResult.reference;
        var request = {
          reference: firstResult.reference
        };
        $('#city').val(description);
        service = new google.maps.places.PlacesService(document.getElementById('city-results'));
        service.getDetails(request, function(city){
          
          var data = parseCityData(city); 
          params = true;
          $("#home-search").attr("action", "/areas/" + data.state + "/"+ data.name+"/");
          $("#home-search").submit();
        });
        
        
      })
      return false;
    });

    function parseCityData(city){
      console.log(city);
      var components = city.address_components;
      var cityData = {};
      for (var i =0; i<components.length;i++){
        for(var j=0;j<components[i].types.length;j++){
          if (components[i].types[j] == "administrative_area_level_1"){
            cityData.state = components[i].short_name;
          }
          else if(components[i].types[j]== "locality"){
            cityData.name = components[i].long_name;
          }
        }
      }
      console.log(cityData);
      return cityData;
    }


  }
});