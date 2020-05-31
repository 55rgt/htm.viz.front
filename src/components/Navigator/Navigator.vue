<template>
  <div class="nav-wrapper">
    <div class="nav-container">
      <div class="file-input" @click="initialize"> Input Data or Title(Header)</div>
      <NavTree/>
      <div class="generate-button" @click="initialize"> Update View </div>
      <NavWeight/>
    </div>
  </div>
</template>

<script src='./Navigator.ts'>
</script>

<style lang='sass' scoped>
  @import './Navigator.sass'
</style>
