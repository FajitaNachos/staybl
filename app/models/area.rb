class Area < ActiveRecord::Base
  acts_as_voteable
  validates :the_geom, presence: true
end