require 'spec_helper'

describe "Static pages" do
 
  let(:base_title) { "Staybl" } 
  subject { page }

  describe "Home page" do 
    before { visit root_path }

      it { should have_title(base_title)}
      it { should_not have_title ('Home') }
  end

  describe "Map page" do 
    before { visit map_path }
      it { should have_title(base_title)}
      
  end

end