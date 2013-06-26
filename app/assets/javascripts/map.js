$(document).ready(function(){
  //Only load this javascript if a user is on the map page
  if(document.getElementById('map-canvas')){

    // Set up a bunch of global variables. Yes. It's bad. I know. 
    var markers = [];
    var polygons = {};
    var infoWindow;
    var drawingManager;
    var selectedShape;
    var colors = ['#FF3333', '#32CD32'];
    var selectedColor;
    var colorButtons = {};
    var mapBounds;
    var searched = true;
    var address;
    var map;
    var editable = false;

       // Used to detect initial (useless) popstate.
    // If history.state exists, assume browser isn't going to fire initial popstate.
    //I copy and pasted this from stack overflow. 
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
      
      address = getURLParam("place");

      var mapOptions = {
        zoom: 13,
        panControl: false,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };

      var polyOptions = {
          strokeWeight: 0,
          fillOpacity: 0.45,
          editable: true
      };

       infoWindow = new google.maps.InfoWindow({});

      map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
      
      // Creates a drawing manager attached to the map that allows the user to draw
      // markers, lines, and shapes.
      drawingManager = new google.maps.drawing.DrawingManager({
       drawingControl:false,
       drawingControlOptions: {
        position: google.maps.ControlPosition.TOP_LEFT,
        drawingModes: [
          google.maps.drawing.OverlayType.POLYGON
         
        ]
      },
        polygonOptions: polyOptions,
        map: map
      });
      
      // Add a marker and center the map on the new marker. 
      addMarker(address);
     

      // Fills the search box with the current address the user searched for
      document.getElementById('map-search-box').value = address;
      
      // Set options for the places autocomplete. 
      var autoOptions = {
        types: ['geocode'],
      };

       google.maps.event.addListener(map, 'bounds_changed', function() {
          
          var mapBounds = getBounds();
          getOverlays(mapBounds);

      });
        var input = document.getElementById('map-search-box');
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

          });
          setSelection(newShape);
        }
      });

      // This is a listener for whenever a user selects an option from the autocomplete
      google.maps.event.addListener(mapSearch, 'place_changed', function() {
        removeMarkers();

        searched = true;

        address = document.getElementById('map-search-box').value;

        // use push state to chane the URL so it can be book marked/shared
        window.history.pushState("http://www.staybl.com/", "Staybl | "+address, "map?place="+address);
       
        // Add a new marker and center the map on it
        addMarker(address);
      });

      // Clear the current selection when the drawing mode is changed, or when the
      // map is clicked.
      google.maps.event.addListener(drawingManager, 'drawingmode_changed', clearSelection);
      google.maps.event.addListener(map, 'click', clearSelection);
      
  
      

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
          selectedShape.set('strokeColor', color);
        }
      }
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
         colorPalette.index = 7;
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

      $.getJSON("/overlays/fetch.json?bounds="+bounds, function(data) {
          
           if(data.length == 0){
            if(searched == true){
              $('#modal-place').html(address);
              $('#map-modal').modal('show')
              $('#close-modal').click(function(){
                  $('#map-modal').modal('hide');
              });
              searched = false;
            }
           }

            for (var i=0;i<data.length;i++){
              if(!polygons[data[i].id]){
                setPolygon(data[i]);
              }
          }
      });
    };


    function setPolygon(data){
      var coordinates = data.coordinates.slice(10, -2).split(',');
          var polygonPath = new Array();
          for(var j=0; j<coordinates.length;j++){
            var point = coordinates[j].trim().split(' ');
            var gPoint = new google.maps.LatLng(parseFloat(point[0]), parseFloat(point[1]));
            polygonPath.push(gPoint);
          } 
          var polygonId = data.id;
          var polygon = new google.maps.Polygon({
              paths: polygonPath,
              strokeColor: data.color,
              strokeOpacity: 0.5,
              strokeWeight: 0,
              fillColor: data.color,
              fillOpacity: 0.5,
              id:polygonId,
              name: data.name,
              shortDesc: data.short_desc,
              map: map 
            }); 

          polygons[polygonId] = polygon;
          google.maps.event.addListener(polygon, 'click', function(e){  
            setInfoWindow(polygon, e);
            
          })

    };

    function getBounds(){
          var b = map.getBounds();
          var ne = b.getNorthEast();
          var sw = b.getSouthWest();
          var yMaxLat = ne.lat();
          var xMaxLng = ne.lng();
          var yMinLat = sw.lat();
          var xMinLng = sw.lng();

          var bounds = 'POLYGON(('+yMinLat+' '+xMinLng+', '+yMaxLat+ ' '+xMinLng+', '+yMaxLat+' '+xMaxLng+', '+yMinLat + ' '+xMaxLng+','+yMinLat+' '+xMinLng+'))';
          return bounds;
    }

    function setInfoWindow(polygon,e){
      if(editable == true) {
        
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

        infoWindow.setContent(formContent);

        infoWindow.open(map);
        infoWindow.setPosition(e.latLng);
        google.maps.event.addListener(infoWindow, 'domready', function() {
          document.getElementById('overlay-name').value = '';
          document.getElementById('overlay-desc').value = '';
          if(selectedShape.id){
            document.getElementById('overlay-name').value = polygon.name; 
            document.getElementById('overlay-desc').value = polygon.shortDesc; 
          }
          else{

          }

        });

        google.maps.event.addListener(selectedShape, 'rightclick', function(e){
                  if (e.vertex != null) {
                  selectedShape.getPath().removeAt(e.vertex);
                }
        });

        var saveOverlay = google.maps.event.addDomListenerOnce(document.getElementById('save-button'), 'click', function() {
                  
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
          var overlayName = document.getElementById('overlay-name').value;
          var overlayShortDesc = document.getElementById('overlay-desc').value;
          var overlayColor = selectedShape.fillColor;
          var overlayId = selectedShape.id;

          if(overlayId){
            var saveType = 'PUT';
            var savePath = 'overlays/'+overlayId+'.json';
          }
          else{
            var saveType = 'POST';
            var savePath = 'overlays.json'
          }
          $.ajax({
              type: saveType,
              url: savePath,
              data: 'name='+overlayName+'&short_desc=' + overlayShortDesc +'&coordinates=' + polyCoordinates + '&color='+ overlayColor
            }).done(function() {
             
              delete polygons[overlayId];
              infoWindow.close();
              selectedShape.setMap(null);
              var mapBounds = getBounds();
              getOverlays(mapBounds);
            });
        });

        google.maps.event.addDomListener(document.getElementById('delete-button'), 'click', function(){
            if(selectedShape.id){
                 $.ajax({
                    type: 'DELETE',
                    url: '/overlays/'+selectedShape.id+'.json'
                  });   
              }
              saveOverlay.remove();
              infoWindow.close();
              deleteSelectedShape();
        });

          google.maps.event.addListener(infoWindow,'closeclick',function(){
              
               //remove the event save overlay event listener so I don't end up saving
                  //16 of the same overlays
                  saveOverlay.remove();
          });
      
    }

      else {

        var overlayDetails = document.createElement('div');
        overlayDetails.id = 'overlay-details';

        var overlayName = document.createElement('div');
        overlayName.id = 'overlay-name';
        overlayName.innerHTML = polygon.name;

        var overlayDesc = document.createElement('div');
        overlayDesc.id = 'overlay-desc';
        overlayDesc.innerHTML = polygon.shortDesc;
       

        overlayDetails.appendChild(overlayName);
        overlayDetails.appendChild(overlayDesc);

        infoWindow.setContent(overlayDetails);

        google.maps.event.addListener(infoWindow, 'domready', function() {
         
        });
     
       infoWindow.open(map);
       infoWindow.setPosition(e.latLng);
      
      }

    }


    function showDrawingManager(){
       drawingManager.setMap(map);
       drawingManager.setOptions({
        drawingControl:true
      });
       buildColorPalette();
    }

    function hideDrawingManager(){
       drawingManager.setMap(null);
       map.controls.removeAt(7);
    }
    //initialize the map
    initialize();
  }
});

    