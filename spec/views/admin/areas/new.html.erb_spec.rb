require 'spec_helper'

describe "admin/areas/new" do
  before(:each) do
    assign(:admin_area, stub_model(Admin::Area).as_new_record)
  end

  it "renders new admin_area form" do
    render

    # Run the generator again with the --webrat flag if you want to use webrat matchers
    assert_select "form[action=?][method=?]", admin_areas_path, "post" do
    end
  end
end
