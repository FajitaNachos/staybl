class DropOverlays < ActiveRecord::Migration
  def up
      drop_table :overlays
  end

  def down
      
  end
end
