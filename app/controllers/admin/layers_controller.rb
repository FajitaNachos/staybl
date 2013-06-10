class Admin::LayersController < Admin::BaseController
  # GET /admin/layers
  # GET /admin/layers.json
  def index
    @admin_layers = Admin::Layer.all

    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @admin_layers }
    end
  end

  # GET /admin/layers/1
  # GET /admin/layers/1.json
  def show
    @admin_layer = Admin::Layer.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @admin_layer }
    end
  end

  # GET /admin/layers/new
  # GET /admin/layers/new.json
  def new
    @admin_layer = Admin::Layer.new

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @admin_layer }
    end
  end

  # GET /admin/layers/1/edit
  def edit
    @admin_layer = Admin::Layer.find(params[:id])
  end

  # POST /admin/layers
  # POST /admin/layers.json
  def create
    @admin_layer = Admin::Layer.new(params[:admin_layer])

    respond_to do |format|
      if @admin_layer.save
        format.html { redirect_to @admin_layer, notice: 'Layer was successfully created.' }
        format.json { render json: @admin_layer, status: :created, location: @admin_layer }
      else
        format.html { render action: "new" }
        format.json { render json: @admin_layer.errors, status: :unprocessable_entity }
      end
    end
  end

  # PUT /admin/layers/1
  # PUT /admin/layers/1.json
  def update
    @admin_layer = Admin::Layer.find(params[:id])

    respond_to do |format|
      if @admin_layer.update_attributes(params[:admin_layer])
        format.html { redirect_to @admin_layer, notice: 'Layer was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: "edit" }
        format.json { render json: @admin_layer.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /admin/layers/1
  # DELETE /admin/layers/1.json
  def destroy
    @admin_layer = Admin::Layer.find(params[:id])
    @admin_layer.destroy

    respond_to do |format|
      format.html { redirect_to admin_layers_url }
      format.json { head :no_content }
    end
  end
end
