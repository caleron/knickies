<template>
  <v-container fluid>
    <v-layout justify-center align-center wrap>
      <v-flex xs12 sm8 md6 lg4>
        <h1 class="headline">Spiel {{game.name}}</h1>
        <v-subheader v-html="game.subtitle"></v-subheader>
        <v-list two-line>
          <template v-for="sheet in game.sheets">
            <v-list-tile v-if="sheet.nextUser.toLowerCase() == currentUser" v-bind:key="sheet.number"
                         @click="showDialog(sheet)">
              <v-list-tile-content>
                <v-list-tile-title>Zettel {{sheet.number}} <span
                  class="grey--text">({{sheet.texts.length}}/{{game.textCount}})</span>
                </v-list-tile-title>
                <v-list-tile-sub-title>Du bist dran!</v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>
            <v-list-tile v-else v-bind:key="sheet.number">
              <v-list-tile-content>
                <v-list-tile-title>Zettel {{sheet.number}} <span
                  class="grey--text">({{sheet.texts.length}}/{{game.textCount}})</span></v-list-tile-title>
                <v-list-tile-sub-title>Du bist nicht dran...</v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>
          </template>
        </v-list>
      </v-flex>
    </v-layout>
    <v-dialog v-model="addTextDialog" max-width="500">
      <v-card>
        <v-card-title class="headline">Text hinzufügen</v-card-title>
        <v-card-text>
          <template v-if="dialogSheet.texts.length > 0">
            Vorheriger Text:<br>
            <p class="pa-2">{{ dialogSheet.texts[dialogSheet.texts.length - 1].text }}</p>
          </template>
          <template v-else>
            Beginne die Story!
          </template>
          <v-text-field label="Nächster Text" multi-line v-model="newText"></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat @click.native="addTextDialog = false">Später</v-btn>
          <v-btn @click.native="addText()">Senden!</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
  import { SessionManager } from '../services/SessionManager'
  import { SocketClient } from '../services/SocketClient'

  export default {
    name: 'RunningGameView',
    data () {
      return {
        addTextDialog: false,
        dialogSheet: {texts: []},
        newText: ''
      }
    },
    computed: {
      currentUser: () => {
        return SessionManager.status.currentUser.toLowerCase()
      },
      game () {
        if (!this.$route.params.id) {
          return {}
        }
        return SessionManager.getGame(this.$route.params.id)
      }
    },
    methods: {
      showDialog (sheet) {
        this.dialogSheet = sheet
        this.addTextDialog = true
      },
      addText () {
        this.addTextDialog = false
        SocketClient.addText(this.game.id, this.dialogSheet.number, this.newText)
      }
    }
  }
</script>

<style>
</style>
