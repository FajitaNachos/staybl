require 'spec_helper'

describe "admin/areas/show" do
  before(:each) do
    @admin_area = assign(:admin_area, stub_model(Admin::Area))
  end

  it "renders attributes in <p>" do
    render
    # Run the generator again with the --webrat flag if you want to use webrat matchers
  end
end
