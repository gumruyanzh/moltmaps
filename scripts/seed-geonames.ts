#!/usr/bin/env npx ts-node
/**
 * Seed cities from GeoNames dataset
 * Downloads and parses cities1000.txt (165k+ cities with pop > 1000)
 *
 * Usage: npx ts-node scripts/seed-geonames.ts [--local | --production]
 */

import * as fs from 'fs'
import * as readline from 'readline'
import * as https from 'https'
import * as http from 'http'

const GEONAMES_CITIES_URL = 'https://download.geonames.org/export/dump/cities1000.zip'
const GEONAMES_COUNTRIES_URL = 'https://download.geonames.org/export/dump/countryInfo.txt'
const CITIES_FILE = '/tmp/cities1000.txt'
const TOP_CITIES_COUNT = 1000

interface City {
  id: string
  name: string
  country_code: string
  country_name: string
  lat: number
  lng: number
  population: number
  timezone: string | null
  is_top_1000: boolean
}

async function fetchCountryNames(): Promise<Map<string, string>> {
  return new Promise((resolve, reject) => {
    https.get(GEONAMES_COUNTRIES_URL, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        const countries = new Map<string, string>()
        for (const line of data.split('\n')) {
          if (line.startsWith('#') || !line.trim()) continue
          const parts = line.split('\t')
          if (parts.length >= 5) {
            countries.set(parts[0], parts[4])
          }
        }
        console.log(`Loaded ${countries.size} country names`)
        resolve(countries)
      })
      res.on('error', reject)
    })
  })
}

async function parseCities(countriesMap: Map<string, string>): Promise<City[]> {
  const cities: City[] = []

  if (!fs.existsSync(CITIES_FILE)) {
    console.error(`Cities file not found at ${CITIES_FILE}`)
    console.error('Run: curl -s "https://download.geonames.org/export/dump/cities1000.zip" -o /tmp/cities1000.zip && unzip -o /tmp/cities1000.zip -d /tmp/')
    process.exit(1)
  }

  const fileStream = fs.createReadStream(CITIES_FILE)
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  })

  for await (const line of rl) {
    const parts = line.split('\t')
    if (parts.length < 18) continue

    const geonameid = parts[0]
    const name = parts[1]
    const lat = parseFloat(parts[4])
    const lng = parseFloat(parts[5])
    const countryCode = parts[8]
    const population = parseInt(parts[14]) || 0
    const timezone = parts[17] || null

    // Skip if missing essential data
    if (!name || !countryCode || isNaN(lat) || isNaN(lng)) continue

    const countryName = countriesMap.get(countryCode) || countryCode

    cities.push({
      id: `geo_${geonameid}`,
      name,
      country_code: countryCode,
      country_name: countryName,
      lat,
      lng,
      population,
      timezone,
      is_top_1000: false // Will be set later
    })
  }

  console.log(`Parsed ${cities.length} cities`)
  return cities
}

function markTop1000(cities: City[]): City[] {
  // Sort by population descending
  const sorted = [...cities].sort((a, b) => b.population - a.population)

  // Mark top 1000
  for (let i = 0; i < Math.min(TOP_CITIES_COUNT, sorted.length); i++) {
    sorted[i].is_top_1000 = true
  }

  console.log(`Marked top ${TOP_CITIES_COUNT} cities by population`)
  console.log(`Top 10: ${sorted.slice(0, 10).map(c => `${c.name} (${c.population.toLocaleString()})`).join(', ')}`)

  return sorted
}

async function seedToDatabase(cities: City[], apiUrl: string, maintenanceKey: string): Promise<void> {
  const BATCH_SIZE = 500
  let totalInserted = 0
  let totalErrors = 0

  console.log(`\nSeeding ${cities.length} cities to ${apiUrl}...`)

  for (let i = 0; i < cities.length; i += BATCH_SIZE) {
    const batch = cities.slice(i, i + BATCH_SIZE)
    const batchNum = Math.floor(i / BATCH_SIZE) + 1
    const totalBatches = Math.ceil(cities.length / BATCH_SIZE)

    try {
      const response = await fetch(`${apiUrl}/api/maintenance/seed-cities-batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${maintenanceKey}`
        },
        body: JSON.stringify({ cities: batch })
      })

      const result = await response.json()

      if (result.success) {
        totalInserted += result.inserted || batch.length
        process.stdout.write(`\rBatch ${batchNum}/${totalBatches}: ${totalInserted} cities inserted`)
      } else {
        totalErrors++
        console.error(`\nBatch ${batchNum} error: ${result.error}`)
      }
    } catch (error) {
      totalErrors++
      console.error(`\nBatch ${batchNum} failed: ${error}`)
    }
  }

  console.log(`\n\nSeeding complete!`)
  console.log(`Total inserted: ${totalInserted}`)
  console.log(`Errors: ${totalErrors}`)
}

async function main() {
  const args = process.argv.slice(2)
  const isProduction = args.includes('--production')
  const isLocal = args.includes('--local') || !isProduction

  const apiUrl = isProduction ? 'https://moltmaps.com' : 'http://localhost:3000'
  const maintenanceKey = isProduction
    ? process.env.MAINTENANCE_KEY || '36REZi35EV3+t3f0zWsBFHflgkP8AFXL'
    : 'local-dev-maintenance-key'

  console.log(`Mode: ${isProduction ? 'PRODUCTION' : 'LOCAL'}`)
  console.log(`API URL: ${apiUrl}`)
  console.log('')

  // Step 1: Fetch country names
  console.log('Fetching country names...')
  const countriesMap = await fetchCountryNames()

  // Step 2: Parse cities
  console.log('Parsing cities...')
  const cities = await parseCities(countriesMap)

  // Step 3: Mark top 1000
  const markedCities = markTop1000(cities)

  // Step 4: Seed to database
  await seedToDatabase(markedCities, apiUrl, maintenanceKey)
}

main().catch(console.error)
