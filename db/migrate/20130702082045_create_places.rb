class CreatePlaces < ActiveRecord::Migration
  def change
    create_table :places do |t|

      t.string :name
      t.string :city
      
      t.text :description
      t.integer :votes



      t.timestamps
    end
  end
end
