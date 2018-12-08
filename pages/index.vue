<template>
  <div>
    <h1>Aseman junatiedot</h1>
    <input type="text" v-on:input="getShort">
    <hr>
    <p>{{ station }}</p>
    <span>
      <button v-on:click="getButton" value="Lähtee">Lähtevät</button>
      <button v-on:click="getButton" value="Saapuu">Saapuvat</button></span>
    <b-table striped hover :items="items"></b-table>
  </div>
</template>

<script>
import Logo from "~/components/Logo.vue";
const testi = [];

export default {
  data() {
    return {
      station: "Ei asemaa",
      stationCodes: new Object(),
      items: testi,
      suunta: "Lähtee"
    };
  },
  methods: {
    getButton() {},
    getShort(event) {
      let a = this.stationCodes[event.target.value];
      console.log(a);
      if (a == undefined)  {
        this.station = "Ei asemaa"
        this.items = []
      }
      if (a != undefined) {
        this.station = event.target.value
        this.getTraffic(a);
      }
    },
    getLong(short) {
      
      for (let key in this.stationCodes){
        let long = key
        let shortCode = this.stationCodes[key]
        // console.log(long)
        if (short == shortCode) return long
      }
      
    
    },
//https://rata.digitraffic.fi/api/v1/live-trains/station/KOK
//?departing_trains=50&include_nonstopping=false&departed_trains=0&arriving_trains=0&arrived_trains=0
    getTraffic(station) {
      this.$axios
        .get(
          "https://rata.digitraffic.fi/api/v1/live-trains/station/" + station +
          "?departing_trains=50&include_nonstopping=false&departed_trains=0&arriving_trains=0&arrived_trains=0"
        )
        .then(resp => {
          this.items = []
          for (let train of resp.data) {
          
            let tableLen = train.timeTableRows.length
            var deparTime = "NaN";
            console.log("ASEMA: " + station)
            for (let stop of train.timeTableRows) {
              if (stop.stationShortCode == station && stop.type == "DEPARTURE"){
                console.log("apla")
                deparTime = stop.scheduledTime
              }
              
            }
            // console.log("PITUUS: " + tableLen)
            if (train.trainCategory != "Shunting" && train.trainCategory != "Cargo"  && train.trainCategory != "Locomotive") {
            this.items.push({
              Juna: train.trainType + train.trainNumber,
              Lähtöasema: this.getLong(train.timeTableRows[0].stationShortCode),
              Pääteasema: this.getLong(train.timeTableRows[tableLen - 1].stationShortCode),
              Saapuu: deparTime
            });
            }
          }
        })
        .catch(err => console.log(err));
    }
  },
  created() {
    this.$axios
      .get("https://rata.digitraffic.fi/api/v1/metadata/stations")
      .then(stations => {
        for (let station of stations.data) {
          if (station.passengerTraffic == true) {
            this.stationCodes[station.stationName.split(" ")[0]] =
              station.stationShortCode;
          }
        }
      });
  }
};
</script>

<style>
.container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
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
