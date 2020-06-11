<template>
  <div class="itemList-wrapper">
    <div class="itemList-container">
      <MainItem v-for="n in 10"
                :key="n" v-bind:classID="'RadarChart_' + n">
      </MainItem>
    </div>
  </div>
</template>

<script src='./MainItemList.ts'>
</script>

<style lang='sass' scoped>
  @import 'MainItemList.sass'
</style>
