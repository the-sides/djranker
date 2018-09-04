from django.urls import path
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from . import views

# URLS used once a DJ session has been joined
urlpatterns = [
    path('list/<str:sid>',views.sessionlist),
    path('list/',views.authorizesession)
]
urlpatterns += staticfiles_urlpatterns()