<template>
  <div class="subDisplay-container">
    <div class="subDisplay-text-container">
      <div class="subDisplay-text-item"></div>
      <div class="subDisplay-empty"></div>
      <div class="subDisplay-text-item"></div>
    </div>
    <div class="subDisplay-controller-container">
      1. Radiobutton 기능 하는 List (안에는 멀티 선택 가능한 Metric 이 한 개씩 있음)
      2. Sort 옵션
    </div>
    <div class="subDisplay-content-container" @click="tempCallSubGraph"></div>
  </div>
</template>

<script src='./SubDisplay.ts'>
</script>

<style lang='sass' scoped>
  @import './SubDisplay.sass'
</style>
