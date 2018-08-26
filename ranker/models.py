from django.db import models

# Create your models here.
class session(models.Model):
    sid = models.CharField(max_length=6)
    name = models.CharField(max_length=64)
    token = models.CharField(max_length=128)
    playlistURI = models.CharField(max_length=64)
    # track_list # Table for holding URIs, track names, artist, album img link, and VOTES


class track(models.Model):
    title = models.CharField(max_length=64)
    uri = models.CharField(max_length=32)
    artist = models.CharField(max_length=32)
    album_img = models.CharField(max_length=64)
