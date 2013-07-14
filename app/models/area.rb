class Area < ActiveRecord::Base
  acts_as_voteable
  attr_accessible :name, :the_geom, :description, :city
  
end