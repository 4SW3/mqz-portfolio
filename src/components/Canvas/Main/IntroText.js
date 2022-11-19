import gsap from 'gsap'
import { Mesh, Program } from 'ogl'
import { getOffset } from '../../../utils/dom'
import fragment from '../shaders/introtext-fragment.glsl'
import vertex from '../shaders/introtext-vertex.glsl'

export default class IntroText {
  constructor({
    element,
    caseElement,
    geometry,
    gl,
    scene,
    viewport,
    sizes,
    url,
    workEl,
    introContentEl,
  }) {
    this.element = element
    this.caseElement = caseElement
    this.geometry = geometry
    this.gl = gl
    this.scene = scene
    this.viewport = viewport
    this.sizes = sizes
    this.url = url
    this.workEl = workEl
    this.introContentEl = introContentEl

    this.isOpened = false
    this.extra = {
      x: 0,
      y: 1,
      scaleX: 1,
      scaleY: 1,
      h: 0.15,
    }

    this.createTexture()
    this.createProgram()
    this.createText()
  }

  createTexture() {
    this.texture = window.TEXTURES['firasansbold']
  }

  createProgram() {
    this.program = new Program(this.gl, {
      vertex,
      fragment,
      uniforms: {
        tMap: { value: this.texture },
        uAlpha: { value: 0 },
        uWidth: { value: 0 },
        uZoom: { value: 4 },
        uViewportSizes: {
          value: [this.viewport.width, this.viewport.height],
        },
        uScroll: { value: 2 },
      },
      transparent: true,
      cullFace: null,
      depthWrite: false,
    })
  }

  createText() {
    this.geometry = window.FONTS['firasansfont'].geometry
    this.text = window.FONTS['firasansfont'].text

    this.mesh = new Mesh(this.gl, {
      geometry: this.geometry,
      program: this.program,
    })

    this.mesh.position.y = this.text.height * 0.5
    this.mesh.position.z = -0.4
    this.mesh.setParent(this.scene)
  }

  createBounds(viewport, sizes) {
    this.viewport = viewport
    this.sizes = sizes

    if (this.url === '/' && this.onChangeCall)
      this.bounds = getOffset(this.element, this.scrollCurrent)
    else
      this.bounds = getOffset(this.element)

    // BUG FIX mesh won't appear on page change if 
    // scroll current isn't passed but if I resize
    // the home screen, the mesh will rerender on the
    // wrong position because of the scroll recalculation
    this.onChangeCall = false /** BUG FIX */

    this.updateScale()
    this.updateY()
  }

  async show() {
    gsap.to(this.program.uniforms.uAlpha, {
      delay: 0.5,
      duration: 0.5,
      value: 1,
    })
  }

  async hide() {
    gsap.to(this.program.uniforms.uAlpha, {
      delay: 0.5,
      duration: 0.5,
      value: 0,
    })
  }

  onOpen() {
    this.isOpened = true
  }

  async onClose() {
    this.isOpened = false
  }

  onChange(url) {
    this.url = url

    // BUG FIX mesh won't appear on page change if 
    // scroll current isn't passed but if I resize
    // the home screen, the mesh will rerender on the
    // wrong position because of the scroll recalculation
    this.onChangeCall = true /** BUG FIX */
  }

  async onResize(viewport, sizes) {
    // @media query
    if (sizes.width <= 1024)
      this.program.uniforms.uWidth.value = 1
    else
      this.program.uniforms.uWidth.value = 0.2

    if (sizes.height < 600) {
      if (sizes.width / sizes.height > 2.6) {
        this.program.uniforms.uZoom.value = 2
        this.extra.y = 0.6
      }
      else {
        this.program.uniforms.uZoom.value = 4
        this.extra.y = 1
      }
    }

    this.createBounds(viewport, sizes)
  }

  updateScale() {
    // const widthPercent = this.bounds.width / this.sizes.width
    // const heightPercent = this.bounds.height / this.sizes.height

    this.mesh.scale.x = this.extra.scaleX * this.viewport.width * 0.17
    this.mesh.scale.y = this.extra.scaleY * this.viewport.width * 0.17
  }

  updateX() { }

  updateY(y = 0) {
    this.y = this.bounds.top - (y * 0.4)

    this.mesh.position.y =
      (this.viewport.height / 2) - (this.mesh.scale.y / 2) -
      (this.y / this.sizes.height) * this.viewport.height
      * this.extra.y
  }


  update(scroll) {
    if (!this.bounds) return

    this.scrollCurrent = scroll.current

    if (
      this.introContentEl &&
      this.workEl.offsetTop > this.scrollCurrent &&
      !this.introContentEl.classList[1]
    ) {
      this.onResize(this.viewport, this.sizes)
      this.introContentEl.classList.add('in-viewport')
    } else if (
      this.introContentEl &&
      this.workEl.offsetTop <= this.scrollCurrent &&
      this.introContentEl.classList[1] &&
      this.introContentEl.classList[1] === 'in-viewport'
    ) {
      this.introContentEl.classList.remove('in-viewport')
    }

    this.updateScale()
    this.updateY(this.scrollCurrent)

    this.program.uniforms.uScroll.value = Math.min(
      this.scrollCurrent * 0.0075,
      this.program.uniforms.uZoom.value,
    )
  }
}