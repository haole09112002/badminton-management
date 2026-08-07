<template>
  <v-chip class="status-chip px-2 text-caption fit-content " size="x-small" :color="getStatusCf(props.status).color"
    text-color="white" variant="elevated" prepend-icon="mdi-checkbox-marked-circle">
    {{ getStatusCf(props.status).text }}
  </v-chip>
</template>

<script setup lang="ts">
import { getStatusCf } from '../../utils'
const props = defineProps<{
  status: string
}>()
</script>
<style lang="scss"  scoped></style>
