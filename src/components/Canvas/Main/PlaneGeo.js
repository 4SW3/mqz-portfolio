import gsap from 'gsap'
import { Mesh, Program } from 'ogl'
import { getOffset } from '../../../utils/dom'
import { delay, lerp } from '../../../utils/math'
import fragment from '../shaders/plane-fragment.glsl'
import vertex from '../shaders/plane-vertex.glsl'

export default class PlaneGeo {
  constructor({ element, caseElement, geometry, gl, scene, viewport, sizes, url, mediaIds }) {
    this.element = element
    this.caseElement = caseElement
    this.geometry = geometry
    this.gl = gl
    this.scene = scene
    this.viewport = viewport
    this.sizes = sizes
    this.url = url
    this.mediaIds = mediaIds

    this.isOpened = false
    this.boundsTransition = 0
    this.colorTransition = 0
    this.extra = {
      x: 0,
      y: 0,
      scaleX: 0,
      scaleY: 0,
      colors: this.createColors()
    }
    // this.prevId = this.mediaIds.find(id => this.url.split('/')[2] === id) || 'home'
    this.curId = this.mediaIds.find(id => this.url.split('/')[2] === id) || 'home'

    this.createProgram()
    this.createMesh()
    this.createAnim()
  }

  createColors() {
    return {
      home: 0.7,
      echosight: 0.02,
      'rp-chauffeurs': 0.2,
      'ceam-academic': 0.87,
      ecommerce: 0.75,
      'game-wiki-and-build-editor': 0.2,
      bugtracker: 0.87,
      'shader-fbm': 0.1,
      fallback: 0.7,
    }
  }

  createProgram() {
    this.program = new Program(this.gl, {
      fragment,
      vertex,
      uniforms: {
        uTime: { value: 100 * Math.random() },
        uResolution: { value: [this.sizes.width, this.sizes.height] },
        uColor: { value: this.extra.colors['home'] },
      },
      transparent: true,
      cullFace: null,
    })
  }

  createMesh() {
    this.mesh = new Mesh(this.gl, {
      geometry: this.geometry,
      program: this.program,
    })

    this.mesh.setParent(this.scene)
    this.mesh.position.y = -this.viewport.height
    this.mesh.scale.x = this.viewport.width
    this.mesh.scale.y = this.viewport.height
    this.mesh.position.z = -0.25
  }

  createBounds(viewport, sizes) {
    this.viewport = viewport
    this.sizes = sizes

    this.bounds = getOffset(this.element, this.scrollCurrent)
    this.caseBounds = getOffset(this.caseElement)

    this.updateScale()
    this.updateY()
  }

  createAnim() {
    this.animation = gsap.timeline({ paused: true })

    this.animation.fromTo(this.extra, {
      y: 0
    }, {
      delay: 0.5,
      duration: 1.5,
      ease: 'expo.inOut',
      y: -0.5
    }, 'start')

    this.animation.fromTo(this.extra, {
      scaleX: 0
    }, {
      delay: 0.5,
      duration: 1.5,
      ease: 'expo.inOut',
      scaleX: 0
    }, 'start')

    this.animation.fromTo(this.extra, {
      scaleY: 0
    }, {
      delay: 0.5,
      duration: 1,
      ease: 'expo.inOut',
      scaleY: 20
    }, 'start')

    this.animation.fromTo(this, {
      colorTransition: 0,
    }, {
      delay: 0.5,
      duration: 1.5,
      ease: 'expo.inOut',
      colorTransition: 1,
    }, 'start')

    this.animation.fromTo(this, {
      boundsTransition: 0
    }, {
      delay: 0.5,
      duration: 1,
      ease: 'expo.inOut',
      boundsTransition: 1
    }, 'start')
  }

  async show() { }

  async hide() { }

  async scaleToNormal() {
    await delay(500)

    this.animation.reverse()
  }

  scaleUp() {
    this.animation.play()
  }

  onOpen() {
    this.isOpened = true
  }

  async onClose() {
    this.isOpened = false
  }

  onChange(url) {
    // this.prevId = this.url === '/' ? 'home' : this.mediaIds.find(id => this.url.split('/')[2] === id)
    this.url = url
    this.curId = this.mediaIds.find(id => this.url.split('/')[2] === id) || this.curId
  }

  onResize(viewport, sizes) {
    this.createBounds(viewport, sizes)
  }

  updateScale() {
    // const widthPercent = this.bounds.width / this.sizes.width
    const heightPercent = this.bounds.height / this.sizes.height

    this.mesh.scale.x = this.viewport.width + 2 + this.extra.scaleX
    this.mesh.scale.y = this.viewport.height * heightPercent + 20 + this.extra.scaleY
  }

  updateX() { }

  updateY(y = 0) {
    const curBounds = lerp(this.bounds.top, this.caseBounds.top, this.boundsTransition)
    this.y = curBounds - y
    // this.y = this.bounds.top - y

    this.mesh.position.y =
      (this.viewport.height / 2) - (this.mesh.scale.y / 2) -
      (this.y / this.sizes.height) * this.viewport.height - 0.1 - this.extra.y

    // Home page check to stop Plane from scrolling if necessary
    // if (this.elements.introContent && this.elements.work.offsetTop > this.scroll.current)
  }


  update(scroll) {
    if (!this.bounds || !this.caseBounds) return

    this.scrollCurrent = scroll.current

    this.updateScale()
    this.updateX()
    this.updateY(this.scrollCurrent)

    this.program.uniforms.uTime.value += 0.04

    this.program.uniforms.uColor.value = lerp(
      this.extra.colors['home'],
      this.extra.colors[this.curId],
      this.colorTransition,
    )
  }
}