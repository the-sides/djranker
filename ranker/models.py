from django.db import models

# Create your models here.
class session(models.Model):
    sid = models.CharField(max_length=6) # seperate from id, which is saved as session_id in track model
                                         # sid is used for link navigation and can be user specified
    name = models.CharField(max_length=64)
    token = models.CharField(max_length=128)
    playlist_uri = models.CharField(max_length=64)
    # track_list # Table for holding URIs, track names, artist, album img link, and VOTES
    # psych bitch, I'm using a db full of track models instead, each with a sid id.


class track(models.Model):
    session_id= models.IntegerField()
    title = models.CharField(max_length=64)
    uri = models.CharField(max_length=32)
    artist = models.CharField(max_length=32)
    album_img = models.CharField(max_length=64)
