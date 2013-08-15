require "spec_helper"

describe AreasController do
  describe "routing" do

    it "routes to #index" do
      get("/areas/IL/Chicago").should route_to("areas#index")
    end

    it "routes to #new" do
      get("/areas/IL/Chicago/new").should route_to("areas#new")
    end

    it "routes to #show" do
      get("/areas/IL/Chicago/1").should route_to("areas#show", :id => "1")
    end

    it "routes to #edit" do
      get("/areas/IL/Chicago/1/edit").should route_to("areas#edit", :id => "1")
    end

    it "routes to #create" do
      post("/areas/IL/Chicago").should route_to("areas#create")
    end

    it "routes to #update" do
      put("/areas/IL/Chicago/1").should route_to("areas#update", :id => "1")
    end

    it "routes to #destroy" do
      delete("/areas/IL/Chicago/1").should route_to("areas#destroy", :id => "1")
    end

    it "routes to #vote_up" do
      post("/areas/IL/Chicago/1/vote_up").should route_to("areas#vote_up", :id => "1")
    end

    it "routes to #vote_down" do
      post("/areas/IL/Chicago/1/vote_down").should route_to("areas#vote_down", :id => "1")
    end
  end
end
