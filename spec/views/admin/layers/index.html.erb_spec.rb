require 'spec_helper'

describe "admin/layers/index" do
  before(:each) do
    assign(:admin_layers, [
      stub_model(Admin::Layer),
      stub_model(Admin::Layer)
    ])
  end

  it "renders a list of admin/layers" do
    render
    # Run the generator again with the --webrat flag if you want to use webrat matchers
  end
end
