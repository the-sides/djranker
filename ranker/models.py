from django.db import models

# Create your models here.
class session(models.Model):
    sid = models.CharField(max_length=6,default="123456") # seperate from id, which is saved as session_id in track model
                                         # sid is used for link navigation and can be user specified
    name = models.CharField(max_length=64,default="error: unnamed")
    token = models.CharField(max_length=207,default="no token")
    playlist_uri = models.CharField(max_length=22, default="bro idk")
    # track_list # Table for holding URIs, track names, artist, album img link, and VOTES
    # psych bitch, I'm using a db full of track models instead, each with a sid id.

    def __str__(self):
        return self.name

class track(models.Model):
    session_id= models.IntegerField(default="-1")
    title = models.CharField(max_length=64, default="Sandstorm")
    uri = models.CharField(max_length=32, default="spotify:no_track")
    artist = models.CharField(max_length=32, default="Darude")
    album_img = models.CharField(max_length=64, default="no album")
