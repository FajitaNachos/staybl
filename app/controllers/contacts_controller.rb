class ContactsController < ApplicationController
    
    def new
        @contact = Contact.new
        respond_to do |format|
            format.html { render layout: !request.xhr? } #renders naked html if ajax
        end
    end

    def create
        @contact = Contact.new(params[:contact])
        @contact.request = request

        respond_to do |format|
            if @contact.deliver
              format.html { redirect_to @contact, notice: 'Thank you for your message. We will get back to you soon.'}
              format.js 
              format.json { render json: @contact, status: :created, location: @contact }
            else
              format.html { render action: "new" }
              format.js
              format.json { render json: @contact.errors, status: :unprocessable_entity }
            end
        end

    end
end
