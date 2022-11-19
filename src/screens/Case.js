import gsap from "gsap"
import Page from "../classes/Page"

export default class Case extends Page {
  constructor() {
    super({
      classes: {
        active: 'cases--active',
        caseActive: 'case--active',
        navListItemHidden: 'nav_list_item--hidden'
        // mediaActive: 'case_gallery_media_placeholder--active',
      },
      element: '.cases',
      elements: {
        wrapper: '.case_content',
        case: null,
        allCases: '.case',
        navListItems: document.querySelectorAll('.nav_list_item'),
      },
      isScrollable: true,
    })

    this.create()
  }

  create() {
    super.create()
  }

  async scrollToTop() {
    return new Promise(resolve => {
      this.element.classList.remove(this.classes.active)
      this.elements.case.classList.remove(this.classes.caseActive)

      // if (this.scroll.current <= 0) {
      //   gsap.to(this.scroll, {
      //     duration: 0.5,
      //     // ease: 'expo.inOut',
      //     target: -1000,
      //     onComplete: resolve,
      //   })
      // }
      // else
      gsap.to(this.scroll, {
        duration: 1,
        ease: 'expo.inOut',
        target: 0,
        onComplete: resolve,
      })
    })
  }

  resetScroll() {
    this.scroll = {
      accel: 0,
      ease: 0.07,
      position: 0,
      current: 0,
      target: 0,
      limit: 0,
    }
  }

  async show(url) {
    if (this.isScrollable && url.indexOf('/case') > -1)
      this.resetScroll()

    this.elements.navListItems.forEach((navListItem, idx) => {
      if (idx > 0) navListItem.classList.add(this.classes.navListItemHidden)
    })

    const id = url.replace('/case/', '').replace('/', '')

    this.elements.case =
      Array.from(this.elements.allCases).find(el => el.id === id)

    this.element.classList.add(this.classes.active)
    this.elements.case.classList.add(this.classes.caseActive)

    this.elements.wrapper = this.elements.case.lastChild

    // TODO change window.innerHeight to sizes
    this.scroll.limit = this.elements.wrapper.clientHeight - window.innerHeight

    gsap.set(this.element, {
      autoAlpha: 0
    })

    gsap.to(this.element, {
      delay: 0.5,
      duration: 1,
      autoAlpha: 1,
      onComplete: this.element.classList.add(this.classes.active)
    })

    return super.show(url)
  }

  async hide() {
    await this.scrollToTop().then(async () => {
      this.elements.navListItems.forEach(navListItem => {
        navListItem.classList.remove(this.classes.navListItemHidden)
      })

      return super.hide()
    })
  }
}
