require 'spec_helper'

describe "areas/new" do
  before(:each) do
    assign(:area, stub_model(Area).as_new_record)
  end

  it "renders new area form" do
    render

    # Run the generator again with the --webrat flag if you want to use webrat matchers
    assert_select "form[action=?][method=?]", areas_path, "post" do
    end
  end
end
