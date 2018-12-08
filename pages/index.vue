<template>
  <div>
    <h1>Aseman junatiedot</h1>
    <input type="text" v-on:input="getShort">
    <hr>
    <p>{{ station }}</p>
    <b-table striped hover :items="items"></b-table>
  </div>
</template>

<script>
import Logo from "~/components/Logo.vue";
const testi = [{ Juna: "", Lähtöasema: "", Pääteasema: "", Saapuu: "" }];

export default {
  data() {
    return {
      station: "Ei asemaa",
      stationCodes: new Object(),
      items: testi
    };
  },
  methods: {
    getShort(event) {
      let a = this.stationCodes[event.target.value];
      console.log(a);
      if (a == undefined) this.station = "Ei asemaa"
      if (a != undefined) {
        this.station = event.target.value
        this.getTraffic(a);
      }
    },
    getLong(short) {
      
      for (let key in this.stationCodes){
        let long = key
        let shortCode = this.stationCodes[key]
        console.log(long)
        if (short == shortCode) return long
      }
      
    
    },

    getTraffic(station) {
      this.$axios
        .get(
          "https://rata.digitraffic.fi/api/v1/live-trains/station/" + station
        )
        .then(resp => {
          console.log(resp.data);
          for (let train of resp.data) {
            // console.log(train.trainType)
            let tableLen = train.timeTableRows.length
            // console.log("PITUUS: " + tableLen)
            this.items.push({
              Juna: train.trainType + train.trainNumber,
              Lähtöasema: this.getLong(train.timeTableRows[0].stationShortCode),
              Pääteasema: this.getLong(train.timeTableRows[tableLen - 1].stationShortCode),
              Saapuu: ""
            });
          }
          this.getLong("KOK")
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
