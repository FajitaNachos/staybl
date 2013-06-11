require 'spec_helper'

describe "admin/layers/show" do
  before(:each) do
    @admin_layer = assign(:admin_layer, stub_model(Admin::Layer))
  end

  it "renders attributes in <p>" do
    render
    # Run the generator again with the --webrat flag if you want to use webrat matchers
  end
end
