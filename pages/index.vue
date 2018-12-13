<template>
  <div class="container">
    <p>
      <b>Hae aseman nimellä</b>
    </p>
 <!-- Hakulaatikko, autocomplete -->
<div class="search">
 <vue-single-select
    placeholder="Hae asema"
    v-model="chosen" 
    :options="cities"
    v-on:input="searchStation"
></vue-single-select> 
</div>
    <!-- valinta napit, bootstrap nav-tabs -->
    <div>
      <ul class="nav nav-tabs">
        <li class="nav-item">
          <a class="nav-link active" id="arr" v-on:click="buttonFunction" value="ARRIVAL">Saapuvat</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" id="dep" v-on:click="buttonFunction" value="DEPARTURE">Lähtevät</a>
        </li>
        </ul>
    </div>

    <!-- aikatauludata: lähtevät tai saapuvat  -->
    <!-- riittää yksi haku -> käsittely alla riippuen onko saapuva vai lähtevä  -->
    {{ getTrains }}

    <b-table
      class="table"
      v-if="way == 'ARRIVAL'"
      striped
      hover
      :items="sortedTable"
      :fields="arrival">
      
    <template class="info" slot="arrives" slot-scope="data">
          <p class="late" id="late"  v-if="isLate(data.item.difference)"> {{ calcTime(data.item.time, data.item.difference) }}</p>
          <div id="time"> 
            <p style="font-size: 0.9em;" v-if="isLate(data.item.difference)">({{parseTime(data.item.time)}})</p>
            <p v-else>  {{ parseTime(data.item.time)}}</p>
              </div> 
          <p class="cancelled" id="cancelled" style="color: red;" v-if="data.item.cancelled == true">Cancelled</p>
    </template>
    </b-table>
    <!-- Ylläolevan toisto -> saako yhdeksi? -->
    <b-table
      class="table"
      v-else
      striped
      hover
      :items="sortedTable"
      :fields="departure">
      
      <template slot="departs" slot-scope="data">
            <p class="late" id="late"  v-if="isLate(data.item.difference)"> {{ calcTime(data.item.time, data.item.difference) }}</p>
          <div id="time"> 
            <p style="font-size: 0.9em;" v-if="isLate(data.item.difference)">({{parseTime(data.item.time)}})</p>
            <p v-else>  {{ parseTime(data.item.time)}}</p>
              </div> 
          <p class="cancelled" id="cancelled" style="color: red;" v-if="data.item.cancelled == true">Cancelled</p>
    </template>
    </b-table>
  </div>
</template>

<script>
import VueSingleSelect from "vue-single-select";

import moment from "moment";

export default {
   components: {
     VueSingleSelect
       
     
   },
  data() {
    return {
      chosen: '',
      arrival: [
        { key: "train", label: "Juna" },
        { key: "from" , label: "Lähtöasema"},
        { key: "to", label: "Pääteasema" },
        { key: 'arrives', label: 'Saapuu' }
      ],
      departure: [
        { key: "train", label: "Juna" },
        { key: "from" , label: "Lähtöasema"},
        { key: "to", label: "Pääteasema" },
        { key: 'departs', label: 'Lähtee' }

      ],
      station: "no data",
      allStations: new Object(),
      tableData: [],
      cities: [],
      way: "ARRIVAL"
    };
  },
  
  computed: {
  
  // Järjestetty lista aikatauluista
  sortedTable: function() {
    function compare(a, b) {
      if (a.time < b.time)
        return -1;
      if (a.time > b.time)
        return 1;
      return 0;
    }
    let a = this.tableData.sort(compare)
    console.log(a)
    return this.tableData.sort(compare);
},
    //Suunnan mukaisen liikenteen API-kutsu
    traffic: function() {
      if (this.way == "ARRIVAL") return process.env.ARRIVAL;
      else return process.env.DEPARTURE;

    },
    //Etsii haku vastaavan aseman
    searchStation: function(){
      console.log(this.chosen)
      let code = this.allStations[this.chosen];
      if (code == undefined) {
        this.station = "no data";
      }
      if (code != undefined) {
        this.station = code;
      }
    },
    // Retrieves data from API and populate arrays
    getTrains: function() {
      this.$axios
        .get(process.env.baseUrl + this.station + this.traffic)
        .then(resp => {
          let passangerTrains = [];
          resp.data.forEach(train => {
            if (this.isPassangerTrain(train.trainCategory)) passangerTrains.push(train);
        });
         this.fillTable(passangerTrains)
        })
        .catch(err => console.log(err));
    }
  },

  methods: {
    isLate(difference) {
      if (difference > 0) {
        return true
    }
      

    },
    //Parse UTC time to local time in HH:mm format
    parseTime(time) {
      let localTime = moment(time).format("HH:mm")
      return localTime
    },
    //Calculates new time by adding minutes
     calcTime(sched, diff) {
      let newTime = moment(sched).add(diff, "minutes")
      return newTime.format("HH:mm")
    },
    //Returns list of suggestions for search
      simpleSuggestionList() {
        return this.cities
      },
      //
    buttonFunction(event) {
      if (event.target.text == "Lähtevät") this.way = "DEPARTURE";
      else this.way = "ARRIVAL";
      this.toggleButton(this.way);
    },

    //Changes which button is active
    toggleButton(current) {
      let arr = document.getElementById("arr");
      let dep = document.getElementById("dep");
      if (current == "ARRIVAL") {
        arr.classList.add("active");
        dep.classList.remove("active");
      } else {
        arr.classList.remove("active");
        dep.classList.add("active");
      }
    },
    //returns city name based on city code
    getCityName(ourCode) {
      for (let key in this.allStations) {
        if (ourCode == this.allStations[key]) return key;
      }
    },
    //Checks if train is a passanger train
    isPassangerTrain(trainCategory) {
     if (['Long-distance', 'Commuter'].indexOf(trainCategory) >= 0) return true 
    },
    
    //Fill the table with train data
    fillTable(trains) {
      this.tableData = []
      for (let train of trains) {
        let firstStation = train.timeTableRows[0].stationShortCode
        let lastStation = train.timeTableRows[train.timeTableRows.length - 1].stationShortCode
        this.tableData.push({
              train: this.getTrainName(train),
              from: this.getCityName(firstStation),
              to: this.getCityName(lastStation),
              time: this.getScheduledTime(train) ,
              difference: this.getDifference(train),
              cancelled: this.isCancelled(train),
              _rowVariant: this.checkVariant(train)
            });
      }
    },
    getTrainName(train) {
      if (train.trainCategory == 'Commuter') return 'Commuter train ' + train.commuterLineID
      else return train.trainType + " " + train.trainNumber
    },
    //return at what time train should be at searched station OR what time it should leave
    getScheduledTime(train) {
      for (let stop of train.timeTableRows) {
          if (stop.stationShortCode == this.station && stop.type == this.way) {
            return stop.scheduledTime
            
          }
        }
    },
  checkVariant(train) {
        if (this.isCancelled(train)) return 'danger'
        else return ''
      },
    //Get schedule difference in minutes
    getDifference(train) {
      for (let stop of train.timeTableRows) {
          if (stop.stationShortCode == this.station && stop.type == this.way) {
            return stop.differenceInMinutes
            
          }
        }
    },

    //Check if train is cancelled
    isCancelled(train) {
      
      for (let stop of train.timeTableRows) {
          if (stop.stationShortCode == this.station && stop.type == this.way) {
            return stop.cancelled
           }
        }
    },
    
  },

  created() {
    this.$axios
      .get("https://rata.digitraffic.fi/api/v1/metadata/stations")
      .then(stations => {
        for (let station of stations.data) {
          let name = station.stationName.split(" asema")[0];
       if (station.passengerTraffic == true) {
            this.cities.push(name);
            this.allStations[name] = station.stationShortCode;
         }
        }
      });
  }
};
</script>

<style>

.table th {
  border-top: 0px;
}

.controls {
  width: 100%;
}



thead {
  color: lightgray;
}

thead th {
  border-top: 0px;
}


.late {
  color: red;
}

.search {
  max-width: 20%;
  margin-bottom: 50px;
}

.nav  {
  color: green;
}

p {
  margin: 0px;
}

.table-danger td {
  color: grey;
  background-color: lightgray;
}
</style>
