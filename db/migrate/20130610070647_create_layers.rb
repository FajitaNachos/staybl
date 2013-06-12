class CreateLayers < ActiveRecord::Migration
  def change
    create_table :layers do |t|
      
      t.polygon :coordinates, :spatial => true, :srid => 4326
      t.string :name
      t.text :short_desc
      t.text :tags, :default => "", :null => true

      t.timestamps
    end
  end
end