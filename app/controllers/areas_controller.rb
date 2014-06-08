class AreasController < ApplicationController
  before_action :authenticate_administrator!, :only => [:destroy]

  # GET /areas
  # GET /areas.json
  def index
    @city = params[:city]
    @state = params[:state]
    @areas = Area.plusminus_tally.where("city = ? AND state = ?", @city, @state).having("COUNT(votes.id) > 0")
    @area = @areas.first

    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @areas }
    end
  end

  def search
    if params[:pac].empty?
      redirect_to root_path, :alert => "Please enter a city"
    else
      @city = params[:city]
      @state = params[:state]
      @areas = Area.plusminus_tally.where("city = ? AND state = ?", @city, @state).having("COUNT(votes.id) > 0")
      @area = @areas.first
      if (@area.nil?)
        redirect_to areas_path( :state => @state, :city => @city)
      else
        redirect_to @area
      end
    end
  end

  def yelp_search_restaurants
    bounding_box = { sw_latitude: params[:bounding_box][0], sw_longitude: params[:bounding_box][1], ne_latitude: params[:bounding_box][2], ne_longitude: params[:bounding_box][3]}
    locale = { lang: 'en' }
    parameters = { term: 'restaurants', limit: 10 }
    render json: Yelp.client.search_by_bounding_box(bounding_box, parameters, locale)
  end

   def yelp_search_hotels
    bounding_box = { sw_latitude: params[:bounding_box][0], sw_longitude: params[:bounding_box][1], ne_latitude: params[:bounding_box][2], ne_longitude: params[:bounding_box][3]}
    locale = { lang: 'en' }
    parameters = { term: 'hotels', limit: 10 }
    render json: Yelp.client.search_by_bounding_box(bounding_box, parameters, locale)
  end

  def vote_up
    @area = Area.find(params[:id])
    begin
        current_or_guest_user.voted_for?(@area) ? current_or_guest_user.unvote_for(@area) : current_or_guest_user.vote_exclusively_for(@area)
        render :partial => 'areas/votes', :layout => false, :locals => { :area => @area, :primary => true}, :status => 200
    rescue ActiveRecord::RecordInvalid
        render :partial => 'areas/votes', :layout => false, :locals => { :area => @area, :primary => true}, :status => 404
    end
  end


   def vote_down
    @area = Area.find(params[:id])
    begin
        current_or_guest_user.voted_against?(@area) ? current_or_guest_user.unvote_for(@area) : current_or_guest_user.vote_exclusively_against(@area)
        render :partial => 'areas/votes',:layout => false, :locals => { :area => @area, :primary => true} , :status => 200
    rescue ActiveRecord::RecordInvalid
        render :partial => 'areas/votes', :layout => false, :locals => {:area => @area, :primary => true}, :status => 404
    end
  end

  # GET /areas/1
  # GET /areas/1.json
  def show

    @area = Area.find(params[:id])
    @city = @area.city
    @state = @area.state
    #@areas = Area.plusminus_tally.where.not(id: @area.id).where(:areas => {:city => @city, :state => @state}).having("COUNT(votes.id) > 0")
    
    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @area }
    end
  end

  def fetch
    @area = Area.find(params[:id])
    respond_to do |format|
      format.html # .html.erb
      format.json { render json: @area }
    end
  end

  # GET /areas/new
  # GET /areas/new.json
  def new
    @city = params[:city]
    @state = params[:state]
    @area = Area.new

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @area }
    end
  end

  # GET /areas/1/edit
  def edit
    @area = Area.find(params[:id])
    @city = @area.city
    @state = @area.state
   
    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @area }
    end
  end

  # POST /areas
  # POST /areas

  def create

      @area = Area.new(area_params)
      respond_to do |format|
        if @area.save
          current_or_guest_user.vote_for(@area)
          format.html { redirect_to area_path(@area), notice: 'Area was successfully added.' }
          format.json { render json: @area, status: :created, location: @area }
        else
          @city = @area.city
          @state = @area.state
          format.html { render action: "new" }
          format.json { render json: @area.errors, status: :unprocessable_entity }
        end
      end
  end


  # PUT /areas/1
  # PUT /areas/1.json
  def update
    @area = Area.find(params[:id])
    respond_to do |format|
      if @area.update(area_params)
        format.html { redirect_to area_path(@area.id), notice: 'Area was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: "edit" }
        format.json { render json: @area.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /areas/1
  # DELETE /areas/1.json
  def destroy
    @area = Area.find(area_params)
    @area.destroy

    respond_to do |format|
      format.html { redirect_to areas_url }
      format.json { head :no_content }
    end
  end


  def area_params
    params.require(:area).permit(:name, :the_geom, :description, :city, :state)
  end
end