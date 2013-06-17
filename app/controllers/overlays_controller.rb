class OverlaysController < ApplicationController
  # GET overlays
  # GET overlays.json
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

end
