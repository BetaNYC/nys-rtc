import os
import pyairtable
import json
LEGISLATION_INFO = os.environ['LEGISLATION_INFO']
api = pyairtable.Api(LEGISLATION_INFO)
table = api.table('apps7I6q0g9Hyb6j9','tblydWhHOZeqjzycO')
legislation = table.all()
legislation_list = [x['fields'] for x in legislation]
with open("public/legislations_info.json", "w") as outfile: 
    json.dump(legislation_list, fp = outfile,indent = 4)