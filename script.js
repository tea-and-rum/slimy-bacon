// Chesapeake Bay Boating Conditions
// Version 1.9.2


let windChart;
let waveChart;
let precipChart;

const locations = {

    "Gunpowder River":{
        lat:39.376819,
        lon:-76.321522
    },

    "Tolchester Marina Area":{
        lat:39.215570,
        lon:-76.252115
    },

    "Hart-Miller Island":{
    lat:39.262787,
    lon:-76.381216
},

"Fort Smallwood":{
    lat:39.176864,
    lon:-76.495797
},

    "Bay Bridge":{
        lat:38.999808,
        lon:-76.365982
    },

    "Triton Beach":{
        lat:38.879155,
        lon:-76.491461
    },

    "Kent Narrows":{
        lat:38.962535,
        lon:-76.245747

    },

    "Poplar Island":{
        lat:38.766405,
        lon:-76.403985

    }

};

window.onload = function(){

    setToday();

    setupVesselCards();

    setupDarkMode();

};


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



    cards.forEach(card=>{


        card.addEventListener("click",function(){


            cards.forEach(c=>{

                c.classList.remove("selected");

            });



            this.classList.add("selected");



            boatInput.value =
                this.dataset.size;



            localStorage.setItem(
                "preferredBoatSize",
                this.dataset.size
            );


        });


    });





    const saved =
        localStorage.getItem("preferredBoatSize");



    if(saved){


        const savedCard =
            document.querySelector(
                `.vessel-card[data-size="${saved}"]`
            );


        if(savedCard){

            savedCard.classList.add("selected");

            boatInput.value=saved;

        }


    }
    else{


        const defaultCard =
            document.querySelector(
                '.vessel-card[data-size="medium"]'
            );


        defaultCard.classList.add("selected");


    }

}









function clearSelections(){


    document
    .querySelectorAll(".locations input")
    .forEach(box=>{

        box.checked=false;

    });


    document
    .getElementById("results")
    .classList
    .add("hidden");

}









async function checkConditions(){

    const selectedLocations =
        [...document.querySelectorAll(".locations input:checked")]
            .map(input => input.value);


    if(selectedLocations.length === 0){

        document.getElementById("message").innerHTML =
            "Please select at least one location.";

        return;

    }


    const boatSize =
        document.getElementById("boatSize").value;


    const selectedDate =
        document.getElementById("date").value;


    if(!selectedDate){

        document.getElementById("message").innerHTML =
            "Please select a date.";

        return;

    }


    document.getElementById("message").innerHTML =
        "Checking conditions...";


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


        document.getElementById("sunrise").innerHTML =
            sun.sunrise;


        document.getElementById("sunset").innerHTML =
            sun.sunset;


        document.getElementById("checked").innerHTML =
            new Date().toLocaleString();


        const allResults = [];

        const allWeather = [];

        let allAlerts=[];

        let locationHTML = "";


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


            locationHTML += `

                <div class="locationCard ${backgroundClass(evaluated.result)}">

                    <strong>
                        ${emoji(evaluated.result)}
                        ${location}
                    </strong>

                    <br><br>

                    <b>Best conditions:</b><br>

                    ${findGoodWindow(evaluated.hourlyResults)}

                    <br><br>

                    <b>Watch:</b><br>

                    ${evaluated.reason}

                </div>

            `;

        }


        const timeline =
            combineTimelineResults(allResults);


        const validTimeline =
    timeline.filter(value =>
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
            timeline,
            sun
        );


        document.getElementById("decision").innerHTML =
            emoji(overall) + " " + overall;


        document.getElementById("decision").className =
            overallClass(overall);


        document.getElementById("decisionSummary").innerHTML =
    getDecisionSummary(
        overall,
        validTimeline
    );


        document.getElementById("whyResults").innerHTML =
            createWhySection(validTimeline);


        document.getElementById("locationResults").innerHTML =
            locationHTML;


        document.getElementById("window").innerHTML =
            findGoodWindow(timeline);


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

        document
            .getElementById("results")
            .classList
            .remove("hidden");

setTimeout(() => {

    document.getElementById("results").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

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


        const hourlyWaveValues =
            availableHours
                .map(hourData =>
                    Number(hourData.waves)
                )
                .filter((value, index) => {

                    const originalValue =
                        availableHours[index].waves;

                    return (
                        originalValue !== null &&
                        originalValue !== undefined &&
                        Number.isFinite(value)
                    );

                });


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
            hourlyWaveValues.length
                ? Math.max(...hourlyWaveValues)
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

    createWaveChart(maxWaves);
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





function createWaveChart(data){


    if(waveChart)
        waveChart.destroy();



    waveChart =
    new Chart(
        document.getElementById("waveChart"),
        {

        type:"bar",

        data:{

            labels:hourLabels(),

            datasets:[{

                data:data

            }]

        },

        options:simpleChartOptions()

        });


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


function getAlertStatus(alerts){

    if(
        !Array.isArray(alerts) ||
        alerts.length === 0
    ){

        return "CALM";

    }


    const noGoAlerts = [

        "Special Marine Warning",
        "Severe Thunderstorm Warning",
        "Tornado Warning",

        "Small Craft Advisory",

        "Gale Warning",
        "Storm Warning",

        "Hurricane Warning",
        "Tropical Storm Warning",

        "Extreme Wind Warning",
        "Snow Squall Warning"

    ];


    const sportyAlerts = [

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


    if(
        alerts.some(alert =>
            noGoAlerts.includes(alert.event)
        )
    ){

        return "POOR";

    }


    if(
        alerts.some(alert =>
            sportyAlerts.includes(alert.event)
        )
    ){

        return "SPORTY";

    }


    /*
    Any other active NWS alert receives
    a cautious SPORTY classification.
    */

    return "SPORTY";

}




function checkHour(hour, boatSize){

    const thresholds = {

        small: {
            wind: {
                sporty: 11,
                noGo: 18
            },
            waves: {
                sporty: 1,
                noGo: 2
            }
        },

        medium: {
            wind: {
                sporty: 16,
                noGo: 23
            },
            waves: {
                sporty: 2,
                noGo: 4
            }
        },

        large: {
            wind: {
                sporty: 21,
                noGo: 31
            },
            waves: {
                sporty: 4,
                noGo: 6
            }
        },

        xlarge: {
            wind: {
                sporty: 26,
                noGo: 36
            },
            waves: {
                sporty: 6,
                noGo: 8
            }
        }

    };


    const limits =
        thresholds[boatSize];


    if(!limits){

        console.error(
            "Unknown vessel size:",
            boatSize
        );

        return {
            status: "POOR"
        };

    }


    const sustainedWind =
    Number(hour.wind) || 0;

const gustWind =
    Number.isFinite(
        Number(hour.gust)
    )
        ? Number(hour.gust)
        : sustainedWind;

/*
Use whichever wind measurement creates
the more restrictive result.
*/
const wind =
    Math.max(
        sustainedWind,
        gustWind
    );

    const waves =
        Number(hour.waves);

   const hasWaveData =
    hour.waves !== null &&
    hour.waves !== undefined &&
    Number.isFinite(waves);

    const precip =
        Number(hour.precip) || 0;

    const alerts =
        Array.isArray(hour.alerts)
            ? hour.alerts
            : [];


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
        alerts.some(alert =>
            noGoAlertNames.includes(
                alert.event
            )
        );


    const hasSportyAlert =
        alerts.some(alert =>
            sportyAlertNames.includes(
                alert.event
            )
        );


    /*
    NO-GO takes priority.
    */

    if(
        hasNoGoAlert ||
        wind >= limits.wind.noGo ||
        (
            hasWaveData &&
            waves >= limits.waves.noGo
        ) ||
        precip >= 61
    ){

        return {
            status: "POOR"
        };

    }


    /*
    SPORTY comes next.
    */

    if(
        hasSportyAlert ||
        alerts.length > 0 ||
        wind >= limits.wind.sporty ||
        (
            hasWaveData &&
            waves >= limits.waves.sporty
        ) ||
        precip >= 31
    ){

        return {
            status: "SPORTY"
        };

    }


    /*
FLAT is better than CALM.

Only classify the hour as FLAT when NOAA
provides wave data, reports zero-foot waves,
and the higher of sustained wind or gusts
is no more than 5 mph.
*/

if(
    hasWaveData &&
    waves < 0.1 &&
    wind <= 5
){
    return {
        status: "FLAT"
    };
}


return {
    status: "CALM"
};

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


    /*
    FLAT and CALM both count toward a
    favorable continuous boating window.
    */

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


    if(
        poorHours === 0 &&
        favorableHours > sportyHours &&
        sportyHours <= 2
    ){
        return "GO";
    }


    if(
        poorHours === 0 ||
        poorHours <= 2
    ){
        return "MAYBE";
    }


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





function findGoodWindow(results){

    const windows = [];
    let start = null;

    results.forEach((value, index) => {
        const isCalm =
    value === "FLAT" ||
    value === "CALM";

        if(isCalm && start === null){
            start = index;
        }

        if(!isCalm && start !== null){
            windows.push(formatHour(start) + " - " + formatHour(index));
            start = null;
        }
    });

    if(start !== null){
        windows.push(formatHour(start) + " - " + formatHour(24));
    }

    return windows.length > 0
        ? windows.join("<br>")
        : "No calm periods available.";

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


    setTimeout(() => {

        const calmWindowLength =
            document.getElementById(
                "calmWindowLength"
            );


        if(calmWindowLength){

            calmWindowLength.textContent =

                longestFavorableWindow === 1
                    ? "1 consecutive flat or calm hour"
                    : `${longestFavorableWindow} consecutive flat or calm hours`;

        }

    }, 0);


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

async function getHourlyWeather(
    location,
    selectedDate
){

    try {

        const coords =
            locations[location];


        /*
        First NOAA request:
        locate the appropriate forecast grid.
        */

        const pointResponse =
            await fetch(
                `https://api.weather.gov/points/${coords.lat},${coords.lon}`
            );


        if(!pointResponse.ok){

            throw new Error(
                `NOAA location lookup failed for ${location}`
            );

        }


        const pointData =
            await pointResponse.json();


        const hourlyURL =
            pointData.properties.forecastHourly;

        const gridDataURL =
            pointData.properties.forecastGridData;


        /*
        Retrieve normal hourly weather and
        raw marine grid data simultaneously.
        */

        const hourlyResponse =
    await fetch(hourlyURL);


if(!hourlyResponse.ok){

    throw new Error(
        `NOAA hourly forecast failed for ${location}`
    );

}


const hourlyData =
    await hourlyResponse.json();


let waveValues = [];
let gustValues = [];


try {

    const gridResponse =
        await fetch(gridDataURL);


    if(!gridResponse.ok){

        throw new Error(
            `NOAA grid forecast failed for ${location}`
        );

    }


    const gridData =
        await gridResponse.json();


   waveValues =
    gridData
        .properties
        .waveHeight
        ?.values || [];

gustValues =
    gridData
        .properties
        .windGust
        ?.values || [];

}
catch(error){

    console.warn(
        `Wave data unavailable for ${location}:`,
        error
    );

    waveValues = [];
    gustValues = [];

}


        console.log(
            `${location} NOAA wave values:`,
            waveValues
        );


        const hourlyForecast =
            new Array(24).fill(null);


        hourlyData
            .properties
            .periods
            .forEach(period => {

                /*
                Read NOAA's date and hour directly
                from the timestamp string.

                This preserves the local date and
                avoids browser timezone shifting.
                */

                const periodDate =
                    period.startTime.slice(0,10);


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

                    precip:
                        period
                            .probabilityOfPrecipitation
                            .value ?? 0,

                    windDirection:
                        period.windDirection,

                    temperature:
                        period.temperature,

                    shortForecast:
                        period.shortForecast,

                    startTime:
                        period.startTime,

                    endTime:
                        period.endTime,

                    alerts:[]

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




function getDecisionSummary(result, timeline){

    const validHours =
        Array.isArray(timeline)
            ? timeline.filter(status =>
                status === "FLAT" ||
                status === "CALM" ||
                status === "SPORTY" ||
                status === "POOR"
            )
            : [];


    const flatHours =
        validHours.filter(
            status => status === "FLAT"
        ).length;


    const calmHours =
        validHours.filter(
            status => status === "CALM"
        ).length;


    const sportyHours =
        validHours.filter(
            status => status === "SPORTY"
        ).length;


    const poorHours =
        validHours.filter(
            status => status === "POOR"
        ).length;


    /*
    Flat and Calm are both favorable
    boating conditions.
    */

    const favorableHours =
        flatHours + calmHours;


    const favorableText =
        favorableHours === 1
            ? "1 favorable boating hour"
            : `${favorableHours} favorable boating hours`;


    switch(result){

        case "GO":

            return (
                `${favorableText} are available, ` +
                "with little or no poor weather expected."
            );


        case "MAYBE":

            return (
                `${favorableText} are available, ` +
                `but the day also includes ` +
                `${sportyHours} sporty and ` +
                `${poorHours} poor ` +
                `${poorHours === 1 ? "hour" : "hours"}.`
            );


        case "LIMITED WINDOW":

            return (
                `${favorableText} are available, ` +
                "but poor conditions affect much of the remaining day."
            );


        case "DON'T GO":

            return (
                `${favorableText} are available, ` +
                "but there is no meaningful continuous favorable window."
            );


        default:

            return "Forecast conditions are unavailable.";

    }

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


function backgroundClass(result){

    switch(result){
        case "GO": return "goodBackground";
        case "MAYBE": return "sportyBackground";
        case "LIMITED WINDOW": return "limitedBackground";
        case "DON'T GO": return "noGoBackground";
        default: return "";
    }

}
