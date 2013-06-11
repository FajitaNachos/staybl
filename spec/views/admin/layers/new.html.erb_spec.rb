require 'spec_helper'

describe "admin/layers/new" do
  before(:each) do
    assign(:admin_layer, stub_model(Admin::Layer).as_new_record)
  end

  it "renders new admin_layer form" do
    render

    # Run the generator again with the --webrat flag if you want to use webrat matchers
    assert_select "form[action=?][method=?]", admin_layers_path, "post" do
    end
  end
end
