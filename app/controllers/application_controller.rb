class ApplicationController < ActionController::Base
  protect_from_forgery

  before_filter :set_page # at the top and then

  def after_sign_in_path_for(resource)
    #session[:return_to]
  end

  def index
  end

  protected
  def set_page
    #unless request.referer.include?(user_session_path || destroy_user_session_path)
      #session[:return_to] = request.referrer
    #end
  end
  
end
