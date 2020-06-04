<template>
  <div class="controller-container">
    <div class="controller-grid ma-3-right">
      <div class="controller-header"> Filter </div>
      <div class="controller-body"></div>
    </div>
    <div class="controller-empty"></div>
    <div class="controller-grid">
      <div class="controller-header pa-4-left"> Sort </div>
      <div class="controller-body">
        <div class="controller-sort-list">
          <div class="controller-sort">
            <div class="controller-dropdown">
              <v-select class="drop-down"
                :items="dropdown_icon"
                label=""
                dense
                height="28px"
              ></v-select>
            </div>
            <div class="controller-buttons"></div>
            <div class="controller-delete"></div>
          </div>
        </div>
      </div>
    </div>
    <div class="controller-empty"></div>
    <div class="controller-grid ma-3-left">
      <div class="controller-header pa-4-left"> Node Configuration </div>
      <div class="controller-body">
        <div class="date-unit-container"></div>
        <div class="metrics-container">
        </div>
      </div>
    </div>
  </div>
</template>

<script src='./MainController.ts'>
</script>

<style lang='sass' scoped>
  @import './MainController.sass'
</style>
