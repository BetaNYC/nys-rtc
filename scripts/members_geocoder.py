import os
import pyairtable
import requests
from requests.structures import CaseInsensitiveDict
import json
from time import sleep
import pandas as pd
import pickle
from pathlib import Path
import geopandas as gpd
from shapely.geometry import Point
from types import NoneType
import numpy as np
import urllib.parse

def find_district(point, geojson_file, key):
    """
    Finds the district value for a given point within a GeoJSON file.

    Parameters:
    - point: A GeoDataFrame representing the point to find the district for.
    - geojson_file: The path to the GeoJSON file containing the district polygons.
    - key: The column name in the GeoDataFrame that contains the district values.

    Returns:
    - The district value if the point is within a polygon, otherwise None.
    """
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

def find_geographical_info(lat, lon, senate_geojson, senate_key, assembly_geojson, assembly_key, counties_geojson, county_key, zipcode_geojson, zipcode_key):
    """
    Finds geographical information (such as zip code, assembly district, senate district, and county) based on latitude and longitude coordinates.

    Parameters:
    - lat (float): Latitude coordinate of the location.
    - lon (float): Longitude coordinate of the location.
    - senate_geojson (str): Filepath to the GeoJSON file containing senate district boundaries.
    - senate_key (str): Key to identify the senate district in the GeoJSON file.
    - assembly_geojson (str): Filepath to the GeoJSON file containing assembly district boundaries.
    - assembly_key (str): Key to identify the assembly district in the GeoJSON file.
    - counties_geojson (str): Filepath to the GeoJSON file containing county boundaries.
    - county_key (str): Key to identify the county in the GeoJSON file.
    - zipcode_geojson (str): Filepath to the GeoJSON file containing zip code boundaries.
    - zipcode_key (str): Key to identify the zip code in the GeoJSON file.

    Returns:
    - result (dict): A dictionary containing the following geographical information:
        - 'Zip_Code': The zip code of the location.
        - 'Assembly_District': The assembly district of the location.
        - 'Senate_District': The senate district of the location.
        - 'County': The county of the location.
    """
    
    # Initialize the result dictionary
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

    # Find the Senate District
    result['Senate_District'] = find_district(point, senate_geojson, senate_key)

    # Find the Assembly District
    result['Assembly_District'] = find_district(point, assembly_geojson, assembly_key)

    # Find the County
    result['County'] = find_district(point, counties_geojson, county_key)

    # Find the Zip Code
    result['Zip_Code'] = find_district(point, zipcode_geojson, zipcode_key)

    return result

class NpEncoder(json.JSONEncoder):
    """
    Custom JSON encoder that handles encoding of NumPy types.

    This encoder is used to handle encoding of NumPy types (such as np.integer, np.floating, and np.ndarray)
    when converting Python objects to JSON format.

    It extends the json.JSONEncoder class and overrides the default() method to provide custom encoding logic.

    Usage:
    encoder = NpEncoder()
    encoded_data = encoder.encode(data)

    """

    def default(self, obj):
        if isinstance(obj, np.integer):
            return int(obj)
        if isinstance(obj, np.floating):
            return float(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return super(NpEncoder, self).default(obj)

def convert_types(entry):
    if isinstance(entry, np.integer):
        entry = int(entry)
    if isinstance(entry, np.floating):
        entry = float(entry)
    if isinstance(entry, np.ndarray):
        entry = entry.tolist()
    if isinstance(entry, list):
        entry = str(entry)
    return entry

def generate_members_info(AIRTABLE_API_KEY, AIRTABLE_APP_KEY, AIRTABLE_TBL_KEY, GEOAPIFY_API_KEY):
    """
    Generate members' information by geocoding their addresses.

    Args:
        AIRTABLE_API_KEY (str): The API key for accessing the Airtable API.
        AIRTABLE_APP_KEY (str): The Airtable application key.
        AIRTABLE_TBL_KEY (str): The Airtable table key.
        GEOAPIFY_API_KEY (str): The API key for accessing the Geoapify API.

    Returns:
        None
    """

    MEMBERS_INFO = AIRTABLE_API_KEY
    GEOCODER_KEY = GEOAPIFY_API_KEY

    api = pyairtable.Api(MEMBERS_INFO)

    table = api.table(AIRTABLE_APP_KEY, AIRTABLE_TBL_KEY)

    members = table.all()

    members_list = [x['fields'] for x in members]

    path = Path("public")

    if os.path.isfile(path / "airtable.pkl"):
        with open(path / "airtable.pkl", 'rb') as f:
            old_members_list = pickle.load(f)

    else:
        old_members_list = []

    if (old_members_list != members_list):
        if os.path.isfile(path / "address_cache.csv"):
            address_cache = pd.read_csv(path / "address_cache.csv")

        else:
            address_cache = pd.DataFrame(columns=['address_code', 'lat', 'lon', 'Senate_District', 'Assembly_District', 'County', 'Zip_Code'])

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
        
        airtable_members = members_list.copy()

        for member in members_list:
            if 'Address' not in member or not member['Address'] or member['Address']=='':
                print(f"{member['Name']} has no address value on Airtable")
                nongeocoded_members = pd.concat([nongeocoded_members,pd.DataFrame([member])], ignore_index=True)
                continue

            print(f"Address:{member['Address']}")

            address_code = member['Address'].lower()

            address_code = urllib.parse.quote(address_code)

            cached_data = address_cache[address_cache['address_code'] == address_code]

            if not cached_data.empty:
                # If the address is in the cache, use the cached latitude and longitude
                if  !(np.isnan(cached_data.iloc[0]['lat'])):
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
                    
                    result = member.copy()
                    result['address_code'] = address_code

                    if couldGeocode:
                        print(f"Lat: {result['lat']} | Lon: {result['lon']} | Senate_District: {result['Senate_District']} | Assembly_District: {result['Assembly_District']} | County: {result['County']} |  Zip_Code: {result['Zip_Code']}")

                    address_cache = pd.concat([address_cache, pd.DataFrame([result])], ignore_index=True)

                else:
                    print(f"Error loading page")
                # count = count + 1

        # Create a DataFrame from the list
        df = pd.DataFrame(members_list)

        # Create geometry column using 'lat' and 'lon'
        df['geometry'] = [Point(lon, lat) for lon, lat in zip(df['lon'], df['lat'])]

        # Convert DataFrame to GeoDataFrame
        gdf = gpd.GeoDataFrame(df, geometry='geometry')

        # Exclude 'lat' and 'lon' from the properties
        gdf = gdf.drop(columns=['lat', 'lon'])

        gdf = gdf.applymap(convert_types)

        # Export to GeoJSON
        gdf.to_file(path / 'rtc_members.geo.json', driver='GeoJSON')

        address_cache[['address_code','lat', 'lon', 'Senate_District', 'Assembly_District', 'County', 'Zip_Code', 'Website', 'Name', 'Legislation', 'Phone', 'Address', 'Membership Status']].dropna(axis=1, how='all').to_csv(path / "address_cache.csv")

        nongeocoded_members.to_csv(path / "nongeocoded_members.csv")

        with open(path / "airtable.pkl", 'wb') as f:
            pickle.dump(airtable_members, f)

if __name__ == '__main__':
    MEMBERS_INFO = os.environ['MEMBERS_INFO']
    GEOCODER_KEY = os.environ['GEOCODER_KEY']
    generate_members_info(MEMBERS_INFO, 'appsZsPVQ4n7ujxSJ', 'tblvVPeXE15ZbA68T', GEOCODER_KEY)
