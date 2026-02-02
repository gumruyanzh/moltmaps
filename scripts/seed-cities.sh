#!/bin/bash
# Seed 165k+ cities from GeoNames to production

set -e

API_URL="${1:-https://moltmaps.com}"
MAINTENANCE_KEY="${2:-36REZi35EV3+t3f0zWsBFHflgkP8AFXL}"
CITIES_FILE="/tmp/cities1000.txt"
COUNTRIES_FILE="/tmp/countryInfo.txt"
BATCH_SIZE=500

echo "Seeding cities to $API_URL"

# Download countries if not exists
if [ ! -f "$COUNTRIES_FILE" ]; then
    echo "Downloading country data..."
    curl -s "https://download.geonames.org/export/dump/countryInfo.txt" -o "$COUNTRIES_FILE"
fi

# Check cities file exists
if [ ! -f "$CITIES_FILE" ]; then
    echo "Cities file not found. Downloading..."
    curl -s "https://download.geonames.org/export/dump/cities1000.zip" -o /tmp/cities1000.zip
    unzip -o /tmp/cities1000.zip -d /tmp/
fi

TOTAL_CITIES=$(wc -l < "$CITIES_FILE")
echo "Total cities to process: $TOTAL_CITIES"

# Create Node.js script for processing
node << 'NODEJS'
const fs = require('fs');
const https = require('https');
const http = require('http');

const API_URL = process.env.API_URL || 'https://moltmaps.com';
const MAINTENANCE_KEY = process.env.MAINTENANCE_KEY || '36REZi35EV3+t3f0zWsBFHflgkP8AFXL';
const BATCH_SIZE = 500;

// Load country names
const countriesMap = new Map();
const countriesData = fs.readFileSync('/tmp/countryInfo.txt', 'utf8');
for (const line of countriesData.split('\n')) {
    if (line.startsWith('#') || !line.trim()) continue;
    const parts = line.split('\t');
    if (parts.length >= 5) {
        countriesMap.set(parts[0], parts[4]);
    }
}
console.log(`Loaded ${countriesMap.size} countries`);

// Parse cities and get top 1000
const cities = [];
const citiesData = fs.readFileSync('/tmp/cities1000.txt', 'utf8');
for (const line of citiesData.split('\n')) {
    const parts = line.split('\t');
    if (parts.length < 18) continue;

    const population = parseInt(parts[14]) || 0;
    const countryCode = parts[8];

    cities.push({
        id: `geo_${parts[0]}`,
        name: parts[1],
        country_code: countryCode,
        country_name: countriesMap.get(countryCode) || countryCode,
        lat: parseFloat(parts[4]),
        lng: parseFloat(parts[5]),
        population: population,
        timezone: parts[17] || null,
        is_top_1000: false
    });
}

console.log(`Parsed ${cities.length} cities`);

// Sort by population and mark top 1000
cities.sort((a, b) => b.population - a.population);
for (let i = 0; i < Math.min(1000, cities.length); i++) {
    cities[i].is_top_1000 = true;
}

console.log(`Top 5 cities: ${cities.slice(0, 5).map(c => c.name).join(', ')}`);

// Seed in batches
async function seedBatch(batch, batchNum, totalBatches) {
    const url = new URL('/api/maintenance/seed-cities-batch', API_URL);
    const isHttps = url.protocol === 'https:';

    return new Promise((resolve, reject) => {
        const data = JSON.stringify({ cities: batch });

        const options = {
            hostname: url.hostname,
            port: url.port || (isHttps ? 443 : 80),
            path: url.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data),
                'Authorization': `Bearer ${MAINTENANCE_KEY}`
            }
        };

        const req = (isHttps ? https : http).request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(body);
                    resolve(result);
                } catch (e) {
                    reject(new Error(`Invalid JSON: ${body.substring(0, 100)}`));
                }
            });
        });

        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

async function main() {
    const totalBatches = Math.ceil(cities.length / BATCH_SIZE);
    let totalInserted = 0;
    let errors = 0;

    console.log(`\nSeeding ${cities.length} cities in ${totalBatches} batches...`);

    for (let i = 0; i < cities.length; i += BATCH_SIZE) {
        const batch = cities.slice(i, i + BATCH_SIZE);
        const batchNum = Math.floor(i / BATCH_SIZE) + 1;

        try {
            const result = await seedBatch(batch, batchNum, totalBatches);
            if (result.success) {
                totalInserted += result.inserted || batch.length;
            } else {
                errors++;
                console.error(`\nBatch ${batchNum} error: ${result.error}`);
            }
        } catch (e) {
            errors++;
            console.error(`\nBatch ${batchNum} failed: ${e.message}`);
        }

        // Progress
        const pct = ((i + batch.length) / cities.length * 100).toFixed(1);
        process.stdout.write(`\rProgress: ${pct}% (${totalInserted} inserted, ${errors} errors)`);
    }

    console.log(`\n\nDone! Inserted: ${totalInserted}, Errors: ${errors}`);
}

main().catch(console.error);
NODEJS
