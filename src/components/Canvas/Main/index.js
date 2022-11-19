import { Plane, Transform } from 'ogl'
import CaseMedia from './CaseMedia'
import IntroMedia from './IntroMedia'
import IntroText from './IntroText'
import Media from './Media'
import PlaneGeo from './PlaneGeo'

export default class WebGLMain {
  constructor({ gl, scene, viewport, sizes, url }) {
    this.gl = gl
    this.scene = scene
    this.viewport = viewport
    this.sizes = sizes
    this.url = url

    this.group = new Transform()
    this.workList = document.querySelector('.work_list')
    this.caseList = document.querySelector('.case_gallery')
    this.listItemContainer = document.querySelectorAll('.list_item_container')

    this.planeGeoHomeElToBound = document.querySelector('.work')
    this.planeGeoCaseElToBound = document.querySelector('.cases')

    this.introEl = document.querySelector('.intro_content')
    this.introTextEl = document.querySelector('.tt')

    this.mediaEls = document.querySelectorAll('.list_item_media_image')
    this.shaderMediaEls = document.querySelectorAll('.list_item_shader_media')
    this.caseMediaEls = document.querySelectorAll('.case_gallery_media_placeholder')

    // this.speed = {
    //   current: 0,
    //   target: 0,
    //   ease: 0.1,
    // }

    this.createGeometry()

    this.createIntroMedia()
    this.createIntroText()
    this.createPlaneGeo()
    this.createGallery()
    this.createCaseMedias()

    this.group.setParent(this.scene)

    // this.setupGUI()
    this.addEventListeners()
  }

  // setupGUI() {
  // this.gui = new GUI()
  // this.gui.add(this.planeGeo.extra, 'y', -100, 100, 0.1)
  // }

  createGeometry() {
    this.geometry = new Plane(this.gl, {
      heightSegments: 20,
      widthSegments: 6,
    })
  }

  createIntroMedia() {
    this.introMedia = new IntroMedia({
      element: this.introEl,
      geometry: this.geometry,
      gl: this.gl,
      scene: this.group,
      viewport: this.viewport,
      sizes: this.sizes,
      mediaId: 'intro-media',
    })
  }

  createIntroText() {
    this.introText = new IntroText({
      element: this.introTextEl,
      geometry: this.geometry,
      gl: this.gl,
      scene: this.group,
      viewport: this.viewport,
      sizes: this.sizes,
      url: this.url,
      workEl: document.querySelector('.work'),
      introContentEl: document.querySelector('.intro_content'),
    })
  }

  createPlaneGeo() {
    const mediaIds = Array
      .from([...this.mediaEls, ...this.shaderMediaEls])
      .map(media => media.getAttribute('data-media-id'))

    this.planeGeo = new PlaneGeo({
      element: this.planeGeoHomeElToBound,
      caseElement: this.planeGeoCaseElToBound,
      geometry: this.geometry,
      gl: this.gl,
      scene: this.group,
      viewport: this.viewport,
      sizes: this.sizes,
      url: this.url,
      mediaIds,
    })
  }

  createGallery() {
    this.medias = [...this.mediaEls, ...this.shaderMediaEls].map((element, idx) => {
      const caseHeaderMedia = document.getElementById(
        `case_header_media_image--${element.getAttribute('data-media-id')}`
      )

      return new Media({
        element,
        geometry: this.geometry,
        gl: this.gl,
        idx,
        scene: this.group,
        viewport: this.viewport,
        sizes: this.sizes,
        url: this.url,
        mediaId: element.getAttribute('data-media-id'),
        link: element.parentNode.parentNode.parentNode,
        caseHeaderMedia,
      })
    })
  }

  createCaseMedias() {
    this.caseMedias = [...this.caseMediaEls].map((element, idx) => {
      return new CaseMedia({
        element,
        geometry: this.geometry,
        gl: this.gl,
        idx,
        scene: this.group,
        viewport: this.viewport,
        sizes: this.sizes,
        mediaId: element.getAttribute('data-media-id'),
      })
    })
  }

  show() {
    this.introMedia.show()
    this.introText.show()
    this.medias.forEach(media => media.show())
    this.caseMedias.forEach(caseMedia => caseMedia.show())
  }

  hide() {
    this.introMedia.hide()
    this.introText.hide()
    this.medias.forEach(media => media.hide())
    this.caseMedias.forEach(caseMedia => caseMedia.hide())
  }

  onChange(url) {
    this.introText.onChange(url)
    this.planeGeo.onChange(url)

    this.url = url

    if (url === '/') {
      this.planeGeo.scaleToNormal()

      this.introMedia.show()
      this.introText.show()

      this.medias.forEach(media => {
        if (media.isOpened) media.onClose()
        if (!media.isOpened) media.show()
      })

      this.caseMedias.forEach(caseMedia =>
        caseMedia.hide()
      )
    } else if (url.indexOf('/case') > -1) {
      this.planeGeo.scaleUp()

      this.introMedia.hide()
      this.introText.hide()

      const id = url.replace('/case/', '')

      this.medias.forEach(media => {
        if (media.mediaId === id && !media.isOpened)
          media.onOpen()
        else {
          media.hide()
          media.onClose()
        }
      })

      this.caseMedias.forEach(caseMedia => {
        if (caseMedia.mediaId === id && !caseMedia.isOpened)
          caseMedia.show()
        else
          caseMedia.hide()
      })
    }
  }

  onResize({ viewport }) {
    this.viewport = viewport
    this.planeGeo.onResize(this.viewport, this.sizes)
    this.introMedia.onResize(this.viewport, this.sizes)
    this.introText.onResize(this.viewport, this.sizes)
    this.medias.forEach(media => media.onResize(this.viewport, this.sizes, this.url))
    this.caseMedias.forEach(caseMedia => caseMedia.onResize(this.viewport, this.sizes))
  }

  onTouchDown() { }

  onTouchMove() { }

  onTouchUp() { }

  onWheel() { }

  update(scroll) {
    this.scroll = scroll

    // const diffY = scroll.target - scroll.current
    // this.speed.target = Math.sqrt(diffY * diffY) * 0.01
    // this.speed.current = lerp(this.speed.current, this.speed.target, this.speed.ease)

    this.planeGeo.update(scroll)

    this.introText.update(scroll)

    this.introMedia.update(scroll)

    this.medias.forEach(media => {
      media.update(scroll, this.scroll.accel * 0.015)
      // media.update(scroll, this.speed.current)
    })

    this.caseMedias.forEach(media => {
      media.update(scroll, this.scroll.accel * 0.01)
      // media.update(scroll, this.speed.current)
    })
  }

  addEventListeners() {
    this.medias.forEach(media => {
      media.link.addEventListener('mouseenter', () => {
        media.onInteractionEnter()
      })

      media.link.addEventListener('mouseleave', () => {
        media.onInteractionLeave()
      })
    })
  }
}
