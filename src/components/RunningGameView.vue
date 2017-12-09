<template>
  <v-container fluid>
    <v-layout justify-center align-center wrap>
      <v-flex xs12 sm8 md6 lg4>
        <h1 class="headline">{{game.name}}</h1>
        <v-subheader v-html="game.subtitle"></v-subheader>
        <v-btn v-if="game.running" primary @click="showInviteDialog = true">Einladen</v-btn>
        <v-list two-line v-if="game.running">
          <template v-for="sheet in game.sheets">
            <v-list-tile v-if="sheet.nextUser && sheet.nextUser.toLowerCase() === status.currentUser.toLowerCase()"
                         v-bind:key="sheet.number"
                         @click="showDialog(sheet)">
              <v-list-tile-content>
                <v-list-tile-title class="primary--text">Zettel {{sheet.number + 1}} <span
                        class="grey--text">({{sheet.texts.length}}/{{game.textCount}})</span>
                </v-list-tile-title>
                <v-list-tile-sub-title>Du bist dran!</v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>
            <v-list-tile v-else v-bind:key="sheet.number">
              <v-list-tile-content>
                <v-list-tile-title>Zettel {{sheet.number + 1}} <span
                        class="grey--text">({{sheet.texts.length}}/{{game.textCount}})</span>
                </v-list-tile-title>
                <v-list-tile-sub-title>Du bist nicht dran... {{
                  sheet.assignTime + 1000 * 3600 * 12 < new Date().getTime() ? ' (' + sheet.nextUser +
                  ')' : '' }}
                </v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>
          </template>
        </v-list>
        <v-list two-line v-else>
          <template v-for="sheet in game.sheets">
            <v-list-tile v-bind:key="sheet.number" @click="showFinalStory(sheet)">
              <v-list-tile-content>
                <v-list-tile-title class="primary--text">Zettel {{sheet.number + 1}}</v-list-tile-title>
                <v-list-tile-sub-title></v-list-tile-sub-title>
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
    <v-dialog v-model="showFinalStoryDialog" max-width="500">
      <v-card>
        <v-card-title class="headline">Zettel {{finalStorySheet.number + 1}}</v-card-title>
        <v-card-text>
          <p v-for="sheetText in finalStorySheet.texts" v-bind:key="finalStorySheet.number">
            {{ sheetText.text }}
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat @click.native="showFinalStoryDialog = false">Schließen</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="showInviteDialog" max-width="500">
      <v-card>
        <v-card-title class="headline">Nutzer einladen</v-card-title>
        <v-card-text>
          <p v-if="outsiders.length === 0">
            Bereits alle Nutzer im Spiel!
          </p>
          <v-select v-else label="Teilnehmer" v-model="userToInvite" multiple chips :items="outsiders"
                    required :rules="userRules"></v-select>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat @click="showInviteDialog = false">Abbrechen</v-btn>
          <v-btn primary @click="inviteUsers()" v-if="outsiders.length > 0">Einladen</v-btn>
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
        showFinalStoryDialog: false,
        finalStorySheet: {texts: [], number: 0},
        dialogSheet: {texts: []},
        newText: '',
        status: SessionManager.status,
        showInviteDialog: false,
        userToInvite: [],
        userRules: [(v) => v.length > 0 || 'Bitte Nutzer auswählen']
      }
    },
    computed: {
      game () {
        if (!this.$route.params.id && this.$route.params.id !== 0) {
          return {}
        }
        return SessionManager.getGame(this.$route.params.id)
      },
      outsiders () {
        let users = SessionManager.status.users
        let ret = []
        for (let user of users.keys()) {
          if (this.game.users.indexOf(user) === -1) {
            ret.push(user)
          }
        }
        return ret
      }
    },
    methods: {
      showDialog (sheet) {
        if (this.dialogSheet !== sheet) {
          this.dialogSheet = sheet
          this.newText = ''
        }
        this.addTextDialog = true
      },
      addText () {
        this.addTextDialog = false
        SocketClient.addText(this.game.id, this.dialogSheet.number, this.newText)
      },
      showFinalStory (sheet) {
        this.finalStorySheet = sheet
        this.showFinalStoryDialog = true
      },
      inviteUsers () {
        this.showInviteDialog = false
        if (this.userToInvite.length > 0) {
          SocketClient.inviteUsers(this.game.id, this.userToInvite)
        }
      }
    }
  }
</script>

<style>
</style>
