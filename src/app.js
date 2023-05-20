import autoBind from 'auto-bind'
import normalizeWheel from 'normalize-wheel'
import Detection from './classes/Detection'

import Canvas from './components/Canvas'
import Mouse from './components/Mouse'
import Nav from './components/Nav'
import Preloader from './components/Preloader'
import Sizes from './components/Sizes'

import Case from './screens/Case'
import Home from './screens/Home'
import { delay } from './utils/math'

class App {
  constructor() {
    this.url = window.location.pathname

    autoBind(this)

    this.sizes = new Sizes()
    this.mouse = new Mouse()

    this.initCanvas()
    this.initPreloader()
    this.initScreens()
    this.initNav()

    // this.setupStats() 

    if (this.url.indexOf('/case') > -1) {
      this.curPage = this.screens.routes.get('/case')
      this.curPage.show(this.url)
    } else {
      this.curPage = this.screens.routes.get(this.url)
      this.curPage.show(this.url)
    }

    this.addEventListeners()
    this.addLinksEventListeners()
    this.addButtonsEventListeners()

    this.update()

    this.sizes.on('resized', this.onResize)
  }

  // setupStats() {
  //   this.stats = new Stats()
  //   this.stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
  //   document.body.appendChild(this.stats.dom)
  // }

  initPreloader() {
    this.preloader = new Preloader({ canvas: this.canvas })
    this.preloader.once('completed', this.onPreloaded)
  }

  initCanvas() {
    this.canvas = new Canvas({
      url: this.url,
      sizes: this.sizes,
      mouse: this.mouse,
    })
  }

  initScreens() {
    const _home = new Home()
    const _case = new Case()

    this.screens = {
      home: _home,
      case: _home,
      routes: new Map([
        ['/', _home],
        ['/case', _case],
      ])
    }
  }

  initNav() {
    this.nav = new Nav({ url: this.url })
  }

  async onPreloaded() {
    this.preloader.destroy()
    this.canvas.onPreloaded()
    this.onResize()
  }

  async onChange({ push = true, url = null }) {
    if (this.isFetching || this.url === url) return

    this.isFetching = true
    this.url = url

    if (this.canvas) this.canvas.onChange(this.url)

    if (this.nav) this.nav.onChange(this.url)

    await this.curPage.hide(this.url)

    if (push)
      window.history.pushState({}, document.title, this.url)

    if (this.url.indexOf('/case') > -1) {
      this.curPage = this.screens.routes.get('/case')
      await this.curPage.show(this.url)
    } else {
      this.curPage = this.screens.routes.get(this.url)
      await this.curPage.show(this.url)
    }

    this.onResize()
    this.isFetching = false
  }

  async onNextProject({ url = null, idx = 0 }) {
    await this.onChange({ url: '/' })
    this.curPage.scrollTopCase(idx)
    await delay(2000)
    await this.onChange({ url })
  }

  onContextMenu(e) {
    e.preventDefault()
    e.stopPropagation()
    return false
  }

  onPopState() {
    this.onChange({
      push: false,
      url: window.location.pathname,
    })
  }

  onResize() {
    const { width, height } = this.sizes

    if (this.curPage && this.curPage.onResize)
      this.curPage.onResize({ width, height })

    window.requestAnimationFrame(() => {
      if (this.canvas && this.canvas.onResize)
        this.canvas.onResize()
    })
  }

  onTouchDown(e) {
    e.stopPropagation()

    if (!Detection.isMobile() && e.target.tagName === 'A') return

    this.mouse.x = e.touches ? e.touches[0].clientX : e.clientX
    this.mouse.y = e.touches ? e.touches[0].clientY : e.clientY

    if (this.curPage && this.curPage.onTouchDown)
      this.curPage.onTouchDown(this.mouse)

    if (this.canvas && this.canvas.onTouchDown)
      this.canvas.onTouchDown(this.mouse)
  }

  onTouchMove(e) {
    e.stopPropagation()

    this.mouse.x = e.touches ? e.touches[0].clientX : e.clientX
    this.mouse.y = e.touches ? e.touches[0].clientY : e.clientY

    if (this.curPage && this.curPage.onTouchMove)
      this.curPage.onTouchMove(this.mouse)

    if (this.canvas && this.canvas.onTouchMove)
      this.canvas.onTouchMove(this.mouse)
  }

  onTouchUp(e) {
    e.stopPropagation()

    this.mouse.x = e.changedTouches ? e.changedTouches[0].clientX : e.clientX
    this.mouse.y = e.changedTouches ? e.changedTouches[0].clientY : e.clientY

    if (this.curPage && this.curPage.onTouchUp)
      this.curPage.onTouchUp()

    if (this.canvas && this.canvas.onTouchUp)
      this.canvas.onTouchUp(this.mouse)
  }

  onWheel(e) {
    const normalizedWheel = normalizeWheel(e)

    if (
      this.curPage &&
      this.curPage.onWheel &&
      this.curPage.isScrollable
    )
      this.curPage.onWheel(normalizedWheel)

    if (this.canvas && this.canvas.onWheel)
      this.canvas.onWheel(normalizedWheel)
  }

  // onInteract() {
  //   window.removeEventListener('mousemove', this.onInteract)
  //   window.removeEventListener('touchstart', this.onInteract)
  //   this.update()
  // }

  update() {
    // this.stats.begin()

    if (this.curPage && this.curPage.update)
      this.curPage.update()

    if (this.canvas && this.canvas.update)
      this.canvas.update(this.curPage.scroll)

    // this.stats.end()

    this.frame = window.requestAnimationFrame(this.update)
  }

  addEventListeners() {
    // window.addEventListener('mousemove', this.onInteract, { passive: true })
    // window.addEventListener('touchstart', this.onInteract, { passive: true })

    window.addEventListener('popstate', this.onPopState, { passive: true })
    // window.addEventListener('resize', this.onResize, { passive: true })

    window.addEventListener('mousedown', this.onTouchDown, { passive: true })
    window.addEventListener('mousemove', this.onTouchMove, { passive: true })
    window.addEventListener('mouseup', this.onTouchUp, { passive: true })

    window.addEventListener('touchstart', this.onTouchDown, { passive: true })
    window.addEventListener('touchmove', this.onTouchMove, { passive: true })
    window.addEventListener('touchend', this.onTouchUp, { passive: true })

    window.addEventListener('mousewheel', this.onWheel, { passive: true })
    window.addEventListener('wheel', this.onWheel, { passive: true })

    // window.oncontextmenu = this.onContextMenu
  }

  addLinksEventListeners() {
    const links = document.querySelectorAll('a:not([data-to-scroll])')
    links.forEach(link => {
      const isLocal = link.href.indexOf(window.location.origin) > -1
      if (isLocal) {
        // link.ondragstart = e => { e.preventDefault() }
        // link.ondragover = e => { e.preventDefault() }
        // link.ondragend = e => { e.preventDefault() }
        // link.ondragenter = e => { e.preventDefault() }
        // link.ondragleave = e => { e.preventDefault() }

        link.onclick = e => {
          e.preventDefault()
          this.onChange({ url: link.href.replace(window.location.origin, '') })
        }
      } else if (link.href.indexOf('mailto') === -1 && link.href.indexOf('tel') === -1) {
        link.rel = 'noopener'
        link.target = '_blank'
      }
    })
  }

  addButtonsEventListeners() {
    const caseNextBtns = document.querySelectorAll('.case_next_text')
    const allCases = document.querySelectorAll('.case')
    const caseMap = {}
    let caseShadersCount = 0
    const caseArr = Array.from(allCases).map((el, i) => {
      if (el.id.startsWith('shader')) caseShadersCount++
      caseMap[`/case/${el.id}`] = i
      return `/case/${el.id}`
    })

    /**
     * Quickfix for production, if I reload the page on any case router
     * and try to click on button to go to the next project
     * I get a router issue because in production for some reason
     * there's an aditional bar '/' in the end of the url
     * so the quick fix is just remove that last bar character
     */
    if (
      this.url.indexOf('/case') > -1 &&
      this.url[this.url.length - 1] === '/'
    )
      this.url = this.url.substring(0, this.url.length - 1)

    caseNextBtns.forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault()

        if (
          caseMap[this.url] + 1 === caseArr.length - caseShadersCount ||
          this.url.startsWith('/case/shader-')
        ) {
          this.onChange({ url: '/' })
          return
        }

        this.onNextProject({
          url: caseArr[caseMap[this.url] + 1],
          idx: caseMap[this.url] + 1
        })
      })
    })
  }
}

new App()
