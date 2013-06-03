class MapController < ApplicationController

  def index
    @search = params[:place];
    @map_search = true;
    
  end

end
