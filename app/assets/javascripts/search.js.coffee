# Place all the behaviors and hooks related to the matching controller here.
# All this logic will automatically be available in application.js.
# You can use CoffeeScript in this file: http://jashkenas.github.com/coffee-script/


initialize = ->
  geocoder = new google.maps.Geocoder()
  geocoder.geocode
    address: address
  , (results, status) ->
    if status is google.maps.GeocoderStatus.OK
      myOptions =
        zoom: 10
        center: results[0].geometry.location
        mapTypeId: google.maps.MapTypeId.ROADMAP

      map = new google.maps.Map(document.getElementById("map-canvas"), myOptions)

getURLParam = (name) ->
  decodeURIComponent((new RegExp("[?|&]" + name + "=([^&;]+?)(&|##|;|$)").exec(location.search) or [null, ""])[1].replace(/\+/g, "%20")) or null

address = getURLParam("search")

window.onload = initialize





