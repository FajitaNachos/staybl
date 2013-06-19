class MapController < ApplicationController

  def index
    place = params[:place]
    if place.nil?
      flash[:alert] = "Please enter a city"
      redirect_to root_path
    end
    
    else
      @map_search = true;
    end

  end

  
