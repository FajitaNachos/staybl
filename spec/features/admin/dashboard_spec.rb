require 'spec_helper'

feature "access the dashboard" do 
   
  let(:admin){FactoryGirl.create(:administrator)}
  
  scenario "with valid creditials" do  
    visit admin_root_path 
    within("#new_administrator") do 
      fill_in 'administrator_email', :with => admin.email
      fill_in 'administrator_password', :with => admin.password
    end
    click_button 'sign-in'  
    current_path.should eq admin_root_path
  end
  scenario "with invalid creditials" do 
    visit admin_root_path 
    within("#new_administrator") do 
      fill_in 'administrator_email', :with => 'roughday@sea.com'
      fill_in 'administrator_password', :with => 'thankscaptain'
    end
    click_button 'sign-in'  
    current_path.should_not eq admin_root_path
  end

end