require 'spec_helper'

describe "admin/areas/index" do
  before(:each) do
    assign(:admin_areas, [
      stub_model(Admin::Area),
      stub_model(Admin::Area)
    ])
  end

  it "renders a list of admin/areas" do
    render
    # Run the generator again with the --webrat flag if you want to use webrat matchers
  end
end
