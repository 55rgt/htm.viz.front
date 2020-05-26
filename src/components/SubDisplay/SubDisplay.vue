<template>
  <div class="subDisplay-container">
    <div class="subDisplay-text-container">
      <div class="subDisplay-text-item"></div>
      <div class="subDisplay-empty"></div>
      <div class="subDisplay-text-item"></div>
    </div>
    <div class="subDisplay-controller-container">
      <div class="subDisplay-metric-list-container">
        <div class="subDisplay-metric-item-container" v-for="(n, i) in 10" :key="n"
             :style="{ background: isFocused(i) ? shadeColor(getMetricPalette(i), 20) : 'none'}"
        @click.self=changeFocusedMetric(i)>
          <div class="subDisplay-metric-item" :style="{ background: getMetricPalette(i),
          border: '1px solid'+ shadeColor(getMetricPalette(i), -20)}"
          @click="changeSelectedMetrics(i)">
            <font-awesome-icon v-if=isSelected(i) class="check-icon" :icon="['fas', 'check']"
            :style="{ color: shadeColor(getMetricPalette(i), -40)}"/>
          </div>
        </div>
      </div>
      <div class="subDisplay-order-container">
        <div class="subDisplay-icon">
          <font-awesome-icon class="sort-amount-down-icon" :icon="['fas', 'sort-amount-down']"
                             rotation="90"/>
        </div>
        <div class="subDisplay-order" @click="tempCallSubGraph"/>
      </div>
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
