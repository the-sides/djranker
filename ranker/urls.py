from django.urls import path
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from . import views

# URLS used once a DJ session has been joined
urlpatterns = [
    path('list/',views.sessionlist),
    path('list/callback/?code=<accessCode>&state=<state>',views.authorizesession)
]
urlpatterns += staticfiles_urlpatterns()