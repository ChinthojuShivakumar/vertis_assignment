


from django.urls import path
from . import views

urlpatterns = [
    # path('testdbconnection/', views.test_db_connection, name='test_db_connection'),
    path('adduser/', views.add_user, name='add_user'),
    path('getuserdetails/', views.get_user_details, name='get_user_details'),
    path('login/', views.login, name='login'),

      path('createblog/', views.create_blog, name='create_blog'),
      path('getblogs/', views.get_blogs, name='get_blogs'),
      path('updateblog/', views.update_blog, name='update_blog'),
      path('deleteblog/', views.delete_blog, name='delete_blog'),


      path('createcontact/', views.create_contact, name='create_contact'),
      path('getcontacts/', views.get_contacts, name='get_contacts'),
      path('deletecontact/', views.delete_contact, name='delete_contact'),
      path('updatecontactstatus/', views.update_contact_status, name='update_contact_status'),


      path('createorupdateabout/', views.create_or_update_about, name='create_or_update_about'),
      path('getabout/', views.get_about, name='get_about'),


      path('getdashboard/', views.get_dashboard, name='get_dashboard'),

      path('createservice/', views.create_service, name='create_service'),
      path('getservices/', views.get_services, name='get_services'),
      path('updateservice/', views.update_service, name='update_service'),
      path('deleteservice/', views.delete_service, name='delete_service'),


      path('sendcontactreply/', views.send_contact_reply, name='send_contact_reply'),

]