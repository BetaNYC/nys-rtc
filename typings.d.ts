type GeoJson = {
  type: "FeatureCollection";
  name: string;
  crs?: {};
  features: Feature<Geometry, GeoJsonProperties>[];
};

type Legislations =
  | "Statewide RTC"
  | "Defend RTC"
  | "Winter Eviction Moratorium";

type Districts = "assembly" | "senate";

type Organizations = "Members" | "Supporters" | "Endorsers";

type dataType = {
  "Statewide RTC"?: string;
  "Defend RTC"?: string;
  "Winter Eviction Moratorium"?: string;
  House?: string;
  Party?: string;
};

type selectedDistrictFeatures = {
  properties: {
    Address?: string;
    Address2?: string;
    City?: string;
    District: number;
    Geography: string;
    House: string;
    NAME: string;
    name: string;
    OBJECTID: string;
    Party_x: "Republican" | "Democratic";
    Party_y: string;
    Phone: string;
    State: "NY";
    Zip: string;
    dist_phone: string;
    email: string;
    "HCMC support": string[];
  };
  geometry: {
    coordinates: [][];
    type: "Polygon";
  };
} | null;

type selectedDistrictOverlappedData = {
  districts: number[];
  counties: string[];
  district: number;
  zip_codes: string[];
} | null;

type selectedMemberFeatures = {
  properties: {
      Website: string,
      Name: string,
      Legislation: string[],
      Phone: string,
      Address: string,
      'Membership Status': string[],
  }
} | null;
