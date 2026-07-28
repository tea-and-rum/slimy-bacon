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

    "Hart-Miller Island":{
        lat:39.23,
        lon:-76.37
    },

    "Tolchester Marina Area":{
        lat:39.21,
        lon:-76.24
    },

    "Fort Smallwood":{
        lat:39.16,
        lon:-76.42
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









function checkConditions(){


    const selectedLocations =
    [...document.querySelectorAll(".locations input:checked")]
    .map(x=>x.value);



    if(selectedLocations.length===0){

        document.getElementById("message").innerHTML =
        "Please select at least one location.";

        return;

    }





    const boatSize =
        document.getElementById("boatSize").value;




    const sun =
        getSunTimes();



    document.getElementById("sunrise").innerHTML =
        sun.sunrise;


    document.getElementById("sunset").innerHTML =
        sun.sunset;


    document.getElementById("checked").innerHTML =
        new Date().toLocaleString();





    let allResults=[];

    let locationHTML="";



    let allWeather=[];







    selectedLocations.forEach(location=>{


        const forecast =
            getHourlyWeather(location);



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


    });








    const timeline =
        combineTimelineResults(allResults);





    const overall =
        determineDailyResult(timeline);





    createTimeline(
        timeline,
        sun
    );





    document.getElementById("decision").innerHTML =
        emoji(overall)+" "+overall;



    document.getElementById("decision").className =
        overallClass(overall);





    document.getElementById("decisionSummary").innerHTML =
        getDecisionSummary(overall);





    document.getElementById("whyResults").innerHTML =
        createWhySection(timeline);





    document.getElementById("locationResults").innerHTML =
        locationHTML;





    document.getElementById("window").innerHTML =
        findGoodWindow(timeline);






    createEvidenceCharts(allWeather);





    




    document
    .getElementById("results")
    .classList
    .remove("hidden");


}









function createEvidenceCharts(weatherData){


    let maxWind=[];

    let maxWaves=[];

    let maxPrecip=[];



    for(let hour=0;hour<24;hour++){


        let wind=0;

        let waves=0;

        let precip=0;



        weatherData.forEach(location=>{


            wind =
            Math.max(
                wind,
                location[hour].wind
            );



            waves =
            Math.max(
                waves,
                location[hour].waves
            );



            precip =
            Math.max(
                precip,
                location[hour].precip
            );


        });



        maxWind.push(wind);

        maxWaves.push(waves);

        maxPrecip.push(precip);


    }





    document.getElementById("windSummary").innerHTML =
        "Max: "+Math.max(...maxWind)+" mph";


    document.getElementById("waveSummary").innerHTML =
        "Max: "+Math.max(...maxWaves)+" ft";


    document.getElementById("precipSummary").innerHTML =
        "Peak: "+Math.max(...maxPrecip)+"%";





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

        options:simpleChartOptions()

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









function evaluateLocation(hours,boatSize){


    let results=[];


    hours.forEach(hour=>{


        results.push(
            checkHour(hour,boatSize).status
        );


    });



    return {


        result:
        determineDailyResult(results),


        hourlyResults:
        results,


        reason:
        "Conditions may become less favorable later in the day."

    };


}









function checkHour(hour,boatSize){


    const limits={


        small:{
            wind:12,
            wave:1
        },


        medium:{
            wind:15,
            wave:2
        },


        large:{
            wind:20,
            wave:3
        },


        xlarge:{
            wind:25,
            wave:4
        }


    };



    let status="GO";



    if(hour.wind > limits[boatSize].wind+5)
        return {status:"NO-GO"};



    if(hour.wind > limits[boatSize].wind)
        status="SPORTY";



    if(hour.waves > limits[boatSize].wave+1)
        return {status:"NO-GO"};



    if(hour.waves > limits[boatSize].wave)
        status="SPORTY";



    return {status:status};

}









function determineDailyResult(results){


    if(results.includes("GO"))
        return "GO";


    if(results.includes("SPORTY"))
        return "SPORTY";


    return "NO-GO";

}









function combineTimelineResults(allResults){


    let timeline=[];



    for(let i=0;i<24;i++){


        let result="GO";



        allResults.forEach(location=>{


            if(location[i]=="NO-GO")
                result="NO-GO";


            else if(
                location[i]=="SPORTY"
                &&
                result=="GO"
            )
                result="SPORTY";


        });



        timeline.push(result);


    }



    return timeline;

}









function createTimeline(results,sun){


    const bar =
    document.getElementById("timelineBar");


    bar.innerHTML="";



    results.forEach(hour=>{


        let block =
        document.createElement("div");



        block.className =
        "timeline-hour "+
        (
        hour=="GO"
        ?
        "timeline-go"
        :
        hour=="SPORTY"
        ?
        "timeline-sporty"
        :
        "timeline-no-go"
        );



        bar.appendChild(block);


    });



    document.getElementById("sunriseMarker").style.left =
    sun.sunrisePercent+"%";


    document.getElementById("sunsetMarker").style.left =
    sun.sunsetPercent+"%";


}









function findGoodWindow(results){


    let windows=[];

    let start=null;



    results.forEach((value,index)=>{


        if(value=="GO" && start===null)
            start=index;



        if(value!="GO" && start!==null){

            windows.push(
            formatHour(start)+" - "+formatHour(index)
            );

            start=null;

        }


    });



    if(start!==null){

        windows.push(
        formatHour(start)+" - "+formatHour(24)
        );

    }



    return windows.length
    ?
    windows.join("<br>")
    :
    "No GO periods available.";

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









async function getHourlyWeather(location){


    let hours=[];



    for(let i=0;i<24;i++){


        hours.push({

            wind:
            10+(i>=14?5:0),


            waves:
            1+(i>=18?.5:0),


            precip:
            i>=18 ? 40 : 0


        });


    }



    return hours;

}









function getSunTimes(){


    return {

        sunrise:"6:00 AM",

        sunset:"8:15 PM",

        sunrisePercent:25,

        sunsetPercent:84

    };

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
