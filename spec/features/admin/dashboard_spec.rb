require 'spec_helper'

feature "access the dashboard" do 
   
  scenario "with valid creditials" do 
   
    visit admin_root_path 
    user = FactoryGirl.create(:administrator)  
    within("#new_administrator") do 
      fill_in 'administrator_email', :with => user.email
      fill_in 'administrator_password', :with => user.password
    end
    click_button 'sign-in'  
    current_path.should eq admin_root_path
  end

end