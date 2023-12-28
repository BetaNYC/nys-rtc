import os
import pyairtable
import pandas as pd
import geopandas as gpd
import re

def generate_legislative_support_geojson(API_KEY, APP_KEY, TBL_KEY):
    """
    Generates GeoJSON files for New York State Assembly and Senate districts
    with legislative support data.

    The function retrieves data from an Airtable database using the pyairtable library,
    merges it with GeoJSON files for district boundaries, and exports the merged data
    as separate GeoJSON files for Assembly and Senate districts.

    Args:
        API_KEY (str): The API key for accessing the Airtable database.
        APP_KEY (str): The application key for accessing the Airtable database.
        TBL_KEY (str): The table key for accessing the Airtable database.

    Returns:
    None
    """

    # Initialize pyairtable API
    api = pyairtable.Api(API_KEY)

    # Get table from Airtable
    table = api.table(APP_KEY,TBL_KEY)

    # Retrieve all records from the table
    table_dict = table.all()

    # Extract fields from the records and create a DataFrame
    rows = []
    for row in table_dict:
        rows.append(row['fields'])
    df = pd.DataFrame(rows)

    # Load GeoJSONs for Assembly and Senate districts
    gdf_assembly = gpd.read_file("public/NYS_Assembly_Districts.geojson").to_crs("EPSG:4326")
    gdf_senate = gpd.read_file("public/NYS_Senate_Districts.geojson").rename(columns={'DISTRICT':'District'}).to_crs("EPSG:4326")

    # Split the DataFrame by house (Assembly and Senate)
    df_assembly = df[df['House'] == 'Assembly']
    df_senate = df[df['House'] == 'Senate']

    # Merge DataFrames with GeoDataFrames based on district
    gdf_assembly = gdf_assembly.merge(df_assembly, on='District')
    gdf_senate = gdf_senate.merge(df_senate, on='District')

    # Fill missing values in the 'Which HCMC legislation do they support?' column with empty lists
    gdf_assembly['Which HCMC legislation do they support?'] = gdf_assembly['Which HCMC legislation do they support?'].fillna('[]')
    gdf_senate['Which HCMC legislation do they support?'] = gdf_senate['Which HCMC legislation do they support?'].fillna('[]')

    # Convert the 'Which HCMC legislation do they support?' column to string type
    gdf_assembly['Which HCMC legislation do they support?'] = gdf_assembly['Which HCMC legislation do they support?'].apply(lambda x: str(x))
    gdf_senate['Which HCMC legislation do they support?'] = gdf_senate['Which HCMC legislation do they support?'].apply(lambda x: str(x))

    # Rename columns for clarity
    gdf_senate = gdf_senate.rename(columns = {'Which HCMC legislation do they support?':'HCMC support'})
    gdf_assembly = gdf_assembly.rename(columns = {'Which HCMC legislation do they support?':'HCMC support', 'Name_x':"NAME"})

    gdf_assembly['HCMC support'] = gdf_assembly['HCMC support'].apply(lambda x: re.sub(r'DEFEND RTC', 'Defend RTC', str(x)))
    gdf_senate['HCMC support'] = gdf_senate['HCMC support'].apply(lambda x: re.sub(r'DEFEND RTC', 'Defend RTC', str(x)))

    # Export the new GeoJSONs for Assembly and Senate districts
    gdf_assembly.to_file('public/assembly.geo.json', driver='GeoJSON')    
    gdf_senate.to_file('public/senate.geo.json', driver='GeoJSON')

if __name__ == '__main__':
    API_KEY = os.environ['LEGISLATIVE_SUPPORT']
    generate_legislative_support_geojson(API_KEY, 'appa1eUzR6s744OIz', 'tblNw4Yl324yvIyhE')
