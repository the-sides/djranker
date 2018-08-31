from django.shortcuts import render
from django.http import HttpResponse
from django.http import JsonResponse
import json

from ranker.models import *

def homepage(request):
    return render(request,'homepage.html')


def ajax_new_session(request):
    response_data = {'result':False}
    print("started", request.method)
    if request.method == 'POST':

        try:
            sesh = session()
            print("sesh made")
            ajax_data = json.loads(request.POST.get('data')) # json.loads allow data to be a stringified json
            # ajax_data = request.POST.get('data')
            print("ajax data", ajax_data['sid'])
            sesh.sid = ajax_data['sid']
            sesh.name = ajax_data['pname']
            # sesh.token = ajax_data['token']
            # sesh.playlist_uri = ajax_data['PURI']

            sesh.save()
            response_data['result'] = True

            # Validator
            status = session.objects.get(id=0)
            print(status.name)
            print(response_data)

        except Exception as error: print(error)
    return JsonResponse(response_data, safe=False)