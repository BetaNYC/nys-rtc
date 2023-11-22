import os
import pyairtable
import requests
import PyPDF2
import requests
from requests.structures import CaseInsensitiveDict
import re
import json
from time import sleep
import pandas as pd
import pickle
from pathlib import Path
import geopandas as gpd
from shapely.geometry import Point
from types import NoneType
import numpy as np

MEMBERS_INFO = os.environ['MEMBERS_INFO']
GEOCODER_KEY = os.environ['GEOCODER_KEY']

api = pyairtable.Api(MEMBERS_INFO)

table = api.table('appsZsPVQ4n7ujxSJ','tblvVPeXE15ZbA68T')

members = table.all(view='viwn6b1qQHxfxvTXX')

members_list = [x['fields'] for x in members]

path = Path("public")

if os.path.isfile(path / "airtable.pkl"):
    with open(path / "airtable.pkl", 'rb') as f:
        old_members_list = pickle.load(f)

else:
    old_members_list = []

if (old_members_list != members_list):


    #Then run all cells below also within the if statement
    replace_dict = {'\s':'%20', ',':'%2C','#':'%23'}

    if os.path.isfile(path / "address_cache.csv"):
        address_cache = pd.read_csv(path / "address_cache.csv")

    else:
        address_cache = pd.DataFrame(columns=['address_code', 'lat', 'lon', 'Senate_District', 'Assembly_District', 'County', 'Zip_Code'])

    if os.path.isfile(path / "nongeocoded_members.csv"):
        nongeocoded_members = pd.read_csv(path / "nongeocoded_members.csv")

    else:
        nongeocoded_members = pd.DataFrame(columns=['Website', 'Name', 'Legislation', 'Address', 'Membership Status', 'lat', 'lon', 'Phone'])
        
    #count = 0

    senate_geojson = "public/NYS_Senate_Districts.geojson"
    assembly_geojson = "public/NYS_Assembly_Districts.geojson"
    counties_geojson = "public/nys_counties.geo.json"
    zipcode_geojson = "public/nys_zipcodes.geo.json"

    senate_key = 'DISTRICT'
    assembly_key = 'District'
    county_key = 'name'
    zipcode_key = 'ZCTA5CE10'

    def find_geographical_info(lat, lon, senate_geojson, senate_key, assembly_geojson, assembly_key, counties_geojson, county_key, zipcode_geojson, zipcode_key):
        result = {
            'Zip_Code': '',
            'Assembly_District': '',
            'Senate_District': '',
            'County': ''
        }

        # Create a GeoDataFrame for the point
        if ((isinstance(lat, NoneType)) or (isinstance(lon, NoneType))):
            return result

        point = gpd.GeoDataFrame([{'geometry': Point(lon, lat)}], crs="EPSG:4326")

        # Initialize the result dictionary


        # Function to find the district or area from a geojson file
        def find_district(geojson_file, key):
            # Load the GeoJSON file into a GeoDataFrame
            gdf = gpd.read_file(geojson_file)
            # Ensure the GeoDataFrame and the point have the same CRS
            gdf = gdf.to_crs(point.crs)
            # Perform spatial join with the point to find the district
            joined = gpd.sjoin(point, gdf, how='left', predicate='within')
            # Extract the district value if the point is within a polygon
            if not joined.empty and key in joined.columns:
                return joined.iloc[0][key]
            return None

        # Find the Senate District
        result['Senate_District'] = find_district(senate_geojson, senate_key)

        # Find the Assembly District
        result['Assembly_District'] = find_district(assembly_geojson, assembly_key)

        # Find the County
        result['County'] = find_district(counties_geojson, county_key)

        # Find the Zip Code
        result['Zip_Code'] = find_district(zipcode_geojson, zipcode_key)

        return result
    
    airtable_members = members_list.copy()

    for member in members_list:
        print(f"Address:{member['Address']}")

        # if (count%5==0):
        #     sleep(1)

        address_code = member['Address'].lower()

        if re.search(r'\b\d\S*\s+floor\b', address_code, re.IGNORECASE):
            # If the pattern is found, replace it with an empty string
            address_code = re.sub(r'\b\d\S*\s+floor\b', '', address_code, flags=re.IGNORECASE)

        for replace_value in replace_dict:
            address_code = re.sub(replace_value, replace_dict[replace_value], address_code)

        cached_data = address_cache[address_cache['address_code'] == address_code]

        if not cached_data.empty:
            # If the address is in the cache, use the cached latitude and longitude
            if cached_data.iloc[0]['lat'] != None and cached_data.iloc[0]['lon'] != None:
                member['lat'] = cached_data.iloc[0]['lat']
                member['lon'] = cached_data.iloc[0]['lon']  # Assuming 'long' is the column name
                member['Senate_District'] = cached_data.iloc[0]['Senate_District']
                member['Assembly_District'] = cached_data.iloc[0]['Assembly_District']
                member['County'] = cached_data.iloc[0]['County']
                member['Zip_Code'] = cached_data.iloc[0]['Zip_Code']
                print(f"Lat: {member['lat']} | Lon: {member['lon']} | Senate_District: {member['Senate_District']} | Assembly_District: {member['Assembly_District']} | County: {member['County']} |  Zip_Code: {member['Zip_Code']} (cached)")

            else:
                member['lat'] = None
                member['lon'] = None
                member['Senate_District'] = None
                member['Assembly_District'] = None
                member['County'] = None
                member['Zip_Code'] = None
                nongeocoded_members = pd.concat([nongeocoded_members,pd.Dataframe([member])], ignore_index=True)
                print(f"Could not geocode address (cached)")
        
        else: 
            #member['address_code'] = address_code
            url = f'https://api.geoapify.com/v1/geocode/search?text={address_code}&lang=en&limit=1&type=amenity&format=json&apiKey={GEOCODER_KEY}'
            headers = CaseInsensitiveDict()
            headers["Accept"] = "application/json"

            resp = requests.get(url, headers=headers)

            couldGeocode = False

            if (resp.status_code==200):
                res = json.loads(resp.text)
                try:
                    member['lat'] = res['results'][0]['lat']
                    member['lon'] = res['results'][0]['lon']
                    couldGeocode = True

                except:
                    member['lat'] = None
                    member['lon'] = None
                    nongeocoded_members = pd.concat([nongeocoded_members,pd.DataFrame([member])], ignore_index=True)
                    print(f"Could not geocode address")

                member.update(find_geographical_info(member['lat'], member['lon'], senate_geojson, senate_key, assembly_geojson, assembly_key, counties_geojson, county_key, zipcode_geojson, zipcode_key))
                
                result = member
                result['address_code'] = address_code

                if couldGeocode:
                    print(f"Lat: {result['lat']} | Lon: {result['lon']} | Senate_District: {result['Senate_District']} | Assembly_District: {result['Assembly_District']} | County: {result['County']} |  Zip_Code: {result['Zip_Code']}")

                address_cache = pd.concat([address_cache, pd.DataFrame([result])], ignore_index=True)

            else:
                print(f"Error loading page")
            # count = count + 1


    class NpEncoder(json.JSONEncoder):
        def default(self, obj):
            if isinstance(obj, np.integer):
                return int(obj)
            if isinstance(obj, np.floating):
                return float(obj)
            if isinstance(obj, np.ndarray):
                return obj.tolist()
            return super(NpEncoder, self).default(obj)

    with open(path / "rtc_members_info.json", 'w') as fout:
        json.dump(members_list, fout, cls=NpEncoder)

    address_cache.dropna(axis=1, how='all').to_csv(path / "address_cache.csv")

    nongeocoded_members.to_csv(path / "nongeocoded_members.csv")

    with open(path / "airtable.pkl", 'wb') as f:
        pickle.dump(airtable_members, f)

        