import Swal from "sweetalert2";

const userData = [
  {
    id: 1,
    firstName: "Caroline",
    lastName: "Jensen",
    email: "carolinejensen@zidant.com",
    dob: "2004-05-28",
    address: {
      street: "529 Scholes Street",
      city: "Temperanceville",
      zipcode: 5235,
      geo: {
        lat: 23.806115,
        lng: 164.677197,
      },
    },
    phone: "+1 (821) 447-3782",
    isActive: true,
    age: 39,
    company: "POLARAX",
    designation: "Software Engineer",
  },
  {
    id: 2,
    firstName: "Celeste",
    lastName: "Grant",
    email: "celestegrant@polarax.com",
    dob: "1989-11-19",
    address: {
      street: "639 Kimball Street",
      city: "Bascom",
      zipcode: 8907,
      geo: {
        lat: 65.954483,
        lng: 98.906478,
      },
    },
    phone: "+1 (838) 515-3408",
    isActive: false,
    age: 32,
    company: "MANGLO",
    designation: "UI Designer",
  },
  {
    id: 3,
    firstName: "Tillman",
    lastName: "Forbes",
    email: "tillmanforbes@manglo.com",
    dob: "2016-09-05",
    address: {
      street: "240 Vandalia Avenue",
      city: "Thynedale",
      zipcode: 8994,
      geo: {
        lat: -34.949388,
        lng: -82.958111,
      },
    },
    phone: "+1 (969) 496-2892",
    isActive: false,
    age: 26,
    company: "APPLIDECK",
    designation: "Product Manager",
  },
  {
    id: 4,
    firstName: "Daisy",
    lastName: "Whitley",
    email: "daisywhitley@applideck.com",
    dob: "1987-03-23",
    address: {
      street: "350 Pleasant Place",
      city: "Idledale",
      zipcode: 9369,
      geo: {
        lat: -54.458809,
        lng: -127.476556,
      },
    },
    phone: "+1 (861) 564-2877",
    isActive: true,
    age: 21,
    company: "VOLAX",
    designation: "HR Specialist",
  },
  {
    id: 5,
    firstName: "Weber",
    lastName: "Bowman",
    email: "weberbowman@volax.com",
    dob: "1983-02-24",
    address: {
      street: "154 Conway Street",
      city: "Broadlands",
      zipcode: 8131,
      geo: {
        lat: 54.501351,
        lng: -167.47138,
      },
    },
    phone: "+1 (962) 466-3483",
    isActive: false,
    age: 26,
    company: "ORBAXTER",
    designation: "QA Engineer",
  },
  {
    id: 6,
    firstName: "Buckley",
    lastName: "Townsend",
    email: "buckleytownsend@orbaxter.com",
    dob: "2011-05-29",
    address: {
      street: "131 Guernsey Street",
      city: "Vallonia",
      zipcode: 6779,
      geo: {
        lat: -2.681655,
        lng: 3.528942,
      },
    },
    phone: "+1 (884) 595-2643",
    isActive: true,
    age: 40,
    company: "OPPORTECH",
    designation: "Team Lead",
  },
  {
    id: 7,
    firstName: "Latoya",
    lastName: "Bradshaw",
    email: "latoyabradshaw@opportech.com",
    dob: "2010-11-23",
    address: {
      street: "668 Lenox Road",
      city: "Lowgap",
      zipcode: 992,
      geo: {
        lat: 36.026423,
        lng: 130.412198,
      },
    },
    phone: "+1 (906) 474-3155",
    isActive: true,
    age: 24,
    company: "GORGANIC",
    designation: "Marketing Specialist",
  },
  {
    id: 8,
    firstName: "Kate",
    lastName: "Lindsay",
    email: "katelindsay@gorganic.com",
    dob: "1987-07-02",
    address: {
      street: "773 Harrison Avenue",
      city: "Carlton",
      zipcode: 5909,
      geo: {
        lat: 42.464724,
        lng: -12.948403,
      },
    },
    phone: "+1 (930) 546-2952",
    isActive: true,
    age: 24,
    company: "AVIT",
    designation: "Sales Manager",
  },
  {
    id: 9,
    firstName: "Marva",
    lastName: "Sandoval",
    email: "marvasandoval@avit.com",
    dob: "2010-11-02",
    address: {
      street: "200 Malta Street",
      city: "Tuskahoma",
      zipcode: 1292,
      geo: {
        lat: -52.206169,
        lng: 74.19452,
      },
    },
    phone: "+1 (927) 566-3600",
    isActive: false,
    age: 28,
    company: "QUILCH",
    designation: "Software Developer",
  },
  {
    id: 10,
    firstName: "Decker",
    lastName: "Russell",
    email: "deckerrussell@quilch.com",
    dob: "1994-04-21",
    address: {
      street: "708 Bath Avenue",
      city: "Coultervillle",
      zipcode: 1268,
      geo: {
        lat: -41.550295,
        lng: -146.598075,
      },
    },
    phone: "+1 (846) 535-3283",
    isActive: false,
    age: 27,
    company: "MEMORA",
    designation: "Designer",
  },
  {
    id: 11,
    firstName: "Odom",
    lastName: "Mills",
    email: "odommills@memora.com",
    dob: "2010-01-24",
    address: {
      street: "907 Blake Avenue",
      city: "Churchill",
      zipcode: 4400,
      geo: {
        lat: -56.061694,
        lng: -130.238523,
      },
    },
    phone: "+1 (995) 525-3402",
    isActive: true,
    age: 34,
    company: "ZORROMOP",
    designation: "Account Manager",
  },
  {
    id: 12,
    firstName: "Sellers",
    lastName: "Walters",
    email: "sellerswalters@zorromop.com",
    dob: "1975-11-12",
    address: {
      street: "978 Oakland Place",
      city: "Gloucester",
      zipcode: 3802,
      geo: {
        lat: 11.732587,
        lng: 96.118099,
      },
    },
    phone: "+1 (830) 430-3157",
    isActive: true,
    age: 28,
    company: "ORBOID",
    designation: "Business Analyst",
  },
  {
    id: 13,
    firstName: "Wendi",
    lastName: "Powers",
    email: "wendipowers@orboid.com",
    dob: "1979-06-02",
    address: {
      street: "376 Greenpoint Avenue",
      city: "Elliott",
      zipcode: 9149,
      geo: {
        lat: -78.159578,
        lng: -9.835103,
      },
    },
    phone: "+1 (863) 457-2088",
    isActive: true,
    age: 31,
    company: "SNORUS",
    designation: "Content Writer",
  },
  {
    id: 14,
    firstName: "Sophie",
    lastName: "Horn",
    email: "sophiehorn@snorus.com",
    dob: "2018-09-20",
    address: {
      street: "343 Doughty Street",
      city: "Homestead",
      zipcode: 330,
      geo: {
        lat: 65.484087,
        lng: 137.413998,
      },
    },
    phone: "+1 (885) 418-3948",
    isActive: true,
    age: 22,
    company: "XTH",
    designation: "Customer Support Specialist",
  },
  {
    id: 15,
    firstName: "Levine",
    lastName: "Rodriquez",
    email: "levinerodriquez@xth.com",
    dob: "1973-02-08",
    address: {
      street: "643 Allen Avenue",
      city: "Weedville",
      zipcode: 8931,
      geo: {
        lat: -63.185586,
        lng: 117.327808,
      },
    },
    phone: "+1 (999) 565-3239",
    isActive: true,
    age: 27,
    company: "COMTRACT",
    designation: "Operations Manager",
  },
  {
    id: 16,
    firstName: "Little",
    lastName: "Hatfield",
    email: "littlehatfield@comtract.com",
    dob: "2012-01-03",
    address: {
      street: "194 Anthony Street",
      city: "Williston",
      zipcode: 7456,
      geo: {
        lat: 47.480837,
        lng: 6.085909,
      },
    },
    phone: "+1 (812) 488-3011",
    isActive: false,
    age: 33,
    company: "ZIDANT",
    designation: "IT Support Engineer",
  },
  {
    id: 17,
    firstName: "Larson",
    lastName: "Kelly",
    email: "larsonkelly@zidant.com",
    dob: "2010-06-14",
    address: {
      street: "978 Indiana Place",
      city: "Innsbrook",
      zipcode: 639,
      geo: {
        lat: -71.766732,
        lng: 150.854345,
      },
    },
    phone: "+1 (892) 484-2162",
    isActive: true,
    age: 20,
    company: "SUREPLEX",
    designation: "Backend Developer",
  },
  {
    id: 18,
    firstName: "Kendra",
    lastName: "Molina",
    email: "kendramolina@sureplex.com",
    dob: "2002-07-19",
    address: {
      street: "567 Charles Place",
      city: "Kimmell",
      zipcode: 1966,
      geo: {
        lat: 50.765816,
        lng: -117.106499,
      },
    },
    phone: "+1 (920) 528-3330",
    isActive: false,
    age: 31,
    company: "DANJA",
    designation: "Frontend Developer",
  },
  {
    id: 19,
    firstName: "Ebony",
    lastName: "Livingston",
    email: "ebonylivingston@danja.com",
    dob: "1994-10-18",
    address: {
      street: "284 Cass Place",
      city: "Navarre",
      zipcode: 948,
      geo: {
        lat: 65.271256,
        lng: -83.064729,
      },
    },
    phone: "+1 (970) 591-3039",
    isActive: false,
    age: 33,
    company: "EURON",
    designation: "HR Coordinator",
  },
  {
    id: 20,
    firstName: "Kaufman",
    lastName: "Rush",
    email: "kaufmanrush@euron.com",
    dob: "2011-07-10",
    address: {
      street: "408 Kingsland Avenue",
      city: "Beaulieu",
      zipcode: 7911,
      geo: {
        lat: 41.513153,
        lng: 54.821641,
      },
    },
    phone: "+1 (924) 463-2934",
    isActive: false,
    age: 39,
    company: "ILLUMITY",
    designation: "Creative Director",
  },
];

const landData = {
  basicInfo: {
    firstName: "Rahul",
    lastName: "Sharma",
    email: "rahul.sharma@example.com",
    mobile: "+91 9876543210",
  },
  landDetails: {
    location: "Ahmedabad, Gujarat",
    googleLocation: "https://maps.google.com/?q=Ahmedabad,+Gujarat",
    purpose: "JV",
    area: "2000 Sq Yards",
    surveyNo: "10234",
    tpName: "Ahmedabad TP",
    tpNo: "56789",
    plotNo: "F.P. 112",
    zone: "Commercial",
  },
  cpDetails: {
    name: "Rohit Patel",
    mobile: "+91 9876543211",
    company: "Shivalik Realty Pvt. Ltd.",
  },
};

const locations = [
  { id: 1, name: "Ambli", lat: 23.0338, lng: 72.5143 },
  { id: 2, name: "Shela", lat: 22.9828, lng: 72.4649 },
  { id: 3, name: "Panjrapole", lat: 23.0225, lng: 72.5714 },
  { id: 4, name: "Sachana", lat: 22.9333, lng: 72.2333 },
  { id: 5, name: "Shantigram", lat: 23.1156, lng: 72.5853 },
  { id: 6, name: "Vaishnodevi", lat: 23.1006, lng: 72.5853 },
  { id: 7, name: "Gift City", lat: 23.1645, lng: 72.6842 },
  { id: 8, name: "Keshavbaug", lat: 23.0405, lng: 72.546 },
  { id: 9, name: "Bodakdev", lat: 23.04, lng: 72.5145 },
];

const summaryData = [
  {
    id: 1,
    title: "Total No. of Inquiries",
    count: 3,
    bgColor: "bg-gray-200",
    icon: "mdi:clipboard-text-outline", // Iconify Icon
    iconBg: "bg-black",
    iconColor: "text-white",
  },
  {
    id: 2,
    title: "New Inquiries",
    count: 2,
    bgColor: "bg-yellow-100",
    icon: "mdi:bell-outline", // Notification Bell Icon
    iconBg: "bg-yellow-500",
    iconColor: "text-white",
  },
  {
    id: 3,
    title: "Inquiries Shortlisted",
    count: 1,
    bgColor: "bg-green-100",
    icon: "mdi:check-decagram", // Verified Check Icon
    iconBg: "bg-green-500",
    iconColor: "text-white",
  },
  {
    id: 4,
    title: "Inquiries Rejected",
    count: 0,
    bgColor: "bg-red-100",
    icon: "mdi:close-circle-outline", // Rejected Cross Icon
    iconBg: "bg-red-500",
    iconColor: "text-white",
  },
];

// Inquiry by status data
const inquiryData = [
  { status: "Inquiry In", count: 1, total: 5 },
  { status: "Shortlisted", count: 1, total: 4 },
  { status: "Rejected", count: 0, total: 3 },
  { status: "T&C", count: 0, total: 2 },
  { status: "Proposal", count: 0, total: 2 },
  { status: "Title Clearance", count: 0, total: 2 },
  { status: "District Mapping", count: 0, total: 2 },
  { status: "Contour Survey", count: 0, total: 2 },
  { status: "Team Survey", count: 0, total: 2 },
  { status: "Field Survey", count: 0, total: 2 },
  { status: "Team Visit", count: 0, total: 2 },
  { status: "Development Type", count: 0, total: 2 },
  { status: "Agreement", count: 0, total: 2 },
];

const leadVerificationData = [
  { name: "Verified", value: 1, color: "black" },
  { name: "Pending", value: 2, color: "yellow" },
  { name: "Rejected", value: 0, color: "red" },
];

// Lead Source Data
const leadSourceData = [
  {
    name: "Manual Entry",
    data: [
      { time: "Jan", value: 0 },
      { time: "Feb", value: 1 },
    ],
  },
  {
    name: "App & Website",
    data: [
      { time: "Jan", value: 0 },
      { time: "Feb", value: 0 },
    ],
  },
  {
    name: "Partner Channels & WhatsApp",
    data: [
      { time: "Jan", value: 0 },
      { time: "Feb", value: 2 },
    ],
  },
];

const addLandSourceData = [
  {
    id: 1,
    title: "Manual Entry",
    value: 1,
    data: [
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 3, y: 0 },
      { x: 4, y: 0 },
      { x: 5, y: 5 },
    ], // Example spike at end
  },
  {
    id: 2,
    title: "App & Website",
    value: 0,
    data: [
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 3, y: 0 },
      { x: 4, y: 0 },
      { x: 5, y: 0 },
    ], // Flat line
  },
  {
    id: 3,
    title: "Partner Channels & WhatsApp",
    value: 2,
    data: [
      { x: 1, y: 0 },
      { x: 2, y: 3 },
      { x: 3, y: 0 },
      { x: 4, y: 0 },
      { x: 5, y: 5 },
    ], // Peaks in data
  },
];

const showMessage = (msg = "", type = "success") => {
  Swal.fire({
    toast: true,
    position: "bottom-end",
    icon: type,
    title: msg,
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener("mouseenter", Swal.stopTimer);
      toast.addEventListener("mouseleave", Swal.resumeTimer);
    },
  });
};

const categoryOfVisitorOptions = [
  { value: "Client Meeting", label: "Client Meeting" },
  { value: "Project Inquiry", label: "Project Inquiry" },
  { value: "SHINE", label: "SHINE" },
  { value: "SIRE", label: "SIRE" },
  { value: "WIRE", label: "WIRE" },
  { value: "Project Documentation", label: "Project Documentation" },
  { value: "Channel Partner Meeting", label: "Channel Partner Meeting" },
  { value: "Vendor/Supplier Meeting", label: "Vendor/Supplier Meeting" },
  { value: "Business Proposal", label: "Business Proposal" },
  { value: "Career Inquiry", label: "Career Inquiry" },
  { value: "Training/Workshop", label: "Training/Workshop" },
  { value: "Meeting with Satish Shah", label: "Meeting with Satish Shah" },
  { value: "Meeting with Chitrak Shah", label: "Meeting with Chitrak Shah" },
  { value: "Meeting with Taral Shah", label: "Meeting with Taral Shah" },
  { value: "Meeting with Dhyey Shah", label: "Meeting with Dhyey Shah" },
  { value: "Other", label: "Other" },
];

const offerLandOptions = [
  { value: "2BHK & 3 BHK", label: "2BHK & 3 BHK" },
  { value: "Commercial", label: "Commercial" },
  { value: "A-Grade building", label: "A-Grade building" },
  {
    value: "Plottings - Village Farm Land Type",
    label: "Plottings - Village Farm Land Type",
  },
  { value: "Master Peace", label: "Master Peace" },
];

const campaignLeadTypeOptions = [
  { value: "CP", label: "CP" },
  { value: "CRM", label: "CRM" },
  { value: "Excel", label: "Excel" },
];

const campaignTypeOptions = [
  { value: "mail", label: "Email" },
  { value: "whatsapp", label: "Whatsapp" },
  { value: "message", label: "Message" },
];

const crmTypeOptions = [
  { value: "Project", label: "Project CRM" },
  { value: "Fund", label: "Fund CRM" },
  { value: "Furniture", label: "Furniture CRM" },
];

const statusOptions = [
  { value: "all", label: "All" },
  { value: "ACTIVE", label: "ACTIVE" },
  { value: "INACTIVE", label: "INACTIVE" },
];

const leadTypeOptions = [
  { value: "CP", label: "Chanel Sales" },
  { value: "CRM", label: "CRM" },
];

const zoneOptions = [
  { label: "R1", value: "R1" },
  { label: "R2", value: "R2" },
  { label: "R3", value: "R3" },
  { label: "RAH", value: "RAH" },
  { label: "Industrial", value: "Industrial" },
  { label: "Logistic", value: "Logistic" },
  { label: "Any Other", value: "Any Other" },
];

const documentFields = [
  { key: "propertyCard", label: "Property Card" },
  { key: "satBar", label: "7/12 SatBar" },
  { key: "partPlan", label: "Part Plan" },
  { key: "zoningCertificate", label: "Zoning Certificate" },
];

const userTypeOptions = [
  { label: "Land Owner", value: "LandOwner" },
  { label: "Broker", value: "Broker" },
  { label: "Developer", value: "Developer" },
];
const landTypeOptions = [
  { label: "Agriculture", value: "Agriculture" },
  { label: "Non-Agriculture", value: "Non-Agriculture" },
];

const landUnitOptions = [
  { label: "Sq Yards", value: "Sq Yards" },
  { label: "Sq Mtr", value: "Sq Mtr" },
  { label: "Bigha", value: "Bigha" },
  { label: "Acre", value: "Acre" },
];

const proposalOptions = [
  { label: "For Sale", value: "For Sale" },
  { label: "Joint Venture", value: "Joint Venture" },
  { label: "Joint Development", value: "Joint Development" },
  { label: "Open for discussion", value: "Open for discussion" },
];

const projectTypeOptions = [
  { label: "Residential", value: "Residential" },
  { label: "Commercial", value: "Commercial" },
  { label: "Mixed-Use", value: "Mixed-Use" },
  { label: "Plotting", value: "Plotting" },
];

const availableUnitTypes = [
  { label: "1BHK", value: "1BHK" },
  { label: "2BHK", value: "2BHK" },
  { label: "3BHK", value: "3BHK" },
  { label: "4BHK", value: "4BHK" },
  { label: "Shops", value: "Shops" },
  { label: "Office", value: "Office" },
  { label: "Plot", value: "Plot" },
];

const projectForOptions = [
  { label: "Buy", value: "Buy" },
  { label: "Invest", value: "Invest" },
  { label: "Rental Income", value: "Rental Income" },
  { label: "Lease", value: "Lease" },
  { label: "Pre-Lease", value: "Pre-Lease" },
];

const projectStatusOptions = [
  { label: "Upcoming", value: "Upcoming" },
  { label: "Under Construction", value: "Under Construction" },
  { label: "Ready to Move", value: "Ready to Move" },
];

const nearByConnectivity = [
  { label: "Metro", value: "Metro" },
  { label: "Airport", value: "Airport" },
  { label: "School", value: "School" },
  { label: "Hospital", value: "Hospital" },
];

const amenitiesOptions = [
  { label: "Garden", value: "Garden" },
  { label: "Pool", value: "Pool" },
  { label: "Jogging Track", value: "Jogging Track" },
  { label: "Open Gym", value: "Open Gym" },
  { label: "Jogging Track", value: "Jogging Track" },
  { label: "Amphitheatre", value: "Amphitheatre" },
];

const sustainableGreenFeatures = [
  { label: "Solar", value: "Solar" },
  { label: "Rainwater Harvesting", value: "Rainwater Harvesting" },
  { label: "STP", value: "STP" },
  { label: "Composting", value: "Composting" },
];

const paymentPlanTypeOptions = [
  { label: "CLP", value: "CLP" },
  { label: "Subvention", value: "Subvention" },
  { label: "Down Payment", value: "Down Payment" },
  { label: "Flexi", value: "Flexi" },
];

const bankOptions = [
  { label: "HDFC", value: "HDFC" },
  { label: "SBI", value: "SBI" },
  { label: "ICICI", value: "ICICI" },
  { label: "Axis", value: "Axis" },
  { label: "LIC", value: "LIC" },
  { label: "HFL", value: "HFL" },
];

const visibilityOptions = [
  { label: "Published", value: "Published" },
  { label: "Draft", value: "Draft" },
  { label: "Hidden", value: "Hidden" },
  { label: "Pending", value: "Pending" },
];

const structuralTypeOptions = [
  { label: "RCC", value: "RCC" },
  { label: "Precast", value: "Precast" },
  { label: "Steel Frame", value: "Steel Frame" },
  { label: "Other", value: "Other" },
];

const projectPartnerOptions = [
  { label: "Shivalik Developers", value: "Shivalik Developers" },
];

const floorOptions = [
  { label: "101", value: "101" },
  { label: "102", value: "102" },
  { label: "103", value: "103" },
  { label: "104", value: "104" },
];

// Master types config array
const MASTER_CONFIG = [
  { type: "Status", key: "statusId", isMulti: false },
  { type: "Category", key: "categoryIdArray", isMulti: true },
  { type: "Unit Type", key: "unitTypeIdArray", isMulti: true },
  { type: "Sub Unit Type", key: "subUnitTypeIdArray", isMulti: true },
  { type: "Investment Type", key: "investmentTypeIdArray", isMulti: true },
];

const typeOptions = [
  { label: "Photos", value: "Photos" },
  { label: "Video", value: "Video" },
];

// Generate page sizes: 12, 24, 36, 48 ... up to 492
const PAGE_SIZES = Array.from(
  { length: Math.floor(500 / 12) },
  (_, i) => (i + 1) * 12
);

export {
  MASTER_CONFIG,
  PAGE_SIZES,
  addLandSourceData,
  amenitiesOptions,
  availableUnitTypes,
  bankOptions,
  campaignLeadTypeOptions,
  campaignTypeOptions,
  categoryOfVisitorOptions,
  crmTypeOptions,
  documentFields,
  floorOptions,
  inquiryData,
  landData,
  landTypeOptions,
  landUnitOptions,
  leadSourceData,
  leadTypeOptions,
  leadVerificationData,
  locations,
  nearByConnectivity,
  offerLandOptions,
  paymentPlanTypeOptions,
  projectForOptions,
  projectPartnerOptions,
  projectStatusOptions,
  projectTypeOptions,
  proposalOptions,
  showMessage,
  statusOptions,
  structuralTypeOptions,
  summaryData,
  sustainableGreenFeatures,
  typeOptions,
  userData,
  userTypeOptions,
  visibilityOptions,
  zoneOptions,
};
