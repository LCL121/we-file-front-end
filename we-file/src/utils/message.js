import { Notyf } from 'notyf'
import 'notyf/notyf.min.css'

export const notyf = new Notyf({
  position: { x: 'center', y: 'top' },
  types: [
    {
      type: 'error',
      background: '#ff6e6e',
      duration: 3000,
      dismissible: true
    }
  ]
})
