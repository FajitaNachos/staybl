class AreasController < ApplicationController
  before_filter :authenticate_user!, :except => [:fetch, :show]


  # GET /areas
  # GET /areas.json
  def index
    @areas = Area.all

    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @areas }
    end
  end

  def fetch
    @city = params[:city]
    @areas = Area.where("city = ?", params[:city]).plusminus_tally

    @primary_area = @areas.first
    @secondary_areas = @areas.drop(1)
    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @areas }
    end
  end

  def vote_up
    @area = Area.find(params[:id])
    begin
        current_user.voted_for?(@area) ? current_user.unvote_for(@area) : current_user.vote_exclusively_for(@area)
        render :partial => 'areas/votes',:layout => false, :locals => { :area => @area } , :status => 200
    rescue ActiveRecord::RecordInvalid
      render :partial => 'areas/votes', :layout => false, :locals => { :area => @area }, :status => 404
    end
  end


   def vote_down
    @area = Area.find(params[:id])
    begin
        current_user.voted_against?(@area) ? current_user.unvote_for(@area) : current_user.vote_exclusively_against(@area)
        render :partial => 'areas/votes',:layout => false, :locals => { :area => @area } , :status => 200
    rescue ActiveRecord::RecordInvalid
        render :partial => 'areas/votes', :layout => false, :locals => { :area => @area }, :status => 404
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
    @area = Area.new

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @area }
    end
  end

  # GET /areas/1/edit
  def edit
    @area = Area.find(params[:id])
  end

  # POST /areas
  # POST /areas

  def create
    @area = Area.new(:name => params[:area][:name], :description => params[:area][:description], :the_geom => params[:area][:the_geom], :city => params[:area][:city])

    respond_to do |format|
      if @area.save
        format.html { redirect_to @area, notice: 'Area was successfully created.' }
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
      if @area.update_attributes(:name => params[:area][:name], :description => params[:area][:description], :the_geom => params[:area][:the_geom], :city => params[:area][:city])
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
    @area = Area.find(params[:id])
    @area.destroy

    respond_to do |format|
      format.html { redirect_to areas_url }
      format.json { head :no_content }
    end
  end
end
