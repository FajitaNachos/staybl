module ApplicationHelper

  # Returns the full title on a per-page basis.
  def full_title(page_title)
    base_title = "Staybl | Find the best area to stay"
    if page_title.empty?
      base_title
    else
      "#{page_title}"
    end
  end

  def page_description(desc)
   	!desc.empty? ? "#{desc}" : "Staybl helps you find the best area to stay in any city."
	end
end