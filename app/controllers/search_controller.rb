class SearchController < ApplicationController

  def index
    @search = Geocoder.search(params[:search])

    
  end

end
