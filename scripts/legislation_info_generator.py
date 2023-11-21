import os
import pyairtable
import json
api = pyairtable.Api('patt3j0eKCfgvGLAl.b6233ad81bd1d9e1655704868e6fd8a6736d3f9d73f0e7b82a9210136ab0083b')
table = api.table('apps7I6q0g9Hyb6j9','tblydWhHOZeqjzycO')
legislation = table.all()
legislation_list = [x['fields'] for x in legislation]
with open(r"..\public\legislations_info.json", "w") as outfile: 
    json.dump(legislation_list, fp = outfile,indent = 4)