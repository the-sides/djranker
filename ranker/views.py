from django.shortcuts import render
from django.http import HttpResponse
from django.http import JsonResponse
from django.views.decorators.http import require_POST, require_GET
import json

from ranker.models import *


# Create your views here.

def sessionlist(request,sid):
    # Query selection for sid
    sesh = session.objects.get(sid=sid)

    print(sesh.name)
    context = {}
    context['sid'] = sesh.sid
    context["puri"] = sesh.pid
    context["name"] = sesh.name
    # Token is requested upon call

    return render(request,'list.html',context)

@require_GET
def ajax_refresh_ranklist(request,sid):
    responce_data = {'result': False}
    if request.method == "GET":
        try:
           sesh = session()
           sesh = session.objects.get(sid=sid)

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
            # respoce_data['client_secret'] =    import from system variable
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
        except Exception as error: responce_data['result'] = error
    return JsonResponse(responce_data)
