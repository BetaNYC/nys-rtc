import os
import pyairtable
import json

def generate_legislation_info(API_KEY, APP_KEY, TBL_KEY):
    """
    Generates legislation information and saves it to a JSON file.

    This function retrieves legislation information from an Airtable database,
    converts it to a list of dictionaries, and saves it to a JSON file for the front-end to access.

    Args:
        API_KEY (str): The API key for accessing the Airtable database.
        APP_KEY (str): The application key for accessing the Airtable database.
        TBL_KEY (str): The table key for accessing the specific table in the Airtable database.

    Returns:
        None
    """
    api = pyairtable.Api(API_KEY)
    table = api.table(APP_KEY, TBL_KEY)
    legislation = table.all()
    legislation_list = [x['fields'] for x in legislation]
    with open("public/legislations_info.json", "w") as outfile:
        json.dump(legislation_list, fp=outfile, indent=4)

if __name__ == '__main__':
    API_KEY = os.environ['LEGISLATION_INFO']
    generate_legislation_info(API_KEY, 'apps7I6q0g9Hyb6j9', 'tblydWhHOZeqjzycO')
