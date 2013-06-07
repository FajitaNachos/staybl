require 'spec_helper'

feature "Loading the map", :js => true do
  before{ visit map_path(:place => 'Chicago')}
  
  scenario "the map search box should contain the correct location" do
     within("#map-search") do
      find_field('map-search-box').value.should eq 'Chicago' 
    end
  end  
  scenario "the map should be visible" do
    find('#map-canvas').should have_content('Map data')  
  end 

  scenario "should drop a marker on the correct location" do

  end
end

feature "Searching for a new location", :js => true do
   before(:each) do
    visit map_path(:place => 'Chicago')
    fill_in 'map-search-box', :with=>'San Francisco'
    find('#map-search-box').native.send_keys(:return)
  end

  scenario "should change the URL" do
    current_path == map_path(:place => 'San Francisco')
  end

  scenario "should drop a new marker on the correct location" do

  end


end
