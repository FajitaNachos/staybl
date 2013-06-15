class Admin::OverlaysController < Admin::BaseController
  # GET /admin/overlays
  # GET /admin/overlays.json
  def index
    @overlays = Overlay.all

    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @overlays }
    end
  end

  def fetch
    bounds = params[:bounds]
    @fetch_overlays = Overlay.find_by_sql("select * from overlays
      where ST_INTERSECTS(coordinates,ST_GEOMFROMTEXT('#{bounds}',4326));")
    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @fetch_overlays }
    end

  end

  # GET /admin/overlays/1
  # GET /admin/overlays/1.json
  def show
    @overlay = Overlay.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @overlay }
    end
  end

  # GET /admin/overlays/new
  # GET /admin/overlays/new.json
  def new
    @overlay = Overlay.new

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @overlay }
    end
  end

  # GET /admin/overlays/1/edit
  def edit
    @overlay = Overlay.find(params[:id])
  end

  # POST /admin/overlays
  # POST /admin/overlays.json
  def create
    @overlay = Overlay.new(:name => params[:name], :short_desc => params[:short_desc], :coordinates => params[:coordinates], :color => params[:color])

    respond_to do |format|
      if @overlay.save
        format.html { redirect_to [:admin,@overlay], notice: 'Overlay was successfully created.' }
        format.json { render json: [:admin,@overlay], status: :created, location: [:admin,@overlay] }
      else
        format.html { render action: "new" }
        format.json { render json: @overlay.errors, status: :unprocessable_entity }
      end
    end
  end

  # PUT /admin/overlays/1
  # PUT /admin/overlays/1.json
  def update
    @overlay = Overlay.find(params[:id])

    respond_to do |format|
      if @overlay.update_attributes(:name => params[:name], :short_desc => params[:short_desc], :coordinates => params[:coordinates], :color => params[:color])
        format.html { redirect_to [:admin, @overlay], notice: 'Overlay was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: "edit" }
        format.json { render json: @overlay.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /admin/overlays/1
  # DELETE /admin/overlays/1.json
  def destroy
    @overlay = Overlay.find(params[:id])
    @overlay.destroy

    respond_to do |format|
      format.html { redirect_to [:admin, @overlay] }
      format.json { head :no_content }
    end
  end
end
