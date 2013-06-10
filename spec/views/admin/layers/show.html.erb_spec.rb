require 'spec_helper'

describe "admin/layers/show" do
  before(:each) do
    @admin_layer = assign(:admin_layer, stub_model(Admin::Layer,
      :Layer => "Layer"
    ))
  end

  it "renders attributes in <p>" do
    render
    # Run the generator again with the --webrat flag if you want to use webrat matchers
    rendered.should match(/Layer/)
  end
end
