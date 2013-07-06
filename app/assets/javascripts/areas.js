$(document).ready(function(){
  
  //Only load this javascript if a user is on the map page
  if(document.getElementById('map-canvas')){
    var markers = [];
    var polygons = {};
    var selectedColor;
    var infoWindow;
    var drawingManager;
    var currentOverlay;
    var colors = ['#32CD32'];
    var selectedColor;
    var colorButtons = {};
    var mapBounds;
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
      var poppedAddress = getURLParam("city");
      
      addMarker(poppedAddress);
    });

    function initialize() {
      // turns on the new google maps
      google.maps.visualRefresh = true;

      // retrieve and parse the name of the place from the URL
      var city = getURLParam("city");
      var id = $('.primary').data('id');
     

      var mapOptions = {
        zoom: 13,
        scrollwheel: false,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };

      var polygonOptions = {
          strokeWeight: 0,
          fillOpacity: 0.45,
          editable: true,
          fillColor: '#32CD32',
          strokeColor: '#32CD32'
      };

      map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

      if(document.getElementById("edit-map")){
        drawingManager = new google.maps.drawing.DrawingManager({
          drawingControl:false,
          drawingMode: google.maps.drawing.OverlayType.POLYGON,
          polygonOptions: polygonOptions,
          map: map
        });
      }

      addMarker(city);
      getArea(id);
      google.maps.event.addListener(map, 'bounds_changed', function() {
         
      });


      infoWindow = new google.maps.InfoWindow({});
      // Bias the autocomplete results to the map window
     
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
            setInfoWindow(newOverlay, function(content){
                infoWindow.setContent(content);
                infoWindow.open(map);
                infoWindow.setPosition(e.latLng);
                addInfoWindowListeners(newOverlay);
              });
          });

          setSelection(newOverlay);
          setCoordinates(newOverlay);
        }

        google.maps.event.addListener(newOverlay.getPath(), 'set_at', function() {
          setCoordinates(newOverlay);
        });

        google.maps.event.addListener(newOverlay.getPath(), 'insert_at', function() {
          setCoordinates(newOverlay);
        });

      });

       // Clear the current selection when the drawing mode is changed, or when the
      // map is clicked.
      google.maps.event.addListener(drawingManager, 'drawingmode_changed', clearSelection);
      google.maps.event.addListener(map, 'click', clearSelection);

    }

    // function to geocode an address and add a market to the map
    function addMarker(city){
      geocoder = new google.maps.Geocoder();
      if(city){
        geocoder.geocode({address: city}, function(results, status) {
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

    function getArea(id){

      $.getJSON("/areas/"+id, function(data) {
              $('#area-description').html(data.description);
              setPolygon(data);
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
          strokeColor: '#32CD32',
          strokeOpacity: 0.5,
          strokeWeight: 0,
          fillColor: '#32CD32',
          fillOpacity: 0.5,
          id:data.id,
          clickable:false,  
          editable:false,
          name: data.name,
          map: map 
      }); 

      if(document.getElementById('edit-map')){
        drawingManager.setDrawingMode(null);
        polygon.setOptions({
          editable: true,
          clickable:true,
        });
      }
      //add the polygon to the global polygon array
      polygons[data.id] = polygon;

      google.maps.event.addListener(polygon.getPath(), 'set_at', function() {
        setCoordinates(polygon);
      });

      google.maps.event.addListener(polygon.getPath(), 'insert_at', function() {
        setCoordinates(polygon);
      });

      google.maps.event.addListener(polygon, 'click', function(e){  
        setSelection(polygon);
        setInfoWindow(polygon, function(content){
          infoWindow.setContent(content);
          infoWindow.open(map);
          infoWindow.setPosition(e.latLng);
          addInfoWindowListeners(polygon);
        });
      });
    }

    function clearSelection() {
      if (currentOverlay) {
        currentOverlay.setEditable(false);
        currentOverlay = null;
      }
    }

    function setSelection(overlay) {
      clearSelection();
      currentOverlay = overlay;
      overlay.setEditable(true);
    }

    function deleteCurrentOverlay() {
      if (currentOverlay) {
        currentOverlay.setMap(null);
         drawingManager.setOptions({
            drawingMode: google.maps.drawing.OverlayType.POLYGON
          });
        document.getElementById('area_coordinates').value = '';
      }
    }

    function removeOverlays(){
      
      for (var id in polygons) {
        if (polygons.hasOwnProperty(id)) { 
          polygons[id].setMap(null);
        }
      }
    }
      

    function setInfoWindow(overlay, callback){
      if(overlay.editable){

        var deleteButton = document.createElement('button');
        deleteButton.id = "delete-button";
        deleteButton.type = "button";
        deleteButton.className = "btn btn-small";
        deleteButton.innerHTML = "Remove Overlay";

        var windowContent = document.createElement('div');
        windowContent.id = 'edit-overlay';

        
        windowContent.appendChild(deleteButton);

        callback(windowContent);
      }

      else{
        if(document.getElementById('edit-map')){
          setSelection(overlay);
        }
      }
    }

    function setCoordinates(newOverlay){
      // complete functions
      var path = newOverlay.getPath();
      var xy;
      var coordinates = '';
        // Iterate over the polygonBounds vertices.
      for (var i = 0; i < path.length; i++) {
        xy = path.getAt(i);
        coordinates += xy.lat() + ' ' + xy.lng() + ', ';
      }

      var final_xy = path.getAt(0);
      coordinates += final_xy.lat() + ' ' + final_xy.lng();
  
      var polyCoordinates = 'POLYGON((' + coordinates + '))';

      document.getElementById('area_coordinates').value = polyCoordinates;
    }

    function addInfoWindowListeners(polygon){
      if(document.getElementById('edit-overlay')){
        google.maps.event.addListener(currentOverlay, 'rightclick', function(e){
          if (e.vertex != null) {
            selectedShape.getPath().removeAt(e.vertex);
          }
        });
        google.maps.event.addDomListener(document.getElementById('delete-button'), 'click', function(){
          if(currentOverlay.id){
               $.ajax({
                  type: 'DELETE',
                  url: '/areas/'+currentOverlay.id+'.json'
                });   
            }
            infoWindow.close();
            deleteCurrentOverlay();
        });

        google.maps.event.addListener(infoWindow,'closeclick',function(){
            
        });
      }
    }
    $('#show-more').on('click', function(){
        $('.secondary').fadeIn('slow');
        $('.add-area').fadeIn('slow');
      });
    $('#areas').on('click', '.secondary', function(){
        $('.primary').addClass('secondary');
        $('.primary').removeClass('primary');
        $(this).removeClass('secondary');
        $(this).addClass('primary');
        
        var ul = $('#area-list');
        var li = ul.children('.secondary');
            li.detach().sort(function(a,b) {
                return $(a).data('position') - $(b).data('position');  
            });
            
        ul.append(li);

        var id = $(this).data('id');
        removeOverlays();
        getArea(id);
        $('.secondary').hide();
        $('.add-area').hide();
      });

      $('#areas').on('click', '.primary', function(){
        $('.secondary').hide();
      });
    initialize();
  }
});