require 'spec_helper'

describe MapController do

  describe "GET #index" do
    before(:each) do
      get :index, :place => 'Chicago'
    end

    it "has valid params" do
      controller.params[:place].should_not be_nil
      controller.params[:place].should eql 'Chicago'
    end

    it "renders the index view" do
      response.should render_template("index")
    end
  
  end

end
