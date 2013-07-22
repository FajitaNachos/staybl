class Admin::AreasController < Admin::BaseController
  # GET /admin/areas
  # GET /admin/areas.json
  def index
    @admin_areas = Area.where("updated_at > ?", 1.day.ago)

    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @admin_areas }
    end
  end


  #student_controller.rb
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

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @admin_area }
    end
  end

  # GET /admin/areas/1/edit
  def edit
    @admin_area = Area.find(params[:id])
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
      if @admin_area.update_attributes(params[:admin_area])
        format.html { redirect_to @admin_area, notice: 'Area was successfully updated.' }
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