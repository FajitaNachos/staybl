$(document).ready(function(){

  //Only load this javascript if user is on the map page
  if(document.getElementById('map-canvas')){

    // Set up an empty array to hold all of our markers
    var markers = [];
    var polygons = [];
    var infoWindow;
    var saveOverlay;
    var drawingManager;
    var selectedShape;
    var colors = ['#FF3333', '#32CD32'];
    var selectedColor;
    var colorButtons = {};

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
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };

      var polyOptions = {
          strokeWeight: 0,
          fillOpacity: 0.45,
          editable: true
      };

      map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
      
      // Creates a drawing manager attached to the map that allows the user to draw
      // markers, lines, and shapes.
      drawingManager = new google.maps.drawing.DrawingManager({
        drawingMode: google.maps.drawing.OverlayType.POLYGON,
        markerOptions: {
          draggable: true
        },
        polylineOptions: {
          editable: true
        },
        rectangleOptions: polyOptions,
        circleOptions: polyOptions,
        polygonOptions: polyOptions,
        map: map
      });

      
      // Add a marker and center the map on the new marker. 
      addMarker(address);
      
      var input = document.getElementById('map-search-box');

      var overlayName = document.createElement('input');
      overlayName.id = 'overlay-name';


      var nameLabel = document.createElement('label');
      nameLabel.setAttribute('for','overlay-name');
      nameLabel.innerHTML = "Neighborhood";

      var overlayDesc = document.createElement('textarea');
      overlayDesc.id = 'overlay-desc';

      var descLabel = document.createElement('label');
      descLabel.setAttribute('for','overlay-desc');
      descLabel.innerHTML = "Neighborhood Description";

      var saveButton = document.createElement('button');
      saveButton.id = "save-button";
      saveButton.type = "button";
      saveButton.className = "btn btn-small";
      saveButton.innerHTML = "Save Overlay";

      var deleteButton = document.createElement('button');
      deleteButton.id = "delete-button";
      deleteButton.type = "button";
      deleteButton.className = "btn btn-small";
      deleteButton.innerHTML = "Remove Overlay";

      var formContent = document.createElement('form');
      formContent.id = 'edit-overlay';

      formContent.appendChild(nameLabel);
      formContent.appendChild(overlayName);
      formContent.appendChild(descLabel);
      formContent.appendChild(overlayDesc);
      formContent.appendChild(saveButton);
      formContent.appendChild(deleteButton);

      var infoWindow = new google.maps.InfoWindow({
          content: formContent
      });

      // Fills the search box with the current address the user searched for
      $('#map-search-box').val(address);
      
      // Set options for the places autocomplete. 
      var autoOptions = {
        types: ['geocode'],
      };

       google.maps.event.addListener(map, 'bounds_changed', function() {
         var bounds = map.getBounds();
         var bounds = map.getBounds();
          var ne = bounds.getNorthEast();
          var sw = bounds.getSouthWest();
          var yMaxLat = ne.lat();
          var xMaxLng = ne.lng();
          var yMinLat = sw.lat();
          var xMinLng = sw.lng();

      });

      

      var mapSearch = new google.maps.places.Autocomplete(input, autoOptions);
      
      // Bias the autocomplete results to the map window
      mapSearch.bindTo('bounds', map);

      google.maps.event.addListener(drawingManager, 'overlaycomplete', function(e) {
          if (e.type != google.maps.drawing.OverlayType.MARKER) {
          // Switch back to non-drawing mode after drawing a shape.
          drawingManager.setDrawingMode(null);

          // Add an event listener that selects the newly-drawn shape when the user
          // mouses down on it.
          var newShape = e.overlay;
          newShape.type = e.type;
          
          google.maps.event.addListener(newShape, 'click', function(e) {
            setSelection(newShape);
            infoWindow.setPosition(e.latLng);
            infoWindow.open(map);

            google.maps.event.addDomListener(document.getElementById('save-button'), 'click', function() {
                 var newPath = selectedShape.getPath();
                  var xy;
                  var coordinates = '';
                        // Iterate over the polygonBounds vertices.
                        for (var i = 0; i < newPath.length; i++) {
                            xy = newPath.getAt(i);
                            coordinates += xy.lat() + ' ' + xy.lng() + ', ';
                        }
                var final_xy = newPath.getAt(0);
                coordinates += final_xy.lat() + ' ' + final_xy.lng();
             
                var polyCoordinates = 'POLYGON((' + coordinates + '))';
                var overlayName = $("#overlay-name").val();
                var overlayShortDesc = $("#overlay-desc").val();

                

                $.ajax({
                      type: 'POST',
                      url: '/admin/overlays',
                      data: 'name='+overlayName+'&short_desc=' + overlayShortDesc +'&coordinates=' + polyCoordinates
                    }).done(function() {
                      infoWindow.close();
                      alert('Saved!');
                  });
                });

            google.maps.event.addDomListener(document.getElementById('delete-button'), 'click', function(){
              infoWindow.close();
              deleteSelectedShape();
            });

          });
          setSelection(newShape);
        }
      });

      // This is a listener for whenever a user selects an option from the autocomplete
      google.maps.event.addListener(mapSearch, 'place_changed', function() {
        removeMarkers();

        var searchParam = document.getElementById('map-search-box').value;

        // use push state to chane the URL so it can be book marked/shared
        window.history.pushState("http://www.staybl.com/", "Staybl | "+searchParam, "map?place="+searchParam);
       
        // Add a new marker and center the map on it
        addMarker(searchParam);
      });

      // Clear the current selection when the drawing mode is changed, or when the
      // map is clicked.
      google.maps.event.addListener(drawingManager, 'drawingmode_changed', clearSelection);
      google.maps.event.addListener(map, 'click', clearSelection);
      
      // Create the DIV to hold the control and call the HomeControl() constructor
      // passing in this DIV.
      var homeControlDiv = document.createElement('div');

       

      var homeControl = new HomeControl(homeControlDiv, map);

      homeControlDiv.index = 1;
      map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(homeControlDiv);
      
      
      buildColorPalette();

    }


    function clearSelection() {
      if (selectedShape) {
        selectedShape.setEditable(false);
        selectedShape = null;
      }
    }

    function setSelection(shape) {
      clearSelection();
      selectedShape = shape;
      shape.setEditable(true);
      selectColor(shape.get('fillColor') || shape.get('strokeColor'));
    }

    function deleteSelectedShape() {
      if (selectedShape) {
        selectedShape.setMap(null);
        
      }
    }

    function selectColor(color) {
      selectedColor = color;
      for (var i = 0; i < colors.length; ++i) {
        var currColor = colors[i];
        colorButtons[currColor].style.border = currColor == color ? '1px solid #777' : '1px solid #ddd';
      }

      // Retrieves the current options from the drawing manager and replaces the
      // stroke or fill color as appropriate.
      var polylineOptions = drawingManager.get('polylineOptions');
      polylineOptions.strokeColor = color;
      drawingManager.set('polylineOptions', polylineOptions);

      var rectangleOptions = drawingManager.get('rectangleOptions');
      rectangleOptions.fillColor = color;
      drawingManager.set('rectangleOptions', rectangleOptions);

      var circleOptions = drawingManager.get('circleOptions');
      circleOptions.fillColor = color;
      drawingManager.set('circleOptions', circleOptions);

      var polygonOptions = drawingManager.get('polygonOptions');
      polygonOptions.fillColor = color;
      drawingManager.set('polygonOptions', polygonOptions);
    }

    function setSelectedShapeColor(color) {
      if (selectedShape) {
        if (selectedShape.type == google.maps.drawing.OverlayType.POLYLINE) {
          selectedShape.set('strokeColor', color);
        } else {
          selectedShape.set('fillColor', color);
        }
      }
    }

    function getPath(){
      
    }

    function makeColorButton(color) {
      var button = document.createElement('span');
      button.className = 'overlay-button';
      button.style.backgroundColor = color;
      google.maps.event.addDomListener(button, 'click', function() {
        selectColor(color);
        setSelectedShapeColor(color);
      });

      return button;
    }

     function buildColorPalette() {
       var  colorPalette = document.createElement('div');
       colorPalette.id = 'color-palette';
       for (var i = 0; i < colors.length; ++i) {
         var currColor = colors[i];
         var colorButton = makeColorButton(currColor);
         colorPalette.appendChild(colorButton);
         colorButtons[currColor] = colorButton;
       }
       map.controls[google.maps.ControlPosition.TOP_LEFT].push(colorPalette);
       selectColor(colors[0]);
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

    
      $.ajax({
              type: 'GET',
              url: '/admin/overlays.json',
              data: 'minLat='+ minLat + '&minLng='+minLng+'&maxLat='+maxLat+'&maxLng='+maxLng
            }).done(function(data) {
              for (var i=0;i<data.length;i++){
                var coordinates = data[i].coordinates.slice(10, -2);
                var newCoordinates = coordinates.split(',');
                var polygonPath = new Array();
                for(var j=0; j<newCoordinates.length;j++){
                  var point = newCoordinates[j].trim().split(' ');
                  var gPoint = new google.maps.LatLng(parseFloat(point[0]), parseFloat(point[1]));
                  polygonPath.push(gPoint);
              }
              var polygon = new google.maps.Polygon({
                  paths: polygonPath,
                  strokeColor: "#FF0000",
                  strokeOpacity: 0.8,
                  strokeWeight: 2,
                  fillColor: "#FF0000",
                  fillOpacity: 0.35,
                  map: map 
                });
            
               
            }
          });
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

    
