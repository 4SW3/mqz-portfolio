import autoBind from 'auto-bind'
import gsap from 'gsap'
import Animation from '../classes/Animation'

export default class TextScramble extends Animation {
  constructor({ element, elements, textContent, isVisible, animateRounds = Infinity }) {
    super({ element, elements })
    autoBind(this)

    this.textContent = textContent
    this.isVisible = isVisible
    this.animateRounds = animateRounds
    this.countRouds = 1

    this.chars = '<a!a>w-_p\\/[x]{y}i—j=+*&?#'
  }

  async animateIn() {
    if (this.countRouds > this.animateRounds) return

    this.setText(this.textContent)
    this.countRouds++
  }

  animateOut() { }

  async setText(newText) {
    const oldText = this.element.innerText
    const length = Math.max(oldText.length, newText.length)
    const promise = new Promise((resolve) => this.resolve = resolve)

    this.queue = []
    for (let i = 0; i < length; i++) {
      const from = oldText[i] || ''
      const to = newText[i] || ''
      const start = Math.floor(Math.random() * 40)
      const end = start + Math.floor(Math.random() * 40)
      this.queue.push({ from, to, start, end })
    }

    cancelAnimationFrame(this.frameRequest)

    this.frame = 0
    this.update()

    return promise
  }

  update() {
    let output = ''
    let complete = 0

    for (let i = 0, n = this.queue.length; i < n; i++) {
      let { from, to, start, end, char } = this.queue[i]
      if (this.frame >= end) {
        complete++
        output += to
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.randomChar()
          this.queue[i].char = char
        }
        output += `<span class="dud">${char}</span>`
      } else {
        output += from
      }
    }

    this.element.innerHTML = output

    if (complete === this.queue.length) {
      this.resolve()
    } else {
      this.frameRequest = requestAnimationFrame(this.update)
      this.frame++
    }
  }

  randomChar() {
    return this.chars[Math.floor(Math.random() * this.chars.length)]
  }

  show() {
    const originUrl = window.location.pathname === '/' ? '/' : '/case'

    if (originUrl !== this.element.getAttribute('data-url')) return

    // gsap.fromTo(this.element, {
    //   autoAlpha: 0,
    // }, {
    //   delay: 1,
    //   autoAlpha: 1,
    //   duration: 1.5,
    //   onComplete: () => this.setText(this.textContent),
    // })

    gsap.to(this.element, {
      delay: 1,
      autoAlpha: 1,
      duration: 1,
      onComplete: () => this.setText(this.textContent),
    })
  }

  hide() {
    gsap.to(this.element, {
      autoAlpha: 0,
      duration: 1,
    })
  }

  onResize() { }
}
