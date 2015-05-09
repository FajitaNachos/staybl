xml.instruct!
xml.urlset('xmlns'.to_sym => "http://www.sitemaps.org/schemas/sitemap/0.9") do
  @static_pages.each do |page|
    xml.url do
      xml.loc "#{page}"
      xml.changefreq("monthly")
    end
  end
  @areas.each do |area|
    xml.url do
      xml.loc "#{area_url(area)}"
      xml.changefreq("weekly")
    end
  end
end
