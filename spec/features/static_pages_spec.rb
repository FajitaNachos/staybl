require 'spec_helper'

describe "Static pages" do
 
  let(:base_title) { "Staybl" } 
  subject { page }

  describe "Home page" do 
    before { visit root_path }

      it { should have_title("Staybl")}
      it { should_not have_title ('Home') }
  end
end
