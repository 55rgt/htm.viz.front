
<template>
  <div class="subDisplay-container">
    <div class="subDisplay-text-container">
      <div class="subDisplay-text-item"></div>
      <div class="subDisplay-empty"></div>
      <div class="subDisplay-text-item"></div>
    </div>
    <div class="subDisplay-controller-container">
      <div class="subDisplay-metric-list-container"/>
      <div class="subDisplay-order-container">
        <div class="subDisplay-icon">
          <font-awesome-icon class="sort-amount-down-icon" :icon="['fas', 'sort-amount-down']"
                             rotation="90"/>
        </div>
        <div class="subDisplay-order"/>
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
