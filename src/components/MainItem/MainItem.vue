<template>
  <div class="item-wrapper">
    <div class="item-container" ref="radarChart" :id="this.classID"
         :class="{ 'isLeft': selectState === 1, 'isRight': selectState === 2 }"
         @click="selectRadar"></div>
  </div>
</template>

<script src='./MainItem.ts'>
</script>

<style lang='sass' scoped>
  @import './MainItem.sass'
</style>
