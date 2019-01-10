from django.urls import path
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from . import views

# URLS used once a DJ session has been joined
urlpatterns = [
    path('list/<str:sid>',views.sessionlist),
    path('list/ajax_refresh_ranklist/<str:sid>',views.ajax_refresh_ranklist),
    path('list/ajax_get_token/<str:sid>',views.ajax_get_token),
    path('list/ajax_post_token/<str:sid>',views.ajax_post_token),
    path('list/ajax_post_track/', views.ajax_post_track),
    path('list/ajax_vote/', views.ajax_vote),

]
urlpatterns += staticfiles_urlpatterns()