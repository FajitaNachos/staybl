require "spec_helper"

describe Admin::AreasController do
  describe "routing" do

    it "routes to #index" do
      get("/admin/areas").should route_to("admin/areas#index")
    end

    it "routes to #new" do
      get("/admin/areas/new").should route_to("admin/areas#new")
    end

    it "routes to #show" do
      get("/admin/areas/1").should route_to("admin/areas#show", :id => "1")
    end

    it "routes to #edit" do
      get("/admin/areas/1/edit").should route_to("admin/areas#edit", :id => "1")
    end

    it "routes to #create" do
      post("/admin/areas").should route_to("admin/areas#create")
    end

    it "routes to #update" do
      put("/admin/areas/1").should route_to("admin/areas#update", :id => "1")
    end

    it "routes to #destroy" do
      delete("/admin/areas/1").should route_to("admin/areas#destroy", :id => "1")
    end

  end
end
