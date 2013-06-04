class ChangeAdminsToAdministrators < ActiveRecord::Migration
  def change
    rename_table :admins, :administrators
  end 
 
end
