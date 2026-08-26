// Chesapeake Bay Boating Conditions
// Version 1.10.2


let windChart;
let waveChart;
let precipChart;

let tideStationCache = null;
let lastTidePoints = [];
let lastTideEvents = [];
let lastSunData = null;
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

    setupTideToggle();

    setupLocationMap();

    setupForecastSourceUI();

    setupForecastConfidenceUI();

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
    weatherData,
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

    weatherData.forEach(locationForecast => {
        if(!Array.isArray(locationForecast)){
            return;
        }

        locationForecast.forEach((hour, hourIndex) => {
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

    const concerns = [];

    if(windSeverity > 0){
        concerns.push("Wind");
    }

    if(waveSeverity > 0){
        concerns.push("Waves");
    }

    if(rainSeverity > 0){
        concerns.push("Rain");
    }

    // Do not show a concern unless the timeline actually contains
    // Sporty or Poor conditions. This prevents isolated forecast values
    // from creating a concern on an otherwise all-day calm forecast.
    const hasUnfavorableTimeline =
        document.querySelector(
            "#timelineBar .timeline-sporty, #timelineBar .timeline-no-go"
        ) !== null;

    const primary =
        hasUnfavorableTimeline && concerns.length
            ? concerns.join(" + ")
            : "None";

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
        <div id="forecastToolsMount"></div>
    `;

    let recommendation = "";

    if(primary === "None"){
        recommendation =
            "Conditions are within the selected vessel's comfort limits for the favorable periods shown below.";
    }
    else if(primary === "Wind"){
        recommendation =
            windSeverity >= 3
                ? "Wind is the main factor pushing conditions into Poor territory."
                : "Wind is the main factor making conditions Sporty.";
    }
    else if(primary === "Waves"){
        recommendation =
            waveSeverity >= 3
                ? "Wave conditions are the main factor pushing conditions into Poor territory."
                : "Wave conditions are the main factor making conditions Sporty.";
    }
    else {
        recommendation =
            rainSeverity >= 3
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
    OpenSeaMap's seamark tiles: icon-style symbols
    (buoys, lights, marinas) — not chart data.
    */
    const nauticalMarkersOverlay =
        L.tileLayer(
            "https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png",
            {
                maxZoom: 18,
                attribution:
                    '&copy; <a href="https://www.openseamap.org/">OpenSeaMap</a> contributors'
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


    L.control.layers(
        {
            "Streets": streetsLayer,
            "Satellite": satelliteLayer
        },
        {
            "Depth Contours (NOAA Chart)": depthContourOverlay,
            "Nautical Markers": nauticalMarkersOverlay
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


    setupFishingSpotsLayer();

    setupBuoyLayer();


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
                        '<button type="button" class="use-fishing-spot-button">' +
                            'Use this location' +
                        '</button>' +
                    '</div>'
                )
            );


            marker.on(
                "popupopen",
                event => {

                    const popupElement =
                        event.popup.getElement();

                    const button =
                        popupElement?.querySelector(
                            ".use-fishing-spot-button"
                        );


                    if(!button){
                        return;
                    }


                    button.addEventListener(
                        "click",
                        () => {

                            setSelectedMapLocation(
                                spot.lat,
                                spot.lon,
                                spot.name
                            );

                            locationMap.closePopup();

                        },
                        {
                            once: true
                        }
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


    const FishingSpotsControl =
        L.Control.extend({

            options: {
                position:
                    "topright"
            },

            onAdd(){

                const container =
                    L.DomUtil.create(
                        "div",
                        "leaflet-control fishing-spots-control"
                    );


                container.innerHTML =
                    '<label>' +
                        '<input type="checkbox" checked>' +
                        '<span>Offshore Reefs</span>' +
                    '</label>';


                L.DomEvent.disableClickPropagation(
                    container
                );

                L.DomEvent.disableScrollPropagation(
                    container
                );


                const checkbox =
                    container.querySelector(
                        'input[type="checkbox"]'
                    );


                checkbox.addEventListener(
                    "change",
                    () => {

                        if(checkbox.checked){

                            fishingSpotsLayer.addTo(
                                locationMap
                            );

                        }
                        else {

                            locationMap.removeLayer(
                                fishingSpotsLayer
                            );

                        }

                    }
                );


                return container;

            }

        });


    locationMap.addControl(
        new FishingSpotsControl()
    );

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


function parseNDBCRealtime2(text){

    /*
    NDBC's realtime2 standard meteorological
    text file: a header line, a units line, then
    the most recent observation first. Missing
    values are written as "MM".
    */

    const lines =
        text
            .split("\n")
            .map(line => line.trim())
            .filter(Boolean);

    if(lines.length < 3){
        return null;
    }

    const dataLine =
        lines[2];

    const columns =
        dataLine.split(/\s+/);

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
            );

    }

    return {
        observedAt,
        windSpeedMph:
            metersPerSecondToMph(windSpeedMps),
        gustMph:
            metersPerSecondToMph(gustMps),
        waveHeightFt:
            waveHeightMeters !== null
                ? metersToFeet(waveHeightMeters)
                : null,
        wavePeriodSec:
            dominantWavePeriod,
        airTempF:
            airTempC !== null
                ? (airTempC * 9 / 5) + 32
                : null
    };

}


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
            '<button type="button" class="use-buoy-location-button">' +
                'Use this location for forecast' +
            '</button>' +
            '<p class="buoy-popup-explainer">' +
                'Real-time sensor data — for a forecast, tap anywhere on the map.' +
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


async function fetchBuoyObservation(station){

    if(buoyObservationCache[station.id]){
        return buoyObservationCache[station.id];
    }

    const directURL =
        `https://www.ndbc.noaa.gov/data/realtime2/${station.id.toUpperCase()}.txt`;

    /*
    NDBC's data directory doesn't send the CORS
    header browsers require for cross-origin JS
    fetches, so a direct request from Drift's own
    domain will typically be blocked before it even
    reaches NDBC. Try direct first (in case that
    ever changes, or Drift is later served from a
    domain NDBC does allow), then fall back to a
    public CORS proxy so buoy popups still work for
    now.

    This proxy fallback is a stopgap for testing,
    not the long-term answer — it depends on a free
    third-party service that can rate-limit or go
    down without notice. The real fix is item #7:
    Drift's own backend fetching NDBC data on a
    schedule and serving it from Drift's domain,
    which sidesteps CORS entirely since it's a
    server-to-server request.
    */

    let text = null;

    try {

        const response =
            await fetch(directURL);

        if(response.ok){
            text = await response.text();
        }

    }
    catch(directError){

        console.warn(
            `Direct NDBC fetch blocked for ${station.name} ` +
            "(expected — NDBC doesn't send CORS headers). " +
            "Falling back to proxy.",
            directError
        );

    }

    if(!text){

        try {

            const proxyResponse =
                await fetch(
                    "https://api.allorigins.win/raw?url=" +
                    encodeURIComponent(directURL)
                );

            if(proxyResponse.ok){
                text = await proxyResponse.text();
            }

        }
        catch(proxyError){

            console.warn(
                `Proxy fallback also failed for ${station.name}:`,
                proxyError
            );

        }

    }

    if(!text){

        throw new Error(
            `NDBC data unavailable for ${station.name}`
        );

    }

    const observation =
        parseNDBCRealtime2(text);

    if(!observation){

        throw new Error(
            `No recent readings for ${station.name}`
        );

    }

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

            marker.bindPopup(
                buildBuoyPopupHTML(
                    station,
                    null,
                    null
                )
            );

            marker.on(
                "popupopen",
                async event => {

                    const popupElement =
                        event.popup.getElement();

                    /*
                    Attach the "use this location" handler
                    via delegation on the popup wrapper, since
                    setPopupContent() below replaces the inner
                    button element once the live reading loads
                    (or fails) — delegation means the listener
                    survives that content swap.
                    */
                    popupElement?.addEventListener(
                        "click",
                        clickEvent => {

                            if(
                                !clickEvent.target.closest(
                                    ".use-buoy-location-button"
                                )
                            ){
                                return;
                            }

                            setSelectedMapLocation(
                                station.lat,
                                station.lon,
                                station.name
                            );

                            locationMap.closePopup();

                        }
                    );

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


    const BuoyLayerControl =
        L.Control.extend({

            options: {
                position:
                    "topright"
            },

            onAdd(){

                const container =
                    L.DomUtil.create(
                        "div",
                        "leaflet-control buoy-layer-control"
                    );

                container.innerHTML =
                    '<label>' +
                        '<input type="checkbox" checked>' +
                        '<span>Buoys</span>' +
                    '</label>';

                L.DomEvent.disableClickPropagation(
                    container
                );

                L.DomEvent.disableScrollPropagation(
                    container
                );

                const checkbox =
                    container.querySelector(
                        'input[type="checkbox"]'
                    );

                checkbox.addEventListener(
                    "change",
                    () => {

                        if(checkbox.checked){

                            buoyLayer.addTo(
                                locationMap
                            );

                        }
                        else {

                            locationMap.removeLayer(
                                buoyLayer
                            );

                        }

                    }
                );

                return container;

            }

        });

    locationMap.addControl(
        new BuoyLayerControl()
    );

}


function setSelectedMapLocation(
    lat,
    lon,
    locationName = null
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


    selectedMapMarker
        .bindPopup(
            (
                "<strong>Selected location</strong><br>" +
                numericLat.toFixed(5) +
                ", " +
                numericLon.toFixed(5)
            )
        )
        .openPopup();


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
        precipChart
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

    clearTideOverlay();

    lastTidePoints = [];
    lastTideEvents = [];
    lastSunData = null;

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


async function checkConditions(){

    const selectedLocations =
        selectedMapLocationName
            ? [
                selectedMapLocationName
            ]
            : [];


    if(selectedLocations.length === 0){

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
        selectedLocations[0],
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
                selectedLocations,
                selectedDate
            );
        document.getElementById("checked").innerHTML =
            new Date().toLocaleString();


        const allResults = [];

        const allWeather = [];

        let allAlerts=[];



        for(const location of selectedLocations){

            const [
    forecast,
    alerts
] = await Promise.all([

    getHourlyWeather(
        location,
        selectedDate
    ),

    getActiveAlerts(
        location
    )

]);


if(!forecast){

    document.getElementById("message").innerHTML =
        "Weather data unavailable. Please try again.";

    return;

}


applyAlertsToForecast(
    forecast,
    alerts
);


allWeather.push(forecast);


alerts.forEach(alert => {

    allAlerts.push({
        ...alert,
        location: location
    });

});


            const evaluated =
                evaluateLocation(
                    forecast,
                    boatSize
                );


            allResults.push(
                evaluated.hourlyResults
            );
}


        const timeline =
    combineTimelineResults(allResults);


/*
For today's forecast, remove elapsed hours
from all recommendations and summaries.

The current hour remains included because
conditions for that hour are still relevant.
*/

const now = new Date();

const todayString = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0")
].join("-");


const relevantTimeline =
    timeline.map((status, hourIndex) => {

        if(
            selectedDate === todayString &&
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


        createTimeline(
    relevantTimeline,
    sun
);

        await renderTideOverlay(
            selectedLocations,
            selectedDate,
            sun
        );


        document.getElementById("decision").innerHTML =
            emoji(overall) + " " + overall;


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
                allWeather,
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


        document.getElementById("whyResults").innerHTML =
            createWhySection(validTimeline);
createEvidenceCharts(allWeather);
const alertsForSelectedTime =
    getAlertsFromForecast(allWeather);
function getAlertsFromForecast(weatherData){

    const matchingAlerts = [];


    weatherData.forEach(locationForecast => {

        locationForecast.forEach(hour => {

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

    });


    return matchingAlerts;

}
renderAdvisoryTile(
    alertsForSelectedTime
);

renderNextSixDays(
    selectedLocations,
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



function createEvidenceCharts(weatherData){

    const maxWind = [];
    const maxGust = [];
    const maxWaves = [];
    const maxWavePeriods = [];
    const maxPrecip = [];

    /*
Only use wind directions when exactly
one location has been selected.
*/
const windDirections =
    weatherData.length === 1
        ? weatherData[0].map(hour =>
            hour
                ? hour.windDirection || null
                : null
        )
        : null;

    for(let hour = 0; hour < 24; hour++){

        const availableHours =
            weatherData
                .map(location => location[hour])
                .filter(hourData =>
                    hourData !== null &&
                    hourData !== undefined
                );


        if(availableHours.length === 0){

            maxWind.push(null);
            maxGust.push(null);
            maxWaves.push(null);
            maxWavePeriods.push(null);
            maxPrecip.push(null);

            continue;
        }


        const hourlyWindValues =
            availableHours
                .map(hourData =>
                    Number(hourData.wind)
                )
                .filter(value =>
                    Number.isFinite(value)
                );


        const hourlyGustValues =
            availableHours
                .map(hourData =>
                    Number(hourData.gust)
                )
                .filter(value =>
                    Number.isFinite(value)
                );


        const hourlyWaveEntries =
            availableHours
                .map(hourData => ({

                    height:
                        Number(hourData.waves),

                    period:
                        Number(hourData.wavePeriod),

                    originalHeight:
                        hourData.waves,

                    originalPeriod:
                        hourData.wavePeriod

                }))
                .filter(entry => (

                    entry.originalHeight !== null &&
                    entry.originalHeight !== undefined &&
                    Number.isFinite(entry.height)

                ));


        const maxWaveEntry =
            hourlyWaveEntries.length
                ? hourlyWaveEntries.reduce(
                    (highest, entry) =>
                        entry.height > highest.height
                            ? entry
                            : highest
                )
                : null;


        const hourlyPrecipValues =
            availableHours
                .map(hourData =>
                    Number(hourData.precip)
                )
                .filter(value =>
                    Number.isFinite(value)
                );


        maxWind.push(
            hourlyWindValues.length
                ? Math.max(...hourlyWindValues)
                : null
        );


        maxGust.push(
            hourlyGustValues.length
                ? Math.max(...hourlyGustValues)
                : null
        );


        maxWaves.push(
            maxWaveEntry
                ? maxWaveEntry.height
                : null
        );


        maxWavePeriods.push(
            maxWaveEntry &&
            maxWaveEntry.originalPeriod !== null &&
            maxWaveEntry.originalPeriod !== undefined &&
            Number.isFinite(maxWaveEntry.period)
                ? maxWaveEntry.period
                : null
        );


        maxPrecip.push(
            hourlyPrecipValues.length
                ? Math.max(...hourlyPrecipValues)
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

        if(
            !Array.isArray(directions) ||
            directions.length === 0
        ){
            return;
        }


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
        Position the arrows along the bottom
        of the chart, underneath the hour labels.
        */
        const arrowY =
            chart.height - 8;


        ctx.save();

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
    Supply directions to the custom plugin.

    Passing null prevents arrows from appearing
    when multiple locations are selected.
    */
    options.plugins.windDirectionArrows = {
        directions:
            Array.isArray(windDirections)
                ? windDirections
                : []
    };


    /*
    Reserve extra room underneath the graph
    for the wind-direction arrows.
    */
    options.layout = {
        padding: {
            bottom: 22
        }
    };


    windChart =
        new Chart(
            document.getElementById(
                "windChart"
            ),
            {

                type: "line",

                plugins: [
                    windDirectionArrowPlugin
                ],

                data: {

                    labels:
                        hourLabels(),

                    datasets: [

                        {
                            label: "Sustained",
                            data: sustainedData,
                            borderColor: "#2563eb",
                            backgroundColor: "#2563eb",
                            pointBackgroundColor: "#2563eb",
                            tension: 0.3,
                            fill: false,
                            spanGaps: false
                        },

                        {
                            label: "Gusts",
                            data: gustData,
                            borderColor: "#dc2626",
                            backgroundColor: "#dc2626",
                            pointBackgroundColor: "#dc2626",
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
                    chart.height - 7
                );

            }
        );


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


    const options =
        simpleChartOptions();


    options.layout =
        {
            padding: {
                bottom: 20
            }
        };


    options.plugins =
        options.plugins || {};


    const selectedBoatSize =
        document.getElementById("boatSize")?.value ||
        "medium";


    options.plugins.wavePeriodLabels =
        {
            periods:
                wavePeriods,
            boatSize:
                selectedBoatSize
        };


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
                            wavePeriods[
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
                    wavePeriodLabelPlugin
                ],

                data: {

                    labels:
                        hourLabels(),

                    datasets: [
                        {

                            data:
                                data,

                            backgroundColor(context){

                                const rawWaveHeight =
                                    context.raw;

                                const waveHeight =
                                    Number(
                                        rawWaveHeight
                                    );

                                const rawPeriod =
                                    wavePeriods[
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
                                    wavePeriods[
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

    precipChart =
    new Chart(
        document.getElementById("precipChart"),
        {

        type:"line",

        data:{

            labels:hourLabels(),

            datasets:[{

                data:data,

                fill:true,

                tension:.3

            }]

        },

        options:{

            ...simpleChartOptions(),

            scales:{

                x:{
                    ticks:{
                        maxTicksLimit:5
                    }
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

        }

    });

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

                ticks:{

                    maxTicksLimit:5

                }

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
            return "#2196f3";

        case "CALM":
            return "#4caf50";

        case "SPORTY":
            return "#f0b429";

        case "POOR":
            return "#dc2626";

        default:
            return "#2563eb";

    }

}


function getWaveConditionBorderColor(status){

    switch(status){

        case "FLAT":
            return "#1976d2";

        case "CALM":
            return "#388e3c";

        case "SPORTY":
            return "#c58b00";

        case "POOR":
            return "#b91c1c";

        default:
            return "#1d4ed8";

    }

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

function combineTimelineResults(allResults){

    const timeline = [];


    for(let i = 0; i < 24; i++){

        const hourlyValues =
            allResults.map(location => location[i]);


        const validValues =
            hourlyValues.filter(value =>
                value !== "PAST" &&
                value !== null &&
                value !== undefined
            );


        if(validValues.length === 0){

            timeline.push("PAST");

            continue;

        }


        if(validValues.includes("POOR")){

            timeline.push("POOR");

            continue;

        }


        if(validValues.includes("SPORTY")){

            timeline.push("SPORTY");

            continue;

        }


        /*
When multiple locations are selected,
use the most restrictive condition.

If one location is CALM and another is FLAT,
the combined result is CALM.

The combined result is FLAT only when every
available selected location is FLAT.
*/

if(validValues.includes("CALM")){

    timeline.push("CALM");

    continue;

}


timeline.push("FLAT");

    }


    return timeline;

}


function setupTideToggle(){

    const toggle =
        document.getElementById(
            "tideToggle"
        );


    if(!toggle){
        return;
    }


    const savedPreference =
        localStorage.getItem(
            "showTideOverlay"
        );


    toggle.checked =
        savedPreference !== "false";


    toggle.addEventListener(
        "change",
        function(){

            localStorage.setItem(
                "showTideOverlay",
                String(toggle.checked)
            );

            updateTideOverlayVisibility();

            renderDailyEventTimes(
                toggle.checked
                    ? lastTideEvents
                    : [],
                lastSunData
            );

        }
    );

}


function updateTideOverlayVisibility(){

    const toggle =
        document.getElementById(
            "tideToggle"
        );

    const overlay =
        document.getElementById(
            "tideOverlay"
        );


    if(!toggle || !overlay){
        return;
    }


    const shouldShow =
        toggle.checked &&
        lastTidePoints.length > 1;


    overlay.classList.toggle(
        "hidden",
        !shouldShow
    );

}


function clearTideOverlay(){

    lastTidePoints = [];

    const tidePath =
        document.getElementById(
            "tidePath"
        );

    const tidePathOutline =
        document.getElementById(
            "tidePathOutline"
        );


    if(tidePath){
        tidePath.setAttribute("d", "");
    }

    if(tidePathOutline){
        tidePathOutline.setAttribute("d", "");
    }


    updateTideOverlayVisibility();

}


async function renderTideOverlay(
    selectedLocations,
    selectedDate,
    sun
){

    clearTideOverlay();

    lastSunData = sun;
    lastTideEvents = [];


    /*
    Always render sunrise and sunset, even if tide
    data is hidden, unavailable, or multiple locations
    are selected.
    */

    renderDailyEventTimes(
        [],
        sun
    );


    /*
    A single tide curve only makes sense for one
    selected location. Different locations can use
    different tide-prediction stations and timing.
    */

    if(
        !Array.isArray(selectedLocations) ||
        selectedLocations.length !== 1
    ){
        return;
    }


    const locationName =
        selectedLocations[0];

    const coords =
        locations[locationName];


    if(!coords){
        return;
    }


    try {

        const station =
            await findNearestTideStation(
                coords.lat,
                coords.lon
            );


        if(!station){
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


        const now = new Date();
        const selectedDateObject = new Date(selectedDate + "T00:00:00");
        const isToday = selectedDateObject.toDateString() === now.toDateString();
        const currentHour = now.getHours();

        const visibleTidePredictions = isToday
            ? hourlyPredictions.filter(point => point.hour >= currentHour)
            : hourlyPredictions;

        if(visibleTidePredictions.length >= 2){

            drawTidePath(
                visibleTidePredictions
            );

        }


        lastTideEvents =
            highLowEvents;


        const tideToggle =
            document.getElementById(
                "tideToggle"
            );


        renderDailyEventTimes(
            tideToggle?.checked
                ? highLowEvents
                : [],
            sun
        );

    }
    catch(error){

        /*
        Tide data is optional. A tide failure should
        never prevent the weather results from loading.
        */

        console.warn(
            `Tide data unavailable for ${locationName}:`,
            error
        );

        clearTideOverlay();

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

    const container =
        document.getElementById(
            "dailyEventTimes"
        );


    if(!container){
        return;
    }


    const events = [];


    if(
        sun?.sunriseDate instanceof Date &&
        !Number.isNaN(
            sun.sunriseDate.getTime()
        )
    ){

        events.push({
            date: sun.sunriseDate,
            icon: "🌅",
            label: "Sunrise"
        });

    }


    if(
        sun?.sunsetDate instanceof Date &&
        !Number.isNaN(
            sun.sunsetDate.getTime()
        )
    ){

        events.push({
            date: sun.sunsetDate,
            icon: "🌇",
            label: "Sunset"
        });

    }


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


            events.push({
                date: event.date,
                icon:
                    isHigh
                        ? "⬆"
                        : "⬇",
                label:
                    isHigh
                        ? "High tide"
                        : "Low tide"
            });

        });

    }


    events.sort(
        (a, b) =>
            a.date.getTime() -
            b.date.getTime()
    );


    container.innerHTML =
        events
            .map(event => {

                const timeText =
                    event.date.toLocaleTimeString(
                        [],
                        {
                            hour: "numeric",
                            minute: "2-digit"
                        }
                    );


                return `
                    <div class="daily-event-time">
                        <span class="daily-event-icon">
                            ${event.icon}
                        </span>

                        <span class="daily-event-label">
                            ${event.label}:
                        </span>

                        <strong>
                            ${escapeHTML(
                                timeText
                            )}
                        </strong>
                    </div>
                `;

            })
            .join("");

}


function drawTidePath(predictions){

    const tidePath =
        document.getElementById(
            "tidePath"
        );

    const tidePathOutline =
        document.getElementById(
            "tidePathOutline"
        );


    if(!tidePath || !tidePathOutline){
        return;
    }


    const values =
        predictions.map(point => point.value);

    const minimum =
        Math.min(...values);

    const maximum =
        Math.max(...values);

    const range =
        Math.max(maximum - minimum, 0.01);


    /*
    Keep the line away from the rounded top and bottom
    edges of the 28px timeline bar.
    */

    const topPadding = 14;
    const drawableHeight = 72;


    const points =
        predictions.map(point => ({
            x:
                point.hour / 24 * 1000,
            y:
                topPadding +
                (maximum - point.value) /
                range *
                drawableHeight
        }));


    /*
    NOAA's final hourly value is normally 11 PM.
    Project one additional point to midnight so the
    curve reaches the full right edge of the bar.
    */

    if(points.length >= 2){

        const lastPoint =
            points[points.length - 1];

        const previousPoint =
            points[points.length - 2];

        const projectedY =
            lastPoint.y +
            (
                lastPoint.y -
                previousPoint.y
            );


        points.push({
            x: 1000,
            y:
                Math.max(
                    topPadding,
                    Math.min(
                        topPadding + drawableHeight,
                        projectedY
                    )
                )
        });

    }


    const pathData =
        createSmoothSvgPath(points);


    tidePath.setAttribute(
        "d",
        pathData
    );

    tidePathOutline.setAttribute(
        "d",
        pathData
    );


    lastTidePoints = points;

    updateTideOverlayVisibility();

}


function createSmoothSvgPath(points){

    if(points.length < 2){
        return "";
    }


    let path =
        `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;


    for(let index = 1; index < points.length; index++){

        const previous =
            points[index - 1];

        const current =
            points[index];

        const midpointX =
            (previous.x + current.x) / 2;


        path +=
            ` C ${midpointX.toFixed(2)} ${previous.y.toFixed(2)},` +
            ` ${midpointX.toFixed(2)} ${current.y.toFixed(2)},` +
            ` ${current.x.toFixed(2)} ${current.y.toFixed(2)}`;

    }


    return path;

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
    selectedLocations,
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
                const locationResults = await Promise.all(
                    selectedLocations.map(async location => {
                        const forecast = await getHourlyWeather(location, date);
                        const locationAlerts = currentAlerts.filter(alert =>
                            !alert.location || alert.location === location
                        );
                        applyAlertsToForecast(forecast, locationAlerts);
                        return evaluateLocation(forecast, boatSize).hourlyResults;
                    })
                );

                return {
                    date,
                    timeline: combineTimelineResults(locationResults)
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


function createTimeline(results, sun){

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


function createWhySection(results){

    const flatHours =
        results.filter(
            result => result === "FLAT"
        ).length;

    const calmHours =
        results.filter(
            result => result === "CALM"
        ).length;

    const sportyHours =
        results.filter(
            result => result === "SPORTY"
        ).length;

    const poorHours =
        results.filter(
            result => result === "POOR"
        ).length;


    let longestFavorableWindow = 0;
    let currentFavorableWindow = 0;


    results.forEach(result => {

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


    const html = `
        <div class="why-item">
            🔵 Flat hours: <strong>${flatHours}</strong>
        </div>

        <div class="why-item">
            🟢 Calm hours: <strong>${calmHours}</strong>
        </div>

        <div class="why-item">
            🟡 Sporty hours: <strong>${sportyHours}</strong>
        </div>

        <div class="why-item">
            🔴 Poor hours: <strong>${poorHours}</strong>
        </div>
    `;
return html;

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
function getSunTimes(selectedLocations, selectedDate){


    const date =
        new Date(selectedDate + "T12:00:00");


    const sunriseTimes = [];

    const sunsetTimes = [];


    selectedLocations.forEach(location => {


        const coords =
            locations[location];


        const times =
            SunCalc.getTimes(
                date,
                coords.lat,
                coords.lon
            );


        sunriseTimes.push(times.sunrise);

        sunsetTimes.push(times.sunset);


    });



    const earliestSunrise =
        new Date(
            Math.min(
                ...sunriseTimes.map(time => time.getTime())
            )
        );


    const latestSunrise =
        new Date(
            Math.max(
                ...sunriseTimes.map(time => time.getTime())
            )
        );


    const earliestSunset =
        new Date(
            Math.min(
                ...sunsetTimes.map(time => time.getTime())
            )
        );


    const latestSunset =
        new Date(
            Math.max(
                ...sunsetTimes.map(time => time.getTime())
            )
        );



    return {

        sunrise:
            formatTimeRange(
                earliestSunrise,
                latestSunrise
            ),

        sunset:
            formatTimeRange(
                earliestSunset,
                latestSunset
            ),

        sunriseDate:
            earliestSunrise,

        sunsetDate:
            latestSunset,

        sunrisePercent:
            timeToPercent(earliestSunrise),

        sunsetPercent:
            timeToPercent(latestSunset)

    };


}


function formatTimeRange(earliest, latest){


    const earliestText =
        formatClockTime(earliest);


    const latestText =
        formatClockTime(latest);


    if(earliestText === latestText){

        return earliestText;

    }


    return earliestText + " - " + latestText;


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
