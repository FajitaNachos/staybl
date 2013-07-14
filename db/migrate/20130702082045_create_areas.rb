class CreateAreas < ActiveRecord::Migration
  def self.up
    create_table :areas do |t|
      
      t.geometry :the_geom, :spatial => true, :srid => 4326
      t.string :city
      t.string :name
      t.string :state
      t.string :county
      t.integer :regionid 
      t.text :description
      t.text :tags, :default => "", :null => true

      t.timestamps
    end
  end


  def self.down
    drop_table :areas
  end

end
