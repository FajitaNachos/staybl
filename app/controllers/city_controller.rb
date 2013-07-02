class CityController < ApplicationController

  def index
    @name = params[:name]
  end
end
