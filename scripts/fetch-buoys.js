// Drift — NDBC buoy fetcher
//
// This runs server-side inside a GitHub Action (not in the browser),
// so it isn't subject to CORS restrictions — CORS is a browser-only
// rule. It downloads the latest realtime2 reading for every buoy
// Drift shows on the map, parses it, and writes the results to
// data/buoys.json. The site's front end (script.js) then reads that
// JSON file from Drift's own domain, which is a same-origin request.
//
// Keep STATION_IDS in sync with the `buoyStations` list in script.js
// if you ever add or remove a buoy on the map.

const fs = require("fs");
const path = require("path");

const STATION_IDS = [
    // New Jersey coast
    "sdhn4", "44091", "acyn4", "cman4",

    // Delaware Bay
    "sjsn4", "brnd1", "lwsd1", "deld1", "44009",

    // Delaware / Maryland Atlantic coast
    "44084", "ocim2",

    // Chesapeake Bay - Maryland
    "44063", "44062", "tplm2", "tcbm2", "44080", "covm2", "slim2",
    "pptm2", "camm2", "bism2", "44042", "fskm2", "bcfm2", "cxlm2",
    "ncdv2", "wasd2",

    // Chesapeake Bay - Virginia / lower bay
    "lwtv2", "44058", "44072", "rplv2", "chbv2", "44099", "cryv2",
    "swpv2", "mnpv2", "yktv2", "kptv2", "domv2", "wdsv2", "44064",
    "44087", "yrsv2",

    // Atlantic Virginia coast
    "44088", "wahv2", "44089"
];

// A believable User-Agent + a short delay between requests is just
// good manners toward NDBC's free public data service.
const USER_AGENT = "Drift-Boating-App/1.0 (github.com actions buoy fetch)";
const DELAY_BETWEEN_REQUESTS_MS = 150;

function sleep(ms){
    return new Promise(resolve => setTimeout(resolve, ms));
}

function metersPerSecondToMph(mps){

    if(
        mps === null ||
        mps === undefined ||
        Number.isNaN(Number(mps))
    ){
        return null;
    }

    return Number(mps) * 2.23694;

}

function metersToFeet(meters){

    if(
        meters === null ||
        meters === undefined ||
        Number.isNaN(Number(meters))
    ){
        return null;
    }

    return Number(meters) * 3.28084;

}

function parseNDBCRealtime2(text){

    /*
    NDBC's realtime2 standard meteorological text file: a header
    line, a units line, then the most recent observation first.
    Missing values are written as "MM".
    */

    const lines =
        text
            .split("\n")
            .map(line => line.trim())
            .filter(Boolean);

    if(lines.length < 3){
        return null;
    }

    const columns =
        lines[2].split(/\s+/);

    /*
    Standard column order:
    YY MM DD hh mm WDIR WSPD GST WVHT DPD APD MWD PRES ATMP WTMP DEWP VIS PTDY TIDE
    */

    const get = index =>
        columns[index] !== undefined &&
        columns[index] !== "MM"
            ? Number(columns[index])
            : null;

    const year = get(0);
    const month = get(1);
    const day = get(2);
    const hour = get(3);
    const minute = get(4);

    const windSpeedMps = get(6);
    const gustMps = get(7);
    const waveHeightMeters = get(8);
    const dominantWavePeriod = get(9);
    const airTempC = get(13);

    let observedAt = null;

    if(
        year !== null &&
        month !== null &&
        day !== null &&
        hour !== null &&
        minute !== null
    ){

        observedAt =
            new Date(
                Date.UTC(
                    2000 + year,
                    month - 1,
                    day,
                    hour,
                    minute
                )
            ).toISOString();

    }

    return {
        observedAt,
        windSpeedMph: metersPerSecondToMph(windSpeedMps),
        gustMph: metersPerSecondToMph(gustMps),
        waveHeightFt:
            waveHeightMeters !== null
                ? metersToFeet(waveHeightMeters)
                : null,
        wavePeriodSec: dominantWavePeriod,
        airTempF:
            airTempC !== null
                ? (airTempC * 9 / 5) + 32
                : null
    };

}

async function fetchStation(id){

    const url =
        `https://www.ndbc.noaa.gov/data/realtime2/${id.toUpperCase()}.txt`;

    try {

        const response =
            await fetch(url, {
                headers: { "User-Agent": USER_AGENT }
            });

        if(!response.ok){
            console.warn(`${id}: HTTP ${response.status}`);
            return null;
        }

        const text = await response.text();
        const observation = parseNDBCRealtime2(text);

        if(!observation){
            console.warn(`${id}: no parseable rows`);
        }

        return observation;

    }
    catch(error){

        console.warn(`${id}: fetch failed —`, error.message);
        return null;

    }

}

async function main(){

    const results = {};

    for(const id of STATION_IDS){

        const observation = await fetchStation(id);

        if(observation){
            results[id] = observation;
        }

        await sleep(DELAY_BETWEEN_REQUESTS_MS);

    }

    results._meta = {
        generatedAt: new Date().toISOString()
    };

    const outDir = path.join(__dirname, "..", "data");
    fs.mkdirSync(outDir, { recursive: true });

    fs.writeFileSync(
        path.join(outDir, "buoys.json"),
        JSON.stringify(results, null, 2)
    );

    const stationCount = Object.keys(results).length - 1;
    console.log(`Wrote ${stationCount} of ${STATION_IDS.length} station readings to data/buoys.json`);

}

main().catch(error => {
    console.error("Buoy fetch failed:", error);
    process.exit(1);
});
