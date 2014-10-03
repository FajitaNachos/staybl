class ContactForm < MailForm::Base

  attributes :name,  :validate => true
  attributes :email, :validate => /\A([\w\.%\+\-]+)@([\w\-]+\.)+([\w]{2,})\z/i
  attributes :message
  attributes :nickname,   :captcha => true

  def headers
    {
      :subject => "Staybl Contact Form",
      :to => "staybl@fajitanachos.com",
      :from => %("#{name}" <#{email}>)
    }
  end

end