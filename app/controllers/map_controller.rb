class MapController < ApplicationController

  def index
    @search = Geocoder.search(params[:search])
    @map_search = true;
    
  end

end
