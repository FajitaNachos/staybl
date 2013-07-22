class RemoveColumnsFromAreas < ActiveRecord::Migration
  def up
    remove_column :areas, :county
    remove_column :areas, :regionid
  end

  def down
    add_column :areas, :county, :string
    add_column :areas, :regionid, :integer
  end
end