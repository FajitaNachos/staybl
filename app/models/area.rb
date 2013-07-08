class Area < ActiveRecord::Base
  acts_as_voteable
  attr_accessible :name, :coordinates, :description, :city
  
end