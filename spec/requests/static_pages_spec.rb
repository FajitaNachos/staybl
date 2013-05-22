require 'spec_helper'

describe "Static pages" do

  describe "Home page" do

    it "should have the content 'Staybl'" do
      visit '/static_pages/home'
      page.should have_content('Staybl')
    end
  end

  describe "Contact page" do

    it "should have the content 'Contact'" do
      visit '/static_pages/contact'
      page.should have_content('Contact')
    end
  end

  describe "About page" do

    it "should have the content 'About Us'" do
      visit '/static_pages/about'
      page.should have_content('About Us')
    end
  end

  describe "Privacy Policy" do

    it "should have the content 'Privacy Policy'" do
      visit '/static_pages/privacy'
      page.should have_content('Privacy Policy')
    end
  end

end
