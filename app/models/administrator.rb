class Administrator < ActiveRecord::Base
  # Include default devise modules. Others available are:
  # :token_authenticatable, :confirmable, :rememberable, :recoverable,
  # :lockable, :timeoutable, :omniauthable, :registerable
  devise :database_authenticatable, :trackable, :validatable

end
