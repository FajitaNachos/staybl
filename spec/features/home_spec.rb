require 'spec_helper'

feature 'Visitor searches for a city' do 
  before { visit root_path }
  scenario 'with empty search form' do 
    click_button "Search"
    expect(page).to have_content('Please enter a city')
  end
  scenario 'with valid search form' do 
   
    fill_in 'place', :with => 'Chicago'
    click_button "Search"
    expect(page).to have_content('Chicago')

  end
end
