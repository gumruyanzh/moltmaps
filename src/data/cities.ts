/**
 * World Cities Data for Territory System
 * Curated list of cities organized by country
 */

export interface CityData {
  name: string
  lat: number
  lng: number
  population?: number
  timezone?: string
  isTop1000?: boolean
}

export interface CountryData {
  code: string
  name: string
  cities: CityData[]
}

// Top 1000 cities by population (reserved for superadmin)
const TOP_CITIES = new Set([
  'Tokyo', 'Delhi', 'Shanghai', 'São Paulo', 'Mexico City', 'Cairo', 'Mumbai', 'Beijing',
  'Dhaka', 'Osaka', 'New York', 'Karachi', 'Buenos Aires', 'Chongqing', 'Istanbul',
  'Kolkata', 'Manila', 'Lagos', 'Rio de Janeiro', 'Tianjin', 'Kinshasa', 'Guangzhou',
  'Los Angeles', 'Moscow', 'Shenzhen', 'Lahore', 'Bangalore', 'Paris', 'Bogotá', 'Jakarta',
  'Chennai', 'Lima', 'Bangkok', 'Seoul', 'Nagoya', 'Hyderabad', 'London', 'Tehran', 'Chicago',
  'Chengdu', 'Nanjing', 'Wuhan', 'Ho Chi Minh City', 'Luanda', 'Ahmedabad', 'Kuala Lumpur',
  'Hong Kong', 'Hangzhou', 'Foshan', 'Shenyang', 'Riyadh', 'Baghdad', 'Santiago', 'Surat',
  'Madrid', 'Suzhou', 'Pune', 'Harbin', 'Houston', 'Dallas', 'Toronto', 'Dar es Salaam',
  'Miami', 'Belo Horizonte', 'Singapore', 'Philadelphia', 'Atlanta', 'Fukuoka', 'Khartoum',
  'Barcelona', 'Johannesburg', 'Saint Petersburg', 'Qingdao', 'Dalian', 'Washington', 'Yangon',
  'Alexandria', 'Jinan', 'Guadalajara', 'Berlin', 'Sydney', 'Melbourne', 'Rome', 'Milan', 'Munich'
])

export const COUNTRIES: CountryData[] = [
  {
    code: 'US',
    name: 'United States',
    cities: [
      { name: 'New York', lat: 40.7128, lng: -74.0060, population: 8336817 },
      { name: 'Los Angeles', lat: 34.0522, lng: -118.2437, population: 3979576 },
      { name: 'Chicago', lat: 41.8781, lng: -87.6298, population: 2693976 },
      { name: 'Houston', lat: 29.7604, lng: -95.3698, population: 2320268 },
      { name: 'Phoenix', lat: 33.4484, lng: -112.0740, population: 1680992 },
      { name: 'Philadelphia', lat: 39.9526, lng: -75.1652, population: 1584064 },
      { name: 'San Antonio', lat: 29.4241, lng: -98.4936, population: 1547253 },
      { name: 'San Diego', lat: 32.7157, lng: -117.1611, population: 1423851 },
      { name: 'Dallas', lat: 32.7767, lng: -96.7970, population: 1343573 },
      { name: 'San Jose', lat: 37.3382, lng: -121.8863, population: 1021795 },
      { name: 'Austin', lat: 30.2672, lng: -97.7431, population: 978908 },
      { name: 'Jacksonville', lat: 30.3322, lng: -81.6557, population: 911507 },
      { name: 'Fort Worth', lat: 32.7555, lng: -97.3308, population: 909585 },
      { name: 'Columbus', lat: 39.9612, lng: -82.9988, population: 905748 },
      { name: 'Charlotte', lat: 35.2271, lng: -80.8431, population: 885708 },
      { name: 'San Francisco', lat: 37.7749, lng: -122.4194, population: 881549 },
      { name: 'Indianapolis', lat: 39.7684, lng: -86.1581, population: 876384 },
      { name: 'Seattle', lat: 47.6062, lng: -122.3321, population: 753675 },
      { name: 'Denver', lat: 39.7392, lng: -104.9903, population: 727211 },
      { name: 'Washington', lat: 38.9072, lng: -77.0369, population: 705749 },
      { name: 'Boston', lat: 42.3601, lng: -71.0589, population: 692600 },
      { name: 'Nashville', lat: 36.1627, lng: -86.7816, population: 689447 },
      { name: 'Detroit', lat: 42.3314, lng: -83.0458, population: 670031 },
      { name: 'Portland', lat: 45.5152, lng: -122.6784, population: 654741 },
      { name: 'Las Vegas', lat: 36.1699, lng: -115.1398, population: 651319 },
      { name: 'Memphis', lat: 35.1495, lng: -90.0490, population: 651073 },
      { name: 'Louisville', lat: 38.2527, lng: -85.7585, population: 633045 },
      { name: 'Baltimore', lat: 39.2904, lng: -76.6122, population: 602495 },
      { name: 'Milwaukee', lat: 43.0389, lng: -87.9065, population: 590157 },
      { name: 'Albuquerque', lat: 35.0844, lng: -106.6504, population: 564559 },
      { name: 'Tucson', lat: 32.2226, lng: -110.9747, population: 548073 },
      { name: 'Fresno', lat: 36.7378, lng: -119.7871, population: 542107 },
      { name: 'Sacramento', lat: 38.5816, lng: -121.4944, population: 513624 },
      { name: 'Atlanta', lat: 33.7490, lng: -84.3880, population: 506811 },
      { name: 'Miami', lat: 25.7617, lng: -80.1918, population: 467963 },
      { name: 'Oakland', lat: 37.8044, lng: -122.2712, population: 433031 },
      { name: 'Minneapolis', lat: 44.9778, lng: -93.2650, population: 429954 },
      { name: 'New Orleans', lat: 29.9511, lng: -90.0715, population: 383997 },
      { name: 'Honolulu', lat: 21.3069, lng: -157.8583, population: 350395 },
      { name: 'Salt Lake City', lat: 40.7608, lng: -111.8910, population: 200567 },
    ]
  },
  {
    code: 'JP',
    name: 'Japan',
    cities: [
      { name: 'Tokyo', lat: 35.6762, lng: 139.6503, population: 13960000 },
      { name: 'Yokohama', lat: 35.4437, lng: 139.6380, population: 3748995 },
      { name: 'Osaka', lat: 34.6937, lng: 135.5023, population: 2752412 },
      { name: 'Nagoya', lat: 35.1815, lng: 136.9066, population: 2320361 },
      { name: 'Sapporo', lat: 43.0618, lng: 141.3545, population: 1973395 },
      { name: 'Fukuoka', lat: 33.5904, lng: 130.4017, population: 1603043 },
      { name: 'Kobe', lat: 34.6901, lng: 135.1956, population: 1522944 },
      { name: 'Kyoto', lat: 35.0116, lng: 135.7681, population: 1463723 },
      { name: 'Kawasaki', lat: 35.5309, lng: 139.7030, population: 1538262 },
      { name: 'Saitama', lat: 35.8617, lng: 139.6455, population: 1324025 },
      { name: 'Hiroshima', lat: 34.3853, lng: 132.4553, population: 1199391 },
      { name: 'Sendai', lat: 38.2682, lng: 140.8694, population: 1096704 },
      { name: 'Kitakyushu', lat: 33.8835, lng: 130.8752, population: 939029 },
      { name: 'Chiba', lat: 35.6074, lng: 140.1065, population: 981949 },
      { name: 'Sakai', lat: 34.5733, lng: 135.4830, population: 826161 },
      { name: 'Niigata', lat: 37.9162, lng: 139.0364, population: 789275 },
      { name: 'Hamamatsu', lat: 34.7108, lng: 137.7261, population: 791707 },
      { name: 'Kumamoto', lat: 32.8032, lng: 130.7079, population: 738907 },
      { name: 'Okayama', lat: 34.6551, lng: 133.9195, population: 724691 },
      { name: 'Shizuoka', lat: 34.9756, lng: 138.3831, population: 693389 },
    ]
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    cities: [
      { name: 'London', lat: 51.5074, lng: -0.1278, population: 8982000 },
      { name: 'Birmingham', lat: 52.4862, lng: -1.8904, population: 1141816 },
      { name: 'Manchester', lat: 53.4808, lng: -2.2426, population: 547627 },
      { name: 'Leeds', lat: 53.8008, lng: -1.5491, population: 793139 },
      { name: 'Glasgow', lat: 55.8642, lng: -4.2518, population: 633120 },
      { name: 'Liverpool', lat: 53.4084, lng: -2.9916, population: 494814 },
      { name: 'Bristol', lat: 51.4545, lng: -2.5879, population: 463400 },
      { name: 'Sheffield', lat: 53.3811, lng: -1.4701, population: 584853 },
      { name: 'Edinburgh', lat: 55.9533, lng: -3.1883, population: 524930 },
      { name: 'Leicester', lat: 52.6369, lng: -1.1398, population: 354224 },
      { name: 'Coventry', lat: 52.4068, lng: -1.5197, population: 371521 },
      { name: 'Bradford', lat: 53.7960, lng: -1.7594, population: 537173 },
      { name: 'Cardiff', lat: 51.4816, lng: -3.1791, population: 362400 },
      { name: 'Belfast', lat: 54.5973, lng: -5.9301, population: 343542 },
      { name: 'Nottingham', lat: 52.9548, lng: -1.1581, population: 331069 },
      { name: 'Newcastle', lat: 54.9783, lng: -1.6178, population: 302820 },
      { name: 'Brighton', lat: 50.8225, lng: -0.1372, population: 290885 },
      { name: 'Southampton', lat: 50.9097, lng: -1.4044, population: 253651 },
      { name: 'Plymouth', lat: 50.3755, lng: -4.1427, population: 263100 },
      { name: 'Cambridge', lat: 52.2053, lng: 0.1218, population: 145700 },
    ]
  },
  {
    code: 'DE',
    name: 'Germany',
    cities: [
      { name: 'Berlin', lat: 52.5200, lng: 13.4050, population: 3644826 },
      { name: 'Hamburg', lat: 53.5511, lng: 9.9937, population: 1841179 },
      { name: 'Munich', lat: 48.1351, lng: 11.5820, population: 1471508 },
      { name: 'Cologne', lat: 50.9375, lng: 6.9603, population: 1085664 },
      { name: 'Frankfurt', lat: 50.1109, lng: 8.6821, population: 753056 },
      { name: 'Stuttgart', lat: 48.7758, lng: 9.1829, population: 634830 },
      { name: 'Dusseldorf', lat: 51.2277, lng: 6.7735, population: 619294 },
      { name: 'Leipzig', lat: 51.3397, lng: 12.3731, population: 587857 },
      { name: 'Dortmund', lat: 51.5136, lng: 7.4653, population: 587010 },
      { name: 'Essen', lat: 51.4556, lng: 7.0116, population: 583109 },
      { name: 'Bremen', lat: 53.0793, lng: 8.8017, population: 569352 },
      { name: 'Dresden', lat: 51.0504, lng: 13.7373, population: 554649 },
      { name: 'Hanover', lat: 52.3759, lng: 9.7320, population: 538068 },
      { name: 'Nuremberg', lat: 49.4521, lng: 11.0767, population: 518365 },
      { name: 'Duisburg', lat: 51.4344, lng: 6.7623, population: 498590 },
      { name: 'Bochum', lat: 51.4818, lng: 7.2162, population: 364628 },
      { name: 'Wuppertal', lat: 51.2562, lng: 7.1508, population: 354382 },
      { name: 'Bielefeld', lat: 52.0302, lng: 8.5325, population: 334195 },
      { name: 'Bonn', lat: 50.7374, lng: 7.0982, population: 327258 },
      { name: 'Karlsruhe', lat: 49.0069, lng: 8.4037, population: 313092 },
    ]
  },
  {
    code: 'FR',
    name: 'France',
    cities: [
      { name: 'Paris', lat: 48.8566, lng: 2.3522, population: 2161000 },
      { name: 'Marseille', lat: 43.2965, lng: 5.3698, population: 861635 },
      { name: 'Lyon', lat: 45.7640, lng: 4.8357, population: 513275 },
      { name: 'Toulouse', lat: 43.6047, lng: 1.4442, population: 479553 },
      { name: 'Nice', lat: 43.7102, lng: 7.2620, population: 341032 },
      { name: 'Nantes', lat: 47.2184, lng: -1.5536, population: 309346 },
      { name: 'Strasbourg', lat: 48.5734, lng: 7.7521, population: 280966 },
      { name: 'Montpellier', lat: 43.6108, lng: 3.8767, population: 285121 },
      { name: 'Bordeaux', lat: 44.8378, lng: -0.5792, population: 254436 },
      { name: 'Lille', lat: 50.6292, lng: 3.0573, population: 232787 },
      { name: 'Rennes', lat: 48.1173, lng: -1.6778, population: 216815 },
      { name: 'Reims', lat: 49.2583, lng: 4.0317, population: 183113 },
      { name: 'Le Havre', lat: 49.4944, lng: 0.1079, population: 170147 },
      { name: 'Toulon', lat: 43.1242, lng: 5.9280, population: 171953 },
      { name: 'Grenoble', lat: 45.1885, lng: 5.7245, population: 158454 },
      { name: 'Dijon', lat: 47.3220, lng: 5.0415, population: 156920 },
      { name: 'Angers', lat: 47.4784, lng: -0.5632, population: 152960 },
      { name: 'Nimes', lat: 43.8367, lng: 4.3601, population: 151001 },
      { name: 'Clermont-Ferrand', lat: 45.7772, lng: 3.0870, population: 143886 },
      { name: 'Tours', lat: 47.3941, lng: 0.6848, population: 136252 },
    ]
  },
  {
    code: 'BR',
    name: 'Brazil',
    cities: [
      { name: 'São Paulo', lat: -23.5505, lng: -46.6333, population: 12325232 },
      { name: 'Rio de Janeiro', lat: -22.9068, lng: -43.1729, population: 6747815 },
      { name: 'Brasilia', lat: -15.7975, lng: -47.8919, population: 3055149 },
      { name: 'Salvador', lat: -12.9714, lng: -38.5014, population: 2886698 },
      { name: 'Fortaleza', lat: -3.7172, lng: -38.5433, population: 2686612 },
      { name: 'Belo Horizonte', lat: -19.9167, lng: -43.9345, population: 2521564 },
      { name: 'Manaus', lat: -3.1190, lng: -60.0217, population: 2219580 },
      { name: 'Curitiba', lat: -25.4290, lng: -49.2671, population: 1948626 },
      { name: 'Recife', lat: -8.0476, lng: -34.8770, population: 1653461 },
      { name: 'Porto Alegre', lat: -30.0346, lng: -51.2177, population: 1488252 },
      { name: 'Belem', lat: -1.4558, lng: -48.4902, population: 1499641 },
      { name: 'Goiania', lat: -16.6799, lng: -49.2550, population: 1536097 },
      { name: 'Guarulhos', lat: -23.4543, lng: -46.5337, population: 1392121 },
      { name: 'Campinas', lat: -22.9099, lng: -47.0626, population: 1213792 },
      { name: 'Sao Luis', lat: -2.5307, lng: -44.3068, population: 1108975 },
      { name: 'Maceio', lat: -9.6660, lng: -35.7350, population: 1025360 },
      { name: 'Natal', lat: -5.7945, lng: -35.2110, population: 890480 },
      { name: 'Teresina', lat: -5.0892, lng: -42.8019, population: 868075 },
      { name: 'Florianopolis', lat: -27.5969, lng: -48.5495, population: 508826 },
      { name: 'Vitoria', lat: -20.3155, lng: -40.3128, population: 365855 },
    ]
  },
  {
    code: 'IN',
    name: 'India',
    cities: [
      { name: 'Mumbai', lat: 19.0760, lng: 72.8777, population: 12478447 },
      { name: 'Delhi', lat: 28.7041, lng: 77.1025, population: 11007835 },
      { name: 'Bangalore', lat: 12.9716, lng: 77.5946, population: 8443675 },
      { name: 'Hyderabad', lat: 17.3850, lng: 78.4867, population: 6809970 },
      { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714, population: 5570585 },
      { name: 'Chennai', lat: 13.0827, lng: 80.2707, population: 4681087 },
      { name: 'Kolkata', lat: 22.5726, lng: 88.3639, population: 4496694 },
      { name: 'Surat', lat: 21.1702, lng: 72.8311, population: 4462002 },
      { name: 'Pune', lat: 18.5204, lng: 73.8567, population: 3124458 },
      { name: 'Jaipur', lat: 26.9124, lng: 75.7873, population: 3046163 },
      { name: 'Lucknow', lat: 26.8467, lng: 80.9462, population: 2817105 },
      { name: 'Kanpur', lat: 26.4499, lng: 80.3319, population: 2767031 },
      { name: 'Nagpur', lat: 21.1458, lng: 79.0882, population: 2405421 },
      { name: 'Indore', lat: 22.7196, lng: 75.8577, population: 1960631 },
      { name: 'Thane', lat: 19.2183, lng: 72.9781, population: 1841488 },
      { name: 'Bhopal', lat: 23.2599, lng: 77.4126, population: 1798218 },
      { name: 'Visakhapatnam', lat: 17.6868, lng: 83.2185, population: 1730320 },
      { name: 'Patna', lat: 25.5941, lng: 85.1376, population: 1684222 },
      { name: 'Vadodara', lat: 22.3072, lng: 73.1812, population: 1670806 },
      { name: 'Ghaziabad', lat: 28.6692, lng: 77.4538, population: 1648643 },
    ]
  },
  {
    code: 'CN',
    name: 'China',
    cities: [
      { name: 'Shanghai', lat: 31.2304, lng: 121.4737, population: 24256800 },
      { name: 'Beijing', lat: 39.9042, lng: 116.4074, population: 21516000 },
      { name: 'Guangzhou', lat: 23.1291, lng: 113.2644, population: 14904400 },
      { name: 'Shenzhen', lat: 22.5431, lng: 114.0579, population: 12528300 },
      { name: 'Chengdu', lat: 30.5728, lng: 104.0668, population: 10152632 },
      { name: 'Tianjin', lat: 39.0842, lng: 117.2010, population: 9856023 },
      { name: 'Wuhan', lat: 30.5928, lng: 114.3055, population: 8896900 },
      { name: 'Dongguan', lat: 23.0207, lng: 113.7518, population: 8220207 },
      { name: 'Chongqing', lat: 29.4316, lng: 106.9123, population: 8189800 },
      { name: 'Nanjing', lat: 32.0603, lng: 118.7969, population: 8004680 },
      { name: 'Hangzhou', lat: 30.2741, lng: 120.1551, population: 7642147 },
      { name: 'Shenyang', lat: 41.8057, lng: 123.4315, population: 7220104 },
      { name: 'Xian', lat: 34.3416, lng: 108.9398, population: 6501190 },
      { name: 'Harbin', lat: 45.8038, lng: 126.5350, population: 5878939 },
      { name: 'Suzhou', lat: 31.2989, lng: 120.5853, population: 5345961 },
      { name: 'Qingdao', lat: 36.0671, lng: 120.3826, population: 5046355 },
      { name: 'Dalian', lat: 38.9140, lng: 121.6147, population: 4489380 },
      { name: 'Zhengzhou', lat: 34.7472, lng: 113.6249, population: 4253913 },
      { name: 'Jinan', lat: 36.6512, lng: 117.1201, population: 4335989 },
      { name: 'Changsha', lat: 28.2282, lng: 112.9388, population: 4044200 },
    ]
  },
  {
    code: 'AU',
    name: 'Australia',
    cities: [
      { name: 'Sydney', lat: -33.8688, lng: 151.2093, population: 5312163 },
      { name: 'Melbourne', lat: -37.8136, lng: 144.9631, population: 5078193 },
      { name: 'Brisbane', lat: -27.4698, lng: 153.0251, population: 2514184 },
      { name: 'Perth', lat: -31.9505, lng: 115.8605, population: 2085973 },
      { name: 'Adelaide', lat: -34.9285, lng: 138.6007, population: 1345777 },
      { name: 'Gold Coast', lat: -28.0167, lng: 153.4000, population: 679127 },
      { name: 'Newcastle', lat: -32.9283, lng: 151.7817, population: 322278 },
      { name: 'Canberra', lat: -35.2809, lng: 149.1300, population: 453558 },
      { name: 'Wollongong', lat: -34.4278, lng: 150.8931, population: 302739 },
      { name: 'Hobart', lat: -42.8821, lng: 147.3272, population: 238834 },
      { name: 'Geelong', lat: -38.1499, lng: 144.3617, population: 192393 },
      { name: 'Townsville', lat: -19.2590, lng: 146.8169, population: 180820 },
      { name: 'Cairns', lat: -16.9186, lng: 145.7781, population: 152729 },
      { name: 'Darwin', lat: -12.4634, lng: 130.8456, population: 147255 },
      { name: 'Toowoomba', lat: -27.5598, lng: 151.9507, population: 114024 },
    ]
  },
  {
    code: 'CA',
    name: 'Canada',
    cities: [
      { name: 'Toronto', lat: 43.6532, lng: -79.3832, population: 2731571 },
      { name: 'Montreal', lat: 45.5017, lng: -73.5673, population: 1762949 },
      { name: 'Calgary', lat: 51.0447, lng: -114.0719, population: 1239220 },
      { name: 'Ottawa', lat: 45.4215, lng: -75.6972, population: 934243 },
      { name: 'Edmonton', lat: 53.5461, lng: -113.4938, population: 932546 },
      { name: 'Mississauga', lat: 43.5890, lng: -79.6441, population: 721599 },
      { name: 'Winnipeg', lat: 49.8951, lng: -97.1384, population: 705244 },
      { name: 'Vancouver', lat: 49.2827, lng: -123.1207, population: 631486 },
      { name: 'Brampton', lat: 43.7315, lng: -79.7624, population: 593638 },
      { name: 'Hamilton', lat: 43.2557, lng: -79.8711, population: 536917 },
      { name: 'Quebec City', lat: 46.8139, lng: -71.2080, population: 531902 },
      { name: 'Surrey', lat: 49.1913, lng: -122.8490, population: 517887 },
      { name: 'Laval', lat: 45.6066, lng: -73.7124, population: 422993 },
      { name: 'Halifax', lat: 44.6488, lng: -63.5752, population: 403131 },
      { name: 'London', lat: 42.9849, lng: -81.2453, population: 383822 },
      { name: 'Victoria', lat: 48.4284, lng: -123.3656, population: 91867 },
      { name: 'Saskatoon', lat: 52.1332, lng: -106.6700, population: 246376 },
      { name: 'Regina', lat: 50.4452, lng: -104.6189, population: 215106 },
      { name: 'St. Johns', lat: 47.5615, lng: -52.7126, population: 108860 },
      { name: 'Kelowna', lat: 49.8880, lng: -119.4960, population: 127380 },
    ]
  },
  {
    code: 'MX',
    name: 'Mexico',
    cities: [
      { name: 'Mexico City', lat: 19.4326, lng: -99.1332, population: 8918653 },
      { name: 'Guadalajara', lat: 20.6597, lng: -103.3496, population: 1495182 },
      { name: 'Monterrey', lat: 25.6866, lng: -100.3161, population: 1135512 },
      { name: 'Puebla', lat: 19.0414, lng: -98.2063, population: 1576259 },
      { name: 'Tijuana', lat: 32.5149, lng: -117.0382, population: 1300983 },
      { name: 'Leon', lat: 21.1221, lng: -101.6860, population: 1238962 },
      { name: 'Juarez', lat: 31.6904, lng: -106.4245, population: 1321004 },
      { name: 'Zapopan', lat: 20.7216, lng: -103.3918, population: 1243756 },
      { name: 'Torreon', lat: 25.5428, lng: -103.4068, population: 679288 },
      { name: 'Queretaro', lat: 20.5888, lng: -100.3899, population: 878931 },
      { name: 'San Luis Potosi', lat: 22.1565, lng: -100.9855, population: 824229 },
      { name: 'Merida', lat: 20.9674, lng: -89.5926, population: 892363 },
      { name: 'Aguascalientes', lat: 21.8818, lng: -102.2916, population: 797010 },
      { name: 'Cancun', lat: 21.1619, lng: -86.8515, population: 628306 },
      { name: 'Chihuahua', lat: 28.6353, lng: -106.0889, population: 878062 },
    ]
  },
  {
    code: 'ES',
    name: 'Spain',
    cities: [
      { name: 'Madrid', lat: 40.4168, lng: -3.7038, population: 3223334 },
      { name: 'Barcelona', lat: 41.3851, lng: 2.1734, population: 1620343 },
      { name: 'Valencia', lat: 39.4699, lng: -0.3763, population: 791413 },
      { name: 'Seville', lat: 37.3891, lng: -5.9845, population: 688711 },
      { name: 'Zaragoza', lat: 41.6488, lng: -0.8891, population: 666880 },
      { name: 'Malaga', lat: 36.7213, lng: -4.4213, population: 574654 },
      { name: 'Murcia', lat: 37.9922, lng: -1.1307, population: 453258 },
      { name: 'Palma', lat: 39.5696, lng: 2.6502, population: 416065 },
      { name: 'Las Palmas', lat: 28.1235, lng: -15.4366, population: 379925 },
      { name: 'Bilbao', lat: 43.2630, lng: -2.9350, population: 346574 },
      { name: 'Alicante', lat: 38.3452, lng: -0.4810, population: 334757 },
      { name: 'Cordoba', lat: 37.8882, lng: -4.7794, population: 325916 },
      { name: 'Valladolid', lat: 41.6523, lng: -4.7245, population: 299715 },
      { name: 'Granada', lat: 37.1773, lng: -3.5986, population: 232208 },
      { name: 'Oviedo', lat: 43.3619, lng: -5.8494, population: 220020 },
    ]
  },
  {
    code: 'IT',
    name: 'Italy',
    cities: [
      { name: 'Rome', lat: 41.9028, lng: 12.4964, population: 2872800 },
      { name: 'Milan', lat: 45.4642, lng: 9.1900, population: 1396059 },
      { name: 'Naples', lat: 40.8518, lng: 14.2681, population: 959574 },
      { name: 'Turin', lat: 45.0703, lng: 7.6869, population: 870952 },
      { name: 'Palermo', lat: 38.1157, lng: 13.3615, population: 657561 },
      { name: 'Genoa', lat: 44.4056, lng: 8.9463, population: 580223 },
      { name: 'Bologna', lat: 44.4949, lng: 11.3426, population: 392564 },
      { name: 'Florence', lat: 43.7696, lng: 11.2558, population: 381037 },
      { name: 'Catania', lat: 37.5079, lng: 15.0830, population: 311584 },
      { name: 'Bari', lat: 41.1171, lng: 16.8719, population: 323370 },
      { name: 'Venice', lat: 45.4408, lng: 12.3155, population: 261905 },
      { name: 'Verona', lat: 45.4384, lng: 10.9916, population: 259966 },
      { name: 'Messina', lat: 38.1938, lng: 15.5540, population: 231708 },
      { name: 'Padua', lat: 45.4064, lng: 11.8768, population: 214198 },
      { name: 'Trieste', lat: 45.6495, lng: 13.7768, population: 204338 },
    ]
  },
  {
    code: 'KR',
    name: 'South Korea',
    cities: [
      { name: 'Seoul', lat: 37.5665, lng: 126.9780, population: 9733509 },
      { name: 'Busan', lat: 35.1796, lng: 129.0756, population: 3429540 },
      { name: 'Incheon', lat: 37.4563, lng: 126.7052, population: 2957026 },
      { name: 'Daegu', lat: 35.8714, lng: 128.6014, population: 2438031 },
      { name: 'Daejeon', lat: 36.3504, lng: 127.3845, population: 1493979 },
      { name: 'Gwangju', lat: 35.1595, lng: 126.8526, population: 1459336 },
      { name: 'Suwon', lat: 37.2636, lng: 127.0286, population: 1194313 },
      { name: 'Ulsan', lat: 35.5384, lng: 129.3114, population: 1148019 },
      { name: 'Seongnam', lat: 37.4449, lng: 127.1389, population: 948757 },
      { name: 'Goyang', lat: 37.6584, lng: 126.8320, population: 1073069 },
      { name: 'Bucheon', lat: 37.5034, lng: 126.7660, population: 843794 },
      { name: 'Yongin', lat: 37.2411, lng: 127.1775, population: 1069727 },
      { name: 'Ansan', lat: 37.3219, lng: 126.8309, population: 656922 },
      { name: 'Cheongju', lat: 36.6424, lng: 127.4890, population: 843527 },
      { name: 'Jeonju', lat: 35.8219, lng: 127.1480, population: 658172 },
    ]
  },
  {
    code: 'NL',
    name: 'Netherlands',
    cities: [
      { name: 'Amsterdam', lat: 52.3676, lng: 4.9041, population: 872680 },
      { name: 'Rotterdam', lat: 51.9244, lng: 4.4777, population: 651446 },
      { name: 'The Hague', lat: 52.0705, lng: 4.3007, population: 545838 },
      { name: 'Utrecht', lat: 52.0907, lng: 5.1214, population: 357597 },
      { name: 'Eindhoven', lat: 51.4416, lng: 5.4697, population: 234235 },
      { name: 'Groningen', lat: 53.2194, lng: 6.5665, population: 232874 },
      { name: 'Tilburg', lat: 51.5555, lng: 5.0913, population: 219632 },
      { name: 'Almere', lat: 52.3508, lng: 5.2647, population: 211514 },
      { name: 'Breda', lat: 51.5719, lng: 4.7683, population: 184126 },
      { name: 'Nijmegen', lat: 51.8126, lng: 5.8372, population: 177501 },
      { name: 'Apeldoorn', lat: 52.2112, lng: 5.9699, population: 163351 },
      { name: 'Haarlem', lat: 52.3874, lng: 4.6462, population: 161265 },
      { name: 'Arnhem', lat: 51.9851, lng: 5.8987, population: 159265 },
      { name: 'Enschede', lat: 52.2215, lng: 6.8937, population: 158986 },
      { name: 'Amersfoort', lat: 52.1561, lng: 5.3878, population: 157276 },
    ]
  },
  {
    code: 'SE',
    name: 'Sweden',
    cities: [
      { name: 'Stockholm', lat: 59.3293, lng: 18.0686, population: 975551 },
      { name: 'Gothenburg', lat: 57.7089, lng: 11.9746, population: 583056 },
      { name: 'Malmo', lat: 55.6050, lng: 13.0038, population: 344166 },
      { name: 'Uppsala', lat: 59.8586, lng: 17.6389, population: 177074 },
      { name: 'Linkoping', lat: 58.4108, lng: 15.6214, population: 163051 },
      { name: 'Orebro', lat: 59.2753, lng: 15.2134, population: 155696 },
      { name: 'Vasteras', lat: 59.6162, lng: 16.5528, population: 154049 },
      { name: 'Helsingborg', lat: 56.0465, lng: 12.6945, population: 149280 },
      { name: 'Norrkoping', lat: 58.5877, lng: 16.1924, population: 143478 },
      { name: 'Jonkoping', lat: 57.7826, lng: 14.1618, population: 141081 },
    ]
  },
  {
    code: 'PL',
    name: 'Poland',
    cities: [
      { name: 'Warsaw', lat: 52.2297, lng: 21.0122, population: 1790658 },
      { name: 'Krakow', lat: 50.0647, lng: 19.9450, population: 779115 },
      { name: 'Lodz', lat: 51.7592, lng: 19.4560, population: 679941 },
      { name: 'Wroclaw', lat: 51.1079, lng: 17.0385, population: 643782 },
      { name: 'Poznan', lat: 52.4064, lng: 16.9252, population: 534813 },
      { name: 'Gdansk', lat: 54.3520, lng: 18.6466, population: 470907 },
      { name: 'Szczecin', lat: 53.4285, lng: 14.5528, population: 401907 },
      { name: 'Bydgoszcz', lat: 53.1235, lng: 18.0084, population: 348190 },
      { name: 'Lublin', lat: 51.2465, lng: 22.5684, population: 339850 },
      { name: 'Katowice', lat: 50.2649, lng: 19.0238, population: 292774 },
      { name: 'Bialystok', lat: 53.1325, lng: 23.1688, population: 297554 },
      { name: 'Gdynia', lat: 54.5189, lng: 18.5305, population: 246306 },
      { name: 'Czestochowa', lat: 50.8118, lng: 19.1203, population: 222292 },
      { name: 'Radom', lat: 51.4027, lng: 21.1471, population: 211371 },
      { name: 'Torun', lat: 53.0138, lng: 18.5984, population: 201447 },
    ]
  },
  {
    code: 'SG',
    name: 'Singapore',
    cities: [
      { name: 'Singapore', lat: 1.3521, lng: 103.8198, population: 5453600 },
      { name: 'Woodlands', lat: 1.4382, lng: 103.7891, population: 252530 },
      { name: 'Tampines', lat: 1.3496, lng: 103.9568, population: 256700 },
      { name: 'Jurong West', lat: 1.3404, lng: 103.7090, population: 262100 },
      { name: 'Sengkang', lat: 1.3868, lng: 103.8914, population: 226300 },
      { name: 'Hougang', lat: 1.3612, lng: 103.8863, population: 217100 },
    ]
  },
  {
    code: 'CH',
    name: 'Switzerland',
    cities: [
      { name: 'Zurich', lat: 47.3769, lng: 8.5417, population: 421878 },
      { name: 'Geneva', lat: 46.2044, lng: 6.1432, population: 203856 },
      { name: 'Basel', lat: 47.5596, lng: 7.5886, population: 178120 },
      { name: 'Lausanne', lat: 46.5197, lng: 6.6323, population: 139111 },
      { name: 'Bern', lat: 46.9481, lng: 7.4474, population: 134591 },
      { name: 'Winterthur', lat: 47.5001, lng: 8.7500, population: 114220 },
      { name: 'Lucerne', lat: 47.0502, lng: 8.3093, population: 82620 },
      { name: 'St. Gallen', lat: 47.4245, lng: 9.3767, population: 79804 },
      { name: 'Lugano', lat: 46.0037, lng: 8.9511, population: 63932 },
      { name: 'Biel', lat: 47.1368, lng: 7.2467, population: 55206 },
    ]
  },
  {
    code: 'RU',
    name: 'Russia',
    cities: [
      { name: 'Moscow', lat: 55.7558, lng: 37.6173, population: 12506468 },
      { name: 'Saint Petersburg', lat: 59.9343, lng: 30.3351, population: 5383890 },
      { name: 'Novosibirsk', lat: 55.0084, lng: 82.9357, population: 1612833 },
      { name: 'Yekaterinburg', lat: 56.8389, lng: 60.6057, population: 1495066 },
      { name: 'Kazan', lat: 55.7963, lng: 49.1088, population: 1257391 },
      { name: 'Nizhny Novgorod', lat: 56.2965, lng: 43.9361, population: 1250619 },
      { name: 'Chelyabinsk', lat: 55.1644, lng: 61.4368, population: 1196680 },
      { name: 'Samara', lat: 53.1959, lng: 50.1002, population: 1163399 },
      { name: 'Omsk', lat: 54.9885, lng: 73.3242, population: 1154116 },
      { name: 'Rostov-on-Don', lat: 47.2357, lng: 39.7015, population: 1137704 },
      { name: 'Ufa', lat: 54.7388, lng: 55.9721, population: 1128787 },
      { name: 'Krasnoyarsk', lat: 56.0097, lng: 92.8524, population: 1095286 },
      { name: 'Voronezh', lat: 51.6720, lng: 39.1843, population: 1054111 },
      { name: 'Perm', lat: 58.0105, lng: 56.2502, population: 1048005 },
      { name: 'Volgograd', lat: 48.7080, lng: 44.5133, population: 1021215 },
    ]
  },
  {
    code: 'ZA',
    name: 'South Africa',
    cities: [
      { name: 'Johannesburg', lat: -26.2041, lng: 28.0473, population: 5635127 },
      { name: 'Cape Town', lat: -33.9249, lng: 18.4241, population: 4617560 },
      { name: 'Durban', lat: -29.8587, lng: 31.0218, population: 3720953 },
      { name: 'Pretoria', lat: -25.7479, lng: 28.2293, population: 2921488 },
      { name: 'Port Elizabeth', lat: -33.9608, lng: 25.6022, population: 1263930 },
      { name: 'Bloemfontein', lat: -29.0852, lng: 26.1596, population: 759693 },
      { name: 'East London', lat: -33.0153, lng: 27.9116, population: 478676 },
      { name: 'Polokwane', lat: -23.9045, lng: 29.4688, population: 628999 },
      { name: 'Nelspruit', lat: -25.4753, lng: 30.9694, population: 110711 },
      { name: 'Kimberley', lat: -28.7323, lng: 24.7623, population: 227647 },
    ]
  },
  {
    code: 'TH',
    name: 'Thailand',
    cities: [
      { name: 'Bangkok', lat: 13.7563, lng: 100.5018, population: 10539000 },
      { name: 'Chiang Mai', lat: 18.7883, lng: 98.9853, population: 131091 },
      { name: 'Pattaya', lat: 12.9236, lng: 100.8825, population: 119532 },
      { name: 'Nonthaburi', lat: 13.8591, lng: 100.5215, population: 270609 },
      { name: 'Hat Yai', lat: 7.0086, lng: 100.4747, population: 158218 },
      { name: 'Khon Kaen', lat: 16.4322, lng: 102.8236, population: 141034 },
      { name: 'Udon Thani', lat: 17.4138, lng: 102.7870, population: 130274 },
      { name: 'Nakhon Ratchasima', lat: 14.9799, lng: 102.0978, population: 174332 },
      { name: 'Phuket', lat: 7.8804, lng: 98.3923, population: 83000 },
      { name: 'Chiang Rai', lat: 19.9105, lng: 99.8406, population: 74173 },
    ]
  },
  {
    code: 'PH',
    name: 'Philippines',
    cities: [
      { name: 'Manila', lat: 14.5995, lng: 120.9842, population: 1780148 },
      { name: 'Quezon City', lat: 14.6760, lng: 121.0437, population: 2960048 },
      { name: 'Davao', lat: 7.1907, lng: 125.4553, population: 1632991 },
      { name: 'Cebu City', lat: 10.3157, lng: 123.8854, population: 922611 },
      { name: 'Zamboanga', lat: 6.9214, lng: 122.0790, population: 861799 },
      { name: 'Makati', lat: 14.5547, lng: 121.0244, population: 582602 },
      { name: 'Pasig', lat: 14.5764, lng: 121.0851, population: 803159 },
      { name: 'Taguig', lat: 14.5176, lng: 121.0509, population: 886722 },
      { name: 'Antipolo', lat: 14.6256, lng: 121.1245, population: 887399 },
      { name: 'Cagayan de Oro', lat: 8.4542, lng: 124.6319, population: 675950 },
    ]
  },
  {
    code: 'VN',
    name: 'Vietnam',
    cities: [
      { name: 'Ho Chi Minh City', lat: 10.8231, lng: 106.6297, population: 8993082 },
      { name: 'Hanoi', lat: 21.0285, lng: 105.8542, population: 8053663 },
      { name: 'Da Nang', lat: 16.0471, lng: 108.2062, population: 1134310 },
      { name: 'Hai Phong', lat: 20.8449, lng: 106.6881, population: 2028514 },
      { name: 'Can Tho', lat: 10.0452, lng: 105.7469, population: 1235171 },
      { name: 'Bien Hoa', lat: 10.9574, lng: 106.8426, population: 1104495 },
      { name: 'Nha Trang', lat: 12.2388, lng: 109.1967, population: 422601 },
      { name: 'Hue', lat: 16.4637, lng: 107.5909, population: 356468 },
      { name: 'Da Lat', lat: 11.9404, lng: 108.4583, population: 226978 },
      { name: 'Vung Tau', lat: 10.4114, lng: 107.1362, population: 327025 },
    ]
  },
  {
    code: 'ID',
    name: 'Indonesia',
    cities: [
      { name: 'Jakarta', lat: -6.2088, lng: 106.8456, population: 10562088 },
      { name: 'Surabaya', lat: -7.2575, lng: 112.7521, population: 2874699 },
      { name: 'Bandung', lat: -6.9175, lng: 107.6191, population: 2575478 },
      { name: 'Medan', lat: 3.5952, lng: 98.6722, population: 2435252 },
      { name: 'Semarang', lat: -6.9666, lng: 110.4196, population: 1786114 },
      { name: 'Makassar', lat: -5.1477, lng: 119.4327, population: 1526677 },
      { name: 'Palembang', lat: -2.9761, lng: 104.7754, population: 1708413 },
      { name: 'Depok', lat: -6.4025, lng: 106.7942, population: 2484186 },
      { name: 'Tangerang', lat: -6.1781, lng: 106.6319, population: 2139891 },
      { name: 'Denpasar', lat: -8.6705, lng: 115.2126, population: 788445 },
      { name: 'Yogyakarta', lat: -7.7956, lng: 110.3695, population: 422732 },
      { name: 'Batam', lat: 1.0456, lng: 104.0305, population: 1153860 },
    ]
  },
  {
    code: 'MY',
    name: 'Malaysia',
    cities: [
      { name: 'Kuala Lumpur', lat: 3.1390, lng: 101.6869, population: 1768000 },
      { name: 'George Town', lat: 5.4141, lng: 100.3288, population: 708127 },
      { name: 'Johor Bahru', lat: 1.4927, lng: 103.7414, population: 497097 },
      { name: 'Ipoh', lat: 4.5975, lng: 101.0901, population: 657892 },
      { name: 'Shah Alam', lat: 3.0733, lng: 101.5185, population: 541306 },
      { name: 'Petaling Jaya', lat: 3.1073, lng: 101.6067, population: 638516 },
      { name: 'Kuching', lat: 1.5535, lng: 110.3593, population: 570407 },
      { name: 'Kota Kinabalu', lat: 5.9804, lng: 116.0735, population: 452058 },
      { name: 'Melaka', lat: 2.1896, lng: 102.2501, population: 484885 },
      { name: 'Seremban', lat: 2.7259, lng: 101.9424, population: 419536 },
    ]
  },
  {
    code: 'AE',
    name: 'United Arab Emirates',
    cities: [
      { name: 'Dubai', lat: 25.2048, lng: 55.2708, population: 3331420 },
      { name: 'Abu Dhabi', lat: 24.4539, lng: 54.3773, population: 1483000 },
      { name: 'Sharjah', lat: 25.3463, lng: 55.4209, population: 1274749 },
      { name: 'Al Ain', lat: 24.2075, lng: 55.7447, population: 766936 },
      { name: 'Ajman', lat: 25.4052, lng: 55.5136, population: 490035 },
      { name: 'Ras Al Khaimah', lat: 25.7895, lng: 55.9432, population: 115949 },
      { name: 'Fujairah', lat: 25.1288, lng: 56.3265, population: 62415 },
    ]
  },
  {
    code: 'NZ',
    name: 'New Zealand',
    cities: [
      { name: 'Auckland', lat: -36.8509, lng: 174.7645, population: 1657200 },
      { name: 'Wellington', lat: -41.2865, lng: 174.7762, population: 215400 },
      { name: 'Christchurch', lat: -43.5321, lng: 172.6362, population: 381500 },
      { name: 'Hamilton', lat: -37.7870, lng: 175.2793, population: 176500 },
      { name: 'Tauranga', lat: -37.6878, lng: 176.1651, population: 155200 },
      { name: 'Dunedin', lat: -45.8788, lng: 170.5028, population: 134100 },
      { name: 'Palmerston North', lat: -40.3523, lng: 175.6082, population: 88300 },
      { name: 'Napier', lat: -39.4928, lng: 176.9120, population: 65000 },
      { name: 'Rotorua', lat: -38.1368, lng: 176.2497, population: 58300 },
      { name: 'Queenstown', lat: -45.0302, lng: 168.6615, population: 15500 },
    ]
  },
  {
    code: 'AR',
    name: 'Argentina',
    cities: [
      { name: 'Buenos Aires', lat: -34.6037, lng: -58.3816, population: 2890151 },
      { name: 'Cordoba', lat: -31.4201, lng: -64.1888, population: 1329604 },
      { name: 'Rosario', lat: -32.9587, lng: -60.6930, population: 1193605 },
      { name: 'Mendoza', lat: -32.8895, lng: -68.8458, population: 937154 },
      { name: 'San Miguel de Tucuman', lat: -26.8083, lng: -65.2176, population: 800000 },
      { name: 'La Plata', lat: -34.9215, lng: -57.9545, population: 787294 },
      { name: 'Mar del Plata', lat: -38.0023, lng: -57.5575, population: 614350 },
      { name: 'Salta', lat: -24.7883, lng: -65.4106, population: 535303 },
      { name: 'Santa Fe', lat: -31.6333, lng: -60.7000, population: 391231 },
      { name: 'San Juan', lat: -31.5375, lng: -68.5364, population: 471389 },
    ]
  },
  {
    code: 'CL',
    name: 'Chile',
    cities: [
      { name: 'Santiago', lat: -33.4489, lng: -70.6693, population: 5614000 },
      { name: 'Valparaiso', lat: -33.0472, lng: -71.6127, population: 284630 },
      { name: 'Concepcion', lat: -36.8270, lng: -73.0503, population: 223574 },
      { name: 'Antofagasta', lat: -23.6509, lng: -70.3975, population: 390832 },
      { name: 'Vina del Mar', lat: -33.0245, lng: -71.5518, population: 286931 },
      { name: 'Temuco', lat: -38.7396, lng: -72.5984, population: 282415 },
      { name: 'Puerto Montt', lat: -41.4689, lng: -72.9411, population: 245902 },
      { name: 'La Serena', lat: -29.9027, lng: -71.2520, population: 221054 },
      { name: 'Iquique', lat: -20.2307, lng: -70.1356, population: 191468 },
      { name: 'Rancagua', lat: -34.1701, lng: -70.7444, population: 232524 },
    ]
  },
  {
    code: 'CO',
    name: 'Colombia',
    cities: [
      { name: 'Bogota', lat: 4.7110, lng: -74.0721, population: 7181469 },
      { name: 'Medellin', lat: 6.2518, lng: -75.5636, population: 2529403 },
      { name: 'Cali', lat: 3.4516, lng: -76.5320, population: 2227642 },
      { name: 'Barranquilla', lat: 10.9639, lng: -74.7964, population: 1206319 },
      { name: 'Cartagena', lat: 10.3910, lng: -75.4794, population: 973045 },
      { name: 'Cucuta', lat: 7.8939, lng: -72.5078, population: 662765 },
      { name: 'Bucaramanga', lat: 7.1193, lng: -73.1227, population: 528575 },
      { name: 'Pereira', lat: 4.8143, lng: -75.6946, population: 474335 },
      { name: 'Santa Marta', lat: 11.2408, lng: -74.1990, population: 499267 },
      { name: 'Ibague', lat: 4.4389, lng: -75.2322, population: 558805 },
    ]
  },
  {
    code: 'PE',
    name: 'Peru',
    cities: [
      { name: 'Lima', lat: -12.0464, lng: -77.0428, population: 9751717 },
      { name: 'Arequipa', lat: -16.4090, lng: -71.5375, population: 1008290 },
      { name: 'Trujillo', lat: -8.1116, lng: -79.0289, population: 919899 },
      { name: 'Chiclayo', lat: -6.7714, lng: -79.8409, population: 600440 },
      { name: 'Piura', lat: -5.1945, lng: -80.6328, population: 436440 },
      { name: 'Iquitos', lat: -3.7491, lng: -73.2538, population: 437376 },
      { name: 'Cusco', lat: -13.5319, lng: -71.9675, population: 428450 },
      { name: 'Huancayo', lat: -12.0651, lng: -75.2049, population: 376657 },
      { name: 'Tacna', lat: -18.0146, lng: -70.2536, population: 293000 },
      { name: 'Pucallpa', lat: -8.3791, lng: -74.5539, population: 326040 },
    ]
  },
  {
    code: 'EG',
    name: 'Egypt',
    cities: [
      { name: 'Cairo', lat: 30.0444, lng: 31.2357, population: 10230350 },
      { name: 'Alexandria', lat: 31.2001, lng: 29.9187, population: 5200000 },
      { name: 'Giza', lat: 30.0131, lng: 31.2089, population: 3628062 },
      { name: 'Shubra El Kheima', lat: 30.1286, lng: 31.2422, population: 1099354 },
      { name: 'Port Said', lat: 31.2653, lng: 32.3019, population: 749371 },
      { name: 'Suez', lat: 29.9668, lng: 32.5498, population: 728180 },
      { name: 'Luxor', lat: 25.6872, lng: 32.6396, population: 506588 },
      { name: 'Aswan', lat: 24.0889, lng: 32.8998, population: 290327 },
      { name: 'Ismailia', lat: 30.5965, lng: 32.2715, population: 366398 },
      { name: 'Fayoum', lat: 29.3084, lng: 30.8428, population: 349883 },
    ]
  },
  {
    code: 'NG',
    name: 'Nigeria',
    cities: [
      { name: 'Lagos', lat: 6.5244, lng: 3.3792, population: 14862000 },
      { name: 'Kano', lat: 12.0022, lng: 8.5920, population: 3626068 },
      { name: 'Ibadan', lat: 7.3775, lng: 3.9470, population: 3565108 },
      { name: 'Abuja', lat: 9.0765, lng: 7.3986, population: 3464123 },
      { name: 'Port Harcourt', lat: 4.8156, lng: 7.0498, population: 1865000 },
      { name: 'Benin City', lat: 6.3350, lng: 5.6037, population: 1496000 },
      { name: 'Kaduna', lat: 10.5264, lng: 7.4388, population: 1582000 },
      { name: 'Maiduguri', lat: 11.8311, lng: 13.1510, population: 803000 },
      { name: 'Zaria', lat: 11.0855, lng: 7.7199, population: 736000 },
      { name: 'Aba', lat: 5.1066, lng: 7.3667, population: 534265 },
    ]
  },
  {
    code: 'KE',
    name: 'Kenya',
    cities: [
      { name: 'Nairobi', lat: -1.2921, lng: 36.8219, population: 4397073 },
      { name: 'Mombasa', lat: -4.0435, lng: 39.6682, population: 1208333 },
      { name: 'Kisumu', lat: -0.0917, lng: 34.7680, population: 409928 },
      { name: 'Nakuru', lat: -0.3031, lng: 36.0800, population: 367183 },
      { name: 'Eldoret', lat: 0.5143, lng: 35.2698, population: 289380 },
      { name: 'Thika', lat: -1.0334, lng: 37.0690, population: 200000 },
      { name: 'Malindi', lat: -3.2138, lng: 40.1169, population: 119859 },
      { name: 'Nyeri', lat: -0.4197, lng: 36.9553, population: 125357 },
      { name: 'Machakos', lat: -1.5177, lng: 37.2634, population: 150041 },
      { name: 'Lamu', lat: -2.2686, lng: 40.9020, population: 24000 },
    ]
  },
  {
    code: 'IL',
    name: 'Israel',
    cities: [
      { name: 'Jerusalem', lat: 31.7683, lng: 35.2137, population: 936425 },
      { name: 'Tel Aviv', lat: 32.0853, lng: 34.7818, population: 460613 },
      { name: 'Haifa', lat: 32.7940, lng: 34.9896, population: 285316 },
      { name: 'Rishon LeZion', lat: 31.9730, lng: 34.7925, population: 254384 },
      { name: 'Petah Tikva', lat: 32.0841, lng: 34.8878, population: 244519 },
      { name: 'Ashdod', lat: 31.8044, lng: 34.6553, population: 222883 },
      { name: 'Netanya', lat: 32.3215, lng: 34.8532, population: 221353 },
      { name: 'Beer Sheva', lat: 31.2518, lng: 34.7913, population: 209687 },
      { name: 'Holon', lat: 32.0158, lng: 34.7799, population: 196282 },
      { name: 'Bnei Brak', lat: 32.0833, lng: 34.8333, population: 204639 },
    ]
  },
  {
    code: 'TR',
    name: 'Turkey',
    cities: [
      { name: 'Istanbul', lat: 41.0082, lng: 28.9784, population: 15462452 },
      { name: 'Ankara', lat: 39.9334, lng: 32.8597, population: 5639076 },
      { name: 'Izmir', lat: 38.4189, lng: 27.1287, population: 4367251 },
      { name: 'Bursa', lat: 40.1827, lng: 29.0665, population: 3056120 },
      { name: 'Adana', lat: 36.9914, lng: 35.3308, population: 2237940 },
      { name: 'Gaziantep', lat: 37.0662, lng: 37.3833, population: 2069364 },
      { name: 'Konya', lat: 37.8746, lng: 32.4932, population: 2232374 },
      { name: 'Antalya', lat: 36.8969, lng: 30.7133, population: 2511700 },
      { name: 'Kayseri', lat: 38.7312, lng: 35.4787, population: 1389680 },
      { name: 'Mersin', lat: 36.8121, lng: 34.6415, population: 1840425 },
    ]
  },
  {
    code: 'UA',
    name: 'Ukraine',
    cities: [
      { name: 'Kyiv', lat: 50.4501, lng: 30.5234, population: 2962180 },
      { name: 'Kharkiv', lat: 49.9935, lng: 36.2304, population: 1433886 },
      { name: 'Odesa', lat: 46.4825, lng: 30.7233, population: 1017699 },
      { name: 'Dnipro', lat: 48.4647, lng: 35.0462, population: 980948 },
      { name: 'Donetsk', lat: 48.0159, lng: 37.8028, population: 905364 },
      { name: 'Zaporizhzhia', lat: 47.8388, lng: 35.1396, population: 746749 },
      { name: 'Lviv', lat: 49.8397, lng: 24.0297, population: 721301 },
      { name: 'Kryvyi Rih', lat: 47.9105, lng: 33.3918, population: 624579 },
      { name: 'Mykolaiv', lat: 46.9659, lng: 31.9974, population: 480080 },
      { name: 'Mariupol', lat: 47.0951, lng: 37.5494, population: 449498 },
    ]
  },
  {
    code: 'GR',
    name: 'Greece',
    cities: [
      { name: 'Athens', lat: 37.9838, lng: 23.7275, population: 664046 },
      { name: 'Thessaloniki', lat: 40.6401, lng: 22.9444, population: 315196 },
      { name: 'Patras', lat: 38.2466, lng: 21.7346, population: 167446 },
      { name: 'Piraeus', lat: 37.9475, lng: 23.6469, population: 163688 },
      { name: 'Larissa', lat: 39.6390, lng: 22.4174, population: 144651 },
      { name: 'Heraklion', lat: 35.3387, lng: 25.1442, population: 140730 },
      { name: 'Volos', lat: 39.3667, lng: 22.9333, population: 86046 },
      { name: 'Rhodes', lat: 36.4341, lng: 28.2176, population: 49541 },
      { name: 'Ioannina', lat: 39.6650, lng: 20.8537, population: 65574 },
      { name: 'Chania', lat: 35.5138, lng: 24.0180, population: 55838 },
    ]
  },
  {
    code: 'PT',
    name: 'Portugal',
    cities: [
      { name: 'Lisbon', lat: 38.7223, lng: -9.1393, population: 504718 },
      { name: 'Porto', lat: 41.1579, lng: -8.6291, population: 237591 },
      { name: 'Braga', lat: 41.5503, lng: -8.4200, population: 136885 },
      { name: 'Amadora', lat: 38.7579, lng: -9.2245, population: 175136 },
      { name: 'Coimbra', lat: 40.2033, lng: -8.4103, population: 106582 },
      { name: 'Funchal', lat: 32.6669, lng: -16.9241, population: 105795 },
      { name: 'Setúbal', lat: 38.5254, lng: -8.8941, population: 98131 },
      { name: 'Almada', lat: 38.6790, lng: -9.1565, population: 96404 },
      { name: 'Faro', lat: 37.0194, lng: -7.9322, population: 64560 },
      { name: 'Aveiro', lat: 40.6443, lng: -8.6455, population: 55291 },
    ]
  },
  {
    code: 'AT',
    name: 'Austria',
    cities: [
      { name: 'Vienna', lat: 48.2082, lng: 16.3738, population: 1897491 },
      { name: 'Graz', lat: 47.0707, lng: 15.4395, population: 291072 },
      { name: 'Linz', lat: 48.3069, lng: 14.2858, population: 205726 },
      { name: 'Salzburg', lat: 47.8095, lng: 13.0550, population: 155021 },
      { name: 'Innsbruck', lat: 47.2692, lng: 11.4041, population: 132493 },
      { name: 'Klagenfurt', lat: 46.6228, lng: 14.3052, population: 101765 },
      { name: 'Villach', lat: 46.6167, lng: 13.8500, population: 63516 },
      { name: 'Wels', lat: 48.1575, lng: 14.0289, population: 62470 },
      { name: 'Sankt Polten', lat: 48.2047, lng: 15.6256, population: 55155 },
      { name: 'Dornbirn', lat: 47.4167, lng: 9.7417, population: 49872 },
    ]
  },
  {
    code: 'BE',
    name: 'Belgium',
    cities: [
      { name: 'Brussels', lat: 50.8503, lng: 4.3517, population: 1208542 },
      { name: 'Antwerp', lat: 51.2194, lng: 4.4025, population: 529247 },
      { name: 'Ghent', lat: 51.0543, lng: 3.7174, population: 262219 },
      { name: 'Charleroi', lat: 50.4108, lng: 4.4446, population: 201300 },
      { name: 'Liege', lat: 50.6326, lng: 5.5797, population: 197355 },
      { name: 'Bruges', lat: 51.2093, lng: 3.2247, population: 118509 },
      { name: 'Namur', lat: 50.4669, lng: 4.8675, population: 111774 },
      { name: 'Leuven', lat: 50.8798, lng: 4.7005, population: 101032 },
      { name: 'Mons', lat: 50.4542, lng: 3.9523, population: 95299 },
      { name: 'Aalst', lat: 50.9364, lng: 4.0355, population: 86445 },
    ]
  },
  {
    code: 'DK',
    name: 'Denmark',
    cities: [
      { name: 'Copenhagen', lat: 55.6761, lng: 12.5683, population: 632340 },
      { name: 'Aarhus', lat: 56.1629, lng: 10.2039, population: 349983 },
      { name: 'Odense', lat: 55.4038, lng: 10.4024, population: 204895 },
      { name: 'Aalborg', lat: 57.0488, lng: 9.9217, population: 217075 },
      { name: 'Frederiksberg', lat: 55.6786, lng: 12.5305, population: 104305 },
      { name: 'Esbjerg', lat: 55.4700, lng: 8.4519, population: 72205 },
      { name: 'Randers', lat: 56.4607, lng: 10.0362, population: 62482 },
      { name: 'Kolding', lat: 55.4904, lng: 9.4722, population: 60508 },
      { name: 'Horsens', lat: 55.8607, lng: 9.8503, population: 59449 },
      { name: 'Vejle', lat: 55.7113, lng: 9.5364, population: 57655 },
    ]
  },
  {
    code: 'NO',
    name: 'Norway',
    cities: [
      { name: 'Oslo', lat: 59.9139, lng: 10.7522, population: 693494 },
      { name: 'Bergen', lat: 60.3913, lng: 5.3221, population: 283929 },
      { name: 'Trondheim', lat: 63.4305, lng: 10.3951, population: 205163 },
      { name: 'Stavanger', lat: 58.9700, lng: 5.7314, population: 144147 },
      { name: 'Drammen', lat: 59.7439, lng: 10.2045, population: 69733 },
      { name: 'Fredrikstad', lat: 59.2181, lng: 10.9298, population: 82385 },
      { name: 'Kristiansand', lat: 58.1599, lng: 8.0182, population: 112745 },
      { name: 'Sandnes', lat: 58.8520, lng: 5.7352, population: 79537 },
      { name: 'Tromso', lat: 69.6496, lng: 18.9560, population: 77095 },
      { name: 'Sarpsborg', lat: 59.2833, lng: 11.1167, population: 56732 },
    ]
  },
  {
    code: 'FI',
    name: 'Finland',
    cities: [
      { name: 'Helsinki', lat: 60.1699, lng: 24.9384, population: 656229 },
      { name: 'Espoo', lat: 60.2055, lng: 24.6559, population: 292796 },
      { name: 'Tampere', lat: 61.4978, lng: 23.7610, population: 244029 },
      { name: 'Vantaa', lat: 60.2934, lng: 25.0378, population: 236485 },
      { name: 'Oulu', lat: 65.0121, lng: 25.4651, population: 207327 },
      { name: 'Turku', lat: 60.4518, lng: 22.2666, population: 194244 },
      { name: 'Jyvaskyla', lat: 62.2426, lng: 25.7473, population: 142400 },
      { name: 'Lahti', lat: 60.9827, lng: 25.6612, population: 120027 },
      { name: 'Kuopio', lat: 62.8924, lng: 27.6770, population: 119282 },
      { name: 'Pori', lat: 61.4847, lng: 21.7972, population: 83497 },
    ]
  },
  {
    code: 'IE',
    name: 'Ireland',
    cities: [
      { name: 'Dublin', lat: 53.3498, lng: -6.2603, population: 1173179 },
      { name: 'Cork', lat: 51.8985, lng: -8.4756, population: 210328 },
      { name: 'Limerick', lat: 52.6680, lng: -8.6305, population: 94192 },
      { name: 'Galway', lat: 53.2707, lng: -9.0568, population: 83056 },
      { name: 'Waterford', lat: 52.2593, lng: -7.1101, population: 53504 },
      { name: 'Drogheda', lat: 53.7179, lng: -6.3561, population: 40956 },
      { name: 'Swords', lat: 53.4597, lng: -6.2181, population: 42738 },
      { name: 'Dundalk', lat: 54.0000, lng: -6.4167, population: 39004 },
      { name: 'Bray', lat: 53.2028, lng: -6.0986, population: 32600 },
      { name: 'Navan', lat: 53.6529, lng: -6.6812, population: 30173 },
    ]
  },
  {
    code: 'CZ',
    name: 'Czech Republic',
    cities: [
      { name: 'Prague', lat: 50.0755, lng: 14.4378, population: 1309000 },
      { name: 'Brno', lat: 49.1951, lng: 16.6068, population: 382405 },
      { name: 'Ostrava', lat: 49.8209, lng: 18.2625, population: 287968 },
      { name: 'Plzen', lat: 49.7384, lng: 13.3736, population: 174842 },
      { name: 'Liberec', lat: 50.7663, lng: 15.0543, population: 104261 },
      { name: 'Olomouc', lat: 49.5938, lng: 17.2509, population: 100663 },
      { name: 'Ceske Budejovice', lat: 48.9747, lng: 14.4747, population: 94462 },
      { name: 'Hradec Kralove', lat: 50.2104, lng: 15.8327, population: 92687 },
      { name: 'Usti nad Labem', lat: 50.6607, lng: 14.0323, population: 92027 },
      { name: 'Pardubice', lat: 50.0343, lng: 15.7812, population: 90688 },
    ]
  },
  {
    code: 'HU',
    name: 'Hungary',
    cities: [
      { name: 'Budapest', lat: 47.4979, lng: 19.0402, population: 1752286 },
      { name: 'Debrecen', lat: 47.5316, lng: 21.6273, population: 201981 },
      { name: 'Szeged', lat: 46.2530, lng: 20.1414, population: 160766 },
      { name: 'Miskolc', lat: 48.1035, lng: 20.7784, population: 154521 },
      { name: 'Pecs', lat: 46.0727, lng: 18.2323, population: 142873 },
      { name: 'Gyor', lat: 47.6875, lng: 17.6504, population: 132038 },
      { name: 'Nyiregyhaza', lat: 47.9554, lng: 21.7167, population: 117659 },
      { name: 'Kecskemet', lat: 46.8964, lng: 19.6897, population: 111411 },
      { name: 'Szekesfehervar', lat: 47.1860, lng: 18.4221, population: 97451 },
      { name: 'Szombathely', lat: 47.2307, lng: 16.6218, population: 77566 },
    ]
  },
  {
    code: 'RO',
    name: 'Romania',
    cities: [
      { name: 'Bucharest', lat: 44.4268, lng: 26.1025, population: 1883425 },
      { name: 'Cluj-Napoca', lat: 46.7712, lng: 23.6236, population: 324576 },
      { name: 'Timisoara', lat: 45.7489, lng: 21.2087, population: 319279 },
      { name: 'Iasi', lat: 47.1585, lng: 27.6014, population: 290422 },
      { name: 'Constanta', lat: 44.1598, lng: 28.6348, population: 283872 },
      { name: 'Craiova', lat: 44.3302, lng: 23.7949, population: 269506 },
      { name: 'Brasov', lat: 45.6579, lng: 25.6012, population: 253200 },
      { name: 'Galati', lat: 45.4353, lng: 28.0080, population: 249432 },
      { name: 'Ploiesti', lat: 44.9416, lng: 26.0133, population: 209945 },
      { name: 'Oradea', lat: 47.0722, lng: 21.9211, population: 196367 },
    ]
  }
]

/**
 * Get all cities as flat array with country info
 */
export function getAllCities(): (CityData & { country_code: string; country_name: string; id: string })[] {
  const cities: (CityData & { country_code: string; country_name: string; id: string })[] = []

  for (const country of COUNTRIES) {
    for (const city of country.cities) {
      const isTop1000 = TOP_CITIES.has(city.name)
      cities.push({
        ...city,
        isTop1000,
        country_code: country.code,
        country_name: country.name,
        id: `city_${country.code.toLowerCase()}_${city.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`
      })
    }
  }

  return cities
}

/**
 * Get total city count
 */
export function getCityCount(): number {
  return COUNTRIES.reduce((sum, country) => sum + country.cities.length, 0)
}

/**
 * Get country count
 */
export function getCountryCount(): number {
  return COUNTRIES.length
}
