class HomeController < ApplicationController
  def index
    @new_york = Area.where(:city => 'New York', :state => "NY").first
    @chicago = Area.where(:city => 'Chicago', :state => "IL").first
    @san_francisco = Area.where(:city => 'San Francisco', :state => "CA").first

    @random_areas = Area.random(10)
  end

end
