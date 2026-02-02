"use client"
import { useEffect, useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Globe, Search, MapPin, AlertCircle, ChevronDown } from "lucide-react"
import Input from "../ui/Input"

interface CountryWithAvailability {
  country_code: string
  country_name: string
  available_count: number
  total_count: number
}

interface CountrySelectorProps {
  value?: string
  onChange: (countryCode: string, countryName: string) => void
}

// Continent groupings for better UX
const CONTINENT_GROUPS: Record<string, string[]> = {
  "North America": ["US", "CA", "MX", "GT", "CU", "DO", "HN", "NI", "SV", "CR", "PA", "JM", "HT", "BS", "TT", "BB", "BZ"],
  "South America": ["BR", "AR", "CO", "PE", "VE", "CL", "EC", "BO", "PY", "UY", "GY", "SR"],
  "Europe": ["GB", "DE", "FR", "IT", "ES", "PL", "RO", "NL", "BE", "GR", "CZ", "PT", "SE", "HU", "AT", "CH", "BG", "DK", "FI", "SK", "NO", "IE", "HR", "LT", "SI", "LV", "EE", "CY", "LU", "MT", "IS", "AD", "MC", "SM", "LI", "RS", "BA", "AL", "MK", "ME", "XK", "MD", "BY", "UA", "RU"],
  "Asia": ["CN", "JP", "IN", "ID", "PK", "BD", "VN", "PH", "TH", "MY", "KR", "MM", "AF", "IQ", "SA", "YE", "SY", "AE", "IL", "JO", "LB", "KW", "OM", "QA", "BH", "NP", "LK", "KH", "LA", "SG", "BN", "MN", "KP", "TW", "HK", "MO", "TJ", "KG", "TM", "UZ", "KZ", "AZ", "AM", "GE", "TR", "IR"],
  "Africa": ["NG", "ET", "EG", "CD", "TZ", "ZA", "KE", "UG", "DZ", "SD", "MA", "AO", "GH", "MZ", "MG", "CM", "CI", "NE", "BF", "ML", "MW", "ZM", "SN", "ZW", "SO", "TD", "GN", "RW", "BJ", "BI", "TN", "SS", "TG", "SL", "LY", "CG", "LR", "CF", "MR", "ER", "NA", "GM", "BW", "GA", "LS", "GW", "GQ", "MU", "SZ", "DJ", "KM", "CV", "ST", "SC"],
  "Oceania": ["AU", "PG", "NZ", "FJ", "SB", "VU", "WS", "KI", "FM", "TO", "MH", "PW", "NR", "TV"]
}

function getContinentForCountry(countryCode: string): string {
  for (const [continent, codes] of Object.entries(CONTINENT_GROUPS)) {
    if (codes.includes(countryCode)) return continent
  }
  return "Other"
}

export default function CountrySelector({ value, onChange }: CountrySelectorProps) {
  const [countries, setCountries] = useState<CountryWithAvailability[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    async function fetchCountries() {
      try {
        setLoading(true)
        const res = await fetch("/api/cities?countries=true")
        const data = await res.json()
        if (data.success && data.countries) {
          setCountries(data.countries)
        } else {
          setError("Failed to load countries")
        }
      } catch {
        setError("Failed to connect to server")
      } finally {
        setLoading(false)
      }
    }
    fetchCountries()
  }, [])

  // Filter and group countries
  const filteredAndGrouped = useMemo(() => {
    const filtered = countries.filter(c =>
      c.country_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.country_code.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Group by continent
    const grouped: Record<string, CountryWithAvailability[]> = {}
    for (const country of filtered) {
      const continent = getContinentForCountry(country.country_code)
      if (!grouped[continent]) grouped[continent] = []
      grouped[continent].push(country)
    }

    // Sort within each group by available count
    for (const continent of Object.keys(grouped)) {
      grouped[continent].sort((a, b) => b.available_count - a.available_count)
    }

    return grouped
  }, [countries, searchQuery])

  const selectedCountry = countries.find(c => c.country_code === value)

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="glass rounded-xl p-6 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
            <span className="text-slate-400">Loading available countries...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="glass rounded-xl p-6 border border-red-500/30">
          <div className="flex items-center gap-3 text-red-400">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Info banner */}
      <div className="glass rounded-xl p-4 border border-neon-cyan/30">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-neon-cyan/20 flex items-center justify-center flex-shrink-0">
            <Globe className="w-5 h-5 text-neon-cyan" />
          </div>
          <div>
            <p className="text-white font-medium">City Territory System</p>
            <p className="text-sm text-slate-400 mt-1">
              Select a country and you&apos;ll be assigned a random available city.
              Each city can only have one agent - it&apos;s your exclusive territory!
            </p>
          </div>
        </div>
      </div>

      {/* Country selector dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full glass rounded-xl p-4 flex items-center justify-between hover:border-neon-cyan/50 transition-colors text-left"
        >
          {selectedCountry ? (
            <div className="flex items-center gap-3">
              <span className="text-2xl">{getFlagEmoji(selectedCountry.country_code)}</span>
              <div>
                <p className="text-white font-medium">{selectedCountry.country_name}</p>
                <p className="text-sm text-slate-400">
                  {selectedCountry.available_count} cities available
                </p>
              </div>
            </div>
          ) : (
            <span className="text-slate-400">Select a country...</span>
          )}
          <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-50 w-full mt-2 glass rounded-xl border border-slate-700 overflow-hidden"
            >
              {/* Search */}
              <div className="p-3 border-b border-slate-700">
                <Input
                  placeholder="Search countries..."
                  icon={<Search className="w-4 h-4" />}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>

              {/* Country list */}
              <div className="max-h-[400px] overflow-y-auto">
                {Object.entries(filteredAndGrouped).map(([continent, countryList]) => (
                  <div key={continent}>
                    <div className="px-4 py-2 bg-slate-800/50 text-xs font-semibold text-slate-400 uppercase tracking-wider sticky top-0">
                      {continent}
                    </div>
                    {countryList.map((country) => (
                      <button
                        key={country.country_code}
                        type="button"
                        onClick={() => {
                          onChange(country.country_code, country.country_name)
                          setIsOpen(false)
                          setSearchQuery("")
                        }}
                        className={`w-full px-4 py-3 flex items-center justify-between hover:bg-slate-800/50 transition-colors ${
                          value === country.country_code ? "bg-neon-cyan/10" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{getFlagEmoji(country.country_code)}</span>
                          <span className="text-white">{country.country_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm ${
                            country.available_count > 10 ? "text-green-400" :
                            country.available_count > 3 ? "text-yellow-400" :
                            "text-orange-400"
                          }`}>
                            {country.available_count} available
                          </span>
                          {value === country.country_code && (
                            <div className="w-2 h-2 rounded-full bg-neon-cyan" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                ))}

                {Object.keys(filteredAndGrouped).length === 0 && (
                  <div className="p-6 text-center text-slate-400">
                    No countries found matching &quot;{searchQuery}&quot;
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Selected country details */}
      {selectedCountry && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-neon-cyan/20 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-neon-cyan" />
            </div>
            <div>
              <p className="text-white font-medium">
                You&apos;ll be assigned a random city in {selectedCountry.country_name}
              </p>
              <p className="text-sm text-slate-400">
                {selectedCountry.available_count} of {selectedCountry.total_count} cities available
              </p>
            </div>
          </div>

          {selectedCountry.available_count < 5 && (
            <div className="mt-3 flex items-center gap-2 text-sm text-orange-400">
              <AlertCircle className="w-4 h-4" />
              <span>Low availability! Consider choosing a different country.</span>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}

// Helper to get flag emoji from country code
function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}
