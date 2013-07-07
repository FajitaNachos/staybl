$(document).ready(function(){
 //only loads this js if we are on the home page
  var place = document.getElementById('city');
  if (place) {

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

        var autocomplete = new google.maps.places.Autocomplete(input);

    })(pac_input);
    var autocomplete = new google.maps.places.Autocomplete(place, options);

    //Submit the form when a user selects an option from the autocomplete list
    google.maps.event.addListener(autocomplete, "place_changed", function() {
      $('#home-search').submit();
    });
    

  }
});


