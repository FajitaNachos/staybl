class Overlay < ActiveRecord::Base
 
  attr_accessible :name, :coordinates, :short_desc, :tags, :color
  
end