Rails.application.routes.draw do
  root "pages#home"

  get "/work",              to: "pages#work",          as: :work
  get "/work/booking-club", to: "pages#booking_club",  as: :work_booking_club
  get "/work/safemoov",          to: "pages#safemoov",            as: :work_safemoov
  get "/work/personal-portfolio", to: "pages#personal_portfolio", as: :work_personal_portfolio
  get "/about",   to: "pages#about",   as: :about
  get "/contact", to: "pages#contact", as: :contact

  get "up" => "rails/health#show", as: :rails_health_check
end
