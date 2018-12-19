<template>
  <div>
    <div class="header shadow">
      <p>Aseman junatiedot</p>
    </div>
    <nuxt/>
    <div>
      <b-btn class="footer" v-b-modal.modal1>Lisenssi</b-btn>

      <!-- Modal Component -->
      <b-modal id="modal1" :ok-only="true" title="Lisenssi">
        <p class="my-1">
          Palvelun data on liikenneviraston
          <a
            href="https://rata.digitraffic.fi"
            target="_blank"
          >Digi-traffic palvelusta</a>.
          Rajapinta on lisenssioitu
          <a
            href="http://creativecommons.org/licenses/by/4.0/"
            target="_blank"
          >CC 4.0 BY</a> -lisenssillä
        </p>
      </b-modal>
    </div>
  </div>
</template>


<style>
.header {
  background-color: #56a319;
  width: 100%;
  height: 60px;
  color: white;
  font-size: 1.5em;
}

.header p {
  padding-top: 10px;
  padding-left: 25px;
}
.container {
  margin-left: 10px;
  margin-top: 50px;
}

.footer {
  background-color: gray;
  position: fixed;
  bottom: 0;
  right: 0;
}

@media screen and (max-width: 500px) {
  .container {
    margin-left: 2px;
  }
}
</style>
