
<template>
  <div class="subDisplay-container">
    <div class="subDisplay-text-container">
      <div class="subDisplay-text-item">
        <div class="subDisplay-text-detail"> {{textDetail[0].name}}</div>
        <div class="subDisplay-text-detail"> {{ textDetail[0].time }}</div>
        <div class="subDisplay-text-detail"> {{ textDetail[0].avgScore }}</div>
      </div>
      <div class="subDisplay-empty"></div>
      <div class="subDisplay-text-item">
        <div class="subDisplay-text-detail"> {{ textDetail[1].name }}</div>
        <div class="subDisplay-text-detail"> {{ textDetail[1].time }}</div>
        <div class="subDisplay-text-detail"> {{ textDetail[1].avgScore }}</div>
      </div>
    </div>
    <div class="subDisplay-controller-container">
<!--      <v-select-->
<!--        v-model="$store.state.clickedMetrics"-->
<!--        :items="$store.state.selectedMetrics"-->
<!--        attach-->
<!--        chips-->
<!--        label="Chips"-->
<!--        multiple-->
<!--      ></v-select>-->
      <v-select
        dense
        :items="$store.state.clickedMetrics"
        label=""
        v-model="focusedMetric"
      ></v-select>
    </div>
    <div class="subDisplay-content-container" ref="subDisplay"
         id="subDisplayID">
      <div class="subDisplay-content-div"></div>
    </div>
  </div>
</template>

<script src='./SubDisplay.ts'>
</script>

<style lang='sass' scoped>
  @import './SubDisplay.sass'
</style>
