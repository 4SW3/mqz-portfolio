import gsap from 'gsap'
import { Mesh, Program } from 'ogl'
import { getOffset } from '../../../utils/dom'
import fragment from '../shaders/intro-fragment.glsl'
import vertex from '../shaders/intro-vertex.glsl'

export default class IntroMedia {
  constructor({ element, geometry, gl, idx, scene, viewport, sizes, mediaId }) {
    this.element = element
    this.elToBoundWith = this.element.parentNode

    this.geometry = geometry
    this.gl = gl
    this.idx = idx
    this.scene = scene
    this.viewport = viewport
    this.sizes = sizes
    this.mediaId = mediaId

    this.isOpened = false

    this.t = { val: 0 }
    this.extra = {
      scaleXY: 1.1,
      y: 0.4,
    }

    this.createTexture()
    this.createProgram()
    this.createMesh()
  }

  createTexture() {
    this.texture = window.TEXTURES[this.element.getAttribute('data-src')]
    this.video = window.MEDIAS[this.element.getAttribute('data-src')]
  }

  createProgram() {
    this.program = new Program(this.gl, {
      fragment,
      vertex,
      uniforms: {
        uAlpha: { value: 0 },
        uPlaneSizes: { value: [0, 0] },
        uImageSizes: { value: [1920, 1080] },
        tMap: { value: this.texture },
        // uProgress: { value: 0 },
        // uViewportSizes: {
        //   value: [this.viewport.width, this.viewport.height],
        // },
        // uResolution: { value: [this.sizes.width, this.sizes.height] },
      },
      transparent: true,
    })
  }

  createMesh() {
    this.mesh = new Mesh(this.gl, {
      geometry: this.geometry,
      program: this.program,
    })

    this.mesh.setParent(this.scene)
    this.mesh.position.z = -0.5
  }

  createBounds(viewport, sizes) {
    this.viewport = viewport
    this.sizes = sizes

    this.bounds = getOffset(this.elToBoundWith, this.scrollCurrent)

    this.updateScale()
    this.updateX()
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
      delay: 0,
      duration: 0,
      value: 0,
    })
  }

  onOpen() {
    this.isOpened = true
  }

  async onClose() {
    this.isOpened = false
  }

  onResize(viewport, sizes) {
    this.createBounds(viewport, sizes)
    // this.mesh.program.uniforms.uResolution.value = [this.sizes.width, this.sizes.height]
  }

  updateScale() {
    this.mesh.scale.x = this.viewport.width * this.extra.scaleXY
    this.mesh.scale.y = this.viewport.height * this.extra.scaleXY
  }

  updateX() { }

  updateY() {
    this.y = this.bounds.top

    this.mesh.position.y =
      (this.viewport.height / 2) - (this.mesh.scale.y / 2) -
      (this.y / this.sizes.height) * this.viewport.height +
      this.extra.y
  }


  update(scroll) {
    if (!this.bounds) return

    // Attach video and/or update texture when video is ready
    if (this.video.readyState >= this.video.HAVE_ENOUGH_DATA) {
      if (!this.texture.image) this.texture.image = this.video
      this.texture.needsUpdate = true
    }

    this.scrollCurrent = scroll.current

    this.updateScale()
    this.updateX()
    this.updateY()

    this.mesh.program.uniforms.uPlaneSizes.value = [this.mesh.scale.x, this.mesh.scale.y]
  }
}