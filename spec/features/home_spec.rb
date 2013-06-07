require 'spec_helper'

feature "the map search" do
  scenario "submits a valid search request to the map controller" do
    visit root_path
    within("#home-search") do
      fill_in 'place', :with => 'Chicago'
    end
    click_button 'Search'
    current_url.should == map_url(:place=> 'Chicago')
  end

  scenario "submits an invalid search request to the map controller" do
    visit root_path
    within("#home-search") do
      fill_in 'place', :with => ''
    end
    click_button 'Search'
    page.should have_content ('Please enter a city')
  end
end