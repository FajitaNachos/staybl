$(document).ready(function(){
  //Only load this javascript if a user is on the map page
  if(document.getElementById('map-canvas')){

    var markers = [];
    var marker;
    var polygons = {};
    var drawingManager;
    var currentOverlay;
    var mapBounds;
    var map;
    var id = $('#map').data('map-id');
    var city = $('#map').data('city');
    var state = $('#map').data('state');

    // Used to detect initial (useless) popstate.
    // If history.state exists, assume browser isn't going to fire initial popstate.
    //I copy and pasted this from stack overflow. 
    var popped = ('state' in window.history && window.history.state !== null), initialURL = location.href;

    $(window).bind('popstate', function (event) {
      // Ignore inital popstate that some browsers fire on page load
      var initialPop = !popped && location.href == initialURL
      popped = true
      if (initialPop) return;
        removeOverlays();
        $('.secondary').show();
        var areaId = getURLParam('id');
        if(areaId){
          var area = $('[data-id="'+areaId+'"]');
          updateAreaList(area);
        }
        else{
          var area = $('[data-id="'+id+'"]');
          updateAreaList(area);
        }
    });

    function initialize() {
      // turns on the new google maps
      google.maps.visualRefresh = true;

      google.maps.Polygon.prototype.getBounds = function() {
          var bounds = new google.maps.LatLngBounds();
          var paths = this.getPaths();
          var path;        
          for (var i = 0; i < paths.getLength(); i++) {
              path = paths.getAt(i);
              for (var ii = 0; ii < path.getLength(); ii++) {
                  bounds.extend(path.getAt(ii));
              }
          }
          return bounds;
      }

      var mapOptions = {
        zoom: 13,
        scrollwheel: false,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };

      var polygonOptions = {
          strokeWeight: 0,
          fillOpacity: 0.45,
          editable: true,
          strokeColor: '#32CD32'
      };

      map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
      
      if($('.editable-map').length){
        drawingManager = new google.maps.drawing.DrawingManager({
          drawingControl:false,
          drawingMode: null,
          polygonOptions: polygonOptions,
          map: map
        });

        if (id){
          getArea(id);
        }
        else{
          addMarker(city);
          addDrawingControl();
        }

        google.maps.event.addListener(drawingManager, 'overlaycomplete', function(e) {
          if (e.type != google.maps.drawing.OverlayType.MARKER) {
            // Switch back to non-drawing mode after drawing a shape.
            drawingManager.setDrawingMode(null);

            // Add an event listener that selects the newly-drawn shape when the user
            // mouses down on it.
            var newOverlay = e.overlay;
            newOverlay.type = e.type;
            newOverlay.editable = true;

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

      }
      else{
       var idParam = getURLParam('id');
        if(idParam){
          var area = $('[data-id="'+idParam+'"]');
          alert(idParam);
          updateAreaList(area);
        }
        else{
          getArea(id);
        }
      }
    }

    // function to geocode an address and add a market to the map
    function addMarker(city){
      geocoder = new google.maps.Geocoder();
      if(city){
        geocoder.geocode({address: city}, function(results, status) {
          var location = results[0].geometry.location;  
          marker = new google.maps.Marker({
            position: location,
            visible: false,
            map: map
          });
          markers.push(marker);
          map.panTo(location);
        });
      }
    }

    function addDrawingControl() {

    var controlDiv = document.createElement('div');
    controlDiv.className = 'control-container';
        
    // Set CSS styles for the DIV containing the control
    // Setting padding to 5 px will offset the control
    // from the edge of the map.
  

    // Set CSS for the control border.
    var controlUI = document.createElement('div');
    controlUI.className = 'map-control';
    controlUI.title = 'Start Drawing';
    controlDiv.appendChild(controlUI);

    // Set CSS for the control interior.
    var controlText = document.createElement('div');
    controlText.innerHTML = 'Start Drawing';
    controlUI.appendChild(controlText);


    // Setup the click event listeners
    google.maps.event.addDomListener(controlUI, 'click', function() {
      drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
      map.controls[google.maps.ControlPosition.RIGHT_TOP].clear();
      addClearControl();

    });
    controlDiv.index = 1;
    map.controls[google.maps.ControlPosition.RIGHT_TOP].push(controlDiv);
  
  }

  function addClearControl() {

    var controlDiv = document.createElement('div');
    controlDiv.className = 'control-container';

    // Set CSS for the control border.
    var controlUI = document.createElement('div');
    controlUI.className = 'map-control';
    controlUI.title = 'Clear Selection';
    controlDiv.appendChild(controlUI);

    // Set CSS for the control interior.
    var controlText = document.createElement('div');
    controlText.innerHTML = 'Clear Selection';
    controlUI.appendChild(controlText);

    // Setup the click event listeners
    google.maps.event.addDomListener(controlUI, 'click', function() {
      
      deleteCurrentOverlay();
      drawingManager.setDrawingMode(null);
      map.controls[google.maps.ControlPosition.RIGHT_TOP].clear();
      addDrawingControl();
    });
    controlDiv.index = 1;
    map.controls[google.maps.ControlPosition.RIGHT_TOP].push(controlDiv);
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


    function getArea(id){

      $.getJSON("/areas/"+state+"/"+city+"/"+id+'.json', function(data) {
              setPolygon(data);
              console.log(data);
              $('#area-description').html(data.description);
      });
    }

    function setPolygon(data){
     
      var polygon = data.the_geom.replace("POLYGON((", "");
          polygon = polygon.replace("))","");
          polygon = polygon.split(",");
      
          console.log(polygon);
        
      var polygonPath = new Array();
      for(var j=0; j<polygon.length;j++){
        var point = polygon[j].trim().split(' ');
    
        var gPoint = new google.maps.LatLng(parseFloat(point[1]), parseFloat(point[0]));

        polygonPath.push(gPoint);
      } 

      var polygon = new google.maps.Polygon({
          paths: polygonPath,
          strokeColor: '#32CD32',
          strokeOpacity: 1,
          strokeWeight: 1,
          fillColor: '#32CD32',
          fillOpacity: 0.25,
          id:data.id,
          clickable:false,  
          editable:false,
          name: data.name,
          map: map 
      }); 

      if($('.editable-map').length) {
          drawingManager.setDrawingMode(null);
          polygon.setOptions({
            editable: true,
            clickable:true
          });
         $('#area_the_geom').val(area.the_geom);

      }
      //add the polygon to the global polygon array
      polygons[data.id] = polygon;

      map.fitBounds(polygon.getBounds());
     
        

      google.maps.event.addListener(polygon.getPath(), 'set_at', function() {
        setCoordinates(polygon);
      });

      google.maps.event.addListener(polygon.getPath(), 'insert_at', function() {
        setCoordinates(polygon);
      });

      google.maps.event.addListener(polygon, 'click', function(e){  
        setSelection(polygon);
      });

      google.maps.event.addListener(polygon, 'rightclick', function(e){
          if (e.vertex != null) {
            polygon.getPath().removeAt(e.vertex);
            setCoordinates(polygon);
          }
      });
    }

    function clearSelection() {
      if (currentOverlay) {
        //currentOverlay.setEditable(false);
        currentOverlay.setMap(null);
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
       $('#area_the_geom').value = '';
      }
    }
    function removeOverlays(){
      
      for (var id in polygons) {
        if (polygons.hasOwnProperty(id)) { 
          polygons[id].setMap(null);
        }
      }
    }

    function setCoordinates(newOverlay){
      // complete functions
      var path = newOverlay.getPath();
      var xy;
      var polygon = '';
        // Iterate over the polygonBounds vertices.
      for (var i = 0; i < path.length; i++) {
        xy = path.getAt(i);
        polygon += xy.lng() + ' ' + xy.lat() + ', ';
      }

      var final_xy = path.getAt(0);
      polygon += final_xy.lng() + ' ' + final_xy.lat();
  
      var polyCoordinates = 'POLYGON((' + polygon + '))';

      document.getElementById('area_the_geom').value = polyCoordinates;
    }

    function updateAreaList(area){
       
        var upVote = area.find('.area-up-vote');
        var downVote = area.find('.area-down-vote');
        var selectedArea = area.find('.area');

        upVote.show();
        downVote.show();

        var primaryArea = $('.primary').find('.area');

        if (area.hasClass('secondary')){
          $('.primary').find('.area-up-vote').hide();
          $('.primary').find('.area-down-vote').hide();

          $('.primary').removeClass('primary').addClass('secondary');
          area.addClass('primary').removeClass('secondary');
        }
        console.log(area);
        var currentId = area.data('id');
        var ul = $('#area-list');
        var li = ul.children('.secondary');
            li.detach().sort(function(a,b) {
                return $(b).data('votes') - $(a).data('votes');  
            });

        ul.append(li);
        $('.secondary').hide();
        $('#add-area').hide();

        removeOverlays();
        getArea(currentId);


    }

    $('#show-more').on('click', function(){
        $('.secondary').slideToggle('slow');
        $('#add-area').toggle();
      });
    
    $('#areas').on('click', '.secondary', function(){
       var areaId = $(this).data('id');
        updateAreaList($(this));
        removeOverlays();
        history.pushState(
                  null, 
                  'Staybl',
                  window.location.pathname+'?id='+areaId);
      });

    $(document).on('ajax:complete', '.upvote', function(event, data, status, xhr) {
          switch(data.status){
            case 200:
              $(this).closest('#votes').find('.tally').html(data.responseText);    
              break
            case 404 :
             
              $(this).closest('#votes').find('.tally').html(data.responseText);    
              break
            case 401 : 
              console.log(event.target.pathname);
              $('#modal-login').modal('show');
              break
            }
          
    });

    $(document).on('ajax:complete', '.downvote', function(event, data, status, xhr) {
         switch(data.status){
            case 200:
              $(this).closest('#votes').find('.tally').html(data.responseText);     
              break
            case 404:
         
              $(this).closest('#votes').find('.tally').html(data.responseText);  
              break
            case 401: 
              $('#modal-login').modal('show');
              break
          }  
    });

    if($('.editable-map').length){
          if (id){
            $('#new_area_name').hide();
            $('#edit-instructions').show();
            $('#new-instructions').hide();
          }
          else{
            $('#new_area_name').show();
            $('#edit-instructions').hide();
            $('#new-instructions').show();
            
          }
      }

    $('#areas').on('click', '.primary', function(){
      $('.secondary').hide();
      //$('#add-area').hide();
    });
    initialize();
  }
});