<template>
<div>
  <b-table
      class="table"
      striped
      hover
      :items="sortedTable"
      :fields="fields">

     <!-- template to handle the last cell  -->
     <template class="info" :slot='this.testi' slot-scope="data">
      <p class="late" v-if="isLate(data.item.difference)">{{calcTime(data.item.time, data.item.difference)}}</p>
      <div> 
        <p v-if="isLate(data.item.difference)" class="oldtime">({{parseTime(data.item.time)}})</p>
        <p v-else>{{parseTime(data.item.time)}}</p>
      </div> 
      <p style="color: red;" v-if="data.item.cancelled == true">Cancelled</p>
    </template> 
   </b-table> 
         </div>

</template>

<script>
import moment from "moment";

export default {
  
  name: 'DataTable',
  props: {
    fields: {
      type:Array,
    },
    sortedTable: {
      type: Array
    },
    last: {
      type:String
    }
  },

  computed: {
    testi: function() {
      return this.fields[3].key
    }
  },
  methods: { 
    
    isLate(difference) {
      if (difference > 0) return true
       
    },
    //Parse UTC time to local time and return in HH:mm (14:30) format
    parseTime(time) {
      return moment(time).format("HH:mm")
    },

      //Calculates new time for a late train by adding the difference to scheduled time
    calcTime(sched, diff) {
      let newTime = moment(sched).add(diff, "minutes")
      return newTime.format("HH:mm")
    },
  },
  updated() {
    
  }
}
</script>

<style>

p {
  margin: 0px;
}

.late {
  color: red;
}
.oldtime {
  color: grey;
  font-size: 0.8em;
}
.table th {
  border-top: 0px;
}

thead {
  color: lightgray;
}

thead th {
  border-top: 0px;
}

.table-danger td {
  color: grey;
  background-color: lightgray;
}

p {
  margin: 0px;
}

.table-danger td {
  color: grey;
  background-color: lightgray;
}

</style>