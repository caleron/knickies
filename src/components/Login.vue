<template>
  <v-container fluid>
    <v-layout justify-center align-center wrap>
      <v-flex xs12 sm8 md6 lg4>
        <v-card>
          <v-form v-model="valid" @submit="login" ref="form" lazy-validation>
            <v-card-title primary-title>
              <h3 class="headline mb-10">{{title}}</h3>
            </v-card-title>
            <v-card-text>
              <v-text-field label="Name" v-model="name" :rules="nameRules" :counter="20" required></v-text-field>
              <v-text-field label="Passwort" type="password" v-model="password" :counter="5" :rules="passwordRules"
                            required></v-text-field>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn flat class="login-btn" :disabled="!valid" type="submit">Anmelden</v-btn>
            </v-card-actions>
            <v-dialog v-model="createAccountDialog" max-width="500px">
              <v-card>
                <v-card-title>
                  <span class="headline">Account existiert nicht</span>
                </v-card-title>
                <v-card-text>
                  Stattdessen einen neuen Benutzer mit Namen {{ name }} anlegen?
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="primary" flat @click.stop="createAccountDialog=false">Nein</v-btn>
                  <v-btn color="primary" @click.stop="createAccount()">Ja</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-form>
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
        valid: true,
        name: '',
        nameRules: [
          (v) => !!v || 'Name fehlt',
          (v) => v.length >= 3 || 'Mindestens 3 Zeichen',
          (v) => v.length <= 20 || 'Maximal 20 Zeichen',
          (v) => /^[a-zA-Z0-9]+$/.test(v) || 'Nur Buchstaben und Zahlen erlaubt'
        ],
        password: '',
        passwordRules: [
          (v) => !!v || 'Password fehlt',
          (v) => v.length <= 5 || 'Maximal 5 Zeichen'
        ],
        createAccountDialog: false
      }
    },
    mounted () {
      SessionManager.checkLoggedIn().then((isLoggedIn) => {
        if (isLoggedIn) {
          this.$router.replace('/')
        }
      }).catch()
    },
    methods: {
      login () {
        console.log('login triggered')
        if (!this.$refs.form.validate()) {
          console.log('not valid')
          return
        }
        SocketClient.connect(this.name, this.password).then(() => {
          this.$router.replace('/')
        }).catch(e => {
          console.log('login failed', e)
          if (e.error === 'unknown user') {
            this.createAccountDialog = true
          } else {
            window.alert(e.error)
          }
        })
      },
      createAccount () {
        this.createAccountDialog = false
        SocketClient.registerUser(this.name, this.password).then(() => {
          this.$router.replace('/')
        }).catch(e => {
          console.log('error creating account', e)
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
