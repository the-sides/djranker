from django.shortcuts import render
from django.http import HttpResponse
from django.http import JsonResponse
from django.views.decorators.http import require_POST, require_GET
from django.core import serializers
import json

from ranker.models import *


# Create your views here.

def sessionlist(request,sid):
    # Query selection for sid
    sesh = session.objects.get(sid=sid)

    print(sesh.name)
    context = {}
    context['sid'] = sesh.sid
    context["pid"] = sesh.pid
    context["name"] = sesh.name
    # Token is requested upon call

    return render(request,'list.html',context)

@require_GET
def ajax_refresh_ranklist(request,sid):
    responce_data = {'result': False}
    if request.method == "GET":
        try:
            # song_requests = track()
            # song_requests = track.objects.get(session_id=sid)
            
            # Find out how to check if tracks exist first!
            sesh_tracks = track.objects.all().filter(session_id=sid)
            responce_data['song_requests'] = serializers.serialize("json",sesh_tracks)

            responce_data['result'] = True
        except Exception as error: responce_data['result'] = error
            
    return JsonResponse(responce_data)

@require_GET
def ajax_get_token(request,sid):
    responce_data = {'result': False}
    if request.method == "GET":
        try:
            sesh = session()
            sesh = session.objects.get(sid=sid)
            responce_data['token'] = sesh.token
            responce_data['result'] = True
            # responce_data['client_secret'] =    import from system variable

        except Exception as error: responce_data['result'] = error

    return JsonResponse(responce_data)

@require_POST
def ajax_post_token(request,sid):
    responce_data = {'result': False}
    if request.method == "POST":
        try:
            sesh = session()
            sesh = session.objects.get(sid=sid)
            sesh.token = request.POST.get('token')
            print("New token received", sesh.token)
            sesh.save()
            responce_data['result'] = True

        except Exception as error: responce_data['result'] = error

    return JsonResponse(responce_data)

@require_POST
def ajax_post_track(request,sid):
    responce_data = {'result': False}
    if request.method == "POST":
        try:
            print("=======================================")
            # Yes, quite similar to ../djsite/views ajax_new_track_load but
            #   I am not stringifying the json. Not sure if this is better
            #   and would love feedback if anyone reviews/compares the two.

            newTrack = track()
            newTrack.session_id = sid 
            newTrack.name = request.POST.get("name")
            newTrack.uri = request.POST.get("uri") 
            print("URI length of", newTrack.name, "n:", len(newTrack.uri))
            newTrack.artist = request.POST.get("artist")
            newTrack.album_img = request.POST.get("album_img")
            print(newTrack)

            newTrack.save()

            responce_data['result'] = True
        except Exception as error: print(error)

    return JsonResponse(responce_data, safe=False)
            
    
