class AddApprovalToAreas < ActiveRecord::Migration
  def change
    add_column :areas, :approved, :boolean, :default => false
  end
end
