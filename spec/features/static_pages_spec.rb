require 'spec_helper'

describe "Static pages" do
 
  let(:base_title) { "Stabyl" } 
  subject { page }

  describe "Home page" do 
    before { visit root_path }

      it { should have_title("Staybl")}
      it { should_not have_title ('Home') }
  end

  describe "Privacy Policy" do
    before { visit privacy_path }
      it{ should have_title("Staybl | Privacy")}
  end

  describe "About Page" do
    before { visit about_path }
      it{ should have_title("Staybl | About Us")}
  end

  describe "Contact Page" do
    before { visit contact_path }
      it{ should have_title("Staybl | Contact")}
  end
end
