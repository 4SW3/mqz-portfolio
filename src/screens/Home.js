import gsap from "gsap"
import Page from "../classes/Page"
import { colorDark, colorLight } from "../utils/constants"
import { delay } from "../utils/math"

export default class Home extends Page {
  constructor() {
    super({
      classes: {
        active: 'home--active',
        navListItemHidden: 'nav_list_item--hidden',
      },
      element: '.home',
      elements: {
        wrapper: '.home_content',
        title: '.home_title',
        introContent: '.intro_content',
        introArrowText: '.intro_arrow_text',
        introArrowIcon: '.intro_arrow_icon',
        work: '.work',
        workList: '.work_list',
        footer: '.footer',
        blob: 'g.blob',
        navLinks: document.querySelectorAll('.nav_link'),
        navListItems: document.querySelectorAll('.nav_list_item'),
      },
      isScrollable: true,
    })

    this.create()
    this.setupLinks()
  }

  create() {
    super.create()

    this.blockScrolling = false

    this.navItems = [
      this.elements.navLinks[0].firstChild,
      this.elements.navLinks[1],
      this.elements.navLinks[2],
    ]
  }

  setupLinks() {
    this.elements.navLinks.forEach(link => {
      link.onclick = e => {
        e.preventDefault()
        e.stopPropagation()

        if (link.getAttribute('href') === '#work')
          gsap.to(this.scroll, {
            duration: 2,
            ease: 'expo.inOut',
            target: this.elements.work.offsetTop + 50,
          })
        else
          gsap.to(this.scroll, {
            duration: 2,
            ease: 'expo.inOut',
            target: this.elements.footer.offsetTop + 100,
          })
      }
    })
  }

  scrollTopCase(idx) {
    const workLists = document.querySelectorAll('.work_list_item')

    gsap.to(this.scroll, {
      duration: 2,
      ease: 'expo.inOut',
      target: workLists[idx].offsetTop + window.innerHeight * 0.75
    })
  }

  async show(url) {
    this.element.classList.add(this.classes.active)
    return super.show(url)
  }

  async scrollToTop() {
    return new Promise(resolve => {
      gsap.to(this.scroll, {
        delay: 0.5,
        duration: 1.4,
        ease: 'expo.inOut',
        target: 0,
        onComplete: resolve,
      })
    })
  }

  async hide() {
    this.blockScrolling = true

    this.element.classList.remove(this.classes.active)

    this.elements.navListItems.forEach((navListItem, idx) => {
      if (idx > 0) navListItem.classList.add(this.classes.navListItemHidden)
    })

    const tempScroll = { ...this.scroll }
    await this.scrollToTop()
      .then(async () => {
        await delay(750)
        this.scroll = tempScroll
      })

    this.blockScrolling = false
    return super.hide()
  }

  onTouchDown(mouse) {
    if (this.blockScrolling) return
    super.onTouchDown(mouse)
  }
  onTouchMove(mouse) {
    if (this.blockScrolling) return
    super.onTouchMove(mouse)
  }
  onTouchUp() {
    if (this.blockScrolling) return
    super.onTouchUp()
  }
  onWheel(normalizedWheel) {
    if (this.blockScrolling) return
    super.onWheel(normalizedWheel)
  }

  update() {
    super.update()

    // this.wrapperTy = Math.abs(get3dMatrix(this.elements.wrapper).ty)

    if (this.elements.wrapper) {
      // if (this.elements.introContent && !this.introOffScreen)
      if (this.elements.introContent && this.elements.work.offsetTop > this.scroll.current)
        this.transform(this.elements.introContent, -this.scroll.current)

      if (
        this.scroll.current >= this.elements.footer.offsetTop - 1 &&
        !this.elements.footer.classList[1]
      ) {
        this.elements.footer.classList.add("in-view")
        this.elements.blob.classList.add("in-view")

        gsap.to(this.navItems, {
          delay: 0.5,
          color: colorLight,
          fill: colorLight,
        })
      } else if (
        this.scroll.current < this.elements.footer.offsetTop - 1 &&
        this.elements.footer.classList[1]
      ) {
        this.elements.footer.classList.remove("in-view")
        this.elements.blob.classList.remove("in-view")

        gsap.to(this.navItems, {
          delay: 0,
          color: colorDark,
          fill: colorDark,
        })
      }

      if (this.scroll.current > 30 && !this.elements.introArrowText.classList[1]) {
        this.elements.introArrowText.classList.add('hide')
        this.elements.introArrowIcon.classList.add('hide')

        gsap.to([this.elements.introArrowText, this.elements.introArrowIcon], {
          autoAlpha: 0,
          visibility: 'visible',
          duration: 0.2,
        })
      } else if (
        this.scroll.current <= 30 &&
        this.elements.introArrowText.classList[1] &&
        this.elements.introArrowText.classList[1] === 'hide'
      ) {
        this.elements.introArrowText.classList.remove('hide')
        this.elements.introArrowIcon.classList.remove('hide')

        gsap.to([this.elements.introArrowText, this.elements.introArrowIcon], {
          autoAlpha: 1,
          visibility: 'hidden',
          duration: 0.2,
        })
      }
    }
  }
}
