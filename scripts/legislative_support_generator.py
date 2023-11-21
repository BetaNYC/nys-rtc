import os
import pyairtable
import pandas as pd
import geopandas as gpd

api = pyairtable.Api('pat9s45vy4ChkddxC.f24f293946f6ad20956822adf2e085fa6d6b211ffb529522c86ad90fe39c5570')

table = api.table('appD3YhFHjmqJKtZ6','tblgyOlrTfYRaodyb')

table_dict = table.all()

rows = []

for row in table_dict:
    rows.append(row['fields'])
df = pd.DataFrame(rows)
# Load GeoJSONs
gdf_assembly = gpd.read_file(r"..\public\NYS_Assembly_Districts.geojson")
gdf_senate = gpd.read_file(r"..\public\NYS_Senate_Districts.geojson").rename(columns={'DISTRICT':'District'})

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
gdf_assembly.to_file(r'..\public\assembly.geo.json', driver='GeoJSON')
gdf_senate.to_file(r'..\public\senate.geo.json', driver='GeoJSON')