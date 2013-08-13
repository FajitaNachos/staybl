class AreasController < ApplicationController
  before_action :authenticate_user!, :except => [:index, :show, :search]

  # GET /areas
  # GET /areas.json
  def index
    @city = params[:city]
    @state = params[:state]
    @areas = Area.plusminus_tally.where("city = ? AND state = ?", @city, @state).having("COUNT(votes.id) > 0")
    @area = @areas.first
    @areas = @areas.drop(1)
    
    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @areas }
    end
  end

  def search
    if params[:city].empty?
      redirect_to root_path, :alert => "Please enter a city"
    else
      @area = Area.where("city ILIKE ?", "%#{params[:city]}%").first
      if @area.nil?
      redirect_to root_path, :alert => "Please make sure you have Javascript enabled and try your search again"
      else
      redirect_to areas_path(@area.state, @area.city)
      end
    end
  end

  def vote_up
    @area = Area.find(params[:id])
    begin
        current_user.voted_for?(@area) ? current_user.unvote_for(@area) : current_user.vote_exclusively_for(@area)
        render :partial => 'areas/tally', :layout => false, :locals => { :area => @area}, :status => 200
    rescue ActiveRecord::RecordInvalid
        render :partial => 'areas/tally', :layout => false, :locals => { :area => @area}, :status => 404
    end
  end


   def vote_down
    @area = Area.find(params[:id])
    begin
        current_user.voted_against?(@area) ? current_user.unvote_for(@area) : current_user.vote_exclusively_against(@area)
        render :partial => 'areas/tally',:layout => false, :locals => { :area => @area} , :status => 200
    rescue ActiveRecord::RecordInvalid
        render :partial => 'areas/tally', :layout => false, :locals => {:area => @area}, :status => 404
    end
  end

  # GET /areas/1
  # GET /areas/1.json
  def show

    @area = Area.find(params[:id])
    respond_to do |format|
      format.html # show.html.erb
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
    @city = params[:city]
    @state = params[:state]
    @id = params[:id]

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
          current_user.vote_for(@area)
          format.html { redirect_to areas_path, notice: 'Area was successfully added.' }
          format.json { render json: @area, status: :created, location: @area }
        else
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
        format.html { redirect_to @area, notice: 'Area was successfully updated.' }
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