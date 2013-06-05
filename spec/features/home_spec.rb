require 'spec_helper'

feature "the map search" do

  scenario "submits a search request to the map controller" do
    visit root_path
    within("#home-search") do
      fill_in 'place', :with => 'Chicago'
    end
    click_button 'Search'
    current_url.should == map_url(:place=> 'Chicago')
   
  end
end