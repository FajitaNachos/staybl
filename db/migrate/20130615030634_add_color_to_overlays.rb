class AddColorToOverlays < ActiveRecord::Migration
  def change
    add_column :overlays, :color, :string
  end
end
