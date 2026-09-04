// Chesapeake Bay Boating Conditions
// Version 1.12.0


let windChart;
let waveChart;
let precipChart;
let tideChart;

let lastWaveHeightsRaw = null;
let lastWavePeriodsRaw = null;
let waveChartResizeTimeout = null;

let tideStationCache = null;
let lastSunData = null;
let lastCurrentTimeHour = null;
let nextSixDaysRequestId = 0;

const locations = {};

let locationMap = null;
let selectedMapMarker = null;
let selectedMapLocationName = null;

let forecastSourceMarker = null;
let forecastSourceLine = null;
let lastForecastSourceMeta = null;
let lastForecastConfidence = null;
let forecastConfidenceRequestId = 0;


const DEFAULT_MAP_BOUNDS = [
    [37.85, -77.05],
    [39.75, -74.10]
];


const fishingSpots = [
    {
        name: 'Bob Mason Reef',
        state: 'Maryland',
        lat: 38.335967,
        lon: -75.088672
    },
    {
        name: "Purnell's Reef",
        state: 'Maryland',
        lat: 38.350003,
        lon: -75.058333
    },
    {
        name: "Kelly's Reef",
        state: 'Maryland',
        lat: 38.276817,
        lon: -75.075344
    },
    {
        name: 'Great Gull Reef',
        state: 'Maryland',
        lat: 38.268375,
        lon: -75.030056
    },
    {
        name: 'Isle of Wight Reef',
        state: 'Maryland',
        lat: 38.381806,
        lon: -74.978475
    },
    {
        name: 'Research Reef',
        state: 'Maryland',
        lat: 38.323508,
        lon: -74.939678
    },
    {
        name: 'Bass Grounds',
        state: 'Maryland',
        lat: 38.295928,
        lon: -74.910883
    },
    {
        name: 'African Queen Reef',
        state: 'Maryland',
        lat: 38.151308,
        lon: -74.953253
    },
    {
        name: 'Great Eastern Reef',
        state: 'Maryland',
        lat: 38.208342,
        lon: -74.731675
    },
    {
        name: 'Jackspot Reef',
        state: 'Maryland',
        lat: 38.090453,
        lon: -74.812125
    },
    {
        name: 'Delaware Reef Site 9',
        state: 'Delaware',
        lat: 38.673367,
        lon: -74.995700
    },
    {
        name: 'Delaware Reef Site 10',
        state: 'Delaware',
        lat: 38.610767,
        lon: -74.937533
    },
    {
        name: 'Redbird Reef (Site 11)',
        state: 'Delaware',
        lat: 38.672817,
        lon: -74.729533
    },
    {
        name: 'Del-Jersey-Land Reef (Site 13)',
        state: 'Delaware',
        lat: 38.516100,
        lon: -74.512433
    }
];

let fishingSpotsLayer = null;

const buoyStations = [
    // New Jersey coast
    { id: 'sdhn4', name: 'Sandy Hook, NJ', lat: 40.467, lon: -74.009, hasWave: false },
    { id: '44091', name: 'Barnegat, NJ', lat: 39.772, lon: -73.769, hasWave: true },
    { id: 'acyn4', name: 'Atlantic City, NJ', lat: 39.357, lon: -74.418, hasWave: false },
    { id: 'cman4', name: 'Cape May, NJ', lat: 38.970, lon: -74.960, hasWave: false },

    // Delaware Bay
    { id: 'sjsn4', name: 'Ship John Shoal, NJ', lat: 39.305, lon: -75.377, hasWave: false },
    { id: 'brnd1', name: 'Brandywine Shoal Light, DE', lat: 38.990, lon: -75.110, hasWave: false },
    { id: 'lwsd1', name: 'Lewes, DE', lat: 38.780, lon: -75.120, hasWave: false },
    { id: 'deld1', name: 'Delaware City, DE', lat: 39.580, lon: -75.590, hasWave: false },
    { id: '44009', name: 'Delaware Bay Offshore (26 NM SE of Cape May)', lat: 38.460, lon: -74.692, hasWave: true },

    // Delaware / Maryland Atlantic coast
    { id: '44084', name: 'Bethany Beach, DE', lat: 38.537, lon: -75.044, hasWave: true },
    { id: 'ocim2', name: 'Ocean City Inlet, MD', lat: 38.328, lon: -75.091, hasWave: false },

    // Chesapeake Bay - Maryland
    { id: '44063', name: 'Annapolis, MD', lat: 38.963, lon: -76.448, hasWave: false },
    { id: '44062', name: 'Gooses Reef, MD', lat: 38.556, lon: -76.415, hasWave: false },
    { id: 'tplm2', name: 'Thomas Point, MD', lat: 38.899, lon: -76.436, hasWave: false },
    { id: 'tcbm2', name: 'Tolchester Beach, MD', lat: 39.213, lon: -76.244, hasWave: false },
    { id: '44080', name: 'Baltimore, MD', lat: 39.223, lon: -76.528, hasWave: false },
    { id: 'covm2', name: 'Cove Point, MD', lat: 38.402, lon: -76.385, hasWave: false },
    { id: 'slim2', name: "Solomons Island, MD", lat: 38.320, lon: -76.450, hasWave: false },
    { id: 'pptm2', name: 'Piney Point, MD', lat: 38.130, lon: -76.530, hasWave: false },
    { id: 'camm2', name: 'Cambridge, MD', lat: 38.570, lon: -76.070, hasWave: false },
    { id: 'bism2', name: 'Bishops Head, MD', lat: 38.220, lon: -76.040, hasWave: false },
    { id: '44042', name: 'Potomac, MD', lat: 38.033, lon: -76.335, hasWave: false },
    { id: 'fskm2', name: 'Francis Scott Key Bridge, MD', lat: 39.219, lon: -76.528, hasWave: false },
    { id: 'bcfm2', name: 'Brewerton Channel, MD', lat: 39.205, lon: -76.524, hasWave: false },
    { id: 'cxlm2', name: 'Cooperative Oxford Laboratory, MD', lat: 38.679, lon: -76.174, hasWave: false },
    { id: 'ncdv2', name: 'Dahlgren, VA', lat: 38.320, lon: -77.037, hasWave: false },
    { id: 'wasd2', name: 'Washington, DC', lat: 38.870, lon: -77.020, hasWave: false },

    // Chesapeake Bay - Virginia / lower bay
    { id: 'lwtv2', name: 'Lewisetta, VA', lat: 38.000, lon: -76.470, hasWave: false },
    { id: '44058', name: 'Stingray Point, VA', lat: 37.567, lon: -76.257, hasWave: false },
    { id: '44072', name: 'York Spit, VA', lat: 37.201, lon: -76.266, hasWave: false },
    { id: 'rplv2', name: 'Rappahannock Light, VA', lat: 37.540, lon: -76.020, hasWave: false },
    { id: 'chbv2', name: 'Chesapeake Bay Bridge Tunnel, VA', lat: 37.030, lon: -76.080, hasWave: false },
    { id: '44099', name: 'Cape Henry, VA', lat: 36.915, lon: -75.722, hasWave: true },
    { id: 'cryv2', name: 'South Craney Island, VA', lat: 36.890, lon: -76.340, hasWave: false },
    { id: 'swpv2', name: 'Sewells Point, VA', lat: 36.943, lon: -76.329, hasWave: false },
    { id: 'mnpv2', name: 'Money Point, VA', lat: 36.780, lon: -76.300, hasWave: false },
    { id: 'yktv2', name: 'Yorktown, VA', lat: 37.230, lon: -76.480, hasWave: false },
    { id: 'kptv2', name: 'Kiptopeke, VA', lat: 37.170, lon: -75.990, hasWave: false },
    { id: 'domv2', name: 'Dominion Terminal, VA', lat: 36.962, lon: -76.424, hasWave: false },
    { id: 'wdsv2', name: 'Willoughby, VA', lat: 36.977, lon: -76.315, hasWave: false },
    { id: '44064', name: 'First Landing, VA', lat: 36.998, lon: -76.087, hasWave: false },
    { id: '44087', name: 'Thimble Shoal, VA', lat: 37.043, lon: -76.129, hasWave: false },
    { id: 'yrsv2', name: 'Taskinas Creek, VA', lat: 37.414, lon: -76.712, hasWave: false },

    // Atlantic Virginia coast
    { id: '44088', name: 'Virginia Beach Offshore, VA', lat: 36.612, lon: -74.839, hasWave: true },
    { id: 'wahv2', name: 'Wachapreague, VA', lat: 37.610, lon: -75.690, hasWave: false },
    { id: '44089', name: 'Wallops Island, VA', lat: 37.756, lon: -75.325, hasWave: false }
];

let buoyLayer = null;
const buoyObservationCache = {};

window.onload = function(){

    setToday();

    setupCustomSettings();

    setupVesselCards();

    setupDarkMode();

    setupLocationMap();

    setupForecastSourceUI();

    setupForecastConfidenceUI();

    setupWaveChartResizeHandling();

};




const CUSTOM_PROFILE_STORAGE_KEY = "driftCustomProfileV2";

const DEFAULT_CUSTOM_PROFILE = {
    windSporty: 16,
    windPoor: 23,
    flatWind: 5,
    waveSporty: 2,
    wavePoor: 4,
    flatWave: 0.3,
    waveBypass: 2,
    shortPeriodPoor: 5,
    periodRatioCalm: 3,
    periodRatioPoor: 2,
    usePrecip: true,
    precipSporty: 31,
    precipPoor: 61,
    useAlerts: true,
    useThunder: true
};

function getSavedCustomProfile(){
    try{
        const raw = localStorage.getItem(CUSTOM_PROFILE_STORAGE_KEY);
        if(!raw) return null;
        const parsed = JSON.parse(raw);
        return {
            ...DEFAULT_CUSTOM_PROFILE,
            ...parsed
        };
    }
    catch(error){
        console.warn("Unable to read custom profile:", error);
        return null;
    }
}

function getCustomProfile(){
    return getSavedCustomProfile() || { ...DEFAULT_CUSTOM_PROFILE };
}

function setupCustomSettings(){
    const gear = document.getElementById("customSettingsButton");
    const modal = document.getElementById("customSettingsModal");
    const close = document.getElementById("customSettingsClose");
    const form = document.getElementById("customSettingsForm");
    const restore = document.getElementById("customRestoreDefaults");
    const usePrecip = document.getElementById("customUsePrecip");

    if(!gear || !modal || !form) return;

    const closeModal = () => {
        modal.classList.add("hidden");
        document.body.classList.remove("custom-modal-open");
    };

    gear.addEventListener("click", () => openCustomSettingsModal());
    close?.addEventListener("click", closeModal);
    modal.querySelectorAll('[data-custom-close="true"]').forEach(el => {
        el.addEventListener("click", closeModal);
    });

    document.addEventListener("keydown", event => {
        if(event.key === "Escape" && !modal.classList.contains("hidden")){
            closeModal();
        }
    });

    usePrecip?.addEventListener("change", updateCustomPrecipFieldsState);

    restore?.addEventListener("click", () => {
        populateCustomSettingsForm(DEFAULT_CUSTOM_PROFILE);
        document.getElementById("customSettingsError").textContent = "";
    });

    form.addEventListener("submit", event => {
        event.preventDefault();
        const profile = readCustomSettingsForm();
        const validationMessage = validateCustomProfile(profile);
        const error = document.getElementById("customSettingsError");

        if(validationMessage){
            error.textContent = validationMessage;
            return;
        }

        localStorage.setItem(CUSTOM_PROFILE_STORAGE_KEY, JSON.stringify(profile));
        error.textContent = "";
        closeModal();
    });
}

function openCustomSettingsModal(){
    const modal = document.getElementById("customSettingsModal");
    if(!modal) return;

    populateCustomSettingsForm(getCustomProfile());
    document.getElementById("customSettingsError").textContent = "";
    modal.classList.remove("hidden");
    document.body.classList.add("custom-modal-open");

    window.setTimeout(() => {
        document.getElementById("customWindSporty")?.focus();
    }, 0);
}

function populateCustomSettingsForm(profile){
    const values = {
        customWindSporty: profile.windSporty,
        customWindPoor: profile.windPoor,
        customFlatWind: profile.flatWind,
        customWaveSporty: profile.waveSporty,
        customWavePoor: profile.wavePoor,
        customFlatWave: profile.flatWave,
        customWaveBypass: profile.waveBypass,
        customShortPeriodPoor: profile.shortPeriodPoor,
        customPeriodRatioCalm: profile.periodRatioCalm,
        customPeriodRatioPoor: profile.periodRatioPoor,
        customPrecipSporty: profile.precipSporty,
        customPrecipPoor: profile.precipPoor
    };

    Object.entries(values).forEach(([id, value]) => {
        const input = document.getElementById(id);
        if(input) input.value = value;
    });

    document.getElementById("customUsePrecip").checked = Boolean(profile.usePrecip);
    document.getElementById("customUseAlerts").checked = Boolean(profile.useAlerts);
    document.getElementById("customUseThunder").checked = Boolean(profile.useThunder);
    updateCustomPrecipFieldsState();
}

function updateCustomPrecipFieldsState(){
    const enabled = Boolean(document.getElementById("customUsePrecip")?.checked);
    const wrapper = document.getElementById("customPrecipFields");
    wrapper?.classList.toggle("custom-fields-disabled", !enabled);
    wrapper?.querySelectorAll("input").forEach(input => {
        input.disabled = !enabled;
    });
}

function readCustomSettingsForm(){
    const number = id => Number(document.getElementById(id)?.value);
    return {
        windSporty: number("customWindSporty"),
        windPoor: number("customWindPoor"),
        flatWind: number("customFlatWind"),
        waveSporty: number("customWaveSporty"),
        wavePoor: number("customWavePoor"),
        flatWave: number("customFlatWave"),
        waveBypass: number("customWaveBypass"),
        shortPeriodPoor: number("customShortPeriodPoor"),
        periodRatioCalm: number("customPeriodRatioCalm"),
        periodRatioPoor: number("customPeriodRatioPoor"),
        usePrecip: Boolean(document.getElementById("customUsePrecip")?.checked),
        precipSporty: number("customPrecipSporty"),
        precipPoor: number("customPrecipPoor"),
        useAlerts: Boolean(document.getElementById("customUseAlerts")?.checked),
        useThunder: Boolean(document.getElementById("customUseThunder")?.checked)
    };
}

function validateCustomProfile(profile){
    const requiredNumbers = [
        profile.windSporty, profile.windPoor, profile.flatWind,
        profile.waveSporty, profile.wavePoor, profile.flatWave,
        profile.waveBypass, profile.shortPeriodPoor,
        profile.periodRatioCalm, profile.periodRatioPoor
    ];

    if(requiredNumbers.some(value => !Number.isFinite(value) || value < 0)){
        return "Enter a valid non-negative number for every wind and wave setting.";
    }

    if(profile.windPoor <= profile.windSporty){
        return "Poor wind must be higher than the Sporty wind threshold.";
    }
    if(profile.flatWind >= profile.windSporty){
        return "Flat max wind must be lower than the Sporty wind threshold.";
    }
    if(profile.wavePoor <= profile.waveSporty){
        return "Poor wave height must be higher than the Sporty wave threshold.";
    }
    if(profile.flatWave > profile.waveBypass){
        return "Flat wave height cannot be higher than the small-wave bypass height.";
    }
    if(profile.periodRatioCalm <= profile.periodRatioPoor){
        return "The Calm ratio must be higher than the Poor ratio (period stays calmer as it gets larger relative to height).";
    }

    if(profile.usePrecip){
        if(
            !Number.isFinite(profile.precipSporty) ||
            !Number.isFinite(profile.precipPoor) ||
            profile.precipSporty < 0 || profile.precipPoor > 100 ||
            profile.precipPoor <= profile.precipSporty
        ){
            return "Precipitation thresholds must be between 0–100%, with Poor higher than Sporty.";
        }
    }

    return "";
}

function getVesselLimits(boatSize){
    const presets = {
        small: { windSporty: 11, windPoor: 18, waveSporty: 1, wavePoor: 2 },
        medium: { windSporty: 16, windPoor: 23, waveSporty: 2, wavePoor: 4 },
        large: { windSporty: 21, windPoor: 31, waveSporty: 3, wavePoor: 5 },
        baller: { windSporty: 26, windPoor: 36, waveSporty: 4, wavePoor: 7 }
    };

    if(boatSize === "custom"){
        const profile = getCustomProfile();
        return {
            ...profile,
            isCustom: true
        };
    }

    const preset = presets[boatSize];
    if(!preset) return null;

    return {
        ...preset,
        flatWind: 5,
        flatWave: 0.3,
        waveBypass: 2,
        shortPeriodPoor: 5,
        periodRatioCalm: 3,
        periodRatioPoor: 2,
        usePrecip: true,
        precipSporty: 31,
        precipPoor: 61,
        useAlerts: true,
        useThunder: true,
        isCustom: false
    };
}



function haversineMiles(lat1, lon1, lat2, lon2){
    const toRad = value => value * Math.PI / 180;
    const earthRadiusMiles = 3958.8;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;

    return earthRadiusMiles *
        2 *
        Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );
}

/*
Wraps fetch() with a single automatic retry on failure
(non-OK response or network error), after a short delay.
Used for calls that feed the Forecast Source and Forecast
Confidence panels, which otherwise fail silently with no
retry and leave those buttons unpopulated on any transient
network hiccup.
*/
async function fetchWithRetry(url, options, retries = 1, delayMs = 800){
    let lastError;

    for(let attempt = 0; attempt <= retries; attempt++){
        try{
            const response = await fetch(url, options);

            if(!response.ok){
                throw new Error(
                    `Request failed (${response.status}): ${url}`
                );
            }

            return response;
        }
        catch(error){
            lastError = error;

            if(attempt < retries){
                await new Promise(resolve =>
                    setTimeout(resolve, delayMs)
                );
            }
        }
    }

    throw lastError;
}

function clearForecastSourceMapOverlay(){
    if(locationMap && forecastSourceMarker){
        locationMap.removeLayer(forecastSourceMarker);
    }

    if(locationMap && forecastSourceLine){
        locationMap.removeLayer(forecastSourceLine);
    }

    forecastSourceMarker = null;
    forecastSourceLine = null;
}

function setupForecastSourceUI(){
    const toggle = document.getElementById("forecastSourceToggle");
    const details = document.getElementById("forecastSourceDetails");

    if(!toggle || !details){
        return;
    }

    if(toggle.dataset.bound === "true"){
        return;
    }

    toggle.dataset.bound = "true";

    toggle.addEventListener("click", () => {
        const expanded = toggle.getAttribute("aria-expanded") === "true";
        toggle.setAttribute("aria-expanded", String(!expanded));
        details.classList.toggle("hidden", expanded);
    });
}

function updateForecastSourceVerification(location, weatherData){
    const requested = locations[location];

    if(
        !requested ||
        !weatherData ||
        !Number.isFinite(Number(weatherData.latitude)) ||
        !Number.isFinite(Number(weatherData.longitude))
    ){
        return;
    }

    const requestedLat = Number(requested.lat);
    const requestedLon = Number(requested.lon);
    const gridLat = Number(weatherData.latitude);
    const gridLon = Number(weatherData.longitude);

    const distanceMiles =
        haversineMiles(
            requestedLat,
            requestedLon,
            gridLat,
            gridLon
        );

    lastForecastSourceMeta = {
        location,
        requestedLat,
        requestedLon,
        gridLat,
        gridLon,
        distanceMiles
    };

    const panel = document.getElementById("forecastSourcePanel");
    const details = document.getElementById("forecastSourceDetails");

    if(panel && details){
        panel.classList.remove("hidden");

        details.innerHTML = `
            <div class="forecast-source-grid">
                <div>
                    <span class="forecast-source-label">Selected location</span>
                    <span class="forecast-source-value">${escapeHTML(location)}</span><br>
                    ${requestedLat.toFixed(5)}, ${requestedLon.toFixed(5)}
                </div>
                <div>
                    <span class="forecast-source-label">Forecast grid</span>
                    <span class="forecast-source-value">${gridLat.toFixed(5)}, ${gridLon.toFixed(5)}</span><br>
                    Sea grid · ${distanceMiles.toFixed(2)} mi away
                </div>
            </div>
        `;
    }

    setupForecastSourceUI();

    if(!locationMap){
        return;
    }

    clearForecastSourceMapOverlay();

    forecastSourceMarker =
        L.circleMarker(
            [gridLat, gridLon],
            {
                radius: 7,
                color: "#ffffff",
                weight: 3,
                fillColor: "#16a34a",
                fillOpacity: 1
            }
        )
        .addTo(locationMap)
        .bindPopup(
            "<strong>Forecast grid</strong><br>" +
            gridLat.toFixed(5) + ", " +
            gridLon.toFixed(5) + "<br>" +
            distanceMiles.toFixed(2) + " mi from selected point"
        );

    forecastSourceLine =
        L.polyline(
            [
                [requestedLat, requestedLon],
                [gridLat, gridLon]
            ],
            {
                color: "#16a34a",
                weight: 2,
                opacity: 0.9,
                dashArray: "6,6"
            }
        )
        .addTo(locationMap);
}



function setupForecastConfidenceUI(){
    const button = document.getElementById("forecastConfidenceButton");
    const modal = document.getElementById("forecastConfidenceModal");
    const close = document.getElementById("forecastConfidenceClose");

    if(!button || !modal){
        return;
    }

    if(button.dataset.bound === "true"){
        return;
    }

    button.dataset.bound = "true";

    const closeModal = () => {
        modal.classList.add("hidden");
    };

    button.addEventListener("click", () => {
        modal.classList.remove("hidden");
    });

    close?.addEventListener("click", closeModal);

    modal.querySelectorAll('[data-confidence-close="true"]').forEach(element => {
        element.addEventListener("click", closeModal);
    });

    document.addEventListener("keydown", event => {
        if(event.key === "Escape" && !modal.classList.contains("hidden")){
            closeModal();
        }
    });
}

function getAvailableNumericValues(values){
    if(!Array.isArray(values)){
        return [];
    }

    return values
        .map(value => Number(value))
        .filter(value => Number.isFinite(value));
}

function getMaxModelDifference(valuesA, valuesB){
    if(!Array.isArray(valuesA) || !Array.isArray(valuesB)){
        return null;
    }

    const length = Math.min(valuesA.length, valuesB.length);
    let maxDifference = null;

    for(let index = 0; index < length; index++){
        const a = Number(valuesA[index]);
        const b = Number(valuesB[index]);

        if(!Number.isFinite(a) || !Number.isFinite(b)){
            continue;
        }

        const difference = Math.abs(a - b);

        maxDifference =
            maxDifference === null
                ? difference
                : Math.max(maxDifference, difference);
    }

    return maxDifference;
}

async function fetchConfidenceModel(endpoint, coords, selectedDate){
    const parameters =
        new URLSearchParams({
            latitude:
                String(coords.lat),
            longitude:
                String(coords.lon),
            hourly:
                [
                    "wind_speed_10m",
                    "wind_gusts_10m",
                    "precipitation_probability"
                ].join(","),
            wind_speed_unit:
                "mph",
            cell_selection:
                "sea",
            timezone:
                "America/New_York",
            start_date:
                selectedDate,
            end_date:
                selectedDate
        });

    const response =
        await fetchWithRetry(
            endpoint + "?" +
            parameters.toString()
        );

    return response.json();
}

async function getForecastConfidence(location, selectedDate){
    const coords = locations[location];

    if(!coords){
        return null;
    }

    const [
        gfsResult,
        ecmwfResult
    ] = await Promise.allSettled([
        fetchConfidenceModel(
            "https://api.open-meteo.com/v1/gfs",
            coords,
            selectedDate
        ),
        fetchConfidenceModel(
            "https://api.open-meteo.com/v1/ecmwf",
            coords,
            selectedDate
        )
    ]);

    const models = [];

    if(gfsResult.status === "fulfilled"){
        models.push({
            name:
                "NOAA GFS / HRRR",
            data:
                gfsResult.value
        });
    }

    if(ecmwfResult.status === "fulfilled"){
        models.push({
            name:
                "ECMWF IFS",
            data:
                ecmwfResult.value
        });
    }

    if(models.length < 2){
        return {
            stars:
                1,
            label:
                "Low",
            reasons:
                [
                    "Drift could not retrieve enough independent forecast models to verify agreement."
                ],
            models:
                models
        };
    }

    const gfs =
        models.find(model =>
            model.name.includes("NOAA")
        ).data;

    const ecmwf =
        models.find(model =>
            model.name.includes("ECMWF")
        ).data;

    const windDifference =
        getMaxModelDifference(
            gfs.hourly?.wind_speed_10m,
            ecmwf.hourly?.wind_speed_10m
        );

    const gustDifference =
        getMaxModelDifference(
            gfs.hourly?.wind_gusts_10m,
            ecmwf.hourly?.wind_gusts_10m
        );

    const precipDifference =
        getMaxModelDifference(
            gfs.hourly?.precipitation_probability,
            ecmwf.hourly?.precipitation_probability
        );

    let stars = 3;
    const reasons = [];

    if(windDifference !== null){
        if(windDifference > 10){
            stars = 1;
            reasons.push(
                `Wind models disagree by as much as ${Math.round(windDifference)} mph.`
            );
        }
        else if(windDifference > 5){
            stars = Math.min(stars, 2);
            reasons.push(
                `Wind models differ by as much as ${Math.round(windDifference)} mph.`
            );
        }
        else {
            reasons.push(
                `Wind models agree within about ${Math.max(1, Math.round(windDifference))} mph.`
            );
        }
    }

    if(gustDifference !== null){
        if(gustDifference > 12){
            stars = Math.min(stars, 1);
            reasons.push(
                `Gust forecasts differ by as much as ${Math.round(gustDifference)} mph.`
            );
        }
        else if(gustDifference > 7){
            stars = Math.min(stars, 2);
            reasons.push(
                `Gust forecasts differ by as much as ${Math.round(gustDifference)} mph.`
            );
        }
        else {
            reasons.push(
                `Gust forecasts are within about ${Math.max(1, Math.round(gustDifference))} mph.`
            );
        }
    }

    if(precipDifference !== null){
        if(precipDifference > 40){
            stars = Math.min(stars, 1);
            reasons.push(
                `Rain probability differs by as much as ${Math.round(precipDifference)} percentage points.`
            );
        }
        else if(precipDifference > 25){
            stars = Math.min(stars, 2);
            reasons.push(
                `Rain probability differs by as much as ${Math.round(precipDifference)} percentage points.`
            );
        }
        else {
            reasons.push(
                `Rain forecasts are within about ${Math.round(precipDifference)} percentage points.`
            );
        }
    }

    if(reasons.length === 0){
        reasons.push(
            "The available models are in close agreement."
        );
    }

    return {
        stars:
            stars,
        label:
            stars === 3
                ? "High"
                : stars === 2
                    ? "Moderate"
                    : "Low",
        reasons:
            reasons,
        models:
            models.map(model => {
                const winds =
                    getAvailableNumericValues(
                        model.data.hourly?.wind_speed_10m
                    );
                const gusts =
                    getAvailableNumericValues(
                        model.data.hourly?.wind_gusts_10m
                    );
                const precip =
                    getAvailableNumericValues(
                        model.data.hourly?.precipitation_probability
                    );

                return {
                    name:
                        model.name,
                    maxWind:
                        winds.length
                            ? Math.max(...winds)
                            : null,
                    maxGust:
                        gusts.length
                            ? Math.max(...gusts)
                            : null,
                    maxPrecip:
                        precip.length
                            ? Math.max(...precip)
                            : null
                };
            })
    };
}

function renderForecastConfidence(confidence){
    const panel =
        document.getElementById(
            "forecastConfidencePanel"
        );

    const stars =
        document.getElementById(
            "forecastConfidenceStars"
        );

    const label =
        document.getElementById(
            "forecastConfidenceLabel"
        );

    const body =
        document.getElementById(
            "forecastConfidenceBody"
        );

    if(!panel || !stars || !label || !body){
        return;
    }

    if(confidence === "unavailable"){
        panel.classList.remove("hidden");
        stars.textContent = "☆☆☆";
        label.textContent = "Confidence unavailable";
        body.innerHTML = `
            <p>Drift couldn't reach the forecast comparison models right now. This doesn't affect the conditions check above — try again in a moment if you'd like a confidence rating.</p>
        `;
        return;
    }

    if(!confidence){
        panel.classList.add("hidden");
        return;
    }

    lastForecastConfidence = confidence;

    stars.textContent =
        "★".repeat(confidence.stars) +
        "☆".repeat(3 - confidence.stars);

    label.textContent =
        confidence.label +
        " confidence";

    const modelCards =
        confidence.models
            .map(model => `
                <div class="confidence-model-card">
                    <strong>${escapeHTML(model.name)}</strong>
                    <div>Max wind: ${
                        model.maxWind === null
                            ? "--"
                            : Math.round(model.maxWind) + " mph"
                    }</div>
                    <div>Max gust: ${
                        model.maxGust === null
                            ? "--"
                            : Math.round(model.maxGust) + " mph"
                    }</div>
                    <div>Peak rain chance: ${
                        model.maxPrecip === null
                            ? "--"
                            : Math.round(model.maxPrecip) + "%"
                    }</div>
                </div>
            `)
            .join("");

    body.innerHTML = `
        ${confidence.reasons
            .map(reason =>
                `<div class="confidence-reason">${escapeHTML(reason)}</div>`
            )
            .join("")}

        <div class="confidence-model-grid">
            ${modelCards}
        </div>

        <p class="confidence-help">
            Drift compares independent atmospheric forecast models in the background.
            The confidence rating does not replace official marine forecasts or current conditions.
        </p>
    `;

    panel.classList.remove("hidden");
}

function getHumanDecisionSummaryHTML(
    forecast,
    boatSize,
    selectedDate,
    timeline,
    windowRecommendation = ""
){
    const limits =
        getVesselLimits(boatSize);

    if(!limits){
        return "The selected vessel could not be evaluated.";
    }

    const now = new Date();

    const todayString = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, "0"),
        String(now.getDate()).padStart(2, "0")
    ].join("-");

    const hours = [];

    forecast.forEach((hour, hourIndex) => {
        if(!hour){
            return;
        }

        if(
            selectedDate === todayString &&
            hourIndex < now.getHours()
        ){
            return;
        }

        hours.push(hour);
    });

    if(!hours.length){
        return "No remaining forecast information is available.";
    }

    const sustained =
        hours
            .map(hour => Number(hour.wind))
            .filter(Number.isFinite);

    const gusts =
        hours
            .map(hour => Number(hour.gust))
            .filter(Number.isFinite);

    const waves =
        hours
            .map(hour => Number(hour.waves))
            .filter(Number.isFinite);

    const precip =
        hours
            .map(hour => Number(hour.precip))
            .filter(Number.isFinite);

    const maxWind =
        sustained.length
            ? Math.max(...sustained)
            : 0;

    const maxGust =
        gusts.length
            ? Math.max(...gusts)
            : maxWind;

    const maxWaves =
        waves.length
            ? Math.max(...waves)
            : null;

    // Pair the maximum wave height with the wave period from the same hour.
    // If the maximum height occurs more than once, use the shortest valid
    // period at that height because it represents the steeper/rougher case.
    const maxWavePeriods =
        maxWaves === null
            ? []
            : hours
                .filter(hour => {
                    const waveHeight = Number(hour.waves);
                    return (
                        Number.isFinite(waveHeight) &&
                        Math.abs(waveHeight - maxWaves) < 0.0001
                    );
                })
                .map(hour => Number(hour.wavePeriod))
                .filter(period =>
                    Number.isFinite(period) &&
                    period > 0
                );

    const maxWavePeriod =
        maxWavePeriods.length
            ? Math.min(...maxWavePeriods)
            : null;

    const maxPrecip =
        precip.length
            ? Math.max(...precip)
            : 0;

    const windSeverity =
        Math.max(maxWind, maxGust) >= limits.windPoor
            ? 3
            : Math.max(maxWind, maxGust) >= limits.windSporty
                ? 2
                : 0;

    const waveSeverity =
        maxWaves !== null &&
        maxWaves >= limits.wavePoor
            ? 3
            : maxWaves !== null &&
              maxWaves >= limits.waveSporty
                ? 2
                : 0;

    const rainSeverity =
        limits.usePrecip &&
        maxPrecip >= limits.precipPoor
            ? 3
            : limits.usePrecip &&
              maxPrecip >= limits.precipSporty
                ? 2
                : 0;

    /*
    The per-hour timeline classification (used to
    paint the actual Sporty/Poor bands) also checks
    NOAA's text forecast for thunderstorm wording and
    any active marine alerts — a thunderstorm mention
    or a no-go alert sends that hour straight to Poor
    regardless of the numeric wind/wave/rain values.
    This summary needs to check the same things, or it
    ends up blaming whichever of Wind/Waves/Rain merely
    happened to cross a threshold, even when that's not
    what's actually driving the Poor hours shown below.
    */

    const noGoAlertNames = [
        "Special Marine Warning",
        "Severe Thunderstorm Warning",
        "Tornado Warning",
        "Small Craft Advisory",
        "Gale Warning",
        "Storm Warning",
        "Hurricane Warning",
        "Tropical Storm Warning",
        "Extreme Wind Warning"
    ];

    const sportyAlertNames = [
        "Severe Thunderstorm Watch",
        "Tornado Watch",
        "Gale Watch",
        "Storm Watch",
        "Hurricane Watch",
        "Tropical Storm Watch",
        "Marine Weather Statement",
        "Dense Fog Advisory",
        "Wind Advisory",
        "Coastal Flood Advisory"
    ];

    const hasThunderstormHour =
        limits.useThunder &&
        hours.some(hour =>
            String(hour.shortForecast || "")
                .toLowerCase()
                .includes("thunder")
        );

    const hasNoGoAlertHour =
        limits.useAlerts &&
        hours.some(hour =>
            Array.isArray(hour.alerts) &&
            hour.alerts.some(alert =>
                noGoAlertNames.includes(alert.event)
            )
        );

    const hasSportyAlertHour =
        limits.useAlerts &&
        hours.some(hour =>
            Array.isArray(hour.alerts) &&
            hour.alerts.some(alert =>
                sportyAlertNames.includes(alert.event)
            )
        );

    const alertSeverity =
        hasNoGoAlertHour
            ? 3
            : hasSportyAlertHour
                ? 2
                : 0;

    const thunderstormSeverity =
        hasThunderstormHour
            ? 3
            : 0;

    const concerns = [];

    if(thunderstormSeverity > 0){
        concerns.push("Thunderstorms");
    }

    if(alertSeverity > 0){
        concerns.push("Marine Alerts");
    }

    if(windSeverity > 0){
        concerns.push("Wind");
    }

    if(waveSeverity > 0){
        concerns.push("Waves");
    }

    if(rainSeverity > 0){
        concerns.push("Rain");
    }

    // Do not show a concern unless the remaining timeline actually
    // contains Sporty or Poor conditions. This prevents isolated
    // forecast values from creating a concern on an otherwise
    // all-day calm forecast.
    const hasUnfavorableTimeline =
        timeline.includes("SPORTY") ||
        timeline.includes("POOR");

    const primary =
        hasUnfavorableTimeline && concerns.length
            ? concerns.join(" + ")
            : "None";

    /*
    The displayed "primary" can list several concerns
    at once, but the recommendation sentence needs one
    clear main factor. Pick whichever concern actually
    has the highest severity, rather than pattern-matching
    the joined display string (which broke as soon as a
    concern the string-matching didn't know about, like
    thunderstorms, became the real driver).
    */
    const topConcern =
        [
            { name: "Thunderstorms", severity: thunderstormSeverity },
            { name: "Marine Alerts", severity: alertSeverity },
            { name: "Wind", severity: windSeverity },
            { name: "Waves", severity: waveSeverity },
            { name: "Rain", severity: rainSeverity }
        ]
        .reduce(
            (highest, concern) =>
                concern.severity > highest.severity
                    ? concern
                    : highest
        );

    const forecastText = `
        <div class="forecast-metrics-grid">
            <div class="forecast-metric">
                <span class="forecast-metric-label">Max Winds</span>
                <span class="forecast-metric-value">${Math.round(maxWind)} mph</span>
            </div>
            <div class="forecast-metric">
                <span class="forecast-metric-label">Max Gusts</span>
                <span class="forecast-metric-value">${Math.round(maxGust)} mph</span>
            </div>
            <div class="forecast-metric">
                <span class="forecast-metric-label">Max Waves</span>
                <span class="forecast-metric-value">${
                    maxWaves === null
                        ? "--"
                        : `${maxWaves.toFixed(1)} ft${
                            maxWavePeriod === null
                                ? ""
                                : ` @ ${maxWavePeriod.toFixed(1)} sec`
                        }`
                }</span>
            </div>
            <div class="forecast-metric">
                <span class="forecast-metric-label">Max Precip</span>
                <span class="forecast-metric-value">${Math.round(maxPrecip)}%</span>
            </div>
        </div>
        <div class="forecast-metrics-grid forecast-metrics-grid-secondary">
            <div class="forecast-metric">
                <span class="forecast-metric-label">Sunrise</span>
                <span class="forecast-metric-value" id="sunriseMetric">--</span>
            </div>
            <div class="forecast-metric">
                <span class="forecast-metric-label">Sunset</span>
                <span class="forecast-metric-value" id="sunsetMetric">--</span>
            </div>
            <div class="forecast-metric">
                <span class="forecast-metric-label">High Tides</span>
                <span class="forecast-metric-value" id="highTideMetric">--</span>
            </div>
            <div class="forecast-metric">
                <span class="forecast-metric-label">Low Tides</span>
                <span class="forecast-metric-value" id="lowTideMetric">--</span>
            </div>
        </div>
        <div id="forecastToolsMount"></div>
    `;

    let recommendation = "";

    if(primary === "None" || topConcern.severity === 0){
        recommendation =
            "Conditions are within the selected vessel's comfort limits for the favorable periods shown below.";
    }
    else if(topConcern.name === "Thunderstorms"){
        recommendation =
            "Thunderstorms in the forecast are the main factor pushing conditions into Poor territory.";
    }
    else if(topConcern.name === "Marine Alerts"){
        recommendation =
            topConcern.severity >= 3
                ? "An active marine warning is the main factor pushing conditions into Poor territory."
                : "An active marine watch/advisory is the main factor making conditions Sporty.";
    }
    else if(topConcern.name === "Wind"){
        recommendation =
            topConcern.severity >= 3
                ? "Wind is the main factor pushing conditions into Poor territory."
                : "Wind is the main factor making conditions Sporty.";
    }
    else if(topConcern.name === "Waves"){
        recommendation =
            topConcern.severity >= 3
                ? "Wave conditions are the main factor pushing conditions into Poor territory."
                : "Wave conditions are the main factor making conditions Sporty.";
    }
    else {
        recommendation =
            topConcern.severity >= 3
                ? "Rain probability is the main factor pushing conditions into Poor territory."
                : "Rain probability is the main factor making conditions Sporty.";
    }

    return `
        <div class="human-summary-block">
            <span class="human-summary-label">Primary concern:</span>
            <span class="human-summary-value">${escapeHTML(primary)}</span>
        </div>

        <div class="human-summary-block">
            <span class="human-summary-label">Forecast:</span>
            <span class="human-summary-value">${forecastText}</span>
        </div>

        <div class="human-summary-block">
            <span class="human-summary-label">Recommendation:</span>
            <div class="human-summary-detail">${escapeHTML(windowRecommendation)} ${escapeHTML(recommendation)}</div>
        </div>
    `;
}


/*
Touch devices (phones/tablets) don't have real hover, but
tapping a marker can still fire a synthesized "mouseover"
right before the "click" event. That opens the hover-only
tooltip (name only) at the same time the tap's click handler
opens the full details popup, and since there's no mouseout
on tap, the tooltip is left stuck open behind the popup. The
fix is to simply never bind the hover tooltip on touch
devices - the click/tap popup already shows the name plus
full details, so nothing is lost.
*/
function isTouchDevice(){

    return (
        ("ontouchstart" in window) ||
        (navigator.maxTouchPoints > 0) ||
        (navigator.msMaxTouchPoints > 0)
    );

}


function setupLocationMap(){

    const mapElement =
        document.getElementById(
            "locationMap"
        );


    if(!mapElement){
        return;
    }


    if(typeof L === "undefined"){

        document.getElementById(
            "message"
        ).textContent =
            "The interactive map could not be loaded.";

        return;
    }


    locationMap =
        L.map(
            mapElement,
            {
                zoomControl: true
            }
        );


    const streetsLayer =
        L.tileLayer(
            "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
                maxZoom: 18,
                attribution:
                    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }
        );


    const satelliteLayer =
        L.tileLayer(
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            {
                maxZoom: 19,
                attribution:
                    'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community'
            }
        );


    /*
    NOAA's own Chart Display Service, rendered from
    official ENC (Electronic Navigational Chart)
    data — this is the layer that actually carries
    depth contours, soundings, and shoal patterns,
    not just point icons. It's served as WMS rather
    than plain XYZ tiles, so Leaflet's built-in WMS
    tile layer handles the request format.

    Layers requested: 1 (natural/man-made features),
    2 (depths, currents), 3 (seabed/obstructions),
    4 (traffic routes), 5 (special areas), 6 (buoys/
    beacons/lights), 7 (small craft facilities).
    Layers 8-12 are QC/overscale warning layers, not
    chart content, so they're left out.

    NOAA's own service description notes this is
    "Not to be used for navigation" — it's an ENC
    rendering for reference/GIS use, not a
    certified chart carriage product.
    */
    const depthContourOverlay =
        L.tileLayer.wms(
            "https://gis.charttools.noaa.gov/arcgis/rest/services/MCS/NOAAChartDisplay/MapServer/exts/MaritimeChartService/WMSServer",
            {
                layers:
                    "1,2,3,4,5,6,7",
                format:
                    "image/png",
                transparent:
                    true,
                version:
                    "1.3.0",
                maxZoom:
                    18,
                attribution:
                    "NOAA Chart Display Service (ENC data) &mdash; not for navigation"
            }
        );


    streetsLayer.addTo(
        locationMap
    );


    /*
    Build the reef and buoy layer groups first so they exist
    before the layers control is created - that lets both be
    listed (and pre-checked, since they're already on the map)
    as ordinary overlay checkboxes in the same control, above
    Depth Contours, instead of as separate floating checkboxes.
    */
    setupFishingSpotsLayer();

    setupBuoyLayer();


    L.control.layers(
        {
            "Streets": streetsLayer,
            "Satellite": satelliteLayer
        },
        {
            "Offshore Reefs": fishingSpotsLayer,
            "Weather Buoys": buoyLayer,
            "Depth Contours (NOAA Chart)": depthContourOverlay
        },
        {
            position:
                "topleft",
            collapsed:
                true
        }
    )
    .addTo(
        locationMap
    );


    locationMap.fitBounds(
        DEFAULT_MAP_BOUNDS
    );


    locationMap.on(
        "click",
        event => {

            setSelectedMapLocation(
                event.latlng.lat,
                event.latlng.lng
            );

        }
    );

}


function setupFishingSpotsLayer(){

    if(!locationMap){
        return;
    }


    fishingSpotsLayer =
        L.layerGroup();


    fishingSpots.forEach(
        spot => {

            const marker =
                L.marker(
                    [
                        spot.lat,
                        spot.lon
                    ],
                    {
                        icon:
                            L.divIcon({
                                className:
                                    "fishing-spot-marker-wrapper",
                                html:
                                    '<div class="fishing-spot-marker" aria-hidden="true">🎣</div>',
                                iconSize:
                                    [30, 30],
                                iconAnchor:
                                    [15, 15],
                                popupAnchor:
                                    [0, -14]
                            }),
                        title:
                            spot.name
                    }
                );


            if(!isTouchDevice()){

                marker.bindTooltip(
                    spot.name,
                    {
                        direction:
                            "top",
                        offset:
                            [0, -12],
                        opacity:
                            0.95
                    }
                );

            }


            marker.bindPopup(
                (
                    '<div class="fishing-spot-popup">' +
                        '<strong>' +
                            escapeHTML(spot.name) +
                        '</strong>' +
                        '<div>' +
                            escapeHTML(spot.state) +
                        '</div>' +
                        '<div class="fishing-spot-coordinates">' +
                            spot.lat.toFixed(5) +
                            ', ' +
                            spot.lon.toFixed(5) +
                        '</div>' +
                    '</div>'
                )
            );


            /*
            Clicking the marker itself sets it as the
            forecast location, the same way tapping any
            point on the water does — no extra "use this
            location" step needed. The popup still opens
            (via Leaflet's default marker click behavior)
            so the name/coordinates remain visible.
            */
            marker.on(
                "click",
                () => {

                    setSelectedMapLocation(
                        spot.lat,
                        spot.lon,
                        spot.name,
                        false
                    );

                }
            );


            marker.addTo(
                fishingSpotsLayer
            );

        }
    );


    fishingSpotsLayer.addTo(
        locationMap
    );

}


/*
Buoy readings used to be parsed here in the browser from NDBC's raw
realtime2 text files. That required a client-side fetch straight to
ndbc.noaa.gov (blocked — no CORS header) with a public CORS-proxy
fallback (unreliable, rate-limited, could disappear any time).

That parsing now happens server-side, once every 30 minutes, in a
GitHub Action (see .github/workflows/fetch-buoys.yml and
scripts/fetch-buoys.js in the repo). The Action writes the results to
data/buoys.json, which is just a static file served from Drift's own
domain — so loadBuoyData() below is a same-origin fetch with no CORS
issue at all.
*/


function timeAgoLabel(date){

    if(!date){
        return "time unknown";
    }

    const minutesAgo =
        Math.round(
            (Date.now() - date.getTime()) /
            60000
        );

    if(minutesAgo < 1){
        return "just now";
    }

    if(minutesAgo < 60){
        return `${minutesAgo} min ago`;
    }

    const hoursAgo =
        Math.round(minutesAgo / 60);

    return `${hoursAgo} hr ago`;

}


function buildBuoyPopupHTML(station, observation, errorMessage){

    const header =
        '<div class="buoy-popup">' +
            '<div class="buoy-popup-label">🛟 Live Buoy Reading</div>' +
            '<strong>' + escapeHTML(station.name) + '</strong>' +
            '<div class="buoy-popup-coordinates">' +
                station.lat.toFixed(3) + ', ' + station.lon.toFixed(3) +
            '</div>';

    const footer =
            '<p class="buoy-popup-explainer">' +
                'Real-time sensor data. This location has also been set as your forecast point.' +
            '</p>' +
        '</div>';

    if(errorMessage){

        return (
            header +
            '<div class="buoy-popup-error">' +
                escapeHTML(errorMessage) +
            '</div>' +
            footer
        );

    }

    if(!observation){

        return (
            header +
            '<div class="buoy-popup-loading">Loading latest reading…</div>' +
            footer
        );

    }

    const rows = [];

    if(
        observation.windSpeedMph !== null ||
        observation.gustMph !== null
    ){

        rows.push(
            '<div class="buoy-popup-row">' +
                '<span>Wind</span>' +
                '<strong>' +
                    (
                        observation.windSpeedMph !== null
                            ? Math.round(observation.windSpeedMph) + ' mph'
                            : '—'
                    ) +
                    (
                        observation.gustMph !== null
                            ? ' (gust ' + Math.round(observation.gustMph) + ' mph)'
                            : ''
                    ) +
                '</strong>' +
            '</div>'
        );

    }

    if(
        station.hasWave &&
        observation.waveHeightFt !== null
    ){

        rows.push(
            '<div class="buoy-popup-row">' +
                '<span>Waves</span>' +
                '<strong>' +
                    observation.waveHeightFt.toFixed(1) + ' ft' +
                    (
                        observation.wavePeriodSec !== null
                            ? ' @ ' + observation.wavePeriodSec.toFixed(1) + ' sec'
                            : ''
                    ) +
                '</strong>' +
            '</div>'
        );

    }

    if(observation.airTempF !== null){

        rows.push(
            '<div class="buoy-popup-row">' +
                '<span>Air Temp</span>' +
                '<strong>' + Math.round(observation.airTempF) + '°F</strong>' +
            '</div>'
        );

    }

    if(!rows.length){

        rows.push(
            '<div class="buoy-popup-row buoy-popup-no-data">' +
                'No recent readings from this station.' +
            '</div>'
        );

    }

    return (
        header +
        '<div class="buoy-popup-updated">' +
            'Updated ' + timeAgoLabel(observation.observedAt) +
        '</div>' +
        rows.join("") +
        footer
    );

}


let buoyDataPromise = null;

function loadBuoyData(){

    /*
    Fetches data/buoys.json once (subsequent calls reuse the same
    in-flight/completed promise) and caches it for the rest of the
    page's life. The GitHub Action refreshes this file every 30
    minutes, so a fresh page load is all that's needed to pick up new
    readings — no polling required.
    */

    if(!buoyDataPromise){

        buoyDataPromise =
            fetch("data/buoys.json")
                .then(response => {

                    if(!response.ok){
                        throw new Error(
                            `Buoy data file returned ${response.status}`
                        );
                    }

                    return response.json();

                })
                .catch(error => {

                    // Allow a later call to retry instead of being
                    // stuck with a rejected promise forever.
                    buoyDataPromise = null;

                    throw error;

                });

    }

    return buoyDataPromise;

}


async function fetchBuoyObservation(station){

    if(buoyObservationCache[station.id]){
        return buoyObservationCache[station.id];
    }

    const allBuoyData =
        await loadBuoyData();

    const raw =
        allBuoyData[station.id];

    if(!raw){

        throw new Error(
            `NDBC data unavailable for ${station.name}`
        );

    }

    const observation = {
        observedAt:
            raw.observedAt
                ? new Date(raw.observedAt)
                : null,
        windSpeedMph: raw.windSpeedMph,
        gustMph: raw.gustMph,
        waveHeightFt: raw.waveHeightFt,
        wavePeriodSec: raw.wavePeriodSec,
        airTempF: raw.airTempF
    };

    buoyObservationCache[station.id] = observation;

    return observation;

}


function setupBuoyLayer(){

    if(!locationMap){
        return;
    }

    buoyLayer =
        L.layerGroup();

    buoyStations.forEach(
        station => {

            const marker =
                L.marker(
                    [station.lat, station.lon],
                    {
                        icon:
                            L.divIcon({
                                className:
                                    "buoy-marker-wrapper",
                                html:
                                    '<div class="buoy-marker" aria-hidden="true">🛟</div>',
                                iconSize:
                                    [24, 24],
                                iconAnchor:
                                    [12, 12],
                                popupAnchor:
                                    [0, -10]
                            }),
                        title:
                            station.name
                    }
                );

            if(!isTouchDevice()){

                marker.bindTooltip(
                    station.name,
                    {
                        direction:
                            "top",
                        offset:
                            [0, -10],
                        opacity:
                            0.95
                    }
                );

            }

            marker.bindPopup(
                buildBuoyPopupHTML(
                    station,
                    null,
                    null
                )
            );

            /*
            Clicking the marker sets it as the forecast
            location immediately — same behavior as any
            other point on the map — while the popup still
            opens (Leaflet's default marker click behavior)
            to show the live reading.
            */
            marker.on(
                "click",
                () => {

                    setSelectedMapLocation(
                        station.lat,
                        station.lon,
                        station.name,
                        false
                    );

                }
            );

            marker.on(
                "popupopen",
                async event => {

                    try {

                        const observation =
                            await fetchBuoyObservation(
                                station
                            );

                        marker.setPopupContent(
                            buildBuoyPopupHTML(
                                station,
                                observation,
                                null
                            )
                        );

                    }
                    catch(error){

                        console.warn(
                            `Buoy reading failed for ${station.name}:`,
                            error
                        );

                        marker.setPopupContent(
                            buildBuoyPopupHTML(
                                station,
                                null,
                                "Live reading unavailable right now."
                            )
                        );

                    }

                }
            );

            marker.addTo(
                buoyLayer
            );

        }
    );


    /*
    Buoys are on by default — this is opt-out,
    not opt-in.
    */
    buoyLayer.addTo(
        locationMap
    );

}


function setSelectedMapLocation(
    lat,
    lon,
    locationName = null,
    openOwnPopup = true
){

    if(
        !Number.isFinite(Number(lat)) ||
        !Number.isFinite(Number(lon))
    ){
        return;
    }


    const numericLat =
        Number(lat);

    const numericLon =
        Number(lon);


    if(
        selectedMapLocationName &&
        Object.prototype.hasOwnProperty.call(
            locations,
            selectedMapLocationName
        )
    ){
        delete locations[
            selectedMapLocationName
        ];
    }


    selectedMapLocationName =
        locationName ||
        (
            "Selected Location (" +
            numericLat.toFixed(5) +
            ", " +
            numericLon.toFixed(5) +
            ")"
        );


    locations[
        selectedMapLocationName
    ] = {
        lat:
            numericLat,
        lon:
            numericLon
    };


    if(selectedMapMarker){

        selectedMapMarker.setLatLng(
            [
                numericLat,
                numericLon
            ]
        );

    }
    else {

        selectedMapMarker =
            L.circleMarker(
                [
                    numericLat,
                    numericLon
                ],
                {
                    radius: 8,
                    color: "#ffffff",
                    weight: 3,
                    fillColor: "#1479c9",
                    fillOpacity: 1
                }
            )
            .addTo(
                locationMap
            );

    }


    /*
    When called from a pre-plotted marker (a buoy or
    reef) that has its own popup with more specific
    info, skip opening this generic "Selected location"
    popup — Leaflet closes any other open popup as soon
    as one opens, so this would otherwise silently steal
    focus from the buoy/reef popup right after it opens.
    The circle marker still moves to the new spot either
    way; only the popup is conditional.
    */
    selectedMapMarker.bindPopup(
        (
            "<strong>Selected location</strong><br>" +
            numericLat.toFixed(5) +
            ", " +
            numericLon.toFixed(5)
        )
    );

    if(openOwnPopup){
        selectedMapMarker.openPopup();
    }


    const selectedLocationText =
        document.getElementById(
            "selectedMapLocation"
        );


    if(selectedLocationText){

        selectedLocationText.textContent =
            (
                locationName
                    ? locationName + " — "
                    : ""
            ) +
            numericLat.toFixed(5) +
            ", " +
            numericLon.toFixed(5);

    }


    const message =
        document.getElementById(
            "message"
        );


    if(message){
        message.textContent = "";
    }

}


function clearMapSelection(){

    clearForecastSourceMapOverlay();

    const sourcePanel = document.getElementById("forecastSourcePanel");
    const sourceDetails = document.getElementById("forecastSourceDetails");
    const sourceToggle = document.getElementById("forecastSourceToggle");
    sourcePanel?.classList.add("hidden");
    sourceDetails?.classList.add("hidden");
    sourceToggle?.setAttribute("aria-expanded", "false");
    lastForecastSourceMeta = null;

    if(
        selectedMapMarker &&
        locationMap
    ){

        locationMap.removeLayer(
            selectedMapMarker
        );

    }


    selectedMapMarker = null;


    if(
        selectedMapLocationName &&
        Object.prototype.hasOwnProperty.call(
            locations,
            selectedMapLocationName
        )
    ){

        delete locations[
            selectedMapLocationName
        ];

    }


    selectedMapLocationName = null;


    const selectedLocationText =
        document.getElementById(
            "selectedMapLocation"
        );


    if(selectedLocationText){

        selectedLocationText.textContent =
            "No location selected";

    }


    if(locationMap){

        locationMap.fitBounds(
            DEFAULT_MAP_BOUNDS
        );

    }

}


function setupDarkMode(){

    const toggle =
        document.getElementById(
            "darkModeToggle"
        );

    const icon =
        document.getElementById(
            "darkModeIcon"
        );

    const text =
        document.getElementById(
            "darkModeText"
        );


    if(!toggle){

        console.error(
            "Could not find darkModeToggle."
        );

        return;

    }


    const savedMode =
        localStorage.getItem(
            "boatingConditionsDarkMode"
        );


    /*
    Use the saved preference when available.

    When there is no saved preference,
    use the device's current appearance.
    */

    const prefersDark =
        window.matchMedia &&
        window.matchMedia(
            "(prefers-color-scheme: dark)"
        ).matches;


    const shouldUseDarkMode =
        savedMode === "dark" ||
        (
            savedMode === null &&
            prefersDark
        );


    setDarkMode(
        shouldUseDarkMode,
        toggle,
        icon,
        text
    );


    toggle.addEventListener(
        "click",
        function(){

            const darkModeEnabled =
                !document.body.classList.contains(
                    "dark-mode"
                );


            setDarkMode(
                darkModeEnabled,
                toggle,
                icon,
                text
            );


            localStorage.setItem(
                "boatingConditionsDarkMode",
                darkModeEnabled
                    ? "dark"
                    : "light"
            );

        }
    );

}
function setDarkMode(
    enabled,
    toggle,
    icon,
    text
){

    document.body.classList.toggle(
        "dark-mode",
        enabled
    );


    toggle.setAttribute(
        "aria-pressed",
        String(enabled)
    );


    toggle.setAttribute(
        "aria-label",
        enabled
            ? "Switch to light mode"
            : "Switch to dark mode"
    );


    icon.textContent =
        enabled
            ? "☀️"
            : "🌙";


    text.textContent =
        enabled
            ? "Light mode"
            : "Dark mode";


    updateChartAppearance(
        enabled
    );

}
function updateChartAppearance(isDarkMode){

    const textColor =
        isDarkMode
            ? "#cbd5e1"
            : "#475569";

    const gridColor =
        isDarkMode
            ? "rgba(148, 163, 184, 0.18)"
            : "rgba(100, 116, 139, 0.15)";


    [
        windChart,
        waveChart,
        precipChart,
        tideChart
    ].forEach(chart => {

        if(!chart){
            return;
        }


        const scales =
            chart.options.scales;


        if(scales?.x){

            scales.x.ticks =
                scales.x.ticks || {};

            scales.x.grid =
                scales.x.grid || {};

            scales.x.ticks.color =
                textColor;

            scales.x.grid.color =
                gridColor;

        }


        if(scales?.y){

            scales.y.ticks =
                scales.y.ticks || {};

            scales.y.grid =
                scales.y.grid || {};

            scales.y.ticks.color =
                textColor;

            scales.y.grid.color =
                gridColor;

        }


        chart.update();

    });

}


function setToday(){

    const today = new Date();

    const year = today.getFullYear();

    const month = String(today.getMonth()+1).padStart(2,"0");

    const day = String(today.getDate()).padStart(2,"0");


    document.getElementById("date").value =
        `${year}-${month}-${day}`;

}


function setupVesselCards(){

    const cards =
        document.querySelectorAll(".vessel-card");

    const boatInput =
        document.getElementById("boatSize");

    /*
    Always start with no vessel selected.
    The user must choose a boat for the current forecast.
    */
    cards.forEach(card => {

        card.classList.remove("selected");

        card.addEventListener("click", function(){

            cards.forEach(c => {
                c.classList.remove("selected");
            });

            this.classList.add("selected");

            if(boatInput){
                boatInput.value =
                    this.dataset.size;
            }

            if(
                this.dataset.size === "custom" &&
                !getSavedCustomProfile()
            ){
                openCustomSettingsModal();
            }

        });

    });

    if(boatInput){
        boatInput.value = "";
    }

}

function clearSelections(){

    clearMapSelection();

    document
        .querySelectorAll(".vessel-card")
        .forEach(card => {
            card.classList.remove("selected");
        });

    const boatInput =
        document.getElementById("boatSize");

    if(boatInput){
        boatInput.value = "";
    }

    localStorage.removeItem(
        "preferredBoatSize"
    );

    setToday();

    const checked =
        document.getElementById("checked");

    if(checked){
        checked.textContent = "--";
    }

    const message =
        document.getElementById("message");

    if(message){
        message.textContent = "";
    }

    const confidencePanel =
        document.getElementById(
            "forecastConfidencePanel"
        );

    if(confidencePanel){
        confidencePanel.classList.add(
            "hidden"
        );
    }

    forecastConfidenceRequestId++;
    lastForecastConfidence = null;


    const results =
        document.getElementById("results");

    if(results){
        results.classList.add("hidden");
    }

    lastSunData = null;
    lastCurrentTimeHour = null;

    window.scrollTo({
    top: 0,
    behavior: "smooth"
});
}



function setCheckConditionsLoading(isLoading){

    const button =
        document.querySelector(
            ".check-button"
        );

    if(!button){
        return;
    }

    button.disabled =
        isLoading;

    button.classList.toggle(
        "is-loading",
        isLoading
    );

    button.setAttribute(
        "aria-busy",
        String(isLoading)
    );

}


function formatSearchedDateLabel(dateString){

    /*
    dateString is "YYYY-MM-DD" from the date input.
    Parsed as year/month/day components directly
    (rather than passed straight to `new Date()`)
    so it isn't interpreted as UTC midnight and
    shifted a day off in the browser's local zone.
    */

    const [year, month, day] =
        dateString
            .split("-")
            .map(Number);

    const parsedDate =
        new Date(
            year,
            month - 1,
            day
        );

    const weekday =
        parsedDate
            .toLocaleDateString(
                "en-US",
                { weekday: "short" }
            )
            .toUpperCase();

    const paddedMonth =
        String(month)
            .padStart(2, "0");

    const paddedDay =
        String(day)
            .padStart(2, "0");

    return (
        weekday + " " +
        paddedMonth + "/" +
        paddedDay
    );

}


async function checkConditions(){

    const selectedLocation =
        selectedMapLocationName;


    if(!selectedLocation){

        document.getElementById("message").innerHTML =
            "Please click a boating location on the map.";

        return;

    }


    const boatSize =
        document.getElementById("boatSize").value;


    if(!boatSize){

        document.getElementById("message").innerHTML =
            "Please select a boat size.";

        return;

    }


    const selectedDate =
        document.getElementById("date").value;


    if(!selectedDate){

        document.getElementById("message").innerHTML =
            "Please select a date.";

        return;

    }


    setCheckConditionsLoading(true);

    document.getElementById("message").innerHTML =
        "Checking conditions...";


    const confidenceRequestId =
        ++forecastConfidenceRequestId;

    document
        .getElementById("forecastConfidencePanel")
        ?.classList.add("hidden");

    getForecastConfidence(
        selectedLocation,
        selectedDate
    )
    .then(confidence => {
        if(
            confidenceRequestId ===
            forecastConfidenceRequestId
        ){
            renderForecastConfidence(
                confidence
            );
        }
    })
    .catch(error => {
        console.warn(
            "Unable to compare forecast models:",
            error
        );

        if(
            confidenceRequestId ===
            forecastConfidenceRequestId
        ){
            renderForecastConfidence(
                "unavailable"
            );
        }
    });


    document
        .getElementById("results")
        .classList
        .add("hidden");


    try {

        const sun =
            getSunTimes(
                selectedLocation,
                selectedDate
            );
        document.getElementById("checked").innerHTML =
            new Date().toLocaleString();


        const [
            forecast,
            allAlerts
        ] = await Promise.all([

            getHourlyWeather(
                selectedLocation,
                selectedDate
            ),

            getActiveAlerts(
                selectedLocation
            )

        ]);


        if(!forecast){

            document.getElementById("message").innerHTML =
                "Weather data unavailable. Please try again.";

            return;

        }


        applyAlertsToForecast(
            forecast,
            allAlerts
        );


        const evaluated =
            evaluateLocation(
                forecast,
                boatSize
            );


        const timeline =
            evaluated.hourlyResults;


/*
For today's forecast, remove elapsed hours
from recommendations and summaries (though not
from the timeline display itself - the whole
day is always shown there, with the current-time
line marking where "now" falls).

The current hour remains included because
conditions for that hour are still relevant.
*/

const now = new Date();

const todayString = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0")
].join("-");

const isToday =
    selectedDate === todayString;


const relevantTimeline =
    timeline.map((status, hourIndex) => {

        if(
            isToday &&
            hourIndex < now.getHours()
        ){
            return "PAST";
        }

        return status;

    });


const validTimeline =
    relevantTimeline.filter(value =>
        value === "FLAT" ||
        value === "CALM" ||
        value === "SPORTY" ||
        value === "POOR"
    );


        if(validTimeline.length === 0){

            document.getElementById("message").innerHTML =
                "No remaining forecast hours are available for today.";

            return;

        }


        const overall =
            determineDailyResult(validTimeline);


        lastCurrentTimeHour =
            isToday
                ? (
                    now.getHours() +
                    now.getMinutes() / 60
                )
                : null;


        createTimeline(
    timeline,
    sun,
    isToday
        ? timeToPercent(now)
        : null
);


        document.getElementById("decisionSearchedDate").textContent =
            formatSearchedDateLabel(
                selectedDate
            );


        document.getElementById("decision").innerHTML =
            (overall === "MAYBE" ? "MAYBE GO" : overall) + " " + emoji(overall);


        document.getElementById("decision").className =
            overallClass(overall);


        const decisionSummaryElement =
            document.getElementById(
                "decisionSummary"
            );

        decisionSummaryElement.classList.add(
            "human-decision-summary"
        );

        const bestWindow =
            getBestWindowDetails(
                relevantTimeline
            );

        const windowRecommendation =
            bestWindow
                ? (
                    `Go between ${bestWindow.timeRange}. ` +
                    (
                        bestWindow.length === 1
                            ? "1 consecutive flat or calm hour."
                            : `${bestWindow.length} consecutive flat or calm hours.`
                    )
                )
                : "No flat or calm boating window is available.";

        /*
        The forecast tools row (Source + Confidence buttons)
        gets moved into a mount point inside the summary HTML
        below. That mount point is destroyed and recreated on
        every check, so the row has to be detached BEFORE the
        rebuild instead of being searched for AFTER it -
        otherwise the row (and its buttons) gets deleted along
        with the old mount point on the second and later checks.
        */
        const forecastToolsRow =
            document.querySelector(".forecast-tools-row");

        if(forecastToolsRow && forecastToolsRow.parentNode){
            forecastToolsRow.parentNode.removeChild(
                forecastToolsRow
            );
        }

        decisionSummaryElement.innerHTML =
            getHumanDecisionSummaryHTML(
                forecast,
                boatSize,
                selectedDate,
                validTimeline,
                windowRecommendation
            );

        document.getElementById(
            "decisionWindowSummary"
        ).textContent = "";

        const forecastToolsMount =
            document.getElementById("forecastToolsMount");

        if(forecastToolsMount && forecastToolsRow){
            forecastToolsMount.appendChild(forecastToolsRow);
        }


        await renderTideOverlay(
            selectedLocation,
            selectedDate,
            sun
        );


createEvidenceCharts(forecast);
const alertsForSelectedTime =
    getAlertsFromForecast(forecast);
function getAlertsFromForecast(hourlyForecast){

    const matchingAlerts = [];


    hourlyForecast.forEach(hour => {

        if(
            !hour ||
            !Array.isArray(hour.alerts)
        ){
            return;
        }


        hour.alerts.forEach(alert => {

            matchingAlerts.push(
                alert
            );

        });

    });


    return matchingAlerts;

}
renderAdvisoryTile(
    alertsForSelectedTime
);

renderNextSixDays(
    selectedLocation,
    selectedDate,
    boatSize,
    allAlerts
).catch(error => {
    console.warn("Unable to render the next six days:", error);
});

        document
            .getElementById("results")
            .classList
            .remove("hidden");

setTimeout(() => {

    const resultsElement = document.getElementById("results");
    const headerElement = document.querySelector(".top-banner");

    if(resultsElement){
        const headerHeight = headerElement
            ? headerElement.getBoundingClientRect().height
            : 0;

        const targetTop =
            resultsElement.getBoundingClientRect().top +
            window.scrollY -
            headerHeight -
            16;

        window.scrollTo({
            top: Math.max(0, targetTop),
            behavior: "smooth"
        });
    }

}, 150);
       
        document.getElementById("message").innerHTML = "";

    }
    catch(error){

        console.error(
            "Unable to check conditions:",
            error
        );


        document.getElementById("message").innerHTML =
            "Unable to finish checking conditions: " +
            error.message;


        document
            .getElementById("results")
            .classList
            .remove("hidden");

    }

    finally {

        setCheckConditionsLoading(false);

    }

}


function escapeHTML(value){

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


function renderAdvisoryTile(alerts){

    const advisoryTile =
        document.getElementById(
            "advisoryText"
        );


    if(!advisoryTile){

        console.error(
            "Could not find advisoryText element."
        );

        return;

    }


    if(
        !Array.isArray(alerts) ||
        alerts.length === 0
    ){

        advisoryTile.innerHTML =
            "✓ No active advisories";

        return;

    }


    /*
    Remove duplicate alerts returned for
    more than one selected location.
    */

    const uniqueAlerts =
        new Map();


    alerts.forEach(alert => {

        const key =
            alert.id ||
            `${alert.event}-${alert.expires}`;


        if(!uniqueAlerts.has(key)){

            uniqueAlerts.set(
                key,
                {
                    ...alert,
                    locations: [
                        alert.location
                    ]
                }
            );

        }
        else {

            const existing =
                uniqueAlerts.get(key);


            if(
                alert.location &&
                !existing.locations.includes(
                    alert.location
                )
            ){

                existing.locations.push(
                    alert.location
                );

            }

        }

    });


    advisoryTile.innerHTML =
        [...uniqueAlerts.values()]
        .map(alert => {

            const endTime =
                alert.ends ||
                alert.expires;


            const endText =
                endTime
                    ? new Date(
                        endTime
                    ).toLocaleString(
                        [],
                        {
                            weekday: "short",
                            hour: "numeric",
                            minute: "2-digit"
                        }
                    )
                    : "Time unavailable";


            const locationsText =
                alert.locations
                    .filter(Boolean)
                    .join(", ");


            return `

                <div class="active-advisory">

    <div class="advisory-title">
        ⚠ ${escapeHTML(
            alert.event
        )}
    </div>

    ${
        locationsText
            ? `
                <div class="advisory-location">
                    ${escapeHTML(
                        locationsText
                    )}
                </div>
            `
            : ""
    }

    <div class="advisory-time">
        Until ${escapeHTML(
            endText
        )}
    </div>

</div>

            `;

        })
        .join("");

}



function createEvidenceCharts(forecast){

    const maxWind = [];
    const maxGust = [];
    const maxWaves = [];
    const maxWavePeriods = [];
    const maxPrecip = [];

    const windDirections =
        forecast.map(hour =>
            hour
                ? hour.windDirection || null
                : null
        );

    for(let hour = 0; hour < 24; hour++){

        const hourData =
            forecast[hour];


        if(!hourData){

            maxWind.push(null);
            maxGust.push(null);
            maxWaves.push(null);
            maxWavePeriods.push(null);
            maxPrecip.push(null);

            continue;
        }


        const windValue =
            Number(hourData.wind);

        maxWind.push(
            Number.isFinite(windValue)
                ? windValue
                : null
        );


        const gustValue =
            Number(hourData.gust);

        maxGust.push(
            Number.isFinite(gustValue)
                ? gustValue
                : null
        );


        const waveHeight =
            Number(hourData.waves);

        const hasWaveHeight =
            hourData.waves !== null &&
            hourData.waves !== undefined &&
            Number.isFinite(waveHeight);

        maxWaves.push(
            hasWaveHeight
                ? waveHeight
                : null
        );


        const wavePeriod =
            Number(hourData.wavePeriod);

        maxWavePeriods.push(
            hasWaveHeight &&
            hourData.wavePeriod !== null &&
            hourData.wavePeriod !== undefined &&
            Number.isFinite(wavePeriod)
                ? wavePeriod
                : null
        );


        const precipValue =
            Number(hourData.precip);

        maxPrecip.push(
            Number.isFinite(precipValue)
                ? precipValue
                : null
        );

    }


    const availableWind =
        maxWind.filter(value =>
            value !== null
        );

    const availableGust =
        maxGust.filter(value =>
            value !== null
        );

    const availableWaves =
        maxWaves.filter(value =>
            value !== null
        );

    const availablePrecip =
        maxPrecip.filter(value =>
            value !== null
        );


    document.getElementById("windSummary").innerHTML =
        availableWind.length
            ? (
                "Sustained: " +
                Math.max(...availableWind) +
                " mph | Gusts: " +
                (
                    availableGust.length
                        ? Math.max(...availableGust)
                        : Math.max(...availableWind)
                ) +
                " mph"
            )
            : "No forecast data";


    document.getElementById("waveSummary").innerHTML =
        availableWaves.length
            ? (
                "Max: " +
                Math.max(...availableWaves)
                    .toFixed(1) +
                " ft"
            )
            : "Wave forecast unavailable";


    document.getElementById("precipSummary").innerHTML =
        availablePrecip.length
            ? (
                "Peak: " +
                Math.max(...availablePrecip) +
                "%"
            )
            : "No forecast data";

    createWindChart(
    maxWind,
    maxGust,
    windDirections
);

    createWaveChart(
        maxWaves,
        maxWavePeriods
    );
    createPrecipChart(maxPrecip);

}



const windDirectionDegrees = {
    N: 0,
    NNE: 22.5,
    NE: 45,
    ENE: 67.5,
    E: 90,
    ESE: 112.5,
    SE: 135,
    SSE: 157.5,
    S: 180,
    SSW: 202.5,
    SW: 225,
    WSW: 247.5,
    W: 270,
    WNW: 292.5,
    NW: 315,
    NNW: 337.5
};


function getWindTravelDirection(direction){

    const sourceDirection =
        windDirectionDegrees[
            String(direction || "")
                .trim()
                .toUpperCase()
        ];

    if(sourceDirection === undefined){
        return null;
    }

    /*
    NOAA reports where the wind comes from.

    Add 180 degrees so the arrow points
    where the wind is blowing toward.
    */
    return (
        sourceDirection + 180
    ) % 360;

}
    const windDirectionArrowPlugin = {

    id: "windDirectionArrows",

    afterDraw(chart, args, options){

        const directions =
            options?.directions;

        const xScale =
            chart.scales.x;

        if(!xScale){
            return;
        }


        const ctx =
            chart.ctx;

        const isDarkMode =
            document.body.classList.contains(
                "dark-mode"
            );

        const arrowColor =
            isDarkMode
                ? "#cbd5e1"
                : "#475569";

        /*
        Both rows are drawn manually (rather than relying
        on Chart.js's own x-axis tick labels, which are
        hidden) so the wind-direction arrows can sit
        directly under the line, with the hour-of-day row
        below them - instead of the arrows sitting at the
        very bottom, underneath the hour labels.
        */

        const axisBottom =
            chart.chartArea.bottom;

        const arrowY =
            axisBottom + 12;

        const hourRowY =
            axisBottom + 27;


        ctx.save();


        if(
            Array.isArray(directions) &&
            directions.length > 0
        ){

            ctx.strokeStyle =
                arrowColor;

            ctx.fillStyle =
                arrowColor;

            ctx.lineWidth = 1.5;


            directions.forEach(
                (direction, index) => {

                    const degrees =
                        getWindTravelDirection(
                            direction
                        );

                    if(degrees === null){
                        return;
                    }


                    const x =
                        xScale.getPixelForValue(
                            index
                        );


                    /*
                    Canvas zero degrees points right,
                    while compass zero degrees points north.
                    */
                    const rotation =
                        (
                            degrees - 90
                        ) *
                        Math.PI / 180;


                    ctx.save();

                    ctx.translate(
                        x,
                        arrowY
                    );

                    ctx.rotate(
                        rotation
                    );


                    /*
                    Draw the arrow shaft.
                    */
                    ctx.beginPath();

                    ctx.moveTo(
                        -4,
                        0
                    );

                    ctx.lineTo(
                        4,
                        0
                    );

                    ctx.stroke();


                    /*
                    Draw the arrowhead.
                    */
                    ctx.beginPath();

                    ctx.moveTo(
                        4,
                        0
                    );

                    ctx.lineTo(
                        1,
                        -2.5
                    );

                    ctx.lineTo(
                        1,
                        2.5
                    );

                    ctx.closePath();

                    ctx.fill();


                    ctx.restore();

                }
            );

        }


        /*
        A handful of evenly-spaced hour labels below the
        arrow row - every 3rd hour, matching the main
        24-hour timeline and the other charts.
        */

        const hourLabelsForChart =
            options?.hourLabels;

        const hourLabelIndices =
            options?.hourLabelIndices;

        if(
            Array.isArray(hourLabelsForChart) &&
            Array.isArray(hourLabelIndices)
        ){

            ctx.font =
                "11px Arial";

            ctx.textAlign =
                "center";

            ctx.textBaseline =
                "middle";

            ctx.fillStyle =
                isDarkMode
                    ? "#94a3b8"
                    : "#666666";

            hourLabelIndices.forEach(index => {

                const label =
                    hourLabelsForChart[index];

                if(!label){
                    return;
                }

                const x =
                    xScale.getPixelForValue(
                        index
                    );

                ctx.fillText(
                    label,
                    x,
                    hourRowY
                );

            });

        }


        ctx.restore();

    }

};


/*
Shades the parts of a chart's plot area that fall before
sunrise or after sunset with a light gray overlay, so it's
clear at a glance which hours are in darkness.
*/
const nightShadingPlugin = {

    id: "nightShading",

    beforeDatasetsDraw(chart, args, options){

        const sunriseHour =
            options?.sunriseHour;

        const sunsetHour =
            options?.sunsetHour;

        if(
            !Number.isFinite(sunriseHour) ||
            !Number.isFinite(sunsetHour)
        ){
            return;
        }


        const xScale =
            chart.scales.x;

        const chartArea =
            chart.chartArea;

        if(!xScale || !chartArea){
            return;
        }


        const hoursPerBar =
            options?.hoursPerBar || 1;

        const lastIndex =
            (chart.data.labels || []).length - 1;

        if(lastIndex < 0){
            return;
        }


        /*
        Converts a decimal hour-of-day (e.g. 6.25 for
        6:15am) into an x-pixel position, interpolating
        between the two nearest category indices - since
        each point/bar can represent more than one hour
        on the narrow-screen binned wave chart.
        */
        const pixelForHour = hour => {

            const index =
                Math.max(
                    0,
                    Math.min(
                        hour / hoursPerBar,
                        lastIndex
                    )
                );

            const lowerIndex =
                Math.floor(index);

            const upperIndex =
                Math.min(
                    lowerIndex + 1,
                    lastIndex
                );

            const lowerPixel =
                xScale.getPixelForValue(lowerIndex);

            const upperPixel =
                xScale.getPixelForValue(upperIndex);

            if(upperIndex === lowerIndex){
                return lowerPixel;
            }

            const fraction =
                index - lowerIndex;

            return (
                lowerPixel +
                (upperPixel - lowerPixel) * fraction
            );

        };


        const sunrisePixel =
            pixelForHour(sunriseHour);

        const sunsetPixel =
            pixelForHour(sunsetHour);

        const isDarkMode =
            document.body.classList.contains(
                "dark-mode"
            );

        const ctx =
            chart.ctx;


        ctx.save();

        ctx.fillStyle =
            isDarkMode
                ? "rgba(0, 0, 0, 0.25)"
                : "rgba(100, 116, 139, 0.12)";


        /*
        Before sunrise.
        */
        if(sunrisePixel > chartArea.left){

            ctx.fillRect(
                chartArea.left,
                chartArea.top,
                sunrisePixel - chartArea.left,
                chartArea.bottom - chartArea.top
            );

        }


        /*
        After sunset.
        */
        if(sunsetPixel < chartArea.right){

            ctx.fillRect(
                sunsetPixel,
                chartArea.top,
                chartArea.right - sunsetPixel,
                chartArea.bottom - chartArea.top
            );

        }


        ctx.restore();

    }

};


/*
Reads the most recently computed sunrise/sunset times
(cached in lastSunData by renderTideOverlay) as decimal
hours-of-day, for the nightShadingPlugin. Returns null
when no valid sun data is available yet.
*/
function getNightShadingHours(){

    if(
        !lastSunData ||
        !(lastSunData.sunriseDate instanceof Date) ||
        !(lastSunData.sunsetDate instanceof Date) ||
        Number.isNaN(lastSunData.sunriseDate.getTime()) ||
        Number.isNaN(lastSunData.sunsetDate.getTime())
    ){
        return null;
    }

    const toDecimalHour = date =>
        date.getHours() +
        date.getMinutes() / 60;

    return {
        sunriseHour:
            toDecimalHour(lastSunData.sunriseDate),
        sunsetHour:
            toDecimalHour(lastSunData.sunsetDate)
    };

}


/*
Draws a vertical red line marking the current time on a
chart, with a small "Now" flag at the top of the line. Only
draws when lastCurrentTimeHour is set - i.e. when the
selected forecast date is today.
*/
const currentTimeLinePlugin = {

    id: "currentTimeLine",

    afterDatasetsDraw(chart, args, options){

        const currentHour =
            options?.currentHour;

        if(!Number.isFinite(currentHour)){
            return;
        }


        const xScale =
            chart.scales.x;

        const chartArea =
            chart.chartArea;

        if(!xScale || !chartArea){
            return;
        }


        const hoursPerBar =
            options?.hoursPerBar || 1;

        const lastIndex =
            (chart.data.labels || []).length - 1;

        if(lastIndex < 0){
            return;
        }


        const index =
            Math.max(
                0,
                Math.min(
                    currentHour / hoursPerBar,
                    lastIndex
                )
            );

        const lowerIndex =
            Math.floor(index);

        const upperIndex =
            Math.min(
                lowerIndex + 1,
                lastIndex
            );

        const lowerPixel =
            xScale.getPixelForValue(lowerIndex);

        const upperPixel =
            xScale.getPixelForValue(upperIndex);

        const x =
            lowerIndex === upperIndex
                ? lowerPixel
                : lowerPixel +
                  (upperPixel - lowerPixel) *
                  (index - lowerIndex);


        const ctx =
            chart.ctx;

        const lineColor =
            "rgb(230, 30, 30)";


        ctx.save();


        /*
        Vertical line marking the current time.
        */
        ctx.strokeStyle =
            lineColor;

        ctx.lineWidth =
            1.5;

        ctx.beginPath();

        ctx.moveTo(x, chartArea.top);

        ctx.lineTo(x, chartArea.bottom);

        ctx.stroke();


        /*
        Small flag label at the top of the line, clamped
        so it stays fully inside the chart even when the
        line itself sits near an edge.
        */
        const label = "Now";

        ctx.font = "bold 10px Arial";

        const textWidth =
            ctx.measureText(label).width;

        const flagPaddingX = 5;

        const flagWidth =
            textWidth + flagPaddingX * 2;

        const flagHeight = 14;

        const flagX =
            Math.max(
                chartArea.left,
                Math.min(
                    x - flagWidth / 2,
                    chartArea.right - flagWidth
                )
            );

        const flagY =
            chartArea.top;


        ctx.fillStyle =
            lineColor;

        ctx.fillRect(
            flagX,
            flagY,
            flagWidth,
            flagHeight
        );

        ctx.fillStyle =
            "#ffffff";

        ctx.textAlign =
            "center";

        ctx.textBaseline =
            "middle";

        ctx.fillText(
            label,
            flagX + flagWidth / 2,
            flagY + flagHeight / 2 + 0.5
        );


        ctx.restore();

    }

};


/*
Draws a small marker + time label at each high/low tide
event on the tide chart. Events are given as decimal
hours-of-day so they can land at their exact time rather
than snapping to the nearest hourly gridline.
*/
const tideMarkersPlugin = {

    id: "tideMarkers",

    afterDatasetsDraw(chart, args, options){

        const events =
            options?.events;

        if(!Array.isArray(events) || !events.length){
            return;
        }


        const xScale =
            chart.scales.x;

        const yScale =
            chart.scales.y;

        const chartArea =
            chart.chartArea;

        if(!xScale || !yScale || !chartArea){
            return;
        }


        const lastIndex =
            (chart.data.labels || []).length - 1;

        if(lastIndex < 0){
            return;
        }


        const isDarkMode =
            document.body.classList.contains(
                "dark-mode"
            );

        const ctx =
            chart.ctx;

        ctx.save();


        events.forEach(event => {

            if(!Number.isFinite(event.value)){
                return;
            }


            const index =
                Math.max(
                    0,
                    Math.min(
                        event.hour,
                        lastIndex
                    )
                );

            const lowerIndex =
                Math.floor(index);

            const upperIndex =
                Math.min(
                    lowerIndex + 1,
                    lastIndex
                );

            const lowerPixel =
                xScale.getPixelForValue(lowerIndex);

            const upperPixel =
                xScale.getPixelForValue(upperIndex);

            const x =
                lowerIndex === upperIndex
                    ? lowerPixel
                    : lowerPixel +
                      (upperPixel - lowerPixel) *
                      (index - lowerIndex);

            const y =
                yScale.getPixelForValue(event.value);

            const isHigh =
                event.type === "H";

            const markerColor =
                isHigh
                    ? "#1479c9"
                    : "#c2762b";


            /*
            Dot at the event's exact time and height.
            */
            ctx.beginPath();

            ctx.fillStyle =
                markerColor;

            ctx.arc(x, y, 4, 0, Math.PI * 2);

            ctx.fill();

            ctx.lineWidth = 1.5;

            ctx.strokeStyle =
                "#ffffff";

            ctx.stroke();


            /*
            Time label - flipped below the dot when there
            isn't enough room above it for the text.
            */
            const label =
                (isHigh ? "H " : "L ") +
                formatClockTime(event.date);

            ctx.font =
                "10px Arial";

            const textWidth =
                ctx.measureText(label).width;

            const clampedX =
                Math.max(
                    chartArea.left + textWidth / 2,
                    Math.min(
                        x,
                        chartArea.right - textWidth / 2
                    )
                );

            const labelAbove =
                (y - chartArea.top) > 18;

            ctx.textAlign =
                "center";

            ctx.textBaseline =
                labelAbove
                    ? "bottom"
                    : "top";

            ctx.fillStyle =
                isDarkMode
                    ? "#e2e8f0"
                    : "#334155";

            ctx.fillText(
                label,
                clampedX,
                labelAbove
                    ? y - 8
                    : y + 8
            );

        });


        ctx.restore();

    }

};


function createWindChart(
    sustainedData,
    gustData,
    windDirections
){

    if(windChart){
        windChart.destroy();
    }


    const options =
        simpleChartOptions();


    /*
    Show the sustained-wind and gust legend.
    */
    options.plugins.legend.display =
        true;


    /*
    Hide Chart.js's own x-axis tick labels - the custom
    plugin below draws the hour-of-day row manually so it
    can sit underneath the wind-direction arrows instead
    of the arrows sitting underneath it.
    */
    options.scales =
        options.scales || {};

    options.scales.x =
        options.scales.x || {};

    options.scales.x.ticks =
        options.scales.x.ticks || {};

    options.scales.x.ticks.display =
        false;


    /*
    Supply directions to the custom plugin.

    Passing null prevents arrows from appearing
    when multiple locations are selected.
    */
    options.plugins.windDirectionArrows = {
        directions:
            Array.isArray(windDirections)
                ? windDirections
                : [],
        hourLabels:
            hourLabels(),
        hourLabelIndices:
            pickEveryThirdHourIndices(
                24,
                1
            )
    };


    /*
    Reserve extra room underneath the graph for both the
    wind-direction arrows and the hour labels below them.
    */
    options.layout = {
        padding: {
            bottom: 36
        }
    };


    const nightShadingHours =
        getNightShadingHours();

    if(nightShadingHours){

        options.plugins.nightShading = {
            ...nightShadingHours,
            hoursPerBar: 1
        };

    }


    if(Number.isFinite(lastCurrentTimeHour)){

        options.plugins.currentTimeLine = {
            currentHour: lastCurrentTimeHour,
            hoursPerBar: 1
        };

    }


    const selectedBoatSize =
        document.getElementById("boatSize")?.value ||
        "medium";


    /*
    Colors a single point or line segment by the wind
    condition (FLAT/CALM/SPORTY/POOR) of its own value,
    falling back to the dataset's base color when there's
    no reading to classify.
    */
    const windConditionColor = (
        rawValue,
        fallbackColor
    ) => {

        const condition =
            getWindCondition(
                rawValue,
                selectedBoatSize
            );

        return condition.status
            ? getConditionColor(condition.status)
            : fallbackColor;

    };


    windChart =
        new Chart(
            document.getElementById(
                "windChart"
            ),
            {

                type: "line",

                plugins: [
                    nightShadingPlugin,
                    windDirectionArrowPlugin,
                    currentTimeLinePlugin
                ],

                data: {

                    labels:
                        hourLabels(),

                    datasets: [

                        {
                            label: "Sustained",
                            data: sustainedData,
                            borderColor: "#64748b",
                            backgroundColor: "#64748b",
                            pointBackgroundColor(context){
                                return windConditionColor(
                                    context?.raw,
                                    "#64748b"
                                );
                            },
                            pointBorderColor(context){
                                return windConditionColor(
                                    context?.raw,
                                    "#64748b"
                                );
                            },
                            segment: {
                                borderColor(ctx){
                                    const value =
                                        ctx?.p1?.parsed?.y ??
                                        ctx?.p0?.parsed?.y;

                                    return windConditionColor(
                                        value,
                                        "#64748b"
                                    );
                                }
                            },
                            tension: 0.3,
                            fill: false,
                            spanGaps: false
                        },

                        {
                            label: "Gusts",
                            data: gustData,
                            borderColor: "#64748b",
                            backgroundColor: "#64748b",
                            pointBackgroundColor(context){
                                return windConditionColor(
                                    context?.raw,
                                    "#64748b"
                                );
                            },
                            pointBorderColor(context){
                                return windConditionColor(
                                    context?.raw,
                                    "#64748b"
                                );
                            },
                            segment: {
                                borderColor(ctx){
                                    const value =
                                        ctx?.p1?.parsed?.y ??
                                        ctx?.p0?.parsed?.y;

                                    return windConditionColor(
                                        value,
                                        "#64748b"
                                    );
                                }
                            },
                            borderDash: [8, 5],
                            tension: 0.3,
                            fill: false,
                            spanGaps: false
                        }

                    ]

                },

                options: options

            }
        );

}


const wavePeriodLabelPlugin = {

    id: "wavePeriodLabels",

    afterDraw(chart, args, options){

        const periods =
            options?.periods;

        if(
            !Array.isArray(periods) ||
            periods.length === 0
        ){
            return;
        }


        const meta =
            chart.getDatasetMeta(0);

        if(
            !meta ||
            !Array.isArray(meta.data)
        ){
            return;
        }


        const ctx =
            chart.ctx;

        const isDarkMode =
            document.body.classList.contains(
                "dark-mode"
            );


        /*
        Both label rows are drawn manually (rather than
        relying on Chart.js's own x-axis tick labels) so
        the wave-period row can sit directly under the
        bars, with the hour-of-day row below it - instead
        of the two overlapping at the bottom of the canvas.
        */

        const axisBottom =
            chart.chartArea.bottom;

        const periodRowY =
            axisBottom + 13;

        const hourRowY =
            axisBottom + 28;


        ctx.save();

        ctx.font =
            "10px Arial";

        ctx.textAlign =
            "center";

        ctx.textBaseline =
            "middle";


        meta.data.forEach(
            (bar, index) => {

                const period =
                    Number(periods[index]);

                const rawWaveHeight =
                    chart.data.datasets[0]
                        .data[index];

                const waveHeight =
                    Number(
                        rawWaveHeight
                    );


                /*
                Do not show a period label when there
                is no corresponding wave-height bar.
                */

                if(
                    !Number.isFinite(period) ||
                    rawWaveHeight === null ||
                    rawWaveHeight === undefined ||
                    !Number.isFinite(waveHeight) ||
                    waveHeight <= 0
                ){
                    return;
                }


                const waveCondition =
                    getWaveCondition(
                        waveHeight,
                        period,
                        options?.boatSize || "medium"
                    );


                ctx.fillStyle =
                    getWaveConditionColor(
                        waveCondition.status
                    );


                ctx.fillText(
                    `${period.toFixed(1).replace(/\\.0$/, "")}s`,
                    bar.x,
                    periodRowY
                );

            }
        );


        /*
        A handful of evenly-spaced hour labels below the
        period row - not one per bar, since that's what
        caused the crowding this replaces.
        */

        const hourLabelsForChart =
            options?.hourLabels;

        const hourLabelIndices =
            options?.hourLabelIndices;

        if(
            Array.isArray(hourLabelsForChart) &&
            Array.isArray(hourLabelIndices)
        ){

            ctx.fillStyle =
                isDarkMode
                    ? "#94a3b8"
                    : "#666666";

            hourLabelIndices.forEach(index => {

                const bar =
                    meta.data[index];

                const label =
                    hourLabelsForChart[index];

                if(!bar || !label){
                    return;
                }

                ctx.fillText(
                    label,
                    bar.x,
                    hourRowY
                );

            });

        }


        ctx.restore();

    }

};


function createWaveChart(
    data,
    wavePeriods
){


    if(waveChart){
        waveChart.destroy();
    }


    /*
    Cache the full, un-binned 24-hour arrays so a later
    window resize can rebuild the chart (binned or not)
    without needing to re-fetch or re-evaluate anything.
    */
    lastWaveHeightsRaw = data;
    lastWavePeriodsRaw = wavePeriods;


    const shouldBin =
        isNarrowWaveChartLayout();

    const binned =
        shouldBin
            ? binHourlyDataForNarrowScreens(
                data,
                wavePeriods
            )
            : null;

    const chartHeights =
        binned
            ? binned.heights
            : data;

    const chartPeriods =
        binned
            ? binned.periods
            : wavePeriods;

    const chartLabels =
        binned
            ? binned.labels
            : hourLabels();


    const options =
        simpleChartOptions();


    /*
    Reserve room below the bars for two manually-drawn
    label rows (wave period in seconds, then hour of
    day) instead of Chart.js's own single row of x-axis
    tick labels, which is hidden below.
    */
    options.layout =
        {
            padding: {
                bottom: 36
            }
        };

    options.scales =
        options.scales || {};

    options.scales.x =
        options.scales.x || {};

    options.scales.x.ticks =
        options.scales.x.ticks || {};

    options.scales.x.ticks.display =
        false;


    options.plugins =
        options.plugins || {};


    const selectedBoatSize =
        document.getElementById("boatSize")?.value ||
        "medium";


    const hoursPerBar =
        binned
            ? 3
            : 1;

    options.plugins.wavePeriodLabels =
        {
            periods:
                chartPeriods,
            boatSize:
                selectedBoatSize,
            hourLabels:
                chartLabels,
            hourLabelIndices:
                pickEveryThirdHourIndices(
                    chartLabels.length,
                    hoursPerBar
                )
        };


    const nightShadingHours =
        getNightShadingHours();

    if(nightShadingHours){

        options.plugins.nightShading = {
            ...nightShadingHours,
            hoursPerBar: hoursPerBar
        };

    }


    if(Number.isFinite(lastCurrentTimeHour)){

        options.plugins.currentTimeLine = {
            currentHour: lastCurrentTimeHour,
            hoursPerBar: hoursPerBar
        };

    }


    options.plugins.tooltip =
        {
            callbacks: {

                label(context){

                    const waveHeight =
                        Number(
                            context.parsed.y
                        );

                    if(!Number.isFinite(waveHeight)){
                        return "Wave height: unavailable";
                    }

                    return (
                        "Wave height: " +
                        waveHeight.toFixed(1) +
                        " ft"
                    );

                },

                afterLabel(context){

                    const period =
                        Number(
                            chartPeriods[
                                context.dataIndex
                            ]
                        );

                    if(!Number.isFinite(period)){
                        return "Wave period: unavailable";
                    }

                    const waveHeight =
                        Number(
                            context.parsed.y
                        );

                    const waveCondition =
                        getWaveCondition(
                            waveHeight,
                            period,
                            selectedBoatSize
                        );

                    return [
                        (
                            "Wave period: " +
                            period
                                .toFixed(1)
                                .replace(/\\.0$/, "") +
                            " sec"
                        ),
                        (
                            "Wave condition: " +
                            (
                                waveCondition.status ||
                                "Unavailable"
                            )
                        )
                    ];

                }

            }
        };


    waveChart =
        new Chart(
            document.getElementById(
                "waveChart"
            ),
            {

                type:
                    "bar",

                plugins: [
                    nightShadingPlugin,
                    wavePeriodLabelPlugin,
                    currentTimeLinePlugin
                ],

                data: {

                    labels:
                        chartLabels,

                    datasets: [
                        {

                            data:
                                chartHeights,

                            backgroundColor(context){

                                const rawWaveHeight =
                                    context.raw;

                                const waveHeight =
                                    Number(
                                        rawWaveHeight
                                    );

                                const rawPeriod =
                                    chartPeriods[
                                        context.dataIndex
                                    ];

                                const period =
                                    Number(
                                        rawPeriod
                                    );


                                if(
                                    rawWaveHeight === null ||
                                    rawWaveHeight === undefined ||
                                    !Number.isFinite(waveHeight)
                                ){
                                    return "#2563eb";
                                }


                                const waveCondition =
                                    getWaveCondition(
                                        waveHeight,
                                        (
                                            rawPeriod !== null &&
                                            rawPeriod !== undefined &&
                                            Number.isFinite(period)
                                        )
                                            ? period
                                            : null,
                                        selectedBoatSize
                                    );


                                return getWaveConditionColor(
                                    waveCondition.status
                                );

                            },

                            borderColor(context){

                                const rawWaveHeight =
                                    context.raw;

                                const waveHeight =
                                    Number(
                                        rawWaveHeight
                                    );

                                const rawPeriod =
                                    chartPeriods[
                                        context.dataIndex
                                    ];

                                const period =
                                    Number(
                                        rawPeriod
                                    );


                                if(
                                    rawWaveHeight === null ||
                                    rawWaveHeight === undefined ||
                                    !Number.isFinite(waveHeight)
                                ){
                                    return "#1d4ed8";
                                }


                                const waveCondition =
                                    getWaveCondition(
                                        waveHeight,
                                        (
                                            rawPeriod !== null &&
                                            rawPeriod !== undefined &&
                                            Number.isFinite(period)
                                        )
                                            ? period
                                            : null,
                                        selectedBoatSize
                                    );


                                return getWaveConditionBorderColor(
                                    waveCondition.status
                                );

                            },

                            borderWidth:
                                1

                        }
                    ]

                },

                options:
                    options

            }
        );


}



function createPrecipChart(data){

    if(precipChart)
        precipChart.destroy();


    const options = {

        ...simpleChartOptions(),

        scales:{

            x:{
                ticks:
                    everyThirdHourTickOptions()
            },

            y:{

                min:0,

                max:100,

                ticks:{
                    stepSize:20,
                    callback:value => value + "%"
                }

            }

        }

    };


    const nightShadingHours =
        getNightShadingHours();

    if(nightShadingHours){

        options.plugins.nightShading = {
            ...nightShadingHours,
            hoursPerBar: 1
        };

    }


    if(Number.isFinite(lastCurrentTimeHour)){

        options.plugins.currentTimeLine = {
            currentHour: lastCurrentTimeHour,
            hoursPerBar: 1
        };

    }


    precipChart =
    new Chart(
        document.getElementById("precipChart"),
        {

        type:"line",

        plugins: [
            nightShadingPlugin,
            currentTimeLinePlugin
        ],

        data:{

            labels:hourLabels(),

            datasets:[{

                data:data,

                fill:true,

                tension:.3

            }]

        },

        options: options

    });

}


/*
Builds the Tides chart from a day's hourly height
predictions plus the day's high/low tide events. hourly
predictions may be null/unavailable, in which case the
chart still renders (empty) and the summary line explains
why.
*/
function createTideChart(hourlyPredictions, highLowEvents){

    if(tideChart){
        tideChart.destroy();
    }


    const heights =
        new Array(24).fill(null);

    if(Array.isArray(hourlyPredictions)){

        hourlyPredictions.forEach(point => {

            const index =
                Math.round(point.hour);

            if(
                index >= 0 &&
                index <= 23 &&
                Number.isFinite(point.value)
            ){
                heights[index] = point.value;
            }

        });

    }


    const events =
        Array.isArray(highLowEvents)
            ? highLowEvents.map(event => ({

                hour:
                    event.date.getHours() +
                    event.date.getMinutes() / 60,

                type:
                    event.type,

                value:
                    event.value,

                date:
                    event.date

            }))
            : [];


    const tideSummaryElement =
        document.getElementById("tideSummary");

    if(tideSummaryElement){

        if(events.length){

            tideSummaryElement.innerHTML =
                events
                    .map(event =>
                        (
                            event.type === "H"
                                ? "H "
                                : "L "
                        ) +
                        escapeHTML(
                            formatClockTime(event.date)
                        )
                    )
                    .join(" &nbsp;|&nbsp; ");

        }
        else if(heights.some(value => value !== null)){

            tideSummaryElement.textContent =
                "No high/low tide events today";

        }
        else{

            tideSummaryElement.textContent =
                "Tide data unavailable";

        }

    }


    const options =
        simpleChartOptions();

    options.scales.y =
        {
            ticks: {
                callback: value =>
                    Number(value).toFixed(1) + " ft"
            }
        };


    const nightShadingHours =
        getNightShadingHours();

    if(nightShadingHours){

        options.plugins.nightShading = {
            ...nightShadingHours,
            hoursPerBar: 1
        };

    }


    if(Number.isFinite(lastCurrentTimeHour)){

        options.plugins.currentTimeLine = {
            currentHour: lastCurrentTimeHour,
            hoursPerBar: 1
        };

    }


    options.plugins.tideMarkers =
        {
            events: events
        };


    tideChart =
        new Chart(
            document.getElementById("tideChart"),
            {

                type: "line",

                plugins: [
                    nightShadingPlugin,
                    tideMarkersPlugin,
                    currentTimeLinePlugin
                ],

                data: {

                    labels: hourLabels(),

                    datasets: [
                        {
                            data: heights,
                            borderColor: "#1479c9",
                            backgroundColor: "rgba(20, 121, 201, 0.15)",
                            fill: true,
                            tension: 0.3,
                            spanGaps: true,
                            pointRadius: 0
                        }
                    ]

                },

                options: options

            }
        );

}


/*
Shows an x-axis tick label only every 3rd hour (12a, 3a,
6a, 9a, ...), matching the spacing used by the main
24-hour timeline above the charts, instead of letting
Chart.js pick its own evenly-spaced subset.
*/
function everyThirdHourTickOptions(){

    return {

        autoSkip:
            false,

        callback(value, index){

            return (
                index % 3 === 0
            )
                ? this.getLabelForValue(value)
                : "";

        }

    };

}


function simpleChartOptions(){


    return {

        responsive:true,

        maintainAspectRatio:false,

        plugins:{

            legend:{
                display:false
            }

        },

        scales:{

            x:{

                ticks:
                    everyThirdHourTickOptions()

            }

        }

    };

}


function hourLabels(){


    return [

    "12a","1a","2a","3a","4a","5a",
    "6a","7a","8a","9a","10a","11a",
    "12p","1p","2p","3p","4p","5p",
    "6p","7p","8p","9p","10p","11p"

    ];

}


/*
Below this width, 24 wave-period labels (one per hour)
don't have enough room to avoid overlapping each other,
so the wave chart is rebuilt with 8 bars instead - each
one averaging 3 hours - to more than double the space
per label. That 3-hour grouping also lines up exactly
with the every-3rd-hour labels (12a, 3a, 6a, ...) used
on the wind and precipitation charts and the main
24-hour timeline.
*/
function isNarrowWaveChartLayout(){

    return window.innerWidth <= 500;

}


function averageIgnoringNulls(values){

    const available =
        values.filter(value =>
            value !== null &&
            value !== undefined &&
            Number.isFinite(Number(value))
        );

    if(!available.length){
        return null;
    }

    const total =
        available.reduce(
            (sum, value) =>
                sum + Number(value),
            0
        );

    return total / available.length;

}


function binHourlyDataForNarrowScreens(
    heights,
    periods
){

    const labels =
        hourLabels();

    const hoursPerBin = 3;

    const binnedHeights = [];
    const binnedPeriods = [];
    const binnedLabels = [];

    for(
        let hour = 0;
        hour < heights.length;
        hour += hoursPerBin
    ){

        const hoursInBin =
            Array.from(
                { length: hoursPerBin },
                (_, offset) => hour + offset
            );

        binnedHeights.push(
            averageIgnoringNulls(
                hoursInBin.map(
                    hourIndex => heights[hourIndex]
                )
            )
        );

        binnedPeriods.push(
            averageIgnoringNulls(
                hoursInBin.map(
                    hourIndex => periods[hourIndex]
                )
            )
        );

        binnedLabels.push(
            labels[hour]
        );

    }

    return {
        heights: binnedHeights,
        periods: binnedPeriods,
        labels: binnedLabels
    };

}


/*
Picks the indices whose bar represents an hour that is a
multiple of 3 (12a, 3a, 6a, ...) - matching the every-3rd-
hour spacing used elsewhere - so those are the only bars
that get an hour-of-day label drawn under them. hoursPerBar
is 1 for the normal 24-bar chart and 3 for the narrow-
screen binned chart (whose bars already start on exactly
those hours, so all of them qualify).
*/
function pickEveryThirdHourIndices(
    length,
    hoursPerBar
){

    const indices = [];

    for(let index = 0; index < length; index++){

        if((index * hoursPerBar) % 3 === 0){
            indices.push(index);
        }

    }

    return indices;

}


function setupWaveChartResizeHandling(){

    window.addEventListener(
        "resize",
        () => {

            if(waveChartResizeTimeout){
                clearTimeout(
                    waveChartResizeTimeout
                );
            }

            waveChartResizeTimeout =
                setTimeout(
                    () => {

                        if(
                            lastWaveHeightsRaw &&
                            lastWavePeriodsRaw
                        ){

                            createWaveChart(
                                lastWaveHeightsRaw,
                                lastWavePeriodsRaw
                            );

                        }

                    },
                    200
                );

        }
    );

}


function evaluateLocation(hours, boatSize){

    const results = [];


    hours.forEach(hour => {

        if(hour === null){

            results.push("PAST");

            return;

        }


        const checkedHour =
            checkHour(
                hour,
                boatSize
            );


        results.push(
            checkedHour.status
        );

    });


    const validResults =
        results.filter(result => {

            return result !== "PAST";

        });


    return {

        result:
            validResults.length > 0
                ? determineDailyResult(validResults)
                : "NO DATA",

        hourlyResults:
            results,

        reason:
            validResults.length > 0
                ? getLocationReason(determineDailyResult(validResults))
                : "No forecast hours are currently available for the selected date."

    };

}



function getLocationReason(result){

    switch(result){
        case "GO":
            return "Conditions are calm for most or all of the available forecast period.";
        case "MAYBE":
            return "Boating may be reasonable, but review the sporty or isolated poor hours before choosing a time.";
        case "LIMITED WINDOW":
            return "Poor conditions are common, but at least one continuous calm window is available.";
        case "DON'T GO":
            return "No meaningful continuous calm window is available.";
        default:
            return "Forecast conditions are unavailable.";
    }

}


function getWaveCondition(
    waveHeight,
    wavePeriod,
    boatSize
){
    const limits = getVesselLimits(boatSize);
    const height = Number(waveHeight);

    if(
        !limits ||
        waveHeight === null ||
        waveHeight === undefined ||
        !Number.isFinite(height)
    ){
        return {
            status: null,
            heightStatus: null,
            periodStatus: null,
            periodRatio: null,
            reason: null
        };
    }

    if(height >= limits.wavePoor){
        return {
            status: "POOR",
            heightStatus: "POOR",
            periodStatus: null,
            periodRatio: null,
            reason: "height-unsafe"
        };
    }

    if(height < limits.flatWave){
        return {
            status: "FLAT",
            heightStatus: "FLAT",
            periodStatus: null,
            periodRatio: null,
            reason: "flat"
        };
    }

    if(height <= limits.waveBypass){
        let bypassStatus;

        if(limits.isCustom){
            bypassStatus =
                height >= limits.waveSporty
                    ? "SPORTY"
                    : "CALM";
        }
        else{
            bypassStatus =
                boatSize === "small"
                    ? "SPORTY"
                    : "CALM";
        }

        return {
            status: bypassStatus,
            heightStatus: bypassStatus,
            periodStatus: null,
            periodRatio: null,
            reason:
                bypassStatus === "SPORTY"
                    ? "small-chop-sporty"
                    : "small-wave-bypass"
        };
    }

    const period = Number(wavePeriod);

    if(
        wavePeriod === null ||
        wavePeriod === undefined ||
        !Number.isFinite(period) ||
        period <= 0
    ){
        const fallbackStatus =
            height >= limits.waveSporty
                ? "SPORTY"
                : "CALM";

        return {
            status: fallbackStatus,
            heightStatus: fallbackStatus,
            periodStatus: null,
            periodRatio: null,
            reason:
                fallbackStatus === "SPORTY"
                    ? "height-sporty"
                    : "height-calm"
        };
    }

    if(period < limits.shortPeriodPoor){
        return {
            status: "POOR",
            heightStatus: null,
            periodStatus: "POOR",
            periodRatio: period / height,
            reason: "short-period-poor"
        };
    }

    const periodRatio = period / height;
    let steepnessStatus;

    if(periodRatio >= limits.periodRatioCalm){
        steepnessStatus = "CALM";
    }
    else if(periodRatio >= limits.periodRatioPoor){
        steepnessStatus = "SPORTY";
    }
    else{
        steepnessStatus = "POOR";
    }

    return {
        status: steepnessStatus,
        heightStatus: null,
        periodStatus: steepnessStatus,
        periodRatio: periodRatio,
        reason:
            steepnessStatus === "POOR"
                ? "steepness-poor"
                : (
                    steepnessStatus === "SPORTY"
                        ? "steepness-sporty"
                        : "steepness-calm"
                )
    };
}


function getWaveConditionColor(status){

    switch(status){

        case "FLAT":
            return "#7fdfe4";

        case "CALM":
            return "#c2f081";

        case "SPORTY":
            return "#f1c17a";

        case "POOR":
            return "#f17c7a";

        default:
            return "#2563eb";

    }

}


function getWaveConditionBorderColor(status){

    switch(status){

        case "FLAT":
            return "#7fdfe4";

        case "CALM":
            return "#c2f081";

        case "SPORTY":
            return "#f1c17a";

        case "POOR":
            return "#f17c7a";

        default:
            return "#1d4ed8";

    }

}


/*
Classifies a single wind reading (sustained or gust, mph)
into the same FLAT/CALM/SPORTY/POOR scale used everywhere
else, using the vessel's own wind thresholds - independent
of waves, precipitation, or alerts, unlike the combined
per-hour result from checkHour().
*/
function getWindCondition(
    windSpeed,
    boatSize
){

    const limits =
        getVesselLimits(boatSize);

    const speed =
        Number(windSpeed);

    if(
        !limits ||
        windSpeed === null ||
        windSpeed === undefined ||
        !Number.isFinite(speed)
    ){
        return { status: null };
    }

    if(speed >= limits.windPoor){
        return { status: "POOR" };
    }

    if(speed >= limits.windSporty){
        return { status: "SPORTY" };
    }

    if(speed <= limits.flatWind){
        return { status: "FLAT" };
    }

    return { status: "CALM" };

}


/*
Generic aliases for the shared status-color palette, used
by both the wave and wind charts (the underlying mapping
isn't actually wave-specific).
*/
function getConditionColor(status){
    return getWaveConditionColor(status);
}

function getConditionBorderColor(status){
    return getWaveConditionBorderColor(status);
}


function checkHour(hour, boatSize){
    const limits = getVesselLimits(boatSize);

    if(!limits){
        console.error("Unknown vessel size:", boatSize);
        return { status: "POOR" };
    }

    const sustainedWind = Number(hour.wind) || 0;
    const gustWind = Number.isFinite(Number(hour.gust))
        ? Number(hour.gust)
        : sustainedWind;
    const wind = Math.max(sustainedWind, gustWind);

    const waves = Number(hour.waves);
    const hasWaveData =
        hour.waves !== null &&
        hour.waves !== undefined &&
        Number.isFinite(waves);

    const wavePeriod = Number(hour.wavePeriod);
    const waveCondition = hasWaveData
        ? getWaveCondition(
            waves,
            (
                hour.wavePeriod !== null &&
                hour.wavePeriod !== undefined &&
                Number.isFinite(wavePeriod)
            ) ? wavePeriod : null,
            boatSize
        )
        : { status: null };

    const precip = Number(hour.precip) || 0;
    const alerts = Array.isArray(hour.alerts) ? hour.alerts : [];

    const noGoAlertNames = [
        "Special Marine Warning",
        "Severe Thunderstorm Warning",
        "Tornado Warning",
        "Small Craft Advisory",
        "Gale Warning",
        "Storm Warning",
        "Hurricane Warning",
        "Tropical Storm Warning",
        "Extreme Wind Warning"
    ];

    const sportyAlertNames = [
        "Severe Thunderstorm Watch",
        "Tornado Watch",
        "Gale Watch",
        "Storm Watch",
        "Hurricane Watch",
        "Tropical Storm Watch",
        "Marine Weather Statement",
        "Dense Fog Advisory",
        "Wind Advisory",
        "Coastal Flood Advisory"
    ];

    const hasNoGoAlert =
        limits.useAlerts &&
        alerts.some(alert => noGoAlertNames.includes(alert.event));

    const hasSportyAlert =
        limits.useAlerts &&
        alerts.some(alert => sportyAlertNames.includes(alert.event));

    const hasOtherAlert =
        limits.useAlerts &&
        alerts.length > 0;

    const thunderstormForecast =
        limits.useThunder &&
        String(hour.shortForecast || "").toLowerCase().includes("thunder");

    const precipIsPoor =
        limits.usePrecip &&
        precip >= limits.precipPoor;

    const precipIsSporty =
        limits.usePrecip &&
        precip >= limits.precipSporty;

    if(
        hasNoGoAlert ||
        thunderstormForecast ||
        wind >= limits.windPoor ||
        (hasWaveData && waveCondition.status === "POOR") ||
        precipIsPoor
    ){
        return { status: "POOR" };
    }

    if(
        hasSportyAlert ||
        hasOtherAlert ||
        wind >= limits.windSporty ||
        (hasWaveData && waveCondition.status === "SPORTY") ||
        precipIsSporty
    ){
        return { status: "SPORTY" };
    }

    if(
        hasWaveData &&
        waveCondition.status === "FLAT" &&
        wind <= limits.flatWind
    ){
        return { status: "FLAT" };
    }

    return { status: "CALM" };
}


function determineDailyResult(results){

    const validResults =
        results.filter(result =>
            result === "FLAT" ||
            result === "CALM" ||
            result === "SPORTY" ||
            result === "POOR"
        );


    const flatHours =
        validResults.filter(
            result => result === "FLAT"
        ).length;


    const calmHours =
        validResults.filter(
            result => result === "CALM"
        ).length;


    const sportyHours =
        validResults.filter(
            result => result === "SPORTY"
        ).length;


    const poorHours =
        validResults.filter(
            result => result === "POOR"
        ).length;


    const favorableHours =
        flatHours + calmHours;


    let longestFavorableWindow = 0;
    let currentFavorableWindow = 0;


    validResults.forEach(result => {

        if(
            result === "FLAT" ||
            result === "CALM"
        ){
            currentFavorableWindow++;

            longestFavorableWindow =
                Math.max(
                    longestFavorableWindow,
                    currentFavorableWindow
                );
        }
        else{
            currentFavorableWindow = 0;
        }

    });


    /*
    No favorable hours remaining means
    there is no recommended boating window.
    */

    if(favorableHours === 0){

        if(poorHours > 0){
            return "DON'T GO";
        }

        /*
        All remaining hours are Sporty.
        */
        return "MAYBE";

    }


    /*
    Favorable conditions dominate and
    there are no Poor hours.
    */

    if(
        poorHours === 0 &&
        favorableHours > sportyHours &&
        sportyHours <= 2
    ){
        return "GO";
    }


    /*
    A mostly usable period with only one
    or two isolated Poor hours.
    */

    if(
        poorHours <= 2 &&
        longestFavorableWindow >= 3
    ){
        return "MAYBE";
    }


    /*
    Poor conditions dominate, but a useful
    favorable window still exists.
    */

    if(longestFavorableWindow >= 3){
        return "LIMITED WINDOW";
    }


    return "DON'T GO";

}


async function renderTideOverlay(
    selectedLocation,
    selectedDate,
    sun
){

    lastSunData = sun;


    /*
    Always render sunrise and sunset, even if tide
    data is unavailable.
    */

    renderDailyEventTimes(
        [],
        sun
    );


    const coords =
        locations[selectedLocation];


    if(!coords){

        createTideChart(null, []);

        return;
    }


    try {

        const station =
            await findNearestTideStation(
                coords.lat,
                coords.lon
            );


        if(!station){

            createTideChart(null, []);

            return;
        }


        const [
            hourlyPredictions,
            highLowEvents
        ] = await Promise.all([

            getHourlyTidePredictions(
                station.id,
                selectedDate
            ),

            getHighLowTidePredictions(
                station.id,
                selectedDate
            )

        ]);


        createTideChart(
            hourlyPredictions,
            highLowEvents
        );


        renderDailyEventTimes(
            highLowEvents,
            sun
        );

    }
    catch(error){

        /*
        Tide data is optional. A tide failure should
        never prevent the weather results from loading.
        */

        console.warn(
            `Tide data unavailable for ${selectedLocation}:`,
            error
        );

        createTideChart(null, []);

        renderDailyEventTimes(
            [],
            sun
        );

    }

}


async function getTidePredictionStations(){

    if(Array.isArray(tideStationCache)){
        return tideStationCache;
    }


    const response =
        await fetch(
            "https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations.json?type=tidepredictions"
        );


    if(!response.ok){

        throw new Error(
            `NOAA tide-station request failed: ${response.status}`
        );

    }


    const data =
        await response.json();

    const stations =
        Array.isArray(data.stations)
            ? data.stations
            : [];


    tideStationCache =
        stations.filter(station =>
            station &&
            station.id &&
            Number.isFinite(Number(station.lat)) &&
            Number.isFinite(Number(station.lng))
        );


    return tideStationCache;

}


async function findNearestTideStation(
    latitude,
    longitude
){

    const stations =
        await getTidePredictionStations();


    /*
    NOAA subordinate stations generally provide only
    high/low predictions. The timeline curve requires
    hourly values, so use the nearest reference station.
    */

    const hourlyCapableStations =
        stations.filter(station =>
            String(station.type || "")
                .trim()
                .toUpperCase() === "R"
        );


    const candidates =
        hourlyCapableStations.length > 0
            ? hourlyCapableStations
            : stations;


    let nearestStation = null;
    let nearestDistance = Infinity;


    candidates.forEach(station => {

        const distance =
            calculateDistanceMiles(
                latitude,
                longitude,
                Number(station.lat),
                Number(station.lng)
            );


        if(distance < nearestDistance){

            nearestDistance = distance;
            nearestStation = station;

        }

    });


    if(nearestStation){

        console.log(
            "Using NOAA tide station:",
            nearestStation.id,
            nearestStation.name,
            `${nearestDistance.toFixed(1)} miles away`
        );

    }


    return nearestStation;

}


function calculateDistanceMiles(
    lat1,
    lon1,
    lat2,
    lon2
){

    const earthRadiusMiles = 3958.8;

    const toRadians =
        degrees => degrees * Math.PI / 180;

    const latitudeDifference =
        toRadians(lat2 - lat1);

    const longitudeDifference =
        toRadians(lon2 - lon1);


    const a =
        Math.sin(latitudeDifference / 2) ** 2 +
        Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(longitudeDifference / 2) ** 2;


    return earthRadiusMiles *
        2 *
        Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );

}


async function getHourlyTidePredictions(
    stationId,
    selectedDate
){

    const compactDate =
        selectedDate.replaceAll("-", "");


    const parameters =
        new URLSearchParams({
            begin_date: compactDate,
            end_date: compactDate,
            station: stationId,
            product: "predictions",
            datum: "MLLW",
            time_zone: "lst_ldt",
            interval: "h",
            units: "english",
            application: "Chesapeake_Bay_Conditions",
            format: "json"
        });


    const response =
        await fetch(
            "https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?" +
            parameters.toString()
        );


    if(!response.ok){

        throw new Error(
            `NOAA tide-prediction request failed: ${response.status}`
        );

    }


    const data =
        await response.json();


    if(data.error){

        throw new Error(
            data.error.message ||
            "NOAA returned a tide-prediction error."
        );

    }


    const predictions =
        Array.isArray(data.predictions)
            ? data.predictions
            : [];


    const formattedPredictions =
        predictions
            .map(item => {

                const timeMatch =
                    String(item.t || "")
                        .match(/\s(\d{2}):(\d{2})$/);

                const value =
                    Number(item.v);


                if(
                    !timeMatch ||
                    !Number.isFinite(value)
                ){
                    return null;
                }


                return {
                    hour:
                        Number(timeMatch[1]) +
                        Number(timeMatch[2]) / 60,
                    value
                };

            })
            .filter(Boolean)
            .sort((a, b) => a.hour - b.hour);


    if(formattedPredictions.length < 2){

        throw new Error(
            `No hourly tide predictions were returned for station ${stationId}.`
        );

    }


    return formattedPredictions;

}


async function getHighLowTidePredictions(
    stationId,
    selectedDate
){

    const compactDate =
        selectedDate.replaceAll("-", "");


    const parameters =
        new URLSearchParams({
            begin_date: compactDate,
            end_date: compactDate,
            station: stationId,
            product: "predictions",
            datum: "MLLW",
            time_zone: "lst_ldt",
            interval: "hilo",
            units: "english",
            application: "Chesapeake_Bay_Conditions",
            format: "json"
        });


    const response =
        await fetch(
            "https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?" +
            parameters.toString()
        );


    if(!response.ok){

        throw new Error(
            `NOAA high/low tide request failed: ${response.status}`
        );

    }


    const data =
        await response.json();


    if(data.error){

        throw new Error(
            data.error.message ||
            "NOAA returned a high/low tide error."
        );

    }


    return (
        Array.isArray(data.predictions)
            ? data.predictions
            : []
    )
        .map(item => {

            const match =
                String(item.t || "")
                    .match(
                        /^(\d{4})-(\d{2})-(\d{2})\s(\d{2}):(\d{2})$/
                    );


            const type =
                String(item.type || "")
                    .toUpperCase();


            if(
                !match ||
                (
                    type !== "H" &&
                    type !== "L"
                )
            ){
                return null;
            }


            const date =
                new Date(
                    Number(match[1]),
                    Number(match[2]) - 1,
                    Number(match[3]),
                    Number(match[4]),
                    Number(match[5])
                );


            return {
                date,
                type,
                value:
                    Number(item.v)
            };

        })
        .filter(event =>
            event &&
            !Number.isNaN(
                event.date.getTime()
            )
        )
        .sort(
            (a, b) =>
                a.date.getTime() -
                b.date.getTime()
        );

}


function renderDailyEventTimes(
    tideEvents,
    sun
){

    const sunriseElement =
        document.getElementById(
            "sunriseMetric"
        );

    const sunsetElement =
        document.getElementById(
            "sunsetMetric"
        );

    const highTideElement =
        document.getElementById(
            "highTideMetric"
        );

    const lowTideElement =
        document.getElementById(
            "lowTideMetric"
        );


    if(
        !sunriseElement ||
        !sunsetElement ||
        !highTideElement ||
        !lowTideElement
    ){
        return;
    }


    const formatEventTime = date =>
        date.toLocaleTimeString(
            [],
            {
                hour: "numeric",
                minute: "2-digit"
            }
        );


    sunriseElement.textContent =
        (
            sun?.sunriseDate instanceof Date &&
            !Number.isNaN(
                sun.sunriseDate.getTime()
            )
        )
            ? formatEventTime(sun.sunriseDate)
            : "--";


    sunsetElement.textContent =
        (
            sun?.sunsetDate instanceof Date &&
            !Number.isNaN(
                sun.sunsetDate.getTime()
            )
        )
            ? formatEventTime(sun.sunsetDate)
            : "--";


    const highTideTimes = [];
    const lowTideTimes = [];

    if(Array.isArray(tideEvents)){

        tideEvents.forEach(event => {

            if(
                !(event.date instanceof Date) ||
                Number.isNaN(
                    event.date.getTime()
                )
            ){
                return;
            }


            const isHigh =
                String(event.type)
                    .toUpperCase() === "H";


            (
                isHigh
                    ? highTideTimes
                    : lowTideTimes
            ).push(
                formatEventTime(event.date)
            );

        });

    }


    highTideElement.innerHTML =
        highTideTimes.length
            ? highTideTimes
                .map(time => escapeHTML(time))
                .join("<br>")
            : "--";


    lowTideElement.innerHTML =
        lowTideTimes.length
            ? lowTideTimes
                .map(time => escapeHTML(time))
                .join("<br>")
            : "--";

}



function addDaysToDateString(dateString, daysToAdd){
    const date = new Date(`${dateString}T12:00:00Z`);
    date.setUTCDate(date.getUTCDate() + daysToAdd);
    return [
        date.getUTCFullYear(),
        String(date.getUTCMonth() + 1).padStart(2, "0"),
        String(date.getUTCDate()).padStart(2, "0")
    ].join("-");
}

function formatNextDayLabel(dateString){
    const date = new Date(`${dateString}T12:00:00Z`);
    return new Intl.DateTimeFormat(
        "en-US",
        {
            weekday: "short",
            month: "short",
            day: "numeric",
            timeZone: "UTC"
        }
    ).format(date);
}

function miniTimelineClass(status){
    switch(status){
        case "FLAT": return "timeline-flat";
        case "CALM": return "timeline-go";
        case "SPORTY": return "timeline-sporty";
        case "POOR": return "timeline-no-go";
        default: return "";
    }
}

function setupNextSixDaysClickHandlers(){
    const grid = document.getElementById("nextSixDaysGrid");
    if(!grid || grid.dataset.clickReady === "true") return;

    grid.dataset.clickReady = "true";

    grid.addEventListener("click", event => {
        const card = event.target.closest(".next-day-clickable");
        if(!card) return;

        const dateInput = document.getElementById("date");
        if(!dateInput) return;

        dateInput.value = card.dataset.nextDate;
        checkConditions();
        document.getElementById("results")?.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });

    grid.addEventListener("keydown", event => {
        if(event.key !== "Enter" && event.key !== " ") return;
        const card = event.target.closest(".next-day-clickable");
        if(!card) return;
        event.preventDefault();
        const dateInput = document.getElementById("date");
        if(!dateInput) return;
        dateInput.value = card.dataset.nextDate;
        checkConditions();
    });
}

async function renderNextSixDays(
    selectedLocation,
    selectedDate,
    boatSize,
    currentAlerts = []
){
    const grid = document.getElementById("nextSixDaysGrid");
    if(!grid) return;

    setupNextSixDaysClickHandlers();

    const requestId = ++nextSixDaysRequestId;
    const dates = Array.from(
        { length: 6 },
        (_, index) => addDaysToDateString(selectedDate, index + 1)
    );

    grid.innerHTML = dates.map(date => `
        <div class="next-day-card">
            <div class="next-day-label">${escapeHTML(formatNextDayLabel(date))}</div>
            <div class="next-day-unavailable" aria-label="Loading forecast"></div>
        </div>
    `).join("");

    const dayResults = await Promise.all(
        dates.map(async date => {
            try {
                const forecast =
                    await getHourlyWeather(selectedLocation, date);

                applyAlertsToForecast(forecast, currentAlerts);

                return {
                    date,
                    timeline: evaluateLocation(forecast, boatSize).hourlyResults
                };
            }
            catch(error){
                console.warn(`Next-six-days forecast unavailable for ${date}:`, error);
                return { date, timeline: null };
            }
        })
    );

    if(requestId !== nextSixDaysRequestId) return;

    grid.innerHTML = dayResults.map(day => {
        const label = escapeHTML(formatNextDayLabel(day.date));

        if(!Array.isArray(day.timeline)){
            return `
                <div class="next-day-card">
                    <div class="next-day-label">${label}</div>
                    <div class="next-day-unavailable" aria-label="Forecast unavailable"></div>
                </div>
            `;
        }

        const segments = day.timeline.map(status =>
            `<span class="next-day-hour ${miniTimelineClass(status)}"></span>`
        ).join("");

        return `
            <div class="next-day-card next-day-clickable" data-next-date="${day.date}" tabindex="0" role="button" aria-label="Load forecast for ${label}">
                <div class="next-day-label">${label}</div>
                <div class="next-day-timeline" aria-label="24-hour boating conditions for ${label}">
                    ${segments}
                </div>
            </div>
        `;
    }).join("");
}


function createTimeline(results, sun, currentTimePercent){

    const bar =
        document.getElementById("timelineBar");


    bar.innerHTML = "";


    results.forEach(hour => {

        const block =
            document.createElement("div");


        block.classList.add(
            "timeline-hour"
        );


        if(hour === "FLAT"){

    block.classList.add(
        "timeline-flat"
    );

}
else if(hour === "CALM"){

    block.classList.add(
        "timeline-go"
    );

}
else if(hour === "SPORTY"){

    block.classList.add(
        "timeline-sporty"
    );

}
else if(hour === "POOR"){

    block.classList.add(
        "timeline-no-go"
    );

}
else{

    block.classList.add(
        "timeline-past"
    );

}


        bar.appendChild(block);

    });


    document
        .getElementById("sunriseMarker")
        .style.left =
        sun.sunrisePercent + "%";


    document
        .getElementById("sunsetMarker")
        .style.left =
        sun.sunsetPercent + "%";


    const currentTimeMarker =
        document.getElementById(
            "currentTimeMarker"
        );

    if(currentTimeMarker){

        if(Number.isFinite(currentTimePercent)){

            currentTimeMarker.classList.remove(
                "hidden"
            );

            currentTimeMarker.style.left =
                currentTimePercent + "%";

        }
        else{

            currentTimeMarker.classList.add(
                "hidden"
            );

        }

    }

}


function getBestWindowDetails(results){

    let bestStart = null;
    let bestEnd = null;
    let currentStart = null;


    results.forEach((value, index) => {

        const isFavorable =
            value === "FLAT" ||
            value === "CALM";


        if(
            isFavorable &&
            currentStart === null
        ){
            currentStart = index;
        }


        const closesWindow =
            !isFavorable ||
            index === results.length - 1;


        if(
            closesWindow &&
            currentStart !== null
        ){

            const end =
                isFavorable &&
                index === results.length - 1
                    ? index + 1
                    : index;


            if(
                bestStart === null ||
                end - currentStart >
                bestEnd - bestStart
            ){

                bestStart =
                    currentStart;

                bestEnd =
                    end;

            }


            currentStart = null;

        }

    });


    if(
        bestStart === null ||
        bestEnd === null
    ){
        return null;
    }


    return {

        timeRange:
            formatHour(bestStart) +
            " - " +
            (bestEnd === 24
                ? "11:59PM"
                : formatHour(bestEnd)),

        length:
            bestEnd - bestStart

    };

}


function parseISODuration(duration){

    const match =
        duration.match(
            /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?)?$/
        );


    if(!match){
        return 60 * 60 * 1000;
    }


    const days =
        Number(match[1] || 0);

    const hours =
        Number(match[2] || 0);

    const minutes =
        Number(match[3] || 0);


    return (
        (
            days * 24 * 60 +
            hours * 60 +
            minutes
        )
        *
        60 * 1000
    );

}



function parseNOAAValidTime(validTime){

    const [
        startText,
        durationText
    ] = validTime.split("/");


    const start =
        new Date(startText);

    const duration =
        parseISODuration(durationText);


    return {
        start,
        end:
            new Date(
                start.getTime() + duration
            )
    };

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



function getWaveHeightForHour(
    waveValues,
    hourStart,
    hourEnd
){

    const matchingValues = [];


    waveValues.forEach(item => {

        if(
            item.value === null ||
            item.value === undefined
        ){
            return;
        }


        const interval =
            parseNOAAValidTime(
                item.validTime
            );


        const overlaps =
            interval.start < hourEnd &&
            interval.end > hourStart;


        if(overlaps){

            matchingValues.push(
                metersToFeet(item.value)
            );

        }

    });


    if(matchingValues.length === 0){
        return null;
    }


    /*
    Use the highest overlapping value.

    This is safer when NOAA supplies a wave
    period covering multiple hours or when
    intervals overlap at a transition.
    */

    return Math.max(
        ...matchingValues
    );

}

function getWavePeriodForHour(
    periodValues,
    hourStart,
    hourEnd
){

    const matchingValues = [];


    periodValues.forEach(item => {

        if(
            item.value === null ||
            item.value === undefined
        ){
            return;
        }


        const interval =
            parseNOAAValidTime(
                item.validTime
            );


        const overlaps =
            interval.start < hourEnd &&
            interval.end > hourStart;


        if(overlaps){

            matchingValues.push(
                Number(item.value)
            );

        }

    });


    if(matchingValues.length === 0){
        return null;
    }


    /*
    Use the shortest overlapping period.

    A shorter period is the steeper/rougher
    case, so this matches the same
    worst-case convention already used
    elsewhere when combining wave data.
    */

    return Math.min(
        ...matchingValues
    );

}

function kilometersPerHourToMph(kph){

    if(
        kph === null ||
        kph === undefined ||
        Number.isNaN(Number(kph))
    ){
        return null;
    }

    return Number(kph) * 0.621371;
}


function getWindGustForHour(
    gustValues,
    hourStart,
    hourEnd
){

    const matchingValues = [];

    gustValues.forEach(item => {

        if(
            item.value === null ||
            item.value === undefined
        ){
            return;
        }

        const interval =
            parseNOAAValidTime(
                item.validTime
            );

        const overlaps =
            interval.start < hourEnd &&
            interval.end > hourStart;

        if(overlaps){

            matchingValues.push(
                kilometersPerHourToMph(
                    item.value
                )
            );

        }

    });


    if(matchingValues.length === 0){
        return null;
    }


    /*
    Use the strongest gust that overlaps
    the selected forecast hour.
    */
    return Math.max(
        ...matchingValues
    );

}

async function getNOAAHourlyWeather(
    location,
    selectedDate
){

    try {

        const coords =
            locations[location];


        if(!coords){

            throw new Error(
                `Coordinates are missing for ${location}`
            );

        }


        /*
        Find the NOAA forecast grid for
        the selected latitude and longitude.
        */

        const pointResponse =
            await fetch(
                `https://api.weather.gov/points/${coords.lat},${coords.lon}`
            );


        if(!pointResponse.ok){

            throw new Error(
                `NOAA location lookup failed for ${location}: ` +
                pointResponse.status
            );

        }


        const pointData =
            await pointResponse.json();


        const hourlyURL =
            pointData.properties?.forecastHourly;

        const gridDataURL =
            pointData.properties?.forecastGridData;


        /*
        Offshore locations may not provide the
        standard hourly forecast endpoint.
        */

        if(!hourlyURL){

            throw new Error(
                `NOAA hourly forecast is unavailable for ${location}`
            );

        }


        const hourlyResponse =
            await fetch(hourlyURL);


        if(!hourlyResponse.ok){

            throw new Error(
                `NOAA hourly forecast failed for ${location}: ` +
                hourlyResponse.status
            );

        }


        /*
        Declare hourlyData exactly once.
        */

        const hourlyData =
            await hourlyResponse.json();


        let waveValues = [];
        let periodValues = [];
        let gustValues = [];
        let gridCentroid = null;


        /*
        Grid data supplies waves, wave period,
        and gusts.

        Failure here should not prevent the
        normal hourly forecast from loading.
        */

        if(gridDataURL){

            try {

                const gridResponse =
                    await fetch(gridDataURL);


                if(!gridResponse.ok){

                    throw new Error(
                        `NOAA grid forecast failed for ${location}: ` +
                        gridResponse.status
                    );

                }


                const gridData =
                    await gridResponse.json();


                waveValues =
                    gridData
                        .properties
                        ?.waveHeight
                        ?.values || [];


                periodValues =
                    gridData
                        .properties
                        ?.wavePeriod
                        ?.values || [];


                gustValues =
                    gridData
                        .properties
                        ?.windGust
                        ?.values || [];


                gridCentroid =
                    getPolygonCentroid(
                        gridData.geometry
                    );

            }
            catch(error){

                console.warn(
                    `Wave, wave period, or gust data unavailable for ${location}:`,
                    error
                );

                waveValues = [];
                periodValues = [];
                gustValues = [];

            }

        }


        /*
        Surface which NOAA grid cell actually
        answered this request, the same way the
        Open-Meteo path reports its sea-grid cell,
        so the Forecast Source panel stays accurate.
        */

        if(gridCentroid){

            updateForecastSourceVerification(
                location,
                {
                    latitude: gridCentroid.lat,
                    longitude: gridCentroid.lon
                }
            );

        }


        const hourlyForecast =
            new Array(24).fill(null);


        const periods =
            hourlyData
                .properties
                ?.periods;


        if(!Array.isArray(periods)){

            throw new Error(
                `NOAA returned no hourly periods for ${location}`
            );

        }


        periods.forEach(period => {

            const periodDate =
                period.startTime?.slice(0, 10);


            if(periodDate !== selectedDate){

                return;

            }


            const hour =
                Number(
                    period.startTime.slice(
                        11,
                        13
                    )
                );


            if(
                !Number.isInteger(hour) ||
                hour < 0 ||
                hour > 23
            ){

                return;

            }


            const hourStart =
                new Date(
                    period.startTime
                );


            const hourEnd =
                period.endTime
                    ? new Date(period.endTime)
                    : new Date(
                        hourStart.getTime() +
                        60 * 60 * 1000
                    );


            const waveHeight =
                getWaveHeightForHour(
                    waveValues,
                    hourStart,
                    hourEnd
                );


            const wavePeriod =
                getWavePeriodForHour(
                    periodValues,
                    hourStart,
                    hourEnd
                );


            const sustainedWind =
                parseInt(
                    period.windSpeed,
                    10
                ) || 0;


            const forecastGust =
                getWindGustForHour(
                    gustValues,
                    hourStart,
                    hourEnd
                );


            hourlyForecast[hour] = {

                wind:
                    sustainedWind,

                gust:
                    forecastGust !== null
                        ? Math.round(forecastGust)
                        : sustainedWind,

                waves:
                    waveHeight,

                wavePeriod:
                    wavePeriod,

                precip:
                    period
                        .probabilityOfPrecipitation
                        ?.value ?? 0,

                windDirection:
                    period.windDirection || "",

                temperature:
                    period.temperature ?? null,

                shortForecast:
                    period.shortForecast || "",

                startTime:
                    period.startTime,

                endTime:
                    period.endTime,

                waveSource:
                    waveHeight !== null
                        ? "NOAA"
                        : null,

                weatherSource:
                    "NOAA",

                alerts: []

            };

        });


        return hourlyForecast;

    }
    catch(error){

        console.error(
            `Forecast error for ${location}:`,
            error
        );

        return null;

    }

}


function getPolygonCentroid(geometry){

    /*
    NOAA grid geometry is a Polygon (or
    sometimes a MultiPolygon). This takes a
    plain average of the outer ring's vertices,
    which is precise enough for a ~2.5km grid
    cell shown for reference in the Forecast
    Source panel.
    */

    if(!geometry){
        return null;
    }

    let ring = null;

    if(
        geometry.type === "Polygon" &&
        Array.isArray(geometry.coordinates?.[0])
    ){
        ring = geometry.coordinates[0];
    }
    else if(
        geometry.type === "MultiPolygon" &&
        Array.isArray(geometry.coordinates?.[0]?.[0])
    ){
        ring = geometry.coordinates[0][0];
    }

    if(!Array.isArray(ring) || !ring.length){
        return null;
    }

    let sumLat = 0;
    let sumLon = 0;
    let count = 0;

    ring.forEach(point => {
        const lon = Number(point?.[0]);
        const lat = Number(point?.[1]);

        if(Number.isFinite(lat) && Number.isFinite(lon)){
            sumLat += lat;
            sumLon += lon;
            count++;
        }
    });

    if(!count){
        return null;
    }

    return {
        lat: sumLat / count,
        lon: sumLon / count
    };

}


function degreesToCompass(degrees){

    if(
        degrees === null ||
        degrees === undefined ||
        !Number.isFinite(Number(degrees))
    ){
        return "";
    }

    const directions = [
        "N", "NNE", "NE", "ENE",
        "E", "ESE", "SE", "SSE",
        "S", "SSW", "SW", "WSW",
        "W", "WNW", "NW", "NNW"
    ];

    const normalized =
        ((Number(degrees) % 360) + 360) % 360;

    return directions[
        Math.round(normalized / 22.5) % 16
    ];

}


function openMeteoWeatherSummary(code){

    const value =
        Number(code);

    if(value === 0){
        return "Clear";
    }

    if(value === 1){
        return "Mainly clear";
    }

    if(value === 2){
        return "Partly cloudy";
    }

    if(value === 3){
        return "Cloudy";
    }

    if([45, 48].includes(value)){
        return "Fog";
    }

    if([51, 53, 55, 56, 57].includes(value)){
        return "Drizzle";
    }

    if([61, 63, 65, 66, 67].includes(value)){
        return "Rain";
    }

    if([71, 73, 75, 77].includes(value)){
        return "Snow";
    }

    if([80, 81, 82].includes(value)){
        return "Rain showers";
    }

    if([85, 86].includes(value)){
        return "Snow showers";
    }

    if([95, 96, 99].includes(value)){
        return "Thunderstorms";
    }

    return "Marine forecast";
}


function getTimeZoneOffsetMilliseconds(
    date,
    timeZone
){

    const formatter =
        new Intl.DateTimeFormat(
            "en-US",
            {
                timeZone: timeZone,
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hourCycle: "h23"
            }
        );

    const parts =
        Object.fromEntries(
            formatter
                .formatToParts(date)
                .filter(part =>
                    part.type !== "literal"
                )
                .map(part => [
                    part.type,
                    part.value
                ])
        );

    const asUTC =
        Date.UTC(
            Number(parts.year),
            Number(parts.month) - 1,
            Number(parts.day),
            Number(parts.hour),
            Number(parts.minute),
            Number(parts.second)
        );

    return asUTC - date.getTime();

}


function easternHourToDate(
    selectedDate,
    hour
){

    const [
        year,
        month,
        day
    ] = selectedDate
        .split("-")
        .map(Number);

    const wallClockUTC =
        Date.UTC(
            year,
            month - 1,
            day,
            hour,
            0,
            0
        );

    let candidate =
        new Date(wallClockUTC);

    let offset =
        getTimeZoneOffsetMilliseconds(
            candidate,
            "America/New_York"
        );

    candidate =
        new Date(
            wallClockUTC - offset
        );

    offset =
        getTimeZoneOffsetMilliseconds(
            candidate,
            "America/New_York"
        );

    return new Date(
        wallClockUTC - offset
    );

}



async function getOpenMeteoHourlyWeather(
    location,
    selectedDate
){

    const coords =
        locations[location];

    if(!coords){

        throw new Error(
            `Coordinates are missing for ${location}`
        );

    }

    const weatherParameters =
        new URLSearchParams({
            latitude:
                String(coords.lat),

            longitude:
                String(coords.lon),

            hourly:
                [
                    "wind_speed_10m",
                    "wind_gusts_10m",
                    "wind_direction_10m",
                    "precipitation_probability",
                    "temperature_2m",
                    "weather_code"
                ].join(","),

            wind_speed_unit:
                "mph",

            temperature_unit:
                "fahrenheit",

            // Use offshore/open-water cells instead of the nearest land grid cell.
            // This keeps wind, rain, and temperature tied to the selected water location.
            cell_selection:
                "sea",

            timezone:
                "America/New_York",

            start_date:
                selectedDate,

            end_date:
                selectedDate
        });


    const marineParameters =
        new URLSearchParams({
            latitude:
                String(coords.lat),

            longitude:
                String(coords.lon),

            hourly:
                [
                    "wave_height",
                    "wave_period"
                ].join(","),

            // Use offshore/open-water cells instead of the nearest land grid cell.
            // This provides a more appropriate marine forecast for reefs and offshore locations.
            cell_selection:
                "sea",

            timezone:
                "America/New_York",

            start_date:
                selectedDate,

            end_date:
                selectedDate
        });


    const [
        weatherResponse,
        marineResponse
    ] = await Promise.all([

        fetchWithRetry(
            "https://api.open-meteo.com/v1/forecast?" +
            weatherParameters.toString()
        ),

        fetch(
            "https://marine-api.open-meteo.com/v1/marine?" +
            marineParameters.toString()
        )

    ]);


    const weatherData =
        await weatherResponse.json();

    updateForecastSourceVerification(
        location,
        weatherData
    );


    let marineData = null;

    if(marineResponse.ok){

        marineData =
            await marineResponse.json();

    }
    else {

        console.warn(
            `Open-Meteo wave data unavailable for ${location}: ` +
            marineResponse.status
        );

    }


    const weatherTimes =
        weatherData.hourly?.time || [];

    const waveTimes =
        marineData?.hourly?.time || [];

    const waveLookup =
        new Map();

    const wavePeriodLookup =
        new Map();


    waveTimes.forEach((time, index) => {

        const meters =
            Number(
                marineData.hourly
                    ?.wave_height
                    ?.[index]
            );

        const periodSeconds =
            Number(
                marineData.hourly
                    ?.wave_period
                    ?.[index]
            );

        waveLookup.set(
            time,
            Number.isFinite(meters)
                ? metersToFeet(meters)
                : null
        );

        wavePeriodLookup.set(
            time,
            Number.isFinite(periodSeconds)
                ? periodSeconds
                : null
        );

    });


    const hourlyForecast =
        new Array(24).fill(null);


    weatherTimes.forEach((time, index) => {

        if(
            String(time).slice(0, 10) !==
            selectedDate
        ){
            return;
        }


        const hour =
            Number(
                String(time).slice(11, 13)
            );


        if(
            !Number.isInteger(hour) ||
            hour < 0 ||
            hour > 23
        ){
            return;
        }


        const startTime =
            `${time}:00`;

        const endHour =
            String(
                (hour + 1) % 24
            ).padStart(2, "0");

        const endDate =
            hour === 23
                ? new Date(
                    selectedDate + "T00:00:00"
                )
                : null;

        if(endDate){
            endDate.setDate(
                endDate.getDate() + 1
            );
        }

        const endTime =
            hour === 23
                ? (
                    [
                        endDate.getFullYear(),
                        String(
                            endDate.getMonth() + 1
                        ).padStart(2, "0"),
                        String(
                            endDate.getDate()
                        ).padStart(2, "0")
                    ].join("-") +
                    "T00:00:00"
                )
                : (
                    selectedDate +
                    "T" +
                    endHour +
                    ":00:00"
                );


        const sustainedWind =
            Number(
                weatherData.hourly
                    ?.wind_speed_10m
                    ?.[index]
            );

        const gust =
            Number(
                weatherData.hourly
                    ?.wind_gusts_10m
                    ?.[index]
            );

        const windDirection =
            weatherData.hourly
                ?.wind_direction_10m
                ?.[index];

        const precip =
            Number(
                weatherData.hourly
                    ?.precipitation_probability
                    ?.[index]
            );

        const temperature =
            Number(
                weatherData.hourly
                    ?.temperature_2m
                    ?.[index]
            );

        const weatherCode =
            weatherData.hourly
                ?.weather_code
                ?.[index];


        hourlyForecast[hour] = {

            wind:
                Number.isFinite(sustainedWind)
                    ? Math.round(sustainedWind)
                    : 0,

            gust:
                Number.isFinite(gust)
                    ? Math.round(gust)
                    : (
                        Number.isFinite(sustainedWind)
                            ? Math.round(sustainedWind)
                            : 0
                    ),

            waves:
                waveLookup.has(time)
                    ? waveLookup.get(time)
                    : null,

            wavePeriod:
                wavePeriodLookup.has(time)
                    ? wavePeriodLookup.get(time)
                    : null,

            precip:
                Number.isFinite(precip)
                    ? Math.round(precip)
                    : 0,

            windDirection:
                degreesToCompass(
                    windDirection
                ),

            temperature:
                Number.isFinite(temperature)
                    ? Math.round(temperature)
                    : null,

            shortForecast:
                openMeteoWeatherSummary(
                    weatherCode
                ),

            startTime:
                startTime,

            endTime:
                endTime,

            alerts: []

        };

    });


    if(
        !hourlyForecast.some(Boolean)
    ){

        throw new Error(
            `Open-Meteo returned no hourly periods for ${location}`
        );

    }


    return hourlyForecast;

}


async function getHourlyWeather(
    location,
    selectedDate
){

    try {

        /*
        NOAA/NWS is the primary source for every
        field: wind, gusts, precipitation, wave
        height, and wave period, all pulled straight
        from the api.weather.gov grid for this
        location's exact coordinates. It's free with
        no commercial-use restriction and no
        meaningful rate limit for a cached app.
        */
        const noaaForecast =
            await getNOAAHourlyWeather(
                location,
                selectedDate
            );

        const noaaHasData =
            Array.isArray(noaaForecast) &&
            noaaForecast.some(Boolean);


        if(!noaaHasData){

            /*
            NOAA had nothing for this point at all
            (rare — e.g. a point outside every WFO's
            grid coverage). Fall back to Open-Meteo
            entirely so the app still returns a
            forecast.
            */

            console.warn(
                `NOAA forecast unavailable for ${location}; ` +
                "falling back to Open-Meteo."
            );

            const fallbackForecast =
                await getOpenMeteoHourlyWeather(
                    location,
                    selectedDate
                );

            fallbackForecast.forEach(hourData => {

                if(!hourData){
                    return;
                }

                hourData.weatherSource =
                    "Open-Meteo";

                hourData.waveSource =
                    hourData.waves !== null &&
                    hourData.waves !== undefined
                        ? "Open-Meteo Marine"
                        : null;

            });

            return fallbackForecast;

        }


        /*
        NOAA answered, but its hourly forecast only
        extends about 7 days out from generation
        time. Near that edge, part of a day can be
        entirely missing (whole hours, not just wave
        data) even though earlier/later days are
        fully covered. Any hour missing outright, or
        missing wave height/period on an otherwise
        populated hour, gets filled in from
        Open-Meteo instead of left blank.
        */

        const needsGapFill =
            noaaForecast.some(hourData =>
                !hourData ||
                (
                    hourData.waves === null ||
                    hourData.waves === undefined ||
                    hourData.wavePeriod === null ||
                    hourData.wavePeriod === undefined
                )
            );

        let openMeteoForecast = null;

        if(needsGapFill){

            try {

                openMeteoForecast =
                    await getOpenMeteoHourlyWeather(
                        location,
                        selectedDate
                    );

            }
            catch(fillError){

                console.warn(
                    `Open-Meteo gap-fill unavailable for ${location}:`,
                    fillError
                );

            }

        }


        let noaaWaveHours = 0;
        let fillWaveHours = 0;
        let fillHourCount = 0;

        noaaForecast.forEach(
            (hourData, hourIndex) => {

                const fillHour =
                    openMeteoForecast?.[hourIndex] || null;


                if(!hourData){

                    /*
                    NOAA had nothing at all for this
                    hour (beyond its forecast horizon).
                    Use Open-Meteo's full hour if
                    available rather than leaving a
                    gap in the day.
                    */

                    if(fillHour){

                        fillHour.weatherSource =
                            "Open-Meteo";

                        fillHour.waveSource =
                            fillHour.waves !== null &&
                            fillHour.waves !== undefined
                                ? "Open-Meteo Marine"
                                : null;

                        noaaForecast[hourIndex] =
                            fillHour;

                        fillHourCount++;

                    }

                    return;

                }

                hourData.weatherSource =
                    "NOAA";

                const hasWave =
                    hourData.waves !== null &&
                    hourData.waves !== undefined &&
                    Number.isFinite(
                        Number(hourData.waves)
                    );

                if(hasWave){

                    hourData.waveSource =
                        "NOAA";

                    noaaWaveHours++;

                }
                else if(
                    fillHour &&
                    fillHour.waves !== null &&
                    fillHour.waves !== undefined
                ){

                    hourData.waves =
                        fillHour.waves;

                    hourData.waveSource =
                        "Open-Meteo Marine";

                    fillWaveHours++;

                }
                else {

                    hourData.waveSource = null;

                }

                if(
                    (
                        hourData.wavePeriod === null ||
                        hourData.wavePeriod === undefined
                    ) &&
                    fillHour &&
                    fillHour.wavePeriod !== null &&
                    fillHour.wavePeriod !== undefined
                ){

                    hourData.wavePeriod =
                        fillHour.wavePeriod;

                }

            }
        );


        console.info(
            `${location}: NOAA/NWS weather; ` +
            `waves from NOAA for ${noaaWaveHours} hour(s)` +
            (
                fillWaveHours > 0
                    ? `, Open-Meteo Marine filling ${fillWaveHours} wave gap hour(s)`
                    : ""
            ) +
            (
                fillHourCount > 0
                    ? `, Open-Meteo filling ${fillHourCount} missing hour(s) beyond NOAA's forecast horizon.`
                    : "."
            )
        );


        return noaaForecast;

    }
    catch(error){

        console.error(
            `Forecast error for ${location}:`,
            error
        );

        return null;

    }

}


async function getActiveAlerts(location){

    try {

        const coords = locations[location];

        const response = await fetch(
            `https://api.weather.gov/alerts/active?point=${coords.lat},${coords.lon}`,
            {
                headers: {
                    "Accept": "application/geo+json"
                }
            }
        );


        if(!response.ok){

            throw new Error(
                `NWS alert request failed: ${response.status}`
            );

        }


        const data = await response.json();


        return data.features.map(feature => {

            const alert = feature.properties;

            return {

                id:
                    feature.id,

                event:
                    alert.event || "Weather Alert",

                headline:
                    alert.headline || alert.event,

                severity:
                    alert.severity || "Unknown",

                urgency:
                    alert.urgency || "Unknown",

                effective:
                    alert.effective,

                onset:
                    alert.onset,

                ends:
                    alert.ends,

                expires:
                    alert.expires,

                description:
                    alert.description || "",

                instruction:
                    alert.instruction || ""

            };

        });

    }
    catch(error){

        console.error(
            `Unable to load alerts for ${location}:`,
            error
        );

        return [];

    }

}


function applyAlertsToForecast(forecast, alerts){

    forecast.forEach(hour => {

        if(!hour){

            return;

        }


        const hourStart =
            new Date(hour.startTime);

        const hourEnd =
            new Date(hour.endTime);


        hour.alerts = alerts.filter(alert => {

            const alertStart =
                new Date(
                    alert.onset ||
                    alert.effective
                );


            const alertEnd =
                new Date(
                    alert.ends ||
                    alert.expires
                );


            if(
                Number.isNaN(alertStart.getTime()) ||
                Number.isNaN(alertEnd.getTime())
            ){

                return false;

            }


            return (
                alertStart < hourEnd &&
                alertEnd > hourStart
            );

        });

    });

}
function getSunTimes(selectedLocation, selectedDate){


    const date =
        new Date(selectedDate + "T12:00:00");


    const coords =
        locations[selectedLocation];


    const times =
        SunCalc.getTimes(
            date,
            coords.lat,
            coords.lon
        );


    return {

        sunrise:
            formatClockTime(times.sunrise),

        sunset:
            formatClockTime(times.sunset),

        sunriseDate:
            times.sunrise,

        sunsetDate:
            times.sunset,

        sunrisePercent:
            timeToPercent(times.sunrise),

        sunsetPercent:
            timeToPercent(times.sunset)

    };


}


function formatClockTime(date){


    return date.toLocaleTimeString(
        [],
        {
            hour:"numeric",
            minute:"2-digit"
        }
    );


}



function timeToPercent(date){


    const totalMinutes =
        date.getHours() * 60 +
        date.getMinutes();


    return (
        totalMinutes /
        (24 * 60)
    ) * 100;


}

function formatHour(hour){

    let suffix =
    hour>=12 ? "PM":"AM";


    let h =
    hour%12;


    if(h===0)
        h=12;


    return h+suffix;

}


function emoji(result){

    switch(result){
        case "GO": return "😎";
        case "MAYBE": return "🤨";
        case "LIMITED WINDOW": return "😕";
        case "DON'T GO": return "☹️";
        case "FLAT": return "🔵";
        case "CALM": return "🟢";
        case "SPORTY": return "🟡";
        case "POOR": return "🔴";
        default: return "";
    }

}


function overallClass(result){

    return "decision-result";

}