<template>
  <div class="weight-container">
    <div class="weight-header"> Weight Controller</div>
    <div class="weight-item-list">
      <div v-for="n in this.$store.state.totalMetrics" :key="n" class="weight-item">
        <div class="weight-metric-name"> {{ n }} </div>
        <label>
          <input step="0.01" v-model="controller[n]" class="weight-input">
        </label>
        <div class="weight-slider">
          <v-slider
            v-model="controller[n]"
            class="align-center"
            :max="max"
            :min="min"
            hide-details
            dense
            step="0.01"
          >
          </v-slider>
        </div>
      </div>
    </div>
  </div>
</template>

<script src='./NavWeight.ts'>
</script>

<style lang='sass' scoped>
  @import './NavWeight.sass'
</style>
