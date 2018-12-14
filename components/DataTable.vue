<!-- Component to show the stations data on table  -->
<template>
<div>

  <b-table
      class="table"
      striped
      hover
      :items="sortedTable"
      :fields="fields">

     <!-- template to handle the last cell  -->
      <template class="info" :slot='this.lastCell' slot-scope="data">
      <p v-if="isLate(data.item.difference)" class="late">{{calcTime(data.item.time, data.item.difference)}}</p>

      <div> 
          <p v-if="isLate(data.item.difference)" class="oldtime">({{parseTime(data.item.time)}})</p>
          <p v-else>{{parseTime(data.item.time)}}</p>
      </div> 

      <p  v-if="data.item.cancelled == true" class="cancelled">Cancelled</p>
    </template> 
   </b-table> 

</div>
</template>

<script>
import moment from "moment";

export default {
  //Props are fields that the component take when it's called (compare to parameters)
  name: 'DataTable',
  props: {
    fields: {
      type:Array,
      required: true
    },
    sortedTable: {
      type: Array,
      required: true
    },
  },

  computed: {
    //how the last cell in a row is named and handled(can be 'arrives' or 'departs')
    lastCell: function() {
      return this.fields[3].key
    }
  },

  methods: {
    //Simple check if the train is behind schedule
    isLate(difference) {
      if (difference > 0) return true
    },

    //Parse UTC time to local time and return in HH:mm (14:30) format
    parseTime(time) {
      return moment(time).format("HH:mm")
    },

    //Calculates new time for a late train by adding the differenceInMinutes to scheduled time
    calcTime(sched, diff) {
      let newTime = moment(sched).add(diff, "minutes")
      return newTime.format("HH:mm")
    },
  },
}
</script>

<style>
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

.table th {
  border-top: 0px;
}

.table-danger td {
  color: grey;
  background-color: lightgray;
}

.late, .cancelled {
  color: red;
}

.oldtime {
  color: grey;
  font-size: 0.8em;
}

</style>