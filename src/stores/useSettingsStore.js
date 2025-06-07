import { defineStore } from 'pinia'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    character: localStorage.getItem('igiari_char') || 'cbt',
    voiceType: localStorage.getItem('igiari_vol') || 'igiari',
    sensitivity: parseFloat(localStorage.getItem('igiari_lmd') || '5'),
    autoPlayMusic: localStorage.getItem('igiari_autom') === 'true',
    volume: parseFloat(localStorage.getItem('igiari_volume') || '0.5'),
    vibrationEnabled: localStorage.getItem('igiari_vibration') === 'true',
  }),

  actions: {
    setCharacter(value) {
      this.character = value
      localStorage.setItem('igiari_char', value)
    },

    setVoiceType(value) {
      this.voiceType = value
      localStorage.setItem('igiari_vol', value)
    },

    setSensitivity(value) {
      this.sensitivity = value
      localStorage.setItem('igiari_lmd', value.toString())
    },

    setAutoPlayMusic(value) {
      this.autoPlayMusic = value
      localStorage.setItem('igiari_autom', value.toString())
    },

    setVolume(value) {
      this.volume = value
      localStorage.setItem('igiari_volume', value.toString())
    },

    setVibrationEnabled(value) {
      this.vibrationEnabled = value
      localStorage.setItem('igiari_vibration', value.toString())
    },
  }
})