class Admin::AreasController < Admin::BaseController
  # GET /admin/areas
  # GET /admin/areas.json
  
  def index
    @updated_areas = Area.where("updated_at > ? and created_at < ?", 1.day.ago, 1.day.ago)
    @new_areas = Area.where("created_at > ?", 1.day.ago)
    @areas = Area.all
    
    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @updated_areas }
    end
  end


 # GET admin/search
  def search
     @admin_area = Area.find(params[:id])
     redirect_to admin_area_path(@admin_area.id)
  end

  # GET /admin/areas/1
  # GET /admin/areas/1.json
  def show
    @admin_area = Area.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @admin_area }
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

  # GET /admin/areas/new
  # GET /admin/areas/new.json
  def new
    @admin_area = Area.new
    @city = params[:city]
    @state = params[:state]
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
      format.json { render json: @admin_area }
    end
  end

  # GET /admin/areas/1/edit
  def edit
    @admin_area = Area.find(params[:id])
    @admin_city = @admin_area.city
    @admin_state = @admin_area.state
    @id = params[:id]
  end

  # POST /admin/areas
  # POST /admin/areas.json
  def create
    @admin_area = Area.new(area_params)
    respond_to do |format|
      if @admin_area.save
        current_administrator.vote_for(@area)
        format.html { redirect_to @admin_area, notice: 'Area was successfully created.' }
        format.json { render json: @admin_area, status: :created, location: @admin_area }
      else
        format.html { render action: "new" }
        format.json { render json: @admin_area.errors, status: :unprocessable_entity }
      end
    end
  end

  # PUT /admin/areas/1
  # PUT /admin/areas/1.json
  def update
    @admin_area = Area.find(params[:id])
    respond_to do |format|
       if @admin_area.update(area_params)
        format.html { redirect_to [:admin, @admin_area], notice: 'Area was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: "edit" }
        format.json { render json: @admin_area.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /admin/areas/1
  # DELETE /admin/areas/1.json
  def destroy
    @admin_area = Area.find(params[:id])
    @admin_area.destroy

    respond_to do |format|
      format.html { redirect_to admin_areas_url }
      format.json { head :no_content }
    end
  end

  def area_params
    params.require(:area).permit(:name, :the_geom, :description, :city, :state)
  end

end