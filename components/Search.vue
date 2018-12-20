<!-- Component to show the search  -->
<template>
  <div class="search">
    <vue-single-select
      :placeholder="placeholder"
      v-model="value"
      :options="options"
      v-on:input="inputFunction"
      :maxResults="options.length"
    ></vue-single-select>
  </div>
</template>

<script>
import VueSingleSelect from "vue-single-select";
export default {
  components: {
    VueSingleSelect
  },
  //Props are fields that the component take when it's called (compare to parameters)
  name: "Search",
  props: {
    placeholder: {
      type: String,
      default: "Hae asema"
    },
    options: {
      type: Array,
      required: true
    },
    inputFunction: {
      type: Function
    }
  },

  computed: {
    value: {
      get: function() {
        return this.selected;
      },
      set: function(newVal) {
        let selected = newVal;
      }
    }
  },

  methods: {}
};
</script>

<style>
</style>