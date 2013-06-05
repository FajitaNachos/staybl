require 'spec_helper'

describe "Home Page" do
 
  let(:base_title) { "Staybl" } 
  subject { page }

  describe "Has correct title" do 
    before { visit root_path }
      it { should have_title(base_title)}
      it { should_not have_title ('Home') }
  end
end