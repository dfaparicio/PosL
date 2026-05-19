<template>
  <!-- type="stat" -->
  <div v-if="type === 'stat'" class="row items-center no-wrap q-gutter-x-md">
    <div class="skeleton-box" style="width:44px;height:44px;border-radius:10px;flex-shrink:0" />
    <div class="col">
      <div class="skeleton-box q-mb-xs" style="width:55%;height:11px" />
      <div class="skeleton-box" style="width:75%;height:22px" />
    </div>
  </div>

  <!-- type="card" -->
  <div v-else-if="type === 'card'" class="q-pa-md">
    <div class="skeleton-box q-mb-md" style="width:40%;height:14px" />
    <div class="skeleton-box q-mb-sm" style="width:100%;height:12px" />
    <div class="skeleton-box q-mb-sm" style="width:88%;height:12px" />
    <div class="skeleton-box" style="width:70%;height:12px" />
  </div>

  <!-- type="table" -->
  <div v-else-if="type === 'table'">
    <div v-for="i in rows" :key="i" class="row q-gutter-x-md q-mb-sm q-px-sm">
      <div class="skeleton-box col" style="height:14px" />
      <div class="skeleton-box col" style="height:14px" />
      <div class="skeleton-box col" style="height:14px" />
      <div class="skeleton-box" style="width:80px;height:14px" />
    </div>
  </div>

  <!-- type="text" (default) -->
  <div v-else class="q-gutter-y-xs">
    <div class="skeleton-box" style="width:100%;height:12px" />
    <div class="skeleton-box" style="width:85%;height:12px" />
    <div class="skeleton-box" style="width:60%;height:12px" />
  </div>
</template>

<script setup>
defineProps({
  type: {
    type: String,
    default: 'text',
    validator: (v) => ['stat', 'card', 'table', 'text'].includes(v)
  },
  rows: {
    type: Number,
    default: 5
  }
})
</script>
