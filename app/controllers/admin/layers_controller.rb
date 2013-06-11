class Admin::LayersController < ApplicationController
  # GET /admin/layers
  # GET /admin/layers.json
  def index
    @layers = Layer.all

    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @layers }
    end
  end

  # GET /admin/layers/1
  # GET /admin/layers/1.json
  def show
    @layer = Layer.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @layer }
    end
  end

  # GET /admin/layers/new
  # GET /admin/layers/new.json
  def new
    @layer = Layer.new

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @layer }
    end
  end

  # GET /admin/layers/1/edit
  def edit
    @layer = Layer.find(params[:id])
  end

  # POST /admin/layers
  # POST /admin/layers.json
  def create
    @layer = Layer.new(params[:layer])

    respond_to do |format|
      if @layer.save
        format.html { redirect_to [:admin,@layer], notice: 'Layer was successfully created.' }
        format.json { render json: [:admin,@layer], status: :created, location: [:admin,@layer] }
      else
        format.html { render action: "new" }
        format.json { render json: @layer.errors, status: :unprocessable_entity }
      end
    end
  end

  # PUT /admin/layers/1
  # PUT /admin/layers/1.json
  def update
    @layer = Layer.find(params[:id])

    respond_to do |format|
      if @layer.update_attributes(params[:layer])
        format.html { redirect_to @layer, notice: 'Layer was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: "edit" }
        format.json { render json: @layer.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /admin/layers/1
  # DELETE /admin/layers/1.json
  def destroy
    @layer = Layer.find(params[:id])
    @layer.destroy

    respond_to do |format|
      format.html { redirect_to [:admin, @layer] }
      format.json { head :no_content }
    end
  end
end
