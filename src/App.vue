<template>
  <v-app>
    <objection-panel />
  </v-app>
</template>

<script setup>
import ObjectionPanel from '@/components/ObjectionPanel.vue'
</script>

<style>
@import url('../style.css');
html, body {
  /* overflow: hidden; */
  touch-action: none;
}
</style>