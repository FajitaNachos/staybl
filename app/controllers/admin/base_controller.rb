class Admin::BaseController < ActionController::Base

  layout 'admin/application'
  protect_from_forgery
  before_filter :authenticate_administrator!

end
