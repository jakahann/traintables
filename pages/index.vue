<template>
  <div class="container">
    <p><b>Hae aseman nimellä</b></p>

    <!-- Searchbox/dropdown -->
    <div class="search">
    <vue-single-select
        v-on:reset="" 
        placeholder="Hae asema"
        v-model="selected" 
        :options="cities"
        v-on:input="searchStation"
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
    <DataTable :fields="this.way == 'DEPARTURE' ? this.departure : this.arrival" :sortedTable="this.sortedTable">
       {{ getTrains }}
    </DataTable>
    
  </div> 
</template>

<script>
import VueSingleSelect from "vue-single-select";
import DataTable from '~/components/DataTable'

export default {
   components: {
     VueSingleSelect,
     DataTable
  },
  
  data() {
    return {
      selected: '',
      arrival: [
        { key: "train", label: "Juna" },
        { key: "from" , label: "Lähtöasema"},
        { key: "to", label: "Pääteasema" },
        { key: 'arrives', label: 'Saapuu'}
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
   // sorted list of tableData
  sortedTable: function() {
    function compare(a, b) {
      if (a.time < b.time)
        return -1;
      if (a.time > b.time)
        return 1;
      return 0;
    }
    return this.tableData.sort(compare);
},

    //API call path depending of the way
    traffic: function() {
      if (this.way == "ARRIVAL") return process.env.ARRIVAL;
      else return process.env.DEPARTURE;
    },

    //Search the selected station from list of stations
    //if found stations short code to this.station
    searchStation: function(){
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
            if (this.isPassangerTrain(train.trainCategory)) passangerTrains.push(train);
        });
         this.fillTable(passangerTrains)
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
      this.toggleButton(this.way);
    },

    //Changes which button is active (visual styling)
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

    //Returns city associated to given short code
    getCityName(ourCode) {
      for (let key in this.allStations) {
        if (ourCode == this.allStations[key]) return key;
      }
    },

    //Checks if train is a passanger train (Long-distance or commuter)
    isPassangerTrain(trainCategory) {
     if (['Long-distance', 'Commuter'].indexOf(trainCategory) >= 0) return true 
    },

    //Returns train name 
    getTrainName(train) {
      if (train.trainCategory == 'Commuter') return 'Commuter train ' + train.commuterLineID
      else return train.trainType + " " + train.trainNumber
    },

     //Returns at what time train should arrive or leave the station
    getScheduledTime(train) {
      for (let stop of train.timeTableRows) {
          if (stop.stationShortCode == this.station && stop.type == this.way) {
            return stop.scheduledTime
          }
        }
    },

  //Checks which variant for cell: cancelled -> customized danger else no variant
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
    
    //Fill the array with the train info shown to user
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

.nav  {
  color: green;
  cursor: pointer;
}
</style>