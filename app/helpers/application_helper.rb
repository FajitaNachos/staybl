module ApplicationHelper

  # Returns the full title on a per-page basis.
  def full_title(page_title)
    base_title = "Staybl | Find the best area to stay"
    if page_title.empty?
      base_title
    else
      "Staybl | #{page_title}"
    end
  end
end