import { Camera, Renderer, Transform } from 'ogl'
import WebGLMain from './Main'
import WebGLPreloader from './Preloader'

export default class Canvas {
  constructor({ url, sizes, mouse }) {
    this.url = url
    this.sizes = sizes
    this.mouse = mouse

    this.colors = {
      dark: [51 / 255, 51 / 255, 51 / 255],
      light: [221 / 255, 221 / 255, 221 / 255],
    }

    this.x = {
      start: 0,
      distance: 0,
      end: 0
    }

    this.y = {
      start: 0,
      distance: 0,
      end: 0
    }

    this.initRenderer()
    this.initCamera()
    this.initScene()
    this.initWebGlPreloader()
    this.onResize()
  }

  initRenderer() {
    this.renderer = new Renderer({
      alpha: true,
      antialias: true,
      dpr: this.sizes.pixelRatio,
    })
    this.gl = this.renderer.gl
    document.body.appendChild(this.gl.canvas)
  }

  initCamera() {
    this.camera = new Camera(this.gl)
    this.camera.position.z = 10
  }

  initScene() {
    this.scene = new Transform()
  }

  initWebGlPreloader() {
    this.webglPreloader = new WebGLPreloader({
      gl: this.gl,
      scene: this.scene,
      viewport: this.viewport,
      sizes: this.sizes,
      url: this.url,
      colors: this.colors,
    })
  }

  initWebGLMain() {
    this.wgl = new WebGLMain({
      gl: this.gl,
      scene: this.scene,
      viewport: this.viewport,
      sizes: this.sizes,
      mouse: this.mouse,
      url: this.url,
    })
  }

  // initPost() {
  // this.post = new Post(this.gl)

  // this.pass = this.post.addPass({
  //   fragment,
  //   uniforms: {
  //     uResolution: this.resolution,
  //   },
  // })
  // }

  onPreloaded() {
    this.onChange(this.url)

    this.webglPreloader && this.webglPreloader.hide()
  }

  onChange(url) {
    // if (this.wgl && url === '/')
    //   this.wgl.show()
    // else if (this.wgl && url !== '/') this.wgl.hide()

    /**
     * Quickfix for production, if I reload the page on any case router
     * the webgl images on the page won't load because of the aditional 
     * "/" on the address bar.
     * e.g case/rp-chauffeurs/ needs to be case/rp-chauffeurs 
     * without the last bar "/"
     */
    let newUrl = url
    if (
      url.indexOf('/case') > -1 &&
      url[url.length - 1] === '/'
    )
      newUrl = url.substring(0, url.length - 1)

    if (
      !this.wgl && url === '/' ||
      !this.wgl && url.indexOf('/case') > -1
    )
      this.initWebGLMain()

    if (this.wgl)
      this.wgl.onChange(newUrl)
    // this.wgl.onChange(url)
  }

  // destroyWebGLAbout() {
  //   if (!this.about) return
  //   this.about.destroy()
  //   this.about = null
  // }

  onTouchDown(mouse) {
    this.isDown = true

    this.x.start = mouse.x
    this.y.start = mouse.y

    if (this.wgl && this.wgl.onTouchDown)
      this.wgl.onTouchDown({ x: this.x, y: this.y })
  }

  onTouchMove(mouse) {
    if (!this.isDown) return

    this.x.end = mouse.x
    this.y.end = mouse.y

    if (this.wgl && this.wgl.onTouchMove)
      this.wgl.onTouchMove({ x: this.x, y: this.y })
  }

  onTouchUp(mouse) {
    this.isDown = false

    this.x.end = mouse.x
    this.y.end = mouse.y

    if (this.wgl && this.wgl.onTouchUp)
      this.wgl.onTouchUp({ x: this.x, y: this.y })
  }

  onWheel(e) {
    if (this.wgl && this.wgl.onWheel)
      this.wgl.onWheel(e)
  }

  onResize() {
    this.renderer.setSize(this.sizes.width, this.sizes.height)

    this.camera.perspective({
      aspect: this.sizes.width / this.sizes.height,
    })

    const fov = this.camera.fov * (Math.PI / 180)
    const height = 2 * Math.tan(fov / 2) * this.camera.position.z
    const width = height * this.camera.aspect

    this.viewport = { height, width }

    if (this.wgl && this.wgl.onResize)
      this.wgl.onResize({ viewport: this.viewport })
  }

  update(scroll) {
    this.gl.clearColor(
      this.colors.light[0],
      this.colors.light[1],
      this.colors.light[2],
      1.0,
    )

    if (this.wgl && this.wgl.update)
      this.wgl.update(scroll)

    if (this.webglPreloader && this.webglPreloader.update)
      this.webglPreloader.update()

    this.renderer.render({ scene: this.scene, camera: this.camera })
  }
}