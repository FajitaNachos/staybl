$(document).ready(function(){

  //Only load this javascript if user is on the map page
  if(document.getElementById('map-canvas')){

    // Set up an empty array to hold all of our markers
    var markers = [];

    // initialize the Googl Map
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
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };

      map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

      var drawingManager = new google.maps.drawing.DrawingManager();
      drawingManager.setMap(map);
      
      // Add a marker and center the map on the new marker. 
      addMarker(address);
      
      var input = document.getElementById('map-search-box');

      // Fills the search box with the current address the user searched for
      $('#map-search-box').val(address);
      

      // Set options for the places autocomplete. 
      var options = {
        types: ['geocode'],
      };

      var mapSearch = new google.maps.places.Autocomplete(input, options);
      
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

      // Create the DIV to hold the control and call the HomeControl() constructor
      // passing in this DIV.
      var homeControlDiv = document.createElement('div');
      var homeControl = new HomeControl(homeControlDiv, map);

      homeControlDiv.index = 1;
      map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(homeControlDiv);
  }

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

    //function to retrieve the params from the URL.
    function getURLParam(name) {
      return decodeURIComponent((new RegExp("[?|&]" + name + "=([^&;]+?)(&|##|;|$)").exec(location.search) || [null, ""])[1].replace(/\+/g, "%20")) || null;
    };


    // function to geocode an address and add a market to the map
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


      // remove all markers in markers array
      function removeMarkers(){
        for (var i = 0; i < markers.length; i++) {
         markers[i].setMap(null);
        }
      };

      function HomeControl(controlDiv, map) {

        // Set CSS styles for the DIV containing the control
        // Setting padding to 5 px will offset the control
        // from the edge of the map.
        controlDiv.style.padding = '15px';

        // Set CSS for the control border.
        var controlUI = document.createElement('div');
        controlUI.className = 'control-ui';
        controlUI.title = 'Click to show recommended hotels';
        controlDiv.appendChild(controlUI);

        // Set CSS for the control interior.
        var controlText = document.createElement('div');
        controlText.className = 'control-text';
        controlText.innerHTML = '<strong>Show Hotels</strong>';
        controlUI.appendChild(controlText);

        // Setup the click event listeners: simply set the map to Chicago.
        google.maps.event.addDomListener(controlUI, 'click', function() {
         
        });
      }

    //initialize the map
    initialize();
    }

});


