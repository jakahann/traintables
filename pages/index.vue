<template>
  <div class="container">
    <p>
      <b>Hae aseman nimellä</b>
    </p>
 <!-- Hakulaatikko, autocomplete -->
 <vue-simple-suggest
    v-model="chosen"
    :list="simpleSuggestionList"
    v-on:input="stationCode"
    :filter-by-query="true">
  </vue-simple-suggest>

    <!-- valinta napit, bootstrap nav-tabs -->
    <div>
      <ul class="nav nav-tabs">
        <li class="nav-item">
          <a class="nav-link active" id="arr" v-on:click="getButton" value="ARRIVAL">Saapuvat</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" id="dep" v-on:click="getButton" value="DEPARTURE">Lähtevät</a>
        </li>
        </ul>
    </div>

    <!-- aikatauludata: lähtevät tai saapuvat  -->
    <!-- riittää yksi haku -> käsittely alla riippuen onko saapuva vai lähtevä  -->
    {{ getTables }}

    <b-table
      class="table"
      v-if="way == 'ARRIVAL'"
      striped
      hover
      :items="sortedTable"
      :fields="arrival">
      
    <template slot="arrives" slot-scope="data">
          <p class="difference" v-if="data.item.difference >= 0"> ({{ calcTime(data.item.time, data.item.difference) }})</p>
          <p class="scheduleTime">{{ parseTime(data.item.time)  }}</p> <br>
          <p class="cancelled" v-if="data.item.cancelled == true">Cancelled</p>
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
          <p class="difference" v-if="data.item.difference >= 0"> ({{ calcTime(data.item.time, data.item.difference) }})</p>
          <p class="scheduleTime">{{ parseTime(data.item.time)  }}</p> <br>
          <p class="cancelled" v-if="data.item.cancelled == true">Cancelled</p>
    </template>
    </b-table>
  </div>
</template>

<script>
import VueSimpleSuggest from 'vue-simple-suggest'
import moment from "moment";

export default {
   components: {
      VueSimpleSuggest,
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
      station: "",
      stationCodes: new Object(),
      items: [],
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
    return this.items.sort(compare);
},
    //Suunnan mukaisen liikenteen API-kutsu
    traffic: function() {
      if (this.way == "ARRIVAL") return process.env.ARRIVAL;
      else return process.env.DEPARTURE;

    },
    //
    stationCode: function(){
      let a = this.stationCodes[this.chosen.toLowerCase()];
      if (a == undefined) {
        this.station = "";
        this.items = [];
      }
      if (a != undefined) {
        this.station = a;
      }
    },
    getTables: function() {
      this.$axios
        .get(process.env.baseUrl + this.station + this.traffic)
        .then(resp => {
          let passangerTrains = [];
          for (let train of resp.data) {
            if (this.isPassangerTrain(train)) passangerTrains.push(train);
          }
          this.items = [];
          this.fillTable(passangerTrains);
        })
        .catch(err => console.log(err));
    }
  },
  methods: {
    parseTime(time) {
      let localTime = moment(time).format("HH:mm")
      return localTime
    },
     calcTime(sched, diff) {
      let newTime = moment(sched).add(diff, "minutes")
      return newTime.format("HH:mm")
    },
   simpleSuggestionList() {
        return this.cities
      },
    getButton(event) {
      if (event.target.text == "Lähtevät") this.way = "DEPARTURE";
      else this.way = "ARRIVAL";
      this.toggleButton(this.way);
    },

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

    getLong(short) {
      for (let key in this.stationCodes) {
        let long = key;
        let shortCode = this.stationCodes[key];
        if (short == shortCode) return long;
      }
    },
    isPassangerTrain(train) {
      if (
        train != "Shunting" &&
        train != "Cargo" &&
        train != "Locomotive" &&
        train != "On-track machines"
      )
        return true;
    },

    setTime(train) {
      let schedule = NaN
      for (let stop of train.timeTableRows) {
          if (stop.stationShortCode == this.station && stop.type == this.way) {
            schedule = stop.scheduledTime
            return schedule
            
          }
        }
        // return moment(schedule).format("HH:mm")
    },
    getDifference(train) {
      let diff = 0
      for (let stop of train.timeTableRows) {
          if (stop.stationShortCode == this.station && stop.type == this.way) {
            diff = stop.differenceInMinutes
            
          }
        }
        return diff
    },
    isCancelled(train) {
      
      for (let stop of train.timeTableRows) {
          if (stop.stationShortCode == this.station && stop.type == this.way) {
            return stop.cancelled
            
          }
        }
    },
    fillTable(stationData) {
      for (let train of stationData) {
        let tableLen = train.timeTableRows.length;
        
        if (this.isPassangerTrain(train.trainCategory)) {
            this.items.push({
              train: train.trainType + train.trainNumber,
              from: this.getLong(train.timeTableRows[0].stationShortCode),
              to: this.getLong(train.timeTableRows[tableLen - 1].stationShortCode),
              time: this.setTime(train) ,
              difference: this.getDifference(train),
              cancelled: this.isCancelled(train)
            });
        }
      }

    }
  },
  
  created() {
    this.$axios
      .get("https://rata.digitraffic.fi/api/v1/metadata/stations")
      .then(stations => {
        for (let station of stations.data) {
          let nameLower = station.stationName.split(" ")[0].toLowerCase();
          if (station.passengerTraffic == true) {
            this.cities.push(station.stationName.split(" ")[0]);
            this.stationCodes[nameLower] = station.stationShortCode;
          }
        }
      });
  }
};
</script>

<style>
.container {
  margin-left: 20px;
  margin-top: 20px;
  padding: 0;
  
}
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

</style>
