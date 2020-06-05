<template>
  <div class="tree-container">
<!--    <div class="tree-controller-wrapper">-->
<!--      <div class="tree-controller">-->
<!--        <div class="tree-search"> Search </div>-->
<!--        <div class="tree-empty"></div>-->
<!--        <div class="tree-icons">-->
<!--          <div class="tree-icon"></div>-->
<!--          <div class="tree-icon"></div>-->
<!--          <div class="tree-icon"></div>-->
<!--          <div class="tree-icon"></div>-->
<!--        </div>-->
<!--      </div>-->
<!--    </div>-->
    <div class="tree-display">
      <div class="tree-header"> Data Lists</div>
      <div class="tree-body">
        <v-checkbox class="tree-item ma-0" v-for="n in getParents()" :key="n" dense
                    v-model="checkBox" :label="`${n}`" :value="n"></v-checkbox>
      </div>
    </div>
    <v-btn class="pa-0" block depressed color="#0A3770" style="height: 42px;"
           dark @click="initialize">Update View</v-btn>
  </div>
</template>

<script src='./NavTree.ts'>
</script>

<style lang='sass' scoped>
  @import './NavTree.sass'
</style>
