import geopandas as gpd
import pandas as pd
import json

senate_data = []
with open("public/senate.geo.json", 'r') as f:
  senate_data = json.load(f)
assembly_data = []
with open("public/assembly.geo.json", 'r') as f:
  assembly_data = json.load(f)
  
# Function to extract unique bill names from "HCMC support"
def extract_unique_bills(features):
    unique_bills = set()
    for feature in features:
        hcmc_support = feature['properties'].get('HCMC support', [])
        unique_bills.update(hcmc_support)
    return unique_bills

# Extracting unique bills from Senate and Assembly
unique_bills_senate = extract_unique_bills(senate_data['features'])
unique_bills_assembly = extract_unique_bills(assembly_data['features'])

# Combining and sorting the unique bills
all_unique_bills = sorted(unique_bills_senate.union(unique_bills_assembly))
def count_bills_support(features, unique_bills):
    counts = {
        "Democrat": {bill: 0 for bill in unique_bills},
        "Republican": {bill: 0 for bill in unique_bills}
    }

    for feature in features:
        # Adjusting for 'Democratic' and 'Democrat'
        party = feature['properties']['Party_x']
        if party == 'Democratic':
            party = 'Democrat'

        hcmc_support = feature['properties'].get('HCMC support', [])

        # Count occurrences for each bill
        for bill in hcmc_support:
            if bill in counts[party]:
                counts[party][bill] += 1

    return counts

# Counting bills for Senate and Assembly
senate_bills_counts = count_bills_support(senate_data['features'], all_unique_bills)
assembly_bills_counts = count_bills_support(assembly_data['features'], all_unique_bills)
def create_summary_data(counts, house):
    summary = []
    for party, bills in counts.items():
        party_data = {"House": house, "Party": party}
        party_data.update({bill: str(count) for bill, count in bills.items()})
        summary.append(party_data)
    return summary

# Creating the summary data for Senate and Assembly
summary_data_senate = create_summary_data(senate_bills_counts, "Senate")
summary_data_assembly = create_summary_data(assembly_bills_counts, "Assembly")

# Combining both summaries
final_summary_data = summary_data_senate + summary_data_assembly

# Path for the new JSON file
output_file_path_dynamic = "public/legislation_votes.json"

# Writing the data to a new JSON file
with open(output_file_path_dynamic, 'w') as file:
    json.dump(final_summary_data, file, indent=4)