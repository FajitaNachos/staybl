class Admin::AreasController < Admin::BaseController
  # GET /admin/areas
  # GET /admin/areas.json
  
  def index
    @updated_areas = Area.where("updated_at > ? and created_at < ?", 1.day.ago, 1.day.ago)
    @new_areas = Area.where("created_at > ?", 1.day.ago)
    
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
    @city = params[:city]
    @state = params[:state]
    @id = params[:id]
  end

  # POST /admin/areas
  # POST /admin/areas.json
  def create
    @admin_area = Area.new(params[:admin_area])

    respond_to do |format|
      if @admin_area.save
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
       if @admin_area.update(:description => params[:area][:description], :the_geom => params[:area][:the_geom])
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
end