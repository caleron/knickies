<template>
  <v-container fluid>
    <v-layout justify-center align-center wrap>
      <v-flex xs12 sm8 md6 lg4>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  import { SessionManager } from '../services/SessionManager'

  export default {
    name: 'RunningGameView',
    data () {
      return {
        game: {}
      }
    },
    mounted () {
      this.game = SessionManager.getGame(this.$route.params.id)
    },
    methods: {}
  }
</script>

<style>
</style>
