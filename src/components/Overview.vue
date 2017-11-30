<template>
  <v-container fluid>
    <v-layout justify-center align-center wrap>
      <v-flex xs12 sm8 md6 lg4>
        <v-dialog v-model="createDialog" max-width="500px">
          <v-btn color="primary" slot="activator">Spiel erstellen</v-btn>
          <v-card>
            <v-card-title>
              <span class="headline">Spiel erstellen</span>
            </v-card-title>
            <v-card-text>
              <v-form v-model="newGameValid" lazy-validation>
                <v-container grid-list-md>
                  <v-layout wrap>
                    <v-flex xs12>
                      <v-text-field label="Name" :rules="nameRules" counter="50" required
                                    v-model="newGameName"></v-text-field>
                    </v-flex>
                    <v-flex xs12>
                      <v-select label="Teilnehmer" v-model="newGameUsers" multiple chips :items="users"
                                required :rules="userRules"></v-select>
                    </v-flex>
                    <v-flex xs12>
                      <div>Anzahl Zettel: {{newGameSheetCount}}</div>
                    </v-flex>
                    <v-flex xs12>
                      <v-slider v-model="newGameSheetCount"
                                step="1" min="3" max="20"></v-slider>
                    </v-flex>
                    <v-flex xs12>
                      <div>Anzahl Texte pro Zettel: {{newGameTextCount}}</div>
                    </v-flex>
                    <v-flex xs12>
                      <v-slider v-model="newGameTextCount"
                                step="1" min="5" max="30"></v-slider>
                    </v-flex>
                  </v-layout>
                </v-container>
              </v-form>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" flat @click.native="createDialog = false">Abbrechen</v-btn>
              <v-btn color="blue darken-1" flat @click.native="createGame">Speichern</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-list two-line>
          <v-subheader class="headline">{{runningGamesTitle}}</v-subheader>
          <template v-for="item in status.runningGames">
            <v-list-tile v-bind:key="item.title" @click="openGame(item)">
              <v-list-tile-content>
                <v-list-tile-title :class="item.myTurn ? 'primary--text' : ''">{{item.name}}</v-list-tile-title>
                <v-list-tile-sub-title v-html="item.subtitle"></v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>
          </template>
          <v-subheader class="headline">{{closedGamesTitle}}</v-subheader>
          <template v-for="item in status.closedGames">
            <v-list-tile v-bind:key="item.title" @click="openGame(item)">
              <v-list-tile-content>
                <v-list-tile-title>{{item.name}}</v-list-tile-title>
                <v-list-tile-sub-title v-html="item.subtitle"></v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>
          </template>
        </v-list>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  import { SocketClient } from '../services/SocketClient'
  import { SessionManager } from '../services/SessionManager'

  console.log(JSON.stringify(SessionManager))
  console.log(SessionManager.status)
  export default {
    name: 'hello',
    data () {
      return {
        title: 'Übersicht',
        runningGamesTitle: 'Laufende Spiele',
        closedGamesTitle: 'Abgeschlossene Spiele',
        createDialog: false,
        newGameValid: true,
        newGameName: '',
        newGameSheetCount: 5,
        newGameTextCount: 10,
        newGameUsers: [],
        nameRules: [
          (v) => !!v || 'Name fehlt',
          (v) => v.length >= 3 || 'Mindestens 3 Zeichen',
          (v) => v.length <= 50 || 'Maximal 50 Zeichen',
          (v) => /^[a-zA-Z0-9 !?]+$/.test(v) || 'Nur Buchstaben und Zahlen erlaubt'
        ],
        userRules: [(v) => v.length > 1 || 'Mindestens 2 Mitspieler nötig'],
        status: SessionManager.status
      }
    },
    computed: {
      users () {
        return Array.from(this.status.users.values())
      }
    },
    methods: {
      openGame (game) {
        this.$router.push('/game/' + game.id)
      },
      createGame () {
        if (!this.newGameValid) {
          console.log('new game is not valid')
          return
        }
        this.createDialog = false
        SocketClient.createGame(this.newGameName, this.newGameSheetCount, this.newGameTextCount, this.newGameUsers)
      }
    }
  }
</script>

<style>
</style>
