require 'spec_helper'

describe "admin/layers/index" do
  before(:each) do
    assign(:admin_layers, [
      stub_model(Admin::Layer,
        :Layer => "Layer"
      ),
      stub_model(Admin::Layer,
        :Layer => "Layer"
      )
    ])
  end

  it "renders a list of admin/layers" do
    render
    # Run the generator again with the --webrat flag if you want to use webrat matchers
    assert_select "tr>td", :text => "Layer".to_s, :count => 2
  end
end
