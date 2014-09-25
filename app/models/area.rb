class Area < ActiveRecord::Base
  acts_as_voteable
  validates :the_geom, presence: true

  def to_param
    [id, city, name.parameterize].join("-").downcase
  end

end