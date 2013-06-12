class ChangeLayersToOverlays < ActiveRecord::Migration
 
  def change
    rename_table :layers, :overlays
  end 

end
