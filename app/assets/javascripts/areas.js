  $(document).ready(function(){
 
  if($('#map-canvas').length >= 1){

    var map = new Map();
    map.init();
    
  }

});


var Map = function() {
  this.id = $('#map').data('map-id');
  this.city = $('#map').data('city');
  this.state = $('#map').data('state');
  this.editable = false;
  this.polygons = [];
  this.markers = [];
};

Map.prototype.init = function(){
    // turns on the new google maps
    google.maps.visualRefresh = true;
    this.extendPolygon();

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

    this.map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
    
    if($('.editable-map').length >= 1){
      this.editable = true;
      this.initDrawingManager(polygonOptions);
      if(this.id){
        this.getArea(this.id);
      }
      else{
        this.addMarker(this.city);
        this.addDrawingControl();
      }
    }
    else{
      this.getArea(this.id);
    }

    this.attachEventListeners();
}

Map.prototype.extendPolygon =  function() {

  google.maps.Polygon.prototype.getBounds = function() {
      var bounds = new google.maps.LatLngBounds();
      var paths = this.getPaths();
           
      for (var i = 0; i < paths.getLength(); i++) {
        var path = paths.getAt(i);

        for (var ii = 0; ii < path.getLength(); ii++) {
          bounds.extend(path.getAt(ii));
        }
      }
      return bounds;
    }
}


Map.prototype.getArea = function(id){
    var self = this;
    $.getJSON("/areas/fetch/"+id+'.json', function(data) {
      self.setPolygon(data);
    });
}


Map.prototype.setPolygon = function(data){
     
  var self = this;
  var polygonData = data.the_geom.replace("POLYGON((", "");
  polygonData = polygonData.replace("))","");
  polygonData = polygonData.split(",");
  
  var polygonPath = [];

  for(var i = 0; i < polygonData.length; i++){
    var point = polygonData[i].trim().split(' ');
    
    var gPoint = new google.maps.LatLng(parseFloat(point[1]), parseFloat(point[0]));

    polygonPath.push(gPoint);
  } 

  this.polygon = new google.maps.Polygon({
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
    map: this.map 
  }); 

  var bounds = this.polygon.getBounds().toUrlValue().split(',');

  this.searchYelpRestaurants(bounds);
  this.searchYelpHotels(bounds);
  //this.searchPanoramio(bounds)


  if(this.editable) {
    this.drawingManager.setDrawingMode(null);
    this.polygon.setOptions({
      editable: true,
      clickable:true
    });

    $('#area_the_geom').val(data.the_geom);
  }
  //add the polygon to the global polygon array
  this.polygons[data.id] = this.polygon;

  this.map.fitBounds(this.polygon.getBounds());
  
   // Clear the current selection when the drawing mode is changed, or when the
    // map is clicked.
      google.maps.event.addListener(this.drawingManager, 'drawingmode_changed', this.clearSelection);

      google.maps.event.addListener(this.polygon.getPath(), 'set_at', function() {
        self.setCoordinates(self.polygon);
      });

      google.maps.event.addListener(this.polygon.getPath(), 'insert_at', function() {
        self.setCoordinates(self.polygon);
      });

      google.maps.event.addListener(this.polygon, 'click', function(e){  
        self.setSelection(self.polygon);
      });

      google.maps.event.addListener(this.polygon, 'rightclick', function(e){
        if (e.vertex != null) {
          self.polygon.getPath().removeAt(e.vertex);
          self.setCoordinates(self.polygon);
        }
      });
  
}

Map.prototype.attachEventListeners = function() {
  var self = this;
 
  if(this.editable) {
    google.maps.event.addListener(this.drawingManager, 'overlaycomplete', function(e) {
        console.log('overlay complete');
        if (e.type != google.maps.drawing.OverlayType.MARKER) {
          // Switch back to non-drawing mode after drawing a shape.
          self.drawingManager.setDrawingMode(null);

          // Add an event listener that selects the newly-drawn shape when the user
          // mouses down on it.
          var newOverlay = e.overlay;
          newOverlay.type = e.type;
          newOverlay.editable = true;

          self.setSelection(newOverlay);
          self.setCoordinates(newOverlay);

          google.maps.event.addListener(newOverlay.getPath(), 'set_at', function() {
            self.setCoordinates(newOverlay);
          });

          google.maps.event.addListener(newOverlay.getPath(), 'insert_at', function() {
            self.setCoordinates(newOverlay);
          });
        }
      }); 
    } 
};

Map.prototype.searchPanoramio = function(bounds) {

  $.ajax({
    type: 'get',
    dataType: 'jsonp',
    url: 'http://www.panoramio.com/map/get_panoramas.php?set=public&from=0&to=50&minx='+bounds[1]+'&miny='+bounds[0]+'&maxx='+bounds[3]+'&maxy='+bounds[2]+'&size=medium&callback=?',
    success: function(data) {
      for(var i = 0; i < data.photos.length; i++){
        var img = $('<img />',{
          'src': data.photos[i].photo_file_url
        })
        $('.area-images').append(img)
      }

    }
    });

}

Map.prototype.loadPhotos = function(data) {
  console.log(data);
}

Map.prototype.searchYelpRestaurants = function(bounds){
  var self = this;

  $.ajax({
    url: "/areas/yelp_search_restaurants",
    data: {
      bounding_box : bounds
    },
    success: function(data) { self.populateRestaurants(data)}
    });
}

Map.prototype.populateRestaurants = function(data) {
  var $container = $('div.restaurants');
  $container.append(data);

}

Map.prototype.searchYelpHotels = function(bounds){
  var self = this;


  $.ajax({
    url: "/areas/yelp_search_hotels",
    data: {
      bounding_box : bounds
    },
    success: function(data) { self.populateHotels(data);}
    });
}

Map.prototype.populateHotels = function(data) {

  var $container = $('div.hotels');
  $container.append(data);
  
}

Map.prototype.clearSelection = function() {
  if (this.currentOverlay) {
    //currentOverlay.setEditable(false);
    this.currentOverlay.setMap(null);
    this.currentOverlay = null;
  }
}

Map.prototype.setSelection = function(overlay) {
  this.clearSelection();
  this.currentOverlay = overlay;
  overlay.setEditable(true);
}

Map.prototype.deleteCurrentOverlay = function() {
  if (this.currentOverlay) {
    this.currentOverlay.setMap(null);
    this.drawingManager.setOptions({
      drawingMode: google.maps.drawing.OverlayType.POLYGON
    });

    $('#area_the_geom').val('');
  }
}

Map.prototype.removeOverlays = function(){
    
  for (var id in this.polygons) {
    if (this.polygons.hasOwnProperty(id)) { 
      this.polygons[id].setMap(null);
    }
  }
}

Map.prototype.setCoordinates = function(newOverlay){
  // complete functions


  var path = newOverlay.getPath();

  var polygon = '';
  // Iterate over the polygonBounds vertices.
  for (var i = 0; i < path.length; i++) {
    var xy = path.getAt(i);
    polygon += xy.lng() + ' ' + xy.lat() + ', ';
  }

  var final_xy = path.getAt(0);
  polygon += final_xy.lng() + ' ' + final_xy.lat();
    
  var polyCoordinates = 'POLYGON((' + polygon + '))';
  console.log(polyCoordinates);
  $('#area_the_geom').val(polyCoordinates);
}

Map.prototype.initDrawingManager = function(polygonOptions) {
   this.drawingManager = new google.maps.drawing.DrawingManager({
      drawingControl:false,
      drawingMode: null,
      polygonOptions: polygonOptions,
      map: this.map
    });
}

Map.prototype.addMarker =  function(city){
  var self = this;
  var geocoder = new google.maps.Geocoder();

  geocoder.geocode({ address: this.city}, function(results, status) {
    var location = results[0].geometry.location;  
    var marker = new google.maps.Marker({
      position: location,
      visible: false,
      map: self.map
    });

    self.markers.push(marker);
    self.map.panTo(location);
  });
};

Map.prototype.addDrawingControl = function () {
    var self = this;
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
      self.drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
      self.map.controls[google.maps.ControlPosition.TOP_CENTER].clear();
      self.addClearControl();

    });
    controlDiv.index = 1;

    this.map.controls[google.maps.ControlPosition.TOP_CENTER].push(controlDiv);  
}

Map.prototype.addClearControl = function () {
    var self = this;
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
      
      self.deleteCurrentOverlay();
      self.drawingManager.setDrawingMode(null);
      self.map.controls[google.maps.ControlPosition.TOP_CENTER].clear();
      self.addDrawingControl();
    });
    controlDiv.index = 1;
    this.map.controls[google.maps.ControlPosition.TOP_CENTER].push(controlDiv);
}


Map.prototype.removeMarkers = function(){
    for (var i = 0; i < this.markers.length; i++) {
     this.markers[i].setMap(null);
   }
}














