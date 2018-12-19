<template>
  <div class="container">
    <p>
      <b>Hae aseman nimellä</b>
    </p>

    <!-- Searchbox/dropdown -->
    <div class="search">
      <vue-single-select
        placeholder="Hae asema"
        v-model="selected"
        :options="cities"
        v-on:input="searchStation"
        :maxResults="cities.length"
      ></vue-single-select>
    </div>

    <!-- Navigation tabs  -->
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

    <!-- custom component: shows the actual timetables-->
    <DataTable
      :fields="this.way == 'DEPARTURE' ? this.departure : this.arrival"
      :sortedTable="this.sortedTable"
    >{{ getTrains }}</DataTable>
  </div>
</template>

<script>
import VueSingleSelect from "vue-single-select";
import DataTable from "~/components/DataTable";
const mylib = require("~/modules/mylib.js");
const trainUtils = require("~/modules/trainUtils.js");
export default {
  components: {
    VueSingleSelect,
    DataTable
  },

  data() {
    return {
      selected: "",
      arrival: [
        { key: "train", label: "Juna" },
        { key: "from", label: "Lähtöasema" },
        { key: "to", label: "Pääteasema" },
        { key: "arrives", label: "Saapuu" }
      ],
      departure: [
        { key: "train", label: "Juna" },
        { key: "from", label: "Lähtöasema" },
        { key: "to", label: "Pääteasema" },
        { key: "departs", label: "Lähtee" }
      ],
      station: "no data",
      allStations: new Object(),
      tableData: [],
      cities: [],
      way: "ARRIVAL"
    };
  },

  computed: {
    // sorted list of tableData
    sortedTable: function() {
      return this.tableData.sort(mylib.compare);
    },

    //API call path depending of the way
    traffic: function() {
      if (this.way == "ARRIVAL") return process.env.ARRIVAL;
      else return process.env.DEPARTURE;
    },

    //Search the selected station from list of stations
    searchStation: function() {
      let code = this.allStations[this.selected];
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
            if (mylib.isPassengerTrain(train.trainCategory))
              passangerTrains.push(train);
          });
          this.fillTable(passangerTrains);
        })
        .catch(err => console.log(err));
    }
  },

  methods: {
    //Changes this.way according to which button is pressed
    //calls toggle for style handling
    buttonFunction(event) {
      if (event.target.text == "Lähtevät") this.way = "DEPARTURE";
      else this.way = "ARRIVAL";
      mylib.toggleButton(this.way);
    },

    //Fill the array with the train info shown to user
    fillTable(trains) {
      this.tableData = [];
      for (let train of trains) {
        let firstStation = train.timeTableRows[0].stationShortCode;
        let lastStation =
          train.timeTableRows[train.timeTableRows.length - 1].stationShortCode;

        this.tableData.push({
          train: trainUtils.getTrainName(train),
          from: trainUtils.getCityName(firstStation, this.allStations),
          to: trainUtils.getCityName(lastStation, this.allStations),
          time: trainUtils.getScheduledTime(train, this.station, this.way),
          difference: trainUtils.getDifference(train),
          cancelled: trainUtils.isCancelled(train, this.station, this.way),
          _rowVariant: trainUtils.checkVariant(train)
        });
      }
    }
  },

  //Lifecycle hook collects metadata when site created
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
.search {
  min-width: 20%;
  max-width: 35%;
  margin-bottom: 50px;
}

.nav {
  color: green;
  cursor: pointer;
}

@media screen and (max-width: 500px) {
  .search {
    min-width: 80%;
  }
}
</style>