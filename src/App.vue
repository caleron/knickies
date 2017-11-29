<template>
  <v-app :dark="darkTheme" :light="!darkTheme">
    <v-toolbar fixed app>
      <v-toolbar-title>{{title}} <span v-if="status.currentUser"> - {{status.currentUser}}</span></v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click.stop="darkTheme = !darkTheme">
        <v-icon>lightbulb_outline</v-icon>
      </v-btn>
    </v-toolbar>
    <v-content>
      <router-view></router-view>
    </v-content>
  </v-app>
</template>

<script>
  import { SessionManager } from './services/SessionManager'

  export default {
    data () {
      return {
        title: 'Knickies',
        darkTheme: true,
        status: SessionManager.status
      }
    }
  }
</script>
