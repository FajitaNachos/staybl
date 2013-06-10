require "spec_helper"

describe Admin::LayersController do
  describe "routing" do

    it "routes to #index" do
      get("/admin/layers").should route_to("admin/layers#index")
    end

    it "routes to #new" do
      get("/admin/layers/new").should route_to("admin/layers#new")
    end

    it "routes to #show" do
      get("/admin/layers/1").should route_to("admin/layers#show", :id => "1")
    end

    it "routes to #edit" do
      get("/admin/layers/1/edit").should route_to("admin/layers#edit", :id => "1")
    end

    it "routes to #create" do
      post("/admin/layers").should route_to("admin/layers#create")
    end

    it "routes to #update" do
      put("/admin/layers/1").should route_to("admin/layers#update", :id => "1")
    end

    it "routes to #destroy" do
      delete("/admin/layers/1").should route_to("admin/layers#destroy", :id => "1")
    end

  end
end
