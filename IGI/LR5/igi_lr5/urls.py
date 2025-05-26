from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, re_path
from django.contrib import admin

from museum import views
from museum.views import *

urlpatterns = [
    path('admin/', admin.site.urls),
    path('add_exhibit/', views.add_exhibit, name='add_exhibit'),
    re_path(r'^$', views.main_info, name='home'),
    re_path(r'^museum/$', views.museum, name='museum'),
    re_path(r'^exhibitions/$', views.exhibitions, name='exhibitions'),
    re_path(r'^about$', views.about_company, name='about'),
    re_path(r'^news/$', views.news_page, name='news'),
    re_path(r'^dictionary/$', views.dictionary_page, name='dictionary'),
    re_path(r'^add_question/$', views.AddQuestionView.as_view(), name='add_question'),
    re_path(r'^add_answer/(?P<pk>\d+)$', views.AddAnswerView.as_view(), name='add_answer'),
    re_path(r'^contacts/$', views.contacts_page, name='contacts'),
    re_path(r'^policy/$', views.privacy_policy_page, name='policy'),
    re_path(r'^vacancy/$', views.vacancies_page, name='vacancies'),
    re_path(r'^discounts/$', views.discounts_page, name='discounts'),
    re_path(r'^reviews/$', views.ReviewsView.as_view(), name='reviews'),
    re_path(r'^employee_positions/$', views.EmployeePositionsView.as_view(), name='employee_positions'),
    re_path(r'^add_position/$', views.AddEmployeePositionView.as_view(), name='add_employee_position'),
    re_path(r'^delete_position/(?P<pk>\d+)$', views.delete_employee_position, name='delete_employee_position'),
    re_path(r'^update_position/(?P<pk>\d+)$', views.update_employee_position, name='update_employee_position'),
    re_path(r'^add_vacancy/$', views.AddVacancyView.as_view(), name='add_vacancy'),
    re_path(r'^delete_vacancy/(?P<pk>\d+)$', views.delete_vacancy, name='delete_vacancy'),
    re_path(r'^update_vacancy/(?P<pk>\d+)$', views.update_vacancy, name='update_vacancy'),

    re_path(r'^login/$', views.LoginView.as_view(), name='login'),
    re_path(r'^logout/$', views.LogoutView.as_view(), name='logout'),
    re_path(r'^register/$', views.ClientRegistrationView.as_view(), name='register'),
    re_path(r'^add_employee/$', views.EmployeeRegistrationView.as_view(), name='add_employee'),
    re_path(r'^delete_user/(?P<pk>\d+)$', views.delete_user, name='delete_user'),
    re_path(r'^edit_user/(?P<pk>\d+)$', views.edit_employee, name='edit_user'),
    re_path(r'^employees/$', views.EmployeesView.as_view(), name='employees'),
    re_path(r'^clients/$', views.ClientsView.as_view(), name='clients'),
    re_path(r'^employee_profile/$', views.ProfileEmployeeView.as_view(), name='employee_profile'),
    re_path(r'^client_profile/$', views.ProfileClientView.as_view(), name='client_profile'),
    re_path(r'^add_service_to_order/(?P<pk>\d+)$', views.AddExhibitionsView.as_view(), name='add_service_to_order'),
    re_path(r'^add_order/$', views.AddOrderView.as_view(), name='add_order'),
    re_path(r'^order_details/(?P<pk>\d+)$', views.OrderDetailView.as_view(), name='order_details'),
    re_path(r'^add_exhibition/$', views.AddExhibitionsTypeView.as_view(), name='add_exhibition'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
