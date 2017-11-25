<template>
  <v-container fluid>
    <v-layout justify-center align-center wrap>
      <v-flex xs12 sm8 md6 lg4>
        <v-list two-line>
          <v-subheader>{{runningGamesTitle}}</v-subheader>
          <template v-for="item in runningGames">
            <v-list-tile v-bind:key="item.title" @click="openGame(item)">
              <v-list-tile-content>
                <v-list-tile-title v-html="item.name"></v-list-tile-title>
                <v-list-tile-sub-title v-html="item.created"></v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>
          </template>
          <v-subheader>{{closedGamesTitle}}</v-subheader>
          <template v-for="item in closedGames">
            <v-list-tile v-bind:key="item.title" @click="openGame(item)">
              <v-list-tile-content>
                <v-list-tile-title v-html="item.name"></v-list-tile-title>
                <v-list-tile-sub-title v-html="item.created"></v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>
            <v-divider inset="true"></v-divider>
          </template>
        </v-list>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  import { SessionManager } from '../services/SessionManager'

  export default {
    name: 'hello',
    data () {
      return {
        title: 'Übersicht',
        runningGamesTitle: 'Laufende Spiele',
        closedGamesTitle: 'Abgeschlossene Spiele',
        runningGames: [],
        closedGames: []
      }
    },
    mounted () {
      this.runningGames = SessionManager.getRunningGames()
      this.closedGames = SessionManager.getClosedGames()
    },
    methods: {
      openGame (game) {
        this.$router.push('/game/' + game.id)
      }
    }
  }
</script>

<style>
</style>
