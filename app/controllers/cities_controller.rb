class CitiesController < ApplicationController

  def index
    @name = params[:name]
  end
end
