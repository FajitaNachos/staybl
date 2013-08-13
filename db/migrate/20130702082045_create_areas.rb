class CreateAreas < ActiveRecord::Migration
  def self.up
    create_table :areas do |t|

      t.text :the_geom
      t.string :city
      t.string :name
      t.string :state
      t.text :description
      t.text :tags, :default => "", :null => true

      t.timestamps
    end
  end


  def self.down
    drop_table :areas
  end

end
