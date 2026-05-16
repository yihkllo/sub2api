<template>
  <div class="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f7fbfa] p-4 dark:bg-dark-950">
    <!-- Background -->
    <div
      class="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.08)_1px,transparent_1px)] bg-[size:48px_48px] dark:bg-[linear-gradient(rgba(96,165,250,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(96,165,250,0.05)_1px,transparent_1px)]"
    ></div>

    <!-- Decorative Elements -->
    <div class="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        class="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-primary-100/90 via-primary-50/40 to-transparent dark:from-primary-950/30 dark:via-dark-950/60 dark:to-transparent"
      ></div>
      <div
        class="absolute left-1/2 top-0 h-full w-px bg-gradient-to-b from-primary-300/70 via-primary-100/20 to-transparent dark:from-primary-500/30 dark:via-primary-900/10"
      ></div>
      <div
        class="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.14),transparent_34%)] dark:bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.16),transparent_36%)]"
      ></div>
    </div>

    <!-- Content Container -->
    <div class="relative z-10 w-full max-w-md">
      <!-- Logo/Brand -->
      <div class="mb-8 text-center">
        <!-- Custom Logo or Default Logo -->
        <template v-if="settingsLoaded">
          <div
            class="mb-4 inline-flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl shadow-lg shadow-primary-500/30"
          >
            <img :src="siteLogo || '/logo.png'" alt="Logo" class="h-full w-full object-contain" />
          </div>
          <h1 class="text-gradient mb-2 text-3xl font-bold">
            {{ siteName }}
          </h1>
          <p class="text-sm text-gray-500 dark:text-dark-400">
            {{ siteSubtitle }}
          </p>
        </template>
      </div>

      <!-- Card Container -->
      <div class="rounded-2xl border border-white/70 bg-white/85 p-8 shadow-xl shadow-primary-950/5 backdrop-blur dark:border-dark-700 dark:bg-dark-900/85 dark:shadow-black/30">
        <slot />
      </div>

      <!-- Footer Links -->
      <div class="mt-6 text-center text-sm">
        <slot name="footer" />
      </div>

      <!-- Copyright -->
      <div class="mt-8 text-center text-xs text-gray-400 dark:text-dark-500">
        &copy; {{ currentYear }} {{ siteName }}. All rights reserved.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAppStore } from '@/stores'
import { sanitizeUrl } from '@/utils/url'

const appStore = useAppStore()

const siteName = computed(() => appStore.siteName || '云笺')
const siteLogo = computed(() => sanitizeUrl(appStore.siteLogo || '', { allowRelative: true, allowDataUrl: true }))
const siteSubtitle = computed(() => appStore.cachedPublicSettings?.site_subtitle || '稳定的 AI 中转服务')
const settingsLoaded = computed(() => appStore.publicSettingsLoaded)

const currentYear = computed(() => new Date().getFullYear())

onMounted(() => {
  appStore.fetchPublicSettings()
})
</script>

<style scoped>
.text-gradient {
  @apply bg-gradient-to-r from-primary-700 via-primary-600 to-slate-700 bg-clip-text text-transparent dark:from-primary-300 dark:via-primary-400 dark:to-slate-200;
}
</style>
