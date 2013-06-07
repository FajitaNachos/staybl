require 'spec_helper'

feature "Display the map", :js => true do
  before{ visit map_path(:place => 'Chicago')}
  
  scenario "Map search box is not empty" do
     within("#map-search") do
      find_field('map-search-box').value.should eq 'Chicago' 
    end
  end  
  scenario "Map should be visible" do


  end 
end