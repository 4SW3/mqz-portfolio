import gsap from 'gsap'
import { Mesh, Program } from 'ogl'
import { getOffset } from '../../../utils/dom'
import fragment from '../shaders/media-fragment.glsl'
import vertex from '../shaders/media-vertex.glsl'

export default class CaseMedia {
  constructor({ element, geometry, gl, idx, scene, viewport, sizes, mediaId }) {
    this.element = element
    this.geometry = geometry
    this.gl = gl
    this.idx = idx
    this.scene = scene
    this.viewport = viewport
    this.sizes = sizes
    this.mediaId = mediaId

    this.isOpened = false

    this.createTexture()
    this.createProgram()
    this.createMesh()
  }

  createTexture() {
    this.texture = window.TEXTURES[this.element.getAttribute('data-src')]
    this.media = window.MEDIAS[this.element.getAttribute('data-src')]
    this.isVideo = false

    if (
      this.media && this.media.localName === 'video' ||
      this.media.localName.toLowerCase() === 'video'
    )
      this.isVideo = true
  }

  createProgram() {
    this.program = new Program(this.gl, {
      fragment,
      vertex,
      uniforms: {
        uAlpha: { value: 0 },
        uSpeed: { value: 0 },
        uProgress: { value: 0 },
        uTime: { value: 100 * Math.random() },
        uViewportSizes: {
          value: [this.viewport.width, this.viewport.height],
        },
        uPlaneSizes: { value: [0, 0] },
        uImageSizes: {
          value: [
            this.isVideo ? 1920 : this.media.naturalWidth,
            this.isVideo ? 1080 : this.media.naturalHeight
          ]
        },
        tMap: { value: this.texture },
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
    this.mesh.position.x = this.idx * this.mesh.scale.x
  }

  createBounds(viewport, sizes) {
    this.viewport = viewport
    this.sizes = sizes

    this.bounds = getOffset(this.element, this.scrollCurrent)

    this.updateScale()
    this.updateX()
    this.updateY()
  }

  async show() {
    gsap.to(this.program.uniforms.uAlpha, {
      delay: 1,
      duration: 1.5,
      value: 1,
    })

    gsap.to(this.mesh.position, {
      delay: 1,
      duration: 1.5,
      z: 0,
    })
  }

  async hide() {
    gsap.to(this.program.uniforms.uAlpha, {
      delay: 0.5,
      duration: 0.5,
      value: 0,
    })

    gsap.to(this.mesh.position, {
      delay: 0.5,
      duration: 1.5,
      z: -3,
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
  }

  updateScale() {
    const widthPercent = this.bounds.width / this.sizes.width
    const heightPercent = this.bounds.height / this.sizes.height

    this.mesh.scale.x = this.viewport.width * widthPercent
    this.mesh.scale.y = this.viewport.height * heightPercent
  }

  updateX(x = 0) {
    this.mesh.position.x =
      -(this.viewport.width / 2) + (this.mesh.scale.x / 2) +
      ((this.bounds.left + x) / this.sizes.width) * this.viewport.width
  }

  updateY(y = 0) {
    this.y = this.bounds.top - y

    this.mesh.position.y =
      (this.viewport.height / 2) - (this.mesh.scale.y / 2) -
      (this.y / this.sizes.height) * this.viewport.height
  }


  update(scroll, speed) {
    if (!this.bounds) return

    // Attach video and/or update texture when video is ready
    if (this.isVideo && this.media.readyState >= this.media.HAVE_ENOUGH_DATA) {
      if (!this.texture.image) this.texture.image = this.media
      this.texture.needsUpdate = true
    }

    this.scrollCurrent = scroll.current

    this.updateScale()
    this.updateX()
    this.updateY(scroll.current)

    this.program.uniforms.uSpeed.value = speed
    this.program.uniforms.uTime.value += 0.04
    this.mesh.program.uniforms.uPlaneSizes.value = [this.mesh.scale.x, this.mesh.scale.y]
  }
}