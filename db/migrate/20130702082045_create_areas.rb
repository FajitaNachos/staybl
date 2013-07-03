class CreateAreas < ActiveRecord::Migration
  def change
    create_table :areas do |t|

      t.string :name
      t.text :description
      t.polygon :coordinates, :spatial => true, :srid => 4326
      t.string :city
      t.integer :votes

      t.timestamps
    end
  end
end
