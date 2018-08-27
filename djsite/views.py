from django.shortcuts import render

def homepage(request):
    return render(request,'homepage.html')


def ajax_new_session(request):
    response_data = {'result':False}
    if request.method == 'POST':

        try:
            sesh = session()
            ajax_data = json.loads(request.POST.get('data')) # json.loads allow data to be a stringified json
            sesh.sid = ajax_data['sid']
            sesh.name = ajax_data['pname']
            sesh.token = ajax_data['token']
            sesh.playlist_uri = ajax_data['PURI']

            sesh.save()
            response_data['result'] = True

            # Validator
            status = session.objects.get(id=0)
            print(status.name)

        except Exception as error: response_data['error'] = error
            
    return HttpResponse(json.dumps(response_data), content_type='application/json')