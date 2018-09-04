from django.shortcuts import render
from django.http import HttpResponse
from django.http import JsonResponse
import json

from django.shortcuts import render


# Create your views here.

def sessionlist(request,sid):
    context = {'sid':sid}
    return render(request,'list.html',context)

def authorizesession(request,accessCode,state):
    return render(request,'listapproved.html',accessCode,state)

