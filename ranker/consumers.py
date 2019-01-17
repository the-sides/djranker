from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
import json
import pprint

from ranker.models import *

class RanklistConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.sid = self.scope['url_route']['kwargs']['ranklist_sid']
        self.client_name = self.scope['cookies']['sessionid']
        pp = pprint.PrettyPrinter(indent=4)
        pp.pprint(self.scope)
        print(" ====== Client Session Info ===== ")
        print(self.sid, self.client_name)
        # Connect to other client in ranklist
        await self.channel_layer.group_add(
            self.sid, 
            self.channel_name
        )

        # channel_layer = get_channel_layer()
        # ch_group_list = channel_layer.group_channels(self.sid)
        pp.pprint(self.channel_name)

        await self.accept()


    def disconnect(self, close_code):
        pass

    async def receive(self, text_data):
        # Seperate by votes and requests
        data = json.loads(text_data)
        req_type = data['type']
        print("Received",req_type)
        # if req_type == 'vote':
            # use modules to calculate new rank
        await self.channel_layer.group_send(
            self.sid,
            {
                "type":"group.message",
                "message": data['track']
            }
        )

    async def group_message(self, event):
        print("Vote_change FROM GROUP_MESSAGE!", self.client_name)
        await self.send(text_data=event['message'])
