<template>
  <component :is="iconName" class="myIcon"></component>
</template>

<script setup lang="ts">
interface Props {
  iconName: string
}
withDefaults(defineProps<Props>(), {
  iconName: ''
})
</script>

<style scoped></style>
