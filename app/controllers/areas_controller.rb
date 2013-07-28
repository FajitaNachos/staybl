class AreasController < ApplicationController
  before_filter :authenticate_user!, :except => [:index, :show]

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
    @area = Area.where("city ILIKE ?", "%#{params[:place]}%").first
    redirect_to areas_path(@area.state, @area.city)
  end

  def vote_up
    @area = Area.find(params[:id])
    begin
        current_user.voted_for?(@area) ? current_user.unvote_for(@area) : current_user.vote_exclusively_for(@area)
        render :partial => 'areas/votes', :layout => false, :locals => { :area => @area, :primary => true }, :status => 200
    rescue ActiveRecord::RecordInvalid
        render :partial => 'areas/votes', :layout => false, :locals => { :area => @area, :primary => true }, :status => 404
    end
  end


   def vote_down
    @area = Area.find(params[:id])
    begin
        current_user.voted_against?(@area) ? current_user.unvote_for(@area) : current_user.vote_exclusively_against(@area)
        render :partial => 'areas/votes',:layout => false, :locals => { :area => @area, :primary => true } , :status => 200
    rescue ActiveRecord::RecordInvalid
        render :partial => 'areas/votes', :layout => false, :locals => { :area => @area, :primary => true }, :status => 404
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
    list = Area.tally.where("city = ?", @city).order("name ASC").having("COUNT(votes.id) = 0")
    if list.any?
      @select_list =[]
      list.each do |area|
        @select_list.push([area.name, area.id])
      end
      @select_list.push(['- Other -', -1])
    end

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
    @existing_area = Area.find(params[:area][:id])
    if @existing_area
     
      respond_to do |format|
        if @existing_area.update(:description => params[:area][:description], :the_geom => params[:area][:the_geom], :city => params[:area][:city])
          current_user.vote_for(@existing_area)
          format.html { redirect_to areas_path(@existing_area.state, @existing_area.city), notice: 'Area was successfully added.' }
          format.json { head :no_content }
        else
          format.html { render action: "new" }
          format.json { render json: @area.errors, status: :unprocessable_entity }
        end
      end 
    else

    end

    rescue ActiveRecord::RecordNotFound
      @area = Area.new(:name => params[:area][:name], :description => params[:area][:description], :the_geom => params[:area][:the_geom], :city => params[:area][:city])
      respond_to do |format|
        if @area.save
          format.html { redirect_to @area, notice: 'Area was successfully added.' }
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
      if @area.update(:the_geom => params[:area][:the_geom])
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