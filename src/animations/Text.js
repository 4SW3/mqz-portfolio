import gsap from 'gsap'
import Animation from "../classes/Animation"
import { split } from '../utils/text'

export default class Text extends Animation {
  constructor({ element, elements, animateRounds = Infinity }) {
    super({ element, elements })

    split({ element: this.element })
    split({ element: this.element })

    this.elementTxtSpans = this.element.querySelectorAll('span span')

    if (element.getAttribute('data-custom-duration'))
      this.customDuration = Number(element.getAttribute('data-custom-duration'))
    else this.customDuration = null

    this.animateRounds = animateRounds
    this.countRouds = 1

    this.startedIn = {
      path: window.location.pathname === '/' ? 'home' : 'case',
      count: 0,
    }
  }

  animateIn() {
    if (this.countRouds > this.animateRounds) return

    gsap.set(this.element, {
      autoAlpha: 1,
    })

    gsap.fromTo(this.elementTxtSpans, {
      y: '100%',
    }, {
      delay: 0.5,
      duration: this.customDuration ? this.customDuration : 1.5,
      ease: 'expo.out',
      // stagger: 0.1,
      y: '0',
    })

    this.countRouds++
  }

  animateOut() {
    if (this.countRouds > this.animateRounds) return

    gsap.set(this.element, {
      autoAlpha: 0,
    })
  }


  show() {
    const { pathname } = window.location
    const originUrl = pathname === '/' ? '/' : '/case'

    if (originUrl !== this.element.getAttribute('data-url')) return

    if (this.startedIn.path === 'case' &&
      pathname === '/'
      && !this.startedIn.count
    ) {
      this.startedIn.count++
      return
    }

    gsap.to(this.elementTxtSpans, {
      delay: 1,
      duration: 1.5,
      ease: 'expo.out',
      // stagger: 0.1,
      y: '0',
    })

    gsap.to(this.element, {
      autoAlpha: 1
    })

  }

  hide() {
    gsap.to(this.elementTxtSpans, {
      delay: 0,
      duration: 1.5,
      ease: 'expo.out',
      // stagger: 0.1,
      y: '100%',
    })

    gsap.to(this.element, {
      autoAlpha: 0,
    })
  }

  onResize() { }
}
