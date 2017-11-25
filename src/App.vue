<template>
  <v-app :dark="darkTheme" :light="!darkTheme">
    <v-toolbar fixed app>
      <v-toolbar-title v-text="title"></v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click.stop="darkTheme = !darkTheme">
        <v-icon>lightbulb_outline</v-icon>
      </v-btn>
    </v-toolbar>
    <v-content>
      <router-view></router-view>
    </v-content>
    <v-footer app>
      <span>&copy; 2017</span>
    </v-footer>
  </v-app>
</template>

<script>
  export default {
    data () {
      return {
        title: 'Knickies',
        darkTheme: true
      }
    }
  }
</script>
