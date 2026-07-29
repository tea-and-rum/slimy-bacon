// Chesapeake Bay Boating Conditions
// Version 1.9.2


let windChart;
let waveChart;
let precipChart;

const locations = {

    "Gunpowder River / Mariner Point":{
        lat:39.42,
        lon:-76.33
    },

    "Tolchester Marina Area":{
        lat:39.21,
        lon:-76.24
    },

    "Hart-Miller Island":{
    lat:39.2512,
    lon:-76.3769
},

"Fort Smallwood":{
    lat:39.1634,
    lon:-76.4800
},

    "Bay Bridge":{
        lat:38.99,
        lon:-76.53
    },

    "Annapolis":{
        lat:38.97,
        lon:-76.49
    },

    "Kent Narrows":{
        lat:38.96,
        lon:-76.24
    },

    "Poplar Island":{
        lat:38.76,
        lon:-76.38
    }

};

window.onload = function(){

    setToday();

    setupVesselCards();

};







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

        let locationHTML = "";


        for(const location of selectedLocations){

            const forecast =
                await getHourlyWeather(
                    location,
                    selectedDate
                );


            const hasForecastData =
                Array.isArray(forecast) &&
                forecast.some(hour => hour !== null);


            if(!hasForecastData){

                document.getElementById("message").innerHTML =
                    `Weather data is unavailable for ${location} on the selected date.`;

                return;

            }


            allWeather.push(forecast);


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
                value === "GO" ||
                value === "SPORTY" ||
                value === "NO-GO"
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
            getDecisionSummary(overall);


        document.getElementById("whyResults").innerHTML =
            createWhySection(validTimeline);


        document.getElementById("locationResults").innerHTML =
            locationHTML;


        document.getElementById("window").innerHTML =
            findGoodWindow(timeline);


        createEvidenceCharts(allWeather);


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








function createEvidenceCharts(weatherData){

    const maxWind = [];
    const maxWaves = [];
    const maxPrecip = [];


    for(let hour = 0; hour < 24; hour++){

        let windValues = [];
        let waveValues = [];
        let precipValues = [];


        weatherData.forEach(location => {

            const hourData =
                location[hour];


            if(!hourData){

                return;

            }


            windValues.push(
                hourData.wind ?? 0
            );


            waveValues.push(
                hourData.waves ?? 0
            );


            precipValues.push(
                hourData.precip ?? 0
            );

        });


        maxWind.push(
            windValues.length
                ? Math.max(...windValues)
                : null
        );


        maxWaves.push(
            waveValues.length
                ? Math.max(...waveValues)
                : null
        );


        maxPrecip.push(
            precipValues.length
                ? Math.max(...precipValues)
                : null
        );

    }


    const validWind =
        maxWind.filter(
            value => value !== null
        );


    const validWaves =
        maxWaves.filter(
            value => value !== null
        );


    const validPrecip =
        maxPrecip.filter(
            value => value !== null
        );


    document.getElementById("windSummary").innerHTML =
        validWind.length
            ? "Max: " + Math.max(...validWind) + " mph"
            : "No data available";


    document.getElementById("waveSummary").innerHTML =
        validWaves.length
            ? "Max: " + Math.max(...validWaves) + " ft"
            : "No data available";


    document.getElementById("precipSummary").innerHTML =
        validPrecip.length
            ? "Peak: " + Math.max(...validPrecip) + "%"
            : "No data available";


    createWindChart(maxWind);

    createWaveChart(maxWaves);

    createPrecipChart(maxPrecip);


    document.getElementById("advisoryText").innerHTML =
        "No active advisories";

}







function createWindChart(data){


    if(windChart)
        windChart.destroy();



    windChart =
    new Chart(
        document.getElementById("windChart"),
        {

        type:"line",

        data:{

            labels:hourLabels(),

            datasets:[{

                data:data,

                tension:.3,

                fill:false

            }]

        },

        options:simpleChartOptions()

        });


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
                ? "Conditions may become less favorable later in the day."
                : "No forecast hours are currently available for the selected date."

    };

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


    const limits = thresholds[boatSize];


    if(!limits){

        console.error("Unknown vessel size:", boatSize);

        return {
            status: "NO-GO"
        };

    }


    const wind = Number(hour.wind) || 0;
    const waves = Number(hour.waves) || 0;
    const precip = Number(hour.precip) || 0;


    /*
    NO-GO takes priority.
    If any one condition is unsafe, the hour is red.
    */

    if(
        wind >= limits.wind.noGo ||
        waves >= limits.waves.noGo ||
        precip >= 61
    ){

        return {
            status: "NO-GO"
        };

    }


    /*
    SPORTY is used when at least one condition
    falls in the sporty range.
    */

    if(
        wind >= limits.wind.sporty ||
        waves >= limits.waves.sporty ||
        precip >= 31
    ){

        return {
            status: "SPORTY"
        };

    }


    /*
    Everything else is GO.
    */

    return {
        status: "GO"
    };

}









function determineDailyResult(results){


    if(results.includes("GO"))
        return "GO";


    if(results.includes("SPORTY"))
        return "SPORTY";


    return "NO-GO";

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


        if(validValues.includes("NO-GO")){

            timeline.push("NO-GO");

            continue;

        }


        if(validValues.includes("SPORTY")){

            timeline.push("SPORTY");

            continue;

        }


        timeline.push("GO");

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


        if(hour === "GO"){

            block.classList.add(
                "timeline-go"
            );

        }
        else if(hour === "SPORTY"){

            block.classList.add(
                "timeline-sporty"
            );

        }
        else if(hour === "NO-GO"){

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

        const isGo =
            value === "GO";


        if(isGo && start === null){

            start = index;

        }


        if(!isGo && start !== null){

            windows.push(
                formatHour(start) +
                " - " +
                formatHour(index)
            );

            start = null;

        }

    });


    if(start !== null){

        windows.push(
            formatHour(start) +
            " - " +
            formatHour(24)
        );

    }


    return windows.length > 0
        ? windows.join("<br>")
        : "No GO periods available.";

}








function createWhySection(results){


    let html="";



    if(results.includes("GO"))

        html+=`
        <div class="why-item">
        ✓ At least one favorable boating window exists.
        </div>`;



    if(results.includes("SPORTY"))

        html+=`
        <div class="why-item">
        ⚠ Some periods may have increased wind or waves.
        </div>`;



    if(results.includes("NO-GO"))

        html+=`
        <div class="why-item">
        ⚠ Some periods exceed comfortable boating conditions.
        </div>`;



    return html;

}









async function getHourlyWeather(location, selectedDate){

    try {

        const coords =
            locations[location];


        const pointResponse =
            await fetch(
                `https://api.weather.gov/points/${coords.lat},${coords.lon}`
            );


        if(!pointResponse.ok){

            throw new Error(
                "NOAA location lookup failed"
            );

        }


        const pointData =
            await pointResponse.json();


        const hourlyResponse =
            await fetch(
                pointData.properties.forecastHourly
            );


        if(!hourlyResponse.ok){

            throw new Error(
                "NOAA forecast lookup failed"
            );

        }


        const hourlyData =
            await hourlyResponse.json();


        const hourlyForecast =
            new Array(24).fill(null);


        const now =
            new Date();


        const today = [
            now.getFullYear(),
            String(now.getMonth() + 1).padStart(2, "0"),
            String(now.getDate()).padStart(2, "0")
        ].join("-");


        const isToday =
            selectedDate === today;


        const currentHour =
            now.getHours();


        hourlyData.properties.periods.forEach(period => {

            /*
            NOAA provides a timestamp similar to:

            2026-07-28T20:00:00-04:00

            Read the date and hour directly from that string
            so the browser does not shift it into another day
            or hour during timezone conversion.
            */

            const timestampMatch =
                period.startTime.match(
                    /^(\d{4}-\d{2}-\d{2})T(\d{2}):/
                );


            if(!timestampMatch){

                return;

            }


            const periodDate =
                timestampMatch[1];


            const hour =
                Number(timestampMatch[2]);


            if(periodDate !== selectedDate){

                return;

            }


            /*
            When today is selected, ignore hours that
            have already passed.
            */

            if(isToday && hour < currentHour){

                return;

            }


            const precipitation =
                period.probabilityOfPrecipitation?.value;


            hourlyForecast[hour] = {

                wind:
                    parseInt(
                        period.windSpeed,
                        10
                    ) || 0,

                waves:
                    1,

                precip:
                    precipitation ?? 0,

                windDirection:
                    period.windDirection || "",

                temperature:
                    period.temperature ?? null,

                shortForecast:
                    period.shortForecast || "",

                startTime:
                    period.startTime

            };

        });


        return hourlyForecast;

    }

    catch(error){

        console.error(
            "Hourly weather error:",
            error
        );

        return null;

    }

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




function getDecisionSummary(result){


    if(result=="GO")
        return "Good boating conditions are available during part of the day.";


    if(result=="SPORTY")
        return "Boating is possible, but expect less comfortable conditions.";


    return "Conditions are unfavorable throughout the day.";

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

    return result=="GO"
    ?
    "🟢"
    :
    result=="SPORTY"
    ?
    "🟡"
    :
    "🔴";

}









function overallClass(result){

    return result=="GO"
    ?
    "good"
    :
    result=="SPORTY"
    ?
    "sporty"
    :
    "no-go";

}









function backgroundClass(result){

    return result=="GO"
    ?
    "goodBackground"
    :
    result=="SPORTY"
    ?
    "sportyBackground"
    :
    "noGoBackground";

}
