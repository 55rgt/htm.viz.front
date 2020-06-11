<template>
  <div class="itemList-wrapper">
    <div class="itemList-container">
      <MainItem v-for="n in this.$store.state.unitData.length"
                :key="n" v-bind:classID="'RadarChart_' + n" v-bind:idx="n-1">
      </MainItem>
    </div>
  </div>
</template>

<script src='./MainItemList.ts'>
</script>

<style lang='sass' scoped>
  @import 'MainItemList.sass'
</style>
