<template>
  <div class="nav-wrapper">
    <div class="nav-container">
      <div class="file-input"> Input Data or Title(Header)</div>
      <div class="nav-list no-scroll">
        <v-expansion-panels accordion hover multiple>
          <v-expansion-panel>
            <v-expansion-panel-header class="pa-2 panel-header">
              Basic Configuration
            </v-expansion-panel-header>
            <v-expansion-panel-content class="panel-option-list no-scroll pa-0">
              <div class="panel-option-item">
                <div class="panel-option-name"> Date Unit </div>
                <div class="panel-option-input-wrapper">
                  <label>
                    <input class="panel-option-input">
                  </label>
                </div>
              </div>
              <div class="panel-option-item">
                <div class="panel-option-name"> Show Max </div>
                <div class="panel-option-input-wrapper">
                  <label>
                    <input class="panel-option-input">
                  </label>
                </div>
              </div>
            </v-expansion-panel-content>
          </v-expansion-panel>
          <v-expansion-panel>
            <v-expansion-panel-header class="pa-2 panel-header">
              Filter Status
            </v-expansion-panel-header>
            <v-expansion-panel-content></v-expansion-panel-content>
          </v-expansion-panel>
          <v-expansion-panel>
            <v-expansion-panel-header class="pa-2 panel-header">
              Sort Status
            </v-expansion-panel-header>
            <v-expansion-panel-content/>
          </v-expansion-panel>
          <v-expansion-panel>
            <v-expansion-panel-header class="pa-2 panel-header">Selected Metrics
            </v-expansion-panel-header>
            <v-expansion-panel-content/>
          </v-expansion-panel>
          <v-expansion-panel>
            <v-expansion-panel-header class="pa-2 panel-header">Metrics Detail
            </v-expansion-panel-header>
            <v-expansion-panel-content class="panel-details">
              <div class="panel-metric-search">
                <div class="panel-metric-search-input-container">
                  <label>
                    <input class="panel-metric-search-input">
                  </label>
                  <div class="panel-search-icon">
                    <font-awesome-icon :icon="['fas', 'search']"/>
                  </div>
                </div>
                <div class="panel-empty"></div>
                <div class="panel-metric-results"> 3 Matched Metrics Found. </div>
              </div>
              <div class="panel-metric-list no-scroll">
                <div class="panel-metric-list-item-wrapper">
                  <div class="panel-metric-list-item"></div>
                </div>
                <div class="panel-metric-list-item-wrapper">
                  <div class="panel-metric-list-item"></div>
                </div>
                <div class="panel-metric-list-item-wrapper">
                  <div class="panel-metric-list-item"></div>
                </div>
              </div>
            </v-expansion-panel-content>
          </v-expansion-panel>
          <v-expansion-panel>
            <v-expansion-panel-header class="pa-2 panel-header border-b">
              Data Results </v-expansion-panel-header>
            <v-expansion-panel-content class="pa-0">
              <v-data-table
                :headers="tableHeaders"
                :items="filteredTableList"
                :items-per-page="9999"
                class="panel-data-table panel-data-list no-scroll"
                :hide-default-footer="true"
              />
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </div>
      <v-btn class="pa-0" block depressed color="#0A3770"
             style="height: 42px;" dark @click="updateView">
        Update View</v-btn>
    </div>
  </div>
</template>

<script src='./Nav.ts'>
</script>

<style lang='sass' scoped>
  @import './Nav.sass'
</style>
