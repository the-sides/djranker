from django.shortcuts import render
from django.http import HttpResponse
from django.http import JsonResponse
from django.views.decorators.http import require_POST
import json

from ranker.models import *

def homepage(request):
    return render(request,'homepage.html')

@require_POST
def ajax_new_session(request):
    response_data = {'result':False}
    print("started", request.method)
    if request.method == 'POST':

        try:
            sesh = session()
            ajax_data = json.loads(request.POST.get('data')) # json.loads allow data to be a stringified json
            sesh.sid = ajax_data['sid']
            sesh.name = ajax_data['pname']
            sesh.token = ajax_data['token']
            sesh.pid = ajax_data['puri']

            sesh.save()
            response_data['result'] = True

            # Validator
            status = session.objects.get(sid=ajax_data['sid'])
            print(status.name)
            print(response_data)

        except Exception as error: print(error)
    return JsonResponse(response_data, safe=False)