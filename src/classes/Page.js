import autoBind from 'auto-bind'
import EventEmitter from 'events'
import gsap from 'gsap'
import prefix from 'prefix'
import Text from '../animations/Text'
import TextScramble from '../animations/TextScramble'

export default class Page extends EventEmitter {
  constructor({ classes, element, elements, isScrollable = true }) {
    super()
    autoBind(this)

    this.classes = classes
    this.isScrollable = isScrollable
    this.selectors = {
      element,
      elements: {
        ...elements,
        animsText: '[data-animation="home-text"]',
        animsTextScramble: '[data-animation="text-scramble"]',
      },
    }

    this.transformPrefix = prefix('transform')
  }

  create() {
    this.scroll = {
      accel: 0,
      ease: 0.07,
      position: 0,
      current: 0,
      target: 0,
      limit: 0,
    }

    this.animations = []
    this.element = document.querySelector(this.selectors.element)
    this.elements = {}

    for (const key in this.selectors.elements) {
      const val = this.selectors.elements[key]

      if (val instanceof window.HTMLElement ||
        val instanceof window.NodeList ||
        Array.isArray(val)
      )
        this.elements[key] = val

      else {
        this.elements[key] = document.querySelectorAll(val)

        if (!this.elements[key].length)
          this.elements[key] = null
        else if (this.elements[key].length === 1)
          this.elements[key] = this.element.querySelector(val)
      }
    }

    this.createAnimations()
  }

  createAnimations() {
    const tempAnimArr = []
    const { animsText, animsTextScramble } = this.elements

    /**
     * animsText: '[data-animation="home-text"]',
     */
    if (animsText instanceof NodeList || Array.isArray(animsText))
      animsText.forEach(element => {
        /**
         * @PS
         * Including those checks cause I'm rendering the 2 screens
         *   at once (.home and .case).
         * 
         * So it's needed if I don't want to create the same anim
         *   class on the other pages
         *   (e.g data.animation='home-text' in the case page)
         */
        if (
          this.element.classList.value ===
          element.getAttribute('data-animation').split('-')[0]
        )
          tempAnimArr.push(new Text({ element, animateRounds: 1 }))
      })
    else if (animsText && typeof animsText === 'object')
      tempAnimArr.push(new Text({ element: animsText, animateRounds: 1 }))

    /**
     * animsTextScramble: '[data-animation="text-scramble"]',
     */
    if (animsTextScramble instanceof NodeList || Array.isArray(animsTextScramble))
      animsTextScramble.forEach(element => {
        tempAnimArr.push(
          new TextScramble({
            element,
            textContent: element.getAttribute('data-animation-txt-content'),
            isVisible: this.isVisible || false,
            animateRounds: 1,
          })
        )
      })
    else if (animsTextScramble && typeof animsTextScramble === 'object')
      tempAnimArr.push(
        new TextScramble({
          element: animsTextScramble,
          textContent: animsTextScramble.getAttribute('data-animation-txt-content'),
          isVisible: this.isVisible || false,
          animateRounds: 1,
        })
      )

    if (tempAnimArr.length) this.animations.push(...tempAnimArr)
  }

  show() {
    return new Promise(resolve => {
      this.isVisible = true

      this.animations.forEach(animation => {
        if (animation.show) animation.show()
      })

      resolve()
    })
  }

  hide() {
    return new Promise(resolve => {
      this.isVisible = false

      this.animations.forEach(animation => {
        if (animation.hide) animation.hide()
      })

      resolve()
    })
  }

  transform(element, y) {
    element.style[this.transformPrefix] = `translate3d(0, ${-Math.round(y)}px, 0)`
  }

  onResize(sizes) {
    // this.scroll.limit =
    //   this.elements.wrapper.clientHeight - window.innerHeight
    this.scroll.limit =
      this.elements.wrapper.clientHeight - sizes.height

    this.animations.forEach(anim => anim.onResize())
  }

  onTouchDown(mouse) {
    if (!this.isScrollable) return

    this.isDown = true
    this.scroll.position = this.scroll.current

    // this.start = e.touches ? e.touches[0].clientY : e.clientY
    this.start = mouse.y
  }

  onTouchMove(mouse) {
    if (!this.isDown || !this.isScrollable) return

    // const y = e.touches ? e.touches[0].clientY : e.clientY
    const distance = (this.start - mouse.y) * 2

    this.scroll.target = this.scroll.position + distance
  }

  onTouchUp() {
    if (!this.isScrollable) return

    this.isDown = false
  }

  onWheel({ pixelY }) {
    this.scroll.target += pixelY

    this.isScrolling = true
  }

  update() {
    this.scroll.target = gsap.utils.clamp(
      0,
      this.scroll.limit,
      this.scroll.target,
    )

    this.scroll.current = gsap.utils.interpolate(
      this.scroll.current,
      this.scroll.target,
      this.scroll.ease,
    )

    this.scroll.accel += 0.01 * (this.scroll.target - this.scroll.current)
    this.scroll.accel *= 0.9
    this.scroll.target = this.scroll.target + this.scroll.accel * 0.26

    if (this.scroll.current < 0.01) this.scroll.current = 0

    // this.elements.wrapper.style[this.transformPrefix] =
    //   `translateY(-${ this.scroll.current }px)`
    if (this.elements.wrapper) this.transform(this.elements.wrapper, this.scroll.current)
  }
}