<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          <label v-if="$route.name !== 'main'">{{ $route.name }}</label>
        </q-toolbar-title>

        <div>Quasar v{{ $q.version }}</div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      bordered
      :breakpoint="2000"
    >
      <q-list>
        <q-item v-ripple>
          <q-item-section>
            <q-item-label header class="text-grey-8 text-h6" style="width: 5rem">
              Menu
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <div class="row items-center content-center">
              <q-btn
                flat round
                color="grey"
                @click="$q.fullscreen.toggle()"
                :icon="$q.fullscreen.isActive ? 'fullscreen_exit' : 'fullscreen'"
              />
              <q-btn flat round color="grey" icon="settings" @click="router.push('Setting'); leftDrawerOpen = false"/>
              <q-btn flat round color="grey" icon="autorenew" @click="router.go(0)"/>
            </div>
          </q-item-section>
        </q-item>
        <q-separator/>
        <template>

        </template>
        <router-item
          v-for="link in basic"
          :key="link.link"
          v-bind="link"
          @close-drawer="leftDrawerOpen = false"
        />
      </q-list>
    </q-drawer>

    <q-page-container @click="leftDrawerOpen=false">
      <router-view v-slot="{ Component }" style="height: calc(100vh - 50px)">
        <transition name="main-page-transition"
                    enter-active-class="animated fadeIn"
                    leave-active-class="animated fadeOut" mode="out-in">
          <component :is="Component"/>
        </transition>
      </router-view>
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref } from 'vue'
import { useRouter } from 'vue-router'

import RouterItem from 'layouts/RouterItem.vue'
import Links from 'src/router/Links'

export default defineComponent({
  name: 'MainLayout',

  components: {
    RouterItem
  },

  setup () {
    const leftDrawerOpen = ref(false)

    return {
      router: useRouter(),
      basic: Links('basic'),
      leftDrawerOpen,
      toggleLeftDrawer () {
        leftDrawerOpen.value = !leftDrawerOpen.value
      }
    }
  }
})
</script>
