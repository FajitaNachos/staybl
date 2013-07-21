require 'spec_helper'

describe "admin/areas/edit" do
  before(:each) do
    @admin_area = assign(:admin_area, stub_model(Admin::Area))
  end

  it "renders the edit admin_area form" do
    render

    # Run the generator again with the --webrat flag if you want to use webrat matchers
    assert_select "form[action=?][method=?]", admin_area_path(@admin_area), "post" do
    end
  end
end
