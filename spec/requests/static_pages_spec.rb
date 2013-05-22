require 'spec_helper'

describe "Static pages" do

  let(:site_title) {"Stabyl"}

  describe "Home page" do

    it "should not have the title 'Home'" do
      visit '/static_pages/home'
      page.should_not have_title('Home')
    end

    it "should have the base title" do
      visit '/static_pages/home'
      page.should have_title('Staybl')
    end
  end

  describe "Privacy Policy" do

    it "should have the title 'Privacy'" do
      visit '/static_pages/privacy'
      page.should have_title('Privacy')
    end
  end

  describe "About page" do

    it "should have the title 'About Us'" do
      visit '/static_pages/about'
      page.should have_title('About')
    end
  end

  describe "Contact page" do

    it "should have the title 'Contact'" do
      visit '/static_pages/contact'
      page.should have_title('Contact')
    end
  end
end
