import os
import pyairtable
import pandas as pd
import geopandas as gpd

LEGISLATIVE_SUPPORT = os.environ['LEGISLATIVE_SUPPORT']

api = pyairtable.Api(LEGISLATIVE_SUPPORT)

table = api.table('appD3YhFHjmqJKtZ6','tblgyOlrTfYRaodyb')

table_dict = table.all()

rows = []

for row in table_dict:
    rows.append(row['fields'])
df = pd.DataFrame(rows)
# Load GeoJSONs
gdf_assembly = gpd.read_file("public/NYS_Assembly_Districts.geojson").to_csr("EPSG:4326")
gdf_senate = gpd.read_file("public/NYS_Senate_Districts.geojson").rename(columns={'DISTRICT':'District'}).to_csr("EPSG:4326")

# Split your dataframe by house
df_assembly = df[df['House'] == 'Assembly']
df_senate = df[df['House'] == 'Senate']

# Merge DataFrames with GeoDataFrames
gdf_assembly = gdf_assembly.merge(df_assembly, on='District')
gdf_senate = gdf_senate.merge(df_senate, on='District')
gdf_assembly['Which HCMC legislation do they support?'] = gdf_assembly['Which HCMC legislation do they support?'].fillna('[]')
gdf_senate['Which HCMC legislation do they support?'] = gdf_senate['Which HCMC legislation do they support?'].fillna('[]')


gdf_assembly['Which HCMC legislation do they support?'] = gdf_assembly['Which HCMC legislation do they support?'].apply(lambda x: str(x))
gdf_senate['Which HCMC legislation do they support?'] = gdf_senate['Which HCMC legislation do they support?'].apply(lambda x: str(x))

gdf_senate = gdf_senate.rename(columns = {'Which HCMC legislation do they support?':'HCMC support'})
gdf_assembly = gdf_assembly.rename(columns = {'Which HCMC legislation do they support?':'HCMC support'})

# Export the new GeoJSONs
gdf_assembly.to_file('public/assembly.geo.json', driver='GeoJSON')
gdf_senate.to_file('public/senate.geo.json', driver='GeoJSON')