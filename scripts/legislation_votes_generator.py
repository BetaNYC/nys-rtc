import geopandas as gpd
import pandas as pd
import json

def create_summary_data(counts, house):
    """
    Creates a summary of vote counts for each party in the given house.

    Args:
        counts (dict): A dictionary containing the vote counts for each party and bill.
        house (str): The name of the house.

    Returns:
        list: A list of dictionaries, where each dictionary represents a party and its vote counts.
              Each dictionary contains the following keys:
              - "House": The name of the house.
              - "Party": The name of the party.
              - The bill names as keys, and the corresponding vote counts as string values.
    """
    summary = []
    for party, bills in counts.items():
        party_data = {"House": house, "Party": party}
        party_data.update({bill: str(count) for bill, count in bills.items()})
        summary.append(party_data)
    return summary

def count_bills_support(features, unique_bills):
    """
    Counts the number of bills supported by Democrats and Republicans.

    Args:
        features (list): A list of features containing information about each legislator.
        unique_bills (list): A list of unique bill names.

    Returns:
        dict: A dictionary containing the counts of bills supported by Democrats and Republicans.
            The dictionary has the following structure:
            {
                "Democrat": {bill: count},
                "Republican": {bill: count}
            }
            where 'bill' is the name of the bill and 'count' is the number of occurrences.
    """
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

def extract_unique_bills(features):
    """
    Extracts unique bills from a list of features.

    Args:
        features (list): A list of features.

    Returns:
        set: A set of unique bills.
    """
    unique_bills = set()
    for feature in features:
        hcmc_support = feature['properties'].get('HCMC support', [])
        unique_bills.update(hcmc_support)
    return unique_bills

import json

def generate_legislation_votes():
    """
    Generates a JSON file containing the summary data of legislation votes for the Senate and Assembly.

    This function reads the Senate and Assembly data from the 'public' directory, extracts unique bills,
    counts the support for each bill in the Senate and Assembly, creates summary data for each chamber,
    combines the summaries, and writes the final summary data to a new JSON file.

    Args:
        None

    Returns:
        None
    """

    senate_data = []
    with open("public/senate.geo.json", 'r') as f:
        senate_data = json.load(f)
    assembly_data = []
    with open("public/assembly.geo.json", 'r') as f:
        assembly_data = json.load(f)

    # Extracting unique bills from Senate and Assembly
    unique_bills_senate = extract_unique_bills(senate_data['features'])
    unique_bills_assembly = extract_unique_bills(assembly_data['features'])

    # Combining and sorting the unique bills
    all_unique_bills = sorted(unique_bills_senate.union(unique_bills_assembly))

    # Counting bills for Senate and Assembly
    senate_bills_counts = count_bills_support(senate_data['features'], all_unique_bills)
    assembly_bills_counts = count_bills_support(assembly_data['features'], all_unique_bills)

    # Creating the summary data for Senate and Assembly
    summary_data_senate = create_summary_data(senate_bills_counts, "Senate")
    summary_data_assembly = create_summary_data(assembly_bills_counts, "Assembly")

    # Combining both summaries
    final_summary_data = summary_data_senate + summary_data_assembly

    # Path for the new JSON file
    output_file_path_dynamic = "public/legislations_votes.json"

    # Writing the data to a new JSON file
    with open(output_file_path_dynamic, 'w') as file:
        json.dump(final_summary_data, file, indent=4)


if __name__ == '__main__':
    generate_legislation_votes()