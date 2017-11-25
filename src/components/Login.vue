<template>
  <v-container fluid>
    <v-layout justify-center align-center wrap>
      <v-flex xs12 sm8 md6 lg4>
        <v-card>
          <v-card-title primary-title>
            <h3 class="headline mb-0">{{title}}</h3>
          </v-card-title>
          <v-card-text>
            <v-form v-model="valid" v-on:submit.prevent="login">
              <v-text-field label="Name" v-model="name" :rules="nameRules" :counter="20" required></v-text-field>
              <v-text-field label="Passwort" type="password" v-model="password" :counter="5" :rules="passwordRules"
                            required></v-text-field>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn flat class="login-btn" :disabled="!valid" type="submit">Anmelden</v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  import { SocketClient } from '../services/SocketClient'
  import { SessionManager } from '../services/SessionManager'

  export default {
    name: 'hello',
    data () {
      return {
        title: 'Anmelden',
        valid: false,
        name: '',
        nameRules: [
          (v) => !!v || 'Name fehlt',
          (v) => v.length >= 3 || 'Mindestens 3 Zeichen',
          (v) => v.length <= 20 || 'Maximal 20 Zeichen'
        ],
        password: '',
        passwordRules: [
          (v) => !!v || 'Password fehlt',
          (v) => v.length <= 5 || 'Maximal 5 Zeichen'
        ]
      }
    },
    mounted () {
      SessionManager.checkLoggedIn().then((isLoggedIn) => {
        if (isLoggedIn) {
          this.$router.replace('/')
        }
      })
    },
    methods: {
      login () {
        if (!this.valid) {
          return
        }
        SocketClient.connect(this.name, this.password).then(response => {
          if (!response || !response.status) {
            // an error occurred, was already handled
            return
          }
          this.$router.replace('/')
        })
      }
    }
  }
</script>

<style lang="stylus">
  @import "../../node_modules/vuetify/src/stylus/settings/_colors.styl";

  .theme--dark .login-btn {
    color: $orange.base;
  }
</style>
