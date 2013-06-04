class Administrator < ActiveRecord::Base
  # Include default devise modules. Others available are:
  # :token_authenticatable, :confirmable, :rememberable, :recoverable,
  # :lockable, :timeoutable, :omniauthable, :registerable
  devise :database_authenticatable, :trackable, :validatable

  # Setup accessible (or protected) attributes for your model
  attr_accessible :username, :email, :password
  # attr_accessible :title, :body, :password_confirmation, :remember_me
end
