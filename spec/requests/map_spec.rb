require 'spec_helper'

describe "Map page" do 

  let(:base_title) { "Staybl" } 
  subject { page }
  
  describe "Has correct title" do
    before { visit map_path }
      it { should have_title(base_title)}
  end
      
end