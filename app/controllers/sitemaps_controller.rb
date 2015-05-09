class SitemapsController < ApplicationController
  layout false
  
  def index
    @static_pages = [root_url]
    @areas = Area.where(:approved => true)
    respond_to do |format|
     format.xml
    end
  end

end