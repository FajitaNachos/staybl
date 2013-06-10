require 'spec_helper'

describe "admin/layers/edit" do
  before(:each) do
    @admin_layer = assign(:admin_layer, stub_model(Admin::Layer,
      :Layer => "MyString"
    ))
  end

  it "renders the edit admin_layer form" do
    render

    # Run the generator again with the --webrat flag if you want to use webrat matchers
    assert_select "form[action=?][method=?]", admin_layer_path(@admin_layer), "post" do
      assert_select "input#admin_layer_Layer[name=?]", "admin_layer[Layer]"
    end
  end
end
