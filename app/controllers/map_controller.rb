class MapController < ApplicationController

  def index
    search = params[:place]
    if search.empty?
      flash[:alert] = "Please enter a city"
      redirect_to root_path
    end
  else
    @map_search = true;
    
  end

end
