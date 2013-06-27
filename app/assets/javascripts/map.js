$(document).ready(function(){
  //Only load this javascript if a user is on the map page
  if(document.getElementById('map-canvas')){
    var markers = [];
    var polygons = {};
    var selectedOverlay;
    var selectedColor;
    var infoWindow;
    var drawingManager;
    var currentOverlay;
    var colors = ['#FF3333', '#32CD32'];
    var selectedColor;
    var colorButtons = {};
    var mapBounds;
    var showModal = true;
    var map;
    
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

    function initialize() {
      // turns on the new google maps
      google.maps.visualRefresh = true;

      // retrieve and parse the name of the place from the URL
      var address = getURLParam("place");

      var mapOptions = {
        zoom: 13,
        panControl: false,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };

      var polygonOptions = {
          strokeWeight: 0,
          fillOpacity: 0.45,
          editable: true
      };
      map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
      drawingManager = new google.maps.drawing.DrawingManager({
        drawingControl:false,
        drawingControlOptions: {
          position: google.maps.ControlPosition.TOP_LEFT,
          drawingModes: [google.maps.drawing.OverlayType.POLYGON]
        },
        polygonOptions: polygonOptions,
        map: map
      });

      buildColorPalette();

      addMarker(address);
      showDrawingTools();

      // Fills the search box with the current address the user searched for
      document.getElementById('map-search-box').value = address;
    
      // Set options for the places autocomplete. 
      var autocompleteOptions = {
        types: ['geocode'],
      };

      google.maps.event.addListener(map, 'bounds_changed', function() {
          var mapBounds = getBounds();
          fetchOverlays(mapBounds);
      });
      var input = document.getElementById('map-search-box');
      var mapSearch = new google.maps.places.Autocomplete(input, autocompleteOptions);

      infoWindow = new google.maps.InfoWindow({});
      // Bias the autocomplete results to the map window
      mapSearch.bindTo('bounds', map);
      google.maps.event.addListener(drawingManager, 'overlaycomplete', function(e) {
        if (e.type != google.maps.drawing.OverlayType.MARKER) {
          // Switch back to non-drawing mode after drawing a shape.
          drawingManager.setDrawingMode(null);

          // Add an event listener that selects the newly-drawn shape when the user
          // mouses down on it.
          var newOverlay = e.overlay;
          newOverlay.type = e.type;
          newOverlay.editable = true;
          
          google.maps.event.addListener(newOverlay, 'click', function(e) {
            var content = setInfoWindow(newOverlay);
            infoWindow.setContent(content);
            infoWindow.open(map);
            infoWindow.setPosition(e.latLng);

          });

          setSelection(newOverlay);
          var content = setInfoWindow(newOverlay);
          infoWindow.setContent(content);
          infoWindow.open(map);
          infoWindow.setPosition(newOverlay.getPath().getAt(0));
        }
      });

      // This is a listener for whenever a user selects an option from the autocomplete
      google.maps.event.addListener(mapSearch, 'place_changed', function() {
        removeMarkers();
        searched = true;
        var address = document.getElementById('map-search-box').value;

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
    }

    // remove all markers in markers array
    function removeMarkers(){
      for (var i = 0; i < markers.length; i++) {
       markers[i].setMap(null);
      }
    }

    //function to retrieve the params from the URL.
    function getURLParam(name) {
      return decodeURIComponent((new RegExp("[?|&]" + name + "=([^&;]+?)(&|##|;|$)").exec(location.search) || [null, ""])[1].replace(/\+/g, "%20")) || null;
    }

    function showDrawingTools(){
      drawingManager.setOptions({
        drawingControl:true
      });
      colorPalette.style.display = 'block';
    }

    function hideDrawingTools(){
       //map.controls[google.maps.ControlPosition.TOP_LEFT].removeAt(0);
       drawingManager.setOptions({
        drawingControl:false
       });
       colorPalette.style.display = 'none';
    }

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

    function fetchOverlays(bounds){

      $.getJSON("/overlays/fetch.json?bounds="+bounds, function(data) {
        if(data.length == 0){
          if(showModal == true){
           
            $('#map-modal').modal('show')
            $('#close-modal').click(function(){
                $('#map-modal').modal('hide');
            });

            showModal = false;
          }
        }
        for (var i=0;i<data.length;i++){
          if(!polygons[data[i].id]){
            setPolygon(data[i]);
          }
        }
      });
    }

    function setPolygon(data){
      var coordinates = data.coordinates.slice(10, -2).split(',');
      var polygonPath = new Array();
      for(var j=0; j<coordinates.length;j++){
        var point = coordinates[j].trim().split(' ');
        var gPoint = new google.maps.LatLng(parseFloat(point[0]), parseFloat(point[1]));
        polygonPath.push(gPoint);
      } 
      var polygon = new google.maps.Polygon({
          paths: polygonPath,
          strokeColor: data.color,
          strokeOpacity: 0.5,
          strokeWeight: 0,
          fillColor: data.color,
          fillOpacity: 0.5,
          id:data.id,
          editable:false,
          name: data.name,
          shortDesc: data.short_desc,
          map: map 
      }); 
      //add the polygon to the global polygon array
      polygons[data.id] = polygon;
      google.maps.event.addListener(polygon, 'click', function(e){  
        var content = setInfoWindow(polygon);
        infoWindow.setContent(content);
        infoWindow.open(map);
        infoWindow.setPosition(e.latLng);

        google.maps.event.addDomListener(document.getElementById('edit-overlay'), 'click', function(){
            polygon.editable = true;
            setInfoWindow(polygon);
        });
      });
    }

    function clearSelection() {
      if (selectedOverlay) {
        selectedOverlay.setEditable(false);
        selectedOverlay = null;
      }
    }

    function setSelection(overlay) {
      clearSelection();
      currentOverlay = overlay;
      selectColor(overlay.get('fillColor') || overlay.get('strokeColor'));
    }

    function deleteCurrentOverlay() {
      if (currentOverlay) {
        currentOverlay.setMap(null);
      }
    }

    function selectColor(color) {
      selectedColor = color;
      for (var i = 0; i < colors.length; ++i) {
        var currentColor = colors[i];
        colorButtons[currentColor].style.border = currentColor == color ? '1px solid #777' : '1px solid #ddd';
      }
      var polygonOptions = drawingManager.get('polygonOptions');
      polygonOptions.fillColor = color;
      
      drawingManager.set('polygonOptions', polygonOptions);
    }

    function setColor(color) {
      if (currentOverlay) {
        currentOverlay.set('fillColor', color);
        currentOverlay.set('strokeColor', color);
      }
    }

    function makeColorButton(color) {
      var button = document.createElement('span');
      button.className = 'overlay-button';
      button.style.backgroundColor = color;
      google.maps.event.addDomListener(button, 'click', function() {
        selectColor(color);
        setColor(color);
      });

      return button;
    }

    function buildColorPalette() {
      colorPalette = document.createElement('div');
      colorPalette.id = 'color-palette';
      colorPalette.style.display = 'none';
      for (var i = 0; i < colors.length; ++i) {
        var currentColor = colors[i];
        var colorButton = makeColorButton(currentColor);
        colorPalette.appendChild(colorButton);
        colorButtons[currentColor] = colorButton;
      }
      map.controls[google.maps.ControlPosition.TOP_LEFT].push(colorPalette);
      selectColor(colors[0]);
    }

    function setInfoWindow(overlay){
      if(overlay.editable){
        var overlayName = document.createElement('input');
        overlayName.id = 'overlay-name';
        overlayName.value= overlay.name;


        var nameLabel = document.createElement('label');
        nameLabel.setAttribute('for','overlay-name');
        nameLabel.innerHTML = "Neighborhood";

        var overlayDesc = document.createElement('textarea');
        overlayDesc.id = 'overlay-desc';
        overlayDesc.value = overlay.shortDesc;

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

        return formContent;
      }

      else{
        var overlayDetails = document.createElement('div');
        overlayDetails.id = 'overlay-details';

        var overlayName = document.createElement('div');
        overlayName.id = 'overlay-name';
        overlayName.innerHTML = overlay.name;

        var overlayDesc = document.createElement('div');
        overlayDesc.id = 'overlay-desc';
        overlayDesc.innerHTML = overlay.shortDesc;
       
        var editOverlay = document.createElement('span');
        var linkText = document.createTextNode("Edit");
        editOverlay.appendChild(linkText);
        editOverlay.id = 'edit-overlay';

        overlayDetails.appendChild(overlayName);
        overlayDetails.appendChild(overlayDesc);
        overlayDetails.appendChild(editOverlay);

        return overlayDetails;
      }
    }

    initialize();
  }
});