from django.shortcuts import render

# Create your views here.

def sessionlist(request):
    return render(request,'list.html')

def authorizesession(request,accessCode,state):
    return render(request,'listapproved.html',accessCode,state)