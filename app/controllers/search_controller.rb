class SearchController < ApplicationController
def index
    @city = params[:city]
  end
end
