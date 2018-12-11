<template>
  <div class="container">
    <p>
      <b>Hae aseman nimellä</b>
    </p>
    <input type="text" v-on:input="getShort">
    <br>
    <div>
      <ul class="nav nav-tabs">
        <li class="nav-item">
          <a class="nav-link active" id="arr" v-on:click="getButton" value="ARRIVAL">Saapuvat</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" id="dep" v-on:click="getButton" value="DEPARTURE">Lähtevät</a>
        </li>
      </ul>
      <!-- <div class="controls">
      <button id="arr" class="button--grey active"  v-on:click="getButton" value="ARRIVAL">Saapuvat</button>
      <button id="dep" class="button--grey" v-on:click="getButton" value="DEPARTURE">Lähtevät</button>

      </div>-->
      <p>{{ getTables }}</p>
    </div>
    <b-table
      class="table"
      v-if="way == 'ARRIVAL'"
      striped
      hover
      :items="items"
      :fields="arrival"
      :sort-by.sync="sortArr"
      :sort-desc.sync="sortDesc"
    ></b-table>
    <b-table
      class="table"
      v-else
      striped
      hover
      :items="items"
      :fields="departure"
      :sort-by.sync="sortDep"
      :sort-desc.sync="sortDesc"
    ></b-table>
  </div>
</template>

<script>
import Logo from "~/components/Logo.vue";
import moment from "moment";
export default {
  data() {
    return {
      sortArr: "Saapuu",
      sortDep: "Lähtee",
      sortDesc: false,
      arrival: [
        { key: "Juna" },
        { key: "Lähtöasema" },
        { key: "Pääteasema" },
        { key: "Saapuu" }
      ],
      departure: [
        { key: "Juna" },
        { key: "Lähtöasema" },
        { key: "Pääteasema" },
        { key: "Lähtee" }
      ],
      station: "Ei asemaa",
      stationCodes: new Object(),
      items: [],
      testi: true,
      way: this.getButton ? "ARRIVAL" : "DEPARTURE",
      table: null
    };
  },
  computed: {
    traffic: function() {
      if (this.way == "ARRIVAL") return process.env.TESTING;
      else return process.env.TESTING;
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
          this.fillTable(this.station, passangerTrains, this.way);
          console.log(this.items);
        })
        .catch(err => console.log(err));
    }
  },
  methods: {
    getButton(event) {
    if (event.target.text == 'Lähtevät') this.way = "DEPARTURE"
    else this.way = "ARRIVAL"      
    console.log(this.way)
    this.toggleButton(this.way)
    },
    toggleButton(current) {
      
      let arr = document.getElementById("arr");
      let dep = document.getElementById("dep");
      if (current == 'ARRIVAL') {
        arr.classList.add("active");
        dep.classList.remove("active");
       } else {
        arr.classList.remove("active");
        dep.classList.add("active");
       }
    },

    getShort(event) {
      let a = this.stationCodes[event.target.value.toLowerCase()];
      if (a == undefined) {
        this.station = "Ei asemaa";
        this.items = [];
      }
      if (a != undefined) {
        this.station = a;
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

    setTime(schedule) {
      let sched = moment(schedule).format("HH:mm");
      return sched;
    },
    fillTable(station, stationData, way) {
      for (let train of stationData) {
        let tableLen = train.timeTableRows.length;
        var time = "NaN";
        for (let stop of train.timeTableRows) {
          if (stop.stationShortCode == station && stop.type == way) {
            time = this.setTime(stop.scheduledTime);
          }
        }
        if (this.isPassangerTrain(train.trainCategory)) {
          console.log(train);
          if (this.way == "ARRIVAL") {
            this.items.push({
              Juna: train.trainType + train.trainNumber,
              Lähtöasema: this.getLong(train.timeTableRows[0].stationShortCode),
              Pääteasema: this.getLong(
                train.timeTableRows[tableLen - 1].stationShortCode
              ),
              Saapuu: time
            });
          } else {
            this.items.push({
              Juna: train.trainType + train.trainNumber,
              Lähtöasema: this.getLong(train.timeTableRows[0].stationShortCode),
              Pääteasema: this.getLong(
                train.timeTableRows[tableLen - 1].stationShortCode
              ),
              Lähtee: time
            });
          }
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
  /* min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  margin-left: 20px; */
}
.table th {
  border-top: 0px;
}

.controls {
  width: 100%;
}

.controls .button--grey {
  width: 10%;
  margin-top: 50px;
}

/* .controls .button--grey {
  display: inline-block;
  background-color: none;
  border: 0;
  border-top: 1px solid gray;
  border-left: 1px solid gray;
  border-right: 1px solid gray;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
} */

/* .controls .active {
  color: #56a319;
  border: 0px;
  border-bottom: 1px solid gray;
}
.controls:after {
  content: "";
  width: 70%;
  vertical-align: bottom;
  display: inline-block;
  border-bottom: 1px solid gray;
} */

thead {
  color: lightgray;
}

thead th {
  border-top: 0px;
}

.title {
  font-family: "Quicksand", "Source Sans Pro", -apple-system, BlinkMacSystemFont,
    "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  display: block;
  font-weight: 300;
  font-size: 100px;
  color: #35495e;
  letter-spacing: 1px;
}

.subtitle {
  font-weight: 300;
  font-size: 42px;
  color: #526488;
  word-spacing: 5px;
  padding-bottom: 15px;
}

.links {
  padding-top: 15px;
}
</style>
